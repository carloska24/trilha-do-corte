import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Finding Carlos...');
  const carlos = await prisma.clients.findFirst({
    where: { name: { contains: 'Carlos', mode: 'insensitive' } },
  });
  console.log('✅ Carlos:', carlos);

  const barbers = await prisma.barbers.findMany();
  console.log('✅ Barbers:', barbers);

  /* Clean up plan:
     DELETE FROM appointments 
     WHERE (clientId != carlos.id OR clientId IS NULL)
       AND (barberId NOT IN (barbers.map(b => b.id)))
  */
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
