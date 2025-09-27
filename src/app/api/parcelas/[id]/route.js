// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export async function PUT(request, { params }) {
//   try {
//     const { incrementoValorPago, observacao, pago } = await request.json();
//     console.log('Dados recebidos em PUT /api/parcelas/[id]:', { incrementoValorPago, observacao, pago }); // Depuração

//     const parcela = await prisma.parcela.findUnique({ where: { id: parseInt(params.id) } });
//     if (!parcela) {
//       return new Response(JSON.stringify({ error: 'Parcela não encontrada' }), {
//         status: 404,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     const valorPagoExistente = parseFloat(parcela.valorPago || 0);
//     const valorPendente = parseFloat(parcela.valor) - valorPagoExistente;
//     const novoValorPago = parseFloat(incrementoValorPago);

//     if (novoValorPago <= 0) {
//       return new Response(JSON.stringify({ error: 'Valor pago deve ser maior que zero' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     if (novoValorPago > valorPendente) {
//       return new Response(
//         JSON.stringify({
//           error: `Valor pago (R$ ${novoValorPago.toFixed(2)}) não pode exceder o valor pendente (R$ ${valorPendente.toFixed(2)})`,
//         }),
//         {
//           status: 400,
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
//     }

//     const novoValorPagoTotal = valorPagoExistente + novoValorPago;

//     const updatedParcela = await prisma.parcela.update({
//       where: { id: parseInt(params.id) },
//       data: {
//         valorPago: novoValorPagoTotal,
//         observacao: observacao || parcela.observacao,
//         pago: pago, // Respeita o valor enviado pelo frontend
//       },
//     });

//     console.log('Parcela atualizada:', updatedParcela); // Depuração
//     return new Response(JSON.stringify(updatedParcela), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.error('Erro ao atualizar parcela:', error);
//     return new Response(JSON.stringify({ error: 'Erro ao atualizar parcela', details: error.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }
// import { PrismaClient } from '@prisma/client';

// // Inicializa o cliente Prisma para interagir com o banco de dados
// const prisma = new PrismaClient();

// // Função que lida com requisições PUT para atualizar uma parcela específica
// export async function PUT(request, { params }) {
//   try {
//     const { incrementoValorPago, observacao, pago, formaPagamentoParcela, bandeira, modalidade } = await request.json();
//     console.log('Dados recebidos em PUT /api/parcelas/[id]:', { incrementoValorPago, observacao, pago, formaPagamentoParcela, bandeira, modalidade });

//     const parcela = await prisma.parcela.findUnique({ where: { id: parseInt(params.id) } });
//     if (!parcela) {
//       return new Response(JSON.stringify({ error: 'Parcela não encontrada' }), {
//         status: 404,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     const valorPagoExistente = parseFloat(parcela.valorPago || 0);
//     const valorPendente = parseFloat(parcela.valor) - valorPagoExistente;
//     const novoValorPago = parseFloat(incrementoValorPago);

//     // Valida se o novo valor pago é maior que zero; se não, retorna erro 400
//     if (novoValorPago <= 0) {
//       return new Response(JSON.stringify({ error: 'Valor pago deve ser maior que zero' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // Valida se o novo valor pago não excede o valor pendente; se exceder, retorna erro 400 com detalhes
//     if (novoValorPago > valorPendente) {
//       return new Response(
//         JSON.stringify({
//           error: `Valor pago (R$ ${novoValorPago.toFixed(2)}) não pode exceder o valor pendente (R$ ${valorPendente.toFixed(2)})`,
//         }),
//         {
//           status: 400,
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
//     }

//     let taxaParcela = 0;
//     let valorLiquidoParcela = novoValorPago;
//     let formaPagamentoFormatada = formaPagamentoParcela ? formaPagamentoParcela.toUpperCase() : null;

//     if (formaPagamentoParcela === 'CARTAO') {
//       if (!bandeira || !modalidade) {
//         return new Response(JSON.stringify({ error: 'Bandeira e modalidade são obrigatórias para cartão' }), { status: 400 });
//       }
//       const taxaCartao = await prisma.taxaCartao.findUnique({
//         where: { bandeira_modalidade: { bandeira: bandeira.toUpperCase(), modalidade: modalidade.toUpperCase() } },
//       });
//       if (!taxaCartao) {
//         return new Response(JSON.stringify({ error: 'Taxa não encontrada para essa bandeira e modalidade' }), { status: 400 });
//       }
//       const taxaPercentual = taxaCartao.taxaPercentual / 100;
//       taxaParcela = parseFloat((novoValorPago * taxaPercentual).toFixed(2));
//       valorLiquidoParcela = parseFloat((novoValorPago - taxaParcela).toFixed(2));
//       formaPagamentoFormatada = `CARTAO_${bandeira.toUpperCase()}_${modalidade.toUpperCase()}`;
//     }

//     const novoValorPagoTotal = valorPagoExistente + novoValorPago;
//     const novoValorLiquidoTotal = parseFloat(parcela.valorLiquido || 0) + valorLiquidoParcela;

//     const updatedParcela = await prisma.parcela.update({
//       where: { id: parseInt(params.id) },
//       data: {
//         valorPago: novoValorPagoTotal,
//         observacao: observacao || parcela.observacao,
//         pago: pago,
//         formaPagamento: formaPagamentoFormatada,
//         taxa: taxaParcela, // Só pro incremento, ou soma se quiser total
//         valorLiquido: novoValorLiquidoTotal,
//         dataPagamento: pago ? new Date() : null,
//       },
//     });

//     console.log('Parcela atualizada:', updatedParcela); // Depuração
//     return new Response(JSON.stringify(updatedParcela), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.error('Erro ao atualizar parcela:', error);
//     return new Response(JSON.stringify({ error: 'Erro ao atualizar parcela', details: error.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    const { incrementoValorPago, observacao, pago, formaPagamentoParcela, bandeira, modalidade } = await request.json();
    console.log('Dados recebidos em PUT /api/parcelas/[id]:', { incrementoValorPago, observacao, pago, formaPagamentoParcela, bandeira, modalidade });

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

    // Valida se o novo valor pago é maior que zero
    if (novoValorPago <= 0) {
      return new Response(JSON.stringify({ error: 'Valor pago deve ser maior que zero' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Valida se o novo valor pago não excede o valor pendente
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

    let taxaParcela = parcela.taxa || 0; // Usa taxa já definida na parcela
    let valorLiquidoParcela = novoValorPago; // Inicialmente igual ao pago
    let formaPagamentoFormatada = parcela.formaPagamento; // Mantém forma existente por padrão

    // Se a parcela é de uma promissória, permite definir nova forma de pagamento
    if (parcela.formaPagamento === 'PROMISSORIA' && formaPagamentoParcela) {
      if (formaPagamentoParcela === 'CARTAO') {
        if (!bandeira || !modalidade) {
          return new Response(JSON.stringify({ error: 'Bandeira e modalidade são obrigatórias para cartão' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        const taxaCartao = await prisma.taxaCartao.findUnique({
          where: { bandeira_modalidade: { bandeira: bandeira.toUpperCase(), modalidade: modalidade.toUpperCase() } },
        });
        if (!taxaCartao) {
          return new Response(JSON.stringify({ error: 'Taxa não encontrada para essa bandeira e modalidade' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        const taxaPercentual = taxaCartao.taxaPercentual / 100;
        taxaParcela = parseFloat((novoValorPago * taxaPercentual).toFixed(2));
        valorLiquidoParcela = parseFloat((novoValorPago - taxaParcela).toFixed(2));
        formaPagamentoFormatada = `CARTAO_${bandeira.toUpperCase()}_${modalidade.toUpperCase()}`;
      } else {
        formaPagamentoFormatada = formaPagamentoParcela.toUpperCase(); // Dinheiro ou Pix
        taxaParcela = 0; // Sem taxa pra Dinheiro/Pix
        valorLiquidoParcela = novoValorPago;
      }
    } else if (parcela.formaPagamento?.startsWith('CARTAO_')) {
      // Para cartão, mantém forma e taxa originais
      formaPagamentoFormatada = parcela.formaPagamento;
      valorLiquidoParcela = novoValorPago - taxaParcela; // Usa taxa da parcela
    }

    const novoValorPagoTotal = valorPagoExistente + novoValorPago;
    const novoValorLiquidoTotal = parseFloat(parcela.valorLiquido || 0) + valorLiquidoParcela;

    const updatedParcela = await prisma.parcela.update({
      where: { id: parseInt(params.id) },
      data: {
        valorPago: novoValorPagoTotal,
        observacao: observacao || parcela.observacao,
        pago: pago,
        formaPagamento: formaPagamentoFormatada,
        taxa: taxaParcela,
        valorLiquido: novoValorLiquidoTotal,
        dataPagamento: pago ? new Date() : null, // Data real do recebimento
      },
    });

    // Atualiza status da venda se todas parcelas estiverem pagas
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

    console.log('Parcela atualizada:', updatedParcela);
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