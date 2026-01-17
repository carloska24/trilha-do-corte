import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAppointment } from '../../server/controllers/appointmentsController';
import prisma from '../../server/prismaClient';

// Mock Prisma
vi.mock('../../server/prismaClient', () => ({
  default: {
    appointments: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    shop_settings: {
      findFirst: vi.fn(),
    },
    clients: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Integration: Booking Flow (Controller)', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {
        clientName: 'Test Integration',
        serviceId: 'service_1',
        date: '2026-05-20',
        time: '14:00',
        phone: '11999990000',
        clientId: 'existing_client_id',
        price: 50, // Required by Schema
      },
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('should successfully create an appointment when slot is free', async () => {
    // Mock Settings: Open
    (prisma.shop_settings.findFirst as any).mockResolvedValue({
      startHour: 9,
      endHour: 19,
      closedDays: [0], // Sunday
      exceptions: {},
    });

    // Mock Availability: Null means free
    (prisma.appointments.findFirst as any).mockResolvedValue(null);

    // Mock Creation Success
    (prisma.appointments.create as any).mockResolvedValue({
      id: 'new_id',
      ...req.body, // Include price etc
      date: new Date('2026-05-20T00:00:00.000Z'),
      status: 'pending',
    });

    await createAppointment(req, res);

    if (res.status.mock.calls.length > 0 && res.status.mock.calls[0][0] >= 400) {
      console.log('DEBUG Error:', res.json.mock.calls);
    }

    // Expect Success Response
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'success',
        data: expect.objectContaining({
          id: 'new_id',
          time: '14:00',
        }),
      })
    );

    // Verify DB call uses Date object
    expect(prisma.appointments.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          date: expect.any(Date),
          time: '14:00',
          price: 50,
        }),
      })
    );
  });

  it('should reject booking on closed days (Sunday)', async () => {
    (prisma.shop_settings.findFirst as any).mockResolvedValue({
      closedDays: [0], // Sunday
    });

    // 2026-05-17 is a Sunday
    req.body.date = '2026-05-17';

    await createAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('fechada neste dia'),
      })
    );
  });

  it('should reject double booking', async () => {
    (prisma.shop_settings.findFirst as any).mockResolvedValue({
      startHour: 9,
      endHour: 19,
      closedDays: [],
    });

    // Mock Existing Appointment
    (prisma.appointments.findFirst as any).mockResolvedValue({
      id: 'occupied',
    });

    await createAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('já reservado'),
      })
    );
  });
});
