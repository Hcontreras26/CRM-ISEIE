// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SettingsPage from '@/shared/pages/SettingsPage';

afterEach(cleanup);

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, nombre: 'Super Admin', email: 'admin@iseie.com', role: 'superadmin' },
    projects: [{ id: 1, nombre: 'ISEIE Campus' }],
    logout: vi.fn(),
  }),
}));

// Mock useConfirm
vi.mock('@/shared/components/ui/useConfirm', () => ({
  useConfirm: () => vi.fn(),
}));

// Mock client
vi.mock('@/shared/api/client', () => ({
  default: {
    get: vi.fn((url) => {
      if (url.includes('/users')) {
        return Promise.resolve({
          data: [
            {
              id: 1,
              nombre: 'Usuario Con Nombre Extremadamente Largo Para Probar Scroll',
              email: 'usuario.con.correo.extremadamente.largo@empresa.com',
              role: 'gestor',
              active: true,
              empresa_ids: [1],
            },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    }),
    patch: vi.fn(() => Promise.resolve({})),
    delete: vi.fn(() => Promise.resolve({})),
  },
}));

describe('SettingsPage UsersSection scroll y responsive (#202)', () => {
  it('el contenedor de la tabla tiene overflow-x-auto para no desbordar el viewport', async () => {
    const { container } = render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const tabla = await screen.findByRole('table');
    const contenedor = tabla.closest('.overflow-x-auto');
    expect(contenedor).not.toBeNull();
  });

  it('el boton de invitar usuario no se encoge (flex-shrink-0)', async () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const boton = await screen.findByRole('button', { name: /invitar usuario/i });
    expect(boton.className).toContain('flex-shrink-0');
  });

  it('la columna Acciones es sticky right-0 con fondo solido y separacion', async () => {
    const { container } = render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    await screen.findByRole('table');
    const thAcciones = container.querySelector('th.sticky.right-0');
    expect(thAcciones).not.toBeNull();
    expect(thAcciones?.className).toContain('bg-card');

    const tdAcciones = container.querySelector('td.sticky.right-0');
    expect(tdAcciones).not.toBeNull();
    expect(tdAcciones?.className).toContain('bg-card');
  });

  it('los textos largos del usuario estan truncados dentro de bloques internos (max-w-[200px])', async () => {
    const { container } = render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    await screen.findByRole('table');
    const bloquesTruncados = container.querySelectorAll('td div.truncate');
    expect(bloquesTruncados.length).toBeGreaterThanOrEqual(2);
  });
});
