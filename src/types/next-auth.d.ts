import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      profile?: any
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: string
    profile?: any
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    profile?: any
  }
}