import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Save,
  User,
  Phone,
  Scissors,
  Calendar,
  FileText,
  Check,
  Grid,
} from 'lucide-react';
import { ClientProfile } from '../../types';
import { AVATAR_PACK } from '../../constants';

interface ClientProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientProfile;
  onSave: (updatedProfile: Partial<ClientProfile>) => void;
}

export const ClientProfileSettings: React.FC<ClientProfileSettingsProps> = ({
  isOpen,
  onClose,
  client,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'style'>('personal');

  // Sync state with props when opening
  React.useEffect(() => {
    if (isOpen) {
      setName(client.name);
      setPhone(client.phone);
      setPhotoUrl(client.photoUrl);
      setCutFrequency(client.preferences?.cutFrequency || 'monthly');
      setBeardPreference(client.preferences?.beardPreference || 'clean');
      setFavoriteStyle(client.preferences?.favoriteStyle || '');
      setNotes(client.preferences?.notes || '');
    }
  }, [isOpen, client]);

  // Personal State
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone);
  const [photoUrl, setPhotoUrl] = useState(client.photoUrl);

  // Style State
  const [cutFrequency, setCutFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>(
    client.preferences?.cutFrequency || 'monthly'
  );
  const [beardPreference, setBeardPreference] = useState<'clean' | 'stubble' | 'full'>(
    client.preferences?.beardPreference || 'clean'
  );
  const [favoriteStyle, setFavoriteStyle] = useState(client.preferences?.favoriteStyle || '');
  const [notes, setNotes] = useState(client.preferences?.notes || '');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [avatarList, setAvatarList] = useState<string[]>(AVATAR_PACK);

  // Fetch dynamic avatars from server
  React.useEffect(() => {
    if (showAvatarSelector) {
      fetch('/api/avatars')
        .then(res => res.json())
        .then(data => {
          if (data.avatars && data.avatars.length > 0) {
            setAvatarList(data.avatars);
          }
        })
        .catch(err => console.error('Failed to load local avatars:', err));
    }
  }, [showAvatarSelector]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize to max 500px dimension to save space
          const MAX_SIZE = 500;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setPhotoUrl(dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({
      name,
      phone,
      photoUrl,
      preferences: {
        cutFrequency,
        favoriteStyle, // In a real app this might be an array or more complex object
        beardPreference,
        notes,
      },
    });
    onClose();
  };

  const STYLE_TAGS = [
    'Degradê (Fade)',
    'Social',
    'Militar',
    'Mullet',
    'Low Fade',
    'Mid Fade',
    'High Fade',
    'Tesoura',
    'Navalhado',
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-[#111] to-[#050505] w-full max-w-2xl rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-yellow/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-blue/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#111]/80 backdrop-blur-sm shrink-0 relative z-10">
          <h2 className="text-white font-graffiti text-2xl uppercase tracking-wide drop-shadow-lg">
            Configurar <span className="text-neon-yellow">Conta</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:rotate-90 transition-all duration-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 bg-[#0a0a0a]/50 shrink-0 relative z-10">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 relative overflow-hidden group
              ${
                activeTab === 'personal'
                  ? 'text-neon-yellow drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            <div
              className={`absolute bottom-0 left-0 w-full h-0.5 bg-neon-yellow shadow-[0_0_10px_#EAB308] transition-transform duration-300 ${
                activeTab === 'personal' ? 'scale-x-100' : 'scale-x-0'
              }`}
            ></div>
            <User
              size={16}
              className={
                activeTab === 'personal' ? 'drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]' : ''
              }
            />
            IDENTIDADE
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`flex-1 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 relative overflow-hidden group
              ${
                activeTab === 'style'
                  ? 'text-neon-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            <div
              className={`absolute bottom-0 left-0 w-full h-0.5 bg-neon-cyan shadow-[0_0_10px_#06b6d4] transition-transform duration-300 ${
                activeTab === 'style' ? 'scale-x-100' : 'scale-x-0'
              }`}
            ></div>
            <Scissors
              size={16}
              className={activeTab === 'style' ? 'drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : ''}
            />
            MEU ESTILO
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar relative z-10">
          {/* TAB: PERSONAL */}
          {activeTab === 'personal' && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="flex flex-col items-center gap-4">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-36 h-36 rounded-full bg-linear-to-tr from-gray-800 to-black p-[2px] group-hover:from-neon-yellow group-hover:to-orange-500 transition-all duration-500 shadow-2xl">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#151515] relative">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#111]">
                          <User
                            size={48}
                            className="text-gray-600 group-hover:text-white transition-colors"
                          />
                        </div>
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Camera className="text-white drop-shadow-md" size={24} />
                      </div>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </div>

                <div className="flex flex-col gap-2 items-center">
                  <p className="text-gray-500 text-[10px] font-mono tracking-widest uppercase">
                    Toque para atualizar foto
                  </p>
                  <button
                    onClick={() => setShowAvatarSelector(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] border border-white/10 hover:border-neon-cyan/50 rounded-lg text-xs font-bold text-gray-300 hover:text-neon-cyan transition-all group"
                  >
                    <Grid size={14} className="group-hover:text-neon-cyan" />
                    ESCOLHER AVATAR GAME
                  </button>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-5 max-w-sm mx-auto w-full">
                <div className="group">
                  <label className="text-[10px] font-black text-gray-500 group-focus-within:text-neon-yellow uppercase tracking-widest block mb-2 transition-colors">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-3.5 text-gray-600 group-focus-within:text-neon-yellow transition-colors"
                      size={16}
                    />
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white text-sm focus:border-neon-yellow/50 focus:bg-[#111] focus:shadow-[0_0_15px_rgba(234,179,8,0.1)] outline-none uppercase font-bold transition-all placeholder:text-gray-700"
                      placeholder="SEU NOME"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-gray-500 group-focus-within:text-neon-yellow uppercase tracking-widest block mb-2 transition-colors">
                    Telefone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-3.5 text-gray-600 group-focus-within:text-neon-yellow transition-colors"
                      size={16}
                    />
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white text-sm focus:border-neon-yellow/50 focus:bg-[#111] focus:shadow-[0_0_15px_rgba(234,179,8,0.1)] outline-none font-mono transition-all placeholder:text-gray-700"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STYLE */}
          {activeTab === 'style' && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Frequency */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4 flex items-center gap-2">
                  <Calendar size={12} className="text-neon-cyan" /> Frequência de Corte
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['weekly', 'biweekly', 'monthly'] as const).map(freq => (
                    <button
                      key={freq}
                      onClick={() => setCutFrequency(freq)}
                      className={`py-4 px-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-300 relative overflow-hidden group
                        ${
                          cutFrequency === freq
                            ? 'bg-neon-yellow/10 border-neon-yellow shadow-[0_0_20px_rgba(234,179,8,0.2)] text-white'
                            : 'bg-[#0a0a0a] border-white/5 text-gray-500 hover:border-white/20 hover:bg-white/5'
                        }`}
                    >
                      <span
                        className={`text-[11px] font-black uppercase tracking-wider ${
                          cutFrequency === freq ? 'text-neon-yellow' : 'text-gray-400'
                        }`}
                      >
                        {freq === 'weekly'
                          ? 'Semanal'
                          : freq === 'biweekly'
                          ? 'Quinzenal'
                          : 'Mensal'}
                      </span>
                      {cutFrequency === freq && (
                        <div className="absolute inset-0 bg-gradient-to-t from-neon-yellow/20 to-transparent opacity-50"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Tags */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4 flex items-center gap-2">
                  <Scissors size={12} className="text-neon-cyan" /> Estilo Preferido
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {STYLE_TAGS.map(style => (
                    <button
                      key={style}
                      onClick={() => setFavoriteStyle(style)}
                      className={`px-4 py-2 rounded-full text-xs font-bold border transition-all duration-300
                        ${
                          favoriteStyle === style
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] scale-105'
                            : 'bg-[#0a0a0a] border-white/10 text-gray-500 hover:border-cyan-500/50 hover:text-cyan-100 hover:shadow-[0_0_10px_rgba(34,211,238,0.1)]'
                        }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Beard Preference */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4">
                  Preferência de Barba
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'clean', label: 'Lisa / Feita', icon: '✨' },
                    { id: 'stubble', label: 'Rala / Desenhada', icon: '📐' },
                    { id: 'full', label: 'Cheia / Lenhador', icon: '🧔🏻' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setBeardPreference(opt.id as any)}
                      className={`py-4 px-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-300
                        ${
                          beardPreference === opt.id
                            ? 'bg-neon-orange/10 border-neon-orange text-white shadow-[0_0_20px_rgba(249,115,22,0.2)]'
                            : 'bg-[#0a0a0a] border-white/5 text-gray-500 hover:border-white/20 hover:bg-white/5'
                        }`}
                    >
                      <span className="text-lg mb-1 filter drop-shadow-md">{opt.icon}</span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider ${
                          beardPreference === opt.id ? 'text-neon-orange' : 'text-gray-400'
                        }`}
                      >
                        {opt.label.split(' / ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="group">
                <label className="text-[10px] font-black text-gray-500 group-focus-within:text-neon-yellow uppercase tracking-widest block mb-2 flex items-center gap-2 transition-colors">
                  <FileText size={12} /> Observações ("O de sempre")
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white text-sm focus:border-neon-yellow/50 focus:shadow-[0_0_15px_rgba(234,179,8,0.1)] outline-none font-mono min-h-[100px] resize-none transition-all placeholder:text-gray-700 scrollbar-thin scrollbar-thumb-gray-800"
                  placeholder="Ex: Não tirar muito em cima, pezinho quadrado, degradê baixinho..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-[#111]/90 backdrop-blur-md shrink-0 relative z-10">
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-neon-yellow to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-black uppercase tracking-[0.15em] py-4 rounded-xl flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)]"
          >
            <Check size={24} strokeWidth={3} /> SALVAR ALTERAÇÕES
          </button>
        </div>
      </div>

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-neon-yellow font-graffiti text-xl uppercase tracking-wider mobile-glitch">
                Escolher Avatar <span className="text-white">Game</span>
              </h3>
              <button
                onClick={() => setShowAvatarSelector(false)}
                className="text-gray-400 hover:text-white p-2"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 overflow-y-auto custom-scrollbar p-1 flex-1 min-h-0">
              {avatarList.map((url, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setPhotoUrl(url); // Use the relative URL directly
                    setShowAvatarSelector(false);
                  }}
                  className="relative aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-neon-cyan hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all group bg-black"
                >
                  <img
                    src={url}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={e => {
                      // Fallback if local image fails
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-neon-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            <p className="text-center text-gray-500 text-[10px] mt-4 uppercase tracking-widest shrink-0">
              Toque para selecionar
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
