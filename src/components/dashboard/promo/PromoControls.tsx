import React from 'react';
import {
  Settings,
  LayoutTemplate,
  Type,
  Palette,
  Check,
  ChevronRight,
  Move,
  Sparkles,
  Clock,
  Trash2,
} from 'lucide-react';
import { BadgeConfig, Service } from '../../../types';
import { BADGE_VARIANTS, COLORS, FONTS, TEXT_COLORS, ICONS, POSITIONS } from './PromoConstants';
import RadialMenu from '../RadialMenu';
import { PromoBadge } from '../../ui/PromoBadge';
import { ServiceCard } from '../../ui/ServiceCard';

interface PromoControlsProps {
  config: BadgeConfig;
  setConfig: (config: BadgeConfig) => void;
  selectedService: Service;
  badges: BadgeConfig[];
  activeBadgeIndex: number | null;
  onBack: () => void;
  onSave: () => void;
  onApplyNew: () => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  viewMode: boolean;
  setViewMode: (mode: boolean) => void;
}

export const PromoControls: React.FC<PromoControlsProps> = ({
  config,
  setConfig,
  selectedService,
  badges,
  activeBadgeIndex,
  onBack,
  onSave,
  onApplyNew,
  onReset,
  onUndo,
  onRedo,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="w-full lg:w-[450px] bg-[var(--bg-card)] bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] border-r border-[var(--border-color)] flex flex-col h-auto lg:h-full z-20 shadow-2xl relative transition-colors duration-300">
      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none z-0"></div>

      {/* Scrollable Area */}
      <div className="flex-1 overflow-visible lg:overflow-y-auto custom-scrollbar p-6 space-y-8 relative z-10 pb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-bold text-xs uppercase tracking-widest group"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/20 flex items-center justify-center transition-all">
              <ChevronRight className="rotate-180" size={14} />
            </div>
            Voltar
          </button>
          <h3 className="text-[var(--text-primary)] font-rye text-xl tracking-widest text-[#E6CCAA]">
            Badge Creator
          </h3>
        </div>

        {/* 1. VARIANT - UNIFIED CONTAINER */}
        <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] rounded-2xl border border-purple-500/20 shadow-[0_0_30px_rgba(147,51,234,0.1)] overflow-hidden">
          {/* Header Minimalista */}
          <div className="px-5 py-3 border-b border-purple-500/10 flex items-center justify-between bg-black/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg">
                <LayoutTemplate size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xs uppercase tracking-wider">
                  Tipo de Badge
                </h3>
                <p className="text-purple-400/60 text-[9px] font-medium">Escolha o formato</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Sparkles size={14} className="text-purple-400/50" />
            </div>
          </div>

          {/* Selection Cards - Grid Premium */}
          <div className="grid grid-cols-3 gap-3 p-4">
            {/* FAIXA / RIBBON */}
            <button
              onClick={() => setConfig({ ...config, variant: 'ribbon' })}
              className={`group relative rounded-xl p-4 transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden
                ${
                  config.variant === 'ribbon'
                    ? 'bg-gradient-to-b from-purple-600/30 to-purple-900/40 border-2 border-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.4)]'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50'
                }`}
            >
              {/* Glow Effect */}
              {config.variant === 'ribbon' && (
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-transparent to-transparent pointer-events-none" />
              )}

              {/* SVG Preview - Ribbon Style */}
              <div
                className={`relative w-16 h-12 transition-transform duration-300 ${
                  config.variant === 'ribbon' ? 'scale-110' : 'opacity-60 group-hover:opacity-100'
                }`}
              >
                <svg viewBox="0 0 80 40" className="w-full h-full">
                  {/* Ribbon Shape */}
                  <defs>
                    <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop
                        offset="0%"
                        stopColor={config.variant === 'ribbon' ? '#a855f7' : '#666'}
                      />
                      <stop
                        offset="100%"
                        stopColor={config.variant === 'ribbon' ? '#7c3aed' : '#444'}
                      />
                    </linearGradient>
                  </defs>
                  <path d="M0 8 L70 8 L80 20 L70 32 L0 32 Z" fill="url(#ribbonGrad)" />
                  <rect x="8" y="14" width="30" height="4" rx="2" fill="white" opacity="0.8" />
                  <rect x="8" y="22" width="20" height="3" rx="1.5" fill="white" opacity="0.4" />
                </svg>
              </div>

              <span
                className={`text-[10px] font-black uppercase tracking-wider z-10 transition-colors
                ${
                  config.variant === 'ribbon'
                    ? 'text-purple-300'
                    : 'text-gray-400 group-hover:text-white'
                }`}
              >
                Faixa
              </span>

              {/* Active Indicator */}
              {config.variant === 'ribbon' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
              )}
            </button>

            {/* SELO / SEAL */}
            <button
              onClick={() => setConfig({ ...config, variant: 'seal' })}
              className={`group relative rounded-xl p-4 transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden
                ${
                  config.variant === 'seal'
                    ? 'bg-gradient-to-b from-purple-600/30 to-purple-900/40 border-2 border-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.4)]'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50'
                }`}
            >
              {config.variant === 'seal' && (
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-transparent to-transparent pointer-events-none" />
              )}

              {/* SVG Preview - Seal/Starburst Style */}
              <div
                className={`relative w-14 h-14 transition-transform duration-300 ${
                  config.variant === 'seal' ? 'scale-110' : 'opacity-60 group-hover:opacity-100'
                }`}
              >
                <svg viewBox="0 0 50 50" className="w-full h-full">
                  <defs>
                    <linearGradient id="sealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop
                        offset="0%"
                        stopColor={config.variant === 'seal' ? '#f59e0b' : '#666'}
                      />
                      <stop
                        offset="100%"
                        stopColor={config.variant === 'seal' ? '#d97706' : '#444'}
                      />
                    </linearGradient>
                  </defs>
                  {/* Starburst Shape */}
                  <polygon
                    points="25,2 28,18 45,18 32,28 38,45 25,35 12,45 18,28 5,18 22,18"
                    fill="url(#sealGrad)"
                  />
                  <circle cx="25" cy="25" r="8" fill="white" opacity="0.2" />
                  <text
                    x="25"
                    y="28"
                    textAnchor="middle"
                    fill="white"
                    fontSize="8"
                    fontWeight="bold"
                  >
                    %
                  </text>
                </svg>
              </div>

              <span
                className={`text-[10px] font-black uppercase tracking-wider z-10 transition-colors
                ${
                  config.variant === 'seal'
                    ? 'text-purple-300'
                    : 'text-gray-400 group-hover:text-white'
                }`}
              >
                Selo
              </span>

              {config.variant === 'seal' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
              )}
            </button>

            {/* PÍLULA / PILL */}
            <button
              onClick={() => setConfig({ ...config, variant: 'pill' })}
              className={`group relative rounded-xl p-4 transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden
                ${
                  config.variant === 'pill'
                    ? 'bg-gradient-to-b from-purple-600/30 to-purple-900/40 border-2 border-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.4)]'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50'
                }`}
            >
              {config.variant === 'pill' && (
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-transparent to-transparent pointer-events-none" />
              )}

              {/* SVG Preview - Pill Style */}
              <div
                className={`relative w-16 h-12 transition-transform duration-300 ${
                  config.variant === 'pill' ? 'scale-110' : 'opacity-60 group-hover:opacity-100'
                }`}
              >
                <svg viewBox="0 0 80 36" className="w-full h-full">
                  <defs>
                    <linearGradient id="pillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop
                        offset="0%"
                        stopColor={config.variant === 'pill' ? '#22c55e' : '#666'}
                      />
                      <stop
                        offset="100%"
                        stopColor={config.variant === 'pill' ? '#16a34a' : '#444'}
                      />
                    </linearGradient>
                  </defs>
                  <rect x="4" y="4" width="72" height="28" rx="14" fill="url(#pillGrad)" />
                  <circle cx="18" cy="18" r="6" fill="white" opacity="0.3" />
                  <rect x="30" y="12" width="26" height="4" rx="2" fill="white" opacity="0.7" />
                  <rect x="30" y="20" width="18" height="3" rx="1.5" fill="white" opacity="0.4" />
                </svg>
              </div>

              <span
                className={`text-[10px] font-black uppercase tracking-wider z-10 transition-colors
                ${
                  config.variant === 'pill'
                    ? 'text-purple-300'
                    : 'text-gray-400 group-hover:text-white'
                }`}
              >
                Pílula
              </span>

              {config.variant === 'pill' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
              )}
            </button>
          </div>
        </div>

        {/* 2. TEXT CONTENT - Premium Design */}
        <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] rounded-2xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.08)] overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 border-b border-blue-500/10 flex items-center justify-between bg-black/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Type size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xs uppercase tracking-wider">Conteúdo</h3>
                <p className="text-blue-400/60 text-[9px] font-medium">Texto do badge</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Texto Principal */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300
                  ${config.text ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-500'}`}
                >
                  <Type size={12} />
                </div>
              </div>
              <input
                value={config.text}
                onChange={e => setConfig({ ...config, text: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-14 pr-16 py-4 text-white font-bold text-base 
                  focus:border-blue-500/50 focus:bg-blue-500/5 focus:shadow-[0_0_20px_rgba(59,130,246,0.1)]
                  outline-none transition-all duration-300 placeholder:text-gray-600"
                placeholder="TEXTO PRINCIPAL"
                maxLength={20}
              />
              {/* Character Counter */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span
                  className={`text-[10px] font-mono font-bold transition-colors
                  ${
                    config.text.length > 15
                      ? 'text-orange-400'
                      : config.text.length > 10
                      ? 'text-yellow-400'
                      : 'text-gray-500'
                  }`}
                >
                  {config.text.length}
                </span>
                <span className="text-gray-600 text-[10px] font-mono">/20</span>
              </div>
              {/* Focus Glow */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 
                bg-gradient-to-r from-blue-500/10 via-transparent to-cyan-500/10 pointer-events-none transition-opacity duration-300"
              />
            </div>

            {/* Sub-Texto (apenas para ribbon) */}
            {config.variant === 'ribbon' && (
              <div className="relative group animate-[fadeIn_0.3s_ease-out]">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300
                    ${
                      config.subText
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-white/5 text-gray-500'
                    }`}
                  >
                    <span className="text-[10px] font-bold">Aa</span>
                  </div>
                </div>
                <input
                  value={config.subText || ''}
                  onChange={e => setConfig({ ...config, subText: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-14 pr-4 py-3 text-white/80 font-mono text-sm 
                    focus:border-purple-500/50 focus:bg-purple-500/5 focus:shadow-[0_0_20px_rgba(147,51,234,0.1)]
                    outline-none transition-all duration-300 placeholder:text-gray-600"
                  placeholder="SUB-TEXTO (opcional)"
                  maxLength={12}
                />
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 
                  bg-gradient-to-r from-purple-500/10 via-transparent to-fuchsia-500/10 pointer-events-none transition-opacity duration-300"
                />
              </div>
            )}

            {/* Dica Visual */}
            <div className="flex items-center gap-2 px-2">
              <div className="w-1 h-1 rounded-full bg-blue-500/50" />
              <p className="text-[10px] text-gray-500 font-medium">
                {config.variant === 'ribbon'
                  ? 'A faixa suporta texto principal + sub-texto'
                  : config.variant === 'seal'
                  ? 'O selo exibe apenas o texto principal'
                  : 'A pílula mostra o texto de forma compacta'}
              </p>
            </div>
          </div>
        </div>

        {/* 3. APPEARANCE */}
        <div className="space-y-4">
          {/* COLOR PALETTE - Premium Design */}
          <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] rounded-2xl border border-pink-500/20 shadow-[0_0_30px_rgba(236,72,153,0.08)] overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3 border-b border-pink-500/10 flex items-center justify-between bg-black/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                  <Palette size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xs uppercase tracking-wider">
                    Cor do Badge
                  </h3>
                  <p className="text-pink-400/60 text-[9px] font-medium">Escolha a cor de fundo</p>
                </div>
              </div>
              {/* Selected Color Preview */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-gray-500 uppercase tracking-wide">Ativa:</span>
                <div
                  className={`w-6 h-6 rounded-full ring-2 ring-white/50 shadow-lg ${
                    COLORS.find(c => c.id === config.color)?.class || ''
                  }`}
                />
              </div>
            </div>

            <div className="p-5">
              {/* Color Grid - Organized */}
              <div className="grid grid-cols-7 gap-3">
                {COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setConfig({ ...config, color: c.id })}
                    className={`group relative aspect-square rounded-xl flex items-center justify-center transition-all duration-300 overflow-hidden
                      ${
                        config.color === c.id
                          ? 'scale-110 ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.3)] z-10'
                          : 'ring-1 ring-white/10 hover:ring-white/30 hover:scale-105'
                      } ${c.class}
                      ${
                        c.id === 'transparent'
                          ? 'bg-transparent! border-2 border-dashed border-white/20 hover:border-white/50'
                          : ''
                      }
                    `}
                    title={c.label}
                  >
                    {/* Check Icon */}
                    {config.color === c.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                        <Check size={16} strokeWidth={3} className="text-white drop-shadow-lg" />
                      </div>
                    )}

                    {/* Transparent indicator */}
                    {c.id === 'transparent' && config.color !== c.id && (
                      <div className="w-full h-0.5 bg-red-500/50 rotate-45 absolute" />
                    )}

                    {/* Hover Tooltip */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 rounded text-[8px] text-white font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                      {c.label}
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Color Name */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  {COLORS.find(c => c.id === config.color)?.label || 'Selecione'}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </div>
          </div>

          {/* TYPOGRAPHY - Premium Design */}
          <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] rounded-2xl border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.08)] overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3 border-b border-indigo-500/10 flex items-center justify-between bg-black/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg">
                  <Type size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xs uppercase tracking-wider">
                    Tipografia
                  </h3>
                  <p className="text-indigo-400/60 text-[9px] font-medium">Fonte e cor do texto</p>
                </div>
              </div>
              {/* Current Font Preview */}
              <div
                className={`px-3 py-1 rounded-lg bg-white/5 border border-white/10 ${
                  FONTS.find(f => f.id === config.fontFamily)?.class || ''
                }`}
              >
                <span className="text-[10px] text-white/70">
                  {FONTS.find(f => f.id === config.fontFamily)?.label || 'SANS'}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-6">
              {/* Font Style Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-indigo-500" />
                    Estilo da Fonte
                  </span>
                  <span className="text-[9px] text-gray-600">12 opções</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {FONTS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setConfig({ ...config, fontFamily: f.id as any })}
                      className={`group relative py-3 px-2 rounded-xl border transition-all duration-300 flex items-center justify-center overflow-hidden
                        ${
                          config.fontFamily === f.id
                            ? 'bg-gradient-to-b from-indigo-600/40 to-indigo-900/40 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/50'
                        }`}
                    >
                      {/* Glow Effect */}
                      {config.fontFamily === f.id && (
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
                      )}

                      <span
                        className={`text-[11px] uppercase font-bold z-10 transition-colors truncate
                        ${
                          config.fontFamily === f.id
                            ? 'text-white'
                            : 'text-gray-400 group-hover:text-white'
                        }
                        ${f.class}`}
                      >
                        {f.label}
                      </span>

                      {/* Active Indicator */}
                      {config.fontFamily === f.id && (
                        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Text Color */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-violet-500" />
                    Cor do Texto
                  </span>
                  {/* Preview */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-600">Preview:</span>
                    <span
                      className={`text-xs font-bold ${
                        config.textColor?.startsWith('text-') ? config.textColor : ''
                      }`}
                      style={
                        config.textColor?.startsWith('#') ? { color: config.textColor } : undefined
                      }
                    >
                      Aa
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {TEXT_COLORS.map(tc => (
                    <button
                      key={tc.id}
                      onClick={() => setConfig({ ...config, textColor: tc.id })}
                      className={`group relative aspect-square rounded-xl transition-all duration-300 flex items-center justify-center overflow-hidden
                        ${
                          config.textColor === tc.id
                            ? 'scale-110 ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10'
                            : 'ring-1 ring-white/10 hover:ring-white/30 hover:scale-105'
                        } ${tc.class}`}
                    >
                      {/* Check Icon */}
                      {config.textColor === tc.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                          <Check size={14} strokeWidth={3} className="text-white drop-shadow-lg" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ICONS - Premium Design */}
          <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] rounded-2xl border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.08)] overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3 border-b border-amber-500/10 flex items-center justify-between bg-black/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xs uppercase tracking-wider">Ícone</h3>
                  <p className="text-amber-400/60 text-[9px] font-medium">Símbolo do badge</p>
                </div>
              </div>
              {/* Current Icon Preview */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                {(() => {
                  const currentIcon = ICONS.find(i => i.id === config.icon);
                  const Icon = currentIcon?.IconComponent || Sparkles;
                  return (
                    <>
                      <Icon size={16} weight="fill" className="text-amber-400" />
                      <span className="text-[9px] text-white/60 font-medium uppercase">{currentIcon?.label || 'N/A'}</span>
                    </>
                  );
                })()}
              </div>
            </div>
            
            <div className="p-5 space-y-5">
              {/* Icons Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-amber-500" />
                    Escolha o Ícone
                  </span>
                  <span className="text-[9px] text-gray-600">{ICONS.length} opções</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {ICONS.map(i => {
                    const Icon = i.IconComponent || Sparkles;
                    const isActive = config.icon === i.id;
                    return (
                      <button
                        key={i.id}
                        onClick={() => setConfig({ ...config, icon: i.id })}
                        className={`group relative aspect-square rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-1 overflow-hidden
                          ${isActive
                            ? 'bg-gradient-to-b from-amber-600/30 to-amber-900/40 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-amber-500/50'
                          }`}
                      >
                        {/* Glow Effect */}
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-transparent to-transparent pointer-events-none" />
                        )}
                        
                        <Icon
                          size={22}
                          weight={isActive ? 'fill' : 'duotone'}
                          className={`transition-all duration-300 z-10 group-hover:scale-110
                            ${isActive ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-gray-400 group-hover:text-white'}`}
                        />
                        <span className={`text-[7px] font-bold uppercase tracking-wider z-10 transition-colors
                          ${isActive ? 'text-amber-300' : 'text-gray-500 group-hover:text-white'}`}>
                          {i.label}
                        </span>
                        
                        {/* Active Indicator */}
                        {isActive && (
                          <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* ICON COLOR */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-orange-500" />
                    Cor do Ícone
                  </span>
                  {/* Preview */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-600">Cor:</span>
                    <div 
                      className="w-5 h-5 rounded-md border border-white/20 shadow-inner"
                      style={{ backgroundColor: config.iconColor || '#9ca3af' }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {/* Auto Button */}
                  <button
                    onClick={() => setConfig({ ...config, iconColor: undefined })}
                    className={`group relative aspect-square rounded-xl border transition-all duration-300 flex items-center justify-center overflow-hidden
                      ${!config.iconColor
                        ? 'bg-gradient-to-b from-gray-600/30 to-gray-900/40 border-white ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                      }`}
                  >
                    <span className={`text-[8px] font-bold uppercase transition-colors
                      ${!config.iconColor ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                      Auto
                    </span>
                  </button>

                  {[
                    { color: '#FFFFFF', light: true },
                    { color: '#000000', light: false },
                    { color: '#FCA5A5', light: true },
                    { color: '#FDBA74', light: true },
                    { color: '#FDE047', light: true },
                    { color: '#BEF264', light: true },
                    { color: '#67E8F9', light: true },
                    { color: '#C4B5FD', light: true },
                    { color: '#F472B6', light: true },
                    { color: '#EF4444', light: false },
                    { color: '#3B82F6', light: false },
                    { color: '#10B981', light: false },
                    { color: '#8B5CF6', light: false },
                  ].map(({ color, light }) => (
                    <button
                      key={color}
                      onClick={() => setConfig({ ...config, iconColor: color })}
                      className={`group relative aspect-square rounded-xl transition-all duration-300 flex items-center justify-center overflow-hidden
                        ${config.iconColor === color
                          ? 'scale-110 ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10'
                          : 'ring-1 ring-white/10 hover:ring-white/30 hover:scale-105'
                        }`}
                      style={{ backgroundColor: color }}
                    >
                      {/* Check Icon */}
                      {config.iconColor === color && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <Check size={14} strokeWidth={3} className={light ? 'text-black' : 'text-white'} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. POSITION - Premium Design */}
        <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] rounded-2xl border border-teal-500/20 shadow-[0_0_30px_rgba(20,184,166,0.08)] overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 border-b border-teal-500/10 flex items-center justify-between bg-black/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Move size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xs uppercase tracking-wider">Posição</h3>
                <p className="text-teal-400/60 text-[9px] font-medium">Local do badge no card</p>
              </div>
            </div>
            {/* Current Position Preview */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <span className="text-[9px] text-white/60 font-medium uppercase">
                {POSITIONS.find(p => p.id === config.position)?.label || 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="p-5">
            {/* Card Preview with Position Grid */}
            <div className="relative w-full max-w-[320px] mx-auto">
              {/* Service Card Preview (non-interactive) */}
              <div className="relative pointer-events-none rounded-xl overflow-hidden">
                <ServiceCard
                  service={{
                    ...selectedService,
                    badges: badges,
                  }}
                  variant="default"
                />
              </div>

              {/* Position Selection Overlay */}
              <div className="absolute inset-0 z-40 grid grid-cols-3 grid-rows-3 gap-1 p-2">
                {POSITIONS.map(p => {
                  const isActive = config.position === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setConfig({ ...config, position: p.id })}
                      className={`group relative rounded-lg transition-all duration-300 flex items-center justify-center
                        ${isActive
                          ? 'border-2 border-teal-500 bg-teal-500/10 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                          : 'border border-transparent hover:border-white/20 hover:bg-white/5'
                        }`}
                      title={p.label}
                    >
                      {/* Position Indicator */}
                      {isActive && (
                        <div className="w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)] animate-pulse" />
                      )}
                      
                      {/* Hover Label */}
                      <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity
                        ${isActive ? 'opacity-0!' : ''}`}>
                        <span className="text-[8px] text-white/50 font-bold uppercase tracking-wide bg-black/50 px-2 py-1 rounded">
                          {p.label.split(' ')[0]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Help Text */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <p className="text-[9px] text-gray-500 font-medium flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500/50 animate-pulse" />
                Toque para posicionar o badge
              </p>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </div>
        </div>

        {/* RADIAL MENU */}
        <div className="w-full flex items-center justify-center py-10 pointer-events-auto">
          <RadialMenu
            onSave={onSave}
            onApplyNew={onApplyNew}
            onView={() => setViewMode(!viewMode)}
            onUndo={onUndo}
            onRedo={onRedo}
            onReset={onReset}
          />
        </div>
      </div>
    </div>
  );
};
