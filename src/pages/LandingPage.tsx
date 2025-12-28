import React from 'react';
import { Hero } from '../components/Hero';
import { Services } from '../components/Services';
import { Gallery } from '../components/Gallery';
import { AiConsultant } from '../components/AiConsultant';
import { Footer } from '../components/Footer';
import { useUI } from '../contexts/UIContext';
import { useData } from '../contexts/DataContext';

export const LandingPage: React.FC = () => {
  const { openBooking } = useUI();
  const { services } = useData();

  return (
    <>
      <Hero onOpenBooking={() => openBooking()} />
      <Services services={services} onOpenBooking={() => openBooking()} />
      <Gallery />
      <AiConsultant onOpenBooking={() => openBooking()} />
      <Footer />
    </>
  );
};
