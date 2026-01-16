import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRESERVE_CLIENT_ID = '3794436f-7498-4c6d-9443-d58ae05e2fd9'; // Carlos A

async function main() {
  console.log('🚀 Iniciando limpeza para entrega...');

  // 1. Delete ALL Appointments
  const deletedAppointments = await prisma.appointments.deleteMany({});
  console.log(`✅ ${deletedAppointments.count} agendamentos removidos.`);

  // 2. Delete All Clients EXCEPT Carlos
  const deletedClients = await prisma.clients.deleteMany({
    where: {
      id: {
        not: PRESERVE_CLIENT_ID,
      },
    },
  });
  console.log(`✅ ${deletedClients.count} clientes de teste removidos.`);

  // Verify Carlos still exists
  const carlos = await prisma.clients.findUnique({ where: { id: PRESERVE_CLIENT_ID } });
  if (carlos) {
    console.log(`👤 Cliente preservado: ${carlos.name} (${carlos.phone})`);
  } else {
    console.error('⚠️ ALERTA: Carlos não encontrado após limpeza!');
  }

  console.log('🏁 Sistema pronto para entrega!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
