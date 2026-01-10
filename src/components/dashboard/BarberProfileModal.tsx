import React, { useState, useRef } from 'react';
import { BarberProfile } from '../../types';
import { X, Camera, Save, Lock, User, Phone, Mail, LogOut, Check } from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface BarberProfileModalProps {
  barber: BarberProfile;
  onClose: () => void;
}

const DEFAULT_BARBER_IMAGE =
  'https://images.unsplash.com/photo-1618077553780-75539862f629?q=80&w=400&auto=format&fit=crop';

export const BarberProfileModal: React.FC<BarberProfileModalProps> = ({ barber, onClose }) => {
  const { updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: barber.name,
    email: barber.email,
    phone: barber.phone || '',
    password: '',
    confirmPassword: '',
  });

  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [avatarList, setAvatarList] = useState<string[]>([]);

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

  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        const url = await api.uploadImage(file);
        if (url) {
          await api.updateBarber(barber.id, { img: url });
          updateProfile({ photoUrl: url });
          setSuccess('Foto atualizada!');
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        console.error(err);
        setError('Erro ao enviar imagem.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    // Validations
    if (!formData.name.trim()) return setError('Nome é obrigatório');
    if (!formData.email.trim()) return setError('Email é obrigatório');

    if (formData.password) {
      if (formData.password.length < 6) return setError('Senha deve ter no mínimo 6 caracteres');
      if (formData.password !== formData.confirmPassword) return setError('As senhas não conferem');
    }

    setLoading(true);
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const updated = await api.updateBarber(barber.id, payload);

      if (updated) {
        // Update local context manually or re-fetch
        // Since updateProfile only takes Partial<User>, we can assume it merges
        updateProfile({
          name: updated.name,
          email: updated.email,
          // phone might not be in User interface for context, so we trust api update for DB
        });

        setSuccess('Perfil atualizado com sucesso!');
        setIsEditing(false);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); // Clear passwords
      } else {
        setError('Erro ao atualizar perfil.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao conectar com servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-md rounded-xl shadow-2xl relative flex flex-col overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="bg-[var(--bg-secondary)] p-4 border-b border-[var(--border-color)] flex justify-between items-center transition-colors">
          <h3 className="font-graffiti text-xl text-[var(--text-primary)] tracking-wide">
            PERFIL DO <span className="text-[#FFD700]">MAQUINISTA</span>
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto max-h-[80vh] scrollbar-hide">
          {/* Photo Section */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="relative group cursor-pointer w-32 h-32"
              onClick={() => !loading && profilePhotoInputRef.current?.click()}
            >
              <div className="w-32 h-32 rounded-full border-4 border-[#FFD700] p-1 bg-[var(--bg-primary)] shadow-[0_0_20px_rgba(255,215,0,0.3)] overflow-hidden transition-colors">
                <img
                  src={getOptimizedImageUrl(barber.photoUrl || DEFAULT_BARBER_IMAGE, 300, 300)}
                  alt="Perfil"
                  className="w-full h-full object-cover filter contrast-110"
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
              <input
                type="file"
                ref={profilePhotoInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-2 items-center mt-4">
              <button
                onClick={() => setShowAvatarSelector(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[#FFD700]/50 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:text-[#FFD700] transition-all group"
              >
                <User size={14} className="group-hover:text-[#FFD700]" />
                ESCOLHER AVATAR
              </button>
            </div>

            {!isEditing && (
              <div className="mt-4 text-center animate-fade-in-up">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">{barber.name}</h2>
                <p className="text-[var(--text-secondary)] font-mono text-xs uppercase tracking-widest mt-1">
                  {barber.email}
                </p>
                <div className="flex justify-center gap-2 mt-3">
                  <span className="bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)] px-3 py-1 rounded-full border border-[var(--border-color)]">
                    Nível: Mestre
                  </span>
                  {barber.phone && (
                    <span className="bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)] px-3 py-1 rounded-full border border-[var(--border-color)]">
                      {barber.phone}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 bg-red-900/20 border border-red-900/50 text-red-400 p-3 rounded text-center text-xs font-bold">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-900/20 border border-green-900/50 text-green-400 p-3 rounded text-center text-xs font-bold flex items-center justify-center gap-2">
              <Check size={14} /> {success}
            </div>
          )}

          {/* Form / Actions */}
          {isEditing ? (
            <div className="space-y-4 animate-fade-in-up">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-[var(--text-secondary)]" size={16} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#FFD700] transition-colors placeholder-[var(--text-secondary)]/50"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-[var(--text-secondary)]" size={16} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#FFD700] transition-colors placeholder-[var(--text-secondary)]/50"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">
                  Telefone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-[var(--text-secondary)]" size={16} />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#FFD700] transition-colors placeholder-[var(--text-secondary)]/50"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="border-t border-[var(--border-color)] my-4"></div>

              {/* Password Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#FFD700] uppercase tracking-widest flex items-center gap-2">
                  <Lock size={12} /> Alterar Senha
                </h4>

                <div className="space-y-1">
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#FFD700] transition-colors placeholder-[var(--text-secondary)]/50"
                    placeholder="Nova Senha (deixe vazio para manter)"
                  />
                </div>

                {formData.password && (
                  <div className="space-y-1 animate-fadeIn">
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#FFD700] transition-colors placeholder-[var(--text-secondary)]/50"
                      placeholder="Confirme a Nova Senha"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] py-3 rounded-lg font-bold text-xs uppercase tracking-wider border border-[var(--border-color)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-[#FFD700] hover:bg-[#E6C200] text-black py-3 rounded-lg font-bold text-xs uppercase tracking-wider shadow-lg shadow-yellow-500/20 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] py-4 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest border border-[var(--border-color)] transition-colors shadow-lg group"
              >
                <User
                  size={16}
                  className="text-[var(--text-secondary)] group-hover:text-[#FFD700] transition-colors"
                />
                Editar Informações
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="w-full bg-red-900/10 hover:bg-red-900/30 text-red-500 hover:text-red-400 py-4 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest border border-red-900/20 transition-colors"
              >
                <LogOut size={16} /> Encerrar Turno (Logout)
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[var(--bg-primary)] p-3 text-center border-t border-[var(--border-color)] transition-colors">
          <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase">
            Sistema Seguro &bull; Trilha do Corte ID: {barber.id.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-[#FFD700] font-graffiti text-xl uppercase tracking-wider">
                Escolher Avatar
              </h3>
              <button
                onClick={() => setShowAvatarSelector(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 overflow-y-auto custom-scrollbar p-1 flex-1 min-h-0">
              {avatarList.map((url, index) => (
                <button
                  key={index}
                  onClick={async () => {
                    // Update barber photo
                    try {
                      setLoading(true);
                      await api.updateBarber(barber.id, { img: url });
                      updateProfile({ photoUrl: url });
                      setSuccess('Avatar atualizado!');
                      setTimeout(() => setSuccess(''), 3000);
                      setShowAvatarSelector(false);
                    } catch (err) {
                      console.error(err);
                      setError('Erro ao atualizar avatar.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border-color)] hover:border-[#FFD700] hover:shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all group bg-[var(--bg-secondary)]"
                >
                  <img
                    src={url}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
