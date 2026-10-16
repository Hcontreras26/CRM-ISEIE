-- 220 · Facturas de colaboradores (#202): el rol colaborador en el ENUM
--
-- En MultiCRM es la 194 (rol colaborador, #210 fase 5; «lo comparte #202 Mi
-- factura»). Aquí va también con las facturas para que no dependan del orden en
-- que se pasen: el tablero de tareas trae la misma línea (su 208) y las dos se
-- pueden pasar en cualquier orden, o dos veces, sin romper nada.
--
-- Hace falta aunque nadie tenga todavía el rol: «Mi factura» y la ficha del
-- colaborador preguntan `users.role = 'colaborador'`, y users.role es un ENUM
-- (user_role), no texto con CHECK. Sin este valor esa consulta falla con
-- «invalid input value for enum» en vez de responder que no.
--
-- En su propio fichero y fuera de una transacción, como la 123 del tutor:
-- «ALTER TYPE ... ADD VALUE» no se puede usar en la misma transacción en la que
-- se añade el valor.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'colaborador';
