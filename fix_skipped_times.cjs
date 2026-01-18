const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Fixing Corrupted Time Formats (:99) ---');

  // Find all appointments with :99 in time
  const brokenApps = await prisma.appointments.findMany({
    where: {
      time: {
        contains: ':99',
      },
    },
  });

  console.log(`Found ${brokenApps.length} appointments with invalid time format.`);

  for (const app of brokenApps) {
    const cleanTime = app.time.replace(':99', '');
    const currentNotes = app.notes || '';
    const newNotes = currentNotes.includes('[SKIPPED]')
      ? currentNotes
      : currentNotes
        ? `${currentNotes} [SKIPPED]`
        : '[SKIPPED]';

    console.log(
      `Fixing Client: ${app.clientName} | Time: ${app.time} -> ${cleanTime} | Adding Note`
    );

    await prisma.appointments.update({
      where: { id: app.id },
      data: {
        time: cleanTime,
        notes: newNotes,
      },
    });
  }

  console.log('--- Fix Completed ---');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
