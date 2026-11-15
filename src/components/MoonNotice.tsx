import { ArrowRight, Moon } from 'lucide-react';
import { nasaUrls } from '../content/missions';
import { useExperienceStore } from '../state/experienceStore';
import { BigButton } from './BigButton';
import { Modal } from './Modal';

export function MoonNotice() {
  const open = useExperienceStore((state) => state.moonNoticeOpen);
  const close = useExperienceStore((state) => state.closeMoonNotice);

  return (
    <Modal open={open} onClose={close} eyebrow="Próxima vitrine" title="A Lua está chegando.">
      <div className="moon-notice">
        <Moon aria-hidden="true" />
        <p>
          O próximo objeto do museu será o estágio de descida do módulo lunar
          Eagle, da Apollo 11. Ele ficou na Lua depois de levar astronautas à
          superfície.
        </p>
      </div>
      <p className="modal-copy">
        A história de Marte está completa. A nova história só entra quando todo
        o conteúdo e as fontes estiverem prontos.
      </p>
      <div className="modal-actions">
        <BigButton
          variant="secondary"
          onClick={() => window.open(nasaUrls.apolloNext, '_blank', 'noopener')}
        >
          Ver fonte Apollo 11
          <ArrowRight aria-hidden="true" size={18} />
        </BigButton>
        <BigButton onClick={close}>Voltar ao museu</BigButton>
      </div>
    </Modal>
  );
}

