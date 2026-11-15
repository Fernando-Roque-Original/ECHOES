import { ExternalLink, ShieldCheck } from 'lucide-react';
import type { Locale } from '../i18n';
import { getUiCopy } from '../i18n/ui';
import { useExperienceStore } from '../state/experienceStore';
import { Modal } from './Modal';

export function SourcesPanel({ locale = 'en' }: { locale?: Locale }) {
  const open = useExperienceStore((state) => state.sourcesOpen);
  const close = useExperienceStore((state) => state.closeSources);
  const copy = getUiCopy(locale).sources;

  return (
    <Modal
      open={open}
      onClose={close}
      eyebrow={copy.eyebrow}
      title={copy.title}
      closeLabel={getUiCopy(locale).notices.close}
      wide
    >
      <div className="provenance-summary">
        <ShieldCheck aria-hidden="true" />
        <p>{copy.summary}</p>
      </div>

      <div className="source-groups">
        {copy.groups.map((group) => (
          <section key={group.title}>
            <h3>{group.title}</h3>
            <ul>
              {group.items.map(([label, url, note]) => (
                <li key={`${group.title}-${label}`}>
                  <a href={url} target="_blank" rel="noreferrer">
                    <span>{label}</span>
                    <small>{note}</small>
                    <ExternalLink aria-hidden="true" size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="provenance-note">
        <h3>{copy.correctionTitle}</h3>
        <p>{copy.correctionBody}</p>
      </div>
    </Modal>
  );
}
