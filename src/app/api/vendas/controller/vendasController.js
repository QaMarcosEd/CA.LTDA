// src/app/api/vendas/controller/vendasController.js
import { prisma } from "../../../lib/prisma";

// === CRIAR VENDA ===
export async function createVenda(data) {
  try {
    const {
      produtoId, quantidade, observacao, clienteNome, clienteId, valorTotal, dataVenda,
      formaPagamento, bandeira, modalidade, formaPagamentoEntrada
    } = data;
    let { isParcelado = false, numeroParcelas = 1, entrada = 0 } = data;

    console.log('Dados recebidos em createVenda:', data);

    // === VALIDAÇÕES ===
    if (!produtoId) return { status: 400, data: { error: 'Produto ID é obrigatório' } };
    if (!quantidade || quantidade <= 0) return { status: 400, data: { error: 'Quantidade deve ser maior que zero' } };
    if (!valorTotal || valorTotal <= 0) return { status: 400, data: { error: 'Valor total deve ser maior que zero' } };
    if (!clienteNome && !clienteId) return { status: 400, data: { error: 'Nome ou ID do cliente é obrigatório' } };
    if (isParcelado && (!numeroParcelas || numeroParcelas < 1 || numeroParcelas > 12)) {
      return { status: 400, data: { error: 'Parcelas devem ser entre 1 e 12' } };
    }
    if (isParcelado && entrada && parseFloat(entrada) > parseFloat(valorTotal)) {
      return { status: 400, data: { error: 'Entrada não pode ser maior que o valor total' } };
    }
    if (isParcelado && entrada && parseFloat(entrada) < 0) {
      return { status: 400, data: { error: 'Entrada não pode ser negativa' } };
    }
    if (!dataVenda) return { status: 400, data: { error: 'Data da venda é obrigatória' } };

    const parsedDataVenda = new Date(dataVenda);
    if (isNaN(parsedDataVenda.getTime())) return { status: 400, data: { error: 'Data de venda inválida' } };
    if (parsedDataVenda > new Date()) return { status: 400, data: { error: 'Data de venda não pode ser futura' } };

    if (!formaPagamento) return { status: 400, data: { error: 'Forma de pagamento é obrigatória' } };

    // === TAXA DO CARTÃO ===
    let taxa = 0;
    let valorLiquido = parseFloat(valorTotal);
    let formaPagamentoFormatada = formaPagamento.toUpperCase();

    if (formaPagamento === 'CARTAO') {
      if (!bandeira || !modalidade) {
        return { status: 400, data: { error: 'Bandeira e modalidade são obrigatórias para cartão' } };
      }
      const taxaCartao = await prisma.taxaCartao.findUnique({
        where: { bandeira_modalidade: { bandeira: bandeira.toUpperCase(), modalidade: modalidade.toUpperCase() } },
      });
      if (!taxaCartao) return { status: 400, data: { error: 'Taxa não encontrada para essa bandeira/modalidade' } };

      const taxaPercentual = taxaCartao.taxaPercentual / 100;
      taxa = parseFloat((parseFloat(valorTotal) * taxaPercentual).toFixed(2));
      valorLiquido = parseFloat((parseFloat(valorTotal) - taxa).toFixed(2));
      formaPagamentoFormatada = `CARTAO_${bandeira.toUpperCase()}_${modalidade.toUpperCase()}`;
    } else if (isParcelado && formaPagamento !== 'PROMISSORIA') {
      return { status: 400, data: { error: 'Para parcelado sem promissória, use cartão' } };
    }

    // === FORMA DE ENTRADA (PROMISSÓRIA) ===
    if (formaPagamento === 'PROMISSORIA' && parseFloat(entrada) > 0) {
      if (!formaPagamentoEntrada || !['PIX', 'DINHEIRO'].includes(formaPagamentoEntrada.toUpperCase())) {
        return { status: 400, data: { error: 'Entrada deve ser PIX ou DINHEIRO para promissória' } };
      }
    }

    if (formaPagamento === 'CARTAO' && !isParcelado) {
      isParcelado = true;
      numeroParcelas = 1;
      entrada = 0;
    }

    // === CLIENTE ===
    let finalClienteId = clienteId;
    if (!finalClienteId && clienteNome) {
      let cliente = await prisma.cliente.findUnique({ where: { nome: clienteNome } });
      if (!cliente) {
        cliente = await prisma.cliente.create({ data: { nome: clienteNome } });
      }
      finalClienteId = cliente.id;
    }
    if (!finalClienteId) return { status: 400, data: { error: 'Cliente inválido' } };

    // === PRODUTO ===
    const produto = await prisma.produto.findUnique({ where: { id: parseInt(produtoId) } });
    if (!produto) return { status: 404, data: { error: 'Produto não encontrado' } };
    if (produto.quantidade < quantidade) return { status: 400, data: { error: 'Estoque insuficiente' } };

    // === DADOS DA VENDA ===
    const vendaData = {
      produtoId: parseInt(produtoId),
      quantidade: parseInt(quantidade),
      precoVenda: parseFloat(produto.precoVenda),
      valorTotal: parseFloat(valorTotal),
      entrada: isParcelado ? parseFloat(entrada) || 0 : parseFloat(valorTotal),
      formaPagamentoEntrada: formaPagamento === 'PROMISSORIA' && parseFloat(entrada) > 0 ? formaPagamentoEntrada.toUpperCase() : null,
      clienteId: finalClienteId,
      observacao: observacao || null,
      dataVenda: parsedDataVenda,
      formaPagamento: formaPagamentoFormatada,
      taxa,
      valorLiquido,
      status: isParcelado ? 'ABERTO' : 'QUITADO',
    };

    // === PARCELAS (SE FOR PARCELADO) ===
    if (isParcelado) {
      const entradaValor = parseFloat(entrada) || 0;
      const valorRestante = parseFloat(valorTotal) - entradaValor;
      const valorRestanteLiquido = parseFloat(valorLiquido) - entradaValor;
      const valorBaseParcela = Math.floor((valorRestante / numeroParcelas) * 100) / 100;
      const valorBaseParcelaLiquido = Math.floor((valorRestanteLiquido / numeroParcelas) * 100) / 100;
      const taxaPorParcela = formaPagamento === 'CARTAO' ? parseFloat((taxa / numeroParcelas).toFixed(2)) : 0;

      const parcelas = [];
      let somaParcelasLiquido = 0;

      for (let i = 0; i < numeroParcelas; i++) {
        const dataVencimento = new Date(parsedDataVenda);
        dataVencimento.setMonth(dataVencimento.getMonth() + (i + 1));

        const isLast = i === numeroParcelas - 1;
        const valorParcela = isLast
          ? parseFloat((valorRestante - valorBaseParcela * (numeroParcelas - 1)).toFixed(2))
          : parseFloat(valorBaseParcela.toFixed(2));
        const valorParcelaLiquido = isLast
          ? parseFloat((valorRestanteLiquido - valorBaseParcelaLiquido * (numeroParcelas - 1)).toFixed(2))
          : parseFloat(valorBaseParcelaLiquido.toFixed(2));

        somaParcelasLiquido += valorParcelaLiquido;

        parcelas.push({
          numeroParcela: i + 1,
          valor: valorParcela,
          valorPago: 0,
          dataVencimento,
          pago: false,
          observacao: null,
          formaPagamento: formaPagamento === 'CARTAO' ? formaPagamentoFormatada : 'PROMISSORIA',
          taxa: taxaPorParcela,
          valorLiquido: valorParcelaLiquido,
        });
      }

      if (Math.abs(somaParcelasLiquido - valorRestanteLiquido) > 0.01) {
        return { status: 500, data: { error: 'Erro interno: soma das parcelas líquidas inválida' } };
      }

      vendaData.parcelas = { create: parcelas };
      vendaData.status = 'ABERTO';
    }

    // === TRANSAÇÃO ===
    const result = await prisma.$transaction(async (tx) => {
      const venda = await tx.venda.create({
        data: vendaData,
        include: { cliente: { select: { nome: true } }, parcelas: true },
      });

      await tx.produto.update({
        where: { id: parseInt(produtoId) },
        data: {
          quantidade: produto.quantidade - quantidade,
          disponivel: produto.quantidade - quantidade > 0,
        },
      });

      await tx.cliente.update({
        where: { id: finalClienteId },
        data: { ultimaCompra: parsedDataVenda },
      });

      return venda;
    });

    return { status: 201, data: result };
  } catch (error) {
    console.error('Erro ao registrar venda:', error);
    return { status: 500, data: { error: 'Erro ao registrar venda', details: error.message } };
  }
}

// === LISTAR VENDAS POR PRODUTO ===
export async function getVendasPorProduto(produtoId) {
  try {
    const vendas = await prisma.venda.findMany({
      where: { produtoId: parseInt(produtoId) },
      orderBy: { dataVenda: 'desc' },
      include: {
        produto: true,
        cliente: { select: { nome: true } },
        parcelas: true,
      },
    });
    return { status: 200, data: vendas };
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    return { status: 500, data: { error: 'Erro ao listar vendas', details: error.message } };
  }
}

// === LISTAR TODAS AS VENDAS (COM FILTROS, RESUMO E RANKING) ===
export async function getTodasAsVendas(filtros = {}) {
  try {
    const { formaPagamento, dataInicio, dataFim, status, resumo } = filtros;

    // === WHERE CORRETO: NUNCA {} VAZIO ===
    const whereClause = {};

    if (dataInicio || dataFim) {
      whereClause.dataVenda = {
        ...(dataInicio && { gte: new Date(dataInicio) }),
        ...(dataFim && { lte: new Date(dataFim) }),
      };
    }
    if (status && status !== 'TODAS') whereClause.status = status;
    if (formaPagamento && formaPagamento !== 'TODAS') {
      whereClause.formaPagamento = formaPagamento === 'CARTAO'
        ? { contains: 'CARTAO' }
        : formaPagamento;
    }

    console.log('Filtros aplicados:', whereClause);

    // === RANKING DE MODELOS (SEGURO) ====
    let rankingModelos = [];
    try {
      const vendas = await prisma.venda.findMany({
        where: whereClause,
        select: {
          quantidade: true,
          produto: {
            select: { modelo: true }
          }
        }
      });

      if (vendas.length > 0) {
        // Agrupa por modelo e soma quantidade
        const agrupado = vendas.reduce((acc, venda) => {
          const modelo = venda.produto.modelo || 'Desconhecido';
          if (!acc[modelo]) {
            acc[modelo] = 0;
          }
          acc[modelo] += venda.quantidade;
          return acc;
        }, {});

        // Converte para array e ordena
        rankingModelos = Object.entries(agrupado)
          .map(([modelo, qtyVendida]) => ({ modelo, qtyVendida }))
          .filter(item => item.qtyVendida > 0)
          .sort((a, b) => b.qtyVendida - a.qtyVendida)
          .slice(0, 5);
      }
    } catch (error) {
      console.error('Erro ao calcular ranking de modelos:', error.message);
    }

    // === BUSCAR VENDAS ===
    const vendas = await prisma.venda.findMany({
      where: whereClause,
      orderBy: { dataVenda: 'desc' },
      include: {
        produto: { select: { nome: true, modelo: true } },
        cliente: { select: { nome: true } },
        parcelas: true,
      },
    });

    const vendasAjustadas = vendas.map(venda => {
      const temTaxa = venda.formaPagamento?.startsWith('CARTAO_') && venda.taxa > 0;
      const valorPagoTotal = (venda.entrada || 0) + venda.parcelas.reduce((sum, p) => sum + (p.valorPago || 0), 0);
      const totalExibicao = temTaxa ? parseFloat(venda.valorLiquido) : parseFloat(venda.valorTotal);
      const valorEmAberto = temTaxa
        ? parseFloat(venda.valorLiquido) - valorPagoTotal
        : parseFloat(venda.valorTotal) - valorPagoTotal;

      return {
        ...venda,
        totalExibicao,
        valorPagoTotal,
        valorEmAberto: Math.max(valorEmAberto, 0).toFixed(2),
      };
    });

    const resumoData = calcularResumoVendas(vendasAjustadas);

    if (resumo) {
      return { status: 200, data: { resumo: resumoData } };
    }

    return {
      status: 200,
      data: { vendas: vendasAjustadas, resumo: resumoData, rankingModelos }
    };
  } catch (error) {
    console.error('Erro ao listar vendas filtradas:', error);
    return { status: 500, data: { error: 'Erro ao listar vendas: ' + error.message } };
  }
  // REMOVIDO: finally { await prisma.$disconnect(); }
}

// === RESUMO DE VENDAS ===
function calcularResumoVendas(vendas) {
  let totalQuitado = 0;
  let totalPendente = 0;
  let porForma = { DINHEIRO: 0, PIX: 0, CARTAO: 0, PROMISSORIA: 0 };

  vendas.forEach(venda => {
    const temTaxa = venda.formaPagamento?.startsWith('CARTAO_') && venda.taxa > 0;
    const valorPagoTotal = parseFloat(venda.valorPagoTotal);
    totalQuitado += valorPagoTotal;
    totalPendente += parseFloat(venda.valorEmAberto);

    let forma = venda.formaPagamento?.startsWith('CARTAO_') ? 'CARTAO' : venda.formaPagamento || 'PROMISSORIA';
    if (venda.formaPagamentoEntrada && venda.entrada > 0) forma = venda.formaPagamentoEntrada;

    if (porForma[forma] !== undefined) porForma[forma] += valorPagoTotal;

    venda.parcelas.forEach(parcela => {
      if (parcela.valorPago > 0) {
        const method = parcela.formaPagamento?.startsWith('CARTAO_') ? 'CARTAO' : parcela.formaPagamento || 'PROMISSORIA';
        if (porForma[method] !== undefined) porForma[method] += parseFloat(parcela.valorPago);
      }
    });

    if (venda.formaPagamento === 'PROMISSORIA' && parseFloat(venda.valorEmAberto) > 0) {
      porForma.PROMISSORIA += parseFloat(venda.valorEmAberto);
    }
  });

  return {
    totalQuitado: totalQuitado.toFixed(2),
    totalPendente: totalPendente.toFixed(2),
    porForma,
  };
}