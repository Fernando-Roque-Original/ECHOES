import { Canvas } from '@react-three/fiber';
import { ArrowRight, Moon, Orbit, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Suspense, useMemo } from 'react';
import { BigButton } from '../components/BigButton';
import { EvidenceLabel } from '../components/EvidenceLabel';
import {
  silentWorlds,
  solarSystemBodies,
  type SolarSystemBody,
} from '../content/solarSystem';
import { supportsWebGL } from '../lib/webgl';
import { useExperienceStore } from '../state/experienceStore';
import { MilkyWayBackdrop, SolarSystem } from './SolarSystem';
import { WebGLFallback } from './WebGLCapability';

const staticOrbitRadii = [
  ...new Set(
    solarSystemBodies
      .filter((body) => body.id !== 'moon')
      .map((body) => body.orbitRadius),
  ),
];

function bodyPosition(spec: SolarSystemBody) {
  if (spec.id === 'moon') {
    const earth = solarSystemBodies.find((body) => body.id === 'earth')!;
    return {
      left:
        62 +
        Math.cos(earth.phase) * earth.orbitRadius * 4.2 +
        Math.cos(spec.phase) * 2.9,
      top:
        48 +
        Math.sin(earth.phase) * earth.orbitRadius * 2.8 +
        Math.sin(spec.phase) * 1.9,
    };
  }
  return {
    left: 62 + Math.cos(spec.phase) * spec.orbitRadius * 4.2,
    top: 48 + Math.sin(spec.phase) * spec.orbitRadius * 2.8,
  };
}

function StaticSolarSystem() {
  const selectWorld = useExperienceStore((state) => state.selectWorld);
  const openSilentWorld = useExperienceStore((state) => state.openSilentWorld);

  const activate = (body: SolarSystemBody) => {
    if (body.id === 'mars') selectWorld('mars');
    else if (body.id === 'moon') selectWorld('moon');
    else openSilentWorld(body.archiveCode);
  };

  return (
    <div className="static-solar" role="group" aria-label="Sistema Solar interativo">
      <span className="static-solar__sun" aria-hidden="true" />
      {staticOrbitRadii.map((radius) => (
        <span
          key={radius}
          className="static-solar__orbit"
          aria-hidden="true"
          style={{
            width: `${radius * 8.4}%`,
            height: `${radius * 5.6}%`,
          }}
        />
      ))}
      {solarSystemBodies.map((body) => {
        const position = bodyPosition(body);
        return (
          <button
            key={body.id}
            type="button"
            className={`static-world ${body.unlocked ? `is-open is-${body.id}` : 'is-locked'}`}
            style={{
              left: `${position.left}%`,
              top: `${position.top}%`,
              width: body.unlocked ? `${Math.max(34, body.radius * 190)}px` : '44px',
              height: body.unlocked ? `${Math.max(34, body.radius * 190)}px` : '44px',
            }}
            onClick={() => activate(body)}
            aria-label={
              body.id === 'mars'
                ? 'Marte, história disponível'
                : body.id === 'moon'
                  ? 'Lua, próxima história'
                  : `Mundo em silêncio, ${body.archiveCode}`
            }
          >
            {body.unlocked ? (
              <span>{body.id === 'mars' ? 'Marte' : 'Lua'}</span>
            ) : (
              <span
                className="static-world__dot"
                aria-hidden="true"
                style={{ background: body.tint }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function HomeSpace() {
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const startStory = useExperienceStore((state) => state.startStory);
  const selectWorld = useExperienceStore((state) => state.selectWorld);
  const openSilentWorld = useExperienceStore((state) => state.openSilentWorld);
  const webgl = useMemo(supportsWebGL, []);

  return (
    <section className="home-screen" aria-labelledby="home-title">
      <div
        className="home-screen__scene"
        role="group"
        aria-label="Sistema Solar interativo"
      >
        {webgl ? (
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 5.3, 10.7], fov: 38 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            <Suspense fallback={null}>
              <MilkyWayBackdrop />
            </Suspense>
            <SolarSystem reducedMotion={reducedMotion} />
          </Canvas>
        ) : (
          <StaticSolarSystem />
        )}
      </div>

      <div className="home-system-key" aria-hidden="true">
        <Orbit size={15} />
        <span>Sistema Solar</span>
        <small>2 liberados · 7 em silêncio</small>
      </div>

      <motion.div
        className="home-panel"
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reducedMotion ? 0.15 : 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="home-panel__kicker">
          <Sparkles aria-hidden="true" size={16} />
          Arquivo orbital · 2 mundos liberados
        </div>
        <h1 id="home-title">
          O sinal termina.
          <br />
          A luz continua.
        </h1>
        <p>
          Dois mundos guardam histórias reais. Os outros ainda esperam no
          silêncio.
        </p>
        <div className="home-world-status">
          <span>
            <i className="is-available" aria-hidden="true" />
            Marte
          </span>
          <span>
            <i className="is-available" aria-hidden="true" />
            Lua
          </span>
          <span>
            <i aria-hidden="true" />
            7 em silêncio
          </span>
        </div>
        <EvidenceLabel kind="textura-3d-nasa" compact />
        <div className="home-panel__actions">
          <BigButton onClick={startStory} showArrow>
            Começar no Opportunity
          </BigButton>
          <BigButton
            variant="secondary"
            icon={<Moon aria-hidden="true" size={19} />}
            onClick={() => selectWorld('moon')}
          >
            Entrar na Lua
          </BigButton>
          <button
            className="text-button"
            type="button"
            onClick={() => openSilentWorld(silentWorlds[0].archiveCode)}
          >
            Abrir os mundos em silêncio
            <ArrowRight aria-hidden="true" size={16} />
          </button>
        </div>
      </motion.div>

      <div className="home-screen__footer">
        <span>ECHOES · NASA Space Apps Challenge</span>
        <span>Marte: NASA · Via Láctea: ESO/S. Brunier, CC BY 4.0</span>
      </div>

      {!webgl ? (
        <div className="home-screen__webgl-note">
          <WebGLFallback
            title="Mapa celeste ilustrado"
            body="Sem WebGL, os mesmos mundos continuam acessíveis."
          />
        </div>
      ) : null}
    </section>
  );
}

