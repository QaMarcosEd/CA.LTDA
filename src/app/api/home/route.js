// app/api/home/route.js
import { NextResponse } from 'next/server';
import { getHomeData } from './controllers/homeController'; // Ajuste path se em subpasta

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const isEpocaPico = searchParams.get('epoca') === 'pico';

  try {
    const data = await getHomeData(isEpocaPico);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na rota /home:', error);
    return NextResponse.json({ error: error.message || 'Erro ao buscar dados da página inicial' }, { status: 500 });
  }
}