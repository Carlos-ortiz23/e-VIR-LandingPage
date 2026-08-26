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
    expect(decodeURIComponent(url.split('?text=')[1])).toContain('María');
  });
});
