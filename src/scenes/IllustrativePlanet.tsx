import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { marsTexture, moonTexture } from './planetTextures';

export function IllustrativePlanet({
  world,
  radius = 1.5,
  rotationSpeed = 0.03,
  onSelect,
}: {
  world: 'mars' | 'moon';
  radius?: number;
  rotationSpeed?: number;
  onSelect?: () => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const texture = useMemo(
    () => (world === 'mars' ? marsTexture() : moonTexture()),
    [world],
  );

  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += Math.min(delta, 0.05) * rotationSpeed;
    }
  });

  return (
    <mesh
      ref={mesh}
      castShadow
      receiveShadow
      onClick={(event) => {
        if (!onSelect) return;
        event.stopPropagation();
        onSelect();
      }}
      onPointerOver={() => {
        if (onSelect) document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = '';
      }}
    >
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial map={texture} roughness={0.9} metalness={0.02} />
    </mesh>
  );
}

