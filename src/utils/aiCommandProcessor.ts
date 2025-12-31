// aiCommandProcessor.ts
// Fix: Using Raw Fetch to ensure v1 endpoint and explicit model versioning (gemini-1.5-flash-001)

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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

  return `
Você é uma IA classificadora para uma barbearia.
Sua função é receber um comando de voz e retornar ESTRITAMENTE um JSON.

## Serviços Disponíveis (Use um destes nomes se identificado):
${validServices}

## Intents Suportados:
1. CREATE_APPOINTMENT (Agendar)
2. CANCEL_APPOINTMENT (Cancelar/Desmarcar)
3. RESCHEDULE_APPOINTMENT (Remarcar/Mudar horário)
4. SHOP_MANAGEMENT (Gerenciar loja: fechar agenda, mudar horário funcionamento)
5. UNKNOWN (Não entendeu ou fora do escopo)

## Entidades:
- client_name: Nome do cliente (Capitalizado)
- service_name: Nome do serviço identificado na lista acima (Ex: "Corte", "Barba", "Luzes"). Se não citar, null.
- date: Data no formato YYYY-MM-DD (Hoje é ${today} / ${todayISO})
- time: Horário formato HH:mm
- action_type: 'close_agenda' | 'open_agenda' | 'set_hours'
- value: Ex: 'all_day', '09:00-18:00'

## Regras:
- Se o usuário disser "Cancelar tudo" ou "Fechar agenda", use as intents apropriadas.
- "Sair", "Tchau" -> UNKNOWN
- NAO retorne texto plano. Apenas JSON.

## Exemplos:
Input: "Agendar Carlos amanhã as 10"
Output: {"intent": "CREATE_APPOINTMENT", "entities": {"client_name": "Carlos", "date": "2025-01-02", "time": "10:00", "service_name": "Corte"}}

Input: "Quero fazer luzes com o João sexta feira"
Output: {"intent": "CREATE_APPOINTMENT", "entities": {"client_name": "João", "date": "2025-01-03", "service_name": "Luzes"}}

Input: "Cancelar o agendamento do João"
Output: {"intent": "CANCEL_APPOINTMENT", "entities": {"client_name": "João"}}
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

  if (!API_KEY) {
    console.warn('⚠️ VITE_GEMINI_API_KEY não encontrada. Usando Mock.');
    return fallbackMockProcessor(text);
  }

  isGlobalProcessing = true;

  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`;

  try {
    // Format services list for prompt
    const servicesListStr =
      availableServices.length > 0
        ? availableServices.map(s => `- ${s.name}`).join('\n')
        : '- Corte\n- Barba\n- Sobrancelha';

    const systemInstruction = getSystemPrompt(servicesListStr);

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `System Context: ${systemInstruction}\n\nUser Input: ${text}` }],
        },
      ],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 256,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY || '',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    // Safely extract text from response structure
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('Empty response from AI');
    }

    console.log('Gemini Raw Response:', responseText); // Debug

    // Clean Markdown Code Blocks if present (v1 doesn't enforce JSON mode)
    const cleanJson = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let parsed: AiResponse;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse AI JSON', e);
      return { action: 'unknown', message: 'Erro ao interpretar resposta da IA.' };
    }

    // Map AI Intent to Frontend Action
    switch (parsed.intent) {
      case 'CREATE_APPOINTMENT':
        return {
          action: 'schedule',
          data: {
            clientName: parsed.entities?.client_name,
            serviceName: parsed.entities?.service_name,
            date: parsed.entities?.date, // Already ISO
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
    console.error('Gemini Error:', error);
    // Specific Handling for Quota Exceeded (429)
    if (error.message?.includes('429') || error.status === 429) {
      return { action: 'unknown', message: '⚠️ Cota da IA excedida. Tente novamente em 2 min.' };
    }
    return { action: 'unknown', message: 'Erro ao processar comando com IA.' };
  } finally {
    isGlobalProcessing = false;
  }
};

// Fallback Mock (Offline Mode)
const fallbackMockProcessor = (text: string): CommandResult => {
  return { action: 'unknown', message: 'Modo Offline: Configure a API Key.' };
};
