// app/api/produtos/lote/controller/loteController.js
import { prisma } from '../../../../lib/prisma'; // Path ajustado

export async function createLote(data) {
  try {
    // Validações (mesmas, com throws)
    const camposObrigatorios = ['nome', 'referencia', 'cor', 'precoVenda', 'genero', 'modelo', 'marca', 'dataRecebimento'];
    const faltando = camposObrigatorios.filter(c => !data.genericos[c]);
    if (faltando.length) throw new Error(`Campos obrigatórios faltando: ${faltando.join(', ')}`);

    const dataRecebimento = new Date(data.genericos.dataRecebimento);
    if (isNaN(dataRecebimento.getTime())) throw new Error('Data de recebimento inválida');

    const precoVenda = parseFloat(data.genericos.precoVenda);
    const precoCusto = data.genericos.precoCusto ? parseFloat(data.genericos.precoCusto) : null;
    if (isNaN(precoVenda) || precoVenda < 0) throw new Error('Preço de venda inválido');
    if (precoCusto !== null && (isNaN(precoCusto) || precoCusto < 0)) throw new Error('Preço de custo inválido');
    if (precoCusto > precoVenda) console.warn('Aviso: Custo > Venda');

    if (!data.variacoes || data.variacoes.length === 0) throw new Error('Pelo menos uma variação necessária');
    const totalQuantidade = data.variacoes.reduce((sum, v) => sum + parseInt(v.quantidade), 0);
    if (totalQuantidade <= 0) throw new Error('Lote deve ter pelo menos uma unidade');

    const lote = data.genericos.lote || `Lote-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    // Transação pra atomicidade
    const produtosCriados = await prisma.$transaction(async (tx) => {
      const criados = [];
      for (const variacao of data.variacoes) {
        const tamanho = parseInt(variacao.tamanho);
        const quantidade = parseInt(variacao.quantidade);
        if (isNaN(tamanho) || tamanho <= 0 || isNaN(quantidade) || quantidade < 0) throw new Error(`Variação inválida: tamanho ${variacao.tamanho}, qtd ${variacao.quantidade}`);

        const existente = await tx.produto.findFirst({
          where: { referencia: data.genericos.referencia, cor: data.genericos.cor, tamanho },
        });

        if (existente) {
          const updated = await tx.produto.update({
            where: { id: existente.id },
            data: { quantidade: { increment: quantidade }, disponivel: true, precoCusto, precoVenda, dataRecebimento },
          });
          criados.push(updated);
        } else {
          const novo = await tx.produto.create({
            data: {
              nome: data.genericos.nome,
              referencia: data.genericos.referencia,
              cor: data.genericos.cor,
              tamanho,
              quantidade,
              precoCusto,
              precoVenda,
              genero: data.genericos.genero,
              modelo: data.genericos.modelo,
              marca: data.genericos.marca,
              lote,
              dataRecebimento,
              disponivel: quantidade > 0,
            },
          });
          criados.push(novo);
        }
      }
      return criados;
    });

    return { status: 201, data: { message: `Lote com ${produtosCriados.length} itens criado`, produtos: produtosCriados } };
  } catch (error) {
    console.error('Erro ao criar lote:', error);
    throw error;
  }
}
