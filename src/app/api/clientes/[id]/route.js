import { NextResponse } from 'next/server';
import { getClienteById, updateCliente } from '../controllers/clienteController'; // Ajuste path

export async function GET(request, context) {
  try {
    const params = await context.params;
    const cliente = await getClienteById(params.id);
    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    const status = error.message === 'Cliente não encontrado' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PUT(request, context) {
  try {
    const params = await context.params;
    const body = await request.json();
    const updated = await updateCliente(params.id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    // Mapeie erros específicos como antes
    let status = 500;
    if (error.message.includes('ID inválido') || error.message.includes('Nome')) status = 400;
    if (error.message === 'Cliente não encontrado') status = 404; // Via Prisma error.code se integrar
    return NextResponse.json({ error: error.message }, { status });
  }
}