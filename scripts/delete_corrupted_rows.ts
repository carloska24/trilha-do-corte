import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('💀 Search & Destroy: Finding and Deleting corrupted rows (0x00)...');

  // 1. Fetch all IDs (assuming IDs are safe)
  // If this fails, we are in trouble, but IDs are usually UUIDs.
  let appointments: { id: string }[] = [];
  try {
    appointments = await prisma.appointments.findMany({
      select: { id: true },
    });
    console.log(`Found ${appointments.length} appointments. Checking integrity...`);
  } catch (err) {
    console.error('Failed to fetch IDs! ID column might be corrupted.', err);
    process.exit(1);
  }

  let deletedCount = 0;

  for (const app of appointments) {
    try {
      // Try to fetch the whole row (or text columns)
      // We use raw query to ensure we hit the driver's decoder
      await prisma.$queryRawUnsafe(`SELECT * FROM appointments WHERE id = '${app.id}'`);

      // If successful, check clients too (optional, but let's focus on appointments first)
    } catch (err: any) {
      const msg = err.message || '';
      if (
        msg.includes('invalid byte sequence') ||
        msg.includes('null character not permitted') ||
        msg.includes('0x00')
      ) {
        console.log(`❌ CORRUPTED ROW FOUND: ID ${app.id}`);
        console.log(`   Error: ${msg.split('\n')[0]}`); // First line of error

        try {
          await prisma.appointments.delete({ where: { id: app.id } });
          console.log(`   🗑️ DELETED appointment ${app.id}`);
          deletedCount++;
        } catch (delErr) {
          console.error(`   Failed to delete ${app.id}:`, delErr);
        }
      } else {
        // console.warn(`   Warning for ${app.id}: ${msg}`);
      }
    }
  }

  console.log(`\n🏁 Scan complete. Deleted ${deletedCount} corrupted rows.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
