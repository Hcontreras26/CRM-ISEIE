// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

/*
  «Tutor» (nuevo tutor, datos del tutor, añadir y editar formación) con las
  piezas comunes (#106), como en MultiCRM: no había ni Field ni la clase
  común, la fila de «Sus cursos» no se apilaba en el móvil (cuatro columnas
  fijas) y las ayudas iban a 11 px.
*/

vi.mock('@/shared/hooks/useToast', () => ({ toast: vi.fn() }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { role: 'superadmin' } }) }));
vi.mock('@/contexts/ProjectContext', () => ({
  useProjectContext: () => ({ activeProject: { id: 1 }, projects: [{ id: 1, nombre: 'ISEIE' }] }),
}));
vi.mock('@/shared/api/client', () => ({ default: { get: vi.fn().mockResolvedValue({ success: true, data: [] }) } }));
vi.mock('@/modules/tutores/components/Entregables', () => ({ default: () => null }));
vi.mock('@/modules/tutores/api/tutores.api', () => ({
  tutoresApi: {
    listar: vi.fn().mockResolvedValue({ success: true, data: [
      { id: 3, nombre: 'Tutora Prueba', email: 'tutora@prueba.local', iban: 'ES00', banco: 'BBVA', dni_nif: '1', telefono: '1', active: true, es_de_este_proyecto: true, formaciones: 0 },
    ] }),
    colaboraciones: vi.fn().mockResolvedValue({ success: true, data: [] }),
    ajustes: vi.fn().mockResolvedValue({ success: true, data: { aplica_desde: '2026-08-01', pct_por_defecto: 10 } }),
  },
}));

import TutoresPage from '@/modules/tutores/pages/TutoresPage';

const esperar = () => act(async () => { await new Promise((ok) => setTimeout(ok, 0)); });
const abrirPagina = async () => {
  const r = render(<TutoresPage />);
  await esperar();
  return r;
};
const elegirTutora = async () => {
  fireEvent.click(screen.getByText('Tutora Prueba'));
  await esperar();
};

describe('Tutor (#106)', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => cleanup());

  it('nuevo tutor: cada campo con el Field común, enlazado, y con la clase común', async () => {
    await abrirPagina();
    fireEvent.click(screen.getByRole('button', { name: /Nuevo tutor/ }));
    for (const nombre of [/^Nombre y apellidos/, /^Correo/, 'DNI / NIF', 'Teléfono', 'IBAN', 'Contraseña', '%', 'Lo lleva desde']) {
      expect(screen.getByLabelText(nombre).className).toMatch(/bg-muted\/50/);
    }
    expect(screen.getAllByText('(obligatorio)').length).toBeGreaterThanOrEqual(2);
  });

  it('nuevo tutor: la fila de «Sus cursos» se apila en el móvil', async () => {
    await abrirPagina();
    fireEvent.click(screen.getByRole('button', { name: /Nuevo tutor/ }));
    const fila = screen.getByLabelText('%').closest('div.min-w-0').parentElement;
    expect(fila.className).toMatch(/grid-cols-2 sm:grid-cols-\[/);
  });

  it('datos del tutor: el Field común, la ayuda con su campo y «Cobra desde» igual', async () => {
    await abrirPagina();
    await elegirTutora();
    fireEvent.click(screen.getByRole('button', { name: /Editar datos/ }));
    for (const nombre of ['Nombre', 'DNI / NIF', 'Teléfono', 'IBAN', 'Banco', 'Correo', 'Cobra desde']) {
      expect(screen.getByLabelText(nombre).className).toMatch(/bg-muted\/50/);
    }
    expect(screen.getByLabelText('IBAN').closest('div.min-w-0').textContent).toMatch(/Los espacios se quitan solos/);
  });

  it('añadir formación: porcentaje y fechas con el Field común, en fila que se apila', async () => {
    await abrirPagina();
    await elegirTutora();
    fireEvent.click(screen.getByRole('button', { name: /Añadir formación/ }));
    const pct = screen.getByLabelText(/^Porcentaje/);
    expect(pct.className).toMatch(/bg-muted\/50/);
    expect(screen.getByLabelText('Hasta').className).toMatch(/bg-muted\/50/);
    expect(pct.closest('div.min-w-0').parentElement.className).toMatch(/grid-cols-1 sm:grid-cols-3/);
  });
});
