import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../prismaClient.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// User confirmed 2.5 Flash is the way to go (Context: 2026)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Helper: Normalizes availability check logic.
 */
async function getAvailabilityForNextDays() {
  const now = new Date();

  // Explicitly convert to Brazil Time (server might be UTC)
  const brTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const currentHour = brTime.getHours();
  const currentMin = brTime.getMinutes();

  interface DayAvailability {
    date: string;
    weekday: string;
    slots: string[];
  }
  const nextDays: DayAvailability[] = [];

  // Fetch existing appointments for the next 7 days to filter availability
  // We need a range query
  const startDate = new Date(brTime);
  const endDate = new Date(brTime);
  endDate.setDate(endDate.getDate() + 7);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  const existingAppointments = await prisma.appointments.findMany({
    where: {
      date: {
        gte: startStr,
        lte: endStr,
      },
      status: {
        not: 'cancelled', // Don't block cancelled slots
      },
    },
    select: {
      date: true,
      time: true,
    },
  });

  // Fetch Shop Settings from DB
  const settings = await prisma.shop_settings.findFirst();
  const startHourConfig = settings?.startHour || 9;
  const endHourConfig = settings?.endHour || 19;
  const closedDays = settings?.closedDays || [0];
  const exceptions = (settings?.exceptions as any) || {};

  // Create a Set for fast lookup: "YYYY-MM-DD HH:MM"
  const busySlots = new Set(existingAppointments.map(app => `${app.date} ${app.time}`));

  // Reduce to 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(brTime); // Start from BRAZIL time
    date.setDate(brTime.getDate() + i);

    // Use local YYYY-MM-DD manually to avoid locale issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayOfWeek = date.getDay(); // 0 = Sunday

    // Explicit Weekday Name for AI Context
    const weekday = date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      timeZone: 'America/Sao_Paulo',
    });

    // Check if we are generation slots for TODAY
    const isToday = i === 0;

    // --- CHECK CLOSED LOGIC ---
    let isClosed = closedDays.includes(dayOfWeek);
    let dailyStart = startHourConfig;
    let dailyEnd = endHourConfig;

    // Check Exceptions
    if (exceptions[dateStr]) {
      if (exceptions[dateStr].closed !== undefined) isClosed = exceptions[dateStr].closed;
      if (exceptions[dateStr].start !== undefined) dailyStart = exceptions[dateStr].start;
      if (exceptions[dateStr].end !== undefined) dailyEnd = exceptions[dateStr].end;
      // If explicitly OPEN in exception (closed: false), ensure isClosed is false
      if (exceptions[dateStr].open === true) isClosed = false;
    }

    if (isClosed) continue;

    const slots: string[] = [];

    // Use slotInterval from settings (default 30 if not set)
    const slotInterval = settings?.slotInterval || 30;
    const minuteSteps: number[] = [];
    for (let m = 0; m < 60; m += slotInterval) {
      minuteSteps.push(m);
    }

    for (let hour = dailyStart; hour < dailyEnd; hour++) {
      for (let min of minuteSteps) {
        // Dynamic intervals based on settings
        // If it's today, STRICT filtering
        if (isToday) {
          // If past hour, skip
          if (hour < currentHour) continue;

          // If current hour, skip past minutes
          if (hour === currentHour && min <= currentMin) continue;
        }

        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

        // CHECK IF BUSY
        if (!busySlots.has(`${dateStr} ${time}`)) {
          slots.push(time);
        }
      }
    }

    if (slots.length > 0) {
      nextDays.push({ date: dateStr, weekday, slots });
    }
  }

  return nextDays;
}

async function getServicesList() {
  const services = await prisma.services.findMany({
    select: { id: true, name: true, price: true, duration: true },
  });
  return services;
}

export const handleChat = async (req: Request, res: Response) => {
  try {
    const { message, contextHistory } = req.body;

    // 1. Gather Context
    const availability = await getAvailabilityForNextDays();
    const services = await getServicesList();

    const todayStr = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // 2. System Prompt
    const systemPrompt = `
      Você é a "Trilha AI", a recepcionista virtual inteligente da barbearia "Trilha do Corte".
      
      CONTEXTO ATUAL:
      - Hoje é: ${todayStr}
      - Serviços Disponíveis (com duração em min): ${JSON.stringify(services)}
      - Horários Livres (Slots de 30min): ${JSON.stringify(availability)}

      SUAS INSTRUÇÕES:
      1. Seja educada, moderna (tom "Cyberpunk/Tech") e prestativa. Use emojis ocasionalmente (🤘, ✂️, 🔥).
      
      2. LÓGICA DE AGENDAMENTO E CADASTRO (CRÍTICO - SIGA EXATAMENTE):
         - Antes de finalizar qualquer agendamento, você PRECISA do NOME COMPLETO (nome + sobrenome) e TELEFONE.
         - Se o cliente escolheu serviço e horário mas você ainda NÃO TEM nome completo e telefone:
           VOCÊ DEVE RETORNAR O JSON: { "action": "REQUEST_CLIENT_DATA" }
         - NUNCA pergunte nome ou telefone em texto! SEMPRE use o JSON REQUEST_CLIENT_DATA.
         - O formulário visual vai aparecer para o cliente preencher.
      
      4. APRESENTAÇÃO DOS HORÁRIOS (CRÍTICO - NÃO FALHE):
         - Se encontrar horários, você DEVE retornar o JSON "PROPOSE_SLOTS".
         - NUNCA escreva os horários no texto. O texto deve ser apenas: "Encontrei estes horários para [DIA]:".
         
      5. LÓGICA DE DURAÇÃO (INTELIGÊNCIA):
         - Se o serviço levar 60min (ex: Platinado), você precisa de 2 slots de 30min SEGUIDOS (ex: 14:00 e 14:30).
         - Se o serviço levar 45min, arredonde para 2 slots de 30min (60min total) para segurança.
         - O array 'slots' que você recebeu são slots livres INDIVIDUAIS. Cabe a VOCÊ filtrar apenas os que permitem o serviço completo.
         - Liste no JSON apenas o horários de INÍCIO possíveis.

      6. TOOL CALLING / AÇÕES (USE JSON SEMPRE QUE APLICÁVEL):
         - RETORNAR HORÁRIOS:
           {
             "action": "PROPOSE_SLOTS",
             "data": {
               "slots": ["09:00", "14:00", "15:30"] // Apenas horários de início válidos
             }
           }
         
         - SOLICITAR NOME E TELEFONE (SEMPRE USE ESTE JSON, NUNCA PERGUNTE EM TEXTO):
           Texto: "Para finalizar seu agendamento de [SERVIÇO] para [DIA] às [HORA], preciso apenas de mais alguns dados para o cadastro."
           { "action": "REQUEST_CLIENT_DATA" }

         - CONFIRMAR AGENDAMENTO (SOMENTE SE JÁ TIVER NOME COMPLETO E TELEFONE):
           {
             "action": "PROPOSE_BOOKING",
             "data": {
               "serviceId": "ID",
               "serviceName": "Nome",
               "price": 35.00,
               "date": "YYYY-MM-DD",
               "time": "HH:MM",
               "clientName": "Nome Completo",
               "clientPhone": "Tel"
             }
           }

      REGRA DE OURO: Se você precisa de nome ou telefone, RETORNE O JSON REQUEST_CLIENT_DATA. NÃO pergunte em texto.
      
      Histórico da conversa:
      ${JSON.stringify(contextHistory || [])}
      
      Cliente: "${message}"
    `;

    // 3. Call Gemini with Fallback Strategy
    let result;
    try {
      result = await model.generateContent(systemPrompt);
    } catch (modelError: any) {
      console.warn('⚠️ Primary Model 2.5 Failed. Trying Fallback 1.5-Flash...', modelError.message);
      // Fallback
      const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });
      result = await fallbackModel.generateContent(systemPrompt);
    }

    const responseText = result.response.text();

    // 4. Check if response is JSON (Action)
    // 4. Robust Response Parsing (Handles Text + JSON mixed content)
    let finalResponse;
    const jsonBlockRegex = /```json([\s\S]*?)```/;
    const match = responseText.match(jsonBlockRegex);

    if (match) {
      // Case A: Explicit Markdown JSON block found
      const jsonString = match[1].trim();
      const textPart = responseText.replace(match[0], '').trim();

      try {
        const actionData = JSON.parse(jsonString);
        finalResponse = {
          type: 'action',
          text: textPart, // Include the conversational part
          ...actionData,
        };
      } catch (e) {
        // Only if JSON parse strictly fails
        finalResponse = { type: 'text', text: responseText };
      }
    } else {
      // Case B: No Markdown, but maybe raw JSON?
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const potentialJson = responseText.substring(firstBrace, lastBrace + 1);
        const potentialText = (
          responseText.substring(0, firstBrace) + responseText.substring(lastBrace + 1)
        ).trim();

        try {
          const actionData = JSON.parse(potentialJson);
          if (actionData.action || actionData.type) {
            finalResponse = {
              type: 'action',
              text: potentialText,
              ...actionData,
            };
          } else {
            // Just a random object mentioned in text
            finalResponse = { type: 'text', text: responseText };
          }
        } catch (e) {
          finalResponse = { type: 'text', text: responseText };
        }
      } else {
        // Case C: Pure Text
        finalResponse = { type: 'text', text: responseText };
      }
    }

    res.json(finalResponse);
  } catch (error: any) {
    console.error('AI Chat Error:', error);

    // DEBUG MODE: Return ANY error to chat for diagnosis
    const isQuota =
      error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota');

    return res.json({
      type: 'text',
      text: isQuota
        ? '🤯 Eita! Muita gente falando comigo. Aguarde 30s e tente de novo? (Cota excedida)'
        : `😵 Tive um problema técnico: ${error.message || 'Erro desconhecido'}`,
    });
  }
};
