import { PrismaClient } from '@prisma/client';
import { createProduto } from '../../controller/produtosController'; // Reaproveita o controller existente

const prisma = new PrismaClient();

export async function createLote(data) {
  try {
    // Validação dos dados genéricos
    const camposObrigatorios = ['nome', 'referencia', 'cor', 'preco', 'genero', 'modelo', 'marca'];
    const faltando = camposObrigatorios.filter(c => data.genericos[c] === undefined || data.genericos[c] === '');

    if (faltando.length) {
      return { status: 400, data: { error: `Campos obrigatórios faltando: ${faltando.join(', ')}` } };
    }

    // Validações adicionais
    if (isNaN(parseFloat(data.genericos.preco)) || parseFloat(data.genericos.preco) < 0) {
      return { status: 400, data: { error: 'Preço inválido' } };
    }

    // Valida variações (tamanhos e quantidades)
    if (!data.variacoes || !Array.isArray(data.variacoes) || data.variacoes.length === 0) {
      return { status: 400, data: { error: 'Pelo menos uma variação de tamanho/quantidade é necessária' } };
    }

    const totalQuantidade = data.variacoes.reduce((sum, v) => sum + parseInt(v.quantidade), 0);
    if (totalQuantidade <= 0) {
      return { status: 400, data: { error: 'O lote deve ter pelo menos uma unidade' } };
    }

    // Gera código de lote automático se não fornecido
    const lote = data.genericos.lote || `Lote-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    // Cria produtos para cada variação
    const produtosCriados = [];
    for (const variacao of data.variacoes) {
      if (isNaN(parseInt(variacao.tamanho)) || parseInt(variacao.tamanho) <= 0) {
        return { status: 400, data: { error: `Tamanho inválido: ${variacao.tamanho}` } };
      }
      if (isNaN(parseInt(variacao.quantidade)) || parseInt(variacao.quantidade) < 0) {
        return { status: 400, data: { error: `Quantidade inválida para tamanho ${variacao.tamanho}` } };
      }

      // Verifica se já existe produto com mesma referência, cor e tamanho
      const existente = await prisma.produto.findFirst({
        where: {
          referencia: data.genericos.referencia,
          cor: data.genericos.cor,
          tamanho: parseInt(variacao.tamanho),
        },
      });

      if (existente) {
        // Soma quantidades se já existe
        const result = await prisma.produto.update({
          where: { id: existente.id },
          data: {
            quantidade: existente.quantidade + parseInt(variacao.quantidade),
            disponivel: existente.quantidade + parseInt(variacao.quantidade) > 0,
          },
        });
        produtosCriados.push(result);
      } else {
        // Cria novo produto usando createProduto
        const produtoData = {
          nome: data.genericos.nome,
          referencia: data.genericos.referencia,
          cor: data.genericos.cor,
          tamanho: parseInt(variacao.tamanho),
          quantidade: parseInt(variacao.quantidade),
          preco: parseFloat(data.genericos.preco),
          genero: data.genericos.genero,
          modelo: data.genericos.modelo,
          marca: data.genericos.marca,
          lote: lote,
        };
        const result = await createProduto(produtoData);
        if (result.status !== 201) {
          return result; // Propaga erro, se houver
        }
        produtosCriados.push(result.data);
      }
    }

    return { status: 201, data: { message: `Lote com ${produtosCriados.length} itens criado com sucesso`, produtos: produtosCriados } };
  } catch (error) {
    console.error('Erro ao criar lote:', error);
    return { status: 500, data: { error: 'Erro ao criar lote', details: error.message } };
  }
}