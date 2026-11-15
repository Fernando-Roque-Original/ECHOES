import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type MarsSphereProps = {
  radius?: number;
  rotationSpeed?: number;
  onSelect?: () => void;
};

export function NasaMarsSphere({
  radius = 1.6,
  rotationSpeed = 0.03,
  onSelect,
}: MarsSphereProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [colorTexture, normalTexture, roughnessTexture] = useTexture([
    '/assets/maps/mars-viking-mdim-color-2k.jpg',
    '/assets/maps/mars-viking-mdim-normal-1k.jpg',
    '/assets/maps/mars-viking-mdim-roughness-1k.jpg',
  ]) as [THREE.Texture, THREE.Texture, THREE.Texture];
  const maps = useMemo(() => {
    const color = colorTexture.clone();
    const normal = normalTexture.clone();
    const roughness = roughnessTexture.clone();

    for (const texture of [color, normal, roughness]) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.anisotropy = 8;
      texture.needsUpdate = true;
    }

    color.colorSpace = THREE.SRGBColorSpace;
    normal.colorSpace = THREE.NoColorSpace;
    roughness.colorSpace = THREE.NoColorSpace;

    return { color, normal, roughness };
  }, [colorTexture, normalTexture, roughnessTexture]);

  useLayoutEffect(() => {
    if (mesh.current) mesh.current.rotation.y = -0.72;
  }, []);

  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += Math.min(delta, 0.05) * rotationSpeed;
      const targetScale = hovered && onSelect ? 1.025 : 1;
      mesh.current.scale.setScalar(
        THREE.MathUtils.lerp(
          mesh.current.scale.x,
          targetScale,
          Math.min(1, delta * 8),
        ),
      );
    }
  });

  return (
    <>
      <mesh
        ref={mesh}
        castShadow
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          onSelect?.();
        }}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = '';
        }}
      >
        <sphereGeometry args={[radius, 96, 96]} />
        <meshStandardMaterial
          map={maps.color}
          normalMap={maps.normal}
          normalScale={[0.45, 0.45]}
          roughnessMap={maps.roughness}
          roughness={0.97}
          metalness={0}
          color="#ffffff"
        />
      </mesh>
    </>
  );
}

useTexture.preload('/assets/maps/mars-viking-mdim-color-2k.jpg');
useTexture.preload('/assets/maps/mars-viking-mdim-normal-1k.jpg');
useTexture.preload('/assets/maps/mars-viking-mdim-roughness-1k.jpg');

