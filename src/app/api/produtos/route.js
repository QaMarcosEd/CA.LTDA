import { getAllProdutos, createProduto, updateProduto, deleteProduto } from './controller/produtosController';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const marca = searchParams.get('marca') || undefined;
    const modelo = searchParams.get('modelo') || undefined;
    const genero = searchParams.get('genero') || undefined;
    const tamanho = searchParams.get('tamanho') ? parseInt(searchParams.get('tamanho')) : undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 10;

    const where = {};
    if (marca) where.marca = marca;
    if (modelo) where.modelo = modelo;
    if (genero) where.genero = genero;
    if (tamanho) where.tamanho = tamanho;

    const total = await prisma.produto.count({ where });
    const produtos = await prisma.produto.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: 'desc' },
    });

    return new Response(JSON.stringify({ data: produtos, totalPages: Math.ceil(total / limit) }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar produtos' }), { status: 500 });
  }
}

export async function POST(request) {
  const data = await request.json();
  const result = await createProduto(data);
  return new Response(JSON.stringify(result.data), { status: result.status });
}

export async function PUT(request) {
  const data = await request.json();
  const result = await updateProduto(data);
  return new Response(JSON.stringify(result.data), { status: result.status });
}

export async function DELETE(request) {
  const { id } = await request.json();
  const result = await deleteProduto(id);
  return new Response(JSON.stringify(result.data), { status: result.status });
}
