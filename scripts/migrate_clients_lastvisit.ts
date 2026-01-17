import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Client LastVisit Migration (String -> DateTime)...');

  const clients = await prisma.clients.findMany({
    where: {
      lastVisit: { not: null },
    },
  });

  console.log(`Found ${clients.length} clients with lastVisit.`);

  let updatedCount = 0;
  let errorCount = 0;

  for (const client of clients) {
    if (!client.lastVisit) continue;

    try {
      let dateObj: Date | null = null;
      const dateStr = client.lastVisit.trim();

      // Strategies:
      // 1. DD/MM/YYYY (Common in Brazil)
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
          const year = parseInt(parts[2], 10);
          dateObj = new Date(year, month, day);
        }
      }
      // 2. YYYY-MM-DD (ISO)
      else if (dateStr.includes('-')) {
        dateObj = new Date(dateStr);
      }

      if (dateObj && !isNaN(dateObj.getTime())) {
        await prisma.clients.update({
          where: { id: client.id },
          data: { lastVisit_new: dateObj },
        });
        updatedCount++;
        // console.log(`[OK] Client ${client.name}: ${dateStr} -> ${dateObj.toISOString()}`);
      } else {
        console.warn(
          `[WARN] Could not parse date for client ${client.name} (${client.id}): "${dateStr}"`
        );
        errorCount++;
      }
    } catch (err) {
      console.error(`[ERR] Failed to update client ${client.id}:`, err);
      errorCount++;
    }
  }

  console.log('--- Migration Summary ---');
  console.log(`Total: ${clients.length}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Errors/Skipped: ${errorCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
