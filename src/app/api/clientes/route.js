// app/api/clientes/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      select: {
        id: true,
        nome: true,
        apelido: true, // Mudei de email pra apelido
        telefone: true,
        criadoEm: true,
        _count: { select: { vendas: true } },
      },
      orderBy: { criadoEm: 'desc' },
    });
    return new Response(JSON.stringify(clientes), { status: 200 });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    return new Response(JSON.stringify({ error: 'Erro ao listar clientes', details: error.message }), { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { nome, apelido, telefone } = await request.json(); // Mudei de email pra apelido
    if (!nome) {
      return new Response(JSON.stringify({ error: 'Nome é obrigatório' }), { status: 400 });
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        apelido: apelido || null, // Mudei de email pra apelido
        telefone: telefone || null,
      },
    });
    return new Response(JSON.stringify(cliente), { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    if (error.code === 'P2002') {
      return new Response(JSON.stringify({ error: 'Cliente com esse nome já existe' }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: 'Erro ao criar cliente' }), { status: 500 });
  }
}