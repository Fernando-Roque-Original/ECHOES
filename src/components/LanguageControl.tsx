import { Languages } from 'lucide-react';
import { locales, type Locale } from '../i18n';

type LanguageCopy = {
  label: string;
  ariaLabel: string;
  options: Record<Locale, string>;
};

export function LanguageControl({
  locale,
  onChange,
  copy,
  className = '',
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
  copy: LanguageCopy;
  className?: string;
}) {
  return (
    <div
      className={`cine-language ${className}`.trim()}
      role="group"
      aria-label={copy.ariaLabel}
    >
      <Languages aria-hidden="true" size={17} />
      {locales.map((option) => (
        <button
          className="cine-language__button"
          type="button"
          key={option}
          aria-pressed={locale === option}
          aria-label={`${copy.label}: ${copy.options[option]}`}
          onClick={() => onChange(option)}
        >
          {copy.options[option]}
        </button>
      ))}
    </div>
  );
}
