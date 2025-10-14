// // app/api/clientes/[id]/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const clienteId = parseInt(params.id);
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        vendas: {
          include: {
            produto: true,
            parcelas: true,
          },
        },
      },
    });

    if (!cliente) {
      return new Response(JSON.stringify({ error: 'Cliente não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Calcular métricas
    const totalGasto = cliente.vendas.reduce((sum, venda) => sum + parseFloat(venda.valorTotal), 0);
    const totalPago = cliente.vendas.reduce((sum, venda) => {
      const entrada = parseFloat(venda.entrada) || 0;
      const parcelasPagas = venda.parcelas.reduce((sum, p) => sum + parseFloat(p.valorPago || 0), 0);
      return sum + entrada + parcelasPagas;
    }, 0);
    const totalPendente = totalGasto - totalPago;
    const numeroCompras = cliente.vendas.length;

    // Produtos favoritos
    const produtosComprados = cliente.vendas.reduce((acc, venda) => {
      const produto = venda.produto.nome;
      acc[produto] = (acc[produto] || 0) + venda.quantidade;
      return acc;
    }, {});
    const produtosFavoritos = Object.entries(produtosComprados)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 3);

    // Parcelas atrasadas
    const hoje = new Date();
    const parcelasAtrasadas = cliente.vendas
      .flatMap((venda) => venda.parcelas)
      .filter((parcela) => !parcela.pago && new Date(parcela.dataVencimento) < hoje).length;

    // Calcular frequência de compras (baseado nos últimos 6 meses)
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
    const comprasRecentes = cliente.vendas.filter((venda) => new Date(venda.dataVenda) >= seisMesesAtras).length;
    const frequenciaCompras = cliente.frequenciaCompras || (
      comprasRecentes <= 1 ? 'BAIXA' :
      comprasRecentes <= 5 ? 'MEDIA' : 'ALTA'
    );

    const clienteComMetricas = {
      ...cliente,
      frequenciaCompras, // Usa o valor do banco ou o calculado
      metricas: {
        totalGasto: totalGasto.toFixed(2),
        totalPago: totalPago.toFixed(2),
        totalPendente: totalPendente.toFixed(2),
        numeroCompras,
        produtosFavoritos,
        parcelasAtrasadas,
      },
    };

    console.log('Cliente retornado:', clienteComMetricas);
    return new Response(JSON.stringify(clienteComMetricas), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar cliente', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// NOVO: PUT pra editar cliente
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    if (!id || isNaN(id)) {
      return new Response(JSON.stringify({ error: 'ID inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { nome, apelido, telefone } = body;

    if (!nome || nome.trim() === '') {
      return new Response(JSON.stringify({ error: 'Nome é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Checa se nome já existe (exceto ele mesmo)
    const existingCliente = await prisma.cliente.findFirst({
      where: { nome: nome.trim(), NOT: { id } },
    });
    if (existingCliente) {
      return new Response(JSON.stringify({ error: 'Nome já usado por outro cliente' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updatedCliente = await prisma.cliente.update({
      where: { id },
      data: {
        nome: nome.trim(),
        apelido: apelido?.trim() || null,
        telefone: telefone?.trim() || null,
      },
    });

    return new Response(JSON.stringify(updatedCliente), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao editar cliente:', error);
    if (error.code === 'P2025') { // Não encontrado
      return new Response(JSON.stringify({ error: 'Cliente não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (error.code === 'P2002') { // Unique violation fallback
      return new Response(JSON.stringify({ error: 'Nome já em uso' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: 'Erro interno ao editar cliente', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}