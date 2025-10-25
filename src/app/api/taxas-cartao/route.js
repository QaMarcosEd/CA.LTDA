// // app/api/taxas-cartao/route.js
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export async function GET() {
//   try {
//     const taxas = await prisma.taxaCartao.findMany();
//     return new Response(JSON.stringify(taxas), { status: 200 });
//   } catch (error) {
//     console.error('Erro ao listar taxas:', error);
//     return new Response(JSON.stringify({ error: 'Erro ao listar taxas', details: error.message }), { status: 500 });
//   }
// }

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const taxas = await prisma.taxaCartao.findMany();
    return new Response(JSON.stringify(taxas), { status: 200 });
  } catch (error) {
    console.error('Erro ao listar taxas:', error);
    return new Response(JSON.stringify({ error: 'Erro ao listar taxas', details: error.message }), { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { bandeira, modalidade, taxaPercentual } = await request.json();
    
    if (!bandeira || !modalidade || taxaPercentual == null) {
      return new Response(JSON.stringify({ error: 'Faltam campos obrigatórios: bandeira, modalidade ou taxaPercentual' }), { status: 400 });
    }

    const updatedTaxa = await prisma.taxaCartao.update({
      where: {
        bandeira_modalidade: {
          bandeira: bandeira,
          modalidade: modalidade,
        },
      },
      data: {
        taxaPercentual: parseFloat(taxaPercentual),
      },
    });

    return new Response(JSON.stringify(updatedTaxa), { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar taxa:', error);
    return new Response(JSON.stringify({ error: 'Erro ao atualizar taxa', details: error.message }), { status: 500 });
  }
}

// export async function DELETE(request) {
//   try {
//     const { bandeira, modalidade } = await request.json();

//     if (!bandeira || !modalidade) {
//       return new Response(JSON.stringify({ error: 'Faltam campos obrigatórios: bandeira ou modalidade' }), { status: 400 });
//     }

//     await prisma.taxaCartao.delete({
//       where: {
//         bandeira_modalidade: {
//           bandeira: bandeira,
//           modalidade: modalidade,
//         },
//       },
//     });

//     return new Response(JSON.stringify({ message: 'Taxa deletada com sucesso' }), { status: 200 });
//   } catch (error) {
//     console.error('Erro ao deletar taxa:', error);
//     return new Response(JSON.stringify({ error: 'Erro ao deletar taxa', details: error.message }), { status: 500 });
//   }
// }