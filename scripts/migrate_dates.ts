import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting Date Migration...');

  const appointments = await prisma.appointments.findMany({
    where: { date_new: null }, // Only process unmigrated
  });

  console.log(`📋 Found ${appointments.length} appointments to migrate.`);

  let success = 0;
  let errors = 0;

  for (const app of appointments) {
    if (!app.date) {
      console.warn(`⚠️ Skipped ID ${app.id}: No date string.`);
      continue;
    }

    try {
      // Assuming date is in "YYYY-MM-DD" format from verify_schema checks earlier
      // We append T00:00:00Z to treat it as UTC Date or similar
      const dateObj = new Date(app.date + 'T00:00:00.000Z');

      if (isNaN(dateObj.getTime())) {
        throw new Error(`Invalid date format: ${app.date}`);
      }

      await prisma.appointments.update({
        where: { id: app.id },
        data: { date_new: dateObj },
      });
      success++;
    } catch (e: any) {
      console.error(`❌ Error migrating ID ${app.id} (${app.date}):`, e.message);
      errors++;
    }
  }

  console.log(`✅ Migration Finished.`);
  console.log(`Success: ${success}`);
  console.log(`Errors: ${errors}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
