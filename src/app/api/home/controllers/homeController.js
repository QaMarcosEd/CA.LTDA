// app/api/home/controllers/homeController.js
import { prisma } from '../../../lib/prisma'; // Ajuste path (de api/home/controller pra lib)
import { getAllProdutos } from '../../produtos/controller/produtosController'; // Ajuste se path diferente

export async function getHomeData(isEpocaPico = false) {
  try {
    // Fetch totais gerais e agregações (reutiliza getAllProdutos – assumindo que aceita { tipo } pra groupBy)
    const { totalProdutos, valorTotalRevenda } = await getAllProdutos({}); // Ou ajuste params se necessário
    const estoquePorGenero = await getAllProdutos({ tipo: 'genero' });
    const topModelos = await getAllProdutos({ tipo: 'modelo' });

    // Lotes hoje (otimizado com distinct)
    const today = new Date().toISOString().split('T')[0];
    const lotesHojeData = await prisma.produto.findMany({
      where: {
        dataRecebimento: {
          gte: new Date(today),
          lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1)), // Mais preciso que T23:59
        },
      },
      select: { lote: true },
      distinct: ['lote'],
    });
    const lotesHoje = lotesHojeData.length;

    // Modelos ativos (filtrado por total > 0)
    const modelosAtivosData = await getAllProdutos({ tipo: 'modelo' });
    const modelosAtivos = modelosAtivosData.filter(m => (m.total || 0) > 0).length;

    // Limites dinâmicos
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

    // Fetch produtos gerais e agrupar
    const produtosResponse = await getAllProdutos({}); // Assumindo retorna { data: [...] }
    const produtos = produtosResponse.data || []; // Guard
    const estoquePorCategoriaGeneroTamanho = produtos.reduce((acc, p) => {
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
      if (info.total < limite && info.total > 0) { // >0 pra ignorar zeros absolutos se não quiser
        lowStockCount++;
        const mensagem = info.modelo === 'Tamancos'
          ? `${info.modelo} tamanho ${info.tamanho} com ${info.total} unidades`
          : `${info.modelo} ${info.genero} tamanho ${info.tamanho} com ${info.total} unidades`;
        alerts.push({ message: mensagem });
      }
    }

    // Formata saídas pra charts/frontend
    return {
      lowStockCount,
      lotesHoje,
      modelosAtivos,
      alerts,
      estoquePorGenero: estoquePorGenero.map(g => ({ name: g.genero || 'Desconhecido', value: g.total || 0 })),
      topModelos: topModelos.map(m => ({ name: m.modelo || 'Desconhecido', quantidade: m.total || 0 })),
      // Adicione mais se precisar: totalProdutos, valorTotalRevenda (se usar no frontend)
    };
  } catch (error) {
    console.error('Erro no getHomeData:', error);
    throw new Error('Erro ao buscar dados da home: ' + error.message);
  }
}