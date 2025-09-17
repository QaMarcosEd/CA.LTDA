// api/estoque/controller/estoqueController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getEstoqueData(tipo, filtros) {
  try {
    let resultado = [];

    switch (tipo) {
      case 'genero':
      case 'modelo':
      case 'marca':
        const groupByField = tipo;
        const contagem = await prisma.produto.groupBy({
          by: [groupByField],
          _sum: { quantidade: true },
          where: { disponivel: true },
        });
        resultado = contagem.map((item) => ({
          [groupByField]: item[groupByField] || `Sem ${groupByField}`,
          total: item._sum.quantidade || 0,
        }));
        break;

      case 'produtos':
        resultado = await prisma.produto.findMany({
          where: {
            disponivel: true,
            genero: filtros.genero || undefined,
            marca: filtros.marca || undefined,
            modelo: filtros.modelo || undefined,
            numeracao: filtros.numeracao ? parseInt(filtros.numeracao) : undefined,
          },
          orderBy: { nome: 'asc' },
        });
        break;

      default:
        throw new Error('Tipo inválido.');
    }

    return resultado;
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}