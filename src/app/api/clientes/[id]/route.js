// app/api/clientes/[id]/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { id } = await params; // Use await pra resolver params
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(id) },
      include: {
        vendas: {
          include: { produto: true },
        },
      },
    });
    if (!cliente) {
      return new Response(JSON.stringify({ error: 'Cliente não encontrado' }), { status: 404 });
    }
    return new Response(JSON.stringify(cliente), { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar cliente', details: error.message }), { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params; // Use await pra resolver params
    const { nome, apelido, telefone } = await request.json();
    if (!nome) {
      return new Response(JSON.stringify({ error: 'Nome é obrigatório' }), { status: 400 });
    }

    const cliente = await prisma.cliente.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        apelido: apelido || null,
        telefone: telefone || null,
      },
    });
    return new Response(JSON.stringify(cliente), { status: 200 });
  } catch (error) {
    console.error('Erro ao editar cliente:', error);
    if (error.code === 'P2002') {
      return new Response(JSON.stringify({ error: 'Cliente com esse nome já existe' }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: 'Erro ao editar cliente' }), { status: 500 });
  }
}