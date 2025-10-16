// app/api/clientes/[id]/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, context) {  // Use context + await params
  try {
    const params = await context.params;
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

    // Guards pra vendas/parcelas null/empty
    const vendas = cliente.vendas || [];

    // Calcular métricas com segurança
    const totalGasto = vendas.reduce((sum, venda) => sum + (parseFloat(venda.valorTotal) || 0), 0);
    const totalPago = vendas.reduce((sum, venda) => {
      const entrada = parseFloat(venda.entrada) || 0;
      const parcelasPagas = (venda.parcelas || []).reduce((sumP, p) => sumP + (parseFloat(p.valorPago) || 0), 0);
      return sum + entrada + parcelasPagas;
    }, 0);
    const totalPendente = totalGasto - totalPago;
    const numeroCompras = vendas.length;

    // Produtos favoritos
    const produtosComprados = vendas.reduce((acc, venda) => {
      const produto = venda.produto?.nome || 'Desconhecido';
      acc[produto] = (acc[produto] || 0) + (venda.quantidade || 0);
      return acc;
    }, {});
    const produtosFavoritos = Object.entries(produtosComprados)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 3);

    // Parcelas atrasadas
    const hoje = new Date();
    const parcelasAtrasadas = vendas
      .flatMap((venda) => venda.parcelas || [])
      .filter((parcela) => !parcela.pago && parcela.dataVencimento && new Date(parcela.dataVencimento) < hoje).length;

    // Calcular frequência de compras (baseado nos últimos 6 meses)
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
    const comprasRecentes = vendas.filter((venda) => venda.dataVenda && new Date(venda.dataVenda) >= seisMesesAtras).length;
    const frequenciaCompras = cliente.frequenciaCompras || (
      comprasRecentes <= 1 ? 'BAIXA' :
      comprasRecentes <= 5 ? 'MEDIA' : 'ALTA'
    );

    const clienteComMetricas = {
      ...cliente,
      frequenciaCompras,
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
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request, context) {  // Await params
  let updateData = {};
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (!id || isNaN(id)) {
      console.log('[PUT Erro] ID inválido:', params.id);
      return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await request.json();
    console.log('[PUT Recebido] ID:', id, '| Body cru:', body);

    // Mudei pra dataNascimento (case do schema!)
    const { nome, apelido, telefone, dataNascimento, cidade, bairro, rua } = body;

    if (nome !== undefined) {
      const trimmed = nome.trim();
      if (!trimmed) {
        console.log('[PUT Erro Validação] Nome vazio');
        return new Response(JSON.stringify({ error: 'Nome é obrigatório e não pode ser vazio' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const existingNome = await prisma.cliente.findFirst({ where: { nome: trimmed, NOT: { id } } });
      if (existingNome) {
        console.log('[PUT Erro Unique] Nome duplicado:', trimmed);
        return new Response(JSON.stringify({ error: 'Nome já em uso por outro cliente' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      updateData.nome = trimmed;
    }

    if (apelido !== undefined) {
      updateData.apelido = apelido?.trim() || null;
    }

    if (telefone !== undefined) {
      const trimmed = telefone?.trim() || null;
      if (trimmed) {
        const existingTel = await prisma.cliente.findFirst({ where: { telefone: trimmed, NOT: { id } } });
        if (existingTel) {
          console.log('[PUT Erro Unique] Telefone duplicado:', trimmed);
          return new Response(JSON.stringify({ error: 'Telefone já em uso por outro cliente' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
      }
      updateData.telefone = trimmed;
    }

    // Case corrigido: dataNascimento
    if (dataNascimento !== undefined) {
      if (!dataNascimento || dataNascimento === '') {
        updateData.dataNascimento = null;
      } else {
        const parsed = new Date(dataNascimento);
        if (isNaN(parsed.getTime())) {
          console.log('[PUT Erro Validação] Data inválida:', dataNascimento);
          return new Response(JSON.stringify({ error: 'Data de nascimento inválida (formato YYYY-MM-DD)' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        updateData.dataNascimento = parsed;
      }
    }

    if (cidade !== undefined) updateData.cidade = cidade?.trim() || null;
    if (bairro !== undefined) updateData.bairro = bairro?.trim() || null;
    if (rua !== undefined) updateData.rua = rua?.trim() || null;

    if (Object.keys(updateData).length === 0) {
      console.log('[PUT Warning] Nenhum campo válido para update');
      return new Response(JSON.stringify({ error: 'Nenhum dado válido para atualizar' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    console.log('[PUT Processando] UpdateData final:', updateData);

    const updated = await prisma.cliente.update({
      where: { id },
      data: updateData,
    });

    console.log('[PUT Sucesso] Cliente atualizado:', updated);
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('[PUT Erro Prisma/Interno] Detalhes completos:', error);
    
    let errorMsg = 'Erro interno ao atualizar cliente';
    let status = 500;
    
    if (error.code === 'P2025') {
      errorMsg = 'Cliente não encontrado';
      status = 404;
    } else if (error.code === 'P2002') {
      errorMsg = 'Conflito de unicidade (nome ou telefone já existe)';
      status = 400;
    } else if (error.message.includes('Invalid datetime')) {
      errorMsg = 'Data de nascimento inválida';
      status = 400;
    } else if (error.message.includes('Unknown argument')) {
      // Extra: Captura case errado
      errorMsg = 'Campo desconhecido';
      status = 400;
    } else {
      errorMsg = error.message || errorMsg;
    }

    return new Response(JSON.stringify({ error: errorMsg, details: error.message }), { status, headers: { 'Content-Type': 'application/json' } });
  } finally {
    await prisma.$disconnect();
  }
}

