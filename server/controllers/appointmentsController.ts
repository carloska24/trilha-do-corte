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

    // 2. Query Optimization (Prisma)
    let whereClause: any = {};

    // DEFAULT (GUEST): Only fetch future + recent busy slots
    if (!user) {
      whereClause = {
        date: { gte: new Date().toISOString().split('T')[0] }, // Compare string dates YYYY-MM-DD
      };
    }
    // CLIENT: Fetch ONLY their history + future
    else if (!isBarber) {
      whereClause = {
        clientId: user.id,
      };
    }
    // BARBER: Fetch Everything
    else if (isBarber) {
      // Fetch all
    }

    console.log(
      `🔍 [Prisma] GetApps - Strategy: ${
        !user ? 'GUEST (Filtered)' : isBarber ? 'BARBER (Full)' : 'CLIENT (Personal)'
      }`
    );

    const appointments = await prisma.appointments.findMany({
      where: whereClause,
    });

    // 3. Privacy Filter
    const data = appointments.map(row => {
      const isOwner = user && row.clientId === user.id;

      if (isBarber || isOwner) {
        return row; // Full Data
      }

      return {
        // Sanitized for Guests
        date: row.date,
        time: row.time,
        serviceId: row.serviceId,
        status: row.status,
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

    // 1. Check for Double Booking
    const existing = await prisma.appointments.findFirst({
      where: {
        date,
        time,
        NOT: { status: 'cancelled' },
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'Horário já reservado por outro cliente.' });
    }

    // 2. Check Business Rules
    const dateObj = new Date(`${date}T${time}`);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: 'Data ou hora inválida.' });
    }

    const day = dateObj.getDay(); // 0 = Sunday
    const hour = parseInt(time.split(':')[0], 10);

    // Rule: Closed on Sundays
    if (day === 0) {
      return res.status(400).json({ error: 'A barbearia não abre aos domingos!' });
    }

    // Rule: Hours 08:00 - 20:00 (Last slot 19:xx)
    if (hour < 8 || hour > 19) {
      return res.status(400).json({ error: 'Estamos fechados. Horário: 08h às 20h.' });
    }

    // Insert
    const id = uuidv4();
    let finalClientId = clientId || null;

    // --- AUTO-REGISTER GUEST CLIENT LOGIC ---
    if (!finalClientId) {
      try {
        const guestId = uuidv4();
        const guestPhone = validatedData.phone || '';
        const guestName = clientName;

        let existingClientId = null;
        if (guestPhone.length > 8) {
          const found = await prisma.clients.findFirst({
            where: { phone: guestPhone },
            select: { id: true, name: true }, // Select name for comparison
          });

          if (found) {
            // PHONE CONFLICT CHECK
            // If the name provided by the user is significantly different from the saved name, BLOCK IT.
            // Normalize strings for comparison (remove spaces, lowercase)
            const normalize = (s: string) => s.trim().toLowerCase();
            const providedName = normalize(guestName || '');
            const savedName = normalize(found.name || '');

            // Simple logic: If the saved name is NOT contained in the provided name AND vice versa
            // e.g. Saved: "Carlos", Provided: "Carlos A." -> OK
            // Saved: "Carlos", Provided: "Joao" -> BLOCK

            const match = savedName.includes(providedName) || providedName.includes(savedName);

            if (!match) {
              return res.status(409).json({
                error: `Este telefone já está cadastrado para o cliente "${found.name}". Se for você, use o nome completo.`,
              });
            }

            existingClientId = found.id;
          }
        }

        if (existingClientId) {
          finalClientId = existingClientId;
        } else {
          // RANDOM AVATAR
          let randomAvatar = null;
          try {
            // ROBUST RANDOM AVATAR SELECTION
            // Since we know we have avatar_cyberpunk_01.png to 23.png
            try {
              const AVATAR_COUNT = 23;
              const randomNum = Math.floor(Math.random() * AVATAR_COUNT) + 1;
              randomAvatar = `/avatars/avatar_cyberpunk_${String(randomNum).padStart(2, '0')}.png`;
            } catch (e) {
              console.warn('⚠️ Failed to assign random avatar');
            }
          } catch (e) {
            console.warn('⚠️ Failed to select random avatar');
          }

          await prisma.clients.create({
            data: {
              id: guestId,
              name: guestName,
              phone: guestPhone,
              level: 1,
              lastVisit: 'Nunca',
              status: 'guest',
              notes: 'Cliente Visitante (Auto)',
              img: randomAvatar,
            },
          });
          finalClientId = guestId;
        }
      } catch (e) {
        console.warn('⚠️ Failed to auto-create guest', e);
      }
    }

    const newAppointment = await prisma.appointments.create({
      data: {
        id,
        clientName,
        serviceId,
        date,
        time,
        status: status || 'pending',
        price,
        photoUrl,
        notes,
        clientId: finalClientId,
      },
    });

    // --- CLIENT LIFECYCLE: Promote 'Guest/New' to 'Active' on Booking ---
    if (finalClientId) {
      try {
        const client = await prisma.clients.findUnique({
          where: { id: finalClientId },
          select: { status: true },
        });

        if (client && (client.status === 'guest' || client.status === 'new')) {
          await prisma.clients.update({
            where: { id: finalClientId },
            data: { status: 'active' },
          });
          console.log(`✨ Client ${finalClientId} promoted to ACTIVE.`);
        }
      } catch (e) {
        console.warn('⚠️ Failed to update client status', e);
      }
    }

    res.json({
      message: 'success',
      data: newAppointment,
    });
  } catch (e: any) {
    if (e.code === 'P2002') {
      // Prisma Unique constraint code
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
    // Prisma treats updates simply. undefined fields in data are ignored if passed as undefined?
    // Actually, we must construct the data object only with defined fields
    const data: any = {};
    if (status !== undefined) data.status = status;
    if (date !== undefined) data.date = date;
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

      // --- CLIENT LIFECYCLE: Gamification & History ---
      if (status === 'completed' && updated.clientId) {
        try {
          // Format Date YYYY-MM-DD -> DD/MM/YYYY
          let formattedDate = new Date().toLocaleDateString('pt-BR'); // Default to today
          if (updated.date) {
            const [y, m, d] = updated.date.split('-');
            formattedDate = `${d}/${m}/${y}`;
          }

          await prisma.clients.update({
            where: { id: updated.clientId },
            data: {
              status: 'active', // Ensure active
              lastVisit: formattedDate,
              level: { increment: 1 },
            },
          });
          console.log(`✨ Client ${updated.clientId} leveled up! Last visit: ${formattedDate}`);
        } catch (e) {
          console.error('⚠️ Failed to update client stats:', e);
        }
      }

      res.json({
        success: true,
        message: 'Agendamento atualizado com sucesso.',
        data: updated,
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
  try {
    await prisma.appointments.deleteMany();
    res.json({ message: 'Agenda limpa com sucesso.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
