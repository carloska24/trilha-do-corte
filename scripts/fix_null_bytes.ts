import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning Null Bytes (0x00) from Text Columns via Raw SQL...');

  const appointmentCols = [
    'clientname', // DB column names (lowercase usually in Postgres if unquoted, but Prisma maps them. Let's use quoted DB names if possible, or try both)
    'time',
    'status',
    'notes',
    'clientid',
    'barberid',
    'serviceid',
    'photourl',
  ];

  const clientCols = ['name', 'phone', 'img', 'notes', 'email'];

  // Appointments
  for (const col of appointmentCols) {
    try {
      // Unconditional Update: cleaning everything just in case
      // Use E'\\000' (Postgres C-style escape for null byte)
      const query = `UPDATE appointments SET "${col}" = REPLACE("${col}", E'\\000', '')`;
      const result = await prisma.$executeRawUnsafe(query);
      console.log(`Executed cleanup on appointments.${col} (Rows affected: ${result})`);
    } catch (err) {
      console.error(`Error cleaning appointments.${col}:`, err);
    }
  }

  // Clients
  for (const col of clientCols) {
    try {
      const query = `UPDATE clients SET "${col}" = REPLACE("${col}", E'\\000', '')`;
      const result = await prisma.$executeRawUnsafe(query);
      console.log(`Executed cleanup on clients.${col} (Rows affected: ${result})`);
    } catch (err) {
      console.error(`Error cleaning clients.${col}:`, err);
    }
  }

  console.log('🏁 Cleanup finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
