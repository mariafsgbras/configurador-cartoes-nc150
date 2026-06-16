//app\api\arquivos\upload\route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // busca o UUID antes de tudo
  const [rows]: any = await db.query(
    "SELECT uuid FROM usuarios WHERE id = ? LIMIT 1",
    [userId]
  );
  const userUuid = rows[0]?.uuid;
  if (!userUuid) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const fileName = file.name;

  const [existing]: any = await db.query(
    `
    SELECT id
    FROM arquivos_cartoes
    WHERE usuario_uuid = ?
      AND nome_arquivo = ?
    LIMIT 1
    `,
    [userUuid, fileName]
  );

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Já existe um arquivo com esse nome." },
      { status: 409 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.env.UPLOAD_DIR ?? "uploads", userUuid);
  await mkdir(uploadDir, { recursive: true });

  await writeFile(path.join(uploadDir, fileName), buffer);

  const internalPath = `/uploads/${userUuid}/${fileName}`;

  await db.execute(
    "INSERT INTO arquivos_cartoes (usuario_uuid, nome_arquivo, path_interno, origem) VALUES (?, ?, ?, 'S')",
    [userUuid, fileName, internalPath]
  );

  return NextResponse.json({ ok: true });
};