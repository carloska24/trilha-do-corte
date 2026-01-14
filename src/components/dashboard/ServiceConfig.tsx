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
} from 'lucide-react';
import { generateId } from '../../utils';
import { generatePromoPhrase, generateServiceDescription } from '../../services/geminiService';
import { PromoStudio } from './PromoStudio';
import { PromotionsManager } from './PromotionsManager';
import { NewServiceIcon } from '../icons/NewServiceIcon';
import { CatalogIcon } from '../icons/CatalogIcon';
import { WorkshopIcon } from '../icons/WorkshopIcon';
import { MarketingIcon } from '../icons/MarketingIcon';
import { ServiceFormModal } from './ServiceFormModal';
import { ServiceCard } from '../ui/ServiceCard';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const CATEGORIES = ['Cabelo', 'Barba', 'Combo', 'Química', 'Estética', 'Outros'];

export const ServiceConfig: React.FC = () => {
  const { currentUser } = useAuth();
  const { services, updateServices, updateProfile } = useData();

  const barberProfile = currentUser as BarberProfile;
  const onUpdateProfile = updateProfile;
  const onUpdateServices = updateServices;

  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'services' | 'marketing'>('services');

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

  const [isPromoStudioOpen, setIsPromoStudioOpen] = useState(false);

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

  const handleSave = (data: Partial<Service>) => {
    if (!data.name || !data.priceValue) {
      alert('Nome e Preço são obrigatórios!');
      return;
    }

    const priceNum = Number(data.priceValue);
    const newService: Service = {
      id: editingServiceId || generateId(),
      name: data.name!,
      price: `R$ ${priceNum.toFixed(2).replace('.', ',')}`,
      priceValue: priceNum,
      duration: data.duration || 30,
      category: data.category || 'Outros',
      description: data.description || '',
      image:
        data.image ||
        'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=400&auto=format&fit=crop',
      featured: data.featured || false,
      tag: data.tag,
      discountPercentage: data.discountPercentage || 0,
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

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    setConfirmModal({
      isOpen: true,
      title: 'Remover Serviço',
      message: 'Tem certeza que deseja remover este serviço? Esta ação não pode ser desfeita.',
      onConfirm: async () => {
        // Optimistic Update
        const updated = services.filter(s => s.id !== id);
        onUpdateServices(updated);

        // Backend Call
        try {
          const { api } = await import('../../services/api');
          await api.deleteService(id);
        } catch (error) {
          console.error('Failed to delete service:', error);
          alert('Erro ao excluir do servidor.');
        }
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto animate-[fadeIn_0.3s_ease-out] pb-24 px-4 md:px-8 pt-4">
      {/* HEADER PREMIUM */}
      <div className="flex flex-col gap-6 mb-10">
        {/* Title + Tabs Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Title Section */}
          <div className="relative">
            <div className="flex items-center gap-4">
              <CatalogIcon size={48} />
              <div>
                <h2 className="text-3xl md:text-4xl font-graffiti text-white leading-none drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                  CATÁLOGO
                </h2>
                <p className="text-yellow-500/80 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
                  Gerencie serviços e preços
                </p>
              </div>
            </div>
          </div>

          {/* Tab Switcher Premium */}
          <div className="flex p-1.5 bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border border-white/10 rounded-2xl shadow-xl">
            <button
              onClick={() => setActiveTab('services')}
              className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'services'
                  ? 'bg-gradient-to-b from-white/15 to-white/5 text-white shadow-lg border border-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <WorkshopIcon size={22} />
              <span>Oficina</span>
              {activeTab === 'services' && (
                <div className="absolute bottom-0 inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('marketing')}
              className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'marketing'
                  ? 'bg-gradient-to-b from-yellow-500/20 to-orange-500/10 text-yellow-400 shadow-lg border border-yellow-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MarketingIcon size={22} />
              <span>Marketing</span>
              {activeTab === 'marketing' && (
                <div className="absolute bottom-0 inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons (Only for Services Tab) */}
        {activeTab === 'services' && (
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsPromoStudioOpen(true)}
              className="group relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border border-purple-500/30 rounded-xl hover:border-purple-500/60 text-gray-300 hover:text-white transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Sparkles
                size={16}
                className="text-purple-400 group-hover:animate-pulse relative z-10"
              />
              <span className="text-xs font-bold uppercase tracking-wider relative z-10">
                Studio Promo
              </span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="group relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-xl font-bold uppercase text-xs tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Plus size={16} strokeWidth={3} className="relative z-10" />
              <span className="relative z-10">Novo Serviço</span>
            </button>
          </div>
        )}
      </div>

      {/* CATEGORY SECTIONS */}
      {activeTab === 'marketing' ? (
        <PromotionsManager services={services} />
      ) : (
        <div className="space-y-10">
          {CATEGORIES.map(category => {
            const catServices = servicesByCategory[category] || [];
            if (catServices.length === 0) return null;

            // Category icon based on name
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

            return (
              <div key={category} className="animate-fade-in-up">
                {/* Category Header Premium */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCategoryIcon(category)}</span>
                    <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                      {category}
                    </h3>
                  </div>

                  <div className="h-px flex-1 bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                      {catServices.length} {catServices.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {catServices.map(service => (
                    <div key={service.id} className="h-full">
                      <ServiceCard
                        service={service}
                        onClick={() => handleOpenEdit(service)}
                        actions={
                          <button
                            onClick={e => handleDelete(service.id, e)}
                            className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 backdrop-blur-sm transition-colors shadow-lg"
                            title="Remover Serviço"
                          >
                            <Trash2 size={16} />
                          </button>
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- ADD/EDIT MODAL --- */}
      <ServiceFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        serviceConfig={formData}
        onSubmit={handleSave}
        editingServiceId={editingServiceId}
        onOpenPromoStudio={() => {
          if (!editingServiceId) {
            alert('Salve o serviço primeiro para adicionar uma promoção!');
            return;
          }
          setIsAddModalOpen(false);
          setIsPromoStudioOpen(true);
        }}
      />

      {/* PROMO STUDIO SHEET - Using existing component */}
      {isPromoStudioOpen && (
        <PromoStudio
          isOpen={isPromoStudioOpen}
          onClose={() => setIsPromoStudioOpen(false)}
          services={services}
          initialServiceId={editingServiceId}
          onSavePromo={(serviceId, { badgeConfig, badges }) => {
            const updated = services.map(s =>
              s.id === serviceId ? { ...s, badgeConfig, badges } : s
            );
            onUpdateServices(updated);
            // Optionally save to backend here
          }}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={true}
      />
    </div>
  );
};
