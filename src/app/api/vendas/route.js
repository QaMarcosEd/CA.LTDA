import { createVenda, getVendasPorProduto } from '../produtos/controller/controller';

export async function POST(request) {
  const data = await request.json();
  const result = await createVenda(data);
  return new Response(JSON.stringify(result.data), { status: result.status });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const produtoId = searchParams.get('produtoId');
  if (!produtoId) {
    return new Response(JSON.stringify({ error: 'Produto ID é obrigatório' }), { status: 400 });
  }
  const result = await getVendasPorProduto(produtoId);
  return new Response(JSON.stringify(result.data), { status: result.status });
}