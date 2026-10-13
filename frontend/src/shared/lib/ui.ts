/*
  Trozos de estilo que se repiten en los formularios.

  Nace con lo mínimo —la clase de un campo de texto— porque es lo que necesita
  el diálogo del proceso comercial. En el CRM hermano este fichero tiene además
  los colores e iniciales de los avatares; aquí eso ya vive en `color.ts`, así
  que no se trae para no tener lo mismo en dos sitios.
*/

export const inputClass =
  'w-full h-9 px-3 rounded-md border border-border bg-muted/50 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-card placeholder:text-muted-foreground';

/**
 * Los colores de cada categoría de egreso (#227, igual que en MultiCRM).
 *
 * Son IDENTIDAD, no semántica: distinguen alquiler de salarios, no dicen si un
 * gasto es bueno o malo. Por eso no van con los tokens del tema.
 */
export const EXPENSE_CATEGORY_COLORS = {
  salarios: 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400',
  alquiler: 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400',
  proveedores: 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400',
  software: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400',
  publicidad: 'bg-pink-100 text-pink-800 dark:bg-pink-950/30 dark:text-pink-400',
  impuestos: 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400',
  servicios: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-400',
  mantenimiento: 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400',
  otros: 'bg-muted text-muted-foreground',
  comision_pasarela_pago: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400',
  comision_gestor: 'bg-teal-100 text-teal-800 dark:bg-teal-950/30 dark:text-teal-400',
  nomina: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
} as const;
