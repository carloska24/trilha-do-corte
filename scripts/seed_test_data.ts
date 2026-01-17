import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Test Appointment...');

  // Get first client
  const client = await prisma.clients.findFirst();
  if (!client) {
    console.error('No clients found to attach appointment!');
    return;
  }

  try {
    const app = await prisma.appointments.create({
      data: {
        clientName: client.name,
        clientId: client.id,
        date: new Date(), // Now DateTime
        time: '14:00',
        status: 'pending',
        serviceId: 'cut_beard', // Assuming this ID exists or is just a string
        price: 50.0,
        notes: 'Test Appointment from debugger',
      },
    });
    console.log('✅ Created Appointment:', app.id);
  } catch (err) {
    console.error('❌ Failed to seed:', err);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
