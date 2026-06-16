'use client';

import { useEffect, useState } from "react";
import { NewUserModal } from "@/components/NewUser";
import { Layout } from "@/components/Layout";
import { Toast } from "@/components/Toast";
import { ResetPasswordModal } from "@/components/ResetPassword";
import { useSession } from "next-auth/react";
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  uuid: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [newUserModal, setNewUserModal] = useState(false);
  const [createdToast, setCreatedToast] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [reseting, setReseting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm]);

  async function fetchUsers() {
    setLoading(true);

    const res = await fetch(`/api/usuarios?page=${page}&limit=${limit}&search=${searchTerm}`);

    const data = await res.json();

    setUsers(data.data);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const usersCount = total;

  function countLabel() {
    if (usersCount === 1) {
        return 'usuário';
    } else {
        return 'usuários';      
    }
  };

  async function handleResetPassword() {
    if (!session) return;

    try {
      setReseting(true);
      
      const res = await fetch(`/api/usuarios/${selectedUser?.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resetPassword: true,
        }),
      });

      if (!res.ok) throw new Error();

      setShowResetModal(false);
      toast.success('Senha resetada com sucesso!');
    } catch {
      toast.error("Erro ao redefinir senha.");
    } finally {
      setReseting(false);
    }
  };

  useEffect(() => {
    if (session && session.user.role === 'cliente') {
        router.replace('/arquivos');
    }
  }, [session]);

  return (
    <Layout>
      <div className="w-full h-full">
        <div className="bg-[#051321] border border-gray-700 rounded-lg p-6 min-h-[700px]">
            <div className="bg-[#10203d] px-4 py-3 rounded-t-md flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">
                    Usuários
                </h1>
                <div className="flex gap-3">
                <button 
                    className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
                    onClick={() => setNewUserModal(true)}
                >
                    Novo
                </button>
                </div>
            </div>

            <p className="text-sm text-gray-600 mt-2">
                {usersCount} {countLabel()}
            </p>

            <div className="space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[250px]">
                        <input
                            type="text"
                            placeholder="Buscar usuário"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 text-gray-500 rounded border focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4">
                {loading ? (
                    <p className="text-gray-400">Carregando usuários...</p>
                ) : (
                    <table className="w-full text-left table-fixed justify-between">
                        <thead>
                            <tr className="text-gray-500 text-sm uppercase">
                                <th className="px-4 w-[5%]">ID</th>
                                <th className="px-4 pb-3 w-2/5">Email</th>
                                <th className="px-4 pb-3 w-2/5">Token</th>
                                <th className="w-[15%]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="h-12 text-gray-300"
                                >
                                    <td className="px-4 whitespace-nowrap truncate">{user.id}</td>
                                    <td className="px-4 whitespace-nowrap truncate max-w-[160px]">{user.email}</td>
                                    <td className="px-4 whitespace-nowrap truncate max-w-[160px]">{user.uuid}</td>
                                    <td className='py-2'>
                                        <button 
                                            className="px-6 py-2 rounded bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
                                            onClick={() => { 
                                                setSelectedUser(user);
                                                setShowResetModal(true);
                                            }}
                                        >
                                            Resetar senha
                                        </button>                 
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>  
                )}
            </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
            className="px-4 py-2 bg-[#10203d] rounded text-white disabled:opacity-50"
          >
            Anterior
          </button>

          <span className="text-gray-400">
            Página {page} de {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(prev => prev + 1)}
            className="px-4 py-2 bg-[#10203d] rounded text-white disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
        <NewUserModal
            open={newUserModal}
            title="Criar conta"
            message={'Informe o email e senha da conta que deseja criar. O Token do usuário será gerado automaticamente.'}
            confirmText="Criar conta"
            onConfirm={() => {
                fetchUsers();

                setCreatedToast(true);
                setTimeout(() => setCreatedToast(false), 3000);
            }}
            onCancel={() => setNewUserModal(false)}
        />
        <Toast
            show={createdToast}
            message={'Conta criada com sucesso!'}
        />
        <ResetPasswordModal
            open={showResetModal}
            title="Resetar Senha"
            message={`Deseja realmente resetar a senha do usuário ${selectedUser?.email}?`}
            confirmText="Resetar"
            loading={reseting}
            onConfirm={handleResetPassword}
            onCancel={() => setShowResetModal(false)}
        />
      </div>
    </Layout>
  );
}