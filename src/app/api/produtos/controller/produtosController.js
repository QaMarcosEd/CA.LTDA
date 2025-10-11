// // api/produtos/controller/produtosController.js
// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()

// export async function getAllProdutos({ marca, modelo, genero, tamanho, referencia, tipo, page = 1, limit = 10 }) {
//   try {
//     const where = {};
//     if (marca) where.marca = { contains: marca };
//     if (modelo) where.modelo = { contains: modelo };
//     if (genero) where.genero = { contains: genero };
//     if (tamanho) where.tamanho = { equals: parseInt(tamanho) };
//     if (referencia) where.referencia = { contains: referencia };

//     console.log('Applied where filters:', where); // Log dos filtros aplicados

//     // Se tipo for passado, faz contagem/groupBy
//     if (tipo && ['genero', 'modelo', 'marca'].includes(tipo)) {
//       const contagem = await prisma.produto.groupBy({
//         by: [tipo],
//         _sum: { quantidade: true },
//         where,
//       });

//       return contagem.map((item) => ({
//         [tipo]: item[tipo] || 'Desconhecido',
//         total: item._sum.quantidade || 0,
//       }));
//     }

//     // Busca normal com paginação e totals
//     const [totalAggregate, valorEstoqueRaw, produtos] = await Promise.all([
//       prisma.produto.aggregate({
//         where,
//         _sum: { quantidade: true },
//       }),
//       prisma.$queryRawUnsafe(`SELECT COALESCE(SUM("precoVenda" * "quantidade"), 0) as valor_total FROM "Produto" ${Object.keys(where).length > 0 ? `WHERE ${Object.entries(where).map(([key, value]) => {
//         if (typeof value === 'object' && value.contains) {
//           return `LOWER("${key}") LIKE LOWER('%${value.contains}%')`;
//         } else if (typeof value === 'object' && value.equals) {
//           return `"${key}" = ${value.equals}`;
//         }
//         return `"${key}" = ${value}`;
//       }).join(' AND ')}` : ''}`),
//       prisma.produto.findMany({
//         where,
//         skip: (page - 1) * limit,
//         take: limit,
//         orderBy: { id: 'desc' },
//         select: {
//           id: true,
//           nome: true,
//           tamanho: true,
//           referencia: true,
//           cor: true,
//           quantidade: true,
//           precoVenda: true,
//           genero: true,
//           modelo: true,
//           marca: true,
//           disponivel: true,
//           lote: true,
//           dataRecebimento: true,
//         },
//       }),
//     ]);

//     console.log('Generated SQL:', `SELECT COALESCE(SUM("precoVenda" * "quantidade"), 0) as valor_total FROM "Produto" ${Object.keys(where).length > 0 ? `WHERE ${Object.entries(where).map(([key, value]) => {
//       if (typeof value === 'object' && value.contains) {
//         return `LOWER("${key}") LIKE LOWER('%${value.contains}%')`;
//       } else if (typeof value === 'object' && value.equals) {
//         return `"${key}" = ${value.equals}`;
//       }
//       return `"${key}" = ${value}`;
//     }).join(' AND ')}` : ''}`); // Log da query gerada
//     console.log('Raw Query Result:', valorEstoqueRaw); // Log do resultado
//     console.log('Sample Products:', produtos.slice(0, 5)); // Log de amostra dos produtos pra verificar gêneros

//     const valorTotalEstoque = valorEstoqueRaw[0]?.valor_total || 0;

//     return {
//       data: produtos,
//       totalPages: Math.ceil((totalAggregate._sum.quantidade || 0) / limit),
//       totalProdutos: totalAggregate._sum.quantidade || 0,
//       valorTotalEstoque: valorTotalEstoque.toFixed(2),
//     };
//   } catch (error) {
//     console.error('Erro no getAllProdutos:', error);
//     throw new Error('Erro ao buscar produtos');
//   }
// }

// export async function updateProduto(data) {
//   try {
//     const id = parseInt(data.id);
//     const quantidade = parseInt(data.quantidade);
//     const precoVenda = parseFloat(data.precoVenda);
//     const dataRecebimento = data.dataRecebimento ? new Date(data.dataRecebimento) : undefined;

//     if (dataRecebimento && isNaN(dataRecebimento.getTime())) {
//       return { status: 400, data: { error: 'Data de recebimento inválida' } };
//     }

//     const produto = await prisma.produto.update({
//       where: { id },
//       data: {
//         nome: data.nome,
//         tamanho: parseInt(data.tamanho),
//         referencia: data.referencia,
//         cor: data.cor,
//         quantidade,
//         precoVenda,
//         genero: data.genero,
//         modelo: data.modelo,
//         marca: data.marca,
//         disponivel: quantidade > 0,
//         lote: data.lote || null,
//         dataRecebimento: dataRecebimento, // Inclui o novo campo
//       },
//     });

//     return { status: 200, data: produto };
//   } catch (error) {
//     console.error('Erro ao atualizar produto:', error);
//     return { status: 500, data: { error: 'Erro ao atualizar produto', details: error.message } };
//   }
// }

// export async function deleteProduto(id) {
//   try {
//     await prisma.produto.delete({ where: { id: parseInt(id) } });
//     return { status: 200, data: { message: 'Produto deletado com sucesso' } };
//   } catch (error) {
//     console.error('Erro ao deletar produto:', error);
//     if (error.code === 'P2003') {
//       return { status: 409, data: { error: 'Não é possível deletar o produto porque ele está vinculado a uma venda.' } };
//     }
//     return { status: 500, data: { error: 'Erro ao deletar produto', details: error.message } };
//   }
// }

// export async function getProdutoById(id) {
//   try {
//     const produto = await prisma.produto.findUnique({
//       where: { id },
//       select: {
//         id: true,
//         nome: true,
//         tamanho: true,
//         referencia: true,
//         cor: true,
//         quantidade: true,
//         precoVenda: true,
//         genero: true,
//         modelo: true,
//         marca: true,
//         disponivel: true,
//         lote: true,
//         dataRecebimento: true, // Inclui o novo campo
//       },
//     });
//     return produto;
//   } catch (error) {
//     console.error('Erro no controller getProdutoById:', error);
//     throw error;
//   }
// }


import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function getAllProdutos({ marca, modelo, genero, tamanho, referencia, tipo, page = 1, limit = 10 }) {
  try {
    const where = {};
    if (marca) where.marca = { contains: marca };
    if (modelo) where.modelo = { contains: modelo };
    if (genero) where.genero = { contains: genero };
    if (tamanho) where.tamanho = { equals: parseInt(tamanho) };
    if (referencia) where.referencia = { contains: referencia };

    console.log('Applied where filters:', where); // Log dos filtros aplicados

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

    // Construção dinâmica da cláusula WHERE pra queries raw (comum pras duas sums)
    const whereClause = Object.keys(where).length > 0 ? `WHERE ${Object.entries(where).map(([key, value]) => {
      if (typeof value === 'object' && value.contains) {
        return `LOWER("${key}") LIKE LOWER('%${value.contains}%')`;
      } else if (typeof value === 'object' && value.equals) {
        return `"${key}" = ${value.equals}`;
      }
      return `"${key}" = '${value}'`; // Ajuste genérico
    }).join(' AND ')}` : '';

    // Busca normal com paginação e totals
    const [totalAggregate, valorRevendaRaw, custoEstoqueRaw, produtos] = await Promise.all([
      prisma.produto.aggregate({
        where,
        _sum: { quantidade: true },
      }),
      // Query pra valor de revenda (precoVenda * qtd)
      prisma.$queryRawUnsafe(`SELECT COALESCE(SUM("precoVenda" * "quantidade"), 0) as valor_total FROM "Produto" ${whereClause}`),
      // Nova query pra custo total (precoCusto * qtd)
      prisma.$queryRawUnsafe(`SELECT COALESCE(SUM("precoCusto" * "quantidade"), 0) as custo_total FROM "Produto" ${whereClause}`),
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
          precoCusto: true, // Adicionado: inclui custo na lista de produtos
          genero: true,
          modelo: true,
          marca: true,
          disponivel: true,
          lote: true,
          dataRecebimento: true,
        },
      }),
    ]);

    console.log('Generated SQL Revenda:', `SELECT COALESCE(SUM("precoVenda" * "quantidade"), 0) as valor_total FROM "Produto" ${whereClause}`);
    console.log('Raw Query Revenda Result:', valorRevendaRaw);
    console.log('Generated SQL Custo:', `SELECT COALESCE(SUM("precoCusto" * "quantidade"), 0) as custo_total FROM "Produto" ${whereClause}`);
    console.log('Raw Query Custo Result:', custoEstoqueRaw);
    console.log('Sample Products:', produtos.slice(0, 5));

    const valorTotalRevenda = valorRevendaRaw[0]?.valor_total || 0;
    const custoTotalEstoque = custoEstoqueRaw[0]?.custo_total || 0;
    const lucroProjetado = valorTotalRevenda - custoTotalEstoque;
    const margemLucro = custoTotalEstoque > 0 ? ((lucroProjetado / custoTotalEstoque) * 100).toFixed(2) : 0;

    return {
      data: produtos,
      totalPages: Math.ceil((totalAggregate._sum.quantidade || 0) / limit),
      totalProdutos: totalAggregate._sum.quantidade || 0,
      valorTotalRevenda: valorTotalRevenda.toFixed(2), // Renomeado
      custoTotalEstoque: custoTotalEstoque.toFixed(2), // Novo
      lucroProjetado: lucroProjetado.toFixed(2), // Novo
      margemLucro: `${margemLucro}%`, // Novo
    };
  } catch (error) {
    console.error('Erro no getAllProdutos:', error);
    throw new Error('Erro ao buscar produtos');
  }
}

export async function updateProduto(data) {
  try {
    const id = parseInt(data.id);
    const quantidade = parseInt(data.quantidade);
    const precoVenda = parseFloat(data.precoVenda) || 0;
    const precoCusto = parseFloat(data.precoCusto) || 0; // Adicionado: suporte ao novo campo
    const dataRecebimento = data.dataRecebimento ? new Date(data.dataRecebimento) : undefined;

    if (dataRecebimento && isNaN(dataRecebimento.getTime())) {
      return { status: 400, data: { error: 'Data de recebimento inválida' } };
    }

    // Validação extra pros preços
    if (isNaN(precoVenda) || isNaN(precoCusto) || precoVenda < 0 || precoCusto < 0) {
      return { status: 400, data: { error: 'Preços inválidos' } };
    }

    const produto = await prisma.produto.update({
      where: { id },
      data: {
        nome: data.nome,
        tamanho: parseInt(data.tamanho),
        referencia: data.referencia,
        cor: data.cor,
        quantidade,
        precoVenda,
        precoCusto, // Adicionado
        genero: data.genero,
        modelo: data.modelo,
        marca: data.marca,
        disponivel: quantidade > 0,
        lote: data.lote || null,
        dataRecebimento,
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
        precoVenda: true,
        precoCusto: true, // Adicionado
        genero: true,
        modelo: true,
        marca: true,
        disponivel: true,
        lote: true,
        dataRecebimento: true,
      },
    });
    return produto;
  } catch (error) {
    console.error('Erro no controller getProdutoById:', error);
    throw error;
  }
}