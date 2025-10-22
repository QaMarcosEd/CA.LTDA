// script/atualizarDataRecebimento.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function atualizarDataRecebimento() {
  try {
    await prisma.produto.updateMany({
      where: { dataRecebimento: null },
      data: { dataRecebimento: new Date('2024-01-01') }, // Data padrão pros antigos
    });
    console.log('dataRecebimento atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar dataRecebimento:', error);
  } finally {
    await prisma.$disconnect();
  }
}

atualizarDataRecebimento();