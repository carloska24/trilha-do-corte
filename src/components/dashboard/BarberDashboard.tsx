import React, { useState, useEffect, useRef } from 'react';
import { ChairIcon } from '../icons/ChairIcon';
import { ClientsIcon } from '../icons/ClientsIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { ServicesIcon } from '../icons/ServicesIcon';
import { SettingsIcon } from '../icons/SettingsIcon';
import { AnimatedWallet } from '../icons/AnimatedWallet';
import {
  Appointment,
  AppointmentStatus,
  BarberProfile,
  Service,
  DashboardView,
  Client,
} from '../../types';
import {
  Wallet,
  Settings,
  LogOut,
  User,
  Scissors,
  Check,
  X,
  Camera,
  Mic,
  MicOff,
  Armchair,
  UserCircle2,
  CalendarClock,
  Banknote,
  Briefcase,
} from 'lucide-react';

// Sub-components - Now Siblings
import { DashboardHome } from './DashboardHome';
import { ClientsManager } from './ClientsManager';
import { CalendarView } from './CalendarView';
import { FinancialVault } from './FinancialVault';
import { ServiceConfig } from './ServiceConfig';
import { FinancialModal } from './FinancialModal';
import { ClientProfileModal } from './ClientProfileModal';
import { SettingsView } from './SettingsView';
import { useShopStatus } from '../../hooks/useShopStatus';
import { useVoiceInterpreter } from '../../hooks/useVoiceInterpreter';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

const DEFAULT_BARBER_IMAGE =
  'https://images.unsplash.com/photo-1618077553780-75539862f629?q=80&w=400&auto=format&fit=crop';

interface BarberDashboardProps {
  currentView: DashboardView;
  appointments: Appointment[];
  onStatusChange: (
    id: string,
    status: AppointmentStatus,
    photoUrl?: string,
    notes?: string
  ) => void;
  onNewAppointment: (data: Partial<Appointment>) => void;
  barberProfile: BarberProfile;
  onLogout: () => void;
  onUpdateProfile: (data: Partial<BarberProfile>) => void;
  onSettings: () => void;
  onViewChange: (view: DashboardView) => void;
  clients: Client[];
  onAddClient: (client: Client) => void;
  services: Service[];
  onUpdateServices: (services: Service[]) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const BarberDashboard: React.FC<BarberDashboardProps> = ({
  currentView,
  appointments,
  onStatusChange,
  onNewAppointment,
  barberProfile,
  onLogout,
  onUpdateProfile,
  onSettings,
  onViewChange,
  clients,
  onAddClient,
  services,
  onUpdateServices,
  isDarkMode,
  toggleTheme,
}) => {
  // --- AI VOICE STATE ---
  const { isListening, transcript, startListening, stopListening } = useVoiceInterpreter();
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  useEffect(() => {
    if (!isListening && transcript) {
      handleVoiceCommand(transcript);
    }
  }, [isListening, transcript]);

  const handleVoiceCommand = async (text: string) => {
    if (!text) return;
    setVoiceProcessing(true);
    setAiResponse('Processando...');

    try {
      const { processVoiceCommand } = await import('../../utils/aiCommandProcessor');
      const result = await processVoiceCommand(text);

      if (result.action === 'schedule') {
        const fakeDate =
          result.data.date === 'Amanhã'
            ? new Date(Date.now() + 86400000).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

        setAiResponse(`✅ ${result.message}`);
        onNewAppointment({
          clientName: result.data.clientName,
          serviceId: '1',
          date: fakeDate,
          time: result.data.time,
        });
        setTimeout(() => setAiResponse(null), 4000);
      } else if (result.action === 'update_hours') {
        setAiResponse(`🕒 ${result.message}`);
        setTimeout(() => setAiResponse(null), 4000);
      } else {
        setAiResponse(`❓ ${result.message}`);
        setTimeout(() => setAiResponse(null), 4000);
      }
    } catch (error) {
      setAiResponse('Erro ao processar comando.');
      setTimeout(() => setAiResponse(null), 3000);
    } finally {
      setVoiceProcessing(false);
    }
  };

  // UI State
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showFinancials, setShowFinancials] = useState(false); // Modal toggle
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null); // For Profile Modal

  // Financial State
  const [dailyGoal, setDailyGoal] = useState(1500);

  // Finishing Flow State
  const [finishingAppId, setFinishingAppId] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [barberNotes, setBarberNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  // --- EFFECTS ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- HELPERS ---
  const getShopStatus = () => {
    const hour = currentTime.getHours();
    const day = currentTime.getDay();

    if (day === 0)
      return {
        label: 'LOJA FECHADA',
        color: 'text-red-500',
        bg: 'bg-red-900/20',
        border: 'border-red-900/50',
        icon: LogOut,
        glow: 'shadow-none',
      };
    if (hour >= 9 && hour < 18)
      return {
        label: 'ABERTO',
        color: 'text-green-500',
        bg: 'bg-green-900/20',
        border: 'border-green-500/50',
        icon: Check,
        glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
      };
    return {
      label: 'FECHADO',
      color: 'text-red-500',
      bg: 'bg-red-900/20',
      border: 'border-red-900/50',
      icon: LogOut,
      glow: 'shadow-none',
    };
  };

  const hasSpeechSupport = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 2MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfile({ photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Finishing Flow
  const initiateFinish = (id: string) => {
    setFinishingAppId(id);
    setPhotoPreview(null);
    setBarberNotes('');
  };

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

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Mock recording logic
      setTimeout(() => {
        setBarberNotes(prev => prev + ' (Transcrição: Cliente pediu corte baixo com degradê...)');
        setIsRecording(false);
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  const confirmFinish = () => {
    if (finishingAppId) {
      onStatusChange(finishingAppId, 'completed', photoPreview || undefined, barberNotes);
      setFinishingAppId(null);
    }
  };

  // Derived Data for Financials
  const finished = appointments
    .filter(a => a.status === 'completed')
    .sort((a, b) => b.time.localeCompare(a.time));
  const todayRevenue = finished.reduce((acc, curr) => acc + curr.price, 0);
  const completedCount = finished.length;

  return (
    <div className="min-h-screen bg-transparent text-text-primary font-sans selection:bg-yellow-500 selection:text-black transition-colors duration-300">
      {/* --- SUPER DEBUG/VOICE BUTTON --- */}
      <button
        onClick={() => (isListening ? stopListening() : startListening())}
        style={{
          position: 'fixed',
          bottom: '120px',
          right: '20px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: isListening ? '#ef4444' : '#fbbf24',
          border: '4px solid white',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        }}
      >
        {isListening ? <MicOff color="white" size={32} /> : <Mic color="black" size={32} />}
      </button>

      {/* HEADER PIXEL PERFECT */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-street-dark z-40 flex items-center justify-between px-4 border-b border-border-color transition-colors duration-300">
        {/* BRANDING (Left) */}
        <div className="flex items-center gap-3">
          {/* Logo - Restored Chair in Yellow Box */}
          <div className="w-12 h-12 bg-[#FFD700] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.2)] group hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all duration-300">
            <ChairIcon
              size={28}
              className="text-black group-hover:scale-110 transition-transform"
            />
          </div>

          <div className="flex flex-col justify-center translate-y-[2px]">
            {/* Main Title with Glow */}
            <h1 className="text-2xl md:text-3xl text-white tracking-wide leading-none font-rye drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Trilha do Corte
            </h1>
            <div className="flex items-center gap-2 pl-1">
              {/* Subtitle with brand color */}
              <span className="text-[10px] md:text-xs font-bold text-[#FFD700] uppercase tracking-[0.35em] drop-shadow-sm opacity-90 font-sans">
                Barber Club
              </span>
            </div>
          </div>
        </div>

        {/* ICONS GROUP (Right) */}
        <div className="flex items-center gap-6">
          {/* Wallet */}
          <button
            onClick={() => setShowFinancials(true)}
            className="group flex items-center justify-center transition-transform hover:scale-110"
          >
            <AnimatedWallet className="w-10 h-10 text-white drop-shadow-xl filter brightness-110" />
          </button>

          {/* Barber Profile */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-street-gray shadow-md hover:border-[#FFD700] transition-colors"
          >
            <img
              src={barberProfile.photoUrl || DEFAULT_BARBER_IMAGE}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-street-dark animate-pulse"></div>
          </button>
        </div>
      </header>

      {/* FLOATING ACTION BUTTON (AI VOICE) */}

      {/* BOTTOM NAV PIXEL PERFECT */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-street-dark border-t border-border-color z-50 flex justify-around items-center px-2 pb-2 transition-colors duration-300 relative">
        {/* AI VOICE BUTTON (Piggybacked) */}
        <button
          onClick={isListening ? stopListening : startListening}
          className={`absolute bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.6)] border-2 z-[60] ${
            isListening
              ? 'bg-red-600 border-white text-white animate-pulse'
              : 'bg-[#FFD700] border-white text-black'
          }`}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        <button
          onClick={() => onViewChange('home')}
          className="flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl group"
        >
          <ChairIcon
            size={24}
            className={`transition-colors animate-float-slow ${
              currentView === 'home'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          />
          <span
            className={`text-[10px] font-bold uppercase tracking-wider transition-colors font-sf-pro ${
              currentView === 'home'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          >
            Dashboard
          </span>
        </button>

        <button
          onClick={() => onViewChange('clients')}
          className="flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl group"
        >
          <ClientsIcon
            size={24}
            className={`transition-colors animate-float-slow ${
              currentView === 'clients'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          />
          <span
            className={`text-[10px] font-bold uppercase tracking-wider transition-colors font-sf-pro ${
              currentView === 'clients'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          >
            Clientes
          </span>
        </button>

        <button
          onClick={() => onViewChange('calendar')}
          className="flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl group"
        >
          <CalendarIcon
            size={24}
            className={`transition-colors animate-float-slow ${
              currentView === 'calendar'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          />
          <span
            className={`text-[10px] font-bold uppercase tracking-wider transition-colors font-sf-pro ${
              currentView === 'calendar'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          >
            Agenda
          </span>
        </button>

        <button
          onClick={() => onViewChange('services')}
          className="flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl group"
        >
          <ServicesIcon
            size={24}
            className={`transition-colors animate-float-slow ${
              currentView === 'services'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          />
          <span
            className={`text-[10px] font-bold uppercase tracking-wider transition-colors font-sf-pro ${
              currentView === 'services'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          >
            Oficina
          </span>
        </button>

        <button
          onClick={() => onViewChange('settings')}
          className="flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl group"
        >
          <SettingsIcon
            size={24}
            className={`transition-colors ${
              currentView === 'settings'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          />
          <span
            className={`text-[10px] font-bold uppercase tracking-wider transition-colors font-sf-pro ${
              currentView === 'settings'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          >
            Ajustes
          </span>
        </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="pt-20 pb-24 px-4 min-h-screen bg-transparent relative overflow-hidden transition-colors duration-300">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_25%,rgba(255,255,255,0.02)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.02)_75%,rgba(255,255,255,0.02)_100%)] bg-[length:24px_24px] opacity-20 pointer-events-none"></div>

        {currentView === 'home' && (
          <DashboardHome
            appointments={appointments}
            onStatusChange={onStatusChange}
            currentTime={currentTime}
            shopStatus={getShopStatus()}
            onInitiateFinish={initiateFinish}
            services={services}
          />
        )}

        {currentView === 'clients' && (
          <ClientsManager
            onSelectClient={setSelectedClient}
            clients={clients}
            onAddClient={onAddClient}
          />
        )}

        {currentView === 'calendar' && (
          <CalendarView
            appointments={appointments}
            services={services}
            onNewAppointment={onNewAppointment}
            onSelectClient={clientName => {
              const found =
                clients.find(c => c.name.toLowerCase() === clientName.toLowerCase()) ||
                ({
                  id: 'temp',
                  name: clientName,
                  phone: 'Sem cadastro',
                  level: 1,
                  lastVisit: 'Hoje',
                  img: null,
                  status: 'new',
                  notes: 'Agendamento rápido.',
                } as Client);
              setSelectedClient(found);
            }}
          />
        )}

        {currentView === 'financial' && (
          <FinancialVault
            todayRevenue={todayRevenue}
            dailyGoal={dailyGoal}
            completedCount={completedCount}
            finished={finished}
          />
        )}

        {currentView === 'services' && (
          <ServiceConfig
            barberProfile={barberProfile}
            onUpdateProfile={onUpdateProfile}
            services={services}
            onUpdateServices={onUpdateServices}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            barberProfile={barberProfile}
            onLogout={onLogout}
            onEditProfile={() => setShowProfileModal(true)}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
          />
        )}
      </main>

      {/* EMERGENCY VOICE BUTTON - TOP RIGHT */}
      <button
        onClick={() => {
          console.log('Voice Button Clicked');
          isListening ? stopListening() : startListening();
        }}
        style={{ zIndex: 99999 }}
        className={`fixed top-20 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.8)] transition-all duration-300 border-2 ${
          isListening
            ? 'bg-red-600 border-white text-white animate-pulse'
            : 'bg-[#FFD700] border-white text-black'
        }`}
      >
        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
      </button>

      {/* AI Voice Feedback Toast */}
      {(isListening || aiResponse) && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 md:bottom-10 md:left-1/2 md:-translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
          {isListening && (
            <div className="bg-black/90 backdrop-blur-md text-white px-6 py-3 rounded-full border border-neon-yellow/30 shadow-[0_0_30px_rgba(234,179,8,0.2)] flex items-center gap-3 animate-fade-in-up">
              <div className="flex gap-1 h-3 items-end">
                <div className="w-1 bg-neon-yellow animate-[music-bar_0.5s_ease-in-out_infinite] h-full"></div>
                <div className="w-1 bg-neon-yellow animate-[music-bar_0.7s_ease-in-out_infinite] h-2/3"></div>
                <div className="w-1 bg-neon-yellow animate-[music-bar_0.4s_ease-in-out_infinite] h-full"></div>
              </div>
              <span className="font-mono text-sm tracking-widest uppercase text-neon-yellow">
                Ouvindo...
              </span>
              <span className="text-xs text-gray-400 max-w-[200px] truncate">"{transcript}"</span>
            </div>
          )}

          {aiResponse && (
            <div className="bg-[#111] text-white px-6 py-4 rounded-xl border border-gray-700 shadow-2xl flex items-center gap-3 animate-fade-in-up min-w-[300px]">
              <div className="bg-blue-500/20 p-2 rounded-full">
                <Briefcase size={18} className="text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  Maquinista AI
                </span>
                <span className="font-medium text-sm">{aiResponse}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      <FinancialModal
        isOpen={showFinancials}
        onClose={() => setShowFinancials(false)}
        todayRevenue={todayRevenue}
        dailyGoal={dailyGoal}
        setDailyGoal={setDailyGoal}
        completedCount={completedCount}
        finished={finished}
      />

      <ClientProfileModal
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        appointments={appointments}
        services={services}
        onNewBooking={client => {
          setSelectedClient(null);
          onViewChange('calendar');
        }}
      />

      {/* MODAL PERFIL (Header) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <Card
            variant="default"
            padding="lg"
            className="w-full max-w-sm relative flex flex-col items-center"
          >
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer"
            >
              <X />
            </button>
            <div className="text-center mb-6 w-full">
              <span className="text-[10px] font-black text-neon-yellow uppercase tracking-[0.2em] border-b border-gray-800 pb-2 mb-4 block">
                Identificação do Maquinista
              </span>
              <div
                className="w-32 h-32 rounded-full border-4 border-neon-orange p-1 bg-black shadow-[0_0_30px_rgba(249,115,22,0.4)] mx-auto mb-4 relative group cursor-pointer"
                onClick={() => profilePhotoInputRef.current?.click()}
              >
                <img
                  src={barberProfile.photoUrl || DEFAULT_BARBER_IMAGE}
                  alt="Perfil"
                  className="w-full h-full object-cover rounded-full filter contrast-110"
                />
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-xs font-bold uppercase text-white">Alterar</span>
                </div>
                <input
                  type="file"
                  ref={profilePhotoInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                />
              </div>
              <h2 className="text-3xl font-graffiti text-white mb-1">{barberProfile.name}</h2>
              <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
                {barberProfile.email}
              </p>
            </div>
            <div className="w-full space-y-3">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => {
                  setShowProfileModal(false);
                  onViewChange('services');
                }}
              >
                <Settings size={16} /> Configurações do Trem
              </Button>
              <Button variant="danger" size="lg" fullWidth onClick={onLogout}>
                <LogOut size={16} /> Encerrar Turno
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL FINALIZAR (Used by DashboardHome) */}
      {finishingAppId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <Card
            variant="default"
            padding="none"
            className="w-full max-w-md flex flex-col max-h-[90vh]"
          >
            <div className="p-4 md:p-6 border-b border-gray-800 flex justify-between items-center bg-[#151515]">
              <h3 className="font-black text-white uppercase tracking-wider text-base md:text-lg">
                Registrar Obra
              </h3>
              <button
                onClick={() => setFinishingAppId(null)}
                className="text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto space-y-4 md:space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video bg-[#050505] border-2 border-dashed border-gray-700 hover:border-neon-yellow cursor-pointer flex flex-col items-center justify-center transition-all group relative overflow-hidden rounded-sm"
              >
                {photoPreview ? (
                  <>
                    <img
                      src={photoPreview}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white font-bold uppercase text-xs">Trocar Foto</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Camera
                      className="text-gray-600 group-hover:text-neon-yellow mb-2 transition-colors"
                      size={24}
                    />
                    <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest group-hover:text-white">
                      Adicionar Foto
                    </span>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2 items-center">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Observações do Maquinista
                  </label>
                  {hasSpeechSupport && (
                    <button
                      onClick={toggleRecording}
                      className={`text-[9px] font-bold uppercase flex items-center gap-1 px-2 py-1 rounded transition-all ${
                        isRecording
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff size={10} /> Gravando
                        </>
                      ) : (
                        <>
                          <Mic size={10} /> Voz
                        </>
                      )}
                    </button>
                  )}
                </div>
                <textarea
                  value={barberNotes}
                  onChange={e => setBarberNotes(e.target.value)}
                  className={`w-full bg-[#050505] border p-3 text-sm text-white focus:outline-none focus:border-neon-yellow h-24 md:h-32 resize-none rounded-sm transition-colors ${
                    isRecording ? 'border-red-600' : 'border-gray-700'
                  }`}
                  placeholder={
                    isRecording ? 'Ouvindo sua voz...' : 'Descreva o corte, produtos usados...'
                  }
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-800 bg-[#151515]">
              <Button variant="primary" size="lg" fullWidth onClick={confirmFinish}>
                Confirmar e Liberar <Check size={16} />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
