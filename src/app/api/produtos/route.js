// app/api/produtos/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getAllProdutos, createProduto, updateProduto, deleteProduto } from './controller/produtosController'; // Ajuste


export async function GET(request) {
  try {
    // ← VERIFICAÇÃO DE AUTENTICAÇÃO (igual aos outros métodos)
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Parse dos parâmetros da query string
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Debug no servidor
    console.log('API GET /produtos - Parâmetros recebidos:', params);

    // Chama o getAllProdutos com os params corretos
    const result = await getAllProdutos(params);
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('Erro na API GET /produtos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar produtos' }, 
      { status: 500 }
    );
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
    // ← VERIFICAÇÃO DE AUTENTICAÇÃO E PERMISSÃO
    const session = await getServerSession(authOptions);
    
    // 1. SEM LOGIN → 401
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // 2. SÓ ADMIN PODE DELETAR PRODUTOS
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem deletar produtos.' }, 
        { status: 403 }
      );
    }

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
    // ← VERIFICAÇÃO DE AUTENTICAÇÃO E PERMISSÃO
    const session = await getServerSession(authOptions);
    
    // 1. SEM LOGIN → 401
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // 2. SÓ ADMIN PODE DELETAR PRODUTOS
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem deletar produtos.' }, 
        { status: 403 }
      );
    }

    const { id } = await request.json();
    const result = await deleteProduto(id);
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    const status = error.message.includes('vinculado') ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
