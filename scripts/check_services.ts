import prisma from '../server/prismaClient';

async function main() {
  const services = await prisma.services.findMany();
  console.log('Services in DB:', JSON.stringify(services, null, 2));
}

main();
