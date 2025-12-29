import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiConsultationResponse } from '../types';

const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Função de espera para o Retry
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- 1. CONSULTORIA DE TEXTO (Usa Gemini 2.5) ---
export const getStyleConsultation = async (
  userDescription: string,
  hairType: string
): Promise<AiConsultationResponse> => {
  if (!genAI) return mockOfflineResponse();

  try {
    // CORREÇÃO: Usando o modelo experimental atualizado (2.0 Flash Exp)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
      Você é 'O Maquinista', barbeiro especialista.
      Cliente: "${userDescription}", Cabelo: "${hairType}".
      Sugira um corte moderno. Responda APENAS JSON válido:
      { "styleName": "Nome", "suggestion": "Descrição curta", "maintenanceLevel": "Médio" }
    `;

    const result = await model.generateContent(prompt);
    return parseResponse(result);
  } catch (error) {
    console.error('Erro Consultoria:', error);
    return mockErrorResponse();
  }
};

// --- 2. CONSULTORIA COM FOTO (Usa Gemini 2.5) ---
export const getStyleConsultationWithImage = async (
  userDescription: string,
  hairType: string,
  imageBase64: string
): Promise<AiConsultationResponse> => {
  if (!genAI) return mockOfflineResponse();

  try {
    // CORREÇÃO: Usando o modelo experimental atualizado (2.0 Flash Exp)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
      Analise a foto do rosto e o pedido: "${userDescription}", Cabelo: "${hairType}".
      Sugira um corte ideal. Responda APENAS JSON válido:
      { "styleName": "Nome", "suggestion": "Descrição", "maintenanceLevel": "Baixo/Médio/Alto" }
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
    ]);

    return parseResponse(result);
  } catch (error) {
    console.error('Erro Visual:', error);
    return mockErrorResponse('Não consegui ver a foto. Tente apenas texto.');
  }
};

// --- 3. GERAÇÃO DE IMAGEM (Com Retry Inteligente) ---
export const generateHairstyleImage = async (
  description: string,
  styleName: string,
  userImageBase64?: string | null
): Promise<string | null> => {
  if (!genAI) return null;

  const MAX_RETRIES = 3;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      // Tenta usar o experimental (único que gera imagens atualmente na nossa config)
      const modelName = 'gemini-2.0-flash-exp';
      const model = genAI.getGenerativeModel({ model: modelName });

      let prompt = '';
      let payload: any[] = [];

      if (userImageBase64) {
        prompt = `
          Edit this photo to apply the following haircut: "${styleName}".
          
          Instructions:
          - Keep the person's face EXACTLY as it is.
          - Only modification should be the hair.
          - Apply this style: ${styleName} - ${description}.
          - Maintain the original lighting and angle if possible, or enhance to a "Cyberpunk Barber Shop" vibe if the background is plain.
          - High realism, 8k resolution.
          
          Generate the modified image.
        `;
        // Remove header data:image/jpeg;base64, if present for the API payload
        const base64Data = userImageBase64.split(',')[1] || userImageBase64;

        payload = [prompt, { inlineData: { mimeType: 'image/jpeg', data: base64Data } }];
      } else {
        // PROMPT NANO BANANA RESTAURADO (Fallback)
        prompt = `
          Create a high-quality, photorealistic portrait of a man with this specific haircut: "${styleName}".
          
          Details:
          - Haircut Style: ${styleName}
          - Analysis/Vibe: ${description}
          - Setting: Modern, cinematic urban barber shop with neon lighting (Nano Banana style).
          - Lighting: Vibrant, high contrast, neon accents (purple/yellow).
          - Quality: 8k, highly detailed, professional photography.
          - Subject: Male model fitting the description.
          
          Generate ONLY the image.
        `;
        payload = [prompt];
      }

      console.log(`Gerando imagem (${i + 1}/${MAX_RETRIES})...`);
      const result = await model.generateContent(payload);
      const response = await result.response;

      // EXTRAÇÃO DE DADOS REAL (CRUCIAL)
      if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.inlineData) {
        const imgData = response.candidates[0].content.parts[0].inlineData;
        return `data:${imgData.mimeType};base64,${imgData.data}`;
      }
    } catch (error: any) {
      // Erro 429 = Cota excedida (espera e tenta de novo)
      // Erro 503 = Servidor ocupado
      if (
        error.message?.includes('429') ||
        error.status === 429 ||
        error.status === 503 ||
        error.status === 500
      ) {
        // Backoff exponencial agressivo: 4s, 8s, 12s para garantir
        const delay = (i + 1) * 4000;
        console.warn(`API Ocupada/Limite. Esperando ${delay / 1000}s...`);
        await wait(delay);
      } else {
        console.error('Erro fatal imagem:', error);
        break; // Outros erros (404, 400) não adianta insistir
      }
    }
  }
  return null; // Retorna null para a UI mostrar a foto original em vez de erro
};

// --- Funções Auxiliares para limpar o código ---

const parseResponse = async (result: any) => {
  const text = result.response
    .text()
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();
  return JSON.parse(text);
};

const mockOfflineResponse = () => ({
  styleName: 'Modo Offline',
  suggestion: 'Verifique sua conexão ou API Key.',
  maintenanceLevel: 'N/A',
});

const mockErrorResponse = (msg = 'Tente novamente.') => ({
  styleName: 'Erro no Processamento',
  suggestion: msg,
  maintenanceLevel: 'N/A',
});

// Mantive as funções de Promoção simplificadas
export const generatePromoPhrase = async (serviceName: string, price: number, context?: string) => {
  if (!genAI) return { text: 'PROMOÇÃO TOP', theme: 'standard' };
  try {
    // Usando 2.0 Flash Exp
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
      Atue como um especialista em marketing para barbearias.
      Crie uma frase curta e chamativa (máximo 50 caracteres) para vender o serviço abaixo.
      
      Serviço: ${serviceName}
      Preço: R$ ${price}
      ${context ? `Contexto do Usuário: "${context}"` : ''}

      Regras de Tema (IMPORTANTE):
      1. Natal/Fim de Ano -> "christmas"
      2. Páscoa/Coelho/Chocolate -> "easter"
      3. Halloween/Dia das Bruxas -> "halloween"
      4. Verão/Calor/Praia -> "summer"
      5. Namorados/Amor/Casal -> "valentine"
      6. Black Friday/Ofertaço/Desconto -> "black_friday"
      7. Dia dos Pais/Pai/Homem -> "fathers_day"
      8. Dia das Mães/Mainha -> "mothers_day"
      9. Carnaval/Festa -> "carnival"
      10. Promoção Relâmpago/Oferta/Imperdível -> "offer"
      11. VIP/Premium/Rei/Luxo -> "premium"
      12. Outros -> "standard"

      Regras de Negócio:
      - Se o "Contexto do Usuário" mencionar um valor (ex: "R$ 25", "20 reais", "25,00"), IGNORE o preço original e USE O PREÇO DO CONTEXTO na frase.
      - A frase DEVE conter o preço final.

      Retorne APENAS um JSON válido (sem markdown, sem blocos de código) no seguinte formato:
      {
        "text": "Sua frase criativa aqui",
        "theme": "christmas" | "easter" | "halloween" | "summer" | "black_friday" | "valentine" | "fathers_day" | "mothers_day" | "carnival" | "offer" | "premium" | "standard",
        "discountValue": "R$ 25,00" // (Opcional) Se houver troca de preço
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response
      .text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    try {
      return JSON.parse(text);
    } catch (e) {
      return { text: text, theme: 'standard' };
    }
  } catch (error) {
    console.error('Error generating promo:', error);
    return { text: `Promoção especial para ${serviceName}!`, theme: 'standard' };
  }
};

export const generateServiceDescription = async (
  serviceName: string,
  category: string,
  duration: number
) => {
  if (!genAI) return 'Serviço premium com acabamento impecável.';

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
      Você é um Barbeiro Expert e Copywriter de Luxo para a "Barber Pro System".
      Crie uma descrição curta, técnica e vendedora para o seguinte serviço:

      Serviço: ${serviceName}
      Categoria: ${category}
      Duração: ${duration} minutos

      Regras:
      1. Use tom profissional, moderno e "premium".
      2. Destaque os benefícios e a técnica.
      3. Máximo de 180 caracteres (ideal para caber no card).
      4. Sem emojis exagerados.
      5. Foco na experiência do cliente.

      Retorne APENAS o texto da descrição.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Error generating description:', error);
    return `O melhor ${serviceName} da região, feito com excelência em ${duration}min.`;
  }
};
