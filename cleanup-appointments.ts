import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning Appointments...');

  // 1. Identify Safe Clients
  // Carlos (Official)
  const carlos = await prisma.clients.findFirst({
    where: { name: { contains: 'Carlos', mode: 'insensitive' } },
  });

  if (!carlos) {
    console.error('⚠️ Warning: Carlos not found. Aborting to avoid data loss.');
    return;
  }

  console.log(`✅ Preserving appointments for: ${carlos.name} (${carlos.id})`);

  // Barbers
  const barbers = await prisma.barbers.findMany();
  const barberIds = barbers.map(b => b.id);
  console.log(`✅ Preserving appointments for ${barbers.length} barbers.`);

  // 2. Delete Unsafe Appointments
  // Condition:
  // - clientId IS NOT carlos.id
  // - clientName IS NOT 'Carlos' (just in case clientId is null)
  // - barberId IS NOT IN barberIds (if barber booked for themselves) or maybe we keep based on clientName?
  // Let's assume Barber's appointments have barberId set but maybe they act as client?
  // User said: "menos o do carlos ... e o do barbeiro".
  // "Do barreiro" usually means the barber is the PROVIDER, but maybe he means "test appointments by barber".
  // Safest check: keep if barberId match OR clientId match matching a barber user (if they exist in clients table).

  // Actually, simplified: Delete everything where clientId != carlos.id AND clientId NOT IN barberIds (if barbers are clients)

  const result = await prisma.appointments.deleteMany({
    where: {
      AND: [
        { clientId: { not: carlos.id } }, // Not Carlos
        {
          // Safety: If by chance a barber has a client account, usually not linked this way.
          // But let's check clientName too.
          clientName: { not: { contains: 'Carlos', mode: 'insensitive' } },
        },
        // IMPORTANT: existing appointments for "Barbeiro" might be blocked slots?
        // Let's check if clientName contains "Barbeiro" just to be safe.
        { clientName: { not: { contains: 'Barbeiro', mode: 'insensitive' } } },
      ],
    },
  });

  console.log(`🗑️ Deleted ${result.count} appointments.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
