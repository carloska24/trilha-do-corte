import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Image as ImageIcon, Check, Scissors } from 'lucide-react';
import { Combo, ServiceItem } from '../../types';
import { MOCK_COMBOS } from '../../constants';

interface PromotionsManagerProps {
  services: ServiceItem[];
}

export const PromotionsManager: React.FC<PromotionsManagerProps> = ({ services }) => {
  // Init from localStorage or fall back to Mocks
  const [combos, setCombos] = useState<Combo[]>(() => {
    const stored = localStorage.getItem('barberpro_combos');
    return stored ? JSON.parse(stored) : MOCK_COMBOS;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Partial<Combo>>({});

  // Theme Options
  const THEMES = [
    { id: 'tuxedo', label: 'Tuxedo (Roxo/Azul)', gradient: 'from-purple-600 to-blue-600' },
    { id: 'neon', label: 'Neon (Laranja/Vermelho)', gradient: 'from-neon-orange to-red-600' },
    {
      id: 'gold',
      label: 'Gold (Dourado/Preto)',
      gradient: 'from-yellow-600 via-yellow-700 to-black',
    },
    { id: 'classic', label: 'Classic (Azul/Roxo)', gradient: 'from-blue-600 to-purple-600' },
  ];

  const handleEdit = (combo?: Combo) => {
    if (combo) {
      setEditingCombo({ ...combo });
    } else {
      setEditingCombo({
        id: `combo-${Date.now()}`,
        title: '',
        subtitle: '',
        description: '',
        priceValue: 0,
        items: [],
        active: true,
        theme: 'tuxedo',
        badge: 'NOVO',
        image: '', // Reset image
      });
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editingCombo.title || !editingCombo.priceValue) return;

    let newCombos;
    if (combos.find(c => c.id === editingCombo.id)) {
      newCombos = combos.map(c => (c.id === editingCombo.id ? (editingCombo as Combo) : c));
    } else {
      newCombos = [...combos, editingCombo as Combo];
    }

    // SAVE TO STATE AND LOCAL STORAGE
    try {
      localStorage.setItem('barberpro_combos', JSON.stringify(newCombos));
      setCombos(newCombos);
      setIsEditing(false);
    } catch (error) {
      alert(
        '⚠️ Espaço Cheio! A imagem é muito pesada. O sistema tentou otimizar mas não foi possível salvar.'
      );
      console.error('LocalStorage Full:', error);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este combo?')) {
      const newCombos = combos.filter(c => c.id !== id);
      setCombos(newCombos);
      localStorage.setItem('barberpro_combos', JSON.stringify(newCombos));
    }
  };

  const toggleService = (serviceId: string) => {
    const currentItems = editingCombo.items || [];
    const exists = currentItems.find(i => i.serviceId === serviceId);

    let newItems;
    if (exists) {
      newItems = currentItems.filter(i => i.serviceId !== serviceId);
    } else {
      // Add new item
      const service = services.find(s => s.id === serviceId);
      newItems = [...currentItems, { serviceId, customLabel: service?.name }];
    }

    // Auto calculate price suggestion (sum of services)
    const suggestedPrice = newItems.reduce((acc, item) => {
      const s = services.find(serv => serv.id === item.serviceId);
      return acc + (s?.priceValue || 0);
    }, 0);

    setEditingCombo({ ...editingCombo, items: newItems, priceValue: suggestedPrice });
  };

  if (isEditing) {
    return (
      <div className="animate-[fadeIn_0.3s_ease-out]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">
            {editingCombo.id ? 'Editar Combo' : 'Criar Novo Combo'}
          </h2>
          <button
            onClick={() => setIsEditing(false)}
            className="w-full md:w-auto p-3 md:p-0 bg-transparent rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase font-bold text-xs flex justify-center border border-[var(--border-color)] hover:border-[var(--text-primary)] transition-all"
          >
            Cancelar
          </button>
        </div>

        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Image Upload with Compression */}
          <div className="flex justify-center">
            <div
              className="relative w-full h-48 rounded-xl bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border-color)] hover:border-neon-yellow flex flex-col items-center justify-center cursor-pointer overflow-hidden group transition-colors"
              onClick={() => document.getElementById('combo-image-upload')?.click()}
            >
              {editingCombo.image ? (
                <img src={editingCombo.image} className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImageIcon
                    className="text-gray-600 mb-2 group-hover:text-neon-yellow"
                    size={40}
                  />
                  <span className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest group-hover:text-[var(--text-primary)]">
                    Carregar Capa do Combo
                  </span>
                </>
              )}
              <input
                id="combo-image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = event => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 800;
                        const scaleSize = MAX_WIDTH / img.width;
                        canvas.width = MAX_WIDTH;
                        canvas.height = img.height * scaleSize;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                          setEditingCombo({ ...editingCombo, image: compressedDataUrl });
                        }
                      };
                      img.src = event.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                Nome do Combo
              </label>
              <input
                type="text"
                value={editingCombo.title}
                onChange={e => setEditingCombo({ ...editingCombo, title: e.target.value })}
                placeholder="Ex: Dia do Noivo"
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded text-[var(--text-primary)] focus:border-neon-yellow outline-none uppercase font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Subtítulo (Curto)
              </label>
              <input
                type="text"
                value={editingCombo.subtitle}
                onChange={e => setEditingCombo({ ...editingCombo, subtitle: e.target.value })}
                placeholder="Ex: Experiência Completa"
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded text-[var(--text-primary)] focus:border-neon-yellow outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Descrição Completa
            </label>
            <textarea
              value={editingCombo.description}
              onChange={e => setEditingCombo({ ...editingCombo, description: e.target.value })}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded text-[var(--text-primary)] focus:border-neon-yellow outline-none h-24 resize-none"
            />
          </div>

          {/* Service Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <Scissors size={12} /> Serviços Inclusos
            </label>
            {/* Selected Items List (Allows removing items not in the list) */}
            <div className="flex flex-wrap gap-2 mb-3 bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)]">
              {editingCombo.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-neon-yellow/10 border border-neon-yellow text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold uppercase transition-all hover:bg-neon-yellow/20"
                >
                  <Scissors size={10} className="text-neon-yellow" />
                  <span>{item.customLabel || 'Serviço'}</span>
                  <button
                    onClick={() => {
                      const newItems = editingCombo.items?.filter((_, i) => i !== idx);
                      // Optional: Recalculate price if matching service found.
                      // For simplicity, we just update items, user updates price manually.
                      setEditingCombo({ ...editingCombo, items: newItems });
                    }}
                    className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remover Serviço"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {(!editingCombo.items || editingCombo.items.length === 0) && (
                <span className="text-[var(--text-secondary)] text-[10px] italic flex items-center gap-2">
                  <Scissors size={12} /> Nenhum serviço adicionado. Selecione abaixo.
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {services.map(s => {
                const isSelected = editingCombo.items?.some(i => i.serviceId === s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleService(s.id)}
                    className={`p-3 rounded border cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-neon-yellow/10 border-neon-yellow text-[var(--text-primary)]'
                        : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase">{s.name}</span>
                    {isSelected && <Check size={14} className="text-neon-yellow" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Theme Picker */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              Tema Visual (Efeito)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {THEMES.map(theme => (
                <div
                  key={theme.id}
                  onClick={() => setEditingCombo({ ...editingCombo, theme: theme.id as any })}
                  className={`relative h-24 rounded-xl cursor-pointer overflow-hidden border-2 transition-all ${
                    editingCombo.theme === theme.id
                      ? 'border-white scale-105 shadow-xl'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-black uppercase text-white drop-shadow-md text-center px-1">
                      {theme.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                Preço Final
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                  R$
                </span>
                <input
                  type="number"
                  value={editingCombo.priceValue}
                  onChange={e =>
                    setEditingCombo({ ...editingCombo, priceValue: parseFloat(e.target.value) })
                  }
                  className="w-full bg-[#111] border border-gray-800 p-3 pl-10 rounded text-xl text-white font-black focus:border-neon-yellow outline-none"
                />
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Badge (Opcional)
              </label>
              <input
                type="text"
                value={editingCombo.badge || ''}
                onChange={e => setEditingCombo({ ...editingCombo, badge: e.target.value })}
                placeholder="Ex: PREMIUM"
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded text-[var(--text-primary)] focus:border-neon-yellow outline-none uppercase font-bold"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-neon-yellow text-black font-black uppercase py-4 rounded hover:bg-white transition-colors tracking-widest"
          >
            Salvar Combo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-3xl font-graffiti text-[var(--text-primary)] uppercase tracking-wider mb-2 leading-none">
            Central de Marketing
          </h2>
          <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-[0.2em]">
            Gerencie Combos e Ofertas Especiais
          </p>
        </div>
        <button
          onClick={() => handleEdit()}
          className="w-full md:w-auto bg-neon-yellow hover:bg-white text-black px-8 py-3 rounded-lg font-black uppercase text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_25px_rgba(234,179,8,0.5)]"
        >
          <Plus size={18} strokeWidth={3} /> Criar Novo Combo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {combos.map(combo => (
          <div
            key={combo.id}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden group hover:border-[var(--text-secondary)] transition-all hover:shadow-2xl hover:-translate-y-1 duration-300"
          >
            <div
              className={`h-40 relative bg-gradient-to-r ${
                THEMES.find(t => t.id === combo.theme)?.gradient || 'from-gray-800 to-black'
              }`}
            >
              {/* Image Preview */}
              {combo.image && (
                <img
                  src={combo.image}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay transition-opacity group-hover:opacity-80"
                />
              )}

              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

              {/* Top Badge */}
              {combo.badge && (
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-white/90 backdrop-blur text-black text-[10px] font-black uppercase px-3 py-1.5 rounded-md shadow-lg tracking-wider">
                    {combo.badge}
                  </span>
                </div>
              )}

              {/* Title Bottom */}
              <div className="absolute bottom-4 left-4 z-10 w-full pr-4">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight drop-shadow-md">
                  {combo.title}
                </h3>
                {combo.subtitle && (
                  <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">
                    {combo.subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="p-5">
              <p className="text-[var(--text-secondary)] text-xs mb-6 leading-relaxed line-clamp-2 min-h-[2.5em]">
                {combo.description || 'Sem descrição definida.'}
              </p>

              <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-4 mt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">
                    Valor Final
                  </span>
                  <span className="text-xl font-black text-[var(--text-primary)] tracking-tight">
                    R$ {combo.priceValue.toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(combo.id)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 border border-[var(--border-color)] hover:border-red-500/50 transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => handleEdit(combo)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--text-primary)] transition-all"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
