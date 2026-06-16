'use client';

type ResetPasswordModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loadingText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function InactiveUserModal({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loadingText,
  loading = false,
  onConfirm,
  onCancel,
}: ResetPasswordModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-[#0f1720] rounded-lg w-full max-w-md p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-500 mb-2">
          {title}
        </h2>

        <p className="text-sm text-gray-400 mb-6">
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-700"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded text-white
              ${loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}
            `}
          >
            {loading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
