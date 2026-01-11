import { AiConsultationResponse } from '../types';

// NOTE: All AI logic has been migrated to the backend to protect the API Key.
// This service now acts as a client wrapper for the server endpoints.

// --- 1. CONSULTORIA DE TEXTO (Backend) ---
export const getStyleConsultation = async (
  userDescription: string,
  hairType: string
): Promise<AiConsultationResponse> => {
  try {
    const response = await fetch('/api/ai/consultation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userDescription, hairType }),
    });

    if (!response.ok) throw new Error('Falha na consultoria');
    return await response.json();
  } catch (error) {
    console.error('Erro Consultoria:', error);
    return mockErrorResponse();
  }
};

// --- 2. CONSULTORIA COM FOTO (Backend) ---
export const getStyleConsultationWithImage = async (
  userDescription: string,
  hairType: string,
  imageBase64: string
): Promise<AiConsultationResponse> => {
  try {
    const response = await fetch('/api/ai/consultation-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userDescription, hairType, imageBase64 }),
    });

    if (!response.ok) throw new Error('Falha na consultoria visual');
    return await response.json();
  } catch (error) {
    console.error('Erro Visual:', error);
    return mockErrorResponse('Não consegui ver a foto. Tente apenas texto.');
  }
};

// --- 3. GERAÇÃO DE IMAGEM (Backend) ---
export const generateHairstyleImage = async (
  description: string,
  styleName: string,
  userImageBase64?: string | null
): Promise<string | null> => {
  try {
    const response = await fetch('/api/ai/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, styleName, userImageBase64 }),
    });

    if (!response.ok) throw new Error('Falha na geração de imagem');
    const data = await response.json();
    return data.image; // Expecting { image: "data:image/jpeg;base64,..." }
  } catch (error) {
    console.error('Erro Imagem:', error);
    return null;
  }
};

// --- 4. GERAÇÃO DE PROMOÇÃO (Backend) ---
export const generatePromoPhrase = async (serviceName: string, price: number, context?: string) => {
  try {
    const response = await fetch('/api/ai/generate-promo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceName, price, context }),
    });

    if (!response.ok) {
      // Fallback silently on server error
      return { text: `Promoção especial para ${serviceName}!`, theme: 'standard' };
    }
    return await response.json();
  } catch (error) {
    console.error('Error generating promo:', error);
    return { text: `Promoção especial para ${serviceName}!`, theme: 'standard' };
  }
};

// --- 5. GERAÇÃO DE DESCRIÇÃO (Backend - Already Existing) ---
export const generateServiceDescription = async (
  serviceName: string,
  category: string,
  duration: number
) => {
  try {
    const vibes = [
      'Luxo & Exclusividade',
      'Rapidez & Praticidade',
      'Estilo Urbano/Moderno',
      'Clássico & Tradicional',
      'Rejuvenescimento/Cuidado',
      'Minimalista & Clean',
      'Ousado & Artístico',
    ];
    const randomVibe = vibes[Math.floor(Math.random() * vibes.length)];

    const response = await fetch('/api/ai/generate-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceName, category, duration, vibe: randomVibe }),
    });

    if (!response.ok) throw new Error('Falha na descrição');

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error fetching description:', error);
    return `O melhor ${serviceName} da região, feito com excelência em ${duration}min.`;
  }
};

// Mocks for Fallback
const mockErrorResponse = (msg = 'Tente novamente.') => ({
  styleName: 'Erro no Processamento',
  suggestion: msg,
  maintenanceLevel: 'N/A',
});
