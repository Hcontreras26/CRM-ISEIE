// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

/*
  «Nueva venta» (convertir un prospecto) con las piezas comunes (#106), como
  en MultiCRM: ningún desplegable del navegador (el descuento y el método del
  pago inicial lo eran), la clase común en vez de su copia local, y cada aviso
  dice qué falta y dónde.
*/

vi.mock('@/shared/components/ui/portal', () => ({ default: ({ children }) => children }));
vi.mock('@/shared/hooks/useDialogA11y', () => ({ useEscapeKey: () => {} }));
const catalogo = vi.hoisted(() => ({ products: [] }));
vi.mock('@/modules/products/hooks/useProducts', () => ({ useProducts: () => catalogo }));
const api = vi.hoisted(() => ({ create: vi.fn(), toast: vi.fn() }));
vi.mock('@/modules/conversions/api/conversions.api', () => ({ conversionsApi: { create: api.create } }));
vi.mock('@/shared/hooks/useToast', () => ({ toast: api.toast }));

import ConversionDialog from '@/modules/conversions/components/ConversionDialog';

// Las etiquetas de Field (#106) que no apuntan a ningún campo. Las de grupo
// (varios controles juntos, como «IVA» o «Pago recibido hoy») no tienen a
// cuál apuntar y se dicen aparte.
const etiquetasSueltas = (raiz, deGrupo = []) => [...raiz.querySelectorAll('label.mb-1\\.5.block.px-1')]
  .filter((l) => !deGrupo.some((g) => l.textContent.startsWith(g)))
  .filter((l) => !l.htmlFor || !raiz.ownerDocument.getElementById(l.htmlFor))
  .map((l) => l.textContent);

const lead = { id: 99, nombre: 'Ana Test' };
const abrir = () => render(<ConversionDialog open onClose={vi.fn()} lead={lead} projectId={1} />);

describe('Nueva venta (#106)', () => {
  beforeEach(() => { vi.clearAllMocks(); catalogo.products = []; api.create.mockResolvedValue({ success: true, data: { id: 1 } }); });
  afterEach(() => cleanup());

  it('no queda ningún desplegable del navegador: el descuento es el del CRM', () => {
    const { container } = abrir();
    expect(container.querySelector('select')).toBeNull();
    expect(screen.getByRole('combobox', { name: 'Descuento' })).toBeInTheDocument();
  });

  it('el método del pago inicial (con pago parcial) también es el del CRM', () => {
    const { container } = abrir();
    fireEvent.click(screen.getByRole('button', { name: /^Parcial$/i }));
    expect(container.querySelector('select')).toBeNull();
    expect(screen.getByRole('combobox', { name: 'Método del pago inicial' })).toBeInTheDocument();
  });

  it('los avisos dicen qué falta y dónde ponerlo', async () => {
    const { container } = abrir();
    fireEvent.change(container.querySelector('input[type="number"][required]'), { target: { value: '500' } });
    fireEvent.submit(container.querySelector('form'));
    await waitFor(() => expect(api.toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Falta el producto contratado',
      description: expect.stringMatching(/Producto contratado/),
    })));
    expect(api.create).not.toHaveBeenCalled();
  });

  it('el obligatorio se anuncia como tal (Field compartido)', () => {
    abrir();
    expect(screen.getAllByText('(obligatorio)').length).toBeGreaterThanOrEqual(2);
  });

  it('cada etiqueta enlazada a su campo, salvo las de grupo (#106)', () => {
    const { container } = render(<ConversionDialog open onClose={vi.fn()} lead={lead} projectId={1} />);
    expect(etiquetasSueltas(container, ['IVA', 'Pago recibido hoy'])).toEqual([]);
  });

  // En la prueba a mano, el globo «Rellene este campo» del navegador salía
  // antes que el aviso del CRM, y no se veía nunca.
  it('avisa el CRM, no el navegador: el formulario lleva noValidate', () => {
    const { container } = abrir();
    expect(container.querySelector('form').noValidate).toBe(true);
    // Los obligatorios lo siguen diciendo al lector de pantalla.
    expect(container.querySelector('input[type="number"][required]')).not.toBeNull();
  });

  describe('con catálogo: un solo desplegable', () => {
    beforeEach(() => { catalogo.products = [{ id: 1, nombre: 'Curso Dislexia', payment_links: null }]; });

    it('la casilla de texto no trae la lista del navegador (el catálogo ya está arriba)', () => {
      const { container } = abrir();
      expect(container.querySelector('#venta-producto-contratado').getAttribute('list')).toBeNull();
      expect(container.querySelector('datalist')).toBeNull();
    });

    it('con un nombre escrito a mano, el desplegable dice «Seleccionar…», no se queda en blanco', () => {
      const { container } = abrir();
      fireEvent.change(container.querySelector('#venta-producto-contratado'), { target: { value: 'Curso prueba' } });
      expect(screen.getByRole('combobox', { name: /Producto contratado/i })).toHaveTextContent('Seleccionar o escribir abajo');
    });

    it('al elegir del catálogo, la casilla de texto se rellena igual que antes', () => {
      const { container } = abrir();
      fireEvent.click(screen.getByRole('combobox', { name: /Producto contratado/i }));
      fireEvent.mouseDown(screen.getByRole('option', { name: 'Curso Dislexia' }));
      expect(container.querySelector('#venta-producto-contratado')).toHaveValue('Curso Dislexia');
      expect(screen.getByRole('combobox', { name: /Producto contratado/i })).toHaveTextContent('Curso Dislexia');
    });
  });
});
