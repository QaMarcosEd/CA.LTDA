// import { getAllProdutos } from '../produtos/controller/produtosController';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export async function GET() {
//   try {
//     // Fetch totais gerais
//     const { totalProdutos, valorTotalRevenda } = await getAllProdutos({});

//     // Fetch estoque por gênero
//     const estoquePorGenero = await getAllProdutos({ tipo: 'genero' });

//     // Fetch top modelos (limitado a 5)
//     const topModelos = await getAllProdutos({ tipo: 'modelo' });

//     // Fetch produtos com baixo estoque (quantidade < 10)
//     const produtos = await getAllProdutos({});
//     const lowStockCount = produtos.data.filter(p => p.quantidade < 10).length;
//     const alerts = produtos.data
//       .filter(p => p.quantidade < 10)
//       .map(p => ({
//         message: `Produto ${p.nome} (Ref: ${p.referencia}) com estoque baixo (${p.quantidade} unidades)`,
//       }));

//     // Fetch lotes hoje
//     const today = new Date().toISOString().split('T')[0];
//     const lotesHojeData = await prisma.produto.findMany({
//       where: {
//         dataRecebimento: {
//           gte: new Date(today),
//           lte: new Date(today + 'T23:59:59.999Z'),
//         },
//       },
//       select: { lote: true },
//       distinct: ['lote'],
//     });
//     const lotesHoje = lotesHojeData.length;

//     // Fetch modelos ativos
//     const modelosAtivosData = await getAllProdutos({ tipo: 'modelo' });
//     const modelosAtivos = modelosAtivosData.filter(m => m.total > 0).length;

//     return Response.json({
//       lowStockCount,
//       lotesHoje,
//       modelosAtivos,
//       alerts,
//       estoquePorGenero: estoquePorGenero.map(g => ({ name: g.genero, value: g.total })),
//       topModelos: topModelos.map(m => ({ name: m.modelo, quantidade: m.total })),
//     }, { status: 200 });
//   } catch (error) {
//     console.error('Erro na API /home:', error);
//     return Response.json({ error: 'Erro ao buscar dados da página inicial' }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }
import { getAllProdutos } from '../produtos/controller/produtosController';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isEpocaPico = searchParams.get('epoca') === 'pico';

    // Fetch totais gerais
    const { totalProdutos, valorTotalRevenda } = await getAllProdutos({});

    // Fetch estoque por gênero
    const estoquePorGenero = await getAllProdutos({ tipo: 'genero' });

    // Fetch top modelos
    const topModelos = await getAllProdutos({ tipo: 'modelo' });

    // Fetch lotes hoje
    const today = new Date().toISOString().split('T')[0];
    const lotesHojeData = await prisma.produto.findMany({
      where: {
        dataRecebimento: {
          gte: new Date(today),
          lte: new Date(today + 'T23:59:59.999Z'),
        },
      },
      select: { lote: true },
      distinct: ['lote'],
    });
    const lotesHoje = lotesHojeData.length;

    // Fetch modelos ativos
    const modelosAtivosData = await getAllProdutos({ tipo: 'modelo' });
    const modelosAtivos = modelosAtivosData.filter(m => m.total > 0).length;

    // Definir limites por categoria e gênero
    const limites = {
      'Sandálias_Infantil Feminino': isEpocaPico ? 6 : 4,
      'Sandálias_Infantil Masculino': isEpocaPico ? 6 : 4,
      'Sandálias_Adulto Feminino': isEpocaPico ? 5 : 3,
      'Sandálias_Adulto Masculino': isEpocaPico ? 5 : 3,
      'Tênis_Infantil Feminino': isEpocaPico ? 4 : 3,
      'Tênis_Infantil Masculino': isEpocaPico ? 4 : 3,
      'Tênis_Adulto Feminino': isEpocaPico ? 3 : 2,
      'Tênis_Adulto Masculino': isEpocaPico ? 3 : 2,
      'Tamancos': isEpocaPico ? 3 : 2,
    };

    // Fetch produtos e agrupar por categoria, gênero e tamanho
    const produtos = await getAllProdutos({});
    const estoquePorCategoriaGeneroTamanho = produtos.data.reduce((acc, p) => {
      const modelo = p.modelo || 'Desconhecida';
      const genero = p.genero || 'Desconhecido';
      const tamanho = p.tamanho || 'Desconhecido';
      const chave = modelo === 'Tamancos' ? 'Tamancos' : `${modelo}_${genero}`;
      const chaveCompleta = `${chave}_${tamanho}`;

      if (!acc[chaveCompleta]) {
        acc[chaveCompleta] = {
          modelo,
          genero: modelo === 'Tamancos' ? null : genero,
          tamanho,
          total: 0,
        };
      }
      acc[chaveCompleta].total += p.quantidade || 0;
      return acc;
    }, {});

    // Gerar alertas
    const alerts = [];
    let lowStockCount = 0;
    for (const [chaveCompleta, info] of Object.entries(estoquePorCategoriaGeneroTamanho)) {
      const chaveLimite = info.modelo === 'Tamancos' ? 'Tamancos' : `${info.modelo}_${info.genero}`;
      const limite = limites[chaveLimite] || 3;
      if (info.total < limite && info.total >= 0) {
        lowStockCount++;
        const mensagem = info.modelo === 'Tamancos'
          ? `${info.modelo} tamanho ${info.tamanho} com ${info.total} unidades`
          : `${info.modelo} ${info.genero} tamanho ${info.tamanho} com ${info.total} unidades`;
        alerts.push({ message: mensagem });
      }
    }

    return Response.json({
      lowStockCount,
      lotesHoje,
      modelosAtivos,
      alerts,
      estoquePorGenero: estoquePorGenero.map(g => ({ name: g.genero, value: g.total })),
      topModelos: topModelos.map(m => ({ name: m.modelo, quantidade: m.total })),
    }, { status: 200 });
  } catch (error) {
    console.error('Erro na API /home:', error);
    return Response.json({ error: 'Erro ao buscar dados da página inicial' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}