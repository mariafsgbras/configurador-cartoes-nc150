'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function Topbar() {
  const router = useRouter();

  return (
    <header className="h-14 bg-[#151f2f] flex items-center justify-between px-4 text-white">
      <div className="flex">
        <Image
          src="/logo-nc150.png"
          alt="SGBras"
          width={25}
          height={25}
          priority
        />
        <div className="font-semibold pl-4">
          Cadastro de Cartões NC-150
        </div>
      </div>
    </header>
  );
}
