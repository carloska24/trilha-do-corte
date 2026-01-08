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
      duration: 30,
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
      duration: 60,
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
      duration: 30,
      photoUrl: '',
      clientId: 'c3',
      barberId: 'b1',
    },
  ];

  it('should generate a valid WhatsApp URL with summary', () => {
    const url = generateWhatsAppExportUrl(mockAppointments, '2026-01-01', 'Barber Kyle');

    expect(url).toContain('api.whatsapp.com');
    expect(url).toContain('João');
    expect(url).toContain('Maria');
    expect(url).toContain('Total:');
    expect(url).toContain('R$150'); // 50 + 100 (excludes cancelled)
  });

  it('should handle empty appointments list gracefully', () => {
    const url = generateWhatsAppExportUrl([], '2026-01-01', 'Barber Kyle');
    expect(url).toContain('Nenhum agendamento');
    expect(url).toContain('api.whatsapp.com');
  });
});
