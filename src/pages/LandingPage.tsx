import React from 'react';
import { Hero } from '../components/Hero';
import { Services } from '../components/Services';
import { Gallery } from '../components/Gallery';
import { AiConsultant } from '../components/AiConsultant';
import { Footer } from '../components/Footer';
import { PublicAgenda } from '../components/PublicAgenda';
import { useUI } from '../contexts/UIContext';
import { useData } from '../contexts/DataContext';

export const LandingPage: React.FC = () => {
  const { openBooking } = useUI();
  const { services } = useData();

  return (
    <div className="select-none">
      <Hero onOpenBooking={() => openBooking()} />
      <PublicAgenda />
      <Services services={services} onOpenBooking={() => openBooking()} />
      {/* <Gallery /> (Removed at user request) */}
      {/* <AiConsultant onOpenBooking={() => openBooking()} /> (Removed at user request) */}
      <Footer />
    </div>
  );
};
