import { ContactShadows, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PlanetErrorBoundary } from './PlanetErrorBoundary';

function ExhibitEnvironment() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const generator = new THREE.PMREMGenerator(gl);
    const environment = new RoomEnvironment();
    const renderTarget = generator.fromScene(environment, 0.04);
    scene.environment = renderTarget.texture;
    scene.environmentIntensity = 0.72;
    environment.dispose();
    generator.dispose();

    return () => {
      scene.environment = null;
      renderTarget.dispose();
    };
  }, [gl, scene]);

  return null;
}

function RoverModel() {
  const group = useRef<THREE.Group>(null);
  const source = useGLTF('/assets/artifacts/opportunity-rover.glb').scene;
  const model = useMemo(() => source.clone(true), [source]);

  useLayoutEffect(() => {
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = 4.85 / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(scale);
    model.position.copy(center).multiplyScalar(-scale);
    model.rotation.y = 0.58;
  }, [model]);

  useFrame((state) => {
    if (!group.current) return;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.035;
  });

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
}

function ArtifactFallback() {
  return (
    <mesh position={[0, -0.7, 0]}>
      <boxGeometry args={[2.8, 0.35, 4.4]} />
      <meshStandardMaterial color="#b2764f" roughness={0.82} />
    </mesh>
  );
}

type RoverViewerProps = {
  resetKey: number;
  reducedMotion: boolean;
};

export default function RoverViewer({ resetKey, reducedMotion }: RoverViewerProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [5.3, 3.65, 5.95], fov: 36 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.28;
      }}
    >
      <color attach="background" args={['#101b28']} />
      <fog attach="fog" args={['#101b28', 11, 22]} />
      <ExhibitEnvironment />
      <ambientLight intensity={0.92} color="#b9c7d4" />
      <hemisphereLight args={['#ffd2b0', '#13202b', 1.05]} />
      <directionalLight
        position={[4.8, 6.2, 3.8]}
        intensity={6.3}
        color="#ffd8b3"
        castShadow
      />
      <directionalLight position={[-4.5, 2, -3]} intensity={3.8} color="#6c9dc4" />
      <directionalLight position={[-3, 1, 4]} intensity={2.2} color="#8fb8cc" />
      <spotLight
        position={[0, 7, 1]}
        angle={0.45}
        penumbra={0.8}
        intensity={88}
        color="#f2c26b"
      />

      <Suspense fallback={<ArtifactFallback />}>
        <PlanetErrorBoundary fallback={<ArtifactFallback />}>
          <RoverModel />
        </PlanetErrorBoundary>
      </Suspense>

      <mesh position={[0, -1.65, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.7, 96]} />
        <meshStandardMaterial color="#161f27" roughness={0.88} />
      </mesh>
      <mesh position={[0, -1.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.9, 2.94, 128]} />
        <meshBasicMaterial color="#f2c26b" transparent opacity={0.5} />
      </mesh>
      <ContactShadows
        position={[0, -1.58, 0]}
        opacity={0.58}
        scale={9}
        blur={2.8}
        far={5}
        color="#05080c"
      />
      <OrbitControls
        key={resetKey}
        makeDefault
        target={[0, -0.1, 0.1]}
        enablePan={false}
        minDistance={4.4}
        maxDistance={10}
        minPolarAngle={0.62}
        maxPolarAngle={1.42}
        autoRotate={false}
        enableDamping={!reducedMotion}
      />
    </Canvas>
  );
}

useGLTF.preload('/assets/artifacts/opportunity-rover.glb');

