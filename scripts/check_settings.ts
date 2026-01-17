import prisma from '../server/prismaClient';

async function main() {
  const settings = await prisma.shop_settings.findFirst();
  console.log('Shop Settings:', JSON.stringify(settings, null, 2));
}

main();
