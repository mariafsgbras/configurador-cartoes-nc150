import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      role: "admin" | "cliente";
      uuid: string;
    };
  }

  interface User {
    role: "admin" | "cliente";
    uuid: string;
  }
}