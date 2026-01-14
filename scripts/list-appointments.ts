// Script para listar agendamentos existentes
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const appointments = await prisma.appointments.findMany({
    where: {
      date: { in: ['2026-01-13', '2026-01-14'] },
    },
    select: {
      date: true,
      time: true,
      clientName: true,
      status: true,
    },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  });

  console.log('Agendamentos existentes:');
  console.log('========================');
  appointments.forEach(a => {
    console.log(`${a.date} ${a.time} - ${a.clientName} (${a.status})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
