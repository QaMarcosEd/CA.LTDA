// app/api/clientes/[id]/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        vendas: {
          include: {
            produto: true,
            parcelas: true,
          },
        },
      },
    });

    if (!cliente) {
      return new Response(JSON.stringify({ error: 'Cliente não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Cliente retornado:', cliente); // Depuração
    return new Response(JSON.stringify(cliente), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar cliente', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
