//app/api/clientes/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// export async function GET() {
//   try {
//     const clientes = await prisma.cliente.findMany({
//       select: {
//         id: true,
//         nome: true,
//         apelido: true,
//         telefone: true,
//         criadoEm: true,
//         _count: { select: { vendas: true } },
//       },
//       orderBy: { criadoEm: 'desc' },
//     });
//     return new Response(JSON.stringify(clientes), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.error('Erro ao listar clientes:', error);
//     return new Response(JSON.stringify({ error: 'Erro ao listar clientes', details: error.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } finally {
//     await prisma.$disconnect();
//   }
// }

export async function GET() {
  try {
    // Tudo via include, sem select top-level conflituoso
    const clientes = await prisma.cliente.findMany({
      include: {
        _count: { select: { vendas: true } }, // _count aqui dentro do include
        vendas: {
          select: {
            dataVenda: true,
            valorTotal: true,
            quantidade: true,
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });

    // Calcular com safeties (mesmo sem vendas)
    const clientesProcessados = clientes.map(cliente => {
      let ultimaCompraAgregada = null;
      let totalGasto = 0;
      let qtyItensTotal = 0;

      const vendas = cliente.vendas || []; // Array seguro
      if (vendas.length > 0) {
        // Max dataVenda
        ultimaCompraAgregada = vendas.reduce((maxDate, venda) => {
          if (!venda.dataVenda) return maxDate;
          const vendaDate = new Date(venda.dataVenda);
          return vendaDate > maxDate ? vendaDate : maxDate;
        }, new Date('1900-01-01'));

        // Sums
        totalGasto = vendas.reduce((sum, venda) => sum + (Number(venda.valorTotal) || 0), 0);
        qtyItensTotal = vendas.reduce((sum, venda) => sum + (Number(venda.quantidade) || 0), 0);
      }

      // Campos básicos (id, nome etc vem do model default no include)
      return {
        id: cliente.id,
        nome: cliente.nome,
        apelido: cliente.apelido,
        telefone: cliente.telefone,
        criadoEm: cliente.criadoEm,
        ultimaCompra: cliente.ultimaCompra, // Se usar o campo do model
        _count: cliente._count,
        ultimaCompraAgregada: ultimaCompraAgregada ? ultimaCompraAgregada.toISOString() : null,
        totalGasto,
        qtyItensTotal,
      };
    });

    return new Response(JSON.stringify(clientesProcessados), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
        console.error('Erro ao listar clientes:', error);
    return new Response(JSON.stringify({ error: 'Erro ao listar clientes', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const { nome, apelido, telefone } = await request.json();
    if (!nome) {
      return new Response(JSON.stringify({ error: 'Nome é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        apelido: apelido || null,
        telefone: telefone || null,
        ultimaCompra: new Date(), // NOVO: Seta default pra cliente novo que compra
      },
    });
    return new Response(JSON.stringify(cliente), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    if (error.code === 'P2002') {
      return new Response(JSON.stringify({ error: 'Cliente com esse nome já existe' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: 'Erro ao criar cliente', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}

