// import { PrismaClient, Genero, Modelo } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🧹 Limpando tabelas...');

//   // Limpa produtos e taxas de cartão antes de inserir
//   await prisma.taxaCartao.deleteMany();


//   console.log('💳 Criando taxas de cartão...');
//   const taxas = [
//     // Visa
//     { bandeira: 'VISA', modalidade: 'DEBITO', taxaPercentual: 1.99 },
//     { bandeira: 'VISA', modalidade: 'CREDITO_X1', taxaPercentual: 4.99 },
//     { bandeira: 'VISA', modalidade: 'CREDITO_X2', taxaPercentual: 5.59 },
//     { bandeira: 'VISA', modalidade: 'CREDITO_X3', taxaPercentual: 5.59 },
//     { bandeira: 'VISA', modalidade: 'CREDITO_X4', taxaPercentual: 5.59 },
//     { bandeira: 'VISA', modalidade: 'CREDITO_X5', taxaPercentual: 5.59 },
//     { bandeira: 'VISA', modalidade: 'CREDITO_X6', taxaPercentual: 5.59 },
//     // Mastercard
//     { bandeira: 'MASTERCARD', modalidade: 'DEBITO', taxaPercentual: 1.99 },
//     { bandeira: 'MASTERCARD', modalidade: 'CREDITO_X1', taxaPercentual: 4.99 },
//     { bandeira: 'MASTERCARD', modalidade: 'CREDITO_X2', taxaPercentual: 5.59 },
//     { bandeira: 'MASTERCARD', modalidade: 'CREDITO_X3', taxaPercentual: 5.59 },
//     { bandeira: 'MASTERCARD', modalidade: 'CREDITO_X4', taxaPercentual: 5.59 },
//     { bandeira: 'MASTERCARD', modalidade: 'CREDITO_X5', taxaPercentual: 5.59 },
//     { bandeira: 'MASTERCARD', modalidade: 'CREDITO_X6', taxaPercentual: 5.59 },
//     // Elo
//     { bandeira: 'ELO', modalidade: 'DEBITO', taxaPercentual: 2.49 },
//     { bandeira: 'ELO', modalidade: 'CREDITO_X1', taxaPercentual: 4.49 },
//     { bandeira: 'ELO', modalidade: 'CREDITO_X2', taxaPercentual: 6.09 },
//     { bandeira: 'ELO', modalidade: 'CREDITO_X3', taxaPercentual: 6.09 },
//     { bandeira: 'ELO', modalidade: 'CREDITO_X4', taxaPercentual: 6.09 },
//     { bandeira: 'ELO', modalidade: 'CREDITO_X5', taxaPercentual: 6.09 },
//     { bandeira: 'ELO', modalidade: 'CREDITO_X6', taxaPercentual: 6.09 },
//   ];

//   for (const taxa of taxas) {
//     const existingTaxa = await prisma.taxaCartao.findUnique({
//       where: {
//         bandeira_modalidade: {
//           bandeira: taxa.bandeira,
//           modalidade: taxa.modalidade,
//         },
//       },
//     });
//     if (!existingTaxa) {
//       await prisma.taxaCartao.create({
//         data: taxa,
//       });
//     }
//   }

//   console.log('✅ Seed finalizado!');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
  
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Limpando tabelas...')

  // Limpa tabelas
  await prisma.taxaCartao.deleteMany()
  await prisma.user.deleteMany()

  console.log('💳 Criando taxas de cartão...')
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
  ]

  for (const taxa of taxas) {
    const existingTaxa = await prisma.taxaCartao.findUnique({
      where: {
        bandeira_modalidade: {
          bandeira: taxa.bandeira,
          modalidade: taxa.modalidade,
        },
      },
    })
    if (!existingTaxa) {
      await prisma.taxaCartao.create({
        data: taxa,
      })
    }
  }

  console.log('👤 Criando admin...')
  const existingAdmin = await prisma.user.findUnique({
    where: { name: 'ca.ltda' }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('loja@2380', 12)
    await prisma.user.create({
      data: {
        name: 'ca.ltda',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    console.log('🎉 ADMIN criado com sucesso!')
    console.log('👤 Nome: ca.ltda')
    console.log('🔐 Senha: loja@2380')
    console.log('⚠️  NUNCA compartilhe essa senha!')
  } else {
    console.log('✅ ADMIN já existe: ca.ltda')
  }

  console.log('👥 Criando funcionários...')
  const funcionarios = [
    { name: 'Diana', password: 'diana@2380', role: 'FUNCIONARIO' },
    { name: 'Deise', password: 'deise@2380', role: 'FUNCIONARIO' }
  ]

  for (const func of funcionarios) {
    const existingUser = await prisma.user.findUnique({
      where: { name: func.name }
    })

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(func.password, 12)
      await prisma.user.create({
        data: {
          name: func.name,
          password: hashedPassword,
          role: func.role
        }
      })
      console.log(`🎉 Funcionário criado: ${func.name}`)
      console.log(`👤 Nome: ${func.name}`)
      console.log(`🔐 Senha: ${func.password}`)
      console.log(`⚠️  NUNCA compartilhe essa senha!`)
    } else {
      console.log(`✅ Funcionário já existe: ${func.name}`)
    }
  }

  console.log('✅ Seed finalizado!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })