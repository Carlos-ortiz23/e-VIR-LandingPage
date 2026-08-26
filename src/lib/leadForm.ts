import type { Intent } from './whatsapp';

export const INTENT_COPY: Record<
  Intent,
  { title: string; lead: string; detalleLabel: string; submit: string }
> = {
  socio: {
    title: 'Sé socio de e-VIR',
    lead: 'Invitamos a inversionistas y aliados institucionales a hacer parte de la expansión de e-VIR en Latinoamérica. Déjanos tus datos y te contactamos.',
    detalleLabel: 'Tipo de participación',
    submit: 'Quiero ser socio',
  },
  conductor: {
    title: 'Sé conductor asociado',
    lead: 'Si conduces, e-VIR te entrega un vehículo eléctrico nuevo y automático, con bajas comisiones y un camino real a la propiedad. Déjanos tus datos.',
    detalleLabel: 'Ciudad donde conduces',
    submit: 'Quiero conducir',
  },
};

export const INTENT_OPTIONS: Record<Intent, string[]> = {
  socio: [
    'Inversionista individual',
    'Fondo o red de inversión',
    'Alianza institucional (Línea Verde)',
    'Aliado corporativo',
  ],
  conductor: [
    'Barranquilla',
    'Otra ciudad de Colombia',
    'Costa Rica',
    'Panamá',
    'Paraguay',
  ],
};
