import { UserRole } from "@/types/role";

export const ROLE_PERMISSIONS = {
  admin: {
    arquivos: true,
    usuarios: true,
  },
  cliente: {
    arquivos: true,
    usuarios: false,
  },
} as const;

export type Permission = keyof typeof ROLE_PERMISSIONS.admin;

export function hasPermission(role: UserRole, permission: Permission) {
  return ROLE_PERMISSIONS[role][permission];
}