// api/parcelas/[id]/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    const { incrementoValorPago, observacao, formaPagamentoParcela, bandeira, modalidade } = await request.json();

    const parcela = await prisma.parcela.findUnique({ where: { id: parseInt(params.id) } });
    if (!parcela) {
      return new Response(JSON.stringify({ error: 'Parcela não encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const valorPagoExistente = parseFloat(parcela.valorPago || 0);
    const valorPendente = parseFloat(parcela.valor) - valorPagoExistente;
    const novoValorPago = parseFloat(incrementoValorPago);

    if (novoValorPago <= 0) {
      return new Response(JSON.stringify({ error: 'Valor pago deve ser maior que zero' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (novoValorPago > valorPendente) {
      return new Response(
        JSON.stringify({
          error: `Valor pago (R$ ${novoValorPago.toFixed(2)}) não pode exceder o valor pendente (R$ ${valorPendente.toFixed(2)})`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let taxaParcela = parcela.taxa || 0;
    let valorLiquidoParcela = novoValorPago;
    let formaPagamentoFormatada = parcela.formaPagamento;

    // Bloqueia Cartão para parcelas de promissória
    if (parcela.formaPagamento === 'PROMISSORIA') {
      if (formaPagamentoParcela?.toUpperCase() === 'CARTAO') {
        return new Response(JSON.stringify({ error: 'Parcelas de promissória não podem ser pagas com cartão' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Aceita apenas DINHEIRO ou PIX
      if (formaPagamentoParcela) {
        formaPagamentoFormatada = formaPagamentoParcela.toUpperCase();
      } else {
        formaPagamentoFormatada = 'DINHEIRO'; // Default se não informado
      }

      taxaParcela = 0;
      valorLiquidoParcela = novoValorPago;
    } else if (parcela.formaPagamento?.startsWith('CARTAO_')) {
      // Mantém taxa e forma de cartão se já era cartão
      valorLiquidoParcela = novoValorPago - taxaParcela;
    }

    const novoValorPagoTotal = valorPagoExistente + novoValorPago;
    const novoValorLiquidoTotal = parseFloat(parcela.valorLiquido || 0) + valorLiquidoParcela;
    const quitada = novoValorPagoTotal >= parseFloat(parcela.valor);

    const updatedParcela = await prisma.parcela.update({
      where: { id: parseInt(params.id) },
      data: {
        valorPago: novoValorPagoTotal,
        observacao: observacao || parcela.observacao,
        pago: quitada,
        formaPagamento: formaPagamentoFormatada,
        taxa: taxaParcela,
        valorLiquido: novoValorLiquidoTotal,
        dataPagamento: quitada ? new Date() : null,
      },
    });

    // Atualiza status da venda se todas parcelas estiverem quitadas
    const venda = await prisma.venda.findUnique({
      where: { id: parcela.vendaId },
      include: { parcelas: true },
    });
    const todasPagas = venda.parcelas.every((p) => p.pago);
    if (todasPagas) {
      await prisma.venda.update({
        where: { id: parcela.vendaId },
        data: { status: 'QUITADO' },
      });
    }

    return new Response(
      JSON.stringify({
        ...updatedParcela,
        saldoRestante: parseFloat(parcela.valor) - novoValorPagoTotal,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao atualizar parcela:', error);
    return new Response(JSON.stringify({ error: 'Erro ao atualizar parcela', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

