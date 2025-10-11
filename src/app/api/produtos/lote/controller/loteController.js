// api/produtos/lote/controller/loteController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createLote(data) {
  try {
    const camposObrigatorios = ['nome', 'referencia', 'cor', 'precoVenda', 'genero', 'modelo', 'marca', 'dataRecebimento'];
    const faltando = camposObrigatorios.filter(c => data.genericos[c] === undefined || data.genericos[c] === '');

    if (faltando.length) {
      return { status: 400, data: { error: `Campos obrigatórios faltando: ${faltando.join(', ')}` } };
    }

    const dataRecebimento = new Date(data.genericos.dataRecebimento);
    if (isNaN(dataRecebimento.getTime())) {
      return { status: 400, data: { error: 'Data de recebimento inválida' } };
    }

    const precoVenda = parseFloat(data.genericos.precoVenda);
    const precoCusto = data.genericos.precoCusto ? parseFloat(data.genericos.precoCusto) : null;
    const imagem = data.genericos.imagem || null;

    if (isNaN(precoVenda) || precoVenda < 0) {
      return { status: 400, data: { error: 'Preço de venda inválido' } };
    }
    if (precoCusto !== null && (isNaN(precoCusto) || precoCusto < 0)) {
      return { status: 400, data: { error: 'Preço de custo inválido' } };
    }
    if (precoCusto !== null && precoCusto > precoVenda) {
      console.warn('Aviso: Preço de custo maior que preço de venda');
    }
    if (imagem && !/^https?:\/\/.*\.(jpg|jpeg|png|webp)$/i.test(imagem)) {
      console.warn('Aviso: URL da imagem inválida, será ignorada');
      data.genericos.imagem = null;
    }

    if (!data.variacoes || !Array.isArray(data.variacoes) || data.variacoes.length === 0) {
      return { status: 400, data: { error: 'Pelo menos uma variação de tamanho/quantidade é necessária' } };
    }

    const totalQuantidade = data.variacoes.reduce((sum, v) => sum + parseInt(v.quantidade), 0);
    if (totalQuantidade <= 0) {
      return { status: 400, data: { error: 'O lote deve ter pelo menos uma unidade' } };
    }

    const lote = data.genericos.lote || `Lote-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const produtosCriados = [];
    for (const variacao of data.variacoes) {
      if (isNaN(parseInt(variacao.tamanho)) || parseInt(variacao.tamanho) <= 0) {
        return { status: 400, data: { error: `Tamanho inválido: ${variacao.tamanho}` } };
      }
      if (isNaN(parseInt(variacao.quantidade)) || parseInt(variacao.quantidade) < 0) {
        return { status: 400, data: { error: `Quantidade inválida para tamanho ${variacao.tamanho}` } };
      }

      const existente = await prisma.produto.findFirst({
        where: {
          referencia: data.genericos.referencia,
          cor: data.genericos.cor,
          tamanho: parseInt(variacao.tamanho),
        },
      });

      if (existente) {
        const result = await prisma.produto.update({
          where: { id: existente.id },
          data: {
            quantidade: existente.quantidade + parseInt(variacao.quantidade),
            disponivel: existente.quantidade + parseInt(variacao.quantidade) > 0,
            precoCusto, // Atualiza
            precoVenda, // Atualiza
            imagem, // Atualiza
            dataRecebimento,
          },
        });
        produtosCriados.push(result);
      } else {
        const produtoData = {
          nome: data.genericos.nome,
          referencia: data.genericos.referencia,
          cor: data.genericos.cor,
          tamanho: parseInt(variacao.tamanho),
          quantidade: parseInt(variacao.quantidade),
          precoCusto, // Novo
          precoVenda, // Substitui preco
          imagem, // Novo
          genero: data.genericos.genero,
          modelo: data.genericos.modelo,
          marca: data.genericos.marca,
          lote,
          dataRecebimento,
        };
        const result = await prisma.produto.create({
          data: produtoData,
        });
        produtosCriados.push(result);
      }
    }

    return { status: 201, data: { message: `Lote com ${produtosCriados.length} itens criado com sucesso`, produtos: produtosCriados } };
  } catch (error) {
    console.error('Erro ao criar lote:', error);
    return { status: 500, data: { error: 'Erro ao criar lote', details: error.message } };
  }
}
