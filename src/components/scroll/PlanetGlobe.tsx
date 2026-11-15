import { useTexture } from '@react-three/drei';
import {
  Canvas,
  useFrame,
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

const CAMERA_FOV = 32;
const DEFAULT_ROTATION_SPEED = 0.075;

export type PlanetGlobeProps = {
  texturePath: string;
  normalMapPath?: string;
  roughnessMapPath?: string;
  tint?: string;
  initialRotation?: [number, number, number];
  autoRotationSpeed?: number;
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

type PlanetGlobeSceneProps = PlanetGlobeProps & {
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

function PlanetPlaceholder({ tint }: { tint: string }) {
  return (
    <>
      <mesh>
        <sphereGeometry args={[1, 64, 48]} />
        <meshStandardMaterial
          color={tint}
          roughness={1}
          metalness={0}
        />
      </mesh>
      <mesh scale={1.002}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial
          color={tint}
          transparent
          opacity={0.24}
          wireframe
        />
      </mesh>
    </>
  );
}

function PlanetSurface({
  texturePath,
  normalMapPath,
  roughnessMapPath,
  tint,
}: Pick<
  PlanetGlobeProps,
  'texturePath' | 'normalMapPath' | 'roughnessMapPath' | 'tint'
>) {
  const texturePaths = useMemo(
    () =>
      [texturePath, normalMapPath, roughnessMapPath].filter(
        (path): path is string => Boolean(path),
      ),
    [normalMapPath, roughnessMapPath, texturePath],
  );
  const loadedTextures = useTexture(texturePaths) as THREE.Texture[];
  const renderer = useThree((state) => state.gl);
  const maps = useMemo(() => {
    const [colorSource, normalSource, roughnessSource] = loadedTextures;
    const color = colorSource.clone();
    const normal = normalSource?.clone();
    const roughness = roughnessSource?.clone();

    for (const texture of [color, normal, roughness]) {
      if (!texture) continue;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.anisotropy = Math.min(
        8,
        renderer.capabilities.getMaxAnisotropy(),
      );
      texture.needsUpdate = true;
    }

    color.colorSpace = THREE.SRGBColorSpace;
    if (normal) normal.colorSpace = THREE.NoColorSpace;
    if (roughness) roughness.colorSpace = THREE.NoColorSpace;

    return { color, normal, roughness };
  }, [loadedTextures, renderer]);

  useEffect(
    () => () => {
      maps.color.dispose();
      maps.normal?.dispose();
      maps.roughness?.dispose();
    },
    [maps],
  );

  return (
    <mesh>
      <sphereGeometry args={[1, 256, 192]} />
      <meshStandardMaterial
        map={maps.color}
        normalMap={maps.normal}
        normalScale={[0.55, 0.55]}
        roughnessMap={maps.roughness}
        color={tint ?? '#ffffff'}
        roughness={0.92}
        metalness={0}
      />
    </mesh>
  );
}

function PlanetGlobeScene({
  texturePath,
  normalMapPath,
  roughnessMapPath,
  tint = '#ffffff',
  initialRotation = [0.1, -0.55, 0.06],
  autoRotationSpeed = DEFAULT_ROTATION_SPEED,
  progress,
  active,
  reducedMotion,
}: PlanetGlobeSceneProps) {
  const globeRef = useRef<THREE.Group>(null);
  const { camera, invalidate, size } = useThree();
  const animate = active && !reducedMotion;
  const target = getGlobeTarget(
    progress,
    size.width,
    size.height,
  );

  useLayoutEffect(() => {
    const globe = globeRef.current;
    if (animate) {
      invalidate();
      return;
    }

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
    globe.rotation.y += safeDelta * autoRotationSpeed;
    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      target.cameraZ,
      damping,
    );
  });

  return (
    <>
      <ambientLight intensity={0.055} color="#b7c5d8" />
      <directionalLight
        position={[4.2, 2.4, 4.8]}
        intensity={5.2}
        color="#fff0d8"
      />
      <directionalLight
        position={[-4, -1.4, -3.2]}
        intensity={0.26}
        color="#728dca"
      />

      <group
        ref={globeRef}
        rotation={initialRotation}
        scale={0.68}
      >
        <Suspense fallback={<PlanetPlaceholder tint={tint} />}>
          <PlanetSurface
            texturePath={texturePath}
            normalMapPath={normalMapPath}
            roughnessMapPath={roughnessMapPath}
            tint={tint}
          />
        </Suspense>
      </group>
    </>
  );
}

export function PlanetGlobe({
  texturePath,
  normalMapPath,
  roughnessMapPath,
  tint = '#ffffff',
  initialRotation = [0.1, -0.55, 0.06],
  autoRotationSpeed = DEFAULT_ROTATION_SPEED,
  progress = 1,
  active = true,
  reducedMotion = false,
  className = '',
}: PlanetGlobeProps) {
  const animate = active && !reducedMotion;

  return (
    <div
      className={`planet-globe ${className}`.trim()}
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
        <PlanetGlobeScene
          texturePath={texturePath}
          normalMapPath={normalMapPath}
          roughnessMapPath={roughnessMapPath}
          tint={tint}
          initialRotation={initialRotation}
          autoRotationSpeed={autoRotationSpeed}
          progress={progress}
          active={active}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </div>
  );
}
