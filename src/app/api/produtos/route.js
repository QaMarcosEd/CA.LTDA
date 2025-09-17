import { getAllProdutos, createProduto, updateProduto, deleteProduto } from './controller/produtosController';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função para lidar com requisições GET (busca de produtos)
export async function GET(request) {
  try {
    // Extrai os parâmetros de busca da URL da requisição
    const { searchParams } = new URL(request.url);
    // Obtém o parâmetro 'marca' ou undefined se não estiver presente
    const marca = searchParams.get('marca') || undefined;
    // Obtém o parâmetro 'modelo' ou undefined se não estiver presente
    const modelo = searchParams.get('modelo') || undefined;
    // Obtém o parâmetro 'genero' ou undefined se não estiver presente
    const genero = searchParams.get('genero') || undefined;
    // Obtém o parâmetro 'tamanho' e converte para número, ou undefined se não estiver presente
    const tamanho = searchParams.get('tamanho') ? parseInt(searchParams.get('tamanho')) : undefined;
    // Obtém o número da página, default 1 se não especificado
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')) : 1;
    // Obtém o limite de itens por página, default 10 se não especificado
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 10;

    // Chama a função do controller para buscar os produtos com os filtros fornecidos
    const result = await getAllProdutos({ marca, modelo, genero, tamanho, page, limit });

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Erro ao processar a requisição' }), { status: 500 });
  }
}

// Função para lidar com requisições POST (criação de um novo produto)
export async function POST(request) {
  // Extrai os dados do corpo da requisição (formato JSON)
  const data = await request.json();
  // Chama a função do controller para criar o produto com os dados fornecidos
  const result = await createProduto(data);
  // Retorna a resposta com os dados do produto criado e o status correspondente
  return new Response(JSON.stringify(result.data), { status: result.status });
}

// Função para lidar com requisições PUT (atualização de um produto existente)
export async function PUT(request) {
  // Extrai os dados do corpo da requisição (formato JSON)
  const data = await request.json();
  // Chama a função do controller para atualizar o produto com os dados fornecidos
  const result = await updateProduto(data);
  // Retorna a resposta com os dados do produto atualizado e o status correspondente
  return new Response(JSON.stringify(result.data), { status: result.status });
}

// // Função para lidar com requisições DELETE (exclusão de um produto)
export async function DELETE(request) {
  const { id } = await request.json();
  const result = await deleteProduto(id);
  console.log('Resposta enviada para o cliente:', result); // Log adicional
  return new Response(JSON.stringify(result.data), { status: result.status });
}
