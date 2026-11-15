import type { Locale } from '../../i18n';
import { getJourney, getQuiz } from '../../i18n';
import { ScrollJourney } from './ScrollJourney';
import { WorldQuiz } from './WorldQuiz';

export function MoonJourney({
  locale,
  reducedMotion,
  onExit,
  onFinish,
}: {
  locale: Locale;
  reducedMotion: boolean;
  onExit: () => void;
  onFinish: () => void;
}) {
  const journey = getJourney('moon', locale);

  return (
    <ScrollJourney
      journey={journey}
      locale={locale}
      reducedMotion={reducedMotion}
      onExit={onExit}
      onFinish={onFinish}
    >
      <WorldQuiz quiz={getQuiz('moon', locale)} onFinish={onFinish} />
    </ScrollJourney>
  );
}
