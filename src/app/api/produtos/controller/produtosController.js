import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// LISTAR PRODUTOS COM FILTROS E PAGINAÇÃO
export async function getAllProdutos({ marca, modelo, genero, tamanho, page = 1, limit = 10 }) {
  const where = {};

  if (marca) where.marca = { contains: marca, mode: 'insensitive' };
  if (modelo) where.modelo = modelo;
  if (genero) where.genero = genero;
  if (tamanho) where.tamanho = tamanho;

  const total = await prisma.produto.count({ where });

  const produtos = await prisma.produto.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { id: 'asc' },
  });

  return { data: produtos, totalPages: Math.ceil(total / limit) };
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

export async function getProdutoById(id) {
  try {
    const produto = await prisma.produto.findUnique({
      where: { id },
    })
    return produto
  } catch (error) {
    console.error('Erro no controller getProdutoById:', error)
    throw error
  }
}

