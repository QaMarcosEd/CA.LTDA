import { prisma } from '../../../lib/prisma'; // Ajuste o path conforme necessário

export async function updatePagamentoParcela(id, body) {
  const parcelaId = parseInt(id);
  if (isNaN(parcelaId)) throw new Error('ID inválido');

  const { incrementoValorPago, observacao, formaPagamentoParcela, bandeira, modalidade, dataPagamento } = body;

  const parcela = await prisma.parcela.findUnique({ where: { id: parcelaId } });
  if (!parcela) throw new Error('Parcela não encontrada');

  const valorPagoExistente = parseFloat(parcela.valorPago || 0);
  const valorPendenteLiquido = parseFloat(parcela.valorLiquido || 0) - valorPagoExistente; // Valor líquido pendente
  const novoValorPago = parseFloat(incrementoValorPago);

  if (!novoValorPago || novoValorPago <= 0) throw new Error('Valor pago deve ser maior que zero');
  if (novoValorPago > valorPendenteLiquido) throw new Error(`Valor pago (R$ ${novoValorPago.toFixed(2)}) não pode exceder o valor líquido pendente (R$ ${valorPendenteLiquido.toFixed(2)})`);

  let taxaParcela = parcela.taxa || 0;
  let valorLiquidoParcela = parseFloat(novoValorPago);
  let formaPagamentoFormatada = parcela.formaPagamento;

  if (parcela.formaPagamento === 'PROMISSORIA') {
    if (formaPagamentoParcela?.toUpperCase() === 'CARTAO') throw new Error('Parcelas de promissória não podem ser pagas com cartão');
    const formasValidas = ['PIX', 'DINHEIRO'];
    formaPagamentoFormatada = formaPagamentoParcela?.toUpperCase() && formasValidas.includes(formaPagamentoParcela.toUpperCase()) ? formaPagamentoParcela.toUpperCase() : 'DINHEIRO';
    taxaParcela = 0;
    valorLiquidoParcela = parseFloat(novoValorPago);
  } else if (parcela.formaPagamento?.startsWith('CARTAO_')) {
    // Recalcular taxa com base no valor pago, mantendo proporção da taxa original
    const taxaOriginal = parseFloat(parcela.taxa) || 0;
    const valorOriginal = parseFloat(parcela.valor);
    if (taxaOriginal > 0 && valorOriginal > 0) {
      const taxaPercentual = taxaOriginal / valorOriginal; // Proporção da taxa
      taxaParcela = parseFloat((novoValorPago * taxaPercentual).toFixed(2));
      valorLiquidoParcela = parseFloat((novoValorPago - taxaParcela).toFixed(2));
    } else {
      valorLiquidoParcela = parseFloat(novoValorPago);
    }
  }

  const novoValorPagoTotal = valorPagoExistente + parseFloat(novoValorPago);
  const novoValorLiquidoTotal = parseFloat(parcela.valorLiquido || 0); // Mantém o valorLiquido total da parcela como referência
  const quitada = novoValorPagoTotal >= parseFloat(parcela.valorLiquido); // Mudança: usa valorLiquido para quitação

  if (dataPagamento) {
    const selectedDate = new Date(dataPagamento);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignora hora para comparação justa
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
      valorLiquido: novoValorLiquidoTotal, // Mantém o valorLiquido original da parcela
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
    saldoRestante: parseFloat(parcela.valor) - novoValorPagoTotal, // Mantém o saldo bruto para referência
  };
}