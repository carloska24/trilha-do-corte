// Script para CORRIGIR agendamentos de teste
// - Servicos validos (s1=Corte, s3=Barba, s15=Corte+Barba)
// - Avatares nos clientes
// Executar: npx tsx scripts/seed-test-appointments.ts

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Data de hoje formatada
const today = new Date();
const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

// Data de amanha
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];

// SERVICOS VALIDOS DO SISTEMA:
// s1 = Corte (R$ 35)
// s3 = Barba (R$ 25)
// s15 = Corte + Barba (R$ 55)
// s12 = Sobrancelha (R$ 10)
// s6 = Pezinho (R$ 10)

interface TestAppointment {
  clientName: string;
  phone: string;
  time: string;
  date: string;
  serviceId: string;
  serviceName: string;
  price: number;
  origin: 'chat_ai' | 'landing_page' | 'voice_command';
  status: string;
  notes: string;
  avatar: string;
}

// Agendamentos de teste por canal - SERVICOS VALIDOS + AVATARES
const TEST_APPOINTMENTS: TestAppointment[] = [
  // ========== CHAT AI (2 agendamentos - PROVISORIOS) ==========
  {
    clientName: 'Carlos Chat',
    phone: '00000000001',
    time: '14:30',
    date: todayStr,
    serviceId: 's1', // Corte
    serviceName: 'Corte',
    price: 35,
    origin: 'chat_ai',
    status: 'pending',
    notes: '[CHAT AI] Cliente agendou pelo chat - PROVISORIO',
    avatar: '/avatars/avatar_cyberpunk_13.png',
  },
  {
    clientName: 'Marcos Chat',
    phone: '00000000002',
    time: '15:30',
    date: todayStr,
    serviceId: 's15', // Corte + Barba
    serviceName: 'Corte + Barba',
    price: 55,
    origin: 'chat_ai',
    status: 'pending',
    notes: '[CHAT AI] Cliente agendou pelo chat - PROVISORIO',
    avatar: '/avatars/avatar_cyberpunk_14.png',
  },

  // ========== LANDING PAGE (2 agendamentos) ==========
  {
    clientName: 'Pedro Landing',
    phone: '11988887777',
    time: '16:30',
    date: todayStr,
    serviceId: 's1', // Corte
    serviceName: 'Corte',
    price: 35,
    origin: 'landing_page',
    status: 'confirmed',
    notes: '[LANDING PAGE] Agendamento via site publico',
    avatar: '/avatars/avatar_cyberpunk_15.png',
  },
  {
    clientName: 'Lucas Landing',
    phone: '11966665555',
    time: '13:00',
    date: tomorrowStr,
    serviceId: 's3', // Barba
    serviceName: 'Barba',
    price: 25,
    origin: 'landing_page',
    status: 'confirmed',
    notes: '[LANDING PAGE] Agendamento via site publico',
    avatar: '/avatars/avatar_cyberpunk_16.png',
  },

  // ========== MICROFONE DO BARBEIRO (2 agendamentos) ==========
  {
    clientName: 'Joao Voz',
    phone: '11999998888',
    time: '10:30',
    date: todayStr,
    serviceId: 's1', // Corte
    serviceName: 'Corte',
    price: 35,
    origin: 'voice_command',
    status: 'confirmed',
    notes: '[VOZ] Barbeiro agendou por comando de voz',
    avatar: '/avatars/avatar_cyberpunk_17.png',
  },
  {
    clientName: 'Felipe Voz',
    phone: '11977776666',
    time: '14:00',
    date: tomorrowStr,
    serviceId: 's12', // Sobrancelha
    serviceName: 'Sobrancelha',
    price: 10,
    origin: 'voice_command',
    status: 'confirmed',
    notes: '[VOZ] Barbeiro agendou por comando de voz',
    avatar: '/avatars/avatar_cyberpunk_18.png',
  },
];

async function main() {
  console.log('Limpando agendamentos e clientes de teste anteriores...');

  // Deletar agendamentos de teste anteriores (pelos nomes)
  const testNames = [
    'Carlos Chat',
    'Marcos Chat',
    'Pedro Landing',
    'Lucas Landing',
    'Joao Voz',
    'Felipe Voz',
  ];

  await prisma.appointments.deleteMany({
    where: { clientName: { in: testNames } },
  });

  // Deletar clientes de teste tambem para recriar com avatares
  const testPhones = [
    '00000000001',
    '00000000002',
    '11988887777',
    '11966665555',
    '11999998888',
    '11977776666',
  ];
  await prisma.clients.deleteMany({
    where: { phone: { in: testPhones } },
  });

  console.log('Dados de teste anteriores removidos.\n');

  console.log('Criando novos agendamentos de teste...\n');

  // Buscar barbeiro
  const barber = await prisma.barbers.findFirst();
  if (!barber) {
    console.error('Nenhum barbeiro encontrado. Crie um barbeiro primeiro.');
    return;
  }
  console.log(`Barbeiro: ${barber.name} (${barber.id})\n`);

  let created = 0;
  let skipped = 0;

  // Criar clientes e agendamentos
  for (const appt of TEST_APPOINTMENTS) {
    const isProvisional = appt.origin === 'chat_ai';

    // Criar cliente COM AVATAR
    const client = await prisma.clients.create({
      data: {
        id: crypto.randomUUID(),
        name: appt.clientName,
        phone: appt.phone,
        level: 1,
        status: isProvisional ? 'new' : 'active',
        notes: isProvisional ? 'Cliente provisorio via Chat AI' : `Cliente via ${appt.origin}`,
        lastVisit: 'Nunca',
        img: appt.avatar, // AVATAR!
      },
    });
    console.log(`[+] Cliente: ${client.name} (avatar: ${appt.avatar})`);

    // VALIDACAO DE CONFLITO
    const existingAppt = await prisma.appointments.findFirst({
      where: {
        date: appt.date,
        time: appt.time,
      },
    });

    if (existingAppt) {
      console.log(
        `[CONFLITO] ${appt.date} ${appt.time} ja ocupado por ${existingAppt.clientName}!`
      );
      skipped++;
      continue;
    }

    // Criar agendamento com SERVICO VALIDO
    await prisma.appointments.create({
      data: {
        id: crypto.randomUUID(),
        clientId: client.id,
        clientName: appt.clientName,
        barberId: barber.id,
        serviceId: appt.serviceId,
        date: appt.date,
        time: appt.time,
        price: appt.price,
        status: appt.status,
        notes: appt.notes,
      },
    });

    const originLabel = {
      chat_ai: 'CHAT AI (PROVISORIO)',
      landing_page: 'LANDING PAGE',
      voice_command: 'VOZ BARBEIRO',
    };

    console.log(
      `[OK] ${originLabel[appt.origin]}: ${appt.clientName} - ${appt.serviceName} - ${appt.date} ${
        appt.time
      }`
    );
    created++;
  }

  console.log('\n======================================');
  console.log(`Total: ${created} criados, ${skipped} pulados`);
  console.log('======================================\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
