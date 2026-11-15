import { ExternalLink, MousePointer2, Radio, Telescope } from 'lucide-react';
import { nasaUrls } from '../content/missions';
import { useExperienceStore } from '../state/experienceStore';
import { BigButton } from './BigButton';
import { Modal } from './Modal';

export function SilentWorldNotice() {
  const code = useExperienceStore((state) => state.silentWorldCode);
  const close = useExperienceStore((state) => state.closeSilentWorld);

  return (
    <Modal
      open={Boolean(code)}
      onClose={close}
      eyebrow="Arquivo orbital · sinal interrompido"
      title="Este mundo ainda está em silêncio."
    >
      <div className="silent-world-hero">
        <span aria-hidden="true">?</span>
        <p>
          O registro <strong>{code ?? 'ARQ'}</strong> existe no mapa, mas ainda
          não tem uma história publicada neste museu.
        </p>
      </div>
      <div className="silent-world-facts">
        <span>
          <Radio aria-hidden="true" />
          <strong>Sem transmissão</strong>
          <small>história em pesquisa</small>
        </span>
        <span>
          <Telescope aria-hidden="true" />
          <strong>Catálogo NASA</strong>
          <small>dados disponíveis para uma próxima etapa</small>
        </span>
      </div>
      <p className="modal-copy">
        O NSSDCA reúne o catálogo público de espaçonaves, instrumentos e
        destinos da NASA. Um ponto no mapa não é uma história inventada: é um
        convite para pesquisar mais.
      </p>
      <a
        className="source-link-strong"
        href={nasaUrls.nssdca}
        target="_blank"
        rel="noreferrer"
      >
        Abrir o catálogo NSSDCA
        <ExternalLink aria-hidden="true" size={16} />
      </a>
      <div className="modal-actions">
        <BigButton
          icon={<MousePointer2 aria-hidden="true" size={18} />}
          onClick={close}
        >
          Voltar ao Sistema Solar
        </BigButton>
      </div>
    </Modal>
  );
}

