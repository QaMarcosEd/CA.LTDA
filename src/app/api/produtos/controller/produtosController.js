// api/produtos/controller/produtosController.js
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// export async function getAllProdutos({ marca, modelo, genero, tamanho, referencia, page = 1, limit = 10 }) {
//   try {
//     const where = {};
//     if (marca) where.marca = { contains: marca };
//     if (modelo) where.modelo = { contains: modelo };
//     if (genero) where.genero = { contains: genero };
//     if (tamanho) where.tamanho = { equals: parseInt(tamanho) };
//     if (referencia) where.referencia = { contains: referencia };

//     const total = await prisma.produto.count({ where });
//     const produtos = await prisma.produto.findMany({
//       where,
//       skip: (page - 1) * limit,
//       take: limit,
//       orderBy: { id: 'desc' },
//       select: {
//         id: true,
//         nome: true,
//         tamanho: true,
//         referencia: true,
//         cor: true,
//         quantidade: true,
//         preco: true,
//         genero: true,
//         modelo: true,
//         marca: true,
//         disponivel: true,
//         lote: true,
//         dataRecebimento: true, // Inclui o novo campo
//       },
//     });

//     return {
//       data: produtos,
//       totalPages: Math.ceil(total / limit),
//     };
//   } catch (error) {
//     console.error(error);
//     throw new Error('Erro ao buscar produtos');
//   }
// }

export async function getAllProdutos({ marca, modelo, genero, tamanho, referencia, tipo, page = 1, limit = 10 }) {
  try {
    const where = {};
    if (marca) where.marca = { contains: marca };
    if (modelo) where.modelo = { contains: modelo };
    if (genero) where.genero = { contains: genero };
    if (tamanho) where.tamanho = { equals: parseInt(tamanho) };
    if (referencia) where.referencia = { contains: referencia };

    // Se tipo for passado, faz contagem/groupBy
    if (tipo && ['genero', 'modelo', 'marca'].includes(tipo)) {
      const contagem = await prisma.produto.groupBy({
        by: [tipo],
        _sum: { quantidade: true },
        where,
      });

      return contagem.map((item) => ({
        [tipo]: item[tipo] || 'Desconhecido',
        total: item._sum.quantidade || 0,
      }));
    }

    // Busca normal com paginação e totals
    const [totalAggregate, produtos] = await Promise.all([
      prisma.produto.aggregate({
        where,
        _sum: { quantidade: true }, // Soma total de quantidades
      }),
      prisma.produto.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        select: {
          id: true,
          nome: true,
          tamanho: true,
          referencia: true,
          cor: true,
          quantidade: true,
          preco: true,
          genero: true,
          modelo: true,
          marca: true,
          disponivel: true,
          lote: true,
          dataRecebimento: true,
        },
      }),
    ]);

    // Calcula valor total do estoque somando (preco * quantidade) pra cada produto
    const valorTotalEstoque = produtos.reduce((sum, p) => sum + (p.preco * p.quantidade), 0).toFixed(2);

    return {
      data: produtos,
      totalPages: Math.ceil(totalAggregate._sum.quantidade / limit || 1), // Ajusta totalPages pela soma de quantidades
      totalProdutos: totalAggregate._sum.quantidade || 0, // Total de unidades, não de registros
      valorTotalEstoque,
    };
  } catch (error) {
    console.error(error);
    throw new Error('Erro ao buscar produtos');
  }
}

export async function createProduto(data) {
  try {
    const camposObrigatorios = ['nome', 'tamanho', 'referencia', 'cor', 'quantidade', 'preco', 'genero', 'modelo', 'marca', 'dataRecebimento'];
    const faltando = camposObrigatorios.filter(c => data[c] === undefined || data[c] === null || data[c] === '');
    if (faltando.length) {
      return { status: 400, data: { error: `Campos obrigatórios faltando: ${faltando.join(', ')}` } };
    }

    // Validação da dataRecebimento
    const dataRecebimento = new Date(data.dataRecebimento);
    if (isNaN(dataRecebimento.getTime())) {
      return { status: 400, data: { error: 'Data de recebimento inválida' } };
    }

    if (isNaN(parseInt(data.tamanho)) || parseInt(data.tamanho) <= 0) {
      return { status: 400, data: { error: 'Tamanho inválido' } };
    }
    if (isNaN(parseInt(data.quantidade)) || parseInt(data.quantidade) < 0) {
      return { status: 400, data: { error: 'Quantidade inválida' } };
    }
    if (isNaN(parseFloat(data.preco)) || parseFloat(data.preco) < 0) {
      return { status: 400, data: { error: 'Preço inválido' } };
    }

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
        disponivel: parseInt(data.quantidade) > 0,
        lote: data.lote || null,
        dataRecebimento: dataRecebimento, // Inclui o novo campo
      },
    });

    return { status: 201, data: produto };
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return { status: 500, data: { error: 'Erro ao criar produto', details: error.message } };
  }
}

export async function updateProduto(data) {
  try {
    const id = parseInt(data.id);
    const quantidade = parseInt(data.quantidade);
    const preco = parseFloat(data.preco);
    const dataRecebimento = data.dataRecebimento ? new Date(data.dataRecebimento) : undefined;

    if (dataRecebimento && isNaN(dataRecebimento.getTime())) {
      return { status: 400, data: { error: 'Data de recebimento inválida' } };
    }

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
        disponivel: quantidade > 0,
        lote: data.lote || null,
        dataRecebimento: dataRecebimento, // Inclui o novo campo
      },
    });

    return { status: 200, data: produto };
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return { status: 500, data: { error: 'Erro ao atualizar produto', details: error.message } };
  }
}

export async function deleteProduto(id) {
  try {
    await prisma.produto.delete({ where: { id: parseInt(id) } });
    return { status: 200, data: { message: 'Produto deletado com sucesso' } };
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    if (error.code === 'P2003') {
      return { status: 409, data: { error: 'Não é possível deletar o produto porque ele está vinculado a uma venda.' } };
    }
    return { status: 500, data: { error: 'Erro ao deletar produto', details: error.message } };
  }
}

export async function getProdutoById(id) {
  try {
    const produto = await prisma.produto.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        tamanho: true,
        referencia: true,
        cor: true,
        quantidade: true,
        preco: true,
        genero: true,
        modelo: true,
        marca: true,
        disponivel: true,
        lote: true,
        dataRecebimento: true, // Inclui o novo campo
      },
    });
    return produto;
  } catch (error) {
    console.error('Erro no controller getProdutoById:', error);
    throw error;
  }
}





