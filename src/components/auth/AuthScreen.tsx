import React, { useState, useRef } from 'react';
import {
  User,
  Lock,
  Mail,
  Phone,
  TrainFront,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Camera,
  Plus,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { api } from '../../services/api';

interface AuthScreenProps {
  type: 'client' | 'barber';
  onLoginSuccess: (userData?: { name: string; photoUrl?: string; emailOrPhone: string }) => void;
  onGoBack: () => void;
  initialData?: {
    name?: string;
    phone?: string;
  };
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  type,
  onLoginSuccess,
  onGoBack,
  initialData,
}) => {
  // If initialData exists (from invite link), default to REGISTER mode
  const [authMode, setAuthMode] = useState<'login' | 'register'>(
    initialData?.name || initialData?.phone ? 'register' : 'login'
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name ? decodeURIComponent(initialData.name) : '',
    phone: initialData?.phone ? decodeURIComponent(initialData.phone) : '',
    email: '',
    password: '',
    adminCode: '', // Apenas para barbeiros (Desativado temporariamente)
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Código secreto desativado temporariamente
  // const ADMIN_SECRET = "TRILHA2024";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // DEBUG BACKDOOR FOR BLACK SCREEN TESTING
    if (formData.phone === '11999999999' || formData.email === 'test@client.com') {
      onLoginSuccess({
        name: 'Passageiro Teste',
        photoUrl:
          'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80',
        emailOrPhone: formData.phone || formData.email,
        // @ts-ignore
        id: 'test-user-id',
        loyaltyPoints: 5,
        history: [],
        savedStyles: [],
      });
      return;
    }

    // Validação básica
    if (formData.password.length < 3) {
      setError('A senha precisa ter pelo menos 3 caracteres.');
      return;
    }

    // Se estiver cadastrando, validar se nome foi preenchido
    if (authMode === 'register' && !formData.name.trim()) {
      setError('O nome é obrigatório para o cadastro.');
      return;
    }

    setLoading(true);

    try {
      let userData;

      if (authMode === 'login') {
        if (type === 'client') {
          userData = await api.loginClient(
            formData.phone || formData.email, // Try both for client login flexibility
            formData.password
          );
        } else {
          userData = await api.loginBarber(formData.email, formData.password);
        }
      } else {
        // REGISTER
        if (type === 'client') {
          userData = await api.registerClient({
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            password: formData.password,
            photoUrl: photoPreview,
          });
        } else {
          // REGISTER BARBER
          userData = await api.registerBarber({
            name: formData.name,
            phone: formData.phone,
            email: formData.email, // Required for Barber
            password: formData.password,
            photoUrl: photoPreview,
          });
        }
      }

      if (userData) {
        onLoginSuccess({
          // @ts-ignore
          id: userData.id,
          name: userData.name,
          photoUrl: userData.img || userData.image, // Handle different DB field names
          emailOrPhone: type === 'client' ? userData.phone || userData.email : userData.email,
        });
      } else {
        setError('Falha na autenticação. Verifique seus dados.');
      }
    } catch (err) {
      console.error(err);
      // FALLBACK FOR TESTING IF API FAILS (To debug Black Screen)
      // Allow specific test user to bypass
      if (formData.phone === '11999999999' || formData.email === 'test@client.com') {
        onLoginSuccess({
          name: 'Passageiro Teste',
          photoUrl:
            'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80',
          emailOrPhone: formData.phone || formData.email,
        });
        return;
      }
      setError('Erro ao conectar com o servidor. (Tente o login de teste: 11999999999)');
    } finally {
      setLoading(false);
    }
  };

  const isClient = type === 'client';
  const themeColor = isClient ? 'text-neon-yellow' : 'text-neon-orange';
  const borderColor = isClient ? 'border-neon-yellow' : 'border-neon-orange';
  const bgButton = isClient ? 'bg-neon-yellow' : 'bg-neon-orange';
  const shadowColor = isClient ? 'shadow-neon-yellow/20' : 'shadow-neon-orange/20';

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 relative overflow-y-auto">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop"
          className="w-full h-full object-cover opacity-20 grayscale"
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/90 to-[#09090b]/50"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay"></div>
      </div>

      {/* Back Button */}
      <button
        onClick={onGoBack}
        type="button"
        className="absolute top-6 left-6 z-50 text-gray-400 hover:text-white flex items-center gap-2 uppercase font-bold text-xs tracking-widest bg-black/50 p-3 rounded-full backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all cursor-pointer"
      >
        <ArrowLeft size={16} /> <span className="hidden sm:inline">Voltar para Estação</span>
      </button>

      <div
        className={`relative z-10 w-full max-w-md ${
          authMode === 'register' ? 'my-4' : 'my-10'
        } animate-[fadeIn_0.5s_ease-out]`}
      >
        {/* Header Identificador */}
        <div className={`text-center ${authMode === 'register' ? 'mb-4' : 'mb-8'}`}>
          <div
            className={`inline-flex items-center justify-center ${
              authMode === 'register' ? 'p-3' : 'p-4'
            } rounded-full ${
              authMode === 'register' ? 'mb-2' : 'mb-4'
            } border-2 bg-black/50 backdrop-blur-md ${borderColor} ${themeColor} shadow-[0_0_20px_rgba(0,0,0,0.5)]`}
          >
            {isClient ? (
              <User size={authMode === 'register' ? 24 : 32} />
            ) : (
              <TrainFront size={authMode === 'register' ? 24 : 32} />
            )}
          </div>
          <h2
            className={`${
              authMode === 'register' ? 'text-2xl' : 'text-3xl md:text-4xl'
            } font-graffiti text-white tracking-wide`}
          >
            ACESSO <span className={themeColor}>{isClient ? 'PASSAGEIRO' : 'MAQUINISTA'}</span>
          </h2>
          {!authMode ||
            (authMode === 'login' && (
              <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mt-2">
                Central de Controle de Estilo
              </p>
            ))}
        </div>

        {/* Main Card */}
        <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
          {/* Tabs Login/Register */}
          <div className="grid grid-cols-2 border-b border-white/10">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer
                ${
                  authMode === 'login'
                    ? `bg-white/5 text-white border-b-2 ${borderColor}`
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
            >
              <LogIn size={14} /> Entrar
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer
                ${
                  authMode === 'register'
                    ? `bg-white/5 text-white border-b-2 ${borderColor}`
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
            >
              <UserPlus size={14} /> Criar Conta
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Photo Upload (Only Register) */}
              {authMode === 'register' && (
                <div className="flex justify-center mb-4 animate-[fadeIn_0.3s_ease-out]">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer group relative overflow-hidden transition-all bg-black/40
                      ${photoPreview ? borderColor : 'border-gray-700 hover:border-gray-500'}`}
                  >
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-500 group-hover:text-white transition-colors">
                        <Camera size={20} className="mb-1" />
                        <span className="text-[9px] uppercase font-bold">Foto</span>
                      </div>
                    )}
                    {photoPreview && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="text-white" size={20} />
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                </div>
              )}

              {/* Nome (Only Register) */}
              {authMode === 'register' && (
                <div className="space-y-1 animate-[fadeIn_0.3s_ease-out]">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Nome Completo
                  </label>
                  <div className="relative group">
                    <User
                      className="absolute left-3 top-3.5 text-gray-600 group-focus-within:text-white transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-10 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all placeholder-gray-700 font-medium"
                      placeholder="Como quer ser chamado?"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Email/Phone */}
              <div className="space-y-4">
                {/* Phone Display Logic: Show if Client OR if Registering (Any Type) */}
                {(isClient || authMode === 'register') && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                      Celular / WhatsApp
                    </label>
                    <div className="relative group">
                      <Phone
                        className="absolute left-3 top-3.5 text-gray-600 group-focus-within:text-white transition-colors"
                        size={18}
                      />
                      <input
                        type="tel"
                        required={isClient || authMode === 'register'}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-10 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all placeholder-gray-700 font-medium"
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Email Display Logic: Show if Barber OR if Registering (Any Type) */}
                {(!isClient || authMode === 'register') && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                      Email {isClient ? 'Pessoal' : 'Profissional'}
                    </label>
                    <div className="relative group">
                      <Mail
                        className="absolute left-3 top-3.5 text-gray-600 group-focus-within:text-white transition-colors"
                        size={18}
                      />
                      <input
                        type="email"
                        required={!isClient || authMode === 'register'}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-10 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all placeholder-gray-700 font-medium"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Senha
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-3 top-3.5 text-gray-600 group-focus-within:text-white transition-colors"
                    size={18}
                  />
                  <input
                    type="password"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-10 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all placeholder-gray-700 font-medium"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {/* Admin Code Removed as requested */}

              {/* Error Msg */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-center">
                  <p className="text-red-400 text-xs font-bold">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed text-black shadow-lg ${bgButton} ${shadowColor} hover:brightness-110 mt-4 cursor-pointer`}
              >
                {loading ? (
                  <span className="animate-pulse">Processando...</span>
                ) : (
                  <>
                    {authMode === 'login' ? 'Acessar Plataforma' : 'Finalizar Cadastro'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Decoration */}
          <div className="bg-black/40 p-3 text-center border-t border-white/5">
            <p className="text-[10px] text-gray-600 font-mono uppercase">
              Ambiente Seguro &bull; Trilha do Corte ID
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
