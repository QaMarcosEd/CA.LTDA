import { createVenda, getVendasPorProduto, getTodasAsVendas } from '../vendas/controller/vendasController';

export async function POST(request) {

  const data = await request.json();
  
  // Chama a função createVenda do controller, passando os dados recebidos.
  const result = await createVenda(data);
  
  // Retorna uma resposta HTTP com o resultado da criação (dados da venda) e o status apropriado (201 ou erro).
  return new Response(JSON.stringify(result.data), { status: result.status });
}


export async function GET(request) {

  // Extrai os parâmetros de busca da URL (ex.: ?produtoId=123).
  const { searchParams } = new URL(request.url);
  const produtoId = searchParams.get('produtoId'); // Obtém o ID do produto, se fornecido.

  // Variável para armazenar o resultado da consulta, determinada pelo parâmetro produtoId.
  let result;

  // Condição: se um produtoId for fornecido, lista as vendas desse produto; senão, lista todas as vendas.
  if (produtoId) {
    // Chama getVendasPorProduto do controller com o produtoId fornecido.
    result = await getVendasPorProduto(produtoId);
  } else {
    // Chama getTodasAsVendas do controller para listar todas as vendas registradas.
    result = await getTodasAsVendas();
  }

  // Retorna uma resposta HTTP com os dados das vendas e o status apropriado (200 ou erro).
  return new Response(JSON.stringify(result.data), { status: result.status });
}
