import React, { useRef, useState, useEffect } from 'react';
import { ServiceItem } from '../../types';
import { ServiceCard } from '../ui/ServiceCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ServiceShowcaseProps {
  services: ServiceItem[];
  onBookService: (service: ServiceItem) => void;
}

export const ServiceShowcase: React.FC<ServiceShowcaseProps> = ({ services, onBookService }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Check scroll position for arrow visibility
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const checkScroll = () => {
      setCanScrollLeft(container.scrollLeft > 10);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);

      // Calculate active index
      const itemWidth = container.offsetWidth * 0.85 + 16;
      const index = Math.round(container.scrollLeft / itemWidth);
      setActiveIndex(Math.min(index, services.length - 1));
    };

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    return () => container.removeEventListener('scroll', checkScroll);
  }, [services.length]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const itemWidth = container.offsetWidth * 0.85 + 16;
    const scrollAmount = direction === 'left' ? -itemWidth : itemWidth;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="pt-2 pb-2 relative">
      {/* Navigation Arrows (Desktop) */}
      {services.length > 1 && (
        <>
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/80 border border-white/20 text-white hover:bg-neon-yellow hover:text-black hover:border-neon-yellow transition-all shadow-lg"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/80 border border-white/20 text-white hover:bg-neon-yellow hover:text-black hover:border-neon-yellow transition-all shadow-lg"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </>
      )}

      {/* Cards Container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto pb-4 -mx-4 px-[10vw] md:mx-0 md:px-4 gap-5 snap-x snap-mandatory hide-scrollbar"
      >
        {services.map((service, index) => {
          if (!service || !service.name) return null;
          return (
            <div
              key={`${service.id}-${JSON.stringify(service.badges || [])}`}
              className="shrink-0 w-[85vw] md:w-[340px] snap-center h-auto transition-transform duration-300"
              style={{
                transform: index === activeIndex ? 'scale(1)' : 'scale(0.95)',
                opacity: index === activeIndex ? 1 : 0.7,
              }}
            >
              <ServiceCard
                service={service}
                onClick={() => onBookService(service)}
                variant="default"
              />
            </div>
          );
        })}
      </div>

      {/* Pagination Dots (Mobile) */}
      {services.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2 md:hidden">
          {services.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                const container = scrollRef.current;
                if (container) {
                  const itemWidth = container.offsetWidth * 0.85 + 16;
                  container.scrollTo({ left: idx * itemWidth, behavior: 'smooth' });
                }
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? 'w-5 bg-neon-yellow shadow-[0_0_6px_rgba(234,179,8,0.5)]'
                  : 'w-1.5 bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
