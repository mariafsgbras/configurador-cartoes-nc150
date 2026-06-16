//app\api\arquivos\route.ts
import { getServerSession } from "next-auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);
  const offset = (page - 1) * limit;

  const [rows]: any = await db.query(
    `SELECT ac.id, ac.nome_arquivo AS nome, ac.criado_em AS data, ac.origem as origem
     FROM arquivos_cartoes ac
     INNER JOIN usuarios u ON u.uuid = ac.usuario_uuid
     WHERE u.id = ?
     ORDER BY ac.criado_em DESC
     LIMIT ? OFFSET ?`,
    [session.user.id, limit, offset]
  );

  const [[countRow]]: any = await db.query(
    `SELECT COUNT(*) AS total FROM arquivos_cartoes ac
     INNER JOIN usuarios u ON u.uuid = ac.usuario_uuid
     WHERE u.id = ?`,
    [session.user.id]
  );

  return NextResponse.json({ data: rows, total: countRow.total });
}