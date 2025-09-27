// vendas/controller/vendasController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função para criar uma nova venda no sistema.
export async function createVenda(data) {
  try {
    // Extrai os campos do objeto 'data' recebido
    const { produtoId, quantidade, observacao, clienteNome, clienteId, valorTotal, isParcelado, numeroParcelas, entrada, dataVenda } = data;
    console.log('Dados recebidos em createVenda:', data); // Depuração

    // Validar entrada
    if (!produtoId) {
      console.log('Validação falhou: produtoId faltando', { produtoId });
      return { status: 400, data: { error: 'Produto ID é obrigatório' } };
    }
    if (!quantidade || quantidade <= 0) {
      console.log('Validação falhou: quantidade inválida', { quantidade });
      return { status: 400, data: { error: 'Quantidade deve ser maior que zero' } };
    }
    if (!valorTotal || valorTotal <= 0) {
      console.log('Validação falhou: valorTotal inválido', { valorTotal });
      return { status: 400, data: { error: 'Valor total deve ser maior que zero' } };
    }
    if (!clienteNome && !clienteId) {
      console.log('Validação falhou: clienteNome e clienteId faltando', { clienteNome, clienteId });
      return { status: 400, data: { error: 'Nome do cliente ou ID do cliente é obrigatório' } };
    }
    if (isParcelado && (!numeroParcelas || numeroParcelas < 1 || numeroParcelas > 12)) {
      console.log('Validação falhou: Número de parcelas inválido', { numeroParcelas });
      return { status: 400, data: { error: 'Número de parcelas deve ser entre 1 e 12' } };
    }
    if (isParcelado && entrada && parseFloat(entrada) > parseFloat(valorTotal)) {
      console.log('Validação falhou: Entrada maior que valor total', { entrada, valorTotal });
      return { status: 400, data: { error: 'Entrada não pode ser maior que o valor total' } };
    }
    if (!dataVenda) {
      console.log('Validação falhou: dataVenda faltando', { dataVenda });
      return { status: 400, data: { error: 'Data da venda é obrigatória' } };
    }
    const parsedDataVenda = new Date(dataVenda);
    if (isNaN(parsedDataVenda.getTime())) {
      console.log('Validação falhou: Data de venda inválida', { dataVenda });
      return { status: 400, data: { error: 'Data de venda inválida' } };
    }
    if (parsedDataVenda > new Date()) {
      console.log('Validação falhou: Data de venda futura', { dataVenda });
      return { status: 400, data: { error: 'Data de venda não pode ser futura' } };
    }

    // Usar clienteId diretamente se fornecido; caso contrário, buscar ou criar cliente por clienteNome
    let finalClienteId = clienteId;
    if (!finalClienteId && clienteNome) {
      let cliente = await prisma.cliente.findUnique({ where: { nome: clienteNome } });
      if (!cliente) {
        cliente = await prisma.cliente.create({
          data: { nome: clienteNome }, // Pode adicionar email/telefone no futuro
        });
      }
      finalClienteId = cliente.id;
    }

    if (!finalClienteId) {
      console.log('Validação falhou: Cliente inválido');
      return { status: 400, data: { error: 'Cliente inválido' } };
    }

    // Busca o produto no banco de dados pelo ID fornecido
    const produto = await prisma.produto.findUnique({ where: { id: parseInt(produtoId) } });
    
    if (!produto) {
      console.log('Validação falhou: Produto não encontrado', { produtoId });
      return { status: 404, data: { error: 'Produto não encontrado' } };
    }

    if (produto.quantidade < quantidade) {
      console.log('Validação falhou: Estoque insuficiente', { quantidade, estoque: produto.quantidade });
      return { status: 400, data: { error: 'Estoque insuficiente' } };
    }

    // Cria uma nova entrada de venda no banco de dados
    const vendaData = {
      produtoId: parseInt(produtoId),
      quantidade: parseInt(quantidade),
      precoVenda: parseFloat(produto.preco),
      valorTotal: parseFloat(valorTotal),
      entrada: isParcelado ? parseFloat(entrada) || 0 : parseFloat(valorTotal), // Entrada é valorTotal se não parcelado
      clienteId: finalClienteId,
      observacao: observacao || null,
      dataVenda: parsedDataVenda,
      // createdAt é automático via @default(now())
    };

    if (isParcelado) {
      const entradaValor = parseFloat(entrada) || 0;
      const valorRestante = parseFloat(valorTotal) - entradaValor;
      const valorBaseParcela = Math.floor((valorRestante / numeroParcelas) * 100) / 100; // Arredonda pra baixo
      console.log('Calculando parcelas:', { valorTotal, entradaValor, valorRestante, numeroParcelas, valorBaseParcela }); // Depuração

      vendaData.parcelas = {
        create: Array.from({ length: numeroParcelas }, (_, index) => {
          const dataVencimento = new Date(parsedDataVenda); // Baseado em dataVenda
          dataVencimento.setDate(dataVencimento.getDate() + 30 * (index + 1)); // 30 dias entre parcelas
          const isLastParcela = index === numeroParcelas - 1;
          const valorParcela = isLastParcela
            ? parseFloat((valorRestante - valorBaseParcela * (numeroParcelas - 1)).toFixed(2))
            : parseFloat(valorBaseParcela.toFixed(2));
          const parcela = {
            numeroParcela: index + 1,
            valor: valorParcela,
            valorPago: 0,
            dataVencimento,
            pago: false,
            observacao: null,
          };
          console.log(`Criando parcela ${index + 1}:`, parcela); // Depuração
          return parcela;
        }),
      };
    }

    console.log('Dados da venda a serem criados:', vendaData); // Depuração
    const venda = await prisma.venda.create({
      data: vendaData,
      include: { cliente: { select: { nome: true } }, parcelas: true },
    });

    console.log('Venda criada:', venda); // Depuração

    // Atualiza o produto no banco, subtraindo a quantidade vendida do estoque
    await prisma.produto.update({
      where: { id: parseInt(produtoId) },
      data: {
        quantidade: produto.quantidade - quantidade,
        disponivel: produto.quantidade - quantidade > 0,
      },
    });

    // Retorna a venda criada com status 201 (Created)
    return { status: 201, data: venda };
  } catch (error) {
    console.error('Erro ao registrar venda:', error);
    return { status: 500, data: { error: 'Erro ao registrar venda', details: error.message } };
  }
}

// Função para listar todas as vendas associadas a um produto específico.
export async function getVendasPorProduto(produtoId) {
  try {
    const vendas = await prisma.venda.findMany({
      where: { produtoId: parseInt(produtoId) },
      orderBy: { dataVenda: 'desc' }, // Alterado de 'data' para 'dataVenda'
      include: {
        produto: true,
        cliente: { select: { nome: true } },
        parcelas: true,
      },
    });
    console.log('Vendas por produto retornadas:', vendas); // Depuração
    return { status: 200, data: vendas };
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    return { status: 500, data: { error: 'Erro ao listar vendas', details: error.message } };
  }
}

// Função para listar todas as vendas registradas no sistema.
export async function getTodasAsVendas() {
  try {
    const vendas = await prisma.venda.findMany({
      orderBy: { dataVenda: 'desc' }, // Alterado de 'data' para 'dataVenda'
      include: {
        produto: true,
        cliente: { select: { nome: true } },
        parcelas: true,
      },
    });
    console.log('Vendas retornadas pelo Prisma:', vendas);
    return { status: 200, data: vendas };
  } catch (error) {
    console.error('Erro ao listar todas as vendas:', error);
    return { status: 500, data: { error: 'Erro ao listar todas as vendas', details: error.message } };
  }
}

