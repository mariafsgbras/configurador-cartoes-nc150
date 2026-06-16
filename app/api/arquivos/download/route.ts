import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { readFile } from "fs/promises";
import path from "path";

import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Id obrigatório" },
      { status: 400 }
    );
  }

  const [rows]: any = await db.query(
    `
    SELECT nome_arquivo, path_interno
    FROM arquivos_cartoes
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  const arquivo = rows[0];

  if (!arquivo) {
    return NextResponse.json(
      { error: "Arquivo não encontrado" },
      { status: 404 }
    );
  }

  const filePath = path.join(
    process.cwd(),
    arquivo.path_interno.replace(/^\/+/, "")
  );

  const buffer = await readFile(filePath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${arquivo.nome_arquivo}"`,
    },
  });
}