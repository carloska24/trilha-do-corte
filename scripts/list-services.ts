import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const services = await prisma.services.findMany();
  console.log('Servicos cadastrados:');
  console.log('======================');
  services.forEach(s => {
    console.log(`${s.id} - ${s.name} - R$ ${s.priceValue}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
