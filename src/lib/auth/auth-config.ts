import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authConfig: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null

        // Demo users (replace with DB)
        const demoUsers = [
          {
            email: "superadmin@example.com",
            password: "superadmin123",
            user: { id: "0", name: "Super Admin", role: "super_admin", department: "super-admin" },
          },
          {
            email: "admin@example.com",
            password: "admin123",
            user: { id: "1", name: "Admin", role: "admin", department: "admin" },
          },
          {
            email: "doctor@example.com",
            password: "doctor123",
            user: { id: "2", name: "Doctor", role: "doctor", department: "doctor" },
          },
          {
            email: "sales@example.com",
            password: "sales123",
            user: { id: "4", name: "Sales", role: "sales", department: "sales" },
          },
          {
            email: "marketing@example.com",
            password: "marketing123",
            user: { id: "5", name: "Marketing", role: "marketing", department: "marketing" },
          },
          {
            email: "finance@example.com",
            password: "finance123",
            user: { id: "6", name: "Finance", role: "finance", department: "finance" },
          },
          {
            email: "service@example.com",
            password: "service123",
            user: { id: "7", name: "Service", role: "service", department: "service" },
          },
          {
            email: "pharmacy@example.com",
            password: "pharmacy123",
            user: { id: "8", name: "Pharmacy", role: "pharmacist", department: "pharmacy" },
          },
          {
            email: "dietitian@example.com",
            password: "dietitian123",
            user: { id: "9", name: "Dietitian", role: "dietitian", department: "dietitian" },
          },
          {
            email: "physio@example.com",
            password: "physio123",
            user: { id: "10", name: "Physio", role: "physio", department: "physio" },
          },
          {
            email: "patient@example.com",
            password: "patient123",
            user: { id: "3", name: "Patient", role: "patient", department: "portal" },
          },
        ]

        const match = demoUsers.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        )

        if (match) {
          return {
            ...match.user,
            email: match.email,
          } as any
        }

        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        ;(token as any).role = (user as any).role
        ;(token as any).department = (user as any).department
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).role = (token as any).role
        ;(session.user as any).department = (token as any).department
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
  },
}
