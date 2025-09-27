// import { PrismaClient, Genero, Modelo } from '@prisma/client'

// const prisma = new PrismaClient()

// async function main() {
//   console.log('🧹 Limpando tabelas...')

//   // Limpa produtos e taxas de cartão antes de inserir
//   await prisma.produto.deleteMany()
//   await prisma.taxaCartao.deleteMany()

//   const marcas = ['Mississipi', 'Constance', 'Modare', 'Olympikus', 'Moleca']
//   const cores = ['Preto', 'Branco', 'Vermelho', 'Azul', 'Rosa', 'Marrom']
//   const modelos = Object.values(Modelo)
//   const generos = Object.values(Genero)

//   // Função pra gerar data aleatória
//   function gerarDataAleatoria() {
//     const start = new Date('2024-01-01')
//     const end = new Date('2025-09-24')
//     const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
//     return date.toISOString().split('T')[0]
//   }

//   const produtos = []

//   for (const marca of marcas) {
//     const dataRecebimento = gerarDataAleatoria()
//     for (let tamanho = 33; tamanho <= 44; tamanho++) {
//       for (let i = 0; i < 2; i++) {
//         const modelo = modelos[Math.floor(Math.random() * modelos.length)]
//         const genero = generos[Math.floor(Math.random() * generos.length)]
//         const cor = cores[Math.floor(Math.random() * cores.length)]
//         const quantidade = Math.floor(Math.random() * 4) + 1
//         const preco = parseFloat((Math.random() * 200 + 50).toFixed(2))

//         produtos.push({
//           nome: `${marca} ${modelo} ${tamanho}`,
//           tamanho,
//           referencia: `${marca.slice(0, 3).toUpperCase()}-${tamanho}-${i + 1}`,
//           cor,
//           quantidade,
//           preco,
//           genero,
//           modelo,
//           marca,
//           disponivel: quantidade > 0,
//           lote: `Lote-${marca.slice(0, 3).toUpperCase()}-${tamanho}-${i + 1}`,
//           dataRecebimento: new Date(dataRecebimento),
//         })
//       }
//     }
//   }

//   console.log(`👟 Criando ${produtos.length} produtos...`)
//   for (const produto of produtos) {
//     await prisma.produto.create({ data: produto })
//   }

//   console.log('💳 Criando taxas de cartão...')
//   await prisma.taxaCartao.createMany({
//     data: [
//       // Visa
//       { bandeira: 'VISA', modalidade: 'DEBITO', taxaPercentual: 1.99 },
//       { bandeira: 'VISA', modalidade: 'CREDITO_X1', taxaPercentual: 4.99 },
//       { bandeira: 'VISA', modalidade: 'CREDITO_X2', taxaPercentual: 5.59 },
//       { bandeira: 'VISA', modalidade: 'CREDITO_X3', taxaPercentual: 5.59 },
//       { bandeira: 'VISA', modalidade: 'CREDITO_X4', taxaPercentual: 5.59 },
//       { bandeira: 'VISA', modalidade: 'CREDITO_X5', taxaPercentual: 5.59 },
//       { bandeira: 'VISA', modalidade: 'CREDITO_X6', taxaPercentual: 5.59 },
//       // Mastercard
//       { bandeira: 'MASTERCARD', modalidade: 'DEBITO', taxaPercentual: 1.99 },
//       { bandeira: 'MASTERCARD', modalidade: 'CREDITO_X1', taxaPercentual: 4.99 },
//       { bandeira: 'MASTERCARD', modalidade: 'CREDITO_X2', taxaPercentual: 5.59 },
//       { bandeira: 'MASTERCARD', modalidade: 'CREDITO_X3', taxaPercentual: 5.59 },
//       { bandeira: 'MASTERCARD', modalidade: 'CREDITO_X4', taxaPercentual: 5.59 },
//       { bandeira: 'MASTERCARD', modalidade: 'CREDITO_X5', taxaPercentual: 5.59 },
//       { bandeira: 'MASTERCARD', modalidade: 'CREDITO_X6', taxaPercentual: 5.59 },
//       // Elo
//       { bandeira: 'ELO', modalidade: 'DEBITO', taxaPercentual: 2.49 },
//       { bandeira: 'ELO', modalidade: 'CREDITO_X1', taxaPercentual: 4.49 },
//       { bandeira: 'ELO', modalidade: 'CREDITO_X2', taxaPercentual: 6.09 },
//       { bandeira: 'ELO', modalidade: 'CREDITO_X3', taxaPercentual: 6.09 },
//       { bandeira: 'ELO', modalidade: 'CREDITO_X4', taxaPercentual: 6.09 },
//       { bandeira: 'ELO', modalidade: 'CREDITO_X5', taxaPercentual: 6.09 },
//       { bandeira: 'ELO', modalidade: 'CREDITO_X6', taxaPercentual: 6.09 },
//     ],
//     skipDuplicates: true,
//   });

//   console.log('✅ Seed finalizado!')
// }

// main()
//   .catch(e => {
//     console.error(e)
//     process.exit(1)
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })
// prisma/seed.js
import { PrismaClient, Genero, Modelo } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpando tabelas...');

  // Limpa produtos e taxas de cartão antes de inserir
  await prisma.produto.deleteMany();
  await prisma.taxaCartao.deleteMany();

  const marcas = ['Mississipi', 'Constance', 'Modare', 'Olympikus', 'Moleca'];
  const cores = ['Preto', 'Branco', 'Vermelho', 'Azul', 'Rosa', 'Marrom'];
  const modelos = Object.values(Modelo);
  const generos = Object.values(Genero);

  // Função pra gerar data aleatória
  function gerarDataAleatoria() {
    const start = new Date('2024-01-01');
    const end = new Date('2025-09-24');
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
  }

  const produtos = [];

  for (const marca of marcas) {
    const dataRecebimento = gerarDataAleatoria();
    for (let tamanho = 33; tamanho <= 44; tamanho++) {
      for (let i = 0; i < 2; i++) {
        const modelo = modelos[Math.floor(Math.random() * modelos.length)];
        const genero = generos[Math.floor(Math.random() * generos.length)];
        const cor = cores[Math.floor(Math.random() * cores.length)];
        const quantidade = Math.floor(Math.random() * 4) + 1;
        const preco = parseFloat((Math.random() * 200 + 50).toFixed(2));

        produtos.push({
          nome: `${marca} ${modelo} ${tamanho}`,
          tamanho,
          referencia: `${marca.slice(0, 3).toUpperCase()}-${tamanho}-${i + 1}`,
          cor,
          quantidade,
          preco,
          genero,
          modelo,
          marca,
          disponivel: quantidade > 0,
          lote: `Lote-${marca.slice(0, 3).toUpperCase()}-${tamanho}-${i + 1}`,
          dataRecebimento: new Date(dataRecebimento),
        });
      }
    }
  }

  console.log(`👟 Criando ${produtos.length} produtos...`);
  for (const produto of produtos) {
    await prisma.produto.create({ data: produto });
  }

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
  
