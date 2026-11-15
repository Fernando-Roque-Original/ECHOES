import type { Locale } from '../i18n';

const odsCopy = {
  'pt-BR': {
    fourLabel: 'ODS 4',
    nineLabel: 'ODS 9',
    ariaLabel:
      'ODS 4, educação de qualidade; ODS 9, indústria, inovação e infraestrutura',
    four: 'Educação de qualidade',
    nine: 'Indústria, inovação e infraestrutura',
  },
  en: {
    fourLabel: 'SDG 4',
    nineLabel: 'SDG 9',
    ariaLabel:
      'SDG 4, quality education; SDG 9, industry, innovation and infrastructure',
    four: 'Quality education',
    nine: 'Industry, innovation and infrastructure',
  },
} as const;

export function OdsBadges({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const copy = odsCopy[locale];

  return (
    <aside
      className={['cine-ods', className].filter(Boolean).join(' ')}
      aria-label={copy.ariaLabel}
    >
      <span className="cine-ods__item">
        <img
          src="/assets/ods/ods-4.svg"
          width="28"
          height="28"
          alt=""
          aria-hidden="true"
        />
        <span>
          <strong>{copy.fourLabel}</strong>
          <small>{copy.four}</small>
        </span>
      </span>
      <span className="cine-ods__item">
        <img
          src="/assets/ods/ods-9.svg"
          width="28"
          height="28"
          alt=""
          aria-hidden="true"
        />
        <span>
          <strong>{copy.nineLabel}</strong>
          <small>{copy.nine}</small>
        </span>
      </span>
    </aside>
  );
}
