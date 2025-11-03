// // app/api/home/controllers/homeController.js
// import { prisma } from '../../../lib/prisma'; // Ajuste path (de api/home/controller pra lib)
// import { getAllProdutos } from '../../produtos/controller/produtosController'; // Ajuste se path diferente

// export async function getHomeData(isEpocaPico = false) {
//   try {
//     // Fetch totais gerais e agregações (reutiliza getAllProdutos – assumindo que aceita { tipo } pra groupBy)
//     const { totalProdutos, valorTotalRevenda } = await getAllProdutos({}); // Ou ajuste params se necessário
//     const estoquePorGenero = await getAllProdutos({ tipo: 'genero' });
//     const topModelos = await getAllProdutos({ tipo: 'modelo' });

//     // Lotes hoje (otimizado com distinct)
//     const today = new Date().toISOString().split('T')[0];
//     const lotesHojeData = await prisma.produto.findMany({
//       where: {
//         dataRecebimento: {
//           gte: new Date(today),
//           lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1)), // Mais preciso que T23:59
//         },
//       },
//       select: { lote: true },
//       distinct: ['lote'],
//     });
//     const lotesHoje = lotesHojeData.length;

//     // Modelos ativos (filtrado por total > 0)
//     const modelosAtivosData = await getAllProdutos({ tipo: 'modelo' });
//     const modelosAtivos = modelosAtivosData.filter(m => (m.total || 0) > 0).length;

//     // Limites dinâmicos
//     const limites = {
//       'Sandálias_Infantil Feminino': isEpocaPico ? 6 : 4,
//       'Sandálias_Infantil Masculino': isEpocaPico ? 6 : 4,
//       'Sandálias_Adulto Feminino': isEpocaPico ? 5 : 3,
//       'Sandálias_Adulto Masculino': isEpocaPico ? 5 : 3,
//       'Tênis_Infantil Feminino': isEpocaPico ? 4 : 3,
//       'Tênis_Infantil Masculino': isEpocaPico ? 4 : 3,
//       'Tênis_Adulto Feminino': isEpocaPico ? 3 : 2,
//       'Tênis_Adulto Masculino': isEpocaPico ? 3 : 2,
//       'Tamancos': isEpocaPico ? 3 : 2,
//     };

//     // Fetch produtos gerais e agrupar
//     const produtosResponse = await getAllProdutos({}); // Assumindo retorna { data: [...] }
//     const produtos = produtosResponse.data || []; // Guard
//     const estoquePorCategoriaGeneroTamanho = produtos.reduce((acc, p) => {
//       const modelo = p.modelo || 'Desconhecida';
//       const genero = p.genero || 'Desconhecido';
//       const tamanho = p.tamanho || 'Desconhecido';
//       const chave = modelo === 'Tamancos' ? 'Tamancos' : `${modelo}_${genero}`;
//       const chaveCompleta = `${chave}_${tamanho}`;

//       if (!acc[chaveCompleta]) {
//         acc[chaveCompleta] = {
//           modelo,
//           genero: modelo === 'Tamancos' ? null : genero,
//           tamanho,
//           total: 0,
//         };
//       }
//       acc[chaveCompleta].total += p.quantidade || 0;
//       return acc;
//     }, {});

//     // Gerar alertas
//     const alerts = [];
//     let lowStockCount = 0;
//     for (const [chaveCompleta, info] of Object.entries(estoquePorCategoriaGeneroTamanho)) {
//       const chaveLimite = info.modelo === 'Tamancos' ? 'Tamancos' : `${info.modelo}_${info.genero}`;
//       const limite = limites[chaveLimite] || 3;
//       if (info.total < limite && info.total > 0) { // >0 pra ignorar zeros absolutos se não quiser
//         lowStockCount++;
//         const mensagem = info.modelo === 'Tamancos'
//           ? `${info.modelo} tamanho ${info.tamanho} com ${info.total} unidades`
//           : `${info.modelo} ${info.genero} tamanho ${info.tamanho} com ${info.total} unidades`;
//         alerts.push({ message: mensagem });
//       }
//     }

//     // Formata saídas pra charts/frontend
//     return {
//       lowStockCount,
//       lotesHoje,
//       modelosAtivos,
//       alerts,
//       estoquePorGenero: estoquePorGenero.map(g => ({ name: g.genero || 'Desconhecido', value: g.total || 0 })),
//       topModelos: topModelos.map(m => ({ name: m.modelo || 'Desconhecido', quantidade: m.total || 0 })),
//       // Adicione mais se precisar: totalProdutos, valorTotalRevenda (se usar no frontend)
//     };
//   } catch (error) {
//     console.error('Erro no getHomeData:', error);
//     throw new Error('Erro ao buscar dados da home: ' + error.message);
//   }
// }

// src/app/api/home/controllers/homeController.js
import { prisma } from '../../../lib/prisma';
import { getAllProdutos } from '../../produtos/controller/produtosController';
import { startOfDay, endOfDay } from 'date-fns';

export async function getHomeData(
  isEpocaPico = false,
  includeSemana = false,
  limitSemana = 3
) {
  try {
    // 1. TOTAIS DO ESTOQUE
    const totais = await getAllProdutos({});
    const totalPares = totais.totalProdutos || 0;
    const valorTotal = totais.valorTotalRevenda || 0;

    // 2. DADOS DO DASHBOARD
    const estoquePorGenero = await getAllProdutos({ tipo: 'genero' });
    const topModelos = await getAllProdutos({ tipo: 'modelo' });

    // 3. LOTES HOJE
    const hoje = new Date();
    const lotesHojeData = await prisma.produto.findMany({
      where: {
        dataRecebimento: {
          gte: startOfDay(hoje),
          lt: endOfDay(hoje),
        },
      },
      select: { lote: true },
      distinct: ['lote'],
    });
    const lotesHoje = lotesHojeData.length;

    // 4. MODELOS ATIVOS
    const modelosAtivos = topModelos.filter(m => (m.total || 0) > 0).length;

    // 5. LIMITES POR ÉPOCA
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

    // 6. ALERTAS + LOW STOCK
    const produtosResponse = await getAllProdutos({});
    const produtos = produtosResponse.data || [];
    const estoquePorCategoria = produtos.reduce((acc, p) => {
      const modelo = p.modelo || 'Desconhecida';
      const genero = p.genero || 'Desconhecido';
      const tamanho = p.tamanho || 'Desconhecido';
      const chave = modelo === 'Tamancos' ? 'Tamancos' : `${modelo}_${genero}`;
      const chaveCompleta = `${chave}_${tamanho}`;

      if (!acc[chaveCompleta]) {
        acc[chaveCompleta] = { modelo, genero: modelo === 'Tamancos' ? null : genero, tamanho, total: 0 };
      }
      acc[chaveCompleta].total += p.quantidade || 0;
      return acc;
    }, {});

    const alerts = [];
    let lowStockCount = 0;
    for (const [chave, info] of Object.entries(estoquePorCategoria)) {
      const chaveLimite = info.modelo === 'Tamancos' ? 'Tamancos' : `${info.modelo}_${info.genero}`;
      const limite = limites[chaveLimite] || 3;
      if (info.total > 0 && info.total < limite) {
        lowStockCount++;
        const msg = info.modelo === 'Tamancos'
          ? `${info.modelo} tamanho ${info.tamanho}: ${info.total} unid`
          : `${info.modelo} ${info.genero} tam ${info.tamanho}: ${info.total} unid`;
        alerts.push({ message: msg, urgente: msg.includes('Sandálias Infantil') });
      }
    }

// 7. TOP 3 DA SEMANA → AGRUPADO POR MODELO (NORMALIZADO)
let topSemana = [];
if (includeSemana) {
  try {
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    seteDiasAtras.setHours(0, 0, 0, 0);

    const vendasComProduto = await prisma.venda.findMany({
      where: {
        dataVenda: {
          gte: seteDiasAtras,
          lte: endOfDay(new Date()),
        },
      },
      select: {
        quantidade: true,
        produto: {
          select: {
            modelo: true,
          },
        },
      },
    });

    // Função para normalizar modelo
    const normalizar = (str) => {
      if (!str) return 'sem-modelo';
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove acentos
        .trim()
        .replace(/\s+/g, '-'); // espaços → hífen
    };

    // Agrupa por modelo normalizado
    const agrupado = vendasComProduto.reduce((acc, venda) => {
      const modeloRaw = venda.produto.modelo || 'Sem Modelo';
      const chave = normalizar(modeloRaw);
      if (!acc[chave]) {
        acc[chave] = { modelo: modeloRaw.trim(), qtd: 0 };
      }
      acc[chave].qtd += venda.quantidade;
      return acc;
    }, {});

    // Converte, ordena e pega top 3
    topSemana = Object.values(agrupado)
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, limitSemana);
  } catch (err) {
    console.error('Erro ao buscar topSemana:', err);
    topSemana = [];
  }
}

    // 8. RETORNO FINAL
    return {
      totalPares,
      valorTotal,
      lowStockCount,
      lotesHoje,
      modelosAtivos,
      alerts,
      topSemana,
      estoquePorGenero: estoquePorGenero.map(g => ({ name: g.genero, value: g.total || 0 })),
      topModelos: topModelos.map(m => ({ name: m.modelo, quantidade: m.total || 0 })),
    };
  } catch (error) {
    console.error('Erro no getHomeData:', error);
    throw new Error('Erro ao buscar dados da home: ' + error.message);
  }
}
