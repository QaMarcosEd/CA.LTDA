import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

async function createAdmin() {
  const prisma = new PrismaClient()
  
  try {
    // Verifica se já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { name: 'Diana' }
    })
    
    if (existingAdmin) {
      console.log('✅ FUNCIONARIO já existe: Diana')
      return
    }
    
    // Cria ADMIN
    const hashedPassword = await hash('diana2380', 12)
    
    await prisma.user.create({
      data: {
        name: 'Diana',
        password: hashedPassword,
        role: 'FUNCIONARIO'
      }
    })
    
    console.log('🎉 ADMIN criado com sucesso!')
    console.log('👤 Nome: Diana')
    console.log('🔐 Senha: diana2380')
    console.log('⚠️  NUNCA compartilhe essa senha!')
    
  } catch (error) {
    console.error('❌ Erro ao criar FUNCIONARIO:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()