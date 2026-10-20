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

// ── Una clave suelta por rol y por persona: «Diplomas (Certifex) · Ver» (#223) ──

/** Una persona de un rol, con la clave como la tiene. */
export interface PersonaConClave {
  id: number;
  nombre: string;
  email: string;
  /** Su excepción: true, false, o null si tiene lo que diga su rol. */
  excepcion: boolean | null;
  /** Lo que manda al final (rol + rol a medida + excepción). */
  puede: boolean;
}

/** Si un rol (`gestor`, `soporte`… o `custom:<id>`) tiene la clave. */
export async function getClaveDeRol(clave: string, roleKey: string): Promise<boolean> {
  const res = await client.get(`/permissions/claves/${encodeURIComponent(clave)}/rol/${encodeURIComponent(roleKey)}`);
  return (res?.data as { permitido?: boolean })?.permitido === true;
}

/** Dársela o quitársela a un rol entero. Solo el superadmin. */
export async function setClaveDeRol(clave: string, roleKey: string, permitido: boolean): Promise<boolean> {
  const res = await client.put(`/permissions/claves/${encodeURIComponent(clave)}/rol/${encodeURIComponent(roleKey)}`, { permitido });
  return (res?.data as { permitido?: boolean })?.permitido === true;
}

/** Las personas de un rol (las de sus campus, si quien pregunta es admin). */
export async function personasDeLaClave(clave: string, roleKey: string): Promise<PersonaConClave[]> {
  const res = await client.get(`/permissions/claves/${encodeURIComponent(clave)}/personas?roleKey=${encodeURIComponent(roleKey)}`);
  const data = (res as { data?: unknown } | null)?.data;
  return Array.isArray(data) ? (data as PersonaConClave[]) : [];
}

/** A una persona: true (dársela), false (quitársela) o null (como su rol). Solo ESA clave. */
export async function setClaveDePersona(clave: string, userId: number, permitido: boolean | null): Promise<{ excepcion: boolean | null; puede: boolean }> {
  const res = await client.put(`/permissions/claves/${encodeURIComponent(clave)}/personas/${userId}`, { permitido });
  return res?.data as { excepcion: boolean | null; puede: boolean };
}
