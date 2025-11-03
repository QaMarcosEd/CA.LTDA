import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // Singleton recomendado: mova pra lib/prisma.js em prod

// function calcularMetricas(vendas = []) {
//   // ... (mesma função de antes, sem mudanças)
//   const totalGasto = vendas.reduce((sum, venda) => sum + (parseFloat(venda.valorTotal) || 0), 0);
//   const totalPago = vendas.reduce((sum, venda) => {
//     const entrada = parseFloat(venda.entrada) || 0;
//     const parcelasPagas = (venda.parcelas || []).reduce((sumP, p) => sumP + (parseFloat(p.valorPago) || 0), 0);
//     return sum + entrada + parcelasPagas;
//   }, 0);
//   const totalPendente = totalGasto - totalPago;
//   const numeroCompras = vendas.length;

//   const produtosComprados = vendas.reduce((acc, venda) => {
//     const produto = venda.produto?.nome || 'Desconhecido';
//     acc[produto] = (acc[produto] || 0) + (venda.quantidade || 0);
//     return acc;
//   }, {});
//   const produtosFavoritos = Object.entries(produtosComprados)
//     .map(([nome, quantidade]) => ({ nome, quantidade }))
//     .sort((a, b) => b.quantidade - a.quantidade)
//     .slice(0, 3);

//   const hoje = new Date();
//   const parcelasAtrasadas = vendas
//     .flatMap((venda) => venda.parcelas || [])
//     .filter((parcela) => !parcela.pago && parcela.dataVencimento && new Date(parcela.dataVencimento) < hoje).length;

//   const seisMesesAtras = new Date();
//   seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
//   const comprasRecentes = vendas.filter((venda) => venda.dataVenda && new Date(venda.dataVenda) >= seisMesesAtras).length;
//   const frequenciaCompras = comprasRecentes <= 1 ? 'BAIXA' : comprasRecentes <= 5 ? 'MEDIA' : 'ALTA';

//   return {
//     totalGasto: totalGasto.toFixed(2),
//     totalPago: totalPago.toFixed(2),
//     totalPendente: totalPendente.toFixed(2),
//     numeroCompras,
//     produtosFavoritos,
//     parcelasAtrasadas,
//     frequenciaCompras,
//   };
// }

function calcularMetricas(vendas = []) {
  // ---------- 1. VALORES BRUTOS (o que o cliente deve) ----------
  const totalGasto = vendas.reduce((sum, venda) => {
    // valorTotal já é o bruto (R$ 120.99)
    return sum + (parseFloat(venda.valorTotal) || 0);
  }, 0);

  // ---------- 2. VALOR PAGO PELO CLIENTE ----------
  // Quando a venda está quitada usamos o próprio valorTotal (bruto)
  // Caso contrário somamos entrada + parcelas pagas
  const totalPago = vendas.reduce((sum, venda) => {
    if (venda.status === 'QUITADO') {
      return sum + (parseFloat(venda.valorTotal) || 0);
    }

    const entrada = parseFloat(venda.entrada) || 0;
    const parcelasPagas = (venda.parcelas || []).reduce(
      (s, p) => s + (parseFloat(p.valorPago) || 0),
      0
    );
    return sum + entrada + parcelasPagas;
  }, 0);

  // ---------- 3. TAXA DO CARTÃO (custo da loja) ----------
  const taxaCartao = vendas.reduce((sum, venda) => {
    // Se houver campo `valorLiquido` use a diferença; caso contrário 0
    const bruto = parseFloat(venda.valorTotal) || 0;
    const liquido = parseFloat(venda.valorLiquido) || bruto;
    return sum + (bruto - liquido);
  }, 0);

  // ---------- 4. OUTRAS MÉTRICAS (mantidas) ----------
  const numeroCompras = vendas.length;

  const produtosComprados = vendas.reduce((acc, venda) => {
    const produto = venda.produto?.nome || 'Desconhecido';
    acc[produto] = (acc[produto] || 0) + (venda.quantidade || 0);
    return acc;
  }, {});
  const produtosFavoritos = Object.entries(produtosComprados)
    .map(([nome, qtd]) => ({ nome, quantidade: qtd }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 3);

  const hoje = new Date();
  const parcelasAtrasadas = vendas
    .flatMap(v => v.parcelas || [])
    .filter(p => !p.pago && p.dataVencimento && new Date(p.dataVencimento) < hoje)
    .length;

  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
  const comprasRecentes = vendas.filter(
    v => v.dataVenda && new Date(v.dataVenda) >= seisMesesAtras
  ).length;
  const frequenciaCompras =
    comprasRecentes <= 1 ? 'BAIXA' : comprasRecentes <= 5 ? 'MEDIA' : 'ALTA';

  return {
    totalGasto: totalGasto.toFixed(2),
    totalPago: totalPago.toFixed(2),
    totalPendente: (totalGasto - totalPago).toFixed(2), // agora será 0 se quitado
    taxaCartao: taxaCartao.toFixed(2),                 // novo campo
    numeroCompras,
    produtosFavoritos,
    parcelasAtrasadas,
    frequenciaCompras,
  };
}

export async function getClienteById(id) {
  const clienteId = parseInt(id);
  if (isNaN(clienteId)) throw new Error('ID inválido');

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

  if (!cliente) throw new Error('Cliente não encontrado');

const metricas = calcularMetricas(cliente.vendas);
return {
  ...cliente,
  frequenciaCompras: metricas.frequenciaCompras,
  metricas: {
    totalGasto: metricas.totalGasto,
    totalPago: metricas.totalPago,
    totalPendente: metricas.totalPendente,
    taxaCartao: metricas.taxaCartao,          // <-- novo
    numeroCompras: metricas.numeroCompras,
    produtosFavoritos: metricas.produtosFavoritos,
    parcelasAtrasadas: metricas.parcelasAtrasadas,
  },
};
}

export async function updateCliente(id, data) {
  const clienteId = parseInt(id);
  if (isNaN(clienteId)) throw new Error('ID inválido');

  const updateData = {};
  const { nome, apelido, telefone, dataNascimento, cidade, bairro, rua } = data;

  if (nome !== undefined) {
    const trimmed = nome.trim();
    if (!trimmed) throw new Error('Nome é obrigatório e não pode ser vazio');
    const existingNome = await prisma.cliente.findFirst({ where: { nome: trimmed, NOT: { id: clienteId } } });
    if (existingNome) throw new Error('Nome já em uso por outro cliente');
    updateData.nome = trimmed;
  }

  if (apelido !== undefined) {
    updateData.apelido = apelido?.trim() || null;
  }

  if (telefone !== undefined) {
    const trimmed = telefone?.trim() || null;
    if (trimmed) {
      const existingTel = await prisma.cliente.findFirst({ where: { telefone: trimmed, NOT: { id: clienteId } } });
      if (existingTel) throw new Error('Telefone já em uso por outro cliente');
    }
    updateData.telefone = trimmed;
  }

  if (dataNascimento !== undefined) {
    if (!dataNascimento || dataNascimento === '') {
      updateData.dataNascimento = null;
    } else {
      const parsed = new Date(dataNascimento);
      if (isNaN(parsed.getTime())) throw new Error('Data de nascimento inválida (formato YYYY-MM-DD)');
      updateData.dataNascimento = parsed;
    }
  }

  if (cidade !== undefined) updateData.cidade = cidade?.trim() || null;
  if (bairro !== undefined) updateData.bairro = bairro?.trim() || null;
  if (rua !== undefined) updateData.rua = rua?.trim() || null;

  if (Object.keys(updateData).length === 0) throw new Error('Nenhum dado válido para atualizar');

  return await prisma.cliente.update({
    where: { id: clienteId },
    data: updateData,
  });
}

export async function listClientes() {
  const clientes = await prisma.cliente.findMany({
    include: {
      _count: { select: { vendas: true } },
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

  return clientes.map(cliente => {
    const vendas = cliente.vendas || [];
    let ultimaCompraAgregada = null;
    let totalGasto = 0;
    let qtyItensTotal = 0;

    if (vendas.length > 0) {
      ultimaCompraAgregada = vendas.reduce((maxDate, venda) => {
        if (!venda.dataVenda) return maxDate;
        const vendaDate = new Date(venda.dataVenda);
        return vendaDate > maxDate ? vendaDate : maxDate;
      }, new Date('1900-01-01'));

      totalGasto = vendas.reduce((sum, venda) => sum + (Number(venda.valorTotal) || 0), 0);
      qtyItensTotal = vendas.reduce((sum, venda) => sum + (Number(venda.quantidade) || 0), 0);
    }

    return {
      id: cliente.id,
      nome: cliente.nome,
      apelido: cliente.apelido,
      telefone: cliente.telefone,
      dataNascimento: cliente.dataNascimento,
      cidade: cliente.cidade,
      bairro: cliente.bairro,
      rua: cliente.rua,
      criadoEm: cliente.criadoEm,
      ultimaCompra: cliente.ultimaCompra,
      _count: cliente._count,
      ultimaCompraAgregada: ultimaCompraAgregada ? ultimaCompraAgregada.toISOString() : null,
      totalGasto,
      qtyItensTotal,
    };
  });
}

export async function createCliente(data) {
  const { nome, apelido, telefone, dataNascimento, cidade, bairro, rua } = data;
  if (!nome) throw new Error('Nome é obrigatório');

  // Check unique nome (ou telefone se quiser)
  const existingNome = await prisma.cliente.findFirst({ where: { nome } });
  if (existingNome) throw new Error('Cliente com esse nome já existe');

  return await prisma.cliente.create({
    data: {
      nome,
      apelido: apelido || null,
      telefone: telefone || null,
      dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
      cidade: cidade || null,
      bairro: bairro || null,
      rua: rua || null,
      ultimaCompra: new Date(),
    },
  });
}
