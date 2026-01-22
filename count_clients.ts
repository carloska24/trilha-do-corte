import prisma from './server/prismaClient';

async function main() {
  try {
    const start = Date.now();
    const count = await prisma.clients.count();
    const clients = await prisma.clients.findMany({
      select: { name: true, phone: true, status: true },
      orderBy: { publicId: 'desc' },
      take: 5,
    });

    console.log(`\n📊 TOTAL CLIENTS: ${count}`);
    console.log('--------------------------------');
    console.log('Latest 5 Clients:');
    clients.forEach(c => console.log(`- ${c.name} (${c.phone}) [${c.status}]`));
    console.log('--------------------------------');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
