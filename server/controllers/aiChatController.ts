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

  // Prisma needs Date objects for filtering DateTime fields
  const filterStart = new Date(startDate);
  filterStart.setHours(0, 0, 0, 0);

  const filterEnd = new Date(endDate);
  filterEnd.setHours(23, 59, 59, 999);

  const existingAppointments = await prisma.appointments.findMany({
    where: {
      date: {
        gte: filterStart,
        lte: filterEnd,
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
  const settings = await prisma.shopSettings.findFirst();
  const startHourConfig = settings?.startHour || 9;
  const endHourConfig = settings?.endHour || 19;
  const closedDays = settings?.closedDays || [0];
  const exceptions = (settings?.exceptions as any) || {};

  // Create a Set for fast lookup: "YYYY-MM-DD HH:MM"
  // Helper to format Date -> YYYY-MM-DD
  const formatDateStr = (d: Date | null) => (d ? d.toISOString().split('T')[0] : '');

  const busySlots = new Set(
    existingAppointments.map(app => `${formatDateStr(app.date)} ${app.time}`)
  );

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
    select: {
      id: true,
      name: true,
      price: true,
      description: true,
      category: true,
      duration: true,
    },
  });
  return services;
}

export const handleChat = async (req: Request, res: Response) => {
  try {
    const { message, contextHistory } = req.body;

    // 1. Gather Context
    const availability = await getAvailabilityForNextDays();
    const services = await getServicesList();

    // Fetch slotInterval from settings for accurate prompt
    const settings = await prisma.shopSettings.findFirst();
    const slotInterval = settings?.slotInterval || 30;

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
      - Serviços Disponíveis: ${JSON.stringify(services)}
      - Horários Livres (Slots de ${slotInterval}min): ${JSON.stringify(availability)}

      SUAS INSTRUÇÕES DE PERSONALIDADE (CYBERPUNK & STREET):
      - Tom de voz: Use gírias sutis ("Mano", "Chegado", "Truta", "Bora"), mas mantenha o respeito profissional.
      - Estilo: Você é uma IA do futuro. Use termos tech ocasionalmente ("Processando...", "Sincronizando...", "Conexão OK").
      - Espontaneidade: NÃO seja robótica. Se o cliente pedir sugestão, dê sua opinião de "expert".
      
      REGRAS VISUAIS (SUPER IMPORTANTE):
      1. MENOS ASTERISCOS, MAIS ORGANIZAÇÃO:
         - Não use asteriscos (**) em excesso. Polui a visão.
         - Se for listar opções, USE NÚMEROS (1., 2., 3.). Fica mais fácil pro cliente pedir "quero a 1".
      
      2. EMOJIS INTELIGENTES (SEMÂNTICA):
         - Falou de Corte/Cabelo? Use ✂️.
         - Falou de Barba? Use 🧔 ou 💈.
         - Falou de Combo? Use 🚀 ou ⚡.
         - Falou de Química/Luzes? Use 🧪 ou 🔥.
         - Finalizou? Use 👊 ou 🤝.

      REGRAS CRÍTICAS DE NEGÓCIO:
      
      1. RECOMENDAÇÕES E DÚVIDAS GERAIS -> USE TEXTO PURO!
         - Se o cliente pedir sugestão de combo ou preço, RESPONDA APENAS COM TEXTO.
         - Liste os "Combos" oficiais do sistema (Categoria: Combo) se houver match.
         - Exemplo: 
           "Tenho essas opções brabas pra você:
            1. Combo Completo (Corte + Barba...) - R$65 🚀
            2. Corte Social - R$35 ✂️"

      2. FLUXO OBRIGATÓRIO (SERVIÇO + DIA -> HORÁRIO):
         - O usuário já disse o serviço? (Se não, pergunte).
         - O usuário já disse o DIA? (Se não, pergunte: "Para hoje, amanhã ou outro dia?").
         - SÓ OFERTE HORÁRIOS QUANDO SOUBER O SERVIÇO E O DIA.
         - Se ele disser apenas "Quero cortar", responda: "Claro! Para qual dia você prefere? Tenho horários hoje e amanhã."
         - Se ele disser "Quero cortar amanhã", AÍ SIM busque os slots de amanhã e mostre.

      3. LÓGICA DE DURAÇÃO E AGENDAMENTO (DINÂMICO):
         - Intervalo do sistema: **${slotInterval} minutos**.
         - **Fórmula**: Slots Necessários = Teto(Duração do Serviço / ${slotInterval}).
         - Exemplo para 55min (intervalo 15): Precisa de **4 slots livres** seguidos.
         - Se 09:00 está livre, mas 09:15 está ocupado -> 09:00 NÃO serve.

      4. MODO DE OFERTA (GRANULARIDADE ALTA):
         - **PROIBIDO ARREDONDAR**: Se o intervalo é 15 min, OFERTE 09:15, 09:45, 10:15!
         - Não mostre apenas horas cheias (09:00, 10:00). O cliente quer opções.
         - Liste o MÁXIMO de horários de início possíveis.

      5. SEM LISTAS NO TEXTO (REGRA DE UI):
         - **NUNCA** escreva a lista de horários na mensagem de texto (ex: "* Manhã: 09:00...").
         - Isso polui o chat. Deixe que os botões (JSON) façam o trabalho visual.
         - No texto, diga apenas: "Encontrei estes horários para você na [DIA SELECIONADO]:" e mande o JSON.

      FORMATO DE RESPOSTA:
      
      - PARA CONVERSAR:
        Texto curto e direto. Sem listas.

      - OFERTAR HORÁRIOS (Ação):
        {
          "action": "PROPOSE_SLOTS",
          "data": { 
             "slots": ["09:00", "09:15", "09:30", "11:45", "14:15", "16:45"] // Use a granularidade correta!
          }
        }

      - PEDIR DADOS (Ação):
        { "action": "REQUEST_CLIENT_DATA" }

      - CONFIRMAR (Ação):
        {
          "action": "PROPOSE_BOOKING",
          "data": { 
             "serviceId": "s18",
             "serviceName": "Corte + Barba...",
             "price": 60.00, // IMPORTANTE: Envie como NÚMERO (sem 'R$' e sem aspas)
             "date": "2024-01-20",
             "time": "14:15",
             "clientName": "Carlos A",
             "clientPhone": "199..."
          }
        }
      
      Histórico da conversa:
      ${JSON.stringify(contextHistory || [])}
      
      Cliente mandou: "${message}"
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
