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
          <div className="bg-[#0a0a0a] rounded-2xl md:rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-colors duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 opacity-50"></div>

            <form onSubmit={handleConsultation} className="space-y-6 md:space-y-8 relative z-10">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column: Text Inputs */}
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                      <ScanFace size={14} className="text-purple-400 md:w-4 md:h-4" />
                      Tipo de Cabelo
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Liso', 'Ondulado', 'Cacheado', 'Crespo', 'Falhado'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setHairType(type)}
                          className={`py-2 px-2 rounded-lg text-[10px] md:text-xs font-medium transition-all duration-300 border ${
                            hairType === type
                              ? 'bg-purple-500/20 border-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                      <Sparkles size={14} className="text-cyan-400 md:w-4 md:h-4" />
                      Seu Estilo
                    </label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Ex: Quero algo moderno..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all resize-none text-sm"
                    />
                  </div>
                </div>

                {/* Right Column: Photo Upload */}
                <div className="flex flex-col">
                  <label className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                    <Camera size={14} className="text-yellow-400 md:w-4 md:h-4" />
                    Sua Foto (Opcional)
                  </label>

                  <div className="flex-1 relative group/upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className={`w-full h-full min-h-[200px] rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden ${
                        selectedImage
                          ? 'border-yellow-500/50 bg-yellow-500/5'
                          : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                      }`}
                    >
                      {selectedImage ? (
                        <>
                          <img
                            src={selectedImage}
                            alt="Preview"
                            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover/upload:opacity-30 transition-opacity"
                          />
                          <div className="relative z-10 bg-black/60 p-2 rounded-full border border-white/10 backdrop-blur-sm">
                            <RefreshCw size={20} className="text-white" />
                          </div>
                          <span className="relative z-10 mt-2 text-[10px] uppercase font-bold text-white tracking-widest">
                            Trocar Foto
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover/upload:scale-110 transition-transform">
                            <Camera
                              size={24}
                              className="text-gray-400 group-hover/upload:text-yellow-400 transition-colors"
                            />
                          </div>
                          <span className="text-xs text-gray-400 font-medium text-center px-4">
                            Clique para enviar uma selfie
                          </span>
                          <span className="text-[10px] text-gray-600 mt-1">
                            IA analisará seu rosto
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || (!description && !selectedImage)}
                className="w-full py-4 md:py-5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none relative overflow-hidden group/btn text-xs md:text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 md:w-5 md:h-5" />
                    <span className="animate-pulse">Processando Visual...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Gerar Estilo Nano</span>
                    <Bot className="relative z-10 w-4 h-4 md:w-5 md:h-5 group-hover/btn:rotate-12 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Result Panel - Image Mode Layout */}
          <div className="relative min-h-[500px] bg-[#0a0a0a] rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden flex flex-col">
            {!result && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-6 p-8">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 animate-pulse">
                  <Camera size={40} className="opacity-50" />
                </div>
                <p className="text-sm font-mono uppercase tracking-widest">
                  Aguardando Input Visual...
                </p>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8 z-10">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-t-4 border-yellow-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCircuit size={40} className="text-yellow-500 animate-pulse" />
                  </div>
                </div>
                <p className="text-yellow-500 font-black uppercase tracking-[0.2em] animate-pulse">
                  Gerando Novo Visual...
                </p>
              </div>
            )}

            {result && !loading && (
              <div className="flex-1 flex flex-col md:flex-row animate-in fade-in duration-700">
                {/* Image Section (Hero) - Compact on Mobile */}
                <div className="w-full md:w-1/2 relative min-h-[250px] md:min-h-full bg-black group">
                  {/* Generated Image or Fallback to User Photo */}
                  {generatedImage ? (
                    <img
                      src={generatedImage}
                      alt={result.styleName}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 animate-in fade-in"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-70 transition-opacity duration-500 grayscale"
                      style={{
                        backgroundImage: `url(${
                          selectedImage ||
                          'https://images.unsplash.com/photo-1621605815971-fbc98d6d4e84?q=80&w=2000&auto=format&fit=crop'
                        })`,
                      }}
                    ></div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <div className="flex items-center justify-between mb-1">
                      <div
                        className={`inline-block text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                          generatedImage
                            ? 'bg-yellow-500 text-black'
                            : 'bg-white/20 text-white backdrop-blur-md'
                        }`}
                      >
                        {generatedImage ? 'Resultado IA' : 'Simulação Visual'}
                      </div>
                      <span className="text-[10px] text-gray-300 uppercase tracking-wider font-bold">
                        {result.maintenanceLevel} Manutenção
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-graffiti text-white leading-none">
                      {result.styleName}
                    </h3>
                  </div>
                </div>

                {/* Analysis Section (Chat Style) - Compact */}
                <div className="w-full md:w-1/2 p-5 md:p-6 flex flex-col bg-[#0f0f0f] justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Bot size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-bold">Maquinista Virtual</p>
                        <p className="text-gray-500 text-[9px] uppercase tracking-wider">
                          Consultor de Estilo
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/5 relative">
                      <div className="absolute -left-1.5 top-4 w-3 h-3 bg-white/5 rotate-45 border-l border-b border-white/5"></div>
                      <p className="text-gray-300 leading-relaxed text-xs md:text-sm font-light">
                        "{result.suggestion}"
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaved}
                      className={`py-2.5 rounded-lg font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-2 transition-all border ${
                        isSaved
                          ? 'bg-green-500/10 border-green-500/50 text-green-500'
                          : 'bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/40'
                      }`}
                    >
                      {isSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
                      {isSaved ? 'Salvo' : 'Salvar'}
                    </button>

                    <button
                      onClick={onOpenBooking}
                      className="py-2.5 rounded-lg font-black uppercase text-[10px] tracking-wider flex items-center justify-center gap-2 bg-yellow-500 text-black hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20"
                    >
                      Agendar <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
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
