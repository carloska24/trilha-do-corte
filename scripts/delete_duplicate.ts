import prisma from '../server/prismaClient';

async function main() {
  await prisma.services.delete({
    where: { id: 's_combo_complete' },
  });
  console.log('Duplicate service "s_combo_complete" deleted.');
}

main();
