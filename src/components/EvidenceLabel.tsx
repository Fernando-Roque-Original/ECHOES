import { BadgeCheck, FlaskConical, Mic2, ScanEye } from 'lucide-react';
import { evidenceLabels, type EvidenceKind } from '../content/missions';
import { evidenceTone } from '../lib/media';

type EvidenceLabelProps = {
  kind: EvidenceKind;
  sourceUrl?: string;
  compact?: boolean;
};

export function EvidenceLabel({
  kind,
  sourceUrl,
  compact = false,
}: EvidenceLabelProps) {
  const tone = evidenceTone(kind);
  const Icon =
    kind === 'modelo-3d-nasa'
      ? ScanEye
      : kind === 'narracao-da-equipe'
        ? Mic2
        : kind === 'reconstrucao-artistica'
          ? FlaskConical
          : BadgeCheck;

  return (
    <span className={`evidence-label evidence-label--${tone} ${compact ? 'is-compact' : ''}`}>
      <Icon aria-hidden="true" size={compact ? 14 : 16} />
      <span>{evidenceLabels[kind]}</span>
      {sourceUrl ? (
        <a href={sourceUrl} target="_blank" rel="noreferrer">
          Ver fonte
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
      ) : null}
    </span>
  );
}

