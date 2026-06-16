'use client';
import { useEffect, useState } from "react";
import { MdOutlineContentCopy } from 'react-icons/md';
import { Toast } from "./Toast";

type CommandModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  archive: string;
  date: string;
  uuid: string;
  onCopy: () => void;
  onCancel: () => void;
};

export function CommandModal({
  open,
  title,
  message,
  confirmText = 'Copiar',
  cancelText = 'Fechar',
  archive,
  date,
  uuid,
  onCopy,
  onCancel,
}: CommandModalProps) {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [comando, setComando] = useState('');
  const [copyToast,setCopyToast] = useState(false);

  function generateCommand() {
    setComando(`NC150|07.7|${archive}|${uuid}|${ssid}|${password}|`);
  };

  function copy() {
    if (!comando) return;
    navigator.clipboard.writeText(comando);
    onCopy();
  };

  function cancelar() {
    setSsid('');
    setPassword('');
    setComando('');
    onCancel();
  };
  
  useEffect(() => {
    if (!open) {
      setSsid('');
      setPassword('');
      setComando('');
    }
  }, [open]);

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

        <p className="block text-sm text-gray-600 mb-1">
          Arquivo
        </p>
        <p className="w-full rounded border border-gray-600 text-gray-500 px-3 py-2">
          {archive}
        </p>

        <p className="block text-sm text-gray-600 mb-1 mt-2">
          Data
        </p>
        <p className="w-full rounded border border-gray-600 text-gray-500 px-3 py-2">
          {formatDateTime(date)}
        </p>

        <div>
          <label className="block text-sm text-gray-300 mb-1 mt-2">SSID</label>
          <input
            type="text"
            value={ssid}
            onChange={e => setSsid(e.target.value)}
            className="w-full rounded border border-gray-300 text-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1 mt-2">Senha</label>
          <input
            type="text"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded border border-gray-300 text-gray-300 px-3 py-2"
            required
          />
        </div>

        <button
          disabled={!ssid || !password}
          className="w-full bg-[#3f7a49] text-white p-2 rounded disabled:opacity-50 mt-4 mb-4 hover:bg-green-700"
          onClick={generateCommand}
        >
          Gerar comando
        </button>

        {comando && (
          <div style={{ marginTop: '1rem' }}
            className="bg-[#0a1628] border border-gray-700 rounded-lg px-4 py-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Comando gerado
              </span>
              <button
                onClick={copy}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white border border-gray-600 rounded px-2 py-1 transition-colors"
              >
                <MdOutlineContentCopy size={13} />
                Copiar
              </button>
            </div>
            <code className="block font-mono text-sm text-gray-200 break-all leading-relaxed">
              {comando}
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

          {/*<button
            onClick={copy}
            disabled={!comando}
            className={'px-4 py-2 rounded text-white bg-blue-500 hover:bg-blue-700 disabled:opacity-50'}
          >
            Copiar
          </button>*/}
        </div>     
        <Toast
          show={copyToast}
          message={'Comando copiado!'}
        />   
      </div>
    </div>
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