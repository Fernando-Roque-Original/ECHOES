import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScrollExperience } from '../app/ScrollExperience';
import { useExperienceStore } from '../state/experienceStore';

const mockProgress = vi.hoisted(() => {
  let value = 0.99;
  const listeners = new Set<() => void>();

  return {
    get: () => value,
    reset: () => {
      value = 0.99;
      listeners.forEach((listener) => listener());
    },
    set: (nextValue: number) => {
      value = nextValue;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
});

vi.mock('../experience/scrollProgress', async () => {
  const { useSyncExternalStore } = await import('react');

  return {
    getSectionProgress: () => mockProgress.get(),
    useSectionProgress: () =>
      useSyncExternalStore(
        mockProgress.subscribe,
        mockProgress.get,
        mockProgress.get,
      ),
  };
});

vi.mock('../components/RoverTeardown', () => ({
  default: ({
    locale,
    reducedMotion,
    className,
    progress,
    active,
  }: {
    locale: string;
    reducedMotion: boolean;
    className?: string;
    progress?: number;
    active?: boolean;
  }) => (
    <div
      className={className}
      data-active={String(active)}
      data-locale={locale}
      data-progress={String(progress)}
      data-reduced-motion={String(reducedMotion)}
      data-testid="rover-teardown"
    />
  ),
}));

const marsCorrectAnswer = /Evidências de ambientes antigos com água/;
const marsWrongAnswer = /Florestas ainda vivas na superfície/;
const moonCorrectAnswer =
  /Gelo de água em regiões permanentemente sombreadas/;
const moonWrongAnswer =
  /A Lua é um vácuo absoluto e não tem exosfera/;

beforeEach(() => {
  mockProgress.reset();
  window.localStorage.clear();
  window.history.replaceState({}, '', '/');
  document.documentElement.lang = 'pt-BR';
  useExperienceStore.setState({
    reducedMotion: false,
    preferencesOpen: false,
    sourcesOpen: false,
  });
});

describe('cinematic scroll experience', () => {
  it('completes the Mars quiz and only then exposes the finale', async () => {
    const user = userEvent.setup();
    const { container } = render(<ScrollExperience initialWorld={null} />);

    expect(
      screen.queryByRole('region', { name: 'Jornada por Marte' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'O legado do Opportunity' }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'Começar a explorar o Sistema Solar',
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Explorar 01 Marte' }),
      ).toBeInTheDocument();
    });

    const marsCard = screen.getByRole('button', { name: 'Explorar 01 Marte' });
    await user.hover(marsCard);

    expect(
      screen.queryByRole('region', { name: 'Jornada por Marte' }),
    ).not.toBeInTheDocument();

    await user.click(marsCard);

    expect(
      screen.getByRole('region', { name: 'Jornada por Marte' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Respostas' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Ver o que ficou' }),
    ).not.toBeInTheDocument();
    expect(container.querySelector('#legado')).not.toBeInTheDocument();

    const wrongAnswer = screen.getByRole('button', { name: marsWrongAnswer });
    await user.click(wrongAnswer);

    expect(wrongAnswer).toHaveClass('is-selected', 'is-incorrect');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Ainda não. Volte à imagem das esferas de hematita e tente outra pista.',
    );
    expect(
      screen.queryByRole('button', { name: 'Ver o que ficou' }),
    ).not.toBeInTheDocument();
    expect(container.querySelector('#legado')).not.toBeInTheDocument();

    const correctAnswer = screen.getByRole('button', {
      name: marsCorrectAnswer,
    });
    await user.click(correctAnswer);

    expect(correctAnswer).toHaveClass('is-selected', 'is-correct');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Pista encontrada. O Opportunity encontrou minerais ligados a ambientes antigos com água.',
    );
    expect(container.querySelector('#legado')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ver o que ficou' }));

    expect(
      screen.getByRole('region', { name: 'O legado do Opportunity' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'A missão terminou. A descoberta ficou.',
      }),
    ).toBeInTheDocument();
  });

  it('completes the Moon quiz and only then exposes its finale', async () => {
    const user = userEvent.setup();
    const { container } = render(<ScrollExperience initialWorld="moon" />);

    expect(
      screen.getByRole('region', { name: 'Jornada pela Lua' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'O legado lunar' }),
    ).not.toBeInTheDocument();

    const wrongAnswer = screen.getByRole('button', { name: moonWrongAnswer });
    await user.click(wrongAnswer);

    expect(wrongAnswer).toHaveClass('is-selected', 'is-incorrect');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Ainda não. Releia a pista sobre as sombras e tente outra resposta.',
    );
    expect(
      screen.queryByRole('button', { name: 'Ver o legado lunar' }),
    ).not.toBeInTheDocument();
    expect(container.querySelector('#legado')).not.toBeInTheDocument();

    const correctAnswer = screen.getByRole('button', {
      name: moonCorrectAnswer,
    });
    await user.click(correctAnswer);

    expect(correctAnswer).toHaveClass('is-selected', 'is-correct');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Pista encontrada. A NASA encontrou evidências de gelo de água em regiões permanentemente sombreadas da Lua.',
    );
    expect(container.querySelector('#legado')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Ver o legado lunar' }),
    );

    expect(
      screen.getByRole('region', { name: 'O legado lunar' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'A primeira pegada abriu o caminho.',
      }),
    ).toBeInTheDocument();
  });

  it('switches PT-BR/EN, updates the document language and persists the choice', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<ScrollExperience initialWorld={null} />);

    expect(
      screen.getByRole('group', { name: 'Selecionar idioma' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Idioma: PT-BR' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: 'Idioma: EN' }),
    ).toHaveAttribute('aria-pressed', 'false');

    await user.click(screen.getByRole('button', { name: 'Idioma: EN' }));

    expect(
      screen.getByRole('group', { name: 'Select language' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Language: EN' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.lang).toBe('en');
    expect(window.localStorage.getItem('after-the-signal-locale')).toBe('en');

    unmount();
    render(<ScrollExperience initialWorld={null} />);

    expect(
      screen.getByRole('button', {
        name: 'Begin exploring the Solar System',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Language: EN' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.lang).toBe('en');
    expect(window.localStorage.getItem('after-the-signal-locale')).toBe('en');
  });

  it('keeps the teardown mounted but paused in the final beat', () => {
    render(<ScrollExperience initialWorld="mars" />);

    expect(
      screen.getByRole('region', { name: 'Jornada por Marte' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Respostas' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('rover-teardown')).toHaveAttribute(
      'data-active',
      'false',
    );
    expect(screen.getByTestId('rover-teardown')).toHaveAttribute(
      'data-progress',
      '1',
    );
  });

  it('activates the teardown with local progress during its weighted beat', () => {
    mockProgress.set(0.78);

    render(<ScrollExperience initialWorld="mars" />);

    const teardown = screen.getByTestId('rover-teardown');
    expect(teardown).toHaveAttribute('data-active', 'true');
    expect(Number(teardown.getAttribute('data-progress'))).toBeGreaterThan(0);
    expect(Number(teardown.getAttribute('data-progress'))).toBeLessThan(1);
    expect(
      screen.queryByRole('group', { name: 'Respostas' }),
    ).not.toBeInTheDocument();
  });

  it('forwards locale and reduced-motion preferences to the teardown', async () => {
    const user = userEvent.setup();
    mockProgress.set(0.78);
    useExperienceStore.setState({ reducedMotion: true });

    render(<ScrollExperience initialWorld="mars" />);

    expect(screen.getByTestId('rover-teardown')).toHaveAttribute(
      'data-locale',
      'pt-BR',
    );
    expect(screen.getByTestId('rover-teardown')).toHaveAttribute(
      'data-reduced-motion',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Idioma: EN' }));

    expect(screen.getByTestId('rover-teardown')).toHaveAttribute(
      'data-locale',
      'en',
    );
    expect(screen.getByTestId('rover-teardown')).toHaveAttribute(
      'data-reduced-motion',
      'true',
    );
  });

  it('starts ignition when the visitor presses Begin', async () => {
    const user = userEvent.setup();
    mockProgress.set(0);
    const { container } = render(<ScrollExperience initialWorld={null} />);
    const root = container.querySelector('[data-ignition]');

    expect(root).toHaveAttribute('data-ignition', 'pending');

    await user.click(
      screen.getByRole('button', {
        name: 'Começar a explorar o Sistema Solar',
      }),
    );

    await waitFor(() => {
      expect(root).toHaveAttribute('data-ignition', 'active');
    });
  });

  it('starts ignition on the first positive orbit scroll', async () => {
    mockProgress.set(0);
    const { container } = render(<ScrollExperience initialWorld={null} />);
    const root = container.querySelector('[data-ignition]');

    expect(root).toHaveAttribute('data-ignition', 'pending');

    act(() => mockProgress.set(0.01));

    await waitFor(() => {
      expect(root).toHaveAttribute('data-ignition', 'active');
    });
  });

  it('starts deep links with ignition already active', () => {
    mockProgress.set(0);
    const { container } = render(<ScrollExperience initialWorld="moon" />);

    expect(container.querySelector('[data-ignition]')).toHaveAttribute(
      'data-ignition',
      'active',
    );
  });

  it('does not restart ignition when the language changes', async () => {
    const user = userEvent.setup();
    mockProgress.set(0);
    const { container } = render(<ScrollExperience initialWorld={null} />);
    const root = container.querySelector('[data-ignition]');

    await user.click(
      screen.getByRole('button', {
        name: 'Começar a explorar o Sistema Solar',
      }),
    );
    await waitFor(() => {
      expect(root).toHaveAttribute('data-ignition', 'active');
    });

    await user.click(screen.getByRole('button', { name: 'Idioma: EN' }));

    expect(root).toHaveAttribute('data-ignition', 'active');
  });
});
