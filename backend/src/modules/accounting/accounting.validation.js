import { z } from 'zod';

// Los esquemas de egresos se fueron con su modulo (`modules/expenses`, #227).

export const accountingDashboardSchema = z.object({
  projectId: z.coerce.number().int().positive().optional(),
  // Una sociedad entera. Sin esto, el panel de Finanzas solo sabia mirar un
  // campus --y con varios puestos, la pantalla mandaba el -1 y salia en blanco.
  issuerId: z.coerce.number().int().positive().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
