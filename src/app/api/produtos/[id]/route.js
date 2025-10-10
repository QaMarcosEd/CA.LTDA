// api/produtos/[id]/routes.js
import { NextResponse } from 'next/server'

import { getProdutoById } from '../controller/produtosController'

// Função que lida com requisições GET para buscar um produto específico pelo ID
export async function GET(req, { params }) {
  try {
    const { id } = params
    
    const produto = await getProdutoById(parseInt(id))

    if (!produto) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(produto, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    )
  }
}

