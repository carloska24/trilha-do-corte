import React, { useState, useRef } from 'react';
import { BarberProfile } from '../../types';
import {
  X,
  Camera,
  User,
  Phone,
  Mail,
  LogOut,
  Check,
  Sparkles,
  Crown,
  Shield,
  Edit3,
  Lock,
} from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
        updateProfile({
          name: updated.name,
          email: updated.email,
        });

        setSuccess('Perfil atualizado com sucesso!');
        setIsEditing(false);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-md overflow-hidden"
        >
          {/* Main Card - Glassmorphism */}
          <div className="relative bg-zinc-900/80 backdrop-blur-2xl border border-zinc-700/50 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Decorative Gradient Orbs */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700/80 hover:border-zinc-600 transition-all"
            >
              <X size={18} />
            </button>

            {/* Header with Avatar */}
            <div className="relative pt-8 pb-6 px-6">
              {/* Title */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Crown size={16} className="text-yellow-500" />
                  <h2 className="font-graffiti text-xl text-white tracking-wider">
                    PERFIL DO <span className="text-yellow-500">MAQUINISTA</span>
                  </h2>
                  <Crown size={16} className="text-yellow-500" />
                </div>
              </div>

              {/* Avatar Section - Premium Design */}
              <div className="flex flex-col items-center">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => !loading && profilePhotoInputRef.current?.click()}
                >
                  {/* Animated Ring */}
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 opacity-75 blur-sm animate-pulse" />

                  {/* Photo Container */}
                  <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-600 shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900">
                      <img
                        src={getOptimizedImageUrl(
                          barber.photoUrl || DEFAULT_BARBER_IMAGE,
                          300,
                          300
                        )}
                        alt="Perfil"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                    <Camera className="text-white" size={28} />
                  </div>

                  {/* Status Badge */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-zinc-900 flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
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

                {/* Choose Avatar Button */}
                <button
                  onClick={() => setShowAvatarSelector(true)}
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:border-purple-400/60 rounded-full text-xs font-bold text-purple-300 hover:text-purple-200 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                >
                  <Sparkles size={14} />
                  ESCOLHER AVATAR
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="px-6 pb-6">
              {/* Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-center text-xs font-bold"
                  >
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Check size={14} /> {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Profile Info Display */}
              {!isEditing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mb-6"
                >
                  <h3 className="text-2xl font-black text-white mb-1">{barber.name}</h3>
                  <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                    {barber.email}
                  </p>

                  {/* Status Badges */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-full text-[10px] font-bold text-yellow-500 uppercase tracking-wider">
                      <Shield size={10} />
                      Mestre
                    </span>
                    {barber.phone && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/60 border border-zinc-700/50 rounded-full text-[10px] font-medium text-zinc-400">
                        <Phone size={10} />
                        {barber.phone}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Edit Form */}
              {isEditing ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        size={16}
                      />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50 focus:shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        size={16}
                      />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50 focus:shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1">
                      Telefone
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        size={16}
                      />
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50 focus:shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  {/* Password Section */}
                  <div className="pt-2 border-t border-zinc-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Lock size={12} className="text-yellow-500" />
                      <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">
                        Alterar Senha
                      </span>
                    </div>

                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50 transition-all mb-2"
                      placeholder="Nova Senha (deixe vazio para manter)"
                    />

                    {formData.password && (
                      <motion.input
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        type="password"
                        value={formData.confirmPassword}
                        onChange={e =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50 transition-all"
                        placeholder="Confirme a Nova Senha"
                      />
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 rounded-xl font-bold text-xs uppercase tracking-wider border border-zinc-700 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-yellow-500/25 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Action Buttons */
                <div className="space-y-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-gradient-to-r from-zinc-800 to-zinc-800/80 hover:from-zinc-700 hover:to-zinc-700/80 text-white py-4 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest border border-zinc-700/50 hover:border-zinc-600 rounded-xl transition-all group"
                  >
                    <Edit3 size={16} className="text-yellow-500" />
                    Editar Informações
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full bg-red-500/5 hover:bg-red-500/15 text-red-500 hover:text-red-400 py-4 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all"
                  >
                    <LogOut size={16} />
                    Encerrar Turno (Logout)
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-zinc-900/80 py-3 px-6 text-center border-t border-zinc-800/50">
              <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-wider">
                Sistema Seguro • Trilha do Corte • ID: {barber.id.slice(0, 8)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ========== AVATAR SELECTOR MODAL - PREMIUM ========== */}
        <AnimatePresence>
          {showAvatarSelector && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-zinc-900/90 backdrop-blur-2xl border border-zinc-700/50 rounded-3xl overflow-hidden shadow-2xl"
              >
                {/* Header */}
                <div className="relative px-6 py-5 border-b border-zinc-800/50">
                  {/* Decorative Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10" />

                  <div className="relative flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Sparkles size={18} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-graffiti text-lg text-white tracking-wide">
                          ESCOLHER <span className="text-purple-400">AVATAR</span>
                        </h3>
                        <p className="text-[10px] text-zinc-500 tracking-wider">
                          Selecione seu personagem
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAvatarSelector(false)}
                      className="w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Avatar Grid */}
                <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                  <div className="grid grid-cols-4 gap-3">
                    {avatarList.map((url, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={async () => {
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
                        className="relative aspect-square rounded-2xl overflow-hidden border-2 border-zinc-700/50 hover:border-purple-500 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all duration-300 group bg-zinc-800"
                      >
                        <img
                          src={url}
                          alt={`Avatar ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={e => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        {/* Hover Glow Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {/* Selection Indicator */}
                        <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-purple-500 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all scale-0 group-hover:scale-100">
                          <Check size={12} className="text-white" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Footer Hint */}
                <div className="px-6 py-4 bg-zinc-900/80 border-t border-zinc-800/50 text-center">
                  <p className="text-[10px] text-zinc-500">Clique em um avatar para selecioná-lo</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
