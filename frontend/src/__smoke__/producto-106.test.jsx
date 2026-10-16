// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

/*
  «Producto» con las piezas comunes (#106), como en MultiCRM: fuera la copia
  local de Field y la de la clase de los campos (`smallInput`), las áreas de
  texto con la clase común, «Datos del programa» que ya no se estruja en dos
  columnas en el móvil, y los avisos dicen en qué campo está el problema, en
  español.
*/

const avisos = vi.hoisted(() => ({ toast: vi.fn() }));
vi.mock('@/shared/hooks/useToast', () => ({ toast: avisos.toast }));
vi.mock('@/shared/components/ui/portal', () => ({ default: ({ children }) => children }));
vi.mock('@/shared/hooks/useDialogA11y', () => ({ useEscapeKey: () => {} }));
vi.mock('@/shared/components/ui/useConfirm', () => ({ useConfirm: () => vi.fn() }));
vi.mock('@/contexts/ProjectContext', () => ({ useProjectContext: () => ({ activeProject: { id: 1, producto_label: 'Curso' } }) }));
vi.mock('@/shared/api/client', () => ({ default: { get: vi.fn().mockResolvedValue({ success: true, data: [] }) } }));
vi.mock('@/modules/products/api/products.api', () => ({
  uploadProductImage: vi.fn(), deleteProductImage: vi.fn(), getProductImageUrl: vi.fn(),
}));

import ProductFormDialog from '@/modules/products/components/ProductFormDialog';
import { productSchema } from '@/modules/products/validation/product.schema';

const abrir = async () => {
  const r = render(<ProductFormDialog open onClose={vi.fn()} product={null} onSubmit={vi.fn()} />);
  await act(async () => { await Promise.resolve(); });
  return r;
};

describe('Producto (#106)', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => cleanup());

  it('todos los campos con la clase común y un nombre que dice qué son', async () => {
    const { container } = await abrir();
    const campos = [...container.querySelectorAll('input:not([type=file]), textarea')];
    expect(campos.length).toBeGreaterThan(15);
    for (const c of campos) {
      expect(c.className).toMatch(/bg-muted\/50/);
      expect(c.getAttribute('aria-label')).toBeTruthy();
    }
  });

  it('el Field común: el nombre se marca obligatorio sin asterisco en el texto', async () => {
    await abrir();
    expect(screen.queryByText('Nombre *')).toBeNull();
    expect(screen.getByText('(obligatorio)')).toBeInTheDocument();
  });

  it('«Datos del programa» se apila en el móvil (antes, dos columnas a 390 px)', async () => {
    await abrir();
    const fila = screen.getByLabelText('Horas').closest('div.min-w-0').parentElement;
    expect(fila.className).toMatch(/grid-cols-1 sm:grid-cols-2/);
  });

  it('el aviso dice en qué campo está el problema, y en español', async () => {
    const { container } = await abrir();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Máster TCC' } });
    fireEvent.change(screen.getByLabelText('Nº módulos'), { target: { value: '-2' } });
    await act(async () => { fireEvent.submit(container.querySelector('form')); });
    await waitFor(() => expect(avisos.toast).toHaveBeenCalledWith(expect.objectContaining({
      description: 'Nº módulos: Escribe un número entero, 0 o mayor',
    })));
  });

  it('el esquema ya no dice «Invalid input» ni «>= 0»', () => {
    const r = productSchema.safeParse({ nombre: 'Máster', precio: -1, plazas_totales: -3 });
    const msgs = r.error.issues.map((i) => i.message);
    expect(msgs).toContain('El precio no puede ser negativo');
    expect(msgs).toContain('Escribe un número entero, 0 o mayor');
    expect(msgs.join(' ')).not.toMatch(/Invalid input|>=/);
  });
});
