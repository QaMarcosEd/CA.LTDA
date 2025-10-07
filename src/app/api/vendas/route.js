// api/vendas/route.js
import { createVenda, getTodasAsVendas } from './controller/vendasController';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filtros = {
      formaPagamento: searchParams.get('formaPagamento') || 'TODAS',
      dataInicio: searchParams.get('dataInicio') || '',
      dataFim: searchParams.get('dataFim') || '',
      status: searchParams.get('status') || 'TODAS',
      resumo: searchParams.get('resumo') === 'true',
    };

    console.log('Filtros recebidos na rota GET /api/vendas:', filtros); // Depuração
    const result = await getTodasAsVendas(filtros);
    return new Response(JSON.stringify(result.data), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na rota GET /api/vendas:', error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar vendas', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Dados recebidos na rota POST /api/vendas:', data); // Depuração
    const result = await createVenda(data);
    return new Response(JSON.stringify(result.data), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na rota POST /api/vendas:', error);
    return new Response(JSON.stringify({ error: 'Erro ao registrar venda', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}