import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  let body;
  try {
    // Await params - CORREÇÃO PRINCIPAL PRO NEXT.JS 15
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'ID inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse body com try/catch pra evitar crash se não JSON
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Erro ao parsear JSON do body:', parseError);
      return new Response(JSON.stringify({ error: 'Body inválido (não JSON)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { incrementoValorPago, observacao, formaPagamentoParcela, bandeira, modalidade, dataPagamento } = body;

    const parcela = await prisma.parcela.findUnique({ where: { id } });
    if (!parcela) {
      return new Response(JSON.stringify({ error: 'Parcela não encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const valorPagoExistente = parseFloat(parcela.valorPago || 0);
    const valorPendente = parseFloat(parcela.valor) - valorPagoExistente;
    const novoValorPago = parseFloat(incrementoValorPago);

    if (!novoValorPago || novoValorPago <= 0) {
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

    if (parcela.formaPagamento === 'PROMISSORIA') {
      if (formaPagamentoParcela?.toUpperCase() === 'CARTAO') {
        return new Response(JSON.stringify({ error: 'Parcelas de promissória não podem ser pagas com cartão' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Valida forma de pagamento
      const formasValidas = ['PIX', 'DINHEIRO'];
      formaPagamentoFormatada = formaPagamentoParcela?.toUpperCase() && formasValidas.includes(formaPagamentoParcela.toUpperCase())
        ? formaPagamentoParcela.toUpperCase()
        : 'DINHEIRO'; // Default se inválido

      taxaParcela = 0;
      valorLiquidoParcela = novoValorPago;
    } else if (parcela.formaPagamento?.startsWith('CARTAO_')) {
      valorLiquidoParcela = novoValorPago - taxaParcela;
    }

    const novoValorPagoTotal = valorPagoExistente + novoValorPago;
    const novoValorLiquidoTotal = parseFloat(parcela.valorLiquido || 0) + valorLiquidoParcela;
    const quitada = novoValorPagoTotal >= parseFloat(parcela.valor);

    // Validação extra de data (evita futura, como no modal)
    if (dataPagamento) {
      const selectedDate = new Date(dataPagamento);
      const today = new Date();
      if (selectedDate > today) {
        return new Response(JSON.stringify({ error: 'Data de pagamento não pode ser futura' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const updatedParcela = await prisma.parcela.update({
      where: { id },
      data: {
        valorPago: novoValorPagoTotal,
        observacao: observacao || parcela.observacao,
        pago: quitada,
        formaPagamento: formaPagamentoFormatada,
        taxa: taxaParcela,
        valorLiquido: novoValorLiquidoTotal,
        dataPagamento: quitada ? (dataPagamento ? new Date(dataPagamento) : new Date()) : null,
      },
    });

    // Atualiza status da venda
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
    console.error('Erro ao atualizar parcela:', {
      error: error.message,
      parcelaId: params ? (await params).id : 'desconhecido',
      requestBody: body || 'não parseado',
    });
    return new Response(JSON.stringify({ error: 'Erro ao atualizar parcela', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    // Boa prática: desconecta (opcional, mas evita leaks)
    await prisma.$disconnect();
  }
}
