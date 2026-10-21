/*
  Trozos de estilo que se repiten en los formularios.

  Nace con lo mínimo —la clase de un campo de texto— porque es lo que necesita
  el diálogo del proceso comercial. Los colores e iniciales de los avatares
  llegaron con el tablero de tareas (#210), con el mismo nombre que en el CRM
  hermano: `avatarColorFor` y `getInitials`, al final de este fichero.
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

/**
 * La paleta de identidad: el color de un avatar (tablero de tareas, #210; la
 * misma que en MultiCRM).
 *
 * Es una excepción a «todo con tokens», y a propósito: aquí no hay significado,
 * hacen falta ocho matices que se distingan entre sí para reconocer a una
 * persona de un vistazo. Con variante clara y oscura.
 */
export const AVATAR_COLORS: ReadonlyArray<string> = [
  'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
];

/** Color estable para un avatar: el mismo id siempre pinta el mismo color. */
export function avatarColorFor(id: number): string {
  return AVATAR_COLORS[Math.abs(id) % AVATAR_COLORS.length];
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '??';
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Lo mismo, pero cuando lo que identifica es un nombre y no un número — las
 * marcas. El color sale del propio nombre, así que ISECD es verde hoy y verde
 * mañana: la memoria visual funciona porque el color no cambia.
 */
export function avatarColorForName(nombre = ''): string {
  let n = 0;
  for (const ch of String(nombre)) n = (n * 31 + ch.charCodeAt(0)) % 9973;
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}
