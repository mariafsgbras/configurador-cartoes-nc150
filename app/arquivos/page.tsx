import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { hasPermission } from "@/config/permissions";
import ArquivosClient from "./ArquivosClient";

export default async function ArchivesPage() {
  const session = await getServerSession(authOptions);

  if(!session){
    redirect("/login");
  }

  if(!hasPermission(session.user.role, "arquivos")){
    redirect("/acesso-negado");
  }

  return <ArquivosClient />;
}