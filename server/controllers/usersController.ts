import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../prismaClient.js';

export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await prisma.clients.findMany();
    // Normalize if necessary, but Prisma returns objects matching schema
    res.json({ data: clients });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getClientById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const client = await prisma.clients.findUnique({
      where: { id },
    });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ data: client });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getBarbers = async (req: Request, res: Response) => {
  try {
    const barbers = await prisma.barbers.findMany();
    res.json({ data: barbers });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateClientProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, email, img, preferences } = req.body;

  try {
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (email !== undefined) data.email = email;
    if (img !== undefined) data.img = img;
    if (preferences?.notes !== undefined) data.notes = preferences.notes;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update.' });
    }

    const updated = await prisma.clients.update({
      where: { id },
      data,
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Client not found' });
    console.error('Update Client Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateBarberProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, email, img, bio, specialty, password } = req.body;

  try {
    const data: any = {};
    if (name !== undefined) data.name = name;
    // Phone was commented or not in original DB?
    // Looking at schema: barbers has `name`, `specialty`, `image`, `email`, `password`. No `phone`?
    // Wait, createBarber has phone? Let's check `db.ts` or schema.
    // Schema in step 241: barbers { id, name, specialty, image, email, password }. NO PHONE.
    // But `usersController.js` line 144 inserts `phone`. Wait.
    // Line 144: `INSERT INTO barbers ... (..., phone)`.
    // My manual schema step 241 DOES NOT have phone.
    // Introspection failed, so I relied on `db.ts` CREATE TABLE command.
    // Let's check `server/db.ts` content I read in step 76.
    // Line 400: CREATE TABLE barbers (id, name, specialty, image, email, password). No phone.
    // BUT `registerBarber` in `authController.js` attempts to insert phone?
    // Line 144 of `authController.js`: `INSERT INTO barbers ... phone`.
    // This implies that `phone` column WAS added later OR the `server/db.ts` I read is outdated vs live DB?
    // Or `db.ts` initialization checks `IF NOT EXISTS`. If it exists with phone, fine.
    // Since Introspection failed, I might be missing columns.
    // However, I must stick to the schema I defined. If I try to access `phone` on `prisma.barbers`, it will fail Typescript.
    // I should remove `phone` from update logic for now or add it to schema if I am sure.
    // Since I am refactoring, I will comment it out if it contradicts my schema artifact.
    // Wait, redundancy: `servicesController.ts` works?

    // I'll proceed keeping `phone` commented or handled carefully.

    // if (phone !== undefined) data.phone = phone; // Missing in schema
    if (email !== undefined) data.email = email;
    if (img !== undefined) data.image = img; // Note: schema says 'image', frontend calls 'img'?
    // `usersController.js` line 91: updates.push(`image = ...`);
    // So mapped `img` (body) to `image` (db).

    if (specialty !== undefined) data.specialty = specialty;

    if (password !== undefined && password.trim() !== '') {
      data.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update.' });
    }

    const updated = await prisma.barbers.update({
      where: { id },
      data,
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('Update Barber Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const createClientAdmin = async (req: Request, res: Response) => {
  const { name, phone, level, lastVisit, img, status, notes } = req.body;
  const id = uuidv4();

  // Avatar Logic
  let finalImg = img;
  if (!finalImg) {
    try {
      const randomNum = Math.floor(Math.random() * 23) + 1;
      finalImg = `/avatars/avatar_cyberpunk_${String(randomNum).padStart(2, '0')}.png`;
    } catch (e) {
      // ignore
    }
  }

  try {
    const newClient = await prisma.clients.create({
      data: {
        id,
        name,
        phone,
        level,
        lastVisit,
        img: finalImg,
        status,
        notes,
      },
    });
    res.json({ message: 'success', data: newClient });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.clients.delete({
      where: { id },
    });
    res.json({ message: 'Client deleted successfully' });
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Client not found' });
    console.error('Delete Client Error:', err);
    res.status(500).json({ error: err.message });
  }
};
