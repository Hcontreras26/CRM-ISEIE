/**
 * Espejo en el servidor de `SOLO_EN_PRUEBAS` (frontend/src/shared/lib/enPruebas.js).
 *
 * Traído de MultiCRM (Diego, 07/10: «esto de tareas no va»). La pantalla de lo
 * que aún no está aprobado ya se esconde en producción, pero la API seguiría
 * contestando a quien la llamara a mano. Con esto, tampoco se monta en el
 * servidor de producción (ni sus trabajos programados).
 *
 * Está encendido:
 *   · fuera de producción (local, tests): NODE_ENV distinto de 'production';
 *   · en el entorno de pruebas: CRM_BASE_URL apunta a /staging (crm.iseie.com/staging;
 *     en MultiCRM es /testeo, y se aceptan las dos). El servidor de pruebas DEBE
 *     tenerla así, o lo que se prueba allí dejaría de responder;
 *   · o si se aprueba con su interruptor: `INTERRUPTOR=1`.
 *
 * Es una función y no una constante para que las pruebas puedan pasarle el
 * entorno que quieran.
 */
export function enPruebasOAprobado(interruptor, env = process.env) {
  if (env[interruptor] === '1') return true;
  if (env.NODE_ENV !== 'production') return true;
  return /\/(staging|testeo)(\/|$)/.test(env.CRM_BASE_URL || '');
}

/** El tablero de tareas (#210), con el mismo criterio que en MultiCRM. */
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
