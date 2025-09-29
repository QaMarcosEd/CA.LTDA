// // api/estoque/controller/estoqueController.js
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// export async function getEstoqueData(tipo, filtros) {
//   try {
//     let resultado = [];

//     switch (tipo) {
//       case 'genero':
//       case 'modelo':
//       case 'marca':
//         const groupByField = tipo;
//         const contagem = await prisma.produto.groupBy({
//           by: [groupByField],
//           _sum: { quantidade: true },
//           where: { disponivel: true },
//         });
//         resultado = contagem.map((item) => ({
//           [groupByField]: item[groupByField] || `Sem ${groupByField}`,
//           total: item._sum.quantidade || 0,
//         }));
//         break;

//       case 'produtos':
//         resultado = await prisma.produto.findMany({
//           where: {
//             disponivel: true,
//             genero: filtros.genero || undefined,
//             marca: filtros.marca || undefined,
//             modelo: filtros.modelo || undefined,
//             numeracao: filtros.numeracao ? parseInt(filtros.numeracao) : undefined,
//           },
//           orderBy: { nome: 'asc' },
//         });
//         break;

//       default:
//         throw new Error('Tipo inválido.');
//     }

//     return resultado;
//   } catch (error) {
//     throw error;
//   } finally {
//     await prisma.$disconnect();
//   }
// }
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getEstoqueData(tipo, filtros = {}) {
  const { genero, marca, modelo, numeracao } = filtros;

  try {
    // Lógica para contagem por tipo (pra gráficos no dashboard)
    if (tipo && ['genero', 'modelo', 'marca'].includes(tipo)) {
      const whereClause = {
        quantidade: { gt: 0 }, // Só produtos com estoque positivo
      };

      // Aplica filtros opcionais
      if (genero) whereClause.genero = genero;
      if (marca) whereClause.marca = marca;
      if (modelo) whereClause.modelo = modelo;
      if (numeracao) whereClause.tamanho = parseInt(numeracao); // Assumindo que o campo é 'tamanho' no schema

      const contagem = await prisma.produto.groupBy({
        by: [tipo],
        _sum: { quantidade: true },
        where: whereClause,
      });

      // Formata o resultado pra ser um array simples [{ genero: 'MASCULINO', total: 50 }, ...]
      return contagem.map((item) => ({
        [tipo]: item[tipo] || 'Desconhecido',
        total: item._sum.quantidade || 0,
      }));
    }

    // Lógica para busca geral de produtos (pra lista no dashboard)
    const produtos = await prisma.produto.findMany({
      where: {
        quantidade: { gt: 0 },
        ...(genero && { genero }),
        ...(marca && { marca }),
        ...(modelo && { modelo }),
        ...(numeracao && { tamanho: parseInt(numeracao) }),
      },
    });

    // Retorna no formato paginado (ajuste o totalPages conforme sua paginação)
    return { data: produtos, totalPages: Math.ceil(produtos.length / 10) };
  } catch (error) {
    console.error('Erro no getEstoqueData:', error);
    throw new Error('Erro ao buscar dados de estoque');
  }
}