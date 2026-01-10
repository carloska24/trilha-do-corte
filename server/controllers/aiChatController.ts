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
      2. LÓGICA DE AGENDAMENTO E CADASTRO (IMPORTANTE):
         - Antes de finalizar qualquer agendamento, você DEVE saber o NOME e o TELEFONE do cliente.
         - Se o cliente não forneceu, pergunte algo como "Para finalizar, qual seu nome e WhatsApp?".
         - NÃO CONFIRME agendamento sem esses dados.
      
      3. LÓGICA DE HORÁRIOS:
         - Verifique a duração do serviço (ex: Platinado 90min precisa de 3 slots).
         - Use os slots de 'availability' fornecidos na lista.

      4. APRESENTAÇÃO DOS HORÁRIOS (CRÍTICO):
         - NUNCA escreva a lista de horários no texto da resposta (ex: "Tenho 09:00, 09:30..."). ISSO É PROIBIDO.
         - Apenas diga algo como "Encontrei estes horários disponíveis para você:" ou "Veja os horários abaixo:".
         - A interface do usuário cuidará de mostrar os botões bonitinhos baseados no seu JSON.

      5. TOOL CALLING / AÇÕES:
         - Se o cliente pedir horários: JSON "PROPOSE_SLOTS".
         
         - Se o cliente quiser agendar mas você NÃO souber Nome/Telefone:
           NÃO PERGUNTE EM TEXTO. Envie estritamente o JSON "REQUEST_CLIENT_DATA".
           {
             "action": "REQUEST_CLIENT_DATA"
           }

         - Se o cliente CONFIRMAR (e você JÁ TIVER Nome e Telefone):
           Responda EXATAMENTE um JSON "PROPOSE_BOOKING".

      {
        "action": "PROPOSE_BOOKING",
        "data": {
          "serviceId": "ID_DO_SERVICO",
          "serviceName": "NOME_DO_SERVICO",
          "price": 35.00,
          "date": "YYYY-MM-DD",
          "time": "HH:MM",
          "clientName": "Nome Coletado",
          "clientPhone": "Telefone Coletado"
        }
      }

      Se faltar info, NÃO MANDE JSON, mande texto perguntando.

      Se faltar informação, APENAS pergunte ao cliente. NÃO invente horários.
      
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
