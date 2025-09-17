// vendas/controller/vendasController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função para criar uma nova venda no sistema.
export async function createVenda(data) {
  try {
    // Extrai os campos do objeto 'data' recebido
    const { produtoId, quantidade, observacao, clienteNome, valorPago } = data;

    // Validar entrada
    if (!produtoId || !quantidade || !clienteNome || valorPago == null) {
      return { status: 400, data: { error: 'Campos obrigatórios faltando' } };
    }

    // Buscar ou criar cliente
    let cliente = await prisma.cliente.findUnique({ where: { nome: clienteNome } });
    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: { nome: clienteNome }, // Pode adicionar email/telefone no futuro
      });
    }

    // Busca o produto no banco de dados pelo ID fornecido
    const produto = await prisma.produto.findUnique({ where: { id: parseInt(produtoId) } });
    
    if (!produto) {
      return { status: 404, data: { error: 'Produto não encontrado' } };
    }

    if (produto.quantidade < quantidade) {
      return { status: 400, data: { error: 'Estoque insuficiente' } };
    }

    // Cria uma nova entrada de venda no banco de dados
    const venda = await prisma.venda.create({
      data: {
        produtoId: parseInt(produtoId),
        quantidade: parseInt(quantidade),
        precoVenda: parseFloat(produto.preco),
        valorPago: parseFloat(valorPago),
        clienteId: cliente.id, // Usa clienteId em vez de nomeCliente
        observacao: observacao || null,
      },
      include: { cliente: { select: { nome: true } } }, // Inclui nome do cliente na resposta
    });

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
      orderBy: { data: 'desc' },
      include: {
        produto: true, // Inclui detalhes do produto
        cliente: { select: { nome: true } }, // Inclui nome do cliente
      },
    });
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
      orderBy: { data: 'desc' },
      include: {
        produto: true,
        cliente: { select: { nome: true } }, // Inclui nome do cliente
      },
    });
    console.log('Vendas retornadas pelo Prisma:', vendas);
    return { status: 200, data: vendas };
  } catch (error) {
    console.error('Erro ao listar todas as vendas:', error);
    return { status: 500, data: { error: 'Erro ao listar todas as vendas', details: error.message } };
  }
}
