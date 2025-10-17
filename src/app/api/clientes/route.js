import { NextResponse } from 'next/server';
import { listClientes, createCliente } from './controllers/clienteController'; // Ajuste path

export async function GET() {
  try {
    const clientes = await listClientes();
    return NextResponse.json(clientes);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    return NextResponse.json({ error: 'Erro ao listar clientes', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const cliente = await createCliente(body);
    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    const status = error.message.includes('existe') ? 400 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
