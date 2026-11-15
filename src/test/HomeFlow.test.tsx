import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../app/App';
import { useExperienceStore } from '../state/experienceStore';

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.lang = 'pt-BR';
  window.history.replaceState({}, '', '/');
  useExperienceStore.setState({
    reducedMotion: true,
    sourcesOpen: false,
    preferencesOpen: false,
    silentWorldCode: null,
  });
});

afterEach(() => {
  window.history.replaceState({}, '', '/');
});

describe('application routes', () => {
  it('starts with the accessible cinematic opening action', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /Abandonados/ }),
    ).toBeInTheDocument();

    const start = screen.getByRole('button', {
      name: 'Começar a explorar o Sistema Solar',
    });
    expect(start).toHaveTextContent('Começar');

    await user.click(start);

    expect(
      screen.getByRole('heading', { name: 'Escolha um astro' }),
    ).toBeInTheDocument();
  });

  it('opens the selected world journey from the query state', () => {
    window.history.replaceState({}, '', '/?world=mars');
    render(<App />);

    expect(
      screen.getByRole('region', { name: 'Jornada por Marte' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '90 dias' }),
    ).toBeInTheDocument();
  });

  it('routes to the linear archive without a canvas', () => {
    window.history.replaceState({}, '', '/?mode=archive');
    const { container } = render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Jornada de Marte' }),
    ).toBeInTheDocument();
    expect(container.querySelector('canvas')).not.toBeInTheDocument();
  });

  it('switches the interface to English and persists the choice', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

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
      screen.getByRole('button', { name: 'Language: PT-BR' }),
    ).toHaveAttribute('aria-pressed', 'false');
    expect(
      screen.getByRole('button', { name: 'Language: EN' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.lang).toBe('en');
    expect(window.localStorage.getItem('after-the-signal-locale')).toBe('en');

    unmount();
    render(<App />);

    expect(
      screen.getByRole('button', {
        name: 'Begin exploring the Solar System',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Select language' }),
    ).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('en');
    expect(window.localStorage.getItem('after-the-signal-locale')).toBe('en');
  });
});
