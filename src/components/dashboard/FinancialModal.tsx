import React, { useState } from 'react';
import { Appointment } from '../../types';
import { SERVICES } from '../../constants';
import { Wallet, Settings, Flag, Check, BarChart3, Receipt, EyeOff, X } from 'lucide-react';

interface FinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
  todayRevenue: number;
  dailyGoal: number;
  setDailyGoal: (goal: number) => void;
  completedCount: number;
  finished: Appointment[];
}

export const FinancialModal: React.FC<FinancialModalProps> = ({
  isOpen,
  onClose,
  todayRevenue,
  dailyGoal,
  setDailyGoal,
  completedCount,
  finished,
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [historyCleared, setHistoryCleared] = useState(false);

  if (!isOpen) return null;

  const progressPercent = Math.min((todayRevenue / dailyGoal) * 100, 100);
  const getServiceName = (id: string) => SERVICES.find(s => s.id === id)?.name || 'Serviço';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-md bg-[#151515] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300">
        {/* Header */}
        <div className="p-6 pb-2 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-green-500/20 bg-green-900/10 flex items-center justify-center">
              <Wallet className="text-green-500" size={24} />
            </div>
            <div>
              <h2 className="font-black text-white text-lg uppercase tracking-wider">
                Fluxo Caixa
              </h2>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>{' '}
                Sistema Operante
              </p>
            </div>
          </div>

          {/* BOTÃO CONFIGURAÇÕES - FUNCIONALIDADE ATIVA */}
          <button
            onClick={() => setIsEditingGoal(!isEditingGoal)}
            className={`w-10 h-10 border rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              isEditingGoal
                ? 'border-neon-yellow text-neon-yellow bg-neon-yellow/10'
                : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
            }`}
            title="Ajustar Meta"
          >
            <Settings size={20} className={isEditingGoal ? 'animate-spin-slow' : ''} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Total Big Display */}
          <div className="text-center">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
              Total do Dia
            </p>
            <div className="flex items-center justify-center gap-1">
              <span className="text-green-500 font-bold text-xl mt-2">R$</span>
              <span className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                {todayRevenue.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-2 gap-4">
            {/* Meta Card - COM MODO DE EDIÇÃO */}
            <div
              className={`bg-[#0A0A0A] border rounded-xl p-4 transition-colors ${
                isEditingGoal ? 'border-neon-yellow/50' : 'border-gray-800'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-[10px] font-bold uppercase ${
                    isEditingGoal ? 'text-neon-yellow' : 'text-gray-500'
                  }`}
                >
                  {isEditingGoal ? 'Definir Meta' : 'Meta Diária'}
                </span>
                <Flag size={12} className={isEditingGoal ? 'text-neon-yellow' : 'text-green-800'} />
              </div>

              {isEditingGoal ? (
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-gray-500 text-xs">R$</span>
                  <input
                    autoFocus
                    type="number"
                    value={dailyGoal}
                    onChange={e => setDailyGoal(Number(e.target.value))}
                    className="w-full bg-transparent border-b border-neon-yellow text-white font-bold outline-none text-lg p-0"
                  />
                  <button
                    onClick={() => setIsEditingGoal(false)}
                    className="bg-neon-yellow text-black p-1 rounded hover:bg-white cursor-pointer"
                  >
                    <Check size={12} />
                  </button>
                </div>
              ) : (
                <div className="mb-2">
                  <span className="text-white font-bold">R$ {Math.round(todayRevenue)}</span>
                  <span className="text-gray-600 text-xs"> / {dailyGoal}</span>
                </div>
              )}

              {/* Progress Bar */}
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-1">
                <div
                  style={{ width: `${progressPercent}%` }}
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                ></div>
              </div>
              <p className="text-right text-[9px] text-gray-600 font-mono">
                {Math.round(progressPercent)}%
              </p>
            </div>

            {/* Ticket Card */}
            <div className="bg-[#0A0A0A] border border-gray-800 rounded-xl p-4 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Ticket Médio</span>
                <BarChart3 size={12} className="text-green-800" />
              </div>
              <div className="mb-1">
                <span className="text-gray-600 text-xs mr-1">R$</span>
                <span className="text-white font-bold text-xl">
                  {completedCount > 0 ? (todayRevenue / completedCount).toFixed(2) : '0'}
                </span>
              </div>
              <p className="text-gray-600 text-[10px]">{completedCount} atendimentos</p>
            </div>
          </div>

          {/* Historic Section - COM BOTÃO LIMPAR FUNCIONAL */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                Histórico Recente
              </h3>
              <button
                onClick={() => setHistoryCleared(!historyCleared)}
                className={`text-[9px] uppercase tracking-widest cursor-pointer transition-colors ${
                  historyCleared ? 'text-neon-yellow' : 'text-gray-600 hover:text-white'
                }`}
              >
                {historyCleared ? 'Mostrar' : 'Limpar'}
              </button>
            </div>
            <div className="space-y-3">
              {!historyCleared ? (
                finished.slice(0, 3).map(app => (
                  <div
                    key={app.id}
                    className="bg-[#0A0A0A] rounded-xl p-3 flex items-center justify-between border border-transparent hover:border-gray-800 transition-colors animate-[fadeIn_0.3s_ease-out]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black border border-gray-800 flex items-center justify-center shadow-sm">
                        <Receipt size={14} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-bold">
                          {getServiceName(app.serviceId)}
                        </p>
                        <p className="text-gray-600 text-[10px] font-mono">{app.time}</p>
                      </div>
                    </div>
                    <span className="text-green-500 font-mono font-bold text-sm">
                      +R$ {app.price},00
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-gray-800 rounded-xl animate-[fadeIn_0.3s_ease-out]">
                  <EyeOff size={24} className="mx-auto text-gray-700 mb-2" />
                  <p className="text-gray-600 text-[10px] uppercase font-bold tracking-widest">
                    Visualização Oculta
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="p-6 pt-0 mt-auto">
          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-500 text-black font-black uppercase py-4 rounded-xl text-xs tracking-[0.15em] transition-all shadow-lg shadow-green-900/20 cursor-pointer"
          >
            Encerrar Consulta
          </button>
        </div>
      </div>
    </div>
  );
};
