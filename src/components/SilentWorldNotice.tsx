import { ExternalLink, MousePointer2, Radio, Telescope } from 'lucide-react';
import { nasaUrls } from '../content/missions';
import type { Locale } from '../i18n';
import { getUiCopy } from '../i18n/ui';
import { useExperienceStore } from '../state/experienceStore';
import { BigButton } from './BigButton';
import { Modal } from './Modal';

export function SilentWorldNotice({ locale = 'en' }: { locale?: Locale }) {
  const code = useExperienceStore((state) => state.silentWorldCode);
  const close = useExperienceStore((state) => state.closeSilentWorld);
  const copy = getUiCopy(locale).notices;

  return (
    <Modal
      open={Boolean(code)}
      onClose={close}
      eyebrow={copy.silent.eyebrow}
      title={copy.silent.title}
      closeLabel={copy.close}
    >
      <div className="silent-world-hero">
        <span aria-hidden="true">?</span>
        <p>
          {copy.silent.recordLead} <strong>{code ?? 'ARQ'}</strong>{' '}
          {copy.silent.recordBody}
        </p>
      </div>
      <div className="silent-world-facts">
        <span>
          <Radio aria-hidden="true" />
          <strong>{copy.silent.noSignal}</strong>
          <small>{copy.silent.inResearch}</small>
        </span>
        <span>
          <Telescope aria-hidden="true" />
          <strong>{copy.silent.nasaCatalog}</strong>
          <small>{copy.silent.catalogDetail}</small>
        </span>
      </div>
      <p className="modal-copy">{copy.silent.body}</p>
      <a
        className="source-link-strong"
        href={nasaUrls.nssdca}
        target="_blank"
        rel="noreferrer"
      >
        {copy.silent.source}
        <ExternalLink aria-hidden="true" size={16} />
      </a>
      <div className="modal-actions">
        <BigButton
          icon={<MousePointer2 aria-hidden="true" size={18} />}
          onClick={close}
        >
          {copy.silent.back}
        </BigButton>
      </div>
    </Modal>
  );
}
