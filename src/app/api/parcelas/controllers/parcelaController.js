// app/api/parcelas/controller/parcelaController.js
import { prisma } from '../../../lib/prisma'; // Ajuste path (de api/parcelas/controller pra lib)

export async function updatePagamentoParcela(id, body) {
  const parcelaId = parseInt(id);
  if (isNaN(parcelaId)) throw new Error('ID inválido');

  const { incrementoValorPago, observacao, formaPagamentoParcela, bandeira, modalidade, dataPagamento } = body;

  const parcela = await prisma.parcela.findUnique({ where: { id: parcelaId } });
  if (!parcela) throw new Error('Parcela não encontrada');

  const valorPagoExistente = parseFloat(parcela.valorPago || 0);
  const valorPendente = parseFloat(parcela.valor) - valorPagoExistente;
  const novoValorPago = parseFloat(incrementoValorPago);

  if (!novoValorPago || novoValorPago <= 0) throw new Error('Valor pago deve ser maior que zero');
  if (novoValorPago > valorPendente) throw new Error(`Valor pago (R$ ${novoValorPago.toFixed(2)}) não pode exceder o valor pendente (R$ ${valorPendente.toFixed(2)})`);

  let taxaParcela = parcela.taxa || 0;
  let valorLiquidoParcela = novoValorPago;
  let formaPagamentoFormatada = parcela.formaPagamento;

  if (parcela.formaPagamento === 'PROMISSORIA') {
    if (formaPagamentoParcela?.toUpperCase() === 'CARTAO') throw new Error('Parcelas de promissória não podem ser pagas com cartão');
    const formasValidas = ['PIX', 'DINHEIRO'];
    formaPagamentoFormatada = formaPagamentoParcela?.toUpperCase() && formasValidas.includes(formaPagamentoParcela.toUpperCase()) ? formaPagamentoParcela.toUpperCase() : 'DINHEIRO';
    taxaParcela = 0;
    valorLiquidoParcela = novoValorPago;
  } else if (parcela.formaPagamento?.startsWith('CARTAO_')) {
    valorLiquidoParcela = novoValorPago - taxaParcela;
  }

  const novoValorPagoTotal = valorPagoExistente + novoValorPago;
  const novoValorLiquidoTotal = parseFloat(parcela.valorLiquido || 0) + valorLiquidoParcela;
  const quitada = novoValorPagoTotal >= parseFloat(parcela.valor);

  if (dataPagamento) {
    const selectedDate = new Date(dataPagamento);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignora hora pra comparação justa
    if (selectedDate > today) throw new Error('Data de pagamento não pode ser futura');
  }

  const updatedParcela = await prisma.parcela.update({
    where: { id: parcelaId },
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

  // Atualiza status da venda se todas parcelas quitadas
  const venda = await prisma.venda.findUnique({
    where: { id: parcela.vendaId },
    include: { parcelas: true },
  });
  if (venda) {
    const todasPagas = venda.parcelas.every((p) => p.pago);
    if (todasPagas) {
      await prisma.venda.update({
        where: { id: parcela.vendaId },
        data: { status: 'QUITADO' },
      });
    }
  }

  return {
    ...updatedParcela,
    saldoRestante: parseFloat(parcela.valor) - novoValorPagoTotal,
  };
}