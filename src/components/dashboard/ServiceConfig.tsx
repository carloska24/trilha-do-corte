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
import { PromotionsManager } from './PromotionsManager';
import { NewServiceIcon } from '../icons/NewServiceIcon';
import { ServiceFormModal } from './ServiceFormModal';
import { ServiceCard } from '../ui/ServiceCard';
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

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja remover este serviço?')) {
      const updated = services.filter(s => s.id !== id);
      onUpdateServices(updated);

      // Backend call...
      import('../../services/api').then(({ api }) => {
        api.deleteService(id);
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-[fadeIn_0.3s_ease-out] pb-24 px-4 md:px-8">
      {/* HEADER WITH TABS */}
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-graffiti text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-200 dark:to-gray-500 leading-none drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              CATÁLOGO
            </h2>
            <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-neon-yellow rounded-full shadow-[0_0_10px_rgba(227,253,0,0.5)]"></div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-3 ml-1">
              Gerencie seus serviços e preços
            </p>
          </div>

          <div className="flex p-1 bg-[#111] border border-gray-800 rounded-xl">
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === 'services'
                  ? 'bg-gray-800 text-white shadow-lg'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              Oficina
            </button>
            <button
              onClick={() => setActiveTab('marketing')}
              className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === 'marketing'
                  ? 'bg-neon-yellow text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              Marketing
            </button>
          </div>
        </div>

        {/* Action Buttons (Only for Services Tab) */}
        {activeTab === 'services' && (
          <div className="flex justify-end gap-4">
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
        )}
      </div>

      {/* CATEGORY SECTIONS */}
      {activeTab === 'marketing' ? (
        <PromotionsManager services={services} />
      ) : (
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
    </div>
  );
};
