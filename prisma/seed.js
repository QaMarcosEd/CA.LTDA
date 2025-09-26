import { PrismaClient, Genero, Modelo } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Limpando tabela de produtos...')
  await prisma.produto.deleteMany() // limpa todos os registros antes de inserir novos

  const marcas = ['Mississipi', 'Constance', 'Modare', 'Olympikus', 'Moleca']
  const cores = ['Preto', 'Branco', 'Vermelho', 'Azul', 'Rosa', 'Marrom']
  const modelos = Object.values(Modelo)
  const generos = Object.values(Genero)

  // Função pra gerar data aleatória entre 01/01/2024 e 24/09/2025
  function gerarDataAleatoria() {
    const start = new Date('2024-01-01')
    const end = new Date('2025-09-24')
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    return date.toISOString().split('T')[0] // Formato YYYY-MM-DD
  }

  const produtos = []

  for (const marca of marcas) {
    // Simula uma data de recebimento por marca (como se fosse um lote)
    const dataRecebimento = gerarDataAleatoria()
    
    for (let tamanho = 33; tamanho <= 44; tamanho++) {
      for (let i = 0; i < 2; i++) {
        const modelo = modelos[Math.floor(Math.random() * modelos.length)]
        const genero = generos[Math.floor(Math.random() * generos.length)]
        const cor = cores[Math.floor(Math.random() * cores.length)]
        const quantidade = Math.floor(Math.random() * 4) + 1
        const preco = parseFloat((Math.random() * 200 + 50).toFixed(2))

        produtos.push({
          nome: `${marca} ${modelo} ${tamanho}`,
          tamanho,
          referencia: `${marca.slice(0, 3).toUpperCase()}-${tamanho}-${i + 1}`,
          cor,
          quantidade,
          preco,
          genero,
          modelo,
          marca,
          disponivel: quantidade > 0,
          lote: `Lote-${marca.slice(0, 3).toUpperCase()}-${tamanho}-${i + 1}`,
          dataRecebimento: new Date(dataRecebimento), // Usa a mesma data por marca
        })
      }
    }
  }

  console.log(`👟 Criando ${produtos.length} produtos...`)

  for (const produto of produtos) {
    await prisma.produto.create({ data: produto })
  }

  console.log('✅ Seed finalizado!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
  