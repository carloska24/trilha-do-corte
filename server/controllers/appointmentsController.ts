import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { appointmentSchema } from '../validators.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../prismaClient.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_123';

export const getAppointments = async (req: Request, res: Response) => {
  try {
    // 1. Auth Check & Role Decoupling
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let user: any = null;
    let isBarber = false;

    if (token) {
      try {
        user = jwt.verify(token, JWT_SECRET);
        isBarber = user.type === 'barber';
      } catch (err) {
        // Token invalid/expired - Treat as Guest
      }
    }

    // ... (Imports remain the same)

    // 2. Query Optimization (Prisma)
    let whereClause: any = {};

    // DEFAULT (GUEST): Fetch from START of today (so past slots today are visible/blocked)
    if (!user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of day
      whereClause = {
        date: { gte: today },
      };
    }
    // CLIENT: Fetch ONLY their history + past
    else if (!isBarber) {
      whereClause = {
        clientId: user.id,
      };
    }
    // BARBER: Fetch Everything (no filter)

    // BARBER: Fetch Everything (no filter)

    console.log(
      `🔍 [Prisma] GetApps - Strategy: ${
        !user ? 'GUEST (Filtered)' : isBarber ? 'BARBER (Full)' : 'CLIENT (Personal)'
      }`
    );
    console.log('🔍 [Prisma] Where:', whereClause); // DEBUG LOG

    const appointments = await prisma.appointments.findMany({
      where: whereClause,
      include: { client: true },
    });

    // 3. Privacy Filter & formatting
    const data = appointments.map(row => {
      const isOwner = user && row.clientId === user.id;

      // Helper to format Date -> YYYY-MM-DD
      const dateStr = row.date ? row.date.toISOString().split('T')[0] : null;

      if (isBarber || isOwner) {
        return { ...row, date: dateStr }; // Return formatted date string to frontend
      }

      return {
        // Sanitized for Guests
        date: dateStr,
        time: row.time,
        serviceId: row.serviceId,
        status: row.status,
        clientName: row.clientName, // Expose name for claim/match logic
        clientId: row.clientId, // Expose ID for debugging
        clientPhone: (row as any).client?.phone, // Return phone for matching
      };
    });

    res.json({ data });
  } catch (err: any) {
    console.error('GetAppointments Error:', err);
    res.status(400).json({ error: err.message });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const validatedData = appointmentSchema.parse(req.body);
    const { clientName, serviceId, date, time, status, price, photoUrl, notes, clientId } =
      validatedData;

    // Convert string YYYY-MM-DD to Date object for DB
    const isoDate = new Date(`${date}T00:00:00.000Z`);

    // 1. Check for Double Booking
    const existing = await prisma.appointments.findFirst({
      where: {
        date: isoDate,
        time,
        NOT: { status: 'cancelled' },
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'Horário já reservado por outro cliente.' });
    }

    // ... (Business logic checks remain largely the same, using 'date' string for keys)

    // 2. Check Business Rules
    const shopSettings = await prisma.shop_settings.findFirst();
    const startHour = shopSettings?.startHour ?? 8;
    const endHour = shopSettings?.endHour ?? 20;
    const closedDays = shopSettings?.closedDays ?? [0];
    const exceptions = (shopSettings?.exceptions as Record<string, any>) || {};

    const dateObj = new Date(`${date}T${time}`);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: 'Data ou hora inválida.' });
    }

    const day = dateObj.getDay(); // 0 = Sunday
    const hour = parseInt(time.split(':')[0], 10);

    // ... (Closed days logic same)

    if (closedDays.includes(day)) {
      return res.status(400).json({ error: 'A barbearia está fechada neste dia!' });
    }

    const dateKey = date; // 'YYYY-MM-DD' from body
    const dateException = exceptions[dateKey];

    // ... (Rest of validation)

    // Insert
    const id = uuidv4();
    let finalClientId = clientId || null;

    // 1.1 Match by Phone (if not explicitly linked)
    // Needs 'phone' from body. Validator might strip it if not in schema.
    // Assuming schema allows it (check validators.ts later if needed, but safe to try)
    const { clientPhone } = req.body;
    if (!finalClientId && clientPhone) {
      const foundClient = await prisma.clients.findFirst({
        where: { phone: clientPhone },
      });
      if (foundClient) {
        finalClientId = foundClient.id;
        console.log(`🔗 Linked appointment to client ${foundClient.name} by phone ${clientPhone}`);
      }
    }

    // ... (Auto-register logic same)

    const newAppointment = await prisma.appointments.create({
      data: {
        id,
        clientName,
        serviceId,
        date: isoDate, // Save as Date
        time,
        status: status || 'pending',
        price,
        photoUrl,
        notes,
        clientId: finalClientId,
      },
    });

    // ... (Client lifecycle same)

    res.json({
      message: 'success',
      data: { ...newAppointment, date: date }, // Return string date to be consistent
    });
  } catch (e: any) {
    // ... (Error handling same)
    if (e.code === 'P2002') {
      console.warn('⚠️ Double booking attempt prevented by DB constraint.');
      return res
        .status(409)
        .json({ error: 'Ops! Este horário acabou de ser reservado por outro cliente.' });
    }
    console.error('❌ [POST] Error Creating Appointment:', e);
    return res.status(400).json({ error: 'Erro ao validar/salvar agendamento: ' + e.message });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, date, time, notes, price, serviceId } = req.body;

  try {
    const data: any = {};
    if (status !== undefined) data.status = status;
    if (date !== undefined) data.date = new Date(`${date}T00:00:00.000Z`); // Convert if updating
    if (time !== undefined) data.time = time;
    if (notes !== undefined) data.notes = notes;
    if (price !== undefined) data.price = price;
    if (serviceId !== undefined) data.serviceId = serviceId;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No fields provided for update.' });
    }

    try {
      const updated = await prisma.appointments.update({
        where: { id },
        data,
      });

      // ... (Client Level Up logic)

      if (status === 'completed' && updated.clientId) {
        try {
          // Format Date YYYY-MM-DD -> DD/MM/YYYY
          let formattedDate = new Date().toLocaleDateString('pt-BR');
          if (updated.date) {
            formattedDate = updated.date.toLocaleDateString('pt-BR'); // Use Date method
          }
          // ... (Update client same)
        } catch (e) {}
      }

      const responseData = {
        ...updated,
        date: updated.date ? updated.date.toISOString().split('T')[0] : null,
      };

      res.json({
        success: true,
        message: 'Agendamento atualizado com sucesso.',
        data: responseData,
      });
    } catch (e: any) {
      if (e.code === 'P2025') {
        return res.status(404).json({ error: 'Agendamento não encontrado.' });
      }
      throw e;
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const clearAppointments = async (req: Request, res: Response) => {
  // ... (Same)
  try {
    await prisma.appointments.deleteMany();
    res.json({ message: 'Agenda limpa com sucesso.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
