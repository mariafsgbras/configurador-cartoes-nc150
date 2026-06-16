'use client';

import Image from 'next/image';
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Usuário ou senha inválidos");
    } else {
      router.push("/arquivos");
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1720] font-sans flex flex-col">
      {/*<header className="h-14 bg-[#3f7a49] flex items-center px-6 text-white font-semibold">
        Cadastro de Cartões NC-150
      </header>*/}

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-20 items-center">

          <div className="flex justify-center">
            <Image src="/logo-nc150.png" alt="SGBras" width={420} height={420} priority />
          </div>

          <div>
            <h1 className="text-3xl font-semibold textwhite-800 mb-8">
              Cadastro de Cartões NC-150
            </h1>
            <form onSubmit={handleLogin} className="space-y-4 max-w-sm">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded border border-gray-300 text-gray-500 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded border border-gray-300 text-gray-500 px-3 py-2"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                disabled={loading}
                className="w-full bg-[#3f7a49] text-white p-2 rounded disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}