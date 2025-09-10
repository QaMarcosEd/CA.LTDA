import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const marcas = ['Mississipi', 'Constance', 'Modare', 'Olympikus', 'Moleca'];
  const cores = ['Preto', 'Branco', 'Vermelho', 'Azul', 'Rosa', 'Marrom'];
  const modelos = ['TENIS','SAPATENIS','SANDALIA','RASTEIRA','TAMANCO','SCARPIN','BOTA','CHINELO','MOCASSIM','OXFORD','PEEPTOE','SLINGBACK','CHUTEIRA'];
  const generos = ['MASCULINO','FEMININO','INFANTIL_MASCULINO','INFANTIL_FEMININO'];

  const produtos = [];

  // Vamos criar uma grade de produtos
  for (const marca of marcas) {
    for (let tamanho = 33; tamanho <= 44; tamanho++) { // tamanhos variados
      for (let i = 0; i < 2; i++) { // 2 modelos por tamanho por marca
        const modelo = modelos[Math.floor(Math.random() * modelos.length)];
        const genero = generos[Math.floor(Math.random() * generos.length)];
        const cor = cores[Math.floor(Math.random() * cores.length)];
        const quantidade = Math.floor(Math.random() * 20) + 1; // de 1 a 20
        const preco = parseFloat((Math.random() * 200 + 50).toFixed(2)); // R$50 a R$250

        produtos.push({
          nome: `${marca} ${modelo} ${tamanho}`,
          tamanho,
          referencia: `${marca.slice(0,3).toUpperCase()}-${tamanho}-${i+1}`,
          cor,
          quantidade,
          preco,
          genero,
          modelo,
          marca,
          disponivel: quantidade > 0,
        });
      }
    }
  }

  console.log(`Criando ${produtos.length} produtos...`);

  for (const produto of produtos) {
    await prisma.produto.create({ data: produto });
  }

  console.log('Seed finalizado!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
