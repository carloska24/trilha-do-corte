import React, { useState } from 'react';
import { Appointment } from '../../types';
import { SERVICES } from '../../constants';
import { Wallet, Users, TrendingUp, BarChart3, Receipt, EyeOff } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useOutletContext } from 'react-router-dom';

interface DashboardOutletContext {
  dailyGoal: number;
}

export const FinancialVault: React.FC = () => {
  const { appointments } = useData();
  const { dailyGoal } = useOutletContext<DashboardOutletContext>();

  // Derived Data
  const finished = appointments
    .filter(a => a.status === 'completed')
    .sort((a, b) => b.time.localeCompare(a.time));
  const todayRevenue = finished.reduce((acc, curr) => acc + curr.price, 0);
  const completedCount = finished.length;

  const [historyCleared, setHistoryCleared] = useState(false); // Local state if needed

  // Actually the original code had `historyCleared` used in the MODAL.
  // Does the VIEW have a history list?
  // Line 1054: "Lista de Transações 'Log do Sistema'".
  // Line 1066: `finished.map(...)`.
  // It doesn't seem to use `historyCleared` in the VIEW (Line 1054-1093).
  // `historyCleared` was used in the MODAL (Line 1360).
  // So the VIEW always shows the log?
  // Line 1060: "Ver Completo" button.
  // Line 1066: `finished.length > 0 ? ...`
  // So the View is fine.

  const progressPercent = Math.min((todayRevenue / dailyGoal) * 100, 100);

  const getServiceName = (id: string) => SERVICES.find(s => s.id === id)?.name || 'Serviço';

  return (
    <div className="max-w-7xl mx-auto animate-[fadeIn_0.3s_ease-out] pb-8">
      {/* Header com Vibe de Cofre */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-green-900/10 rounded-full border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
          <Wallet size={32} className="text-green-500" />
        </div>
        <div>
          <h2 className="text-4xl font-graffiti text-white leading-none tracking-wide">
            CAIXA <span className="text-green-500">FORTE</span>
          </h2>
          <p className="text-gray-500 text-xs font-mono uppercase tracking-[0.2em] mt-1">
            Fluxo de Caixa &bull; <span className="text-green-500">Online</span>
          </p>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Painel LCD Principal (Receita) */}
        <div className="lg:col-span-2 bg-[#09090b] border-2 border-[#222] rounded-sm relative overflow-hidden group shadow-2xl">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-900 via-green-500 to-green-900 opacity-50"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

          <div className="p-6 md:p-8 relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-green-500 font-mono text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Receita
                  Total
                </h3>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                  Tempo Real
                </p>
              </div>
              <div className="px-3 py-1 bg-green-900/20 border border-green-500/30 rounded text-[10px] text-green-400 font-mono">
                LIVE DATA
              </div>
            </div>

            <div className="mb-8">
              {/* LCD Display Effect */}
              <div className="bg-black/80 border border-green-500/20 p-4 md:p-6 rounded-sm relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,1)]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>
                <div className="flex items-baseline gap-2 relative z-20">
                  <span className="text-2xl md:text-3xl font-mono text-green-700">R$</span>
                  <span className="text-6xl md:text-7xl font-mono font-bold text-white tracking-tighter drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]">
                    {todayRevenue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar styled as Fuel Gauge */}
            <div>
              <div className="flex justify-between text-[10px] text-gray-500 font-mono mb-2 uppercase tracking-wider">
                <span>Meta do Dia: R$ {dailyGoal}</span>
                <span className={progressPercent >= 100 ? 'text-green-500' : 'text-white'}>
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="w-full bg-[#111] h-2 rounded-sm overflow-hidden border border-gray-800 relative">
                {/* Grid inside bar */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-30 z-20"></div>
                <div
                  className="bg-gradient-to-r from-green-900 via-green-500 to-green-400 h-full relative z-10 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Secundários (Empilhados) */}
        <div className="grid grid-cols-1 gap-6">
          {/* Card 1: Clientes */}
          <div className="bg-[#111] border border-gray-800 p-6 rounded-sm relative overflow-hidden group hover:border-blue-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users size={64} />
            </div>
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] mb-2">
              Clientes
            </p>
            <p className="text-4xl font-mono font-bold text-white group-hover:text-blue-400 transition-colors">
              {completedCount}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Atendimentos Hoje</span>
            </div>
          </div>

          {/* Card 2: Ticket Médio */}
          <div className="bg-[#111] border border-gray-800 p-6 rounded-sm relative overflow-hidden group hover:border-neon-yellow/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp size={64} />
            </div>
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] mb-2">
              Ticket Médio
            </p>
            <p className="text-4xl font-mono font-bold text-white group-hover:text-neon-yellow transition-colors">
              R$ {completedCount > 0 ? (todayRevenue / completedCount).toFixed(2) : '0.00'}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
              <div className="w-2 h-2 bg-neon-yellow rounded-full"></div>
              <span>Média por Corte</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico "Torres de Sinal" */}
        <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-sm relative overflow-hidden flex flex-col h-[300px]">
          <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-6 flex items-center gap-2 z-10">
            <BarChart3 size={14} className="text-neon-orange" /> Performance Semanal
          </h3>

          {/* Background Lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-6 pt-16 pb-8 opacity-10 pointer-events-none">
            <div className="w-full h-px bg-white border-t border-dashed border-gray-500"></div>
            <div className="w-full h-px bg-white border-t border-dashed border-gray-500"></div>
            <div className="w-full h-px bg-white border-t border-dashed border-gray-500"></div>
            <div className="w-full h-px bg-white border-t border-dashed border-gray-500"></div>
          </div>

          <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 relative z-10 px-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => {
              const height = Math.random() * 70 + 20; // Mock data
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
                >
                  <div className="w-full max-w-[40px] relative flex items-end h-full">
                    <div
                      className="w-full bg-gray-800/50 border border-gray-700 group-hover:bg-gradient-to-t group-hover:from-neon-orange/20 group-hover:to-neon-orange group-hover:border-neon-orange transition-all duration-300 rounded-t-sm relative shadow-lg"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute top-0 w-full h-1 bg-white/20"></div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono uppercase font-bold group-hover:text-white transition-colors">
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista de Transações "Log do Sistema" */}
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-sm flex flex-col overflow-hidden h-[300px]">
          <div className="p-4 border-b border-gray-800 bg-[#111] flex justify-between items-center">
            <h3 className="text-white font-bold uppercase text-xs tracking-widest flex items-center gap-2">
              <Receipt size={14} className="text-gray-400" /> Log de Transações
            </h3>
            <button className="text-[9px] text-neon-yellow uppercase font-bold hover:underline cursor-pointer border border-neon-yellow/30 px-2 py-1 rounded bg-neon-yellow/5 hover:bg-neon-yellow/10 transition-colors">
              Ver Completo
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {finished.length > 0 ? (
              finished.map((app, idx) => (
                <div
                  key={app.id}
                  className="flex justify-between items-center p-3 mb-1 border border-transparent hover:border-gray-700 hover:bg-[#111] rounded-sm transition-all group cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-gray-600 text-[10px] bg-black px-1.5 py-0.5 rounded border border-gray-800 group-hover:border-gray-600 transition-colors">
                      #{app.id.substring(0, 3)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-neon-yellow transition-colors uppercase">
                        {app.clientName}
                      </p>
                      <p className="text-[9px] text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        {getServiceName(app.serviceId)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-green-500 font-mono font-bold text-sm">
                      + R$ {app.price}
                    </span>
                    <span className="text-[9px] text-gray-600 font-mono">{app.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-600">
                <Receipt size={24} className="opacity-20 mb-2" />
                <p className="text-xs font-mono uppercase">Nenhum registro no log.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
