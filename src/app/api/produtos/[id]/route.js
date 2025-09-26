// api/produtos/[id]/routes.js
import { NextResponse } from 'next/server'

// Importa a função responsável por buscar o produto no banco/controlador
import { getProdutoById } from '../controller/produtosController'

// Função que lida com requisições GET para buscar um produto específico pelo ID
export async function GET(req, { params }) {
  try {
    // Extrai o ID dos parâmetros da rota
    const { id } = params
    
    // Busca o produto no banco/controlador, convertendo o ID para número inteiro
    const produto = await getProdutoById(parseInt(id))

    // Caso não encontre o produto, retorna erro 404
    if (!produto) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    // Retorna o produto encontrado com status 200 (sucesso)
    return NextResponse.json(produto, { status: 200 })

  } catch (error) {
    // Loga o erro no servidor para facilitar o debug
    console.error('Erro ao buscar produto:', error)
    
    // Retorna erro 500 (erro interno no servidor)
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    )
  }
}

