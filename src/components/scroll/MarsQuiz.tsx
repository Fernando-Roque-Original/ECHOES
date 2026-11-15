import type { Locale } from '../../i18n';
import { getQuiz } from '../../i18n';
import { WorldQuiz } from './WorldQuiz';

export function MarsQuiz({
  locale = 'pt-BR',
  onFinish,
}: {
  locale?: Locale;
  onFinish: () => void;
}) {
  return <WorldQuiz quiz={getQuiz('mars', locale)} onFinish={onFinish} />;
}
