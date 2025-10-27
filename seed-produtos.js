const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch'); // Certifique-se de instalar node-fetch: npm install node-fetch@2

const prisma = new PrismaClient();

async function validateImageUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      console.log(`URL válida: ${url}`);
      return true;
    } else {
      console.warn(`URL inválida (status ${response.status}): ${url}`);
      return false;
    }
  } catch (error) {
    console.warn(`Erro ao validar URL ${url}:`, error.message);
    return false;
  }
}

async function seedProdutos() {
  try {
    // Deletar registros de tabelas relacionadas (ajuste o nome da tabela, se necessário)
    console.log('Deletando registros de tabelas relacionadas...');
    await prisma.venda.deleteMany({}); // Substitua 'venda' pelo nome correto da tabela relacionada
    console.log('Registros de vendas deletados com sucesso!');

    // Deletar todos os produtos existentes
    console.log('Deletando produtos existentes...');
    await prisma.produto.deleteMany({});
    console.log('Todos os produtos foram deletados com sucesso!');

    // Lista de 15 calçados com URLs do Unsplash (atualizadas e validadas)
    const produtos = [
      {
        nome: 'Tênis Running Pro',
        tamanho: 40,
        referencia: 'TEN001',
        cor: 'Branco',
        quantidade: 100,
        precoCusto: 80.0,
        precoVenda: 159.99,
        imagem: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', // Mantida (funcionando)
        genero: 'Unissex',
        modelo: 'Running',
        marca: 'Nike',
        disponivel: true,
        lote: 'LOTE001',
        dataRecebimento: new Date('2025-10-01T10:00:00Z'),
      },
      {
        nome: 'Sapato Social Clássico',
        tamanho: 42,
        referencia: 'SAP002',
        cor: 'Preto',
        quantidade: 50,
        precoCusto: 100.0,
        precoVenda: 199.99,
        imagem: 'https://images.unsplash.com/photo-1621330394938-18ed7cdafcf7', // Nova URL (sapato social)
        genero: 'Masculino',
        modelo: 'Social',
        marca: 'CNS',
        disponivel: true,
        lote: 'LOTE002',
        dataRecebimento: new Date('2025-10-02T10:00:00Z'),
      },
      {
        nome: 'Sandália Rasteira',
        tamanho: 37,
        referencia: 'SAN003',
        cor: 'Dourado',
        quantidade: 80,
        precoCusto: 20.0,
        precoVenda: 49.99,
        imagem: 'https://images.unsplash.com/photo-1656421649636-d9a5b7f2e2a9', // Nova URL (sandália rasteira)
        genero: 'Feminino',
        modelo: 'Rasteira',
        marca: 'Arezzo',
        disponivel: true,
        lote: 'LOTE003',
        dataRecebimento: new Date('2025-10-03T10:00:00Z'),
      },
      {
        nome: 'Chinelo Slide',
        tamanho: 39,
        referencia: 'CHI004',
        cor: 'Azul',
        quantidade: 120,
        precoCusto: 15.0,
        precoVenda: 39.99,
        imagem: 'https://images.unsplash.com/photo-1599566219227-2efe0bc9d632', // Nova URL (chinelo slide)
        genero: 'Unissex',
        modelo: 'Slide',
        marca: 'Havaianas',
        disponivel: true,
        lote: 'LOTE004',
        dataRecebimento: new Date('2025-10-04T10:00:00Z'),
      },
      {
        nome: 'Sapatênis Casual',
        tamanho: 41,
        referencia: 'SAP005',
        cor: 'Marrom',
        quantidade: 60,
        precoCusto: 70.0,
        precoVenda: 139.99,
        imagem: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', // Mantida (funcionando)
        genero: 'Masculino',
        modelo: 'Casual',
        marca: 'Polo',
        disponivel: true,
        lote: 'LOTE005',
        dataRecebimento: new Date('2025-10-05T10:00:00Z'),
      },
      {
        nome: 'Tênis Skate',
        tamanho: 38,
        referencia: 'TEN006',
        cor: 'Preto',
        quantidade: 70,
        precoCusto: 60.0,
        precoVenda: 129.99,
        imagem: 'https://images.unsplash.com/photo-1556906781-9a412961c28c', // Mantida (funcionando)
        genero: 'Unissex',
        modelo: 'Skate',
        marca: 'Vans',
        disponivel: true,
        lote: 'LOTE006',
        dataRecebimento: new Date('2025-10-06T10:00:00Z'),
      },
      {
        nome: 'Bota de Couro',
        tamanho: 40,
        referencia: 'BOT007',
        cor: 'Marrom Escuro',
        quantidade: 40,
        precoCusto: 120.0,
        precoVenda: 249.99,
        imagem: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2', // Mantida (funcionando)
        genero: 'Masculino',
        modelo: 'Chelsea',
        marca: 'Rambler',
        disponivel: true,
        lote: 'LOTE007',
        dataRecebimento: new Date('2025-10-07T10:00:00Z'),
      },
      {
        nome: 'Sandália de Salto',
        tamanho: 36,
        referencia: 'SAN008',
        cor: 'Bege',
        quantidade: 50,
        precoCusto: 50.0,
        precoVenda: 99.99,
        imagem: 'https://images.unsplash.com/photo-1619537933278-2c442d951090', // Nova URL (sandália de salto)
        genero: 'Feminino',
        modelo: 'Salto Alto',
        marca: 'Vizzano',
        disponivel: true,
        lote: 'LOTE008',
        dataRecebimento: new Date('2025-10-08T10:00:00Z'),
      },
      {
        nome: 'Tênis de Corrida',
        tamanho: 39,
        referencia: 'TEN009',
        cor: 'Vermelho',
        quantidade: 90,
        precoCusto: 85.0,
        precoVenda: 169.99,
        imagem: 'https://images.unsplash.com/photo-1549298916-b41d501d3772', // Mantida (funcionando)
        genero: 'Unissex',
        modelo: 'Running',
        marca: 'Adidas',
        disponivel: true,
        lote: 'LOTE009',
        dataRecebimento: new Date('2025-10-09T10:00:00Z'),
      },
      {
        nome: 'Sapato Mocassim',
        tamanho: 42,
        referencia: 'SAP010',
        cor: 'Azul Escuro',
        quantidade: 60,
        precoCusto: 90.0,
        precoVenda: 179.99,
        imagem: 'https://images.unsplash.com/photo-1590673846748-42f67fd8154a', // Nova URL (mocassim)
        genero: 'Masculino',
        modelo: 'Mocassim',
        marca: 'Ferracini',
        disponivel: true,
        lote: 'LOTE010',
        dataRecebimento: new Date('2025-10-10T10:00:00Z'),
      },
      {
        nome: 'Chinelo de Dedo',
        tamanho: 38,
        referencia: 'CHI011',
        cor: 'Preto',
        quantidade: 100,
        precoCusto: 10.0,
        precoVenda: 29.99,
        imagem: 'https://images.unsplash.com/photo-1595003918020-3c1ca0ea96c4', // Nova URL (chinelo de dedo)
        genero: 'Unissex',
        modelo: 'Dedo',
        marca: 'Havaianas',
        disponivel: true,
        lote: 'LOTE011',
        dataRecebimento: new Date('2025-10-11T10:00:00Z'),
      },
      {
        nome: 'Tênis Urbano',
        tamanho: 40,
        referencia: 'TEN012',
        cor: 'Cinza',
        quantidade: 70,
        precoCusto: 65.0,
        precoVenda: 139.99,
        imagem: 'https://images.unsplash.com/photo-1543508282-6319a3e26236', // Mantida (funcionando)
        genero: 'Unissex',
        modelo: 'Urbano',
        marca: 'Converse',
        disponivel: true,
        lote: 'LOTE012',
        dataRecebimento: new Date('2025-10-12T10:00:00Z'),
      },
      {
        nome: 'Sandália Plataforma',
        tamanho: 37,
        referencia: 'SAN013',
        cor: 'Branco',
        quantidade: 50,
        precoCusto: 45.0,
        precoVenda: 89.99,
        imagem: 'https://images.unsplash.com/photo-1613769049986-4eb9f7c2ab51', // Nova URL (sandália plataforma)
        genero: 'Feminino',
        modelo: 'Plataforma',
        marca: 'Rambler',
        disponivel: true,
        lote: 'LOTE013',
        dataRecebimento: new Date('2025-10-13T10:00:00Z'),
      },
      {
        nome: 'Bota Cano Alto',
        tamanho: 38,
        referencia: 'BOT014',
        cor: 'Preto',
        quantidade: 40,
        precoCusto: 130.0,
        precoVenda: 259.99,
        imagem: 'https://images.unsplash.com/photo-1549298240-0d8e60513026', // Nova URL (bota cano alto)
        genero: 'Feminino',
        modelo: 'Cano Alto',
        marca: 'Santa Lolla',
        disponivel: true,
        lote: 'LOTE014',
        dataRecebimento: new Date('2025-10-14T10:00:00Z'),
      },
      {
        nome: 'Tênis de Basquete',
        tamanho: 43,
        referencia: 'TEN015',
        cor: 'Azul',
        quantidade: 30,
        precoCusto: 95.0,
        precoVenda: 189.99,
        imagem: 'https://images.unsplash.com/photo-1597045566897-1a6b3a9a8f59', // Mantida (funcionando)
        genero: 'Masculino',
        modelo: 'Basquete',
        marca: 'Jordan',
        disponivel: true,
        lote: 'LOTE015',
        dataRecebimento: new Date('2025-10-15T10:00:00Z'),
      },
    ];

    // Validar URLs das imagens antes de inserir
    console.log('Validando URLs das imagens...');
    const produtosValidados = [];
    for (const produto of produtos) {
      const isValid = await validateImageUrl(produto.imagem);
      if (isValid) {
        produtosValidados.push(produto);
      } else {
        console.warn(`Imagem para ${produto.nome} (${produto.imagem}) será definida como null`);
        produtosValidados.push({ ...produto, imagem: null });
      }
    }

    // Inserir os novos produtos
    console.log('Inserindo novos produtos...');
    const result = await prisma.produto.createMany({
      data: produtosValidados,
    });

    console.log(`Inseridos ${result.count} produtos com sucesso!`);

    // Listar produtos inseridos para verificação
    const produtosInseridos = await prisma.produto.findMany();
    console.log('Produtos inseridos:', produtosInseridos);
  } catch (error) {
    console.error('Erro ao inserir produtos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProdutos();
