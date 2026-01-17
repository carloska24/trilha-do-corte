import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clients = await prisma.clients.findMany({
    take: 10,
    select: {
      id: true,
      name: true,
      lastVisit: true,
    },
  });

  console.log('--- Client Diagnosis ---');
  clients.forEach(c => {
    console.log(
      `ID: ${c.id}, Name: ${c.name}, Last Visit: ${c.lastVisit} (Type: ${typeof c.lastVisit})`
    );
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
