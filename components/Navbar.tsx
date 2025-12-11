import React, { useState } from 'react';
import {
  Menu,
  X,
  Scissors,
  User,
  LogIn,
  LayoutDashboard,
  LayoutGrid,
  Users,
  CalendarRange,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { DashboardView } from '../types';

interface NavbarProps {
  onOpenBooking: () => void;
  currentView: 'landing' | 'client' | 'barber' | 'login-client' | 'login-barber';
  onViewChange: (view: 'landing' | 'client' | 'barber' | 'login-client' | 'login-barber') => void;
  barberView?: DashboardView;
  onBarberViewChange?: (view: DashboardView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  currentView,
  onViewChange,
  barberView,
  onBarberViewChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'A Estação', href: '#home' },
    { name: 'Serviços', href: '#services' },
    { name: 'O Maquinista (IA)', href: '#ai-consultant' },
    { name: 'Localização', href: '#contact' },
  ];

  const barberLinks = [
    { id: 'home', label: 'Estação Principal', icon: LayoutGrid },
    { id: 'clients', label: 'Passageiros', icon: Users },
    { id: 'calendar', label: 'Itinerário', icon: CalendarRange },
    { id: 'financial', label: 'Bilheteria', icon: TrendingUp },
    { id: 'services', label: 'Oficina', icon: Settings },
  ];

  // Helper to check if we are in a dashboard view
  const isDashboard = currentView === 'client' || currentView === 'barber';
  const isAuth = currentView === 'login-client' || currentView === 'login-barber';

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);

    if (currentView !== 'landing') {
      onViewChange('landing');
      setTimeout(() => {
        const targetId = href.replace('#', '');
        const element = document.getElementById(targetId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Se estiver na tela de login, esconder a navbar para focar no form
  if (isAuth) return null;

  return (
    <nav className="fixed w-full z-50 bg-street-dark/95 border-b border-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center cursor-pointer" onClick={() => onViewChange('landing')}>
            <div className="flex-shrink-0 text-neon-yellow flex items-center gap-2">
              <Scissors className="h-8 w-8 -rotate-90" />
              <span className="font-graffiti text-2xl tracking-wider text-white">
                NA TRILHA <span className="text-neon-orange">DO CORTE</span>
              </span>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {currentView === 'landing' &&
                navLinks.map(link => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={e => handleNavClick(e, link.href)}
                    className="text-gray-300 hover:text-neon-yellow px-3 py-2 rounded-md text-sm font-medium transition-colors uppercase tracking-widest font-sans cursor-pointer"
                  >
                    {link.name}
                  </a>
                ))}

              {/* Links de navegação do Barbeiro no Desktop */}
              {currentView === 'barber' &&
                barberLinks.map(link => (
                  <button
                    key={link.id}
                    onClick={() =>
                      onBarberViewChange && onBarberViewChange(link.id as DashboardView)
                    }
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors uppercase tracking-widest font-sans cursor-pointer
                       ${
                         barberView === link.id
                           ? 'text-neon-yellow border-b-2 border-neon-yellow'
                           : 'text-gray-300 hover:text-white'
                       }`}
                  >
                    {link.label}
                  </button>
                ))}

              {/* Action Buttons based on View */}
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-700">
                {currentView === 'landing' ? (
                  <>
                    <button
                      onClick={() => onViewChange('login-client')}
                      className="text-gray-300 hover:text-white flex items-center gap-2 text-xs uppercase font-bold tracking-wider"
                    >
                      <User size={16} /> Login Cliente
                    </button>
                    <button
                      onClick={() => onViewChange('login-barber')}
                      className="text-gray-300 hover:text-white flex items-center gap-2 text-xs uppercase font-bold tracking-wider"
                    >
                      <LayoutDashboard size={16} /> Área Barbeiro
                    </button>
                    <button
                      onClick={onOpenBooking}
                      className="bg-neon-yellow text-black px-6 py-2 rounded-none -skew-x-12 hover:bg-white transition-all font-bold uppercase text-sm flex items-center justify-center cursor-pointer"
                    >
                      <span className="skew-x-12">Agendar</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onViewChange('landing')}
                    className="flex items-center gap-2 text-neon-orange hover:text-white transition-colors uppercase font-bold text-sm"
                  >
                    <LogIn className="rotate-180" size={18} /> Sair do Sistema
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-street-dark border-b border-gray-800 absolute w-full left-0 top-20 shadow-xl max-h-[calc(100vh-80px)] overflow-y-auto z-[60]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {currentView === 'landing' &&
              navLinks.map(link => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={e => handleNavClick(e, link.href)}
                  className="text-gray-300 hover:text-neon-yellow block px-3 py-2 rounded-md text-base font-medium cursor-pointer"
                >
                  {link.name}
                </a>
              ))}

            {/* Links de navegação do Barbeiro no Mobile */}
            {currentView === 'barber' && (
              <div className="py-2 space-y-2 border-b border-gray-700 mb-2">
                <p className="px-3 text-xs text-gray-500 uppercase font-bold">Painel de Controle</p>
                {barberLinks.map(link => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.id}
                      onClick={() => {
                        onBarberViewChange && onBarberViewChange(link.id as DashboardView);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors cursor-pointer
                              ${
                                barberView === link.id
                                  ? 'bg-neon-yellow text-black font-bold'
                                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                              }`}
                    >
                      <Icon size={18} />
                      {link.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="border-t border-gray-700 mt-2 pt-2 space-y-2">
              {currentView === 'landing' && (
                <>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onViewChange('login-client');
                    }}
                    className="w-full text-left px-3 py-2 text-gray-300 hover:text-white flex items-center gap-2"
                  >
                    <User size={16} /> Login Cliente
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onViewChange('login-barber');
                    }}
                    className="w-full text-left px-3 py-2 text-gray-300 hover:text-white flex items-center gap-2"
                  >
                    <LayoutDashboard size={16} /> Área Barbeiro
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenBooking();
                    }}
                    className="w-full text-center block bg-neon-yellow text-black px-3 py-3 font-bold mt-4 uppercase cursor-pointer"
                  >
                    Agendar Agora
                  </button>
                </>
              )}
              {currentView !== 'landing' && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onViewChange('landing');
                  }}
                  className="w-full text-center block bg-red-600 text-white px-3 py-3 font-bold mt-4 uppercase cursor-pointer"
                >
                  Sair
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
