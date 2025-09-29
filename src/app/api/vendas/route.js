// api/vendas/route.js
import { createVenda, getVendasPorProduto, getTodasAsVendas } from './controller/vendasController';

export async function POST(request) {
  const data = await request.json();
  console.log('Dados recebidos no POST /api/vendas:', data); // Depuração
  const result = await createVenda(data);
  
  return new Response(JSON.stringify(result.data), { status: result.status });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const produtoId = searchParams.get('produtoId');
  const formaPagamento = searchParams.get('formaPagamento');
  const dataInicio = searchParams.get('dataInicio');
  const dataFim = searchParams.get('dataFim');
  const status = searchParams.get('status');

  let result;
  if (produtoId) {
    // Mantém o antigo pra por produto
    result = await getVendasPorProduto(produtoId);
  } else {
    result = await getTodasAsVendas({
      formaPagamento,
      dataInicio,
      dataFim,
      status,
    });
  }

  return new Response(JSON.stringify(result.data), { status: result.status });
}

