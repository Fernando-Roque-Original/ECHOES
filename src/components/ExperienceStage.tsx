import { Canvas } from '@react-three/fiber';
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { World } from '../app/queryState';
import {
  isIgnitionActive,
  type IgnitionState,
} from '../experience/ignitionMachine';
import { supportsWebGL } from '../lib/webgl';
import { MilkyWayBackdrop, SolarSystem } from '../scenes/SolarSystem';

type ExperienceStageProps = {
  focus: World | null;
  reducedMotion: boolean;
  orbitProgress: number;
  onSelect: (world: World) => void;
  ignitionEpoch: number;
  ignitionState: IgnitionState;
  selectionEnabled: boolean;
  onSceneReady: (epoch: number) => void;
  onEntrySettled: (epoch: number) => void;
  onSceneFallback?: (epoch: number) => void;
};

function StaticOrbit() {
  return (
    <div className="cine-static-orbit" aria-hidden="true">
      <span className="cine-static-orbit__sun" />
      {[18, 29, 40, 52, 65, 78, 91].map((size) => (
        <span
          className="cine-static-orbit__ring"
          key={size}
          style={{ width: `${size}%`, height: `${size}%` }}
        />
      ))}
      <span className="cine-static-orbit__planet is-mars" />
      <span className="cine-static-orbit__planet is-moon" />
      <span className="cine-static-orbit__planet is-earth" />
      <span className="cine-static-orbit__planet is-jupiter" />
    </div>
  );
}

export function ExperienceStage({
  focus,
  reducedMotion,
  orbitProgress,
  onSelect,
  ignitionEpoch,
  ignitionState,
  selectionEnabled,
  onSceneReady,
  onEntrySettled,
  onSceneFallback,
}: ExperienceStageProps) {
  const webgl = useMemo(supportsWebGL, []);
  const readyReported = useRef(false);
  const settledReported = useRef(false);
  const [sceneReady, setSceneReady] = useState(false);

  const reportReady = useCallback(
    (fallback = false) => {
      if (readyReported.current) return;
      readyReported.current = true;
      setSceneReady(true);
      if (fallback) onSceneFallback?.(ignitionEpoch);
      else onSceneReady(ignitionEpoch);
    },
    [ignitionEpoch, onSceneFallback, onSceneReady],
  );

  const reportSettled = useCallback(() => {
    if (settledReported.current) return;
    settledReported.current = true;
    onEntrySettled(ignitionEpoch);
  }, [ignitionEpoch, onEntrySettled]);

  useEffect(() => {
    if (webgl) return;
    reportReady(true);
  }, [reportReady, webgl]);

  useEffect(() => {
    if (webgl || ignitionState.phase !== 'entry') return;
    reportSettled();
  }, [ignitionState.phase, reportSettled, webgl]);

  return (
    <div
      className="cine-stage"
      aria-hidden="true"
      data-scene-ready={sceneReady}
    >
      {webgl ? (
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 5.3, 10.7], fov: 38 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
        >
          <Suspense fallback={null}>
            <MilkyWayBackdrop reducedMotion={reducedMotion} />
          </Suspense>
          <SolarSystem
            reducedMotion={reducedMotion}
            focus={focus}
            orbitProgress={orbitProgress}
            minimal
            onSelect={onSelect}
            ignitionStarted={isIgnitionActive(ignitionState)}
            ignitionInstant={
              reducedMotion ||
              ignitionState.phase === 'settled' ||
              ignitionState.phase === 'interactive'
            }
            selectionEnabled={selectionEnabled}
            onSceneReady={() => reportReady()}
            onSceneFallback={() => reportReady(true)}
            onEntrySettled={reportSettled}
          />
        </Canvas>
      ) : (
        <StaticOrbit />
      )}
      <span className="cine-stage__vignette" />
    </div>
  );
}
