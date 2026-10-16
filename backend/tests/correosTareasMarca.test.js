import { describe, it, expect, vi, beforeEach } from 'vitest';

// Diego, 12/10, viendo «CRM PRUEBAS <noresponder@360crm.tech>» y la cabecera «CRM» en el
// correo de una tarea de ISEIH: «no sería mejor que sea tipo no responder ISEIH, y sea
// desde el branding». Los correos del tablero llevan la marca del campus de la tarea.
//
// En ISEIE (paridad, 15/10) lo mismo, y lo que no tiene campus sale con la marca de
// ISEIE —como el resto de correos de este CRM—, no con un «CRM» a secas.

const enviados = [];
vi.mock('../src/shared/services/brevo.service.js', () => ({
  sendEmail: vi.fn(async (args) => { enviados.push(args); return { sent: true }; }),
}));
vi.mock('../src/shared/config/db.js', () => ({
  query: vi.fn(async (sql, p) => (/FROM projects WHERE id = \$1/.test(sql) && p[0] === 10
    ? { rows: [{ id: 10, nombre: 'ISEIE', slug: 'iseie', logo_url: null, emoji: null }] }
    : { rows: [] })),
}));

const E = await import('../src/modules/tasks/tasks.emails.js');
const persona = { id: 3, nombre: 'Diego', email: 'diego@ejemplo.com' };
const quien = { nombre: 'Admin Principal' };

beforeEach(() => { enviados.length = 0; process.env.TAREAS_CORREOS_ACTIVOS = 'true'; });

describe('el correo de una tarea va con la marca de su campus', () => {
  it('asignada: cabecera con el logo y el nombre del campus, y sale por su cuenta con su nombre', async () => {
    await E.enviarCorreoAsignada({ persona, quien, tarea: { id: 65, title: 'Revisar diplomas', priority: 'alta', project_id: 10, project_name: 'ISEIE' } });
    const c = enviados[0];
    expect(c.projectId).toBe(10);
    expect(c.fromName).toBe('ISEIE');
    expect(c.htmlContent).toMatch(/CRM de ISEIE/);
    // En ISEIE los logos están en la raíz del frontal, no en /projects.
    expect(c.htmlContent).toMatch(/\/iseie-icon-192\.png/);
  });
  it('devuelta, cerrada y comentario, igual', async () => {
    const tarea = { id: 66, title: 'T', priority: 'media', project_id: 10 };
    await E.enviarCorreoDevuelta({ persona, quien, tarea, comentario: 'Falta el H1' });
    await E.enviarCorreoCerrada({ persona, quien, tarea });
    await E.enviarCorreoComentario({ persona, quien, tarea, comentario: 'Hola', commentId: 9 });
    expect(enviados.map((c) => [c.projectId, c.fromName])).toEqual([[10, 'ISEIE'], [10, 'ISEIE'], [10, 'ISEIE']]);
    expect(enviados.every((c) => /CRM de ISEIE/.test(c.htmlContent))).toBe(true);
  });
  it('sin campus (o de un proyecto propio): sale por la cuenta del CRM, con la marca de ISEIE', async () => {
    await E.enviarCorreoAsignada({ persona, quien, tarea: { id: 67, title: 'Opynio', priority: 'baja', project_id: null, external_project_id: 2 } });
    expect(enviados[0].projectId).toBeNull();
    expect(enviados[0].fromName).toBeUndefined();
    expect(enviados[0].htmlContent).toMatch(/CRM de ISEIE/);
  });
  it('el correo de cada mañana, también con la marca de ISEIE', () => {
    const c = E.armarCorreoDelDia({
      persona, hoy: new Date('2026-10-15T08:00:00Z'),
      tareas: [{ id: 1, title: 'Hoy', status: 'en_curso', due_date: '2026-10-15T10:00:00Z' }],
    });
    expect(c.htmlContent).toMatch(/CRM de ISEIE/);
  });
  it('con los correos apagados no sale nada', async () => {
    process.env.TAREAS_CORREOS_ACTIVOS = '';
    const r = await E.enviarCorreoAsignada({ persona, quien, tarea: { id: 68, title: 'X', priority: 'baja', project_id: 10 } });
    expect(r.simulated).toBe(true);
    expect(enviados).toHaveLength(0);
  });
});
