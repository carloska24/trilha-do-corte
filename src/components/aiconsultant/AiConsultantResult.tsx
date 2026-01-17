import React from 'react';
import { Camera, BrainCircuit, Bot, Save, CheckCircle2, ArrowRight } from 'lucide-react';
import { AiConsultationResponse } from '../../types';

interface AiConsultantResultProps {
  result: AiConsultationResponse | null;
  loading: boolean;
  generatedImage: string | null;
  selectedImage: string | null;
  isSaved: boolean;
  onSave: () => void;
  onOpenBooking: () => void;
}

export const AiConsultantResult: React.FC<AiConsultantResultProps> = ({
  result,
  loading,
  generatedImage,
  selectedImage,
  isSaved,
  onSave,
  onOpenBooking,
}) => {
  return (
    <div className="relative min-h-[500px] bg-[#0a0a0a] rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden flex flex-col">
      {!result && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-6 p-8">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 animate-pulse">
            <Camera size={40} className="opacity-50" />
          </div>
          <p className="text-sm font-mono uppercase tracking-widest">Aguardando Input Visual...</p>
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
                onClick={onSave}
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
  );
};
