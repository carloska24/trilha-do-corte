const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const carlos = await prisma.clients.findFirst({
    where: {
      name: {
        contains: 'Carlos',
        mode: 'insensitive',
      },
    },
  });
  console.log('Found Client:', carlos);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
