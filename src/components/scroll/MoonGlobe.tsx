import {
  Canvas,
  useFrame,
  useLoader,
  useThree,
} from '@react-three/fiber';
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import * as THREE from 'three';

const MOON_TEXTURE_PATH =
  '/assets/planets/moon-solarsystemscope.jpg';
const CAMERA_FOV = 32;
const AUTO_ROTATION_SPEED = 0.075;

export type MoonGlobeProps = {
  /**
   * Scroll-driven framing, clamped to the 0..1 range.
   * 0 = distant entrance; 1 = close, fully revealed globe.
   */
  progress?: number;
  /** Enables auto-rotation and continuous animation while visible. */
  active?: boolean;
  /** Removes auto-rotation and snaps framing changes instantly. */
  reducedMotion?: boolean;
  /** Applied to the component root, which fills its CSS container. */
  className?: string;
};

type MoonGlobeSceneProps = {
  progress: number;
  active: boolean;
  reducedMotion: boolean;
};

type GlobeTarget = {
  cameraZ: number;
  scale: number;
};

function clampProgress(progress: number) {
  if (!Number.isFinite(progress)) return 0;
  return THREE.MathUtils.clamp(progress, 0, 1);
}

function smoothProgress(progress: number) {
  const clamped = clampProgress(progress);
  return clamped * clamped * (3 - 2 * clamped);
}

function getGlobeTarget(
  progress: number,
  width: number,
  height: number,
): GlobeTarget {
  const revealed = smoothProgress(progress);
  const aspect = Math.max(width, 1) / Math.max(height, 1);
  const halfFov = THREE.MathUtils.degToRad(CAMERA_FOV * 0.5);
  const verticalFit = 1 / Math.tan(halfFov);
  const horizontalFit = 1 / (Math.tan(halfFov) * aspect);
  const fittedDistance = Math.max(verticalFit, horizontalFit) * 1.1;

  return {
    cameraZ: THREE.MathUtils.lerp(
      fittedDistance + 2.2,
      fittedDistance,
      revealed,
    ),
    scale: THREE.MathUtils.lerp(0.68, 1, revealed),
  };
}

function MoonPlaceholder() {
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 48]} />
      <meshStandardMaterial
        color="#414347"
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

function MoonSurface() {
  const texture = useLoader(
    THREE.TextureLoader,
    MOON_TEXTURE_PATH,
  );
  const renderer = useThree((state) => state.gl);
  const map = useMemo(() => {
    const next = texture.clone();
    next.colorSpace = THREE.SRGBColorSpace;
    next.wrapS = THREE.RepeatWrapping;
    next.wrapT = THREE.ClampToEdgeWrapping;
    next.anisotropy = Math.min(
      8,
      renderer.capabilities.getMaxAnisotropy(),
    );
    next.needsUpdate = true;
    return next;
  }, [renderer, texture]);

  useEffect(() => () => map.dispose(), [map]);

  return (
    <mesh>
      <sphereGeometry args={[1, 256, 192]} />
      <meshStandardMaterial
        map={map}
        color="#ffffff"
        roughness={0.97}
        metalness={0}
      />
    </mesh>
  );
}

function MoonGlobeScene({
  progress,
  active,
  reducedMotion,
}: MoonGlobeSceneProps) {
  const globeRef = useRef<THREE.Group>(null);
  const { camera, invalidate, size } = useThree();
  const animate = active && !reducedMotion;
  const target = getGlobeTarget(
    progress,
    size.width,
    size.height,
  );

  useLayoutEffect(() => {
    if (animate) {
      invalidate();
      return;
    }

    const globe = globeRef.current;
    if (globe) globe.scale.setScalar(target.scale);
    camera.position.z = target.cameraZ;
    invalidate();
  }, [
    animate,
    camera,
    invalidate,
    target.cameraZ,
    target.scale,
  ]);

  useFrame((_, delta) => {
    const globe = globeRef.current;
    if (!globe || !animate) return;

    const safeDelta = Math.min(delta, 0.05);
    const damping = 1 - Math.exp(-5.5 * safeDelta);
    const nextScale = THREE.MathUtils.lerp(
      globe.scale.x,
      target.scale,
      damping,
    );

    globe.scale.setScalar(nextScale);
    globe.rotation.y += safeDelta * AUTO_ROTATION_SPEED;
    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      target.cameraZ,
      damping,
    );
  });

  return (
    <>
      <ambientLight intensity={0.035} color="#b7c5d8" />
      <directionalLight
        position={[4.2, 2.4, 4.8]}
        intensity={5.4}
        color="#fff0d8"
      />
      <directionalLight
        position={[-4, -1.4, -3.2]}
        intensity={0.2}
        color="#728dca"
      />

      <group
        ref={globeRef}
        rotation={[0.1, -0.55, 0.06]}
        scale={0.68}
      >
        <Suspense fallback={<MoonPlaceholder />}>
          <MoonSurface />
        </Suspense>
      </group>
    </>
  );
}

export function MoonGlobe({
  progress = 1,
  active = true,
  reducedMotion = false,
  className = '',
}: MoonGlobeProps) {
  const animate = active && !reducedMotion;

  return (
    <div
      className={`moon-globe ${className}`.trim()}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 1,
      }}
      aria-hidden="true"
    >
      <Canvas
        frameloop={animate ? 'always' : 'demand'}
        dpr={[1, 2]}
        camera={{
          position: [0, 0, 6],
          fov: CAMERA_FOV,
          near: 0.1,
          far: 100,
        }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        style={{ display: 'block', width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
        }}
      >
        <MoonGlobeScene
          progress={progress}
          active={active}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </div>
  );
}
