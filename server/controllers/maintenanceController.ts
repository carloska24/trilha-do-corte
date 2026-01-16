import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

// ==========================================
// CLEANING TOOLS
// ==========================================

export const cleanSchedule = async (req: Request, res: Response) => {
  try {
    const { mode, date } = req.body; // mode: 'past' | 'specific', date: 'YYYY-MM-DD'

    if (mode === 'past') {
      const today = new Date().toISOString().split('T')[0];
      const limitDate = date || today;
      const result = await prisma.appointments.deleteMany({
        where: {
          date: {
            lt: limitDate,
          },
        },
      });
      return res.json({
        message: 'Agendamentos passados removidos com sucesso.',
        count: result.count,
      });
    }

    if (mode === 'specific' && date) {
      const result = await prisma.appointments.deleteMany({
        where: {
          date: date,
        },
      });
      return res.json({ message: `Agendamentos do dia ${date} removidos.`, count: result.count });
    }

    return res.status(400).json({ error: 'Modo inválido ou data não fornecida.' });
  } catch (error) {
    console.error('Error cleaning schedule:', error);
    res.status(500).json({ error: 'Erro ao limpar agenda.' });
  }
};

// ==========================================
// BACKUP TOOLS
// ==========================================

export const createBackup = async (req: Request, res: Response) => {
  try {
    const [clients, appointments, services, barbers, settings] = await Promise.all([
      prisma.clients.findMany(),
      prisma.appointments.findMany(),
      prisma.services.findMany(),
      prisma.barbers.findMany(),
      prisma.shop_settings.findFirst(),
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      version: '2.0',
      data: {
        clients,
        appointments,
        services,
        barbers,
        shopSettings: settings,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=trilha_backup_${Date.now()}.json`);
    res.json(backupData);
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Erro ao criar backup.' });
  }
};

export const restoreBackup = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const backup = JSON.parse(fileContent);

    if (!backup.data) {
      return res.status(400).json({ error: 'Formato de backup inválido.' });
    }

    const { clients, appointments, services, barbers, shopSettings } = backup.data;

    // Transaction to ensure data integrity
    await prisma.$transaction(async tx => {
      // Upsert Clients
      if (clients?.length) {
        for (const client of clients) {
          await tx.clients.upsert({
            where: { id: client.id },
            update: client,
            create: client,
          });
        }
      }

      // Upsert Services
      if (services?.length) {
        for (const service of services) {
          await tx.services.upsert({
            where: { id: service.id },
            update: service,
            create: service,
          });
        }
      }

      // Upsert Appointments
      if (appointments?.length) {
        for (const appt of appointments) {
          // Check if appointment ID exists
          const exists = await tx.appointments.findUnique({ where: { id: appt.id } });
          if (exists) {
            await tx.appointments.update({ where: { id: appt.id }, data: appt });
          } else {
            await tx.appointments.create({ data: appt });
          }
        }
      }

      // Upsert Barbers
      if (barbers?.length) {
        for (const barber of barbers) {
          await tx.barbers.upsert({
            where: { id: barber.id },
            update: barber,
            create: barber,
          });
        }
      }

      // Update Settings
      if (shopSettings) {
        // Assume single settings row logic or ID based
        if (shopSettings.id) {
          await tx.shop_settings.upsert({
            where: { id: shopSettings.id },
            update: shopSettings,
            create: shopSettings,
          });
        }
      }
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ message: 'Backup restaurado com sucesso!' });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ error: 'Erro ao restaurar backup.', details: error.message });
  }
};
