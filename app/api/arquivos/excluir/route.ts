import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { unlink } from "fs/promises";
import path from "path";

import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await req.json();

  const [rows]: any = await db.query(
    `
    SELECT id, path_interno
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

  try {
    const filePath = path.join(
      process.cwd(),
      arquivo.path_interno.replace(/^\/+/, "")
    );

    await unlink(filePath);
  } catch {
    // ignora se o arquivo físico não existir
  }

  await db.execute(
    "DELETE FROM arquivos_cartoes WHERE id = ?",
    [id]
  );

  return NextResponse.json({ ok: true });
}