// Calcula la prioridad visual de un lead segun su estado, recordatorios y dias inactivos.
// Resultado: { tone, label, dotClass, borderClass }
import type { Lead } from '@/shared/types';
import { yaPaso } from '@/shared/lib/fechas';

export type Priority = 'overdue' | 'urgent' | 'fresh' | 'inProgress' | 'won' | 'lost' | 'normal';

export interface PriorityStyle {
  label: string;
  dotClass: string;
  borderClass: string;
  rowBgClass: string;
}

const PRIORITY_STYLES: Record<Priority, PriorityStyle> = {
  overdue: {
    label: 'Vencido',
    dotClass: 'bg-red-500',
    borderClass: 'border-l-red-500',
    rowBgClass: 'hover:bg-red-50/30 dark:hover:bg-red-950/20',
  },
  urgent: {
    label: 'Urgente',
    dotClass: 'bg-amber-500',
    borderClass: 'border-l-amber-500',
    rowBgClass: 'hover:bg-amber-50/30 dark:hover:bg-amber-950/20',
  },
  fresh: {
    label: 'Nuevo',
    dotClass: 'bg-blue-500',
    borderClass: 'border-l-blue-500',
    rowBgClass: '',
  },
  inProgress: {
    label: 'En curso',
    dotClass: 'bg-emerald-500',
    borderClass: 'border-l-emerald-500',
    rowBgClass: '',
  },
  won: {
    label: 'Convertido',
    dotClass: 'bg-violet-500',
    borderClass: 'border-l-violet-500',
    rowBgClass: '',
  },
  lost: {
    label: 'No interesado',
    dotClass: 'bg-zinc-400',
    borderClass: 'border-l-zinc-300 dark:border-l-zinc-700',
    rowBgClass: '',
  },
  normal: {
    label: 'Normal',
    dotClass: 'bg-zinc-300 dark:bg-zinc-600',
    borderClass: 'border-l-transparent',
    rowBgClass: '',
  },
};

export function getLeadPriority(lead: Partial<Lead> | null | undefined): Priority {
  if (!lead) return 'normal';
  const estado = lead.estado || lead.status;

  // Recordatorio vencido tiene prioridad maxima
  if (lead.next_reminder_at) {
    // Un DATE: vence cuando su día ya pasó, no a las 20:00 del anterior (15/10).
    if (yaPaso(lead.next_reminder_at)) return 'overdue';
  }

  // Estados terminales
  if (estado === 'convertido') return 'won';
  if (estado === 'no_interesado') return 'lost';

  // Inactividad sobre estados activos (nuevo, por_contactar, en_seguimiento)
  const dias = Number(lead.dias_inactivo || 0);
  const isActive = estado === 'nuevo' || estado === 'por_contactar' || estado === 'en_seguimiento';
  if (isActive && dias >= 3) return 'urgent';

  // Activos con poca antiguedad
  if (estado === 'nuevo' || estado === 'por_contactar') return 'fresh';
  if (estado === 'contactado' || estado === 'en_seguimiento') return 'inProgress';

  return 'normal';
}

export function getPriorityStyle(priority: Priority | string): PriorityStyle {
  return PRIORITY_STYLES[priority as Priority] || PRIORITY_STYLES.normal;
}
