import { describe, expect, it } from 'vitest';
import { buildMessage, buildWhatsAppUrl, type LeadFields } from './whatsapp';

const FIELDS: LeadFields = {
  nombre: 'María Fernanda Rojas',
  correo: 'maria@correo.com',
  whatsapp: '+57 300 000 0000',
  detalle: 'Alianza institucional (Línea Verde)',
};

describe('buildMessage', () => {
  it('abre distinto según la intención', () => {
    expect(buildMessage('socio', FIELDS)).toContain('ser socio');
    expect(buildMessage('conductor', FIELDS)).toContain('conducir');
  });

  it('incluye los cuatro campos', () => {
    const msg = buildMessage('socio', FIELDS);
    expect(msg).toContain('María Fernanda Rojas');
    expect(msg).toContain('maria@correo.com');
    expect(msg).toContain('+57 300 000 0000');
    expect(msg).toContain('Alianza institucional (Línea Verde)');
  });
});

describe('buildWhatsAppUrl', () => {
  it('devuelve null si no hay número configurado', () => {
    expect(buildWhatsAppUrl('', 'socio', FIELDS)).toBeNull();
    expect(buildWhatsAppUrl('   ', 'socio', FIELDS)).toBeNull();
    expect(buildWhatsAppUrl('+ ()-', 'socio', FIELDS)).toBeNull();
  });

  it('deja solo dígitos en el número', () => {
    const url = buildWhatsAppUrl('+57 (300) 000-0000', 'socio', FIELDS);
    expect(url).toMatch(/^https:\/\/wa\.me\/573000000000\?text=/);
  });

  it('codifica acentos, saltos de línea y paréntesis', () => {
    const url = buildWhatsAppUrl('573000000000', 'socio', FIELDS)!;
    expect(url).not.toContain(' ');
    expect(url).not.toContain('\n');
    expect(url).toContain('%0A');
    const decoded = decodeURIComponent(url.split('?text=')[1]);
    expect(decoded).toContain('María');
    expect(decoded).toContain('Alianza institucional (Línea Verde)');
  });

  it('preserva & = # intactos en un campo libre', () => {
    const fields: LeadFields = {
      ...FIELDS,
      nombre: 'Juan & María S.A.S.',
      detalle: 'Presupuesto #1, meta=alta',
    };
    const url = buildWhatsAppUrl('573000000000', 'socio', fields)!;
    const decoded = decodeURIComponent(url.split('?text=')[1]);
    expect(decoded).toContain('Juan & María S.A.S.');
    expect(decoded).toContain('Presupuesto #1, meta=alta');
  });

  it('funciona también para la intención conductor', () => {
    const url = buildWhatsAppUrl('573000000000', 'conductor', FIELDS)!;
    expect(url).toMatch(/^https:\/\/wa\.me\/573000000000\?text=/);
    const decoded = decodeURIComponent(url.split('?text=')[1]);
    expect(decoded).toContain('conducir');
  });

  it('produce una URL válida incluso con los cuatro campos vacíos', () => {
    const empty: LeadFields = { nombre: '', correo: '', whatsapp: '', detalle: '' };
    const url = buildWhatsAppUrl('573000000000', 'socio', empty);
    expect(url).toMatch(/^https:\/\/wa\.me\/573000000000\?text=/);
  });
});
