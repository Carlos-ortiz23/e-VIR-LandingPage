export type Intent = 'socio' | 'conductor';

export interface LeadFields {
  nombre: string;
  correo: string;
  whatsapp: string;
  /** Tipo de participación (socio) o ciudad donde conduce (conductor). */
  detalle: string;
}

const OPENING: Record<Intent, string> = {
  socio: 'Hola, quiero ser socio de e-VIR.',
  conductor: 'Hola, quiero conducir con e-VIR.',
};

const DETAIL_LABEL: Record<Intent, string> = {
  socio: 'Tipo de participación',
  conductor: 'Ciudad',
};

export function buildMessage(intent: Intent, f: LeadFields): string {
  return [
    OPENING[intent],
    '',
    `Nombre: ${f.nombre}`,
    `Correo: ${f.correo}`,
    `WhatsApp: ${f.whatsapp}`,
    `${DETAIL_LABEL[intent]}: ${f.detalle}`,
  ].join('\n');
}

/**
 * Devuelve la URL de wa.me, o null si no hay un número configurado.
 * El null es lo que la UI usa para deshabilitar el envío.
 */
export function buildWhatsAppUrl(
  phone: string,
  intent: Intent,
  f: LeadFields
): string | null {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(buildMessage(intent, f))}`;
}
