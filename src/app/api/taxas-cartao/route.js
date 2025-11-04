// src/app/api/taxas-cartao/route.js
import { prisma } from '../../lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const taxas = await prisma.taxaCartao.findMany({
      orderBy: [{ bandeira: 'asc' }, { modalidade: 'asc' }],
    });
    return NextResponse.json(taxas);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar taxas' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { bandeira, modalidade, taxaPercentual } = await request.json();
    const taxa = await prisma.taxaCartao.create({
      data: {
        bandeira: bandeira.toUpperCase(),
        modalidade: modalidade.toUpperCase(),
        taxaPercentual: parseFloat(taxaPercentual),
      },
    });
    return NextResponse.json(taxa, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Taxa já existe' }, { status: 409 });
    return NextResponse.json({ error: 'Erro ao criar taxa' }, { status: 500 });
  }
}

// PUT - Atualizar
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    const userName = session?.user?.name || 'desconhecido';

    const { id, bandeira, modalidade, taxaPercentual } = await request.json();
    
    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });

    const novaTaxa = parseFloat(taxaPercentual);
    if (isNaN(novaTaxa) || novaTaxa < 0) {
      return NextResponse.json({ error: 'Taxa inválida' }, { status: 400 });
    }

    const taxaAntiga = await prisma.taxaCartao.findUnique({ 
      where: { id: parseInt(id) } 
    });
    if (!taxaAntiga) return NextResponse.json({ error: 'Taxa não encontrada' }, { status: 404 });

    const taxa = await prisma.taxaCartao.update({
      where: { id: parseInt(id) },
      data: {
        bandeira: bandeira?.toUpperCase() || taxaAntiga.bandeira,
        modalidade: modalidade?.toUpperCase() || taxaAntiga.modalidade,
        taxaPercentual: novaTaxa,
      },
    });

    // SALVA HISTÓRICO COM NOME DO USUÁRIO
    await prisma.taxaCartaoHistorico.create({
      data: {
        taxaCartaoId: parseInt(id),
        bandeira: taxaAntiga.bandeira,
        modalidade: taxaAntiga.modalidade,
        taxaAntiga: taxaAntiga.taxaPercentual,
        taxaNova: novaTaxa,
        alteradoPor: userName, // ← AQUI! "João Silva"
        alteradoEm: new Date(),
      },
    });

    return NextResponse.json(taxa);
  } catch (error) {
    console.error('Erro no PUT:', error);
    return NextResponse.json({ error: 'Erro ao atualizar taxa' }, { status: 500 });
  }
}

// DELETE - Deletar (CORRIGIDO!)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });

    await prisma.taxaCartao.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar taxa' }, { status: 500 });
  }
}