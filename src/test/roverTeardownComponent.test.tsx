import {
  act,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';

const teardownMocks = vi.hoisted(() => ({
  useGLTF: vi.fn(),
  orbitControlProps: [] as Record<string, unknown>[],
  modelMounts: 0,
  modelUnmounts: 0,
}));

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>();

  class PMREMGenerator {
    fromScene() {
      return {
        texture: { dispose: vi.fn() },
        dispose: vi.fn(),
      };
    }

    dispose() {}
  }

  return { ...actual, PMREMGenerator };
});

vi.mock('three/addons/environments/RoomEnvironment.js', () => ({
  RoomEnvironment: class {
    dispose() {}
  },
}));

vi.mock('@react-three/fiber', async () => {
  const React = await import('react');

  return {
    Canvas: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'r3f-canvas' }, children),
    useFrame: () => undefined,
    useThree: (
      selector: (state: {
        controls: null;
        gl: Record<string, never>;
        scene: {
          environment: THREE.Texture | null;
          environmentIntensity: number;
        };
      }) => unknown,
    ) =>
      selector({
        controls: null,
        gl: {},
        scene: {
          environment: null,
          environmentIntensity: 0,
        },
      }),
  };
});

vi.mock('@react-three/drei', async () => {
  const React = await import('react');

  return {
    ContactShadows: () => null,
    OrbitControls: (props: Record<string, unknown>) => {
      teardownMocks.orbitControlProps.push(props);
      return React.createElement('div', {
        'data-testid': 'orbit-controls',
      });
    },
    useGLTF: (url: string) => {
      React.useEffect(() => {
        teardownMocks.modelMounts += 1;
        return () => {
          teardownMocks.modelUnmounts += 1;
        };
      }, []);

      return teardownMocks.useGLTF(url);
    },
  };
});

import RoverTeardown from '../components/RoverTeardown';

beforeEach(() => {
  teardownMocks.useGLTF.mockReset();
  teardownMocks.useGLTF.mockImplementation(() => ({
    scene: new THREE.Object3D(),
  }));
  teardownMocks.orbitControlProps.length = 0;
  teardownMocks.modelMounts = 0;
  teardownMocks.modelUnmounts = 0;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('RoverTeardown integration safeguards', () => {
  it('does not request the GLB while inactive and mounts it when activated', () => {
    const { rerender } = render(
      <RoverTeardown reducedMotion={false} active={false} />,
    );

    expect(teardownMocks.useGLTF).not.toHaveBeenCalled();

    rerender(<RoverTeardown reducedMotion={false} active />);

    expect(teardownMocks.useGLTF).toHaveBeenCalled();
  });

  it('retains the model during the exit hysteresis before unmounting it', async () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <RoverTeardown reducedMotion={false} active />,
    );

    await act(async () => undefined);
    expect(teardownMocks.modelMounts).toBe(1);

    rerender(<RoverTeardown reducedMotion={false} active={false} />);
    expect(teardownMocks.modelUnmounts).toBe(0);

    act(() => vi.advanceTimersByTime(359));
    expect(teardownMocks.modelUnmounts).toBe(0);

    act(() => vi.advanceTimersByTime(1));
    expect(teardownMocks.modelUnmounts).toBe(1);
  });

  it('locks orbit controls and layer actions during scroll-driven playback', async () => {
    render(<RoverTeardown reducedMotion={false} progress={0.52} />);

    await screen.findByTestId('orbit-controls');
    const controls = teardownMocks.orbitControlProps.at(-1);
    expect(controls).toMatchObject({
      enabled: false,
      enableRotate: false,
      autoRotate: false,
      enableDamping: false,
    });

    const layers = screen.getByRole('group', {
      name: 'Camadas de materiais do modelo',
    });
    for (const button of within(layers).getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
  });

  it('freezes the scroll timeline and enables exploration on demand', async () => {
    render(<RoverTeardown reducedMotion={false} progress={0.52} />);

    await screen.findByTestId('orbit-controls');
    fireEvent.click(
      screen.getByRole('button', { name: 'Explorar em 3D' }),
    );

    expect(teardownMocks.orbitControlProps.at(-1)).toMatchObject({
      enabled: true,
      enableRotate: true,
    });
    expect(document.body.style.overflow).toBe('hidden');

    const layers = screen.getByRole('group', {
      name: 'Camadas de materiais do modelo',
    });
    for (const button of within(layers).getAllByRole('button')) {
      expect(button).toBeEnabled();
    }

    fireEvent.click(
      screen.getByRole('button', { name: 'Voltar ao percurso' }),
    );

    expect(teardownMocks.orbitControlProps.at(-1)).toMatchObject({
      enabled: false,
      enableRotate: false,
    });
    expect(document.body.style.overflow).toBe('');
  });

  it('keeps the schematic interactive while it is visible', () => {
    render(<RoverTeardown reducedMotion={false} progress={0.82} />);

    const overlay = screen.getByTestId('schematic-overlay');
    expect(overlay).not.toHaveAttribute('aria-hidden');
    expect(overlay).not.toHaveAttribute('inert');
    expect(overlay).toHaveStyle({ pointerEvents: 'auto' });

    fireEvent.click(
      within(overlay).getByRole('button', { name: 'Explodir' }),
    );
    expect(within(overlay).getByText('100%')).toBeInTheDocument();

    const separation = within(overlay).getByRole('slider', {
      name: /Separação das peças/,
    });
    fireEvent.change(separation, { target: { value: '73' } });
    expect(within(overlay).getByText('73%')).toBeInTheDocument();

    fireEvent.click(
      within(overlay).getByRole('button', { name: 'Ver por dentro' }),
    );
    expect(overlay.querySelector('.rover-schematic')).toHaveClass(
      'is-cutaway',
    );
  });
});
