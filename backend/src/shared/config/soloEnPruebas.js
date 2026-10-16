/**
 * Espejo en el servidor de `SOLO_EN_PRUEBAS` (frontend/src/shared/lib/enPruebas.js).
 *
 * Lo que aún no está aprobado para producción tampoco se monta en el servidor
 * de producción (ni sus trabajos programados): el tablero de tareas (#210) y
 * las facturas de colaboradores (#202) van así en MultiCRM («esto de tareas no
 * va», Diego 07/10; revisión de la PR #293, 10/10), y aquí igual (paridad, 15/10).
 *
 * Está encendido:
 *   · fuera de producción (local, tests): NODE_ENV distinto de 'production';
 *   · en /staging: CRM_BASE_URL apunta a /staging (el servidor de pruebas de
 *     ISEIE DEBE tenerla así, o lo que se prueba en /staging dejaría de
 *     responder); también /testeo, que es como se llama en MultiCRM;
 *   · o si se aprueba con su interruptor: TAREAS_EN_PRODUCCION=1 o
 *     FACTURAS_COLABORADOR_EN_PRODUCCION=1. El de uno no enciende el otro.
 *
 * Es una función y no una constante para que las pruebas puedan pasarle el
 * entorno que quieran.
 */
export function enPruebasOAprobado(interruptor, env = process.env) {
  if (env[interruptor] === '1') return true;
  if (env.NODE_ENV !== 'production') return true;
  return /\/(staging|testeo)(\/|$)/.test(env.CRM_BASE_URL || '');
}

/** El tablero de tareas (#210). Se aprueba con TAREAS_EN_PRODUCCION=1. */
export function tareasActivas(env = process.env) {
  return enPruebasOAprobado('TAREAS_EN_PRODUCCION', env);
}

/**
 * Facturas de colaboradores (#202, Diana): tampoco en el servidor de producción
 * mientras Diego no lo apruebe — ni la API (también la del enlace público) ni la
 * tarea del mes. Revisión de la PR #293 de MultiCRM, 10/10. Se aprueba con
 * FACTURAS_COLABORADOR_EN_PRODUCCION=1.
 */
export function facturasColaboradorActivas(env = process.env) {
  return enPruebasOAprobado('FACTURAS_COLABORADOR_EN_PRODUCCION', env);
}
