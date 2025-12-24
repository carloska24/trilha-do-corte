import React, { useState, useRef, useEffect } from 'react';
import { BarberProfile, Service } from '../../types';
import {
  Settings,
  Plus,
  Save,
  Trash2,
  X,
  Sparkles,
  Camera,
  Upload,
  Clock,
  Search,
  Check,
  ChevronDown,
  LayoutGrid,
  Scissors,
} from 'lucide-react';
import { generateId } from '../../utils';
import { generatePromoPhrase, generateServiceDescription } from '../../services/geminiService';
import { PromoStudio } from './PromoStudio';
import { NewServiceIcon } from '../icons/NewServiceIcon';
import { StudioPromoIcon } from '../icons/StudioPromoIcon';

interface ServiceConfigProps {
  barberProfile: BarberProfile;
  onUpdateProfile: (profile: Partial<BarberProfile>) => void;
  services: Service[];
  onUpdateServices: (services: Service[]) => void;
}

const CATEGORIES = ['Cabelo', 'Barba', 'Combo', 'Química', 'Estética', 'Outros'];

export const ServiceConfig: React.FC<ServiceConfigProps> = ({
  barberProfile,
  onUpdateProfile,
  services,
  onUpdateServices,
}) => {
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State for the Form
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
  const [isPromoStudioOpen, setIsPromoStudioOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group services by category for display
  const servicesByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = services.filter(s => (s.category || 'Outros') === cat);
    return acc;
  }, {} as Record<string, Service[]>);

  // --- HANDLERS ---

  const handleOpenAdd = () => {
    setFormData({
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
    setEditingServiceId(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setFormData({ ...service });
    setEditingServiceId(service.id);
    setIsAddModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.priceValue) {
      alert('Nome e Preço são obrigatórios!');
      return;
    }

    const priceNum = Number(formData.priceValue);
    const newService: Service = {
      id: editingServiceId || generateId(),
      name: formData.name,
      price: `R$ ${priceNum.toFixed(2).replace('.', ',')}`,
      priceValue: priceNum,
      duration: formData.duration || 30,
      category: formData.category || 'Outros',
      description: formData.description || '',
      image:
        formData.image ||
        'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=400&auto=format&fit=crop',
      featured: formData.featured,
      tag: formData.tag,
      discountPercentage: formData.discountPercentage,
      // Maintain promo if editing
      activePromo: editingServiceId
        ? services.find(s => s.id === editingServiceId)?.activePromo
        : undefined,
    };

    let updatedServices;
    if (editingServiceId) {
      updatedServices = services.map(s => (s.id === editingServiceId ? newService : s));
    } else {
      updatedServices = [...services, newService];
    }

    onUpdateServices(updatedServices);

    // Persist to Backend
    import('../../services/api').then(({ api }) => {
      if (editingServiceId) {
        api.updateService(editingServiceId, newService);
      } else {
        api.createService(newService).then(createdService => {
          if (createdService) {
            // Update the local list with the real ID from backend if needed
            const correctedList = updatedServices.map(s =>
              s.id === newService.id ? createdService : s
            );
            onUpdateServices(correctedList);
          }
        });
      }
    });

    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja remover este serviço?')) {
      const updated = services.filter(s => s.id !== id);
      onUpdateServices(updated);
      // Backend call...
    }
  };

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-[fadeIn_0.3s_ease-out] pb-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
        <div className="relative">
          <h2 className="text-4xl md:text-5xl font-graffiti text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-200 dark:to-gray-500 leading-none drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
            CATÁLOGO
          </h2>
          <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-neon-yellow rounded-full shadow-[0_0_10px_rgba(227,253,0,0.5)]"></div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-3 ml-1">
            Gerencie seus serviços e preços
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setIsPromoStudioOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg hover:border-purple-500 text-gray-300 hover:text-white transition-all group"
          >
            <Sparkles size={16} className="text-purple-500 group-hover:animate-spin-slow" />
            <span className="text-xs font-bold uppercase tracking-wider">Studio Promo</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-neon-yellow text-black rounded-lg hover:bg-yellow-400 font-bold uppercase text-xs tracking-wider shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all transform hover:scale-105"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Novo Serviço</span>
          </button>
        </div>
      </div>

      {/* CATEGORY SECTIONS */}
      <div className="space-y-12">
        {CATEGORIES.map(category => {
          const catServices = servicesByCategory[category] || [];
          if (catServices.length === 0) return null;

          return (
            <div key={category} className="animate-fade-in-up">
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                  {category}
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-800 to-transparent"></div>
                <span className="text-xs font-mono text-gray-500 bg-[#1a1a1a] px-2 py-1 rounded">
                  {catServices.length} ITEMS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {catServices.map(service => (
                  <div
                    key={service.id}
                    onClick={() => handleOpenEdit(service)}
                    className="group relative bg-[#151515] border border-gray-800 hover:border-neon-yellow rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:-translate-y-1"
                  >
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="flex p-4 gap-4 items-start relative z-10">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-lg bg-gray-900 overflow-hidden shrink-0 border border-gray-700 group-hover:border-neon-yellow transition-colors">
                        {service.image ? (
                          <img src={service.image} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <Scissors size={20} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold text-sm uppercase truncate pr-6 group-hover:text-neon-yellow transition-colors">
                          {service.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-neon-yellow font-mono font-bold text-sm">
                            R$ {service.priceValue.toFixed(2)}
                          </span>
                          <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                          <span className="text-gray-500 text-[10px] uppercase font-bold flex items-center gap-1">
                            <Clock size={10} /> {service.duration} min
                          </span>
                        </div>
                        <p className="text-gray-500 text-[10px] line-clamp-2 mt-2 leading-relaxed">
                          {service.description || 'Sem descrição.'}
                        </p>
                      </div>

                      {/* Floating Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={e => handleDelete(service.id, e)}
                          className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Service Tag */}
                    {service.tag && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-gray-800 rounded text-[9px] text-gray-300 font-bold uppercase tracking-wider">
                        {service.tag}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#111] w-full max-w-lg rounded-2xl border border-gray-800 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#151515]">
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-wider">
                  {editingServiceId ? 'Editar Serviço' : 'Novo Serviço'}
                </h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                  Preencha os detalhes do serviço
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              {/* Image Upload */}
              <div className="flex justify-center">
                <div
                  className="relative group w-full h-40 rounded-xl bg-black border-2 border-dashed border-gray-800 hover:border-neon-yellow transition-colors cursor-pointer overflow-hidden flex flex-col items-center justify-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.image ? (
                    <>
                      <img
                        src={formData.image}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                        <Camera className="text-white" size={32} />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload
                        className="text-gray-600 mb-2 group-hover:text-neon-yellow transition-colors"
                        size={32}
                      />
                      <span className="text-gray-600 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">
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
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
                    Nome do Serviço
                  </label>
                  <input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Corte Degrade"
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-yellow transition-colors font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    value={formData.priceValue}
                    onChange={e =>
                      setFormData({ ...formData, priceValue: parseFloat(e.target.value) })
                    }
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-yellow transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
                    Duração (Min)
                  </label>
                  <div className="relative">
                    <Clock
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      type="number"
                      step={5}
                      value={formData.duration}
                      onChange={e =>
                        setFormData({ ...formData, duration: parseInt(e.target.value) })
                      }
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg pl-9 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-yellow transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
                    Categoria
                  </label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-yellow appearance-none cursor-pointer"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                      size={16}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
                    Tag (Opcional)
                  </label>
                  <input
                    value={formData.tag || ''}
                    onChange={e => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="Ex: Premium"
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-yellow transition-colors text-xs"
                  />
                </div>
              </div>

              {/* Description & AI */}
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
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
                  className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-yellow transition-colors text-sm leading-relaxed min-h-[100px] resize-none"
                  placeholder="Descreva o serviço..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-800 bg-[#151515] flex flex-col gap-3">
              {/* NEW: Badge Creator Trigger */}
              <button
                type="button"
                onClick={() => {
                  if (!editingServiceId) {
                    alert('Salve o serviço primeiro para adicionar uma promoção!');
                    return;
                  }
                  setIsAddModalOpen(false);
                  setIsPromoStudioOpen(true);
                }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#1a1a1a] to-[#222] border border-purple-500/30 text-white font-bold uppercase text-xs tracking-widest hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
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
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 font-bold uppercase text-xs tracking-widest hover:border-white hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-[2] py-3 rounded-xl bg-neon-yellow text-black font-black uppercase text-xs tracking-widest hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} /> Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROMO STUDIO SHEET - Using existing component */}
      {isPromoStudioOpen && (
        <PromoStudio
          isOpen={isPromoStudioOpen}
          onClose={() => setIsPromoStudioOpen(false)}
          services={services}
          onSavePromo={(serviceId, { badgeConfig, badges }) => {
            const updated = services.map(s => (s.id === serviceId ? { ...s, badgeConfig, badges } : s));
            onUpdateServices(updated);
            // Optionally save to backend here
          }}
        />
      )}
    </div>
  );
};
