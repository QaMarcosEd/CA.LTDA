// src/app/api/home/controllers/homeController.js
import { prisma } from '../../../lib/prisma';
import { getAllProdutos } from '../../produtos/controller/produtosController';

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

    // 3. LOTES HOJE → CONTAR LOTES ÚNICOS POR createdAt
    const hoje = new Date();
    const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
    fimDia.setMilliseconds(-1);

    const lotesHojeData = await prisma.produto.groupBy({
      by: ['lote'],
      where: {
        createdAt: {
          gte: inicioDia,
          lte: fimDia,
        },
        lote: { not: null },
      },
      _count: { lote: true },
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
              lte: new Date(),
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

        const normalizar = (str) => {
          if (!str) return 'sem-modelo';
          return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .replace(/\s+/g, '-');
        };

        const agrupado = vendasComProduto.reduce((acc, venda) => {
          const modeloRaw = venda.produto.modelo || 'Sem Modelo';
          const chave = normalizar(modeloRaw);
          if (!acc[chave]) {
            acc[chave] = { modelo: modeloRaw.trim(), qtd: 0 };
          }
          acc[chave].qtd += venda.quantidade;
          return acc;
        }, {});

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
      lotesHoje, // ← AGORA É 1 LOTE, NÃO 9 PRODUTOS!
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
