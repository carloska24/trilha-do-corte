import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAppointment } from '../../server/controllers/appointmentsController';
import prisma from '../../server/prismaClient';

// Mock Prisma
vi.mock('../../server/prismaClient', () => ({
  default: {
    appointments: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    shopSettings: {
      findFirst: vi.fn(),
    },
    clients: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Integration: Self-Healing & Appointment Flows', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Default Requests
    req = {
      body: {
        clientName: 'Test Client',
        serviceId: 'service_1',
        date: '2026-06-15', // a Monday
        time: '10:00',
        price: 100,
        phone: '11999998888', // Explicitly sending phone
        // Note: clientId might be missing/null in some flows
      },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // Default Settings (Open)
    (prisma.shopSettings.findFirst as any).mockResolvedValue({
      startHour: 9,
      endHour: 20,
      closedDays: [0], // Sunday
      exceptions: {},
    });

    // Default: No double booking
    (prisma.appointments.findFirst as any).mockResolvedValue(null);

    // Default: Appointment Create Success
    (prisma.appointments.create as any).mockResolvedValue({
      id: 'new_app_id',
      status: 'pending',
    });
  });

  it('Scenario 1: New Client (Not Found) -> Should Auto-Create Client with Avatar & Phone', async () => {
    // Mock Client Not Found
    (prisma.clients.findFirst as any).mockResolvedValue(null);

    await createAppointment(req, res);

    expect(prisma.clients.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Test Client',
          phone: '11999998888',
          img: expect.stringContaining('/avatars/avatar_cyberpunk_'), // Verify Avatar Generation
        }),
      })
    );

    // Verify Appointment Linked to New Client
    expect(prisma.appointments.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          clientId: expect.any(String), // Should match the ID from create
        }),
      })
    );
  });

  it('Scenario 2: Existing Client Found by Phone (Missing Avatar) -> Should Backfill Avatar', async () => {
    // Mock Found by Phone
    (prisma.clients.findFirst as any).mockResolvedValue({
      id: 'existing_client_id',
      name: 'Test Client',
      phone: '11999998888',
      img: null, // MISSING AVATAR
    });

    await createAppointment(req, res);

    // Should call UPDATE to backfill avatar
    expect(prisma.clients.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'existing_client_id' },
        data: expect.objectContaining({
          img: expect.stringContaining('/avatars/avatar_cyberpunk_'),
        }),
      })
    );
  });

  it('Scenario 3: Existing Client Found by Name (Missing Phone & Avatar) -> Should Backfill BOTH', async () => {
    // Mock Not Found by Phone
    (prisma.clients.findFirst as any)
      .mockResolvedValueOnce(null) // 1st call (by phone) -> null
      .mockResolvedValueOnce({
        // 2nd call (by name) -> Found, but incomplete
        id: 'found_by_name_id',
        name: 'Test Client', // Case insensitive match expected
        phone: '00000000000', // Placeholder
        img: null, // Missing
      });

    req.body.clientName = 'Test Client'; // Name match input

    await createAppointment(req, res);

    // Verify Update called with BOTH fields
    expect(prisma.clients.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'found_by_name_id' },
        data: expect.objectContaining({
          phone: '11999998888', // New Phone
          img: expect.stringContaining('/avatars/avatar_cyberpunk_'), // New Avatar
        }),
      })
    );
  });

  it('Scenario 4: Fully Complete Existing Client -> Should Just Link (No Updates)', async () => {
    // Mock Found by Phone (Complete)
    (prisma.clients.findFirst as any).mockResolvedValue({
      id: 'complete_client_id',
      name: 'Test Client',
      phone: '11999998888',
      img: '/avatars/custom.png',
    });

    await createAppointment(req, res);

    // Should NOT Update
    expect(prisma.clients.update).not.toHaveBeenCalled();

    // Should Link
    expect(prisma.appointments.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          clientId: 'complete_client_id',
        }),
      })
    );
  });
});
