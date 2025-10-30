// import { prisma } from "../../../lib/prisma";

// // Função para criar uma nova venda no sistema.
// export async function createVenda(data) {
//   try {
//     const { produtoId, quantidade, observacao, clienteNome, clienteId, valorTotal, dataVenda, formaPagamento, bandeira, modalidade, formaPagamentoEntrada } = data;
//     let { isParcelado, numeroParcelas, entrada } = data;
//     console.log('Dados recebidos em createVenda:', data);

//     // Validar entrada
//     if (!produtoId) {
//       console.log('Validação falhou: produtoId faltando', { produtoId });
//       return { status: 400, data: { error: 'Produto ID é obrigatório' } };
//     }
//     if (!quantidade || quantidade <= 0) {
//       console.log('Validação falhou: quantidade inválida', { quantidade });
//       return { status: 400, data: { error: 'Quantidade deve ser maior que zero' } };
//     }
//     if (!valorTotal || valorTotal <= 0) {
//       console.log('Validação falhou: valorTotal inválido', { valorTotal });
//       return { status: 400, data: { error: 'Valor total deve ser maior que zero' } };
//     }
//     if (!clienteNome && !clienteId) {
//       console.log('Validação falhou: clienteNome e clienteId faltando', { clienteNome, clienteId });
//       return { status: 400, data: { error: 'Nome do cliente ou ID do cliente é obrigatório' } };
//     }
//     if (isParcelado && (!numeroParcelas || numeroParcelas < 1 || numeroParcelas > 12)) {
//       console.log('Validação falhou: Número de parcelas inválido', { numeroParcelas });
//       return { status: 400, data: { error: 'Número de parcelas deve ser entre 1 e 12' } };
//     }
//     if (isParcelado && entrada && parseFloat(entrada) > parseFloat(valorTotal)) {
//       console.log('Validação falhou: Entrada maior que valor total', { entrada, valorTotal });
//       return { status: 400, data: { error: 'Entrada não pode ser maior que o valor total' } };
//     }
//     if (!dataVenda) {
//       console.log('Validação falhou: dataVenda faltando', { dataVenda });
//       return { status: 400, data: { error: 'Data da venda é obrigatória' } };
//     }
//     const parsedDataVenda = new Date(dataVenda);
//     if (isNaN(parsedDataVenda.getTime())) {
//       console.log('Validação falhou: Data de venda inválida', { dataVenda });
//       return { status: 400, data: { error: 'Data de venda inválida' } };
//     }
//     if (parsedDataVenda > new Date()) {
//       console.log('Validação falhou: Data de venda futura', { dataVenda });
//       return { status: 400, data: { error: 'Data de venda não pode ser futura' } };
//     }

//     // Validação para forma de pagamento
//     if (!formaPagamento) {
//       return { status: 400, data: { error: 'Forma de pagamento é obrigatória' } };
//     }
//     let taxa = 0;
//     let valorLiquido = parseFloat(valorTotal);
//     let formaPagamentoFormatada = formaPagamento.toUpperCase();

//     if (formaPagamento === 'CARTAO') {
//       if (!bandeira || !modalidade) {
//         return { status: 400, data: { error: 'Bandeira e modalidade são obrigatórias para cartão' } };
//       }
//       const taxaCartao = await prisma.taxaCartao.findUnique({
//         where: { bandeira_modalidade: { bandeira: bandeira.toUpperCase(), modalidade: modalidade.toUpperCase() } },
//       });
//       if (!taxaCartao) {
//         return { status: 400, data: { error: 'Taxa não encontrada para essa bandeira e modalidade' } };
//       }
//       const taxaPercentual = taxaCartao.taxaPercentual / 100;
//       taxa = parseFloat((parseFloat(valorTotal) * taxaPercentual).toFixed(2));
//       valorLiquido = parseFloat((parseFloat(valorTotal) - taxa).toFixed(2));
//       formaPagamentoFormatada = `CARTAO_${bandeira.toUpperCase()}_${modalidade.toUpperCase()}`;
//     } else if (isParcelado && formaPagamento !== 'PROMISSORIA') {
//       return { status: 400, data: { error: 'Para parcelado sem promissória, use cartão com modalidade' } };
//     }

//     // Validação para formaPagamentoEntrada
//     if (formaPagamento === 'PROMISSORIA' && parseFloat(entrada) > 0) {
//       if (!formaPagamentoEntrada || !['PIX', 'DINHEIRO'].includes(formaPagamentoEntrada.toUpperCase())) {
//         return { status: 400, data: { error: 'Forma de pagamento da entrada deve ser PIX ou DINHEIRO para promissória com entrada' } };
//       }
//     }

//     if (formaPagamento === 'CARTAO' && !isParcelado) {
//       isParcelado = true;
//       numeroParcelas = 1;
//       entrada = 0;
//     }

//     let finalClienteId = clienteId;
//     if (!finalClienteId && clienteNome) {
//       let cliente = await prisma.cliente.findUnique({ where: { nome: clienteNome } });
//       if (!cliente) {
//         cliente = await prisma.cliente.create({
//           data: { nome: clienteNome },
//         });
//       }
//       finalClienteId = cliente.id;
//     }

//     if (!finalClienteId) {
//       console.log('Validação falhou: Cliente inválido');
//       return { status: 400, data: { error: 'Cliente inválido' } };
//     }

//     const produto = await prisma.produto.findUnique({ where: { id: parseInt(produtoId) } });

//     if (!produto) {
//       console.log('Validação falhou: Produto não encontrado', { produtoId });
//       return { status: 404, data: { error: 'Produto não encontrado' } };
//     }

//     if (produto.quantidade < quantidade) {
//       console.log('Validação falhou: Estoque insuficiente', { quantidade, estoque: produto.quantidade });
//       return { status: 400, data: { error: 'Estoque insuficiente' } };
//     }

//     const vendaData = {
//       produtoId: parseInt(produtoId),
//       quantidade: parseInt(quantidade),
//       precoVenda: parseFloat(produto.precoVenda),
//       valorTotal: parseFloat(valorTotal),
//       entrada: isParcelado ? parseFloat(entrada) || 0 : parseFloat(valorTotal),
//       formaPagamentoEntrada: formaPagamento === 'PROMISSORIA' && parseFloat(entrada) > 0 ? formaPagamentoEntrada.toUpperCase() : null,
//       clienteId: finalClienteId,
//       observacao: observacao || null,
//       dataVenda: parsedDataVenda,
//       formaPagamento: formaPagamentoFormatada,
//       taxa,
//       valorLiquido,
//       status: isParcelado ? 'ABERTO' : 'QUITADO',
//     };
    
//     if (isParcelado) {
//       const entradaValor = parseFloat(entrada) || 0;
//       const valorRestante = parseFloat(valorTotal) - entradaValor;
//       const valorRestanteLiquido = parseFloat(valorLiquido) - entradaValor;
//       const valorBaseParcela = Math.floor((valorRestante / numeroParcelas) * 100) / 100;
//       const valorBaseParcelaLiquido = Math.floor((valorRestanteLiquido / numeroParcelas) * 100) / 100;
//       const taxaPorParcela = formaPagamento === 'CARTAO' ? parseFloat((taxa / numeroParcelas).toFixed(2)) : 0;

//       const parcelas = [];
//       let somaParcelasLiquido = 0;

//       for (let index = 0; index < numeroParcelas; index++) {
//         const dataVencimento = new Date(parsedDataVenda);
//         dataVencimento.setMonth(dataVencimento.getMonth() + (index + 1));
//         const isLastParcela = index === numeroParcelas - 1;
//         const valorParcela = isLastParcela
//           ? parseFloat((valorRestante - valorBaseParcela * (numeroParcelas - 1)).toFixed(2))
//           : parseFloat(valorBaseParcela.toFixed(2));
//         const valorParcelaLiquido = isLastParcela
//           ? parseFloat((valorRestanteLiquido - valorBaseParcelaLiquido * (numeroParcelas - 1)).toFixed(2))
//           : parseFloat(valorBaseParcelaLiquido.toFixed(2));

//         if (Math.abs(valorParcelaLiquido - valorLiquido) < 0.01) {
//           console.error('Erro detectado: valorParcelaLiquido está igual ao valorLiquido total');
//           return { status: 500, data: { error: 'Erro interno: valor líquido das parcelas inválido' } };
//         }

//         somaParcelasLiquido += valorParcelaLiquido;

//         const parcela = {
//           numeroParcela: index + 1,
//           valor: valorParcela,
//           valorPago: 0,
//           dataVencimento,
//           pago: false,
//           observacao: null,
//           formaPagamento: formaPagamento === 'CARTAO' ? formaPagamentoFormatada : 'PROMISSORIA',
//           taxa: taxaPorParcela,
//           valorLiquido: valorParcelaLiquido,
//         };
//         console.log(`Parcela ${index + 1} calculada:`, parcela);
//         parcelas.push(parcela);
//       }

//       if (Math.abs(somaParcelasLiquido - valorRestanteLiquido) > 0.01) {
//         console.error('Erro na soma das parcelas líquidas:', { somaParcelasLiquido, valorRestanteLiquido });
//         return { status: 500, data: { error: 'Erro interno: soma das parcelas líquidas inválida' } };
//       }

//       vendaData.parcelas = { create: parcelas };
//       vendaData.status = 'ABERTO';
//     }

//     console.log('Dados da venda a serem criados:', vendaData);

//     const result = await prisma.$transaction(async (tx) => {
//       const venda = await tx.venda.create({
//         data: vendaData,
//         include: { cliente: { select: { nome: true } }, parcelas: true },
//       });

//       console.log('Venda criada:', venda);

//       await tx.produto.update({
//         where: { id: parseInt(produtoId) },
//         data: {
//           quantidade: produto.quantidade - quantidade,
//           disponivel: produto.quantidade - quantidade > 0,
//         },
//       });

//       await tx.cliente.update({
//         where: { id: finalClienteId },
//         data: { ultimaCompra: parsedDataVenda },
//       });
//       console.log('ultimaCompra atualizada para cliente', finalClienteId, 'em', parsedDataVenda);

//       return venda;
//     });

//     return { status: 201, data: result };
//   } catch (error) {
//     console.error('Erro ao registrar venda:', error);
//     return { status: 500, data: { error: 'Erro ao registrar venda', details: error.message } };
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// export async function getVendasPorProduto(produtoId) {
//   try {
//     const vendas = await prisma.venda.findMany({
//       where: { produtoId: parseInt(produtoId) },
//       orderBy: { dataVenda: 'desc' },
//       include: {
//         produto: true,
//         cliente: { select: { nome: true } },
//         parcelas: true,
//       },
//     });
//     console.log('Vendas por produto retornadas:', vendas);
//     return { status: 200, data: vendas };
//   } catch (error) {
//     console.error('Erro ao listar vendas:', error);
//     return { status: 500, data: { error: 'Erro ao listar vendas', details: error.message } };
//   }
// }

// export async function getTodasAsVendas(filtros = {}) {
//   try {
//     const { formaPagamento, dataInicio, dataFim, status, resumo } = filtros;
//     const whereClause = {
//       dataVenda: {},
//     };

//     if (dataInicio) whereClause.dataVenda.gte = new Date(dataInicio);
//     if (dataFim) whereClause.dataVenda.lte = new Date(dataFim);
//     if (status && status !== 'TODAS') whereClause.status = status;
//     if (formaPagamento && formaPagamento !== 'TODAS') {
//       if (formaPagamento === 'CARTAO') {
//         whereClause.formaPagamento = { contains: 'CARTAO' };
//       } else {
//         whereClause.formaPagamento = { equals: formaPagamento };
//       }
//     }

//     console.log('Filtros aplicados:', whereClause);

//     const vendas = await prisma.venda.findMany({
//       where: whereClause,
//       orderBy: { dataVenda: 'desc' },
//       include: {
//         produto: { select: { nome: true, modelo: true } },
//         cliente: { select: { nome: true } },
//         parcelas: true,
//       },
//     });

//     // Ajustar cada venda com totalExibicao e valorEmAberto
//     const vendasAjustadas = vendas.map((venda) => {
//       const temTaxa = venda.formaPagamento?.startsWith('CARTAO_') && venda.taxa > 0;
//       const valorPagoTotal = (venda.entrada || 0) + venda.parcelas.reduce((sum, p) => sum + (p.valorPago || 0), 0);
//       const totalExibicao = temTaxa ? parseFloat(venda.valorLiquido) : parseFloat(venda.valorTotal);
//       const valorEmAberto = temTaxa
//         ? parseFloat(venda.valorLiquido) - valorPagoTotal
//         : parseFloat(venda.valorTotal) - valorPagoTotal;

//       return {
//         ...venda,
//         totalExibicao,
//         valorPagoTotal,
//         valorEmAberto: Math.max(valorEmAberto, 0).toFixed(2),
//       };
//     });

//     // Calcular resumo
//     const resumoData = calcularResumoVendas(vendasAjustadas);

//     // Calcular ranking de modelos mais vendidos com Prisma
//     // const rankingModelos = await prisma.venda.groupBy({
//     //   by: ['produtoId'],
//     //   _sum: { quantidade: true },
//     //   where: {
//     //     ...whereClause,
//     //     produto: { modelo: { not: null } }, // Exclui produtos com modelo null
//     //   },
//     // }).then(results => {
//     //   return prisma.produto.findMany({
//     //     where: {
//     //       id: { in: results.map(r => r.produtoId) },
//     //     },
//     //     select: {
//     //       id: true,
//     //       modelo: true,
//     //     },
//     //   }).then(produtos => {
//     //     return results.map(result => {
//     //       const produto = produtos.find(p => p.id === result.produtoId);
//     //       return {
//     //         modelo: produto?.modelo || 'Desconhecido',
//     //         qtyVendida: Number(result._sum.quantidade) || 0,
//     //       };
//     //     }).filter(item => item.qtyVendida > 0)
//     //      .sort((a, b) => b.qtyVendida - a.qtyVendida);
//     //   });
//     // });
//         // === SUBSTITUA A PARTIR DA LINHA DO groupBy ===
//     let rankingModelos = [];

//     try {
//       const vendasCount = await prisma.venda.count({ where: whereClause });
      
//       if (vendasCount > 0) {
//         const groupResults = await prisma.venda.groupBy({
//           by: ['produtoId'],
//           _sum: { quantidade: true },
//           where: whereClause,
//         });

//         if (groupResults.length > 0) {
//           const produtoIds = groupResults.map(r => r.produtoId);
//           const produtos = await prisma.produto.findMany({
//             where: { id: { in: produtoIds } },
//             select: { id: true, modelo: true },
//           });

//           rankingModelos = groupResults
//             .map(result => {
//               const produto = produtos.find(p => p.id === result.produtoId);
//               return {
//                 modelo: produto?.modelo || 'Desconhecido',
//                 qtyVendida: Number(result._sum.quantidade) || 0,
//               };
//             })
//             .filter(item => item.qtyVendida > 0)
//             .sort((a, b) => b.qtyVendida - a.qtyVendida)
//             .slice(0, 5); // opcional: top 5
//         }
//       }
//     } catch (error) {
//       console.error('Erro ao calcular ranking de modelos:', error);
//       rankingModelos = [];
//     }

//     console.log('Ranking de modelos:', rankingModelos);
//     // === FIM DA SUBSTITUIÇÃO ===

//     console.log('Ranking de modelos:', rankingModelos);

//     if (resumo) {
//       return { status: 200, data: { resumo: resumoData } };
//     }

//     return { status: 200, data: { vendas: vendasAjustadas, resumo: resumoData, rankingModelos } };
//   } catch (error) {
//     console.error('Erro ao listar vendas filtradas:', error);
//     return { status: 500, data: { error: 'Erro ao listar vendas: ' + error.message } };
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// function calcularResumoVendas(vendas) {
//   let totalQuitado = 0;
//   let totalPendente = 0;
//   let porForma = { DINHEIRO: 0, PIX: 0, CARTAO: 0, PROMISSORIA: 0 };

//   vendas.forEach((venda) => {
//     const temTaxa = venda.formaPagamento?.startsWith('CARTAO_') && venda.taxa > 0;
//     const valorPagoTotal = parseFloat(venda.valorPagoTotal);
//     const totalExibicao = parseFloat(venda.totalExibicao);

//     totalQuitado += valorPagoTotal;
//     totalPendente += parseFloat(venda.valorEmAberto);

//     let forma = venda.formaPagamento?.startsWith('CARTAO_') ? 'CARTAO' : venda.formaPagamento || 'PROMISSORIA';
//     if (venda.formaPagamentoEntrada && venda.entrada > 0) {
//       forma = venda.formaPagamentoEntrada;
//     }
//     if (porForma[forma] !== undefined) {
//       porForma[forma] += valorPagoTotal;
//     }

//     venda.parcelas.forEach((parcela) => {
//       if (parcela.valorPago > 0) {
//         let parcelaMethod = parcela.formaPagamento?.startsWith('CARTAO_') ? 'CARTAO' : parcela.formaPagamento || 'PROMISSORIA';
//         if (porForma[parcelaMethod] !== undefined) {
//           porForma[parcelaMethod] += parseFloat(parcela.valorPago);
//         }
//       }
//     });

//     if (venda.formaPagamento === 'PROMISSORIA' && parseFloat(venda.valorEmAberto) > 0) {
//       porForma.PROMISSORIA += parseFloat(venda.valorEmAberto);
//     }
//   });

//   return {
//     totalQuitado: totalQuitado.toFixed(2),
//     totalPendente: totalPendente.toFixed(2),
//     porForma,
//   };
// }


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
  // REMOVIDO: finally { await prisma.$disconnect(); }
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

    // === RANKING DE MODELOS (SEGURO) ===
    let rankingModelos = [];
    try {
      const vendasCount = Object.keys(whereClause).length > 0
        ? await prisma.venda.count({ where: whereClause })
        : await prisma.venda.count();

      if (vendasCount > 0) {
        const groupResults = await prisma.venda.groupBy({
          by: ['produtoId'],
          _sum: { quantidade: true },
          where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        });

        if (groupResults.length > 0) {
          const produtoIds = groupResults.map(r => r.produtoId);
          const produtos = await prisma.produto.findMany({
            where: { id: { in: produtoIds } },
            select: { id: true, modelo: true },
          });

          rankingModelos = groupResults
            .map(result => {
              const produto = produtos.find(p => p.id === result.produtoId);
              return {
                modelo: produto?.modelo || 'Desconhecido',
                qtyVendida: Number(result._sum.quantidade) || 0,
              };
            })
            .filter(item => item.qtyVendida > 0)
            .sort((a, b) => b.qtyVendida - a.qtyVendida)
            .slice(0, 5);
        }
      }
    } catch (error) {
      console.error('Erro ao calcular ranking de modelos:', error.message);
    }

    console.log('Ranking de modelos:', rankingModelos);

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