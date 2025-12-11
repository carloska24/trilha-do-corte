import React, { useState, useRef } from 'react';
import { X, Camera, Save, User, Phone } from 'lucide-react';
import { ClientProfile } from '../../types';

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
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone);
  const [photoUrl, setPhotoUrl] = useState(client.photoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({ name, phone, photoUrl });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1a1a1a] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#111]">
          <h2 className="text-white font-graffiti text-xl uppercase tracking-wide">
            Editar <span className="text-neon-yellow">Perfil</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Photo Upload */}
          <div className="flex justify-center">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-24 h-24 rounded-full bg-black border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden group-hover:border-neon-yellow transition-colors">
                {photoUrl ? (
                  <img src={photoUrl} className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-gray-600" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-neon-yellow text-black flex items-center justify-center border-2 border-[#1a1a1a]">
                <Camera size={14} />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-500" size={16} />
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-neon-yellow outline-none uppercase font-bold"
                  placeholder="SEU NOME"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-500" size={16} />
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-neon-yellow outline-none font-mono"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-neon-yellow hover:bg-yellow-400 text-black font-black uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Save size={18} /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};
