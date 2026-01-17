import prisma from '../server/prismaClient';

async function main() {
  const combo = {
    id: 's_combo_complete',
    name: 'Combo Completo (Corte + Barba + Sobrancelha)',
    price: 'R$ 65,00',
    priceValue: 65,
    description:
      'O pacote definitivo. Corte de cabelo, barba alinhada e sobrancelha navalhada. Você sai novo.',
    category: 'Combo',
    duration: 75, // 30 (Corte) + 30 (Barba) + 15 (Sobrancelha)
    icon: 'crown',
    image: '/services/combo.png',
  };

  await prisma.services.upsert({
    where: { id: combo.id },
    update: combo,
    create: combo,
  });

  console.log('Combo Added:', combo.name);
}

main();
