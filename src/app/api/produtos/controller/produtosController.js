import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function getAllProdutos({ marca, modelo, genero, tamanho, referencia, page = 1, limit = 10 }) {
  try {
    const where = {};
    if (marca) where.marca = { contains: marca }; // Remova mode: 'insensitive'
    if (modelo) where.modelo = { contains: modelo };
    if (genero) where.genero = { contains: genero };
    if (tamanho) where.tamanho = { equals: parseInt(tamanho) }; // Já está correto
    if (referencia) where.referencia = { contains: referencia }; // Remova mode: 'insensitive'

    const total = await prisma.produto.count({ where });
    const produtos = await prisma.produto.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: 'desc' },
    });

    return {
      data: produtos,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error(error);
    throw new Error('Erro ao buscar produtos');
  }
}

// CREATE: insere novo produto no banco
export async function createProduto(data) {
  try {
    // Validação de campos obrigatórios
    const camposObrigatorios = ['nome','tamanho','referencia','cor','quantidade','preco','genero','modelo','marca'];
    const faltando = camposObrigatorios.filter(c => data[c] === undefined || data[c] === null || data[c] === '');

    if (faltando.length) {
      return { 
        status: 400, 
        data: { error: `Campos obrigatórios faltando: ${faltando.join(', ')}` } 
      };
    }

    // Validações adicionais
    if (isNaN(parseInt(data.tamanho)) || parseInt(data.tamanho) <= 0) {
      return { status: 400, data: { error: 'Tamanho inválido' } };
    }
    if (isNaN(parseInt(data.quantidade)) || parseInt(data.quantidade) < 0) {
      return { status: 400, data: { error: 'Quantidade inválida' } };
    }
    if (isNaN(parseFloat(data.preco)) || parseFloat(data.preco) < 0) {
      return { status: 400, data: { error: 'Preço inválido' } };
    }

    // Criação no banco
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
        disponivel: parseInt(data.quantidade) > 0 // flag de disponibilidade
      }
    })

    return { status: 201, data: produto }
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return { status: 500, data: { error: 'Erro ao criar produto', details: error.message } }
  }
}

// UPDATE: atualiza dados de um produto existente
export async function updateProduto(data) {
  try {
    const id = parseInt(data.id)
    const quantidade = parseInt(data.quantidade)
    const preco = parseFloat(data.preco)

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
    })

    return { status: 200, data: produto }
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return { status: 500, data: { error: 'Erro ao atualizar produto', details: error.message } }
  }
}

// // DELETE: remove produto pelo ID
export async function deleteProduto(id) {
  try {
    await prisma.produto.delete({ where: { id: parseInt(id) } });
    return { status: 200, data: { message: 'Produto deletado com sucesso' } };
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    if (error.code === 'P2003') {
      // Foreign key constraint violation
      return { status: 409, data: { error: 'Não é possível deletar o produto porque ele está vinculado a uma venda.' } };
    }
    return { status: 500, data: { error: 'Erro ao deletar produto', details: error.message } };
  }
}

// GET BY ID: busca produto único pelo ID
export async function getProdutoById(id) {
  try {
    return await prisma.produto.findUnique({ where: { id } })
  } catch (error) {
    console.error('Erro no controller getProdutoById:', error)
    throw error
  }
}

