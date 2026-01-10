import React, { useState, useRef, useEffect } from 'react';
import { Service } from '../../types';
import { X, Camera, Upload, Clock, Search, Sparkles, ChevronDown, Save } from 'lucide-react';
import { generateServiceDescription } from '../../services/geminiService';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceConfig: Partial<Service>; // Initial data
  onSubmit: (data: Partial<Service>) => void;
  onOpenPromoStudio: () => void; // Callback to open PromoStudio from within modal
  editingServiceId: string | null;
}

const CATEGORIES = ['Cabelo', 'Barba', 'Combo', 'Química', 'Estética', 'Outros'];

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  onClose,
  serviceConfig,
  onSubmit,
  onOpenPromoStudio,
  editingServiceId,
}) => {
  // Local state to prevent parent re-renders on keystroke
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    priceValue: 0,
    duration: 30,
    category: 'Cabelo',
    description: '',
    image: '',
    featured: false,
    tag: '',
    discountPercentage: 0,
  });

  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when modal opens or serviceConfig changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: serviceConfig.name || '',
        priceValue: serviceConfig.priceValue || 0,
        duration: serviceConfig.duration || 30,
        category: serviceConfig.category || 'Cabelo',
        description: serviceConfig.description || '',
        image: serviceConfig.image || '',
        featured: serviceConfig.featured || false,
        tag: serviceConfig.tag || '',
        discountPercentage: serviceConfig.discountPercentage || 0,
      });
    }
  }, [isOpen, serviceConfig]);

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.category) return;

    setIsGeneratingDesc(true);
    const desc = await generateServiceDescription(
      formData.name,
      formData.category,
      formData.duration || 30
    );
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGeneratingDesc(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Import api dynamically or assume it's available.
      // Better to use dynamic import if we want to avoid top-level circular deps,
      // or just standard import if compatible.
      // Looking at the file, imports are top-level.
      // I'll use the dynamic import pattern seen in ServiceConfig or add a standard import if possible.
      // The file ServiceFormModal doesn't import 'api' yet.

      try {
        // Use dynamic import to avoid circular dependency risks if any, purely for safety
        // as ServiceConfig imports both api and ServiceFormModal.
        const { api } = await import('../../services/api');

        const url = await api.uploadImage(file);

        if (url) {
          setFormData(prev => ({ ...prev, image: url }));
        } else {
          console.error('Upload failed');
          alert('Erro ao fazer upload da imagem. Tente novamente.');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Erro ao conectar com o servidor.');
      }
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[var(--bg-card)] w-full max-w-lg rounded-2xl border border-[var(--border-color)] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300">
        {/* Modal Header */}
        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)] transition-colors duration-300">
          <div>
            <h3 className="text-xl font-black text-[var(--text-primary)] uppercase italic tracking-wider transition-colors">
              {editingServiceId ? 'Editar Serviço' : 'Novo Serviço'}
            </h3>
            <p className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest mt-1">
              Preencha os detalhes do serviço
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Image Upload */}
          <div className="flex justify-center">
            <div
              className="relative group w-full h-40 rounded-xl bg-[var(--bg-primary)] border-2 border-dashed border-[var(--border-color)] hover:border-neon-yellow transition-colors cursor-pointer overflow-hidden flex flex-col items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.image ? (
                <>
                  <img
                    src={formData.image}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    alt="Preview"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                    <Camera className="text-white" size={32} />
                  </div>
                </>
              ) : (
                <>
                  <Upload
                    className="text-[var(--text-secondary)] mb-2 group-hover:text-neon-yellow transition-colors"
                    size={32}
                  />
                  <span className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest group-hover:text-[var(--text-primary)] transition-colors">
                    Upload da Imagem
                  </span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 block">
                Nome do Serviço
              </label>
              <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Corte Degrade"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-neon-yellow transition-colors font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 block">
                Preço (R$)
              </label>
              <input
                type="number"
                value={formData.priceValue || ''}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setFormData({ ...formData, priceValue: isNaN(val) ? 0 : val });
                }}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-neon-yellow transition-colors font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 block">
                Duração (Min)
              </label>
              <div className="relative">
                <Clock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                />
                <input
                  type="number"
                  step={5}
                  value={formData.duration || ''}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setFormData({ ...formData, duration: isNaN(val) ? 0 : val });
                  }}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg pl-9 pr-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-neon-yellow transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 block">
                Categoria
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-neon-yellow appearance-none cursor-pointer transition-colors"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none"
                  size={16}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 block">
                Tag (Opcional)
              </label>
              <input
                value={formData.tag || ''}
                onChange={e => setFormData({ ...formData, tag: e.target.value })}
                placeholder="Ex: Premium"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-neon-yellow transition-colors text-xs"
              />
            </div>
          </div>

          {/* Description & AI */}
          <div>
            <div className="flex justify-between items-end mb-1.5">
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block">
                Descrição do Serviço
              </label>
              <button
                onClick={handleGenerateDescription}
                disabled={isGeneratingDesc || !formData.name}
                className="flex items-center gap-1.5 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-1 rounded hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
              >
                {isGeneratingDesc ? (
                  <Search size={10} className="animate-spin" />
                ) : (
                  <Sparkles size={10} />
                )}
                {isGeneratingDesc ? 'Gerando...' : 'Gerar com IA'}
              </button>
            </div>
            <textarea
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-neon-yellow transition-colors text-sm leading-relaxed min-h-[100px] resize-none"
              placeholder="Descreva o serviço..."
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col gap-3 transition-colors duration-300">
          {/* NEW: Badge Creator Trigger */}
          <button
            type="button"
            onClick={onOpenPromoStudio}
            className="w-full py-4 rounded-xl bg-[var(--bg-primary)] border border-purple-500/30 text-[var(--text-primary)] font-bold uppercase text-xs tracking-widest hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors"></div>
            <div className="bg-purple-500/20 p-2 rounded-lg group-hover:bg-purple-500 group-hover:text-black transition-colors relative z-10">
              <Sparkles size={18} />
            </div>
            <span className="relative z-10 group-hover:text-purple-300 transition-colors">
              Configurar Badge Promocional
            </span>
          </button>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] font-bold uppercase text-xs tracking-widest hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="flex-[2] py-3 rounded-xl bg-neon-yellow text-black font-black uppercase text-xs tracking-widest hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} /> Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
