// app/api/produtos/[id]/route.js (corrigi 'routes' pra 'route')
import { NextResponse } from 'next/server';
import { getProdutoById } from '../controller/produtosController';

export async function GET(request, { params }) {
  try {
    const produto = await getProdutoById(params.id);
    return NextResponse.json(produto);
  } catch (error) {
    const status = error.message === 'Produto não encontrado' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}