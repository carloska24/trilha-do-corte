import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../prismaClient.js'; // Note: .js extension for TS execution with tsx/ESM

export const getServices = async (req: Request, res: Response) => {
  try {
    // Prisma returns strict types matchinig the Schema
    const rawServices = await prisma.services.findMany();

    // Transform JSON strings back to objects if valid
    const services = rawServices.map(row => ({
      ...row,
      activePromo: row.activePromo ? JSON.parse(row.activePromo) : null,
      badges: row.badges ? JSON.parse(row.badges) : [],
    }));

    res.json({ data: services });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const createService = async (req: Request, res: Response) => {
  const {
    name,
    price,
    priceValue,
    description,
    icon,
    image,
    activePromo,
    category,
    duration,
    badges,
  } = req.body;

  const id = uuidv4();

  try {
    await prisma.services.create({
      data: {
        id,
        name,
        price,
        priceValue,
        description,
        icon,
        image,
        activePromo: activePromo ? JSON.stringify(activePromo) : null,
        category: category || 'Outros',
        duration: duration || 30,
        badges: badges ? JSON.stringify(badges) : null,
      },
    });

    res.json({
      message: 'success',
      data: { id, name, price, priceValue, description, icon, image, activePromo, badges },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateService = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    price,
    priceValue,
    description,
    icon,
    image,
    activePromo,
    category,
    duration,
    badges,
  } = req.body;

  try {
    await prisma.services.update({
      where: { id },
      data: {
        name,
        price,
        priceValue,
        description,
        icon,
        image,
        activePromo: activePromo ? JSON.stringify(activePromo) : null,
        category: category || 'Outros',
        duration: duration || 30,
        badges: badges ? JSON.stringify(badges) : null,
      },
    });

    res.json({
      message: 'updated',
      data: {
        id,
        name,
        price,
        priceValue,
        description,
        icon,
        image,
        activePromo,
        category,
        duration,
        badges,
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.services.delete({
      where: { id },
    });
    res.json({ message: 'deleted', id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
