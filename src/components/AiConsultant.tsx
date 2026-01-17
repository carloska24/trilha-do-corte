import React, { useState } from 'react';
import {
  getStyleConsultation,
  getStyleConsultationWithImage,
  generateHairstyleImage,
} from '../services/geminiService';
import { AiConsultationResponse } from '../types';
import {
  Bot,
  Sparkles,
  Loader2,
  ScanFace,
  BrainCircuit,
  ArrowRight,
  Save,
  CheckCircle2,
  Camera,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';

interface AiConsultantProps {
  onOpenBooking: () => void;
  onSaveStyle?: (style: AiConsultationResponse) => void;
}

export const AiConsultant: React.FC<AiConsultantProps> = ({ onOpenBooking, onSaveStyle }) => {
  const [description, setDescription] = useState('');
  const [hairType, setHairType] = useState('Liso');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiConsultationResponse | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description && !selectedImage) return;

    setLoading(true);
    setResult(null);
    setGeneratedImage(null);
    setIsSaved(false);
    try {
      let response;
      if (selectedImage) {
        const base64Data = selectedImage.split(',')[1];
        response = await getStyleConsultationWithImage(
          description || 'Analise meu rosto',
          hairType,
          base64Data
        );
      } else {
        response = await getStyleConsultation(description, hairType);
      }
      setResult(response);

      // Trigger Image Generation if we have a valid style name
      if (response && response.styleName) {
        // Call directly now
        const img = await generateHairstyleImage(
          response.suggestion,
          response.styleName,
          selectedImage
        );
        setGeneratedImage(img);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (result && onSaveStyle) {
      onSaveStyle(result);
      setIsSaved(true);
    }
  };

  return (
    <section
      id="ai-consultant"
      className="py-16 md:py-24 bg-[#050505] relative overflow-hidden scroll-mt-24"
    >
      {/* Tech Background Elements */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-900/10 to-transparent pointer-events-none"></div>

      {/* Floating Orbs - Adjusted for mobile */}
      <div className="absolute top-10 left-5 w-24 h-24 md:w-32 md:h-32 bg-purple-500/20 rounded-full blur-[60px] md:blur-[80px] animate-pulse"></div>
      <div className="absolute bottom-10 right-5 w-32 h-32 md:w-40 md:h-40 bg-cyan-500/20 rounded-full blur-[80px] md:blur-[100px] animate-pulse delay-700"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4 md:mb-6">
            <BrainCircuit size={14} className="text-neon-yellow md:w-4 md:h-4" />
            <span className="text-[10px] md:text-xs font-mono text-gray-300 uppercase tracking-widest">
              Powered by Gemini AI
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-graffiti text-white mb-4 md:mb-6 leading-none">
            MAQUINISTA{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              VIRTUAL
            </span>
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-lg font-light px-4">
            Nossa IA analisa seu perfil e sugere o corte perfeito para sua jornada.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-stretch">
          {/* Input Panel */}
          <AiConsultantInput
            hairType={hairType}
            setHairType={setHairType}
            description={description}
            setDescription={setDescription}
            selectedImage={selectedImage}
            handleImageUpload={handleImageUpload}
            onSubmit={handleConsultation}
            loading={loading}
          />

          {/* Result Panel */}
          <AiConsultantResult
            result={result}
            loading={loading}
            generatedImage={generatedImage}
            selectedImage={selectedImage}
            isSaved={isSaved}
            onSave={handleSave}
            onOpenBooking={onOpenBooking}
          />
        </div>
        {/* Mobile Navigation Arrow */}
        <div className="md:hidden flex justify-center mt-12 pb-4">
          <button
            onClick={() =>
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="animate-bounce text-white/30 hover:text-neon-yellow transition-colors cursor-pointer bg-transparent border-none p-2 outline-none"
            aria-label="Ir para Rodapé"
          >
            <ChevronDown size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};
