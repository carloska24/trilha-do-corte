import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando clientes com nome "Carlos"...');
  const clients = await prisma.clients.findMany({
    where: {
      name: {
        contains: 'Carlos',
      },
    },
  });

  if (clients.length === 0) {
    console.log('❌ Nenhum cliente encontrado com nome "Carlos". listando todos:');
    const all = await prisma.clients.findMany();
    all.forEach(c => console.log(`- [${c.id}] ${c.name} (${c.phone})`));
  } else {
    console.log(`✅ Encontrados ${clients.length} clientes:`);
    clients.forEach(c => {
      console.log(`🆔 ID: ${c.id}`);
      console.log(`👤 Nome: ${c.name}`);
      console.log(`📞 Telefone: ${c.phone}`);
      console.log('---');
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
