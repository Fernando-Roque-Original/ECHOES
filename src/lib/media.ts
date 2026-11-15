import type { EvidenceKind } from '../content/missions';

export function evidenceTone(kind: EvidenceKind) {
  if (kind === 'reconstrucao-artistica') return 'warning';
  if (kind === 'narracao-da-equipe') return 'team';
  return 'verified';
}

