import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🕵️ Integrity Check...');

  // 1. Check Clients
  console.log('1. Fetching first Client (Full)...');
  try {
    const client = await prisma.clients.findFirst();
    console.log('✅ Client 1 fetched:', client ? client.name : 'None');
  } catch (err: any) {
    console.error('❌ Client Fetch FAILED:', err.message);
  }

  // 2. Check Appointments (Empty query)
  console.log('2. Fetching Appointments (No args)...');
  try {
    const apps = await prisma.appointments.findMany();
    console.log(`✅ Appointments fetched: ${apps.length}`);
  } catch (err: any) {
    console.error('❌ Appointments Fetch FAILED:', err.message);
  }

  // 3. Check Shop Settings
  console.log('3. Fetching Shop Settings...');
  try {
    const settings = await prisma.shop_settings.findFirst();
    console.log('✅ Settings fetched:', settings ? settings.id : 'None');
  } catch (err: any) {
    console.error('❌ Settings Fetch FAILED:', err.message);
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
