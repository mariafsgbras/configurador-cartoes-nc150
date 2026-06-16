import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session){
    return NextResponse.json(
      { error: "Não autenticado"},
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 20);
  const search = searchParams.get('search');

  const offset = (page - 1) * limit;

  let baseQuery = `FROM usuarios u`;

  const whereClauses: string[] = [];
  const params: any[] = [];

  if (search && search.trim() !=='') {
    whereClauses.push(`
      (
        u.id LIKE ? OR
        u.email LIKE ?
      )
    `);

    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  const whereSQL = whereClauses.length
    ? ' WHERE ' + whereClauses.join(' AND ')
    : '';

  const [countRows]: any = await db.query(
    `SELECT COUNT(*) as total ${baseQuery} ${whereSQL}`,
    params
  );

  const total = countRows[0].total;

  const [rows] = await db.query(`
    SELECT 
      u.id,
      u.email,
      u.uuid
    ${baseQuery}
    ${whereSQL}
    ORDER BY u.id ASC
    LIMIT ? OFFSET ?
    `,
    [...params, limit, offset]
  );
  
  return NextResponse.json({
    data: rows,
    total,
    page,
    limit,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const [existing]: any = await db.query(
      "SELECT id FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 409 }
      );
    }

    const senhaHash = await bcrypt.hash(password, 10);

    const [result]: any = await db.execute(
      `
      INSERT INTO usuarios
      (email, senha_hash)
      VALUES (?, ?)
      `,
      [email, senhaHash]
    );

    const [rows]: any = await db.query(
      `
      SELECT uuid
      FROM usuarios
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    return NextResponse.json({
      ok: true,
      uuid: rows[0]?.uuid,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}