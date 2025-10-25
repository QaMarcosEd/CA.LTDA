// // api/auth/[...nextauth]/route.js
// import NextAuth from 'next-auth'
// import CredentialsProvider from 'next-auth/providers/credentials'
// import { PrismaClient } from '@prisma/client'
// import bcrypt from 'bcrypt'

// const prisma = new PrismaClient()

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'credentials',
//       credentials: {
//         name: { label: 'Nome de usuário', type: 'text' },
//         password: { label: 'Senha', type: 'password' }
//       },
//       async authorize(credentials) {
//         // Se não tem credenciais, erro
//         if (!credentials?.name || !credentials?.password) {
//           return null
//         }

//         try {
//           // Busca usuário no banco
//           const user = await prisma.user.findUnique({
//             where: {
//               name: credentials.name
//             }
//           })

//           // Se não existe ou senha errada
//           if (!user || !await bcrypt.compare(credentials.password, user.password)) {
//             return null
//           }

//           // Retorna usuário autenticado
//           return {
//             id: user.id,
//             name: user.name,
//             role: user.role
//           }
//         } catch (error) {
//           console.error('Erro no login:', error)
//           return null
//         }
//       }
//     })
//   ],
//   pages: {
//     signIn: '/login',  // Página custom de login
//   },
//   session: {
//     strategy: 'jwt',  // Usa JWT pra sessões
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       // Adiciona role no token quando faz login
//       if (user) {
//         token.role = user.role
//       }
//       return token
//     },
//     async session({ session, token }) {
//       // Adiciona role na sessão
//       session.user.id = token.sub
//       session.user.role = token.role
//       return session
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// }

// const handler = NextAuth(authOptions)
// export { handler as GET, handler as POST }

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
        if (!credentials?.name || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              name: credentials.name
            }
          })

          if (!user || !await bcrypt.compare(credentials.password, user.password)) {
            return null
          }

          return {
            id: user.id,
            name: user.name,
            role: user.role
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
    maxAge: 30 * 24 * 60 * 60, // 30 dias como fallback
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.maxAge = user.role === 'admin' ? 15 * 60 : 8 * 60 * 60 // 15 min pra admin, 8h pra funcionário
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub
      session.user.role = token.role
      session.expires = new Date(Date.now() + token.maxAge * 1000).toISOString()
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }