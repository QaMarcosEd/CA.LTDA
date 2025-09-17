import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função para criar uma nova venda no sistema.
export async function createVenda(data) {
  try {
    // Extrai os campos do objeto 'data' recebido, usando valores padrão se não fornecidos.
    const { produtoId, quantidade, observacao, nomeCliente, valorPago } = data;

    // Busca o produto no banco de dados pelo ID fornecido, convertendo para inteiro.
    const produto = await prisma.produto.findUnique({ where: { id: parseInt(produtoId) } });
    
    if (!produto) return { status: 404, data: { error: 'Produto não encontrado' } };

    if (produto.quantidade < quantidade) return { status: 400, data: { error: 'Estoque insuficiente' } };

    // Cria uma nova entrada de venda no banco de dados com os dados fornecidos.
    const venda = await prisma.venda.create({
      data: {
        produtoId: parseInt(produtoId),
        quantidade: parseInt(quantidade),
        precoVenda: parseFloat(produto.preco),
        observacao: observacao || null,
        nomeCliente: nomeCliente || 'Cliente não informado',
        valorPago: valorPago ? parseFloat(valorPago) : parseFloat(produto.preco),
      },
    });

    // Atualiza o produto no banco, subtraindo a quantidade vendida do estoque.
    // Também atualiza 'disponivel' para false se o estoque zerar.
    await prisma.produto.update({
      where: { id: parseInt(produtoId) },
      data: {
        quantidade: produto.quantidade - quantidade,
        disponivel: produto.quantidade - quantidade > 0, // True se ainda houver estoque.
      },
    });

    // Retorna a venda criada com status 201 (Created).
    return { status: 201, data: venda };
  } catch (error) {
    // Captura e loga qualquer erro durante o processo de criação da venda.
    console.error('Erro ao registrar venda:', error);
    // Retorna erro 500 com detalhes para depuração.
    return { status: 500, data: { error: 'Erro ao registrar venda', details: error.message } };
  }
}

// Função para listar todas as vendas associadas a um produto específico.
// export async function getVendasPorProduto(produtoId) {
//   try {
//     // Busca todas as vendas relacionadas ao produtoId, ordenadas por data descendente (mais recente primeiro).
//     const vendas = await prisma.venda.findMany({
//       where: { produtoId: parseInt(produtoId) },
//       orderBy: { data: 'desc' },
//     });
//     return { status: 200, data: vendas };
//   } catch (error) {
//     console.error('Erro ao listar vendas:', error);
//     return { status: 500, data: { error: 'Erro ao listar vendas', details: error.message } };
//   }
// }

// Função para listar todas as vendas registradas no sistema.
export async function getTodasAsVendas() {
  try {
    // Busca todas as vendas, ordenadas por data descendente, incluindo os dados do produto relacionado.
    const vendas = await prisma.venda.findMany({
      orderBy: { data: 'desc' },
      include: { produto: true }, // Opcional, útil para exibir detalhes do produto na venda.
    });
    console.log('Vendas retornadas pelo Prisma:', vendas); // Adicione isso
    return { status: 200, data: vendas };
  } catch (error) {
    console.error('Erro ao listar todas as vendas:', error);
    return { status: 500, data: { error: 'Erro ao listar todas as vendas', details: error.message } };
  }
}
