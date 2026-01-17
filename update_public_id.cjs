const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check if Carlos has a Public ID
  const carlos = await prisma.clients.findFirst({
    where: { name: { contains: 'Carlos', mode: 'insensitive' } },
  });

  if (!carlos) {
    console.log('Carlos not found');
    return;
  }

  console.log('Current Carlos:', carlos);

  if (!carlos.publicId) {
    console.log('Updating Public ID for Carlos...');
    const updated = await prisma.clients.update({
      where: { id: carlos.id },
      data: { publicId: 1 }, // Set to 1 explicitly for the owner
    });
    console.log('✅ Updated:', updated);
  } else {
    console.log('Carlos already has publicId:', carlos.publicId);
  }

  // Auto-fill others if needed (optional)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
