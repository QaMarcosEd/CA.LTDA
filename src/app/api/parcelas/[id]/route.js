// app/api/parcelas/[id]/route.js
import { NextResponse } from 'next/server';
import { updatePagamentoParcela } from '../controllers/parcelaController'; // Ajuste path (mesma pasta api/parcelas)

export async function PUT(request, context) {
  let body;
  try {
    const params = await context.params;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({ error: 'Body inválido (não JSON)' }, { status: 400 });
    }

    const result = await updatePagamentoParcela(params.id, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar parcela:', error);
    let status = 500;
    if (error.message.includes('ID inválido') || error.message.includes('valor') || error.message.includes('Data') || error.message.includes('não pode')) status = 400;
    if (error.message === 'Parcela não encontrada') status = 404;
    return NextResponse.json({ error: error.message }, { status });
  }
}