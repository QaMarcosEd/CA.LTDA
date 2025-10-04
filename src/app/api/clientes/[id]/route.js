// // app/api/clientes/[id]/route.js
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export async function GET(request, { params }) {
//   try {
//     const cliente = await prisma.cliente.findUnique({
//       where: { id: parseInt(params.id) },
//       include: {
//         vendas: {
//           include: {
//             produto: true,
//             parcelas: true,
//           },
//         },
//       },
//     });

//     if (!cliente) {
//       return new Response(JSON.stringify({ error: 'Cliente não encontrado' }), {
//         status: 404,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     console.log('Cliente retornado:', cliente); // Depuração
//     return new Response(JSON.stringify(cliente), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.error('Erro ao buscar cliente:', error);
//     return new Response(JSON.stringify({ error: 'Erro ao buscar cliente', details: error.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }
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
