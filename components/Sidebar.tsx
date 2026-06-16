'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  MdExitToApp,
  MdMenu,
  MdConfirmationNumber,
  MdPerson,
} from 'react-icons/md';
import { hasPermission } from '@/config/permissions';
import { UserRole } from '@/types/role';

export function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState<boolean | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    setCollapsed(saved === 'true');
  }, []);

  useEffect(() => {
    if (collapsed !== null) {
      localStorage.setItem('sidebar-collapsed', String(collapsed));
    }
  }, [collapsed]);

  if (!session || collapsed === null) return null;

  const role = session.user.role.toLowerCase() as UserRole;

  const initial = session.user.email
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 1);

  return (
    <aside
      className={`
        bg-bg-[#0f1720] border-r
        transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
        h-full flex flex-col
      `}
    >
      <div className="h-14 flex items-center justify-between px-3 border-b shrink-0">
        {!collapsed && (
          <span className="font-semibold text-grey-700">
            Menu
          </span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 text-gray-300 rounded hover:bg-gray-100"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          <MdMenu size={22} />
        </button>
      </div>

      <div className="flex flex-col items-center px-2 py-4 border-b">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-[#3f7a49] font-bold">
          {initial}
        </div>

        {!collapsed && (
          <>
            <span className="mt-2 font-semibold text-grey-700 text-sm text-center">
              {session.user.email}
            </span>
            <span className="text-xs text-gray-500 text-center">
              {session.user.uuid}
            </span>
          </>
        )}
        {/*<button
          onClick={() => router.push('/alterar-senha')}
          className={`
            mt-4 flex items-center gap-2 text-sm text-gray-500
            hover:bg-[#3f7a49] hover:text-white rounded px-2 py-1
          `}
          title="Alterar senha"
        >
          <MdSyncLock size={18} />
          {!collapsed && 'Alterar senha'}
        </button>*/}
        <button
          onClick={async () => {
            await signOut({ redirect: false });
            router.push('/login');
          }}
          className={`
            mt-2 flex items-center gap-2 text-sm text-gray-500
            hover:bg-[#151f2f] hover:text-white rounded px-2 py-1
          `}
          title="Sair"
        >
          <MdExitToApp size={18} />
          {!collapsed && 'Sair'}
        </button>
        <p className='text-sm text-gray-300 mt-3'>
          Versão 1.0.0
        </p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {hasPermission(role, "arquivos") && 
          <MenuItem
            href="/arquivos"
            label="Arquivos"
            icon={<MdConfirmationNumber size={20} />}
            collapsed={collapsed}
          />
        }
        {hasPermission(role, "usuarios") && 
          <MenuItem
            href="/usuarios"
            label="Usuários Cadastrados"
            icon={<MdPerson size={20} />}
            collapsed={collapsed}
          />
        }
      </nav>
    </aside>
  );
}

function MenuItem({
  label,
  href,
  icon,
  collapsed,
}: {
  label: string;
  href: string;
  icon: React.ReactNode;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`
        flex items-center gap-3 px-3 py-2 rounded text-sm
        transition-colors
        ${
          isActive
            ? 'bg-[#151f2f] text-white font-semibold'
            : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
