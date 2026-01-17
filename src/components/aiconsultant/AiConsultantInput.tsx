import React from 'react';
import { ScanFace, Sparkles, Camera, Loader2, Bot, RefreshCw } from 'lucide-react';

interface AiConsultantInputProps {
  hairType: string;
  setHairType: (type: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  selectedImage: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export const AiConsultantInput: React.FC<AiConsultantInputProps> = ({
  hairType,
  setHairType,
  description,
  setDescription,
  selectedImage,
  handleImageUpload,
  onSubmit,
  loading,
}) => {
  return (
    <div className="bg-[#0a0a0a] rounded-2xl md:rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-colors duration-500">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 opacity-50"></div>

      <form onSubmit={onSubmit} className="space-y-6 md:space-y-8 relative z-10">
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
                    <span className="text-[10px] text-gray-600 mt-1">IA analisará seu rosto</span>
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
  );
};
