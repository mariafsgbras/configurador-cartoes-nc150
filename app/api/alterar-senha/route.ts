import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { senhaAtual, novaSenha } = body;
    console.log('Body recebido:', body);

    if (!senhaAtual || !novaSenha) {
      return NextResponse.json(
        { message: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    const [rows]: any = await db.query(
      `
      SELECT id, senha_hash
      FROM usuarios
      WHERE email = ?
      LIMIT 1
      `,
      [session.user.email]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const usuario = rows[0];

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha_hash);
    if (!senhaValida) {
      return NextResponse.json(
        { message: 'Senha atual incorreta' },
        { status: 400 }
      );
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    await db.query(
      `
      UPDATE usuarios
      SET senha_hash = ?
      WHERE id = ?
      `,
      [novaSenhaHash, usuario.id]
    );

    return NextResponse.json(
      { message: 'Senha alterada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Erro ao alterar senha' },
      { status: 500 }
    );
  }
}