import { ExternalLink, ShieldCheck } from 'lucide-react';
import { nasaUrls } from '../content/missions';
import { useExperienceStore } from '../state/experienceStore';
import { Modal } from './Modal';

const sourceGroups = [
  {
    title: 'Modelos e texturas 3D',
    items: [
      [
        'Marte',
        nasaUrls.marsTexture,
        'Textura NASA aplicada a uma esfera 3D',
      ],
      [
        'Spirit e Opportunity',
        nasaUrls.opportunityModel,
        'GLB carregado sob demanda',
      ],
    ],
  },
  {
    title: 'Imagens e dados históricos',
    items: [
      ['Último dado recebido', nasaUrls.opportunityLastMessage, 'PIA22929'],
      ['Autorretrato do Opportunity', nasaUrls.opportunitySelfie, 'PIA17759'],
      [
        'Panorama final',
        nasaUrls.opportunityFinalPanorama,
        'PIA-22908',
      ],
      [
        'Esferas de hematita',
        nasaUrls.opportunityBerries,
        'PIA05273',
      ],
      ['Mapa da rota final', nasaUrls.opportunityTraverse, 'PIA23178'],
    ],
  },
  {
    title: 'Contexto da missão',
    items: [
      ['Visão geral da Opportunity', nasaUrls.opportunityMission, 'NASA Science'],
      ['Fim da missão', nasaUrls.opportunityEnd, 'NASA/JPL'],
      ['Mars Trek', nasaUrls.marsTrek, 'Mapa interativo NASA'],
      ['Catálogo NSSDCA', nasaUrls.nssdca, 'Arquivo público de missões NASA'],
    ],
  },
  {
    title: 'Mapa celeste e licenças',
    items: [
      [
        'Texturas de planetas e da Lua',
        'https://www.solarsystemscope.com/textures/',
        'Solar System Scope · CC BY 4.0',
      ],
      [
        'Via Láctea',
        'https://www.eso.org/public/images/eso0932a/',
        'ESO/S. Brunier · CC BY 4.0',
      ],
      [
        'Licença Creative Commons BY 4.0',
        'https://creativecommons.org/licenses/by/4.0/',
        'Atribuição',
      ],
    ],
  },
] as const;

export function SourcesPanel() {
  const open = useExperienceStore((state) => state.sourcesOpen);
  const close = useExperienceStore((state) => state.closeSources);

  return (
    <Modal
      open={open}
      onClose={close}
      eyebrow="Transparência"
      title="O que é real aqui?"
      wide
    >
      <div className="provenance-summary">
        <ShieldCheck aria-hidden="true" />
        <p>
          O modelo do Opportunity, as imagens e o mapa vêm de páginas oficiais
          da NASA. A Lua e os planetas bloqueados usam texturas Solar System
          Scope, via HyperMemoria, sob CC BY 4.0; o céu é de ESO/S. Brunier. A
          voz é uma narração do navegador, não uma transmissão da missão.
        </p>
      </div>

      <div className="source-groups">
        {sourceGroups.map((group) => (
          <section key={group.title}>
            <h3>{group.title}</h3>
            <ul>
              {group.items.map(([label, url, note]) => (
                <li key={label}>
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
        <h3>Uma correção importante</h3>
        <p>
          O Opportunity não enviou uma frase como “minha bateria está baixa”.
          Esse texto foi criado depois por outras pessoas. O último dado real foi
          uma imagem incompleta recebida em 10 de junho de 2018.
        </p>
      </div>
    </Modal>
  );
}

