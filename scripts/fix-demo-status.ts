import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Lista agendamentos de hoje
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(today.getDate()).padStart(2, '0')}`;

  console.log(`\nAtualizando agendamentos para ${todayStr}...\n`);

  // Busca agendamentos de hoje com status 'confirmed' ou 'pending'
  const appointments = await prisma.appointments.findMany({
    where: {
      date: todayStr,
      status: { in: ['confirmed', 'pending'] },
    },
  });

  console.log(`Encontrados ${appointments.length} agendamentos para atualizar:\n`);

  // Atualiza para 'completed' os que têm horário no passado
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  for (const appt of appointments) {
    const [h, m] = appt.time.split(':').map(Number);
    const isPast = h < currentHour || (h === currentHour && m < currentMinute);

    if (isPast) {
      await prisma.appointments.update({
        where: { id: appt.id },
        data: { status: 'completed' },
      });
      console.log(`[✓] ${appt.time} - ${appt.clientName} (${appt.status} -> completed)`);
    } else {
      console.log(
        `[⏳] ${appt.time} - ${appt.clientName} (mantido ${appt.status} - horário futuro)`
      );
    }
  }

  console.log('\n✅ Atualização concluída!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
