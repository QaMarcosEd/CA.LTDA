import { createVenda, getVendasPorProduto, getTodasAsVendas } from '../vendas/controller/vendasController';

export async function POST(request) {
  const data = await request.json();
  const result = await createVenda(data);
  return new Response(JSON.stringify(result.data), { status: result.status });
}


export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const produtoId = searchParams.get('produtoId');

  let result;
  if (produtoId) {
    result = await getVendasPorProduto(produtoId);
  } else {
    result = await getTodasAsVendas();
  }

  return new Response(JSON.stringify(result.data), { status: result.status });
}
