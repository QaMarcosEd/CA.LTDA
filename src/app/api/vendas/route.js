// // api/vendas/route.js
// import { createVenda, getVendasPorProduto, getTodasAsVendas } from './controller/vendasController';

// export async function POST(request) {
//   const data = await request.json();
//   console.log('Dados recebidos no POST /api/vendas:', data); // Depuração
//   const result = await createVenda(data);
  
//   return new Response(JSON.stringify(result.data), { status: result.status });
// }

// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const produtoId = searchParams.get('produtoId');
//   const formaPagamento = searchParams.get('formaPagamento');
//   const dataInicio = searchParams.get('dataInicio');
//   const dataFim = searchParams.get('dataFim');
//   const status = searchParams.get('status');

//   let result;
//   if (produtoId) {
//     // Mantém o antigo pra por produto
//     result = await getVendasPorProduto(produtoId);
//   } else {
//     result = await getTodasAsVendas({
//       formaPagamento,
//       dataInicio,
//       dataFim,
//       status,
//     });
//   }

//   return new Response(JSON.stringify(result.data), { status: result.status });
// }
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const data = await request.json();
    const { produtoId, quantidade, clienteId, clienteNome, valorTotal, entrada, formaPagamento, bandeira, modalidade, formaPagamentoEntrada, isParcelado, numeroParcelas, dataVenda, observacao } = data;

    // Validar dados
    if (!produtoId || !quantidade || !clienteId || !valorTotal || !formaPagamento || !dataVenda) {
      return new Response(JSON.stringify({ error: 'Dados obrigatórios ausentes' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verificar produto
    const produto = await prisma.produto.findUnique({ where: { id: parseInt(produtoId) } });
    if (!produto || produto.quantidade < quantidade) {
      return new Response(JSON.stringify({ error: 'Produto não encontrado ou estoque insuficiente' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Calcular taxa e valor líquido (se for cartão)
    let taxa = 0;
    let valorLiquido = parseFloat(valorTotal);
    if (formaPagamento === 'CARTAO' && bandeira && modalidade) {
      const taxaCartao = await prisma.taxaCartao.findFirst({
        where: { bandeira, modalidade },
      });
      if (taxaCartao) {
        taxa = (parseFloat(valorTotal) * (taxaCartao.taxaPercentual / 100)).toFixed(2);
        valorLiquido = (parseFloat(valorTotal) - parseFloat(taxa)).toFixed(2);
      }
    }

    // Criar venda
    const venda = await prisma.venda.create({
      data: {
        produtoId: parseInt(produtoId),
        quantidade: parseInt(quantidade),
        precoVenda: parseFloat(produto.preco),
        valorTotal: parseFloat(valorTotal),
        entrada: parseFloat(entrada) || 0,
        formaPagamentoEntrada: formaPagamentoEntrada || null,
        clienteId: parseInt(clienteId),
        observacao: observacao || null,
        dataVenda: new Date(dataVenda),
        formaPagamento: formaPagamento === 'CARTAO' ? `CARTAO_${bandeira}_${modalidade}` : formaPagamento,
        taxa: parseFloat(taxa) || 0,
        valorLiquido: parseFloat(valorLiquido) || 0,
        status: isParcelado ? 'ABERTO' : 'PAGO',
      },
    });

    // Criar parcelas (se for parcelado)
    if (isParcelado && numeroParcelas > 1) {
      const valorParcela = ((valorTotal - (parseFloat(entrada) || 0)) / parseInt(numeroParcelas)).toFixed(2);
      const parcelas = Array.from({ length: parseInt(numeroParcelas) }, (_, i) => ({
        vendaId: venda.id,
        numeroParcela: i + 1,
        valor: parseFloat(valorParcela),
        dataVencimento: new Date(new Date(dataVenda).setMonth(new Date(dataVenda).getMonth() + i + 1)),
      }));
      await prisma.parcela.createMany({ data: parcelas });
    }

    // Atualizar estoque do produto
    await prisma.produto.update({
      where: { id: parseInt(produtoId) },
      data: { quantidade: produto.quantidade - parseInt(quantidade) },
    });

    // Atualizar ultimaCompra e frequenciaCompras do cliente
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
    const comprasRecentes = await prisma.venda.count({
      where: {
        clienteId: parseInt(clienteId),
        dataVenda: { gte: seisMesesAtras },
      },
    });
    const frequenciaCompras = comprasRecentes <= 1 ? 'BAIXA' : comprasRecentes <= 5 ? 'MEDIA' : 'ALTA';

    await prisma.cliente.update({
      where: { id: parseInt(clienteId) },
      data: {
        ultimaCompra: new Date(dataVenda),
        frequenciaCompras,
      },
    });

    return new Response(JSON.stringify(venda), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao registrar venda:', error);
    return new Response(JSON.stringify({ error: 'Erro ao registrar venda', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
