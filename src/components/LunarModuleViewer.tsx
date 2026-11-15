import { OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PlanetErrorBoundary } from '../scenes/PlanetErrorBoundary';

const MODEL_URL = '/assets/artifacts/apollo-lunar-module.glb';
const NORMALIZED_SIZE = 3.8;
const EXIT_HYSTERESIS_MS = 420;

type LunarModuleViewerProps = {
  active: boolean;
  reducedMotion: boolean;
  scrollDriven: boolean;
  progress: number;
  loadingLabel: string;
  fallbackLabel: string;
};

function ViewerEnvironment() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const generator = new THREE.PMREMGenerator(gl);
    const environment = new RoomEnvironment();
    const target = generator.fromScene(environment, 0.05);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.82;
    environment.dispose();
    generator.dispose();

    return () => {
      scene.environment = null;
      target.dispose();
    };
  }, [gl, scene]);

  return null;
}

function ApolloModel({
  progress,
  scrollDriven,
  reducedMotion,
}: {
  progress: number;
  scrollDriven: boolean;
  reducedMotion: boolean;
}) {
  const source = useGLTF(MODEL_URL).scene;
  const rig = useRef<THREE.Group>(null);
  const normalized = useMemo(() => {
    const model = source.clone(true);
    const bounds = new THREE.Box3().setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const largestSide = Math.max(size.x, size.y, size.z) || 1;
    return {
      model,
      center,
      scale: NORMALIZED_SIZE / largestSide,
    };
  }, [source]);

  useFrame((state, delta) => {
    if (!rig.current) return;
    const damping = reducedMotion ? 1 : 1 - Math.exp(-4.8 * delta);
    const scrollTurn = scrollDriven ? (progress - 0.5) * 0.9 : 0;
    const breathing = reducedMotion
      ? 0
      : Math.sin(state.clock.elapsedTime * 0.48) * 0.035;

    rig.current.rotation.y = THREE.MathUtils.lerp(
      rig.current.rotation.y,
      -0.68 + scrollTurn + breathing,
      damping,
    );
    rig.current.position.y = reducedMotion
      ? 0
      : Math.sin(state.clock.elapsedTime * 0.56) * 0.045;
  });

  return (
    <group
      ref={rig}
      rotation={[0.08, -0.68, 0]}
      position={[0, -0.05, 0]}
    >
      <group
        scale={normalized.scale}
        position={[
          -normalized.center.x * normalized.scale,
          -normalized.center.y * normalized.scale,
          -normalized.center.z * normalized.scale,
        ]}
      >
        <primitive object={normalized.model} />
      </group>
    </group>
  );
}

function LoadingEagle() {
  return (
    <group>
      <mesh rotation={[0.16, 0.54, 0]}>
        <boxGeometry args={[2.7, 1.8, 1.8]} />
        <meshStandardMaterial
          color="#d7ad61"
          wireframe
          transparent
          opacity={0.48}
        />
      </mesh>
      <mesh position={[0, -1.55, 0]}>
        <coneGeometry args={[0.48, 0.8, 24, 1, true]} />
        <meshStandardMaterial
          color="#9acbd4"
          wireframe
          transparent
          opacity={0.42}
        />
      </mesh>
    </group>
  );
}

export function LunarModuleViewer({
  active,
  reducedMotion,
  scrollDriven,
  progress,
  loadingLabel,
  fallbackLabel,
}: LunarModuleViewerProps) {
  const [keepMounted, setKeepMounted] = useState(active);

  useEffect(() => {
    if (active) {
      setKeepMounted(true);
      return;
    }
    const timer = window.setTimeout(
      () => setKeepMounted(false),
      EXIT_HYSTERESIS_MS,
    );
    return () => window.clearTimeout(timer);
  }, [active]);

  return (
    <div className="lunar-viewer" aria-hidden="true">
      <PlanetErrorBoundary
        fallback={<p className="lunar-viewer__fallback">{fallbackLabel}</p>}
      >
        <Canvas
          dpr={[1, 1.65]}
          frameloop={active ? 'always' : 'demand'}
          camera={{ position: [5.8, 3.4, 6.4], fov: 35 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.18;
          }}
        >
          <ViewerEnvironment />
          <ambientLight intensity={0.7} color="#c6d2dc" />
          <hemisphereLight args={['#ffe2b7', '#10161b', 1.15]} />
          <directionalLight
            position={[4.5, 6.4, 4]}
            intensity={5.8}
            color="#ffe0b3"
          />
          <directionalLight
            position={[-4.2, 1.2, -3.4]}
            intensity={3.1}
            color="#7ca8c7"
          />
          <spotLight
            position={[0, 6.5, 2.5]}
            angle={0.42}
            penumbra={0.8}
            intensity={72}
            color="#f2c26b"
          />

          <Suspense fallback={<LoadingEagle />}>
            {keepMounted ? (
              <ApolloModel
                progress={progress}
                scrollDriven={scrollDriven}
                reducedMotion={reducedMotion}
              />
            ) : null}
          </Suspense>

          <mesh
            position={[0, -2.72, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[2.7, 2.73, 128]} />
            <meshBasicMaterial
              color="#f2c26b"
              transparent
              opacity={0.34}
            />
          </mesh>

          <OrbitControls
            makeDefault
            enabled={active && !scrollDriven}
            enablePan={false}
            enableZoom={false}
            enableRotate={active && !scrollDriven}
            autoRotate={active && !scrollDriven && !reducedMotion}
            autoRotateSpeed={0.42}
            enableDamping={!reducedMotion}
            target={[0, -0.08, 0]}
            minPolarAngle={0.62}
            maxPolarAngle={1.42}
          />
        </Canvas>
      </PlanetErrorBoundary>
    </div>
  );
}
