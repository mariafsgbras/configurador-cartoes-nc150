import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const body = await req.json();

  if (body.resetPassword) {
    const senhaHash = await bcrypt.hash("123456", 10);

    await db.query(
      "UPDATE usuarios SET senha_hash = ? WHERE id = ?",
      [senhaHash, id]
    );
  }

  if (body.inactiveUser !== undefined) {
    await db.query(
      "UPDATE usuarios SET ativo = ? WHERE id = ?",
      [body.inactiveUser ? 0 : 1, id]
    );
  }

  return NextResponse.json({
    ok: true,
  });
}