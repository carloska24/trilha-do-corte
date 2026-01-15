import { Request, Response } from 'express';
import prisma from '../prismaClient.js';

export const getSettings = async (req: Request, res: Response) => {
  try {
    // Determine today to filter exceptions if needed, but for now return all or just the active record
    // We assume single tenant for now, so we take the first record or create one
    let settings = await prisma.shop_settings.findFirst();

    if (!settings) {
      settings = await prisma.shop_settings.create({
        data: {
          startHour: 9,
          endHour: 19,
          closedDays: [0], // Sunday
          exceptions: {},
        },
      });
    }

    res.json(settings);
  } catch (error: any) {
    console.error('Get Settings Error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { startHour, endHour, closedDays, exceptions, slotInterval } = req.body;

    // Upsert logic (though findFirst -> update is safer for ID-less update intent)
    const existing = await prisma.shop_settings.findFirst();

    const data = {
      startHour,
      endHour,
      closedDays,
      exceptions: exceptions || {},
      slotInterval,
    };

    let settings;
    if (existing) {
      settings = await prisma.shop_settings.update({
        where: { id: existing.id },
        data,
      });
    } else {
      settings = await prisma.shop_settings.create({
        data,
      });
    }

    res.json(settings);
  } catch (error: any) {
    console.error('Update Settings Error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
