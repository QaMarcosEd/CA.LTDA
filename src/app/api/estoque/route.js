// api/estoque/route.js
import { getEstoqueData } from './controller/estoqueController';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo');
  const genero = searchParams.get('genero');
  const marca = searchParams.get('marca');
  const modelo = searchParams.get('modelo');
  const numeracao = searchParams.get('numeracao');

  try {
    const resultado = await getEstoqueData(tipo, { genero, marca, modelo, numeracao });
    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar dados.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}