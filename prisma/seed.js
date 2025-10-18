import { PrismaClient, Genero, Modelo } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpando tabelas...');

  // Limpa produtos e taxas de cartão antes de inserir
  await prisma.taxaCartao.deleteMany();


  console.log('💳 Criando taxas de cartão...');
  const taxas = [
    // Visa
    { bandeira: 'VISA', modalidade: 'DEBITO', taxaPercentual: 1.99 },
    { bandeira: 'VISA', modalidade: 'CREDITO_X1', taxaPercentual: 4.99 },
    { bandeira: 'VISA', modalidade: 'CREDITO_X2', taxaPercentual: 5.59 },
    { bandeira: 'VISA', modalidade: 'CREDITO_X3', taxaPercentual: 5.59 },
    { bandeira: 'VISA', modalidade: 'CREDITO_X4', taxaPercentual: 5.59 },
    { bandeira: 'VISA', modalidade: 'CREDITO_X5', taxaPercentual: 5.59 },
    { bandeira: 'VISA', modalidade: 'CREDITO_X6', taxaPercentual: 5.59 },
    // Mastercard
    { bandeira: 'MASTERCARD', modalidade: 'DEBITO', taxaPercentual: 1.99 },
    { bandeira: 'MASTERCARD', modalidade: 'CREDITO_X1', taxaPercentual: 4.99 },
    { bandeira: 'MASTERCARD', modalidade: 'CREDITO_X2', taxaPercentual: 5.59 },
    { bandeira: 'MASTERCARD', modalidade: 'CREDITO_X3', taxaPercentual: 5.59 },
    { bandeira: 'MASTERCARD', modalidade: 'CREDITO_X4', taxaPercentual: 5.59 },
    { bandeira: 'MASTERCARD', modalidade: 'CREDITO_X5', taxaPercentual: 5.59 },
    { bandeira: 'MASTERCARD', modalidade: 'CREDITO_X6', taxaPercentual: 5.59 },
    // Elo
    { bandeira: 'ELO', modalidade: 'DEBITO', taxaPercentual: 2.49 },
    { bandeira: 'ELO', modalidade: 'CREDITO_X1', taxaPercentual: 4.49 },
    { bandeira: 'ELO', modalidade: 'CREDITO_X2', taxaPercentual: 6.09 },
    { bandeira: 'ELO', modalidade: 'CREDITO_X3', taxaPercentual: 6.09 },
    { bandeira: 'ELO', modalidade: 'CREDITO_X4', taxaPercentual: 6.09 },
    { bandeira: 'ELO', modalidade: 'CREDITO_X5', taxaPercentual: 6.09 },
    { bandeira: 'ELO', modalidade: 'CREDITO_X6', taxaPercentual: 6.09 },
  ];

  for (const taxa of taxas) {
    const existingTaxa = await prisma.taxaCartao.findUnique({
      where: {
        bandeira_modalidade: {
          bandeira: taxa.bandeira,
          modalidade: taxa.modalidade,
        },
      },
    });
    if (!existingTaxa) {
      await prisma.taxaCartao.create({
        data: taxa,
      });
    }
  }

  console.log('✅ Seed finalizado!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  
