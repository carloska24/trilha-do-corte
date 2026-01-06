import { z } from 'zod';

export const loginSchema = z.object({
  emailOrPhone: z.string().min(3, 'Email ou telefone inválido'), // Flexible
  password: z.string().min(1, 'Senha obrigatória'),
});

export const loginBarberSchema = z.object({
  email: z.string().email('Formato de email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export const registerClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido (mínimo 10 dígitos)'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  photoUrl: z.string().optional(),
});

export const registerBarberSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  photoUrl: z.string().optional(),
});

export const appointmentSchema = z.object({
  clientName: z.string().min(1, 'Nome do cliente obrigatório'),
  serviceId: z.string().uuid().or(z.string().min(1)), // UUID or ID string
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (formato YYYY-MM-DD)'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida (formato HH:MM)'),
  price: z.number().nonnegative(),
  clientId: z.string().optional(), // Can be null for Guest
  status: z.string().optional(),
  notes: z.string().optional(),
  photoUrl: z.string().optional(),
  phone: z.string().optional(),
});
