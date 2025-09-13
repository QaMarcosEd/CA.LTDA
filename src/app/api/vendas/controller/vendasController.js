import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// CRIAR VENDA
export async function createVenda(data) {
  try {
    const { produtoId, quantidade, observacao, nomeCliente, valorPago } = data;

    const produto = await prisma.produto.findUnique({ where: { id: parseInt(produtoId) } });
    if (!produto) return { status: 404, data: { error: 'Produto não encontrado' } };
    if (produto.quantidade < quantidade) return { status: 400, data: { error: 'Estoque insuficiente' } };

    const venda = await prisma.venda.create({
      data: {
        produtoId: parseInt(produtoId),
        quantidade: parseInt(quantidade),
        precoVenda: parseFloat(produto.preco),
        observacao: observacao || null,
        nomeCliente: nomeCliente || 'Cliente não informado', // necessário
        valorPago: valorPago ? parseFloat(valorPago) : parseFloat(produto.preco), // necessário
      },
    });

    await prisma.produto.update({
      where: { id: parseInt(produtoId) },
      data: {
        quantidade: produto.quantidade - quantidade,
        disponivel: produto.quantidade - quantidade > 0,
      },
    });

    return { status: 201, data: venda };
  } catch (error) {
    console.error('Erro ao registrar venda:', error);
    return { status: 500, data: { error: 'Erro ao registrar venda', details: error.message } };
  }
}


// LISTAR VENDAS POR PRODUTO
export async function getVendasPorProduto(produtoId) {
  try {
    const vendas = await prisma.venda.findMany({
      where: { produtoId: parseInt(produtoId) },
      orderBy: { data: 'desc' }, // ⚠️ confira se o campo é "data" no schema.prisma
    });
    return { status: 200, data: vendas };
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    return { status: 500, data: { error: 'Erro ao listar vendas', details: error.message } };
  }
}

// LISTAR TODAS AS VENDAS
export async function getTodasAsVendas() {
  try {
    const vendas = await prisma.venda.findMany({
      orderBy: { data: 'desc' },
      include: { produto: true }, // opcional, para trazer dados do produto
    });
    return { status: 200, data: vendas };
  } catch (error) {
    console.error('Erro ao listar todas as vendas:', error);
    return { status: 500, data: { error: 'Erro ao listar todas as vendas', details: error.message } };
  }
}
