import { describe, it, expect } from 'vitest';
import { generateWhatsAppExportUrl } from './whatsappUtils';
import { Appointment } from '../types';

describe('whatsappUtils', () => {
  // Mock Data
  const mockAppointments: Appointment[] = [
    {
      id: '1',
      date: '2026-01-01',
      time: '10:00',
      clientName: 'João',
      serviceId: '1',
      status: 'confirmed',
      price: 50,
      photoUrl: '',
      clientId: 'c1',
      barberId: 'b1',
    },
    {
      id: '2',
      date: '2026-01-01',
      time: '11:00',
      clientName: 'Maria',
      serviceId: '2',
      status: 'confirmed',
      price: 100,
      photoUrl: '',
      clientId: 'c2',
      barberId: 'b1',
    },
    {
      id: '3',
      date: '2026-01-01',
      time: '12:00',
      clientName: 'Cancelled Guy',
      serviceId: '1',
      status: 'cancelled',
      price: 50,
      photoUrl: '',
      clientId: 'c3',
      barberId: 'b1',
    },
  ];

  const mockServices: any[] = [
    { id: '1', name: 'Corte', price: 'R$ 50,00', duration: 30 },
    { id: '2', name: 'Barba', price: 'R$ 100,00', duration: 60 }
  ];

  it('should generate a valid WhatsApp URL with summary', () => {
    const url = generateWhatsAppExportUrl({
      appointments: mockAppointments,
      date: new Date('2026-01-01T12:00:00'),
      services: mockServices,
      shopName: 'Barber Kyle',
    });
    const decodedUrl = decodeURIComponent(url);
    console.log('DEBUG URL:', decodedUrl);

    expect(decodedUrl).toContain('api.whatsapp.com');
    expect(decodedUrl).toContain('JOÃO');
    expect(decodedUrl).toContain('MARIA');
    expect(decodedUrl).toContain('Tempo total:');
    expect(decodedUrl).toContain('150,00'); // 50 + 100 (excludes cancelled)
  });

  it('should handle empty appointments list gracefully', () => {
    const url = generateWhatsAppExportUrl({
      appointments: [],
      date: new Date('2026-01-01T12:00:00'),
      services: [],
      shopName: 'Barber Kyle',
    });
    const decodedUrl = decodeURIComponent(url);
    expect(decodedUrl).toContain('Nenhum agendamento');
    expect(decodedUrl).toContain('api.whatsapp.com');
  });
});
