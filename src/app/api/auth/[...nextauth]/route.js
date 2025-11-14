// api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        name: { label: 'Nome de usuário', type: 'text' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.password) return null

        try {
          const user = await prisma.user.findUnique({
            where: { name: credentials.name }
          })

          if (!user) return null

          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) return null

          return {
            id: user.id.toString(),
            name: user.name,
            role: user.role, // ← GARANTA QUE É 'ADMIN'
          }
        } catch (error) {
          console.error('Erro no login:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // padrão: 8h
  },
  jwt: {
    maxAge: 8 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.maxAge = user.role === 'ADMIN' ? 15 * 60 : 8 * 60 * 60
      }
      return token
      
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      session.maxAge = token.maxAge // opcional
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }