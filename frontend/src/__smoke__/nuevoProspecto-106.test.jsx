// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

/*
  «Nuevo prospecto» con las piezas comunes (#106), como en MultiCRM.

  - El aviso «Hace falta al menos una forma de contacto» viene del esquema sin
    campo y no se pintaba en ningún sitio: al pulsar «Crear» no pasaba nada.
  - El desplegable de WhatsApp era el del navegador, distinto de «Origen» y
    «País» (#125, #134).
*/

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 3, nombre: 'Ana', role: 'admin' }, logout: vi.fn() }),
}));
vi.mock('@/contexts/ProjectContext', () => ({
  useProjectContext: () => ({ activeProject: { id: 1, nombre: 'ISEIE', producto_label: 'Producto' } }),
}));
vi.mock('@/modules/products/hooks/useProducts', () => ({
  useProducts: () => ({ products: [], refetch: vi.fn() }),
}));
vi.mock('@/shared/api/client', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ success: true, data: [] }),
    post: vi.fn().mockResolvedValue({ success: true }),
  },
}));
vi.mock('@/shared/hooks/useDialogA11y', () => ({ useEscapeKey: () => {} }));
vi.mock('@/shared/components/ui/portal', () => ({ default: ({ children }) => children }));
vi.mock('@/modules/leads/components/ProductCombobox', () => ({
  default: ({ value, onChange, id }) => <input id={id} data-testid="product-combobox" value={value || ''} onChange={(e) => onChange(e.target.value)} />,
}));

import LeadFormDialog from '@/modules/leads/components/LeadFormDialog';

// Las etiquetas de Field (#106) que no apuntan a ningún campo. Las de grupo
// (varios controles juntos, como «IVA» o «Pago recibido hoy») no tienen a
// cuál apuntar y se dicen aparte.
const etiquetasSueltas = (raiz, deGrupo = []) => [...raiz.querySelectorAll('label.mb-1\\.5.block.px-1')]
  .filter((l) => !deGrupo.some((g) => l.textContent.startsWith(g)))
  .filter((l) => !l.htmlFor || !raiz.ownerDocument.getElementById(l.htmlFor))
  .map((l) => l.textContent);

describe('Nuevo prospecto (#106)', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => cleanup());

  it('sin ninguna forma de contacto, dice que falta y no crea', async () => {
    const onSubmit = vi.fn();
    const { container } = render(<LeadFormDialog open onClose={vi.fn()} onSubmit={onSubmit} lead={null} />);
    fireEvent.input(container.querySelector('input[name="nombre"]'), { target: { value: 'Juan' } });
    fireEvent.submit(container.querySelector('form'));
    const aviso = await screen.findByText(/Hace falta al menos una forma de contacto/i);
    expect(aviso).toHaveAttribute('role', 'alert');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('el correo mal escrito dice cómo escribirlo', async () => {
    const onSubmit = vi.fn();
    const { container } = render(<LeadFormDialog open onClose={vi.fn()} onSubmit={onSubmit} lead={null} />);
    fireEvent.input(container.querySelector('input[name="email"]'), { target: { value: 'no-es-email' } });
    fireEvent.submit(container.querySelector('form'));
    await waitFor(() => expect(screen.getByText(/Email no válido: escríbelo como nombre@dominio.com/i)).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('no queda ningún desplegable del navegador: WhatsApp usa el del CRM', () => {
    const { container } = render(<LeadFormDialog open onClose={vi.fn()} onSubmit={vi.fn()} lead={null} />);
    expect(container.querySelector('select')).toBeNull();
    expect(screen.getByRole('combobox', { name: /Qué tienes de WhatsApp/i })).toBeInTheDocument();
  });

  it('usa el Field compartido: el obligatorio se anuncia como tal', () => {
    render(<LeadFormDialog open onClose={vi.fn()} onSubmit={vi.fn()} lead={null} />);
    expect(screen.getAllByText('(obligatorio)').length).toBeGreaterThanOrEqual(2);
  });

  it('cada etiqueta enlazada a su campo (#106)', async () => {
    const { container } = render(<LeadFormDialog open onClose={vi.fn()} onSubmit={vi.fn()} />);
    await screen.findAllByText(/Nuevo prospecto/i);
    expect(etiquetasSueltas(container)).toEqual([]);
  });
});
