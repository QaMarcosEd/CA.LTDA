// app/api/estoque/controller/estoqueController.js
import { prisma } from '../../../lib/prisma'; // Ajuste path se necessário (de api/estoque/controller pra lib na raiz)

export async function getEstoqueData(tipo, filtros = {}) {
  const { genero, marca, modelo, numeracao } = filtros;

  try {
    // Validação básica de entrada
    const numeracaoInt = numeracao ? parseInt(numeracao) : undefined;
    if (numeracao && isNaN(numeracaoInt)) {
      throw new Error('Numeração inválida (deve ser número)');
    }

    const whereBase = {
      quantidade: { gt: 0 }, // Só estoque positivo
    };
    if (genero) whereBase.genero = genero;
    if (marca) whereBase.marca = marca;
    if (modelo) whereBase.modelo = modelo;
    if (numeracaoInt) whereBase.tamanho = numeracaoInt;

    // Lógica para agregações (gráficos: genero, modelo, marca)
    if (tipo && ['genero', 'modelo', 'marca'].includes(tipo)) {
      const contagem = await prisma.produto.groupBy({
        by: [tipo],
        _sum: { quantidade: true },
        where: whereBase,
      });

      return contagem.map((item) => ({
        [tipo]: item[tipo] || 'Desconhecido',
        total: item._sum.quantidade || 0,
      }));
    }

    // Validação se tipo inválido (mas não agregação)
    if (tipo && !['genero', 'modelo', 'marca'].includes(tipo)) {
      throw new Error('Tipo inválido para agregação');
    }

    // Busca geral de produtos (lista)
    const produtos = await prisma.produto.findMany({
      where: whereBase,
      select: { // Só campos úteis, otimizado
        id: true,
        nome: true, // Assumindo campo nome; ajusta se for modelo ou outro
        genero: true,
        marca: true,
        modelo: true,
        tamanho: true,
        quantidade: true,
        // Adicione mais se precisar (ex: preco)
      },
      orderBy: { criadoEm: 'desc' }, // Ou por quantidade
    });

    // Paginação simples (client-side ou ajuste pra server-side com take/skip)
    const pageSize = 10; // Hardcoded; passe como param se quiser
    const totalPages = Math.ceil(produtos.length / pageSize);
    // Se quiser paginar de verdade: adicione page param e slice aqui ou no Prisma (skip: (page-1)*size, take: size)

    return { data: produtos, totalPages };
  } catch (error) {
    console.error('Erro no getEstoqueData:', error);
    throw error; // Propaga pra route handle
  }
}


