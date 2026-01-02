import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface DraggableMicProps {
  isListening: boolean;
  onToggle: () => void;
}

export const DraggableMic: React.FC<DraggableMicProps> = ({ isListening, onToggle }) => {
  const [position, setPosition] = useState({ bottom: 96, right: 16 }); // Initial: bottom-24 (96px), right-4 (16px)
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const startPosRef = useRef<{ bottom: number; right: number } | null>(null);

  // Threshold to distinguish click from drag
  const DRAG_THRESHOLD = 5;

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(false); // Reset
    dragStartRef.current = { x: clientX, y: clientY };
    startPosRef.current = { ...position };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!dragStartRef.current || !startPosRef.current) return;

    const deltaX = dragStartRef.current.x - clientX; // Dragging left increases 'right'
    const deltaY = dragStartRef.current.y - clientY; // Dragging up increases 'bottom'

    // Check if moved enough to be considered a drag
    if (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD) {
      setIsDragging(true);
    }

    setPosition({
      right: Math.max(16, startPosRef.current.right + deltaX), // Keep padding
      bottom: Math.max(16, startPosRef.current.bottom + deltaY),
    });
  };

  const handleEnd = () => {
    dragStartRef.current = null;
    startPosRef.current = null;
    // Note: isDragging stays true until next start to prevent click trigger immediately after drag?
    // Actually, onToggle check should happen in onClick processing.
  };

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    // If we were dragging, don't toggle
    if (isDragging) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    onToggle();
  };

  // Mouse Events
  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX, e.clientY);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragStartRef.current) {
        handleMove(e.clientX, e.clientY);
      }
    };
    const onMouseUp = () => handleEnd();

    if (dragStartRef.current) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]); // Re-bind if needed, or just cleaner to check ref

  // Touch Events (React implementation enough?)
  // For global drag, window listener is better for mouse. For touch, usually target is fine if we don't lose it.
  // Using window listeners for stability.

  return (
    <div
      style={{
        position: 'fixed',
        bottom: `${position.bottom}px`,
        right: `${position.right}px`,
        zIndex: 9999,
        touchAction: 'none', // Critical for touch dragging
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={onMouseDown}
      onTouchStart={e => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={e => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={e => {
        handleEnd();
        // Mobile specific click handling needed if dragging didn't occur
        if (!isDragging) {
          // e.preventDefault(); // Might block click?
          // Let onClick handle it or call manually?
          // onToggle(); // Better to rely on onClick if possible, but consistent behavior is key.
        }
      }}
      onClick={handleClick}
      className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-colors duration-300 border-2 select-none ${
        isListening
          ? 'bg-red-600 border-white text-white animate-pulse scale-110'
          : 'bg-[#FFD700] border-white text-black hover:scale-105'
      }`}
    >
      {isListening ? <MicOff size={28} /> : <Mic size={28} />}
      {isListening && (
        <span className="absolute inset-0 rounded-full animate-ping bg-red-500/40 pointer-events-none"></span>
      )}
    </div>
  );
};
