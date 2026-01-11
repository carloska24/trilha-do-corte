import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning with RAW SQL (Fixed Columns)...');

  /*
   DB Schema Check from Prisma File:
   model appointments {
     clientName String?   @map("clientname")
     clientId   String?   @map("clientid")
     barberId   String?   @map("barberid")
     ...
   }
   
   So actual DB columns are lowercase.
  */

  const removed = await prisma.$executeRawUnsafe(`
    DELETE FROM "appointments"
    WHERE 
      ("clientname" NOT ILIKE '%Carlos%' OR "clientname" IS NULL)
      AND ("clientname" NOT ILIKE '%Barbeiro%')
  `);

  console.log(`🗑️ Deleted ${removed} appointments via RAW SQL.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
