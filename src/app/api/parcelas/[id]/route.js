// parcelas/[id]/route.js
import { PrismaClient } from '@prisma/client';

// Inicializa o cliente Prisma para interagir com o banco de dados
const prisma = new PrismaClient();

// Função que lida com requisições PUT para atualizar uma parcela específica
export async function PUT(request, { params }) {
  try {
    // Extrai os dados enviados pelo frontend no corpo da requisição (incrementoValorPago, observacao, pago)
    const { incrementoValorPago, observacao, pago } = await request.json();
    // Log para depuração, mostrando os dados recebidos
    console.log('Dados recebidos em PUT /api/parcelas/[id]:', { incrementoValorPago, observacao, pago }); // Depuração

    // Busca a parcela no banco pelo ID fornecido na URL (params.id)
    const parcela = await prisma.parcela.findUnique({ where: { id: parseInt(params.id) } });
    // Verifica se a parcela existe; se não, retorna erro 404
    if (!parcela) {
      return new Response(JSON.stringify({ error: 'Parcela não encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Calcula o valor já pago da parcela (converte pra número, usa 0 se nulo)
    const valorPagoExistente = parseFloat(parcela.valorPago || 0);
    // Calcula o valor pendente (valor total da parcela menos o que já foi pago)
    const valorPendente = parseFloat(parcela.valor) - valorPagoExistente;
    // Converte o incremento de pagamento enviado pelo frontend pra número
    const novoValorPago = parseFloat(incrementoValorPago);

    // Valida se o novo valor pago é maior que zero; se não, retorna erro 400
    if (novoValorPago <= 0) {
      return new Response(JSON.stringify({ error: 'Valor pago deve ser maior que zero' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Valida se o novo valor pago não excede o valor pendente; se exceder, retorna erro 400 com detalhes
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

    // Calcula o novo total pago, somando o incremento ao valor já pago
    const novoValorPagoTotal = valorPagoExistente + novoValorPago;

    // Atualiza a parcela no banco com os novos dados
    const updatedParcela = await prisma.parcela.update({
      where: { id: parseInt(params.id) }, // Identifica a parcela pelo ID
      data: {
        valorPago: novoValorPagoTotal, // Atualiza o total pago
        observacao: observacao || parcela.observacao, // Usa nova observação ou mantém a atual
        pago: pago, // Atualiza o status 'pago' conforme enviado pelo frontend (true/false)
      },
    });

    // Log para depuração, mostrando a parcela atualizada
    console.log('Parcela atualizada:', updatedParcela); // Depuração
    // Retorna a parcela atualizada com status 200 (sucesso)
    return new Response(JSON.stringify(updatedParcela), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Captura qualquer erro durante o processo e loga para depuração
    console.error('Erro ao atualizar parcela:', error);
    // Retorna erro 500 com detalhes do problema
    return new Response(JSON.stringify({ error: 'Erro ao atualizar parcela', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

