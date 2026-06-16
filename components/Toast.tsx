'use client';

type ToastProps = {
  message: string;
  show: boolean;
};

export function Toast({ message, show }: ToastProps) {
  if (!show) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-4 py-2 rounded shadow-lg whitespace-nowrap">
      {message}
    </div>
  );
}
