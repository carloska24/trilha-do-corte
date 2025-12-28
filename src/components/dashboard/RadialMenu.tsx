import React from 'react';
import {
  FloppyDisk,
  Stack,
  Eye,
  ArrowUUpLeft,
  ArrowUUpRight,
  ArrowsCounterClockwise,
  Gear,
} from '@phosphor-icons/react';

interface RadialMenuProps {
  onSave: () => void;
  onApplyNew: () => void;
  onView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
}

const RadialMenu: React.FC<RadialMenuProps> = ({
  onSave,
  onApplyNew,
  onView,
  onUndo,
  onRedo,
  onReset,
}) => {
  // SVG Config
  const size = 260; // Reduced from 320
  const center = size / 2;
  const radius = size / 2 - 4; // Minus stroke
  const innerRadius = 45; // Opening for center button

  // Slice Config (6 slices = 60 degrees each)
  // We want the cut to be at 12 o'clock (Top).
  // Standard SVG 0 is 3 o'clock.
  // -90 is 12 o'clock.
  // Slices:
  // 1. Apply (Top Right): -90 to -30
  // 2. Undo (Mid Right): -30 to 30
  // 3. Redo (Bot Right): 30 to 90
  // 4. Reset (Bot Left): 90 to 150
  // 5. View (Mid Left): 150 to 210
  // 6. Save (Top Left): 210 to 270 (-150 to -90)

  // Helper to calculate path
  const createSlice = (startAngle: number, endAngle: number) => {
    // Convert to radians
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    // Points
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const x3 = center + innerRadius * Math.cos(endRad);
    const y3 = center + innerRadius * Math.sin(endRad);
    const x4 = center + innerRadius * Math.cos(startRad);
    const y4 = center + innerRadius * Math.sin(startRad);

    // Path
    return `M ${x4} ${y4} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`;
  };

  // Helper for text/icon positioning (centroid)
  const getCentroid = (angle: number, distance: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: center + distance * Math.cos(rad),
      y: center + distance * Math.sin(rad),
    };
  };

  const textRadius = (radius + innerRadius) / 2 + 10;

  const slices = [
    {
      label: 'APLICAR +\nNOVA CAMADA',
      icon: Stack,
      start: 0,
      end: 60,
      action: onApplyNew,
      color: 'fill-gray-800/80 hover:fill-gray-700 transition-all duration-300',
      textColor: 'text-gray-400 group-hover:text-white transition-colors',
    },
    {
      label: 'DESFAZER',
      icon: ArrowUUpLeft,
      start: 60,
      end: 120,
      action: onUndo,
      color: 'fill-gray-800/80 hover:fill-gray-700 transition-all duration-300',
      textColor: 'text-gray-400 group-hover:text-white transition-colors',
    },
    {
      label: 'REFAZER',
      icon: ArrowUUpRight,
      start: 120,
      end: 180,
      action: onRedo,
      color: 'fill-gray-800/80 hover:fill-gray-700 transition-all duration-300',
      textColor: 'text-gray-400 group-hover:text-white transition-colors',
    },
    {
      label: 'RESETAR',
      icon: ArrowsCounterClockwise,
      start: 180,
      end: 240,
      action: onReset,
      color: 'fill-gray-800/80 hover:fill-gray-700 transition-all duration-300',
      textColor: 'text-gray-400 group-hover:text-white transition-colors',
    },
    {
      label: 'VISUALIZAR',
      icon: Eye,
      start: 240,
      end: 300,
      action: onView,
      color: 'fill-gray-800/80 hover:fill-gray-700 transition-all duration-300',
      textColor: 'text-gray-400 group-hover:text-white transition-colors',
    },
    {
      label: 'SALVAR\nBADGE',
      icon: FloppyDisk,
      start: 300,
      end: 360,
      action: onSave,
      isPrimary: true, // Special styling
      color:
        'fill-[url(#gold-gradient)] hover:brightness-110 shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all duration-300',
      textColor: 'text-black font-black',
    },
  ];

  // Interaction State for "Click Effect"
  const [activeSlice, setActiveSlice] = React.useState<number | null>(null);

  const handleSliceClick = (index: number, action: () => void) => {
    setActiveSlice(index);
    action();
    // Reset after animation
    setTimeout(() => setActiveSlice(null), 300);
  };

  return (
    <div className="relative w-[260px] h-[260px] select-none scale-100 hover:scale-[1.02] transition-transform duration-500">
      {/* Container Background (Border Ring) */}
      <div className="absolute inset-0 rounded-full border-[3px] border-[#CDAA54] shadow-[0_0_20px_rgba(205,170,84,0.2)] bg-[#151515] opacity-90"></div>

      <svg width={size} height={size} className="absolute inset-0 z-10 pointer-events-none">
        <defs>
          <filter id="inner-shadow">
            <feOffset dx="0" dy="0" />
            <feGaussianBlur stdDeviation="5" result="offset-blur" />
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            <feFlood floodColor="black" floodOpacity="0.5" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
          <filter id="glow-gold">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-white">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Slices Overlay via SVG (Clickable) */}
      <svg width={size} height={size} className="absolute inset-0 z-20">
        {slices.map((slice, i) => {
          const isActive = activeSlice === i;
          return (
            <path
              key={i}
              d={createSlice(slice.start, slice.end)}
              className={`cursor-pointer transition-all duration-150 ease-out stroke-[#111] stroke-[2px]
                  ${isActive ? 'brightness-150 saturate-150' : slice.color}
                  ${isActive && slice.isPrimary ? 'filter-[url(#glow-gold)]' : ''}
                  ${isActive && !slice.isPrimary ? 'fill-gray-600 filter-[url(#glow-white)]' : ''}
                  hover:brightness-110
                `}
              onClick={() => handleSliceClick(i, slice.action)}
            />
          );
        })}
        {/* Gold Gradient Def */}
        <defs>
          <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EAB308" />
            <stop offset="50%" stopColor="#CA8A04" />
            <stop offset="100%" stopColor="#A16207" />
          </linearGradient>
        </defs>
      </svg>

      {/* Content (Icons & Text) - Absolute Positioned on top */}
      {slices.map((slice, i) => {
        const isActive = activeSlice === i;
        const pos = getCentroid((slice.start + slice.end) / 2, textRadius - 20); // Adjust distance
        return (
          <div
            key={i}
            className={`absolute pointer-events-none z-30 flex flex-col items-center justify-center text-center transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150
                   ${slice.isPrimary ? 'text-[#1a1a1a]' : 'text-gray-400'}
                   ${
                     isActive
                       ? 'scale-110 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]'
                       : ''
                   }
               `}
            style={{ left: pos.x, top: pos.y }}
          >
            <slice.icon
              size={24}
              weight={slice.isPrimary || isActive ? 'fill' : 'regular'}
              className="mb-1"
            />
            <span
              className={`text-[9px] font-bold uppercase leading-tight whitespace-pre-line ${
                slice.isPrimary ? 'font-black' : ''
              }`}
            >
              {slice.label}
            </span>
          </div>
        );
      })}

      {/* Center Button */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
        <button
          className="w-20 h-20 rounded-full bg-purple-600 border-4 border-[#CDAA54] shadow-lg flex items-center justify-center
             hover:scale-105 active:scale-95 transition-all group
         "
        >
          <Gear
            size={32}
            className="text-white animate-spin-slow group-hover:rotate-90 transition-transform duration-700"
            weight="bold"
          />
        </button>
      </div>
    </div>
  );
};

export default RadialMenu;
