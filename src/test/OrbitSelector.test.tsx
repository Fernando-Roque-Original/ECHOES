import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  CARD_REVEAL_PROGRESS,
  OrbitSelector,
} from '../components/OrbitSelector';
import { getExperienceContent } from '../i18n';

const copy = getExperienceContent('pt-BR').orbit;
const copyEn = getExperienceContent('en').orbit;

function renderSelector(
  orbitProgress: number,
  selectorCopy = copy,
  selectionEnabled = true,
) {
  const onSelect = vi.fn();
  const result = render(
    <OrbitSelector
      orbitProgress={orbitProgress}
      selectedWorld={null}
      onSelect={onSelect}
      copy={selectorCopy}
      selectionEnabled={selectionEnabled}
    />,
  );

  return { ...result, onSelect };
}

describe('OrbitSelector', () => {
  it('keeps the world cards hidden and inert before the reveal threshold', () => {
    const { container } = renderSelector(CARD_REVEAL_PROGRESS - 0.01);
    const worlds = container.querySelector('.cine-orbit__worlds');

    expect(screen.getByText(copy.scrollHint)).toBeVisible();
    expect(worlds).toHaveAttribute('aria-hidden', 'true');
    expect(worlds).toHaveAttribute('inert');
    expect(
      screen.queryByRole('group', { name: copy.headingDefault }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Explorar 01 Marte' }),
    ).not.toBeInTheDocument();
  });

  it('reveals exactly Mars and Moon at the accessibility threshold', () => {
    renderSelector(CARD_REVEAL_PROGRESS);

    const worlds = screen.getByRole('group', { name: copy.headingDefault });
    const cards = within(worlds).getAllByRole('button');

    expect(cards).toHaveLength(2);
    expect(worlds.querySelectorAll('.cine-world-card')).toHaveLength(2);
    expect(
      within(worlds).getByRole('button', { name: 'Explorar 01 Marte' }),
    ).toBeInTheDocument();
    expect(
      within(worlds).getByRole('button', { name: 'Explorar 02 Lua' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Mercúrio/ }),
    ).not.toBeInTheDocument();
  });

  it('keeps the visible card numbering in the localized accessible name', () => {
    renderSelector(CARD_REVEAL_PROGRESS, copyEn);

    expect(
      screen.getByRole('button', { name: 'Explore 01 Mars' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Explore 02 Moon' }),
    ).toBeInTheDocument();
  });

  it('changes the active card on hover without selecting a world', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderSelector(CARD_REVEAL_PROGRESS + 0.25);

    const mars = screen.getByRole('button', { name: 'Explorar 01 Marte' });
    const moon = screen.getByRole('button', { name: 'Explorar 02 Lua' });

    expect(mars).toHaveClass('is-active');
    await user.hover(moon);

    expect(moon).toHaveClass('is-active');
    expect(mars).not.toHaveClass('is-active');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('selects Mars only when its card is activated', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderSelector(CARD_REVEAL_PROGRESS);

    await user.click(
      screen.getByRole('button', { name: 'Explorar 01 Marte' }),
    );

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('mars');
  });

  it('moves focus with arrow, Home and End keys and exposes a single tab stop', async () => {
    const user = userEvent.setup();
    renderSelector(CARD_REVEAL_PROGRESS);

    const mars = screen.getByRole('button', { name: 'Explorar 01 Marte' });
    const moon = screen.getByRole('button', { name: 'Explorar 02 Lua' });

    expect(mars).toHaveAttribute('tabindex', '0');
    expect(moon).toHaveAttribute('tabindex', '-1');

    mars.focus();
    await user.keyboard('{ArrowRight}');

    expect(moon).toHaveFocus();
    expect(moon).toHaveAttribute('tabindex', '0');
    expect(mars).toHaveAttribute('tabindex', '-1');

    await user.keyboard('{Home}');
    expect(mars).toHaveFocus();

    await user.keyboard('{End}');
    expect(moon).toHaveFocus();
  });

  it('selects Moon when its card is activated', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderSelector(CARD_REVEAL_PROGRESS);

    await user.click(
      screen.getByRole('button', { name: 'Explorar 02 Lua' }),
    );

    expect(onSelect).toHaveBeenCalledWith('moon');
  });

  it('keeps cards hidden and inert even at high progress when selection is disabled', async () => {
    const user = userEvent.setup();
    const { container, onSelect } = renderSelector(
      CARD_REVEAL_PROGRESS + 0.4,
      copy,
      false,
    );
    const worlds = container.querySelector('.cine-orbit__worlds');
    const cards = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.cine-world-card'),
    );

    expect(worlds).toHaveAttribute('aria-hidden', 'true');
    expect(worlds).toHaveAttribute('inert');
    expect(cards).toHaveLength(2);
    expect(screen.getByText(copy.scrollHint)).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Explorar 01 Marte' }),
    ).not.toBeInTheDocument();

    const [mars, moon] = cards;
    expect(mars).toBeDisabled();
    expect(mars).toHaveAttribute('aria-disabled', 'true');
    expect(mars).toHaveAttribute('tabindex', '-1');
    expect(moon).toBeDisabled();
    expect(moon).toHaveAttribute('aria-disabled', 'true');
    expect(moon).toHaveAttribute('tabindex', '-1');

    fireEvent.click(mars);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('does not expose keyboard interaction while entry is not settled', async () => {
    const user = userEvent.setup();
    const { container, onSelect } = renderSelector(
      CARD_REVEAL_PROGRESS + 0.2,
      copy,
      false,
    );
    const mars = container.querySelector<HTMLButtonElement>(
      '.cine-world-card.is-mars',
    )!;
    const moon = container.querySelector<HTMLButtonElement>(
      '.cine-world-card.is-moon',
    )!;

    mars.focus();
    await user.keyboard('{ArrowRight}{End}{Enter}');

    expect(onSelect).not.toHaveBeenCalled();
    expect(mars).toHaveClass('is-active');
    expect(moon).not.toHaveClass('is-active');
  });
});
