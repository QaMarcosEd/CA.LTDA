import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    const { incrementoValorPago, observacao, pago } = await request.json();
    console.log('Dados recebidos em PUT /api/parcelas/[id]:', { incrementoValorPago, observacao, pago }); // Depuração

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
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const novoValorPagoTotal = valorPagoExistente + novoValorPago;

    const updatedParcela = await prisma.parcela.update({
      where: { id: parseInt(params.id) },
      data: {
        valorPago: novoValorPagoTotal,
        observacao: observacao || parcela.observacao,
        pago: pago, // Respeita o valor enviado pelo frontend
      },
    });

    console.log('Parcela atualizada:', updatedParcela); // Depuração
    return new Response(JSON.stringify(updatedParcela), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao atualizar parcela:', error);
    return new Response(JSON.stringify({ error: 'Erro ao atualizar parcela', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
