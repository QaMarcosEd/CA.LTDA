import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

async function createAdmin() {
  const prisma = new PrismaClient()
  
  try {
    // Verifica se já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { name: 'ca.ltda' }
    })
    
    if (existingAdmin) {
      console.log('✅ ADMIN já existe: ca.ltda')
      return
    }
    
    // Cria ADMIN
    const hashedPassword = await hash('loja@2380', 12)
    
    await prisma.user.create({
      data: {
        name: 'ca.ltda',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    
    console.log('🎉 ADMIN criado com sucesso!')
    console.log('👤 Nome: ca.ltda')
    console.log('🔐 Senha: loja@2380')
    console.log('⚠️  NUNCA compartilhe essa senha!')
    
  } catch (error) {
    console.error('❌ Erro ao criar ADMIN:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()