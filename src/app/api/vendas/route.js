// vendas/route.js
import { createVenda, getVendasPorProduto, getTodasAsVendas } from './controller/vendasController';

export async function POST(request) {
  const data = await request.json();
  
  // Renomeia nomeCliente para clienteNome, se necessário (pra compatibilidade com frontend antigo)
  if (data.nomeCliente) {
    data.clienteNome = data.nomeCliente;
    delete data.nomeCliente;
  }

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