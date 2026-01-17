import prisma from '../server/prismaClient';

async function main() {
  const services = await prisma.services.findMany({
    where: {
      name: {
        contains: 'Barba',
        mode: 'insensitive',
      },
    },
  });
  console.log('Services matching "Barba":');
  services.forEach(s => {
    console.log(`[${s.id}] ${s.name} - Price: ${s.price} - Duration: ${s.duration}`);
  });
}

main();
