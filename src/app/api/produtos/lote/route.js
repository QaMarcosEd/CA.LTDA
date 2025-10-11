// api/produtos/lote/routes.js
import { createLote } from './controller/loteController';

export async function POST(request) {
  try {
    const data = await request.json();
    const result = await createLote(data);
    return new Response(JSON.stringify(result.data), { status: result.status });
  } catch (error) {
    console.error('Erro ao processar lote:', error);
    return new Response(JSON.stringify({ error: 'Erro ao processar lote', details: error.message }), { status: 500 });
  }
}