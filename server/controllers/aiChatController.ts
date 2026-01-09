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
  const today = new Date();

  interface DayAvailability {
    date: string;
    slots: string[];
  }
  const nextDays: DayAvailability[] = [];

  // Reduce to 7 days to avoid payload getting too large
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Use local YYYY-MM-DD manually to avoid locale issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // MOCK: Generate slots every 30 mins from 09:00 to 19:00 (Full availability for testing)
    const slots: string[] = [];
    for (let hour = 9; hour < 19; hour++) {
      for (let min of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }

    nextDays.push({ date: dateStr, slots });
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
      2. LÓGICA DE AGENDAMENTO INTELIGENTE (IMPORTANTE):
         - Verifique a duração do serviço solicitado.
         - Se o serviço levar mais de 30min (ex: 60min, 90min), você só pode oferecer um horário se houver slots consecutivos livres suficientes.
         - EXEMPLO: Para "Platinado" (90min) às 09:30, verifique se 09:30, 10:00 e 10:30 estão TODOS na lista de livres.
         - Se houver "buracos" na agenda que impeçam o serviço completo, NÃO ofereça esse horário.
      
      3. APRESENTAÇÃO:
         - Liste apenas os horários de INÍCIO válidos.
         - Se o cliente perguntar "tem horário para Platinado?", calcule e mostre apenas os slots onde cabem 90 minutos.

      4. Se o cliente quiser agendar, peça confirmação de: Serviço, Data e Horário.
      
      TOOL CALLING / AÇÕES:
      1. Se o cliente pedir horários disponíveis, responda com JSON "PROPOSE_SLOTS".
         No campo "slots", inclua APENAS os horários de início válidos para o serviço (se identificado) ou todos se for genérico.
      {
        "action": "PROPOSE_SLOTS",
        "data": {
          "date": "YYYY-MM-DD",
          "slots": ["09:00", "10:00"] // Apenas os horários livres
        }
      }

      2. Se o cliente CONFIRMAR explicitamente um agendamento com todas as informações necessárias (Serviço, Data, Hora), NÃO responda com texto comum.
      Responda EXATAMENTE um JSON neste formato para que o sistema execute a ação:
      
      {
        "action": "PROPOSE_BOOKING",
        "data": {
          "serviceId": "ID_DO_SERVICO_ENCONTRADO",
          "serviceName": "NOME_DO_SERVICO",
          "price": 35.00, // Preço do serviço (numérico)
          "date": "YYYY-MM-DD",
          "time": "HH:MM"
        }
      }

      Se faltar informação, APENAS pergunte ao cliente. NÃO invente horários.
      
      Histórico da conversa:
      ${JSON.stringify(contextHistory || [])}
      
      Cliente: "${message}"
    `;

    // 3. Call Gemini
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    // 4. Check if response is JSON (Action)
    let finalResponse;
    try {
      // Attempt to extract JSON if Gemini wrapped it in code blocks
      const cleaned = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      // Check if it looks like a JSON object with an "action" field
      if (
        cleaned.startsWith('{') &&
        (cleaned.includes('"action":') || cleaned.includes('"type":'))
      ) {
        const actionData = JSON.parse(cleaned);
        finalResponse = {
          type: 'action',
          ...actionData,
        };
      } else {
        finalResponse = {
          type: 'text',
          text: responseText,
        };
      }
    } catch (e) {
      // Fallback to text if parsing fails
      finalResponse = {
        type: 'text',
        text: responseText,
      };
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
        : `😵 Tive um problema técnico: ${error.message}`,
    });
  }
};
