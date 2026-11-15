import { Canvas, useFrame } from '@react-three/fiber';
import { Orbit, Radio } from 'lucide-react';
import { motion } from 'motion/react';
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
} from 'react';
import type * as THREE from 'three';
import { BigButton } from '../components/BigButton';
import { EvidenceLabel } from '../components/EvidenceLabel';
import { supportsWebGL } from '../lib/webgl';
import { useExperienceStore } from '../state/experienceStore';
import { IllustrativePlanet } from './IllustrativePlanet';
import { NasaMarsSphere } from './NasaMarsSphere';
import { PlanetErrorBoundary } from './PlanetErrorBoundary';
import { WebGLFallback } from './WebGLCapability';

function ApproachScene({
  reducedMotion,
  demoMode,
  hold,
}: {
  reducedMotion: boolean;
  demoMode: boolean;
  hold: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const progress = useRef(0);

  useFrame((state, delta) => {
    const duration = reducedMotion ? 0.2 : demoMode ? 1.05 : 1.5;
    progress.current = hold
      ? 0.72
      : Math.min(1, progress.current + delta / duration);
    const eased = 1 - Math.pow(1 - progress.current, 3);
    if (group.current) {
      group.current.scale.setScalar(0.82 + eased * 0.35);
      group.current.rotation.z = -0.08 + eased * 0.035;
    }
    state.camera.position.z = 8.8 - eased * 2.7;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.22} color="#b8c8db" />
      <hemisphereLight args={['#ffe1c7', '#293747', 0.65]} />
      <directionalLight position={[5, 4, 5]} intensity={4.9} color="#ffd1aa" />
      <directionalLight position={[-5, -2, 2]} intensity={1.35} color="#6488aa" />
      <directionalLight position={[-4, 2, -4]} intensity={2.1} color="#6b95c0" />
      <group ref={group}>
        <Suspense
          fallback={<IllustrativePlanet world="mars" radius={1.82} />}
        >
          <PlanetErrorBoundary
            fallback={<IllustrativePlanet world="mars" radius={1.82} />}
          >
            <NasaMarsSphere radius={1.68} rotationSpeed={reducedMotion ? 0 : 0.045} />
          </PlanetErrorBoundary>
        </Suspense>
      </group>
    </>
  );
}

export function PlanetApproach() {
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const demoMode = useExperienceStore((state) => state.demoMode);
  const finishApproach = useExperienceStore((state) => state.finishApproach);
  const webgl = useMemo(supportsWebGL, []);
  const hold = useMemo(
    () => new URLSearchParams(window.location.search).get('hold') === '1',
    [],
  );

  useEffect(() => {
    if (hold) return;
    const timer = window.setTimeout(
      finishApproach,
      reducedMotion ? 420 : demoMode ? 1350 : 1900,
    );
    return () => window.clearTimeout(timer);
  }, [demoMode, finishApproach, hold, reducedMotion]);

  return (
    <section className="approach-screen" aria-labelledby="approach-title">
      <div className="approach-screen__scene" aria-hidden="true">
        {webgl ? (
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 8.8], fov: 38 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            <ApproachScene
              reducedMotion={reducedMotion}
              demoMode={demoMode}
              hold={hold}
            />
          </Canvas>
        ) : (
          <div className="approach-screen__static" />
        )}
      </div>
      <div
        className={`arrival-fx ${reducedMotion ? 'is-reduced' : ''} ${hold ? 'is-held' : ''}`}
        style={
          {
            '--arrival-duration': demoMode ? '1.35s' : '1.9s',
          } as CSSProperties
        }
        aria-hidden="true"
      >
        <span className="arrival-fx__warp" />
        <span className="arrival-fx__rim" />
        <span className="arrival-fx__flash" />
      </div>
      <motion.div
        className="approach-copy"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reducedMotion ? 0.12 : 0.55 }}
      >
        <div className="approach-copy__signal">
          <Radio aria-hidden="true" />
          <span>Sinal recebido</span>
        </div>
        <p className="eyebrow">22° 16′ S · 5° 28′ W</p>
        <h1 id="approach-title">Chegando a Marte.</h1>
        <p>Um mundo de poeira, pedras e histórias preservadas no silêncio.</p>
        <EvidenceLabel kind="textura-3d-nasa" compact />
      </motion.div>
      <div className="approach-screen__bottom">
        <div className="approach-trace" aria-hidden="true">
          <span />
          <Orbit size={20} />
        </div>
        <BigButton variant="secondary" onClick={finishApproach} showArrow>
          Pular aproximação
        </BigButton>
      </div>
      {!webgl ? (
        <div className="approach-screen__fallback">
          <WebGLFallback />
          <BigButton onClick={finishApproach} showArrow>
            Seguir para o mapa
          </BigButton>
        </div>
      ) : null}
    </section>
  );
}

