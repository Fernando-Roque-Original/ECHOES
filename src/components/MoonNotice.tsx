import { ArrowRight, Moon } from 'lucide-react';
import { nasaUrls } from '../content/missions';
import type { Locale } from '../i18n';
import { getUiCopy } from '../i18n/ui';
import { useExperienceStore } from '../state/experienceStore';
import { BigButton } from './BigButton';
import { Modal } from './Modal';

export function MoonNotice({ locale = 'en' }: { locale?: Locale }) {
  const open = useExperienceStore((state) => state.moonNoticeOpen);
  const close = useExperienceStore((state) => state.closeMoonNotice);
  const copy = getUiCopy(locale).notices;

  return (
    <Modal
      open={open}
      onClose={close}
      eyebrow={copy.moon.eyebrow}
      title={copy.moon.title}
      closeLabel={copy.close}
    >
      <div className="moon-notice">
        <Moon aria-hidden="true" />
        <p>{copy.moon.body}</p>
      </div>
      <p className="modal-copy">{copy.moon.detail}</p>
      <div className="modal-actions">
        <BigButton
          variant="secondary"
          onClick={() => window.open(nasaUrls.apolloNext, '_blank', 'noopener')}
        >
          {copy.moon.source}
          <ArrowRight aria-hidden="true" size={18} />
        </BigButton>
        <BigButton onClick={close}>{copy.moon.back}</BigButton>
      </div>
    </Modal>
  );
}
