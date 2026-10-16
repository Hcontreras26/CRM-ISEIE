import client from '@/shared/api/client';
import type { PermissionMap } from '@/shared/hooks/usePermission';

// API stub para custom_roles. El backend (CRM-228) aun no esta desplegado en
// esta rama; estos endpoints devolveran 404 hasta entonces. La pagina de
// roles los detecta y muestra disclaimer en vez de romper.

export interface CustomRole {
  id: number;
  project_id?: number;
  nombre: string;
  descripcion?: string | null;
  base_role?: string | null;
  permissions?: PermissionMap;
}

// Custom roles son globales (no por proyecto). El parámetro projectId se acepta
// por compat pero no se envía al backend.
export async function listCustomRoles(_projectId?: number): Promise<CustomRole[]> {
  const res = await client.get(`/permissions/custom-roles`);
  const data = (res as any)?.data;
  return Array.isArray(data) ? data : [];
}

/**
 * Los permisos de Tareas que se editan por rol (`admin`, `colaborador` o
 * `custom:<id>`), como mandan ahora. Los cambian superadmin y admin (Diego,
 * 08/10, #210; en ISEIE por paridad, 15/10).
 */
export async function getRolePermissions(roleKey: string): Promise<Record<string, boolean>> {
  const res = await client.get(`/permissions/role-permissions/${roleKey}`);
  return ((res?.data as { permissions?: Record<string, boolean> })?.permissions || {});
}

export async function saveRolePermissions(
  roleKey: string,
  permissions: Record<string, boolean>,
): Promise<Record<string, boolean>> {
  const res = await client.put(`/permissions/role-permissions/${roleKey}`, { permissions });
  return ((res?.data as { permissions?: Record<string, boolean> })?.permissions || permissions);
}
