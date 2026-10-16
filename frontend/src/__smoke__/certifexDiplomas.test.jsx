// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import { NAV_SECTIONS } from '@/shared/components/layout/Sidebar';
import { CERTIFEX_PANEL } from '@/shared/lib/certifexPanel';

/*
  Certifex · Diplomas (#272), traído de MultiCRM el 15/10 (paridad).

  Lo que se fija aquí, en el frontal:
   · que el panel está en el menú (Clientes → Diplomas), solo para administración,
     y que en pruebas (local, /staging) el interruptor VITE_CERTIFEX_PANEL vale lo
     que SOLO_EN_PRUEBAS: encendido;
   · que los diálogos de confirmar —los que usa el panel para aprobar, emitir,
     revocar…— son accesibles: el título nombra el diálogo, Escape cancela y,
     mientras se está guardando, Escape no lo cierra.
*/

afterEach(cleanup);

function entradas() {
  const todas = [];
  for (const s of NAV_SECTIONS) {
    for (const it of s.items) {
      todas.push(it);
      for (const h of it.children || []) todas.push(h);
    }
  }
  return todas;
}

describe('Diplomas en el menú', () => {
  it('en pruebas el interruptor está encendido', () => {
    expect(CERTIFEX_PANEL).toBe(true);
  });

  it('Clientes → Diplomas lleva a /matriculas/diplomas y es solo de administración', () => {
    const d = entradas().find((e) => e.to === '/matriculas/diplomas');
    expect(d).toBeTruthy();
    expect(d.label).toBe('Diplomas');
    expect(d.roles).toEqual(['superadmin', 'admin']);
  });
});

describe('ConfirmDialog accesible', () => {
  it('el título nombra el diálogo', () => {
    render(<ConfirmDialog open title="Emitir 3 diplomas" onConfirm={() => {}} onCancel={() => {}} />);
    const dialogo = screen.getByRole('dialog');
    const titulo = screen.getByText('Emitir 3 diplomas');
    expect(dialogo.getAttribute('aria-labelledby')).toBe(titulo.id);
  });

  it('Escape cancela', () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog open title="X" onConfirm={() => {}} onCancel={onCancel} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('mientras guarda, Escape no lo cierra', () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog open loading title="X" onConfirm={() => {}} onCancel={onCancel} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).not.toHaveBeenCalled();
  });
});
