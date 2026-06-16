'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Layout } from "@/components/Layout";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useRef } from "react";
import { Toast } from "@/components/Toast";
import { CommandModal } from "@/components/Command";
import { useSession } from "next-auth/react";

export type Archive = {
  id: number;
  name: string;
  date: string;
  origin: Origin;
};

export type Origin = 'S' | 'L';

export default function ArquivosPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [archives, setArchives] = useState<Archive[]>([]);
  const [archive, setArchive] = useState<Archive | null>(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [page, setPage] = useState(Number(searchParams.get('page') ?? 1));
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [deleteToast, setDeleteToast] = useState(false);
  const [copyToast,setCopyToast] = useState(false);
  const [downloadToast, setDownloadToast] = useState(false);
  
  async function loadarchives() {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const res = await fetch(`/api/arquivos?${params}`);
    const result = await res.json();

    const mappedArchives: Archive[] = result.data.map((item: any) => ({
      id: item.id,
      name: item.nome,
      date: item.data,
      origin: item.origem,
    }));

    setArchives(mappedArchives);
    setTotal(result.total);
    setLoading(false);
  };

  useEffect(() => {
    loadarchives();
    const interval = setInterval(() => {
      loadarchives();
    }, 300000);

    return () => clearInterval(interval);
  }, [page]);

  async function handleDeleteArchive() {
    try {
      setDeleting(true);

      const res = await fetch(`/api/arquivos/excluir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: archive?.id,
        }),
      });

      if (!res.ok) throw new Error();

      setShowDeleteModal(false);
      setDeleteToast(true);
      await loadarchives();
      setTimeout(() => setDeleteToast(false), 3000);
    } catch {
      alert('Erro ao excluir arquivo');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const archivesCount = total;

  function countLabel() {
    if (archivesCount === 1) {
      return 'arquivo';
    }else{
      return 'arquivos';      
    }
  };

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/arquivos/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      loadarchives(); // recarrega a tabela
    } else {
      const data = await res.json();
      alert(data.error ?? "Erro ao fazer upload");
    }
  };

  async function handleDownload(id: number) {
    setDownloading(true);
    const res = await fetch(`/api/arquivos/download?id=${id}`);

    if (!res.ok) {
      alert('Erro ao baixar arquivo');
      return;
    }

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;

    const disposition = res.headers.get('Content-Disposition');
    const fileName =
      disposition?.match(/filename="(.+)"/)?.[1] ??
      'arquivo.csv';

    a.download = fileName;

    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);

    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 3000);
    setDownloading(false);
  };

  console.log(archives);
  return (
    <Layout>
      <div className="w-full h-full">
        <div className="bg-[#051321] border border-gray-700 rounded-lg p-6 min-h-[700px]">
          <div className="bg-[#10203d] px-4 py-3 rounded-t-md flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              Arquivos
            </h1>

            <div className="flex gap-3">
              <button 
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Fazer Upload
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-2">
            {archivesCount} {countLabel()}
          </p>

          <div className="mt-4">
            {loading ? (
              <p className="text-gray-400">
                Carregando arquivos...
              </p>
            ) : (
              <table className="w-full text-left table-fixed justify-between">
                <thead>
                  <tr className="text-gray-500 text-sm uppercase"> 
                    <th className="px-4 pb-3 w-2/6">Nome do Arquivo</th>
                    <th className="pb-3 w-1/6">Origem</th>
                    <th className="pb-3 w-1/6">Data do Upload</th>
                    <th className='pb-3 w-2/6'></th>
                  </tr>
                </thead>

                <tbody>
                  {archives.map((archive) => (
                    <tr
                      key={archive.id}
                      //className="text-gray-300"
                    >
                      <td className="px-4 whitespace-nowrap truncate">
                        {archive.name}
                      </td>
                      <td className="py-2">
                        <OriginBadge status={archive.origin} />
                      </td>
                      <td className="py-2">
                        {formatDateTime(archive.date)}
                      </td>                   

                      <td className='py-2'>
                        <div className='flex justify-end items-center gap-2'>
                          <button 
                            className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm whitespace-nowrap"
                            onClick={() => { 
                              if (!session?.user?.uuid) return;
                              setArchive(archive); 
                              setShowCommandModal(true)}}
                          >
                            Gerar Comando
                          </button>
                          <button 
                            className="px-6 py-2 rounded bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
                            onClick={() => handleDownload(archive.id)}
                          >
                            {downloading ? 'Baixando...' : 'Baixar'}
                          </button>
                          <button 
                            className="px-6 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                            onClick={() => { 
                              setArchive(archive);
                              setShowDeleteModal(true);
                            }}
                          >
                            Excluir
                          </button>
                        </div>                       
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
      </div>
      <ConfirmModal
        open={showDeleteModal}
        title="Excluir arquivo"
        message={`Deseja realmente excluir o arquivo ${archive?.name}?`}
        confirmText="Excluir"
        loading={deleting}
        onConfirm={handleDeleteArchive}
        onCancel={() => setShowDeleteModal(false)}
      />
      <Toast
        show={deleteToast}
        message={`${archive?.name} excluído com sucesso!`}
      />
      <CommandModal
        open={showCommandModal}
        title="Gerar comando"
        message={`Informe o SSID e senha da rede Wifi que o leitor irá se conectar.`}
        confirmText="Copiar"
        archive={archive?.name ?? ''}
        date={archive?.date ?? ''}
        uuid={session?.user.uuid ?? ''}
        onCopy={() => {
          setCopyToast(true);
          setTimeout(() => setCopyToast(false), 3000);
        }}
        onCancel={() => setShowCommandModal(false)}
      />
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <Toast
        show={copyToast}
        message={'Comando copiado!'}
      />
      <Toast
        show={downloadToast}
        message={'Arquivo baixado!'}
      />
    </Layout>
  );
}

function formatDateTime(dateString?: string | null) {
  if (!dateString) return '-';

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return '-';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
}

export function OriginBadge({ status }: { status: Origin }) {
  console.log(
  "status:",
  status,
  "typeof:",
  typeof status,
  "json:",
  JSON.stringify(status)
);
  const styles = {
    'S': 'border-grey-500 text-grey-600',
    'L': 'border-green-500 text-green-600',
  };

  const label = {
    'S': 'Servidor',
    'L': 'Leitor',
  };
  return (
    <span
      className={`px-3 py-1 border rounded text-sm ${styles[status]}`}
    >
      {label[status]}
    </span>
  );
}