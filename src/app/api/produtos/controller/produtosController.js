// app/api/produtos/controller/produtosController.js
import { prisma } from '../../../lib/prisma'; // Singleton central

export async function getAllProdutos({ marca, modelo, genero, tamanho, referencia, tipo, page = 1, limit = 10 }) {
  try {
    const where = {};
    if (marca) where.marca = { contains: marca, mode: 'insensitive' }; // Case insensitive
    if (modelo) where.modelo = { contains: modelo, mode: 'insensitive' };
    if (genero) where.genero = { contains: genero, mode: 'insensitive' };
    if (tamanho) where.tamanho = { equals: parseInt(tamanho) };
    if (referencia) where.referencia = { contains: referencia, mode: 'insensitive' };

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    if (page < 1 || limit < 1) throw new Error('Parâmetros de paginação inválidos');

    // Agregações pra dashboards
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

    // Totals precisos (substitua TODO o Promise.all por isso)
    const [totalCount, totalAggregate, produtosParaCalc, produtos] = await Promise.all([
      prisma.produto.count({ where }), // Count real pra pages
      prisma.produto.aggregate({
        where,
        _sum: { quantidade: true },
      }),
      // Nova query: Puxo só campos pra cálculo de revenda/custo (otimizado, sem dados extras)
      prisma.produto.findMany({
        where,
        select: { precoVenda: true, quantidade: true, precoCusto: true },
      }),
      // Query paginada principal (mantém select completo)
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
          precoVenda: true,
          precoCusto: true,
          genero: true,
          modelo: true,
          marca: true,
          disponivel: true,
          lote: true,
          dataRecebimento: true,
          imagem: true,
        },
      }),
    ]);

    // Cálculo em JS (seguro e simples)
    const valorTotalRevenda = produtosParaCalc.reduce((sum, p) => sum + (parseFloat(p.precoVenda || 0) * parseInt(p.quantidade || 0)), 0);
    const custoTotalEstoque = produtosParaCalc.reduce((sum, p) => sum + (parseFloat(p.precoCusto || 0) * parseInt(p.quantidade || 0)), 0);
    const lucroProjetado = valorTotalRevenda - custoTotalEstoque;
    const margemLucro = custoTotalEstoque > 0 ? ((lucroProjetado / custoTotalEstoque) * 100).toFixed(2) : 0;

    return {
      data: produtos,
      totalPages: Math.ceil(totalCount / limit),
      totalProdutos: totalAggregate._sum.quantidade || 0,
      valorTotalRevenda: valorTotalRevenda.toFixed(2),
      custoTotalEstoque: custoTotalEstoque.toFixed(2),
      lucroProjetado: lucroProjetado.toFixed(2),
      margemLucro: `${margemLucro}%`,
    };
  } catch (error) {
    console.error('Erro no getAllProdutos:', error);
    throw error;
  }
}

export async function createProduto(data) { // Adicionado: Pra POST individual (similar a lote mas single)
  try {
    // Validações similares ao lote...
    const quantidade = parseInt(data.quantidade);
    if (isNaN(quantidade) || quantidade < 0) throw new Error('Quantidade inválida');

    const produto = await prisma.produto.create({
      data: {
        nome: data.nome,
        tamanho: parseInt(data.tamanho),
        referencia: data.referencia,
        cor: data.cor,
        quantidade,
        precoVenda: parseFloat(data.precoVenda),
        precoCusto: parseFloat(data.precoCusto) || null,
        genero: data.genero,
        modelo: data.modelo,
        marca: data.marca,
        disponivel: quantidade > 0,
        lote: data.lote || null,
        dataRecebimento: data.dataRecebimento ? new Date(data.dataRecebimento) : new Date(),
        imagem: data.imagem || null,
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
    if (isNaN(id)) throw new Error('ID inválido');

    const dataRecebimento = data.dataRecebimento ? new Date(data.dataRecebimento) : undefined;
    if (dataRecebimento && isNaN(dataRecebimento.getTime())) throw new Error('Data de recebimento inválida');

    const precoVenda = parseFloat(data.precoVenda) || 0;
    const precoCusto = parseFloat(data.precoCusto) || 0;
    if (precoVenda < 0 || precoCusto < 0) throw new Error('Preços inválidos');

    const produto = await prisma.produto.update({
      where: { id },
      data: {
        nome: data.nome,
        tamanho: parseInt(data.tamanho),
        referencia: data.referencia,
        cor: data.cor,
        quantidade: parseInt(data.quantidade),
        precoVenda,
        precoCusto,
        genero: data.genero,
        modelo: data.modelo,
        marca: data.marca,
        disponivel: parseInt(data.quantidade) > 0,
        lote: data.lote || null,
        dataRecebimento,
        imagem: data.imagem || null,
      },
    });
    return { status: 200, data: produto };
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    throw error;
  }
}

export async function deleteProduto(id) {
  try {
    const produtoId = parseInt(id);
    if (isNaN(produtoId)) throw new Error('ID inválido');
    await prisma.produto.delete({ where: { id: produtoId } });
    return { status: 200, data: { message: 'Produto deletado com sucesso' } };
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    if (error.code === 'P2003') throw new Error('Não é possível deletar o produto porque ele está vinculado a uma venda.');
    throw error;
  }
}

export async function getProdutoById(id) {
  try {
    const produtoId = parseInt(id);
    if (isNaN(produtoId)) throw new Error('ID inválido');
    const produto = await prisma.produto.findUnique({
      where: { id: produtoId },
      select: {
        id: true,
        nome: true,
        tamanho: true,
        referencia: true,
        cor: true,
        quantidade: true,
        precoVenda: true,
        precoCusto: true,
        genero: true,
        modelo: true,
        marca: true,
        disponivel: true,
        lote: true,
        dataRecebimento: true,
        imagem: true,
      },
    });
    if (!produto) throw new Error('Produto não encontrado');
    return produto;
  } catch (error) {
    console.error('Erro no getProdutoById:', error);
    throw error;
  }
}
