// app/api/produtos/route.js
import { NextResponse } from 'next/server';
import { getAllProdutos, createProduto, updateProduto, deleteProduto } from './controller/produtosController'; // Ajuste

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    // ... (mesmo parse de params)
    const result = await getAllProdutos({ /* params */ });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Erro ao processar' }, { status: 500 });
  }
}

export async function POST(request) { // Adicionado se precisar create single
  try {
    const data = await request.json();
    const result = await createProduto(data);
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const result = await updateProduto(data);
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    const status = error.message.includes('inválida') ? 400 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const result = await deleteProduto(id);
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    const status = error.message.includes('vinculado') ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
