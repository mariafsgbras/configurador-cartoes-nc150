'use client';

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import toast from 'react-hot-toast';

export default function UserPage() {
  const { data: session } = useSession();

  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-500">Carregando...</p>
      </Layout>
    );
  }

  async function handleSave() {
    if (!senhaAtual || !novaSenha) {
      toast.error("Preencha todos os campos!");
      return;
    }
    try {
      setSaving(true);

      const res = await fetch(`/api/alterar-senha/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });

      if (!res.ok) {
        throw new Error('Erro ao alterar senha');
      }

      toast.success('Alterações salvas com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-xl font-semibold text-gray-700">
            Alterar senha
          </h1>
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Senha Atual</label>
        <input
            type="password"
            value={senhaAtual}
            onChange={e => setSenhaAtual(e.target.value)}
            className="rounded border border-gray-300 text-gray-500 px-3 py-2"
            required
        />
        <label className="block text-sm text-gray-600 mb-1 mt-2">Nova Senha</label>
        <input
            type="password"
            value={novaSenha}
            onChange={e => setNovaSenha(e.target.value)}
            className="rounded border border-gray-300 text-gray-500 px-3 py-2"
            required
        />
        <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#3f7a49] text-white p-2 rounded disabled:opacity-50 mb-2"
        >
            {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </Layout>
  );
}