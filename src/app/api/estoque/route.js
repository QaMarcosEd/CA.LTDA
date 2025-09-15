// /api/estoque/route.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo');

  // Novos filtros
  const genero = searchParams.get('genero');
  const marca = searchParams.get('marca');
  const modelo = searchParams.get('modelo');
  const numeracao = searchParams.get('numeracao');

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

      case 'produtos': // 🔥 novo caso: busca filtrada
        resultado = await prisma.produto.findMany({
          where: {
            disponivel: true,
            genero: genero || undefined,
            marca: marca || undefined,
            modelo: modelo || undefined,
            numeracao: numeracao ? parseInt(numeracao) : undefined,
          },
          orderBy: { nome: 'asc' },
        });
        break;

      default:
        return new Response(JSON.stringify({ error: 'Tipo inválido.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar dados.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}
