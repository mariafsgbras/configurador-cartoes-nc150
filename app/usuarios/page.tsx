import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { hasPermission } from "@/config/permissions";
import UsuariosClient from "./UsuariosClient";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if(!session){
    redirect("/login");
  }

  if(!hasPermission(session.user.role, "usuarios")){
    redirect("/acesso-negado");
  }

  return <UsuariosClient />;
}