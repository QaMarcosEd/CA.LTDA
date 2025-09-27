import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const taxas = await prisma.taxaCartao.findMany();
    return new Response(JSON.stringify(taxas), { status: 200 });
  } catch (error) {
    console.error('Erro ao listar taxas:', error);
    return new Response(JSON.stringify({ error: 'Erro ao listar taxas', details: error.message }), { status: 500 });
  }
}