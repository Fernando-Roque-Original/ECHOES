import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ArchiveExperience } from '../app/ArchiveExperience';

describe('archive experience', () => {
  it('preserves both current journeys without rendering WebGL', () => {
    const { container } = render(<ArchiveExperience />);

    expect(
      screen.getByRole('heading', { name: 'Jornada de Marte' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Jornada da Lua' }),
    ).toBeInTheDocument();
    expect(screen.getByText('10 de junho de 2018')).toBeInTheDocument();
    expect(screen.getByText('Exosfera fina')).toBeInTheDocument();
    expect(screen.queryByText('Sem vento')).not.toBeInTheDocument();
    expect(container.querySelector('canvas')).not.toBeInTheDocument();
  });

  it('keeps the exact Opportunity facts in the linear version', () => {
    render(<ArchiveExperience />);

    expect(screen.getAllByText('45,16 km').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Evidências de ambientes antigos com água/).length,
    ).toBeGreaterThan(0);
  });
});
