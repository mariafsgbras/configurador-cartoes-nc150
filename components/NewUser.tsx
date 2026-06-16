'use client';
import { useEffect, useState } from "react";

type NewUserProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function NewUserModal({
  open,
  title,
  message,
  confirmText = 'Copiar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}: NewUserProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uuidCriado, setUuidCriado] = useState('');
  const [error, setError] = useState("");

  const [creating, setCreating] = useState(false);

  function cancelar() {
    setEmail('');
    setPassword('');
    onCancel();
  };
  
  useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
    }
  }, [open]);

  async function createAccount() {
    try {
        setCreating(true);
        const res = await fetch("/api/usuarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error);
        }

        setUuidCriado(data.uuid);
        onConfirm();
    } catch (err: any) {
        setError(err.message);
    } finally {
        setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-[#0f1720] rounded-lg w-full max-w-md p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-grey-600 mb-2">
          {title}
        </h2>

        <p className="text-sm text-gray-300 mb-6">
          {message}
        </p>
        <div>
            <label className="block text-sm text-gray-300 mb-1 mt-2">Email</label>
            <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded border border-gray-300 text-gray-300 px-3 py-2"
                required
            />
        </div>
        <div>
            <label className="block text-sm text-gray-300 mb-1 mt-2">Senha</label>
            <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded border border-gray-300 text-gray-300 px-3 py-2"
                required
            />
        </div>

        {error && (
            <p className="text-red-500 text-sm mt-2">
                {error}
            </p>
        )}
        <button
          disabled={!email || !password}
          className="w-full bg-[#3f7a49] text-white p-2 rounded disabled:opacity-50 mt-4 mb-4 hover:bg-green-700"
          onClick={createAccount}
        >
          {creating ? 'Criando...' : 'Criar conta'}
        </button>

        {uuidCriado && (
          <div style={{ marginTop: '1rem' }}
            className="bg-[#0a1628] border border-gray-700 rounded-lg px-4 py-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Token
              </span>
            </div>
            <code className="block font-mono text-sm text-gray-200 break-all leading-relaxed">
              {uuidCriado}
            </code>
          </div>
        )}
        
        <div className="flex justify-end gap-3 mt-4">

          <button
            onClick={cancelar}
            className="px-4 py-2 rounded border text-gray-500 hover:bg-gray-700 disabled:opacity-50"
          >
            {cancelText}
          </button>
        </div>      
      </div>
    </div>
  );
}