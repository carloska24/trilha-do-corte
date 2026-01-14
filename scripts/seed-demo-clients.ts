// Script para criar clientes de teste demonstrando todos os tiers
// Executar: npx tsx scripts/seed-demo-clients.ts

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const DEMO_CLIENTS = [
  // BRONZE (Level 1-2)
  {
    name: 'Rafael Silva',
    phone: '11999990001',
    level: 1,
    status: 'active',
    notes: 'Cliente novo',
    img: '/avatars/avatar_cyberpunk_01.png',
    lastVisit: '10/01/2026',
  },
  {
    name: 'Bruno Santos',
    phone: '11999990002',
    level: 2,
    status: 'active',
    notes: 'Preferência: corte degradê',
    img: '/avatars/avatar_cyberpunk_02.png',
    lastVisit: '08/01/2026',
  },

  // SILVER (Level 3-4)
  {
    name: 'Leonardo Costa',
    phone: '11999990003',
    level: 3,
    status: 'active',
    notes: 'Cliente regular',
    img: '/avatars/avatar_cyberpunk_03.png',
    lastVisit: '05/01/2026',
  },
  {
    name: 'Matheus Oliveira',
    phone: '11999990004',
    level: 4,
    status: 'active',
    notes: 'Barba sempre alinhada',
    img: '/avatars/avatar_cyberpunk_04.png',
    lastVisit: '07/01/2026',
  },

  // GOLD (Level 5-7)
  {
    name: 'Fernando Almeida',
    phone: '11999990005',
    level: 5,
    status: 'vip',
    notes: 'Cliente fiel há 2 anos',
    img: '/avatars/avatar_cyberpunk_05.png',
    lastVisit: '12/01/2026',
  },
  {
    name: 'Gabriel Ferreira',
    phone: '11999990006',
    level: 6,
    status: 'vip',
    notes: 'VIP - Combo mensal',
    img: '/avatars/avatar_cyberpunk_06.png',
    lastVisit: '11/01/2026',
  },
  {
    name: 'Lucas Mendes',
    phone: '11999990007',
    level: 7,
    status: 'vip',
    notes: 'Corte + Barba sempre',
    img: '/avatars/avatar_cyberpunk_07.png',
    lastVisit: '09/01/2026',
  },

  // PLATINUM (Level 8-10) 👑
  {
    name: 'Ricardo Souza',
    phone: '11999990008',
    level: 8,
    status: 'vip',
    notes: 'Cliente PLATINUM - Tratamento VIP',
    img: '/avatars/avatar_cyberpunk_08.png',
    lastVisit: '13/01/2026',
  },
  {
    name: 'André Martins',
    phone: '11999990009',
    level: 9,
    status: 'vip',
    notes: 'Elite - Sempre reserva premium',
    img: '/avatars/avatar_cyberpunk_09.png',
    lastVisit: '12/01/2026',
  },
  {
    name: 'Thiago Rocha',
    phone: '11999990010',
    level: 10,
    status: 'vip',
    notes: 'MASTER VIP - Cliente desde abertura',
    img: '/avatars/avatar_cyberpunk_10.png',
    lastVisit: '13/01/2026',
  },

  // PROVISÓRIO (sem telefone válido)
  {
    name: 'Cliente Provisório',
    phone: '00000000000',
    level: 1,
    status: 'new',
    notes: 'Criado via IA - aguardando formalização',
    img: '/avatars/avatar_cyberpunk_11.png',
    lastVisit: 'Nunca',
  },

  // 🔥 HOT CLIENT (3+ serviços no mês)
  {
    name: 'Diego Flames',
    phone: '11999990099',
    level: 6,
    status: 'vip',
    notes: '🔥 CLIENTE QUENTE - Frequência alta',
    img: '/avatars/avatar_cyberpunk_12.png',
    lastVisit: '13/01/2026',
  },
];

// Get current month dates for HOT client appointments
const getThisMonthDates = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return [
    `${year}-${month}-05`,
    `${year}-${month}-10`,
    `${year}-${month}-12`,
    `${year}-${month}-13`,
  ];
};

async function main() {
  console.log('🚀 Seeding demo clients...');

  // First, get the barber ID
  const barber = await prisma.barbers.findFirst();
  if (!barber) {
    console.error('❌ No barber found. Please create a barber first.');
    return;
  }

  const barberId = barber.id;
  console.log(`👤 Using barber: ${barber.name} (${barberId})`);

  // Create clients
  for (const clientData of DEMO_CLIENTS) {
    // Check if client already exists
    const existing = await prisma.clients.findFirst({
      where: { phone: clientData.phone },
    });

    if (existing) {
      // Update level if exists
      await prisma.clients.update({
        where: { id: existing.id },
        data: {
          level: clientData.level,
          status: clientData.status,
          notes: clientData.notes,
          img: clientData.img,
          lastVisit: clientData.lastVisit,
        },
      });
      console.log(`📝 Updated: ${clientData.name} (Level ${clientData.level})`);

      // If this is Diego Flames (HOT client), create appointments
      if (clientData.name === 'Diego Flames') {
        const dates = getThisMonthDates();
        for (const date of dates) {
          const existingAppt = await prisma.appointments.findFirst({
            where: { clientId: existing.id, date },
          });
          if (!existingAppt) {
            await prisma.appointments.create({
              data: {
                id: crypto.randomUUID(),
                clientId: existing.id,
                clientName: clientData.name,
                barberId,
                serviceId: 's1',
                date,
                time: '10:00',
                price: 35,
                status: 'completed',
                notes: 'Servico concluido',
              },
            });
            console.log(`📅 Created appointment for Diego on ${date}`);
          }
        }
      }
    } else {
      // Create new client
      const created = await prisma.clients.create({
        data: {
          id: crypto.randomUUID(),
          name: clientData.name,
          phone: clientData.phone,
          level: clientData.level,
          status: clientData.status,
          notes: clientData.notes,
          img: clientData.img,
          lastVisit: clientData.lastVisit,
        },
      });
      console.log(`✅ Created: ${clientData.name} (Level ${clientData.level})`);

      // If this is Diego Flames (HOT client), create appointments
      if (clientData.name === 'Diego Flames') {
        const dates = getThisMonthDates();
        for (const date of dates) {
          await prisma.appointments.create({
            data: {
              id: crypto.randomUUID(),
              clientId: created.id,
              clientName: clientData.name,
              barberId,
              serviceId: 's1',
              date,
              time: '10:00',
              price: 35,
              status: 'completed',
              notes: 'Servico concluido',
            },
          });
          console.log(`📅 Created appointment for Diego on ${date}`);
        }
      }
    }
  }

  console.log('\n🎉 Demo clients seeded successfully!');
  console.log('📊 Summary:');
  console.log('  - BRONZE (1-2): 2 clients');
  console.log('  - SILVER (3-4): 2 clients');
  console.log('  - GOLD (5-7): 3 clients');
  console.log('  - PLATINUM (8-10): 3 clients 👑');
  console.log('  - PROVISÓRIO: 1 client');
  console.log('  - HOT 🔥: 1 client (Diego Flames with 4 appointments this month)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
