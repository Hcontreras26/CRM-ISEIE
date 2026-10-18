// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';

/*
  «Usuario» (invitar y editar, en Configuración) con las piezas comunes
  (#106), como en MultiCRM: el Field compartido en cada campo (el asterisco
  iba escrito en el texto), el rol con el desplegable del CRM, la clase común
  y avisos que dicen dónde y cómo.
*/

const avisos = vi.hoisted(() => ({ toast: vi.fn() }));
vi.mock('@/shared/hooks/useToast', () => ({ toast: avisos.toast }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 1, role: 'superadmin' } }) }));
vi.mock('@/shared/components/ui/useConfirm', () => ({ useConfirm: () => vi.fn() }));
vi.mock('@/shared/pages/MarcaSection', () => ({ default: () => null }));
vi.mock('@/shared/api/client', () => ({
  default: {
    get: vi.fn((url) => Promise.resolve(url.startsWith('/users?')
      ? { success: true, data: [{ id: 4, nombre: 'Laura', email: 'laura@empresa.com', role: 'gestor', is_active: true, projects: [] }] }
      : { success: true, data: [] })),
    post: vi.fn(), patch: vi.fn(), delete: vi.fn(),
  },
}));

import SettingsPage from '@/shared/pages/SettingsPage';

const abrirPagina = async () => {
  const r = render(<MemoryRouter><SettingsPage /></MemoryRouter>);
  await act(async () => { await new Promise((ok) => setTimeout(ok, 0)); });
  return r;
};
const abrirInvitar = async () => {
  const r = await abrirPagina();
  fireEvent.click(screen.getByRole('button', { name: /Invitar usuario/ }));
  return r;
};
const abrirEditar = async () => {
  const r = await abrirPagina();
  fireEvent.click(screen.getByRole('button', { name: /^Editar$/ }));
  return r;
};

describe('Usuario (#106)', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => cleanup());

  it('invitar: el Field común, el rol con el desplegable del CRM y la clase común', async () => {
    const { container } = await abrirInvitar();
    const nombre = screen.getByLabelText(/^Nombre y apellido/);
    expect(nombre.className).toMatch(/bg-muted\/50/);
    expect(screen.getByLabelText(/^Email/).className).toMatch(/bg-muted\/50/);
    expect(screen.getByRole('combobox', { name: 'Rol' })).toBeInTheDocument();
    expect(container.querySelector('select')).toBeNull();
    // El asterisco ya no va escrito dentro del texto: lo pone el Field.
    expect(screen.queryByText('Nombre y apellido *')).toBeNull();
    expect(screen.getAllByText('(obligatorio)').length).toBeGreaterThanOrEqual(3);
  });

  it('invitar: el aviso del correo dice dónde y cómo escribirlo', async () => {
    await abrirInvitar();
    fireEvent.change(screen.getByLabelText(/^Nombre y apellido/), { target: { value: 'Ana Test' } });
    fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'ana@' } });
    fireEvent.click(screen.getByRole('button', { name: 'Invitar' }));
    expect(avisos.toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Email no válido', description: expect.stringMatching(/nombre@dominio\.com/),
    }));
  });

  // Vacío no es «demasiado corto»: falta (visto en la prueba a mano).
  it('invitar y editar: sin nombre dice «Falta el nombre»; con una letra, «demasiado corto»', async () => {
    await abrirInvitar();
    fireEvent.click(screen.getByRole('button', { name: 'Invitar' }));
    expect(avisos.toast).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Falta el nombre', description: 'Escríbelo en «Nombre y apellido».' }));
    fireEvent.change(screen.getByLabelText(/^Nombre y apellido/), { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Invitar' }));
    expect(avisos.toast).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Nombre demasiado corto' }));
    cleanup();
    await abrirEditar();
    fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(avisos.toast).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Falta el nombre', description: 'Escríbelo en «Nombre».' }));
  });

  it('editar: cada campo con su Field, y las ayudas con su campo', async () => {
    const { container } = await abrirEditar();
    expect(container.querySelector('select')).toBeNull();
    expect(screen.getByRole('combobox', { name: 'Rol' })).toBeInTheDocument();
    const ayudaDe = (campo) => campo.closest('div.min-w-0').textContent;
    expect(ayudaDe(screen.getByLabelText(/^Email/))).toMatch(/Es con lo que entra/);
    expect(ayudaDe(screen.getByLabelText('Teléfono (WhatsApp)'))).toMatch(/widget de WhatsApp/);
    expect(ayudaDe(screen.getByLabelText('Cambiar contraseña'))).toMatch(/Mínimo 8 caracteres/);
    for (const campo of container.querySelectorAll('input[type=text], input[type=email], input:not([type])')) {
      expect(campo.className).toMatch(/bg-muted\/50/);
    }
  });
});
