import { getAllProdutos, createProduto, updateProduto, deleteProduto } from '../produtos/controller/controller';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const marca = searchParams.get('marca') || undefined;
    const tamanho = searchParams.get('tamanho') ? parseInt(searchParams.get('tamanho')) : undefined;
    const referencia = searchParams.get('referencia') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 20;

    const result = await getAllProdutos({ marca, tamanho, referencia, page, limit });

    return new Response(JSON.stringify(result), { status: result.status });
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
