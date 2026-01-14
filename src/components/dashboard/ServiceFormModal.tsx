import React, { useState, useRef, useEffect } from 'react';
import { Service } from '../../types';
import {
  X,
  Camera,
  Upload,
  Clock,
  Sparkles,
  ChevronDown,
  Save,
  Scissors,
  DollarSign,
  Tag,
  FileText,
} from 'lucide-react';
import { generateServiceDescription } from '../../services/geminiService';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceConfig: Partial<Service>;
  onSubmit: (data: Partial<Service>) => void;
  onOpenPromoStudio: () => void;
  editingServiceId: string | null;
}

const CATEGORIES = ['Cabelo', 'Barba', 'Combo', 'Química', 'Estética', 'Outros'];

// Category icons
const getCategoryIcon = (cat: string) => {
  switch (cat) {
    case 'Cabelo':
      return '✂️';
    case 'Barba':
      return '🧔';
    case 'Combo':
      return '💎';
    case 'Química':
      return '🧪';
    case 'Estética':
      return '✨';
    default:
      return '📦';
  }
};

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  onClose,
  serviceConfig,
  onSubmit,
  onOpenPromoStudio,
  editingServiceId,
}) => {
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
      try {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container - Premium Design - Centered */}
      <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] w-full max-w-lg rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col max-h-[80vh] my-auto">
        {/* Decorative Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none" />

        {/* Modal Header - Premium */}
        <div className="relative px-6 py-5 border-b border-white/10 flex justify-between items-center bg-black/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Scissors size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-wide">
                {editingServiceId ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wider mt-0.5">
                Preencha os detalhes do serviço
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body - Premium Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          {/* Image Upload - Premium */}
          <div
            className="relative group w-full h-36 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] border-2 border-dashed border-white/20 hover:border-yellow-500/50 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            {formData.image ? (
              <>
                <img
                  src={formData.image}
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  alt="Preview"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 transition-opacity">
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="text-white" size={28} />
                    <span className="text-white/80 text-xs font-bold uppercase">Trocar Imagem</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center group-hover:from-yellow-500/20 group-hover:to-orange-500/20 transition-all">
                  <Upload
                    className="text-gray-400 group-hover:text-yellow-400 transition-colors"
                    size={24}
                  />
                </div>
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors">
                  Upload da Imagem
                </span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          {/* Name Field - Premium */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <Scissors size={12} className="text-cyan-500" />
              Nome do Serviço
            </label>
            <input
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Corte Degradê"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all font-bold"
            />
          </div>

          {/* Price & Duration Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <DollarSign size={12} className="text-green-500" />
                Preço (R$)
              </label>
              <input
                type="number"
                value={formData.priceValue || ''}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setFormData({ ...formData, priceValue: isNaN(val) ? 0 : val });
                }}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:bg-green-500/5 transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <Clock size={12} className="text-blue-500" />
                Duração (Min)
              </label>
              <input
                type="number"
                step={5}
                value={formData.duration || ''}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  setFormData({ ...formData, duration: isNaN(val) ? 0 : val });
                }}
                placeholder="30"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-mono"
              />
            </div>
          </div>

          {/* Category & Tag Row */}
          <div className="grid grid-cols-2 gap-3 items-start">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider h-4">
                <span className="text-xs leading-none">
                  {getCategoryIcon(formData.category || 'Outros')}
                </span>
                Categoria
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer transition-all pr-10"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c} className="bg-[#1a1a2e] text-white">
                      {getCategoryIcon(c)} {c}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  size={16}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider h-4">
                <Tag size={12} className="text-amber-500" />
                Tag (Opcional)
              </label>
              <input
                value={formData.tag || ''}
                onChange={e => setFormData({ ...formData, tag: e.target.value })}
                placeholder="Ex: Premium"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:bg-amber-500/5 transition-all text-sm"
              />
            </div>
          </div>

          {/* Description with AI - Premium */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <FileText size={12} className="text-indigo-500" />
                Descrição do Serviço
              </label>
              <button
                onClick={handleGenerateDescription}
                disabled={isGeneratingDesc || !formData.name}
                className="group flex items-center gap-1.5 text-[10px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
              >
                <Sparkles
                  size={12}
                  className={isGeneratingDesc ? 'animate-spin' : 'group-hover:animate-pulse'}
                />
                {isGeneratingDesc ? 'Gerando...' : 'Gerar com IA'}
              </button>
            </div>
            <textarea
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all text-sm leading-relaxed min-h-[90px] resize-none"
              placeholder="Descreva o serviço..."
            />
          </div>
        </div>

        {/* Modal Footer - Premium */}
        <div className="relative px-6 py-5 border-t border-white/10 bg-black/30 flex flex-col gap-3">
          {/* Badge Creator Trigger - Premium */}
          <button
            type="button"
            onClick={onOpenPromoStudio}
            className="group w-full py-3.5 rounded-xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-purple-500/30 text-white font-bold uppercase text-xs tracking-wider hover:border-purple-500/60 hover:from-purple-500/10 hover:to-purple-500/5 transition-all flex items-center justify-center gap-3 overflow-hidden"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="group-hover:text-purple-300 transition-colors">
              Configurar Badge Promocional
            </span>
          </button>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-bold uppercase text-xs tracking-wider hover:bg-white/10 hover:text-white hover:border-white/20 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black uppercase text-xs tracking-wider hover:from-yellow-400 hover:to-orange-400 hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} /> Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
