import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetSchedule() {
  try {
    console.log('🧹 Iniciando limpeza da agenda...');

    // Delete all appointments
    const deleted = await prisma.appointments.deleteMany({});

    console.log(`✅ Sucesso! ${deleted.count} agendamentos foram removidos.`);
    console.log('� Carteira/Faturamento zerados automaticamente.');
    console.log('�📅 A agenda está limpa e pronta para novos testes.');
  } catch (error) {
    console.error('❌ Erro ao limpar agenda:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetSchedule();
