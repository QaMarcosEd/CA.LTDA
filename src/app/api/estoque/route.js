import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo'); // Tipo de agrupamento: 'genero', 'modelo', 'marca'

  try {
    let resultado = [];

    switch (tipo) {
      case 'genero':
        const contagemPorGenero = await prisma.produto.groupBy({
          by: ['genero'],
          _sum: {
            quantidade: true,
          },
          where: {
            disponivel: true,
          },
        });
        resultado = contagemPorGenero.map((item) => ({
          genero: item.genero || 'Sem gênero',
          total: item._sum.quantidade || 0,
        }));
        break;

      case 'modelo':
        const contagemPorModelo = await prisma.produto.groupBy({
          by: ['modelo'],
          _sum: {
            quantidade: true,
          },
          where: {
            disponivel: true,
          },
        });
        resultado = contagemPorModelo.map((item) => ({
          modelo: item.modelo || 'Sem modelo',
          total: item._sum.quantidade || 0,
        }));
        break;

      case 'marca':
        const contagemPorMarca = await prisma.produto.groupBy({
          by: ['marca'],
          _sum: {
            quantidade: true,
          },
          where: {
            disponivel: true,
          },
        });
        resultado = contagemPorMarca.map((item) => ({
          marca: item.marca || 'Sem marca',
          total: item._sum.quantidade || 0,
        }));
        break;

      default:
        return new Response(JSON.stringify({ error: 'Tipo de agrupamento inválido. Use "genero", "modelo" ou "marca".' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`Erro ao buscar contagem por ${tipo}:`, error);
    return new Response(JSON.stringify({ error: `Erro ao buscar contagem por ${tipo}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}