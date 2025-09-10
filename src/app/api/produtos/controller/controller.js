import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// LISTAR PRODUTOS COM FILTROS E PAGINAÇÃO
export async function getAllProdutos({ marca, tamanho, referencia, page = 1, limit = 20 } = {}) {
  try {
    const where = {};
    if (marca) where.marca = marca;
    if (tamanho) where.tamanho = parseInt(tamanho);
    if (referencia) where.referencia = referencia;

    const total = await prisma.produto.count({ where });
    const produtos = await prisma.produto.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { criadoEm: 'desc' }
    });

    return { status: 200, data: produtos, totalPages: Math.ceil(total / limit) };
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    return { status: 500, data: [], totalPages: 0, error: error.message };
  }
}

// CRIAR PRODUTO
export async function createProduto(data) {
  try {
    const camposObrigatorios = ['nome','tamanho','referencia','cor','quantidade','preco','genero','modelo','marca'];
    const faltando = camposObrigatorios.filter(c => !data[c]);
    if(faltando.length) return { status: 400, data: { error: `Campos obrigatórios faltando: ${faltando.join(', ')}` } };

    const produto = await prisma.produto.create({
      data: {
        nome: data.nome,
        tamanho: parseInt(data.tamanho),
        referencia: data.referencia,
        cor: data.cor,
        quantidade: parseInt(data.quantidade),
        preco: parseFloat(data.preco),
        genero: data.genero,
        modelo: data.modelo,
        marca: data.marca,
        disponivel: parseInt(data.quantidade) > 0
      }
    });
    return { status: 201, data: produto };
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return { status: 500, data: { error: 'Erro ao criar produto', details: error.message } };
  }
}

// ATUALIZAR PRODUTO
export async function updateProduto(data) {
  try {
    const id = parseInt(data.id);
    const quantidade = parseInt(data.quantidade);
    const preco = parseFloat(data.preco);

    const produto = await prisma.produto.update({
      where: { id },
      data: {
        nome: data.nome,
        tamanho: parseInt(data.tamanho),
        referencia: data.referencia,
        cor: data.cor,
        quantidade,
        preco,
        genero: data.genero,
        modelo: data.modelo,
        marca: data.marca,
        disponivel: quantidade > 0
      }
    });
    return { status: 200, data: produto };
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return { status: 500, data: { error: 'Erro ao atualizar produto', details: error.message } };
  }
}

// DELETAR PRODUTO
export async function deleteProduto(id) {
  try {
    await prisma.produto.delete({ where: { id: parseInt(id) } });
    return { status: 200, data: { message: 'Produto deletado' } };
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return { status: 500, data: { error: 'Erro ao deletar produto', details: error.message } };
  }
}

// CRIAR VENDA
export async function createVenda(data) {
  try {
    const { produtoId, quantidade, observacao } = data;
    const produto = await prisma.produto.findUnique({ where: { id: parseInt(produtoId) } });

    if(!produto) return { status: 404, data: { error: 'Produto não encontrado' } };
    if(produto.quantidade < quantidade) return { status: 400, data: { error: 'Estoque insuficiente' } };

    const venda = await prisma.venda.create({
      data: {
        produtoId: parseInt(produtoId),
        quantidade: parseInt(quantidade),
        precoVenda: parseFloat(produto.preco),
        observacao: observacao || null
      }
    });

    await prisma.produto.update({
      where: { id: parseInt(produtoId) },
      data: {
        quantidade: produto.quantidade - quantidade,
        disponivel: produto.quantidade - quantidade > 0
      }
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
      orderBy: { data: 'desc' }
    });
    return { status: 200, data: vendas };
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    return { status: 500, data: { error: 'Erro ao listar vendas', details: error.message } };
  }
}
