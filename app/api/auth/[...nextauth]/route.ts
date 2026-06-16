import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password){
          console.log("❌ Email ou senha não vieram");
          return null;
        }

        const [rows]: any = await db.query(`
          SELECT u.*
          FROM usuarios u
          WHERE u.email = ?
          LIMIT 1
        `, [credentials.email]);

        const usuario = rows[0];
        if (!usuario) {
          console.log("❌ Usuário não encontrado");
          return null;
        }

        const senhaValida = await bcrypt.compare(
          credentials.password,
          usuario.senha_hash
        );

        console.log("SENHA VÁLIDA?", senhaValida);

        if (!senhaValida){
          console.log("❌ Senha inválida");
          return null;
        } 

        if (usuario.ativo !== 1) {
          console.log("❌ Usuário inativo");
          return null;
        }

        return {
          id: usuario.id.toString(),
          email: usuario.email,
          role: usuario.role as "admin" | "cliente",
          uuid: usuario.uuid,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.email = user.email;
        token.uuid = (user as any).uuid;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as any;
      session.user.email = token.email as string;
      session.user.uuid = token.uuid as string;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };