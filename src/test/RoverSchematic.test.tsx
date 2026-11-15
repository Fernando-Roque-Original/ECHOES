import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { RoverSchematic } from '../components/RoverSchematic';

describe('illustrative rover schematic', () => {
  it('separates, filters and exposes the illustrative cutaway', async () => {
    const user = userEvent.setup();
    const { container } = render(<RoverSchematic reducedMotion />);

    const slider = screen.getByRole('slider', {
      name: /Separação das peças/,
    });
    fireEvent.change(slider, { target: { value: '100' } });
    expect(screen.getByText('100%')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /^Mobilidade$/ }),
    );
    expect(
      screen.getByRole('button', { name: /^Mobilidade$/ }),
    ).toHaveAttribute('aria-pressed', 'true');

    const internals = container.querySelector('.schematic-part--internal');
    expect(internals).toHaveAttribute('aria-hidden', 'true');
    expect(internals).toHaveAttribute('tabindex', '-1');

    await user.click(
      screen.getByRole('button', { name: /^Ver por dentro$/ }),
    );
    expect(container.querySelector('.rover-schematic')).toHaveClass(
      'is-cutaway',
    );
    expect(internals).not.toHaveAttribute('aria-hidden');
    expect(internals).toHaveAttribute('tabindex', '0');
    expect(
      screen.getByRole('button', { name: /Núcleo interno ilustrativo/ }),
    ).toBeInTheDocument();
  });
});
