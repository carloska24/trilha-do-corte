// aiCommandProcessor.ts
// Secure Version: Delegates processing to Backend API

import { api } from '../services/api';

// Types from User Request
interface AiResponse {
  intent:
    | 'CREATE_APPOINTMENT'
    | 'CANCEL_APPOINTMENT'
    | 'RESCHEDULE_APPOINTMENT'
    | 'SHOP_MANAGEMENT'
    | 'UNKNOWN';
  entities: {
    client_name?: string;
    service_name?: string;
    date?: string; // YYYY-MM-DD
    time?: string; // HH:mm
    action_type?: string; // For Shop Management
    value?: string; // For Shop Management values
  };
}

// Frontend-facing result
export interface CommandResult {
  action: 'schedule' | 'cancel' | 'reschedule' | 'manage_shop' | 'unknown';
  data?: any;
  message?: string;
  raw?: AiResponse; // Debugging
}

const getSystemPrompt = (validServices: string) => {
  const today = new Date().toLocaleDateString('pt-BR');
  const todayISO = new Date().toISOString().split('T')[0];

  /* 
    SECURITY: Helper to calculate dynamic dates for the prompt examples so the AI 
    doesn't "hallucinate" the wrong year (e.g., using 2025 when it's 2026).
  */
  const d = new Date();
  const year = d.getFullYear(); // 2026

  return `
Você é uma IA classificadora para uma barbearia.
Sua função é receber um comando de voz e retornar ESTRITAMENTE um JSON.

## Contexto Temporal:
- **HOJE:** ${today} (${todayISO})
- **ANO ATUAL:** ${year}

## Serviços Disponíveis:
${validServices}

## Intents Suportados:
1. CREATE_APPOINTMENT (Agendar)
2. CANCEL_APPOINTMENT (Cancelar)
3. RESCHEDULE_APPOINTMENT (Remarcar)
4. SHOP_MANAGEMENT (Gerenciar Loja)
5. UNKNOWN

## Entidades (CREATE_APPOINTMENT):
- client_name: Nome do cliente
- service_name: Nome do serviço (Ex: "Corte", "Barba", "Luzes")
- date: "YYYY-MM-DD" ou "hoje"
- time: "HH:MM"

## Entidades (SHOP_MANAGEMENT):
- action_type: 'close_agenda' (Fechar dias inteiros) | 'open_agenda' (Reabrir dias) | 'set_hours' (Alterar horário do dia)
- dates: Array de strings ["YYYY-MM-DD", "YYYY-MM-DD"]. Se for "hoje", use "${todayISO}".
- value: Para 'set_hours', o novo horário limite (Ex: "14:00"). Para fechar o resto do dia, use o horário atual.

## Regras de Negócio:
- "Fechar loja a partir das 14h" -> action_type: 'set_hours', dates: ["${todayISO}"], value: "14:00"
- "Fechar dias 13 e 14" -> action_type: 'close_agenda', dates: ["${year}-01-13", "${year}-01-14"]
- "Abrir dias 13 e 14" -> action_type: 'open_agenda', dates: ["${year}-01-13", "${year}-01-14"]
- "Reabrir agenda dia 20" -> action_type: 'open_agenda', dates: ["${year}-01-20"]

## Formato de Resposta (JSON Puro):
{
  "intent": "SHOP_MANAGEMENT",
  "entities": {
    "action_type": "open_agenda",
    "dates": ["${year}-01-13", "${year}-01-14"]
  }
}
`;
};

// Global Lock (Circuit Breaker)
let isGlobalProcessing = false;

export const processVoiceCommand = async (
  text: string,
  availableServices: any[] = []
): Promise<CommandResult> => {
  if (isGlobalProcessing) {
    console.warn('⚠️ [AI] Comando ignorado: Processamento anterior em andamento.');
    return { action: 'unknown', message: '...' }; // Silent ignore
  }

  isGlobalProcessing = true;

  try {
    // Format services list for prompt
    const servicesListStr =
      availableServices.length > 0
        ? availableServices.map(s => `- ${s.name}`).join('\n')
        : '- Corte\n- Barba\n- Sobrancelha';

    const systemInstruction = getSystemPrompt(servicesListStr);
    const fullPrompt = `System Context: ${systemInstruction}\n\nUser Input: ${text}`;

    // Call Backend Proxy
    // Note: api service does not have a generic .post, so we use fetch directly.
    const token = localStorage.getItem('token');

    // Authorization Check
    if (!token) {
      console.warn('⚠️ [AI] Comando ignorado: Usuário não autenticado.');
      return { action: 'unknown', message: 'Você precisa estar logado para usar a IA.' };
    }

    const response = await fetch('/api/ai/command', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt: fullPrompt }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Backend Error Details:', errorData);
      throw new Error(
        `Backend Error ${response.status}: ${errorData.details || errorData.error || 'Unknown'}`
      );
    }

    const data = await response.json();
    const responseText = data.text;

    if (!responseText) {
      // Fallback if structure is different
      throw new Error('Empty response from AI Backend');
    }

    console.log('Gemini Backend Response:', responseText); // Debug

    // Clean Markdown Code Blocks if present (v1 doesn't enforce JSON mode)
    // Clean Markdown Code Blocks if present
    const cleanJson = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Check if it looks like JSON
    if (!cleanJson.startsWith('{')) {
      console.warn('⚠️ Response is not JSON, treating as text message:', cleanJson);
      return { action: 'unknown', message: cleanJson };
    }

    let parsed: AiResponse;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse AI JSON', e);
      // Fallback: Return raw text as message
      return { action: 'unknown', message: cleanJson };
    }

    // Map AI Intent to Frontend Action
    switch (parsed.intent) {
      case 'CREATE_APPOINTMENT':
        // 🛡️ Guard: Ensure required entities are present to prevent "ghost" appointments
        if (!parsed.entities?.client_name || !parsed.entities?.time) {
          return {
            action: 'unknown', // Falls back to showing message in UI
            message: 'Entendi que quer agendar, mas preciso do NOME e HORÁRIO.',
            data: {},
            raw: parsed,
          };
        }

        return {
          action: 'schedule',
          data: {
            clientName: parsed.entities?.client_name,
            serviceName: parsed.entities?.service_name || (parsed.entities as any)?.service,
            // 🛡️ Fix: AI sometimes returns "2026 01 06" (spaces) -> Normalize to YYYY-MM-DD
            date: parsed.entities?.date
              ? parsed.entities.date.replace(/ /g, '-')
              : new Date().toISOString().split('T')[0],
            time: parsed.entities?.time,
          },
          message: `Entendido. Agendando ${parsed.entities?.service_name || 'serviço'} para ${
            parsed.entities?.client_name || 'cliente'
          }...`,
          raw: parsed,
        };

      case 'CANCEL_APPOINTMENT':
        return {
          action: 'cancel',
          data: {
            clientName: parsed.entities?.client_name,
            date: parsed.entities?.date,
          },
          message: `Procurando agendamento de ${
            parsed.entities?.client_name || 'cliente'
          } para cancelar.`,
          raw: parsed,
        };

      case 'RESCHEDULE_APPOINTMENT':
        return {
          action: 'reschedule',
          data: parsed.entities,
          message: `Tentando remarcar ${parsed.entities?.client_name || 'cliente'}...`,
          raw: parsed,
        };

      case 'SHOP_MANAGEMENT':
        return {
          action: 'manage_shop',
          data: parsed.entities,
          message: `Processando comando administrativo...`,
          raw: parsed,
        };

      default:
        return {
          action: 'unknown',
          message: 'Não entendi. Tente "Agendar [Nome] [Dia] [Hora]"',
          raw: parsed,
        };
    }
  } catch (error: any) {
    console.error('Gemini Backend Error:', error);
    // Specific Handling for Quota Exceeded (429)
    if (error.response?.status === 429) {
      return { action: 'unknown', message: '⚠️ Cota da IA excedida. Tente novamente em 2 min.' };
    }
    return { action: 'unknown', message: 'Erro ao processar comando com IA.' };
  } finally {
    isGlobalProcessing = false;
  }
};
