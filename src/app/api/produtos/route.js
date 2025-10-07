// api/produtos/routes.js
import { getAllProdutos, createProduto, updateProduto, deleteProduto } from './controller/produtosController';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função para lidar com requisições GET (busca de produtos)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const marca = searchParams.get('marca') || undefined;
    const modelo = searchParams.get('modelo') || undefined;
    const genero = searchParams.get('genero') || undefined;
    const tamanho = searchParams.get('tamanho') ? parseInt(searchParams.get('tamanho')) : undefined;
    const referencia = searchParams.get('referencia') || undefined;
    const tipo = searchParams.get('tipo') || undefined;  // Novo: Suporte a tipo para contagem
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 10;

    const result = await getAllProdutos({ marca, modelo, genero, tamanho, referencia, tipo, page, limit });

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Erro ao processar a requisição' }), { status: 500 });
  }
}

// Função para lidar com requisições POST (criação de um novo produto)
// export async function POST(request) {
//   const data = await request.json();
//   const result = await createProduto(data);
//   return new Response(JSON.stringify(result.data), { status: result.status });
// }

// Função para lidar com requisições PUT (atualização de um produto existente)
export async function PUT(request) {
  const data = await request.json();
  const result = await updateProduto(data);
  return new Response(JSON.stringify(result.data), { status: result.status });
}

// // Função para lidar com requisições DELETE (exclusão de um produto)
export async function DELETE(request) {
  const { id } = await request.json();
  const result = await deleteProduto(id);
  console.log('Resposta enviada para o cliente:', result); // Log adicional
  return new Response(JSON.stringify(result.data), { status: result.status });
}