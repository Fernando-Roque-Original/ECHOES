import { ContactShadows, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  ArrowUpRight,
  Layers,
  Maximize2,
  MousePointer2,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
} from 'lucide-react';
import {
  Suspense,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  getTeardownLayerByMaterial,
  roverTeardownMaterialCount,
  roverTeardownLayers,
  type RoverTeardownLayer,
  type RoverTeardownLayerId,
} from '../content/roverTeardown';
import {
  TEARDOWN_FEATURED_LAYER_ORDER,
  getTeardownLayerStaggerAmount,
  getTeardownTimelineState,
} from '../content/teardownTimeline';
import { getRoverTeardownCopy } from '../i18n/roverTeardown';
import type { Locale } from '../i18n/types';
import { PlanetErrorBoundary } from '../scenes/PlanetErrorBoundary';
import { RoverSchematic } from './RoverSchematic';

const MODEL_URL = '/assets/artifacts/opportunity-rover.glb';
const MODEL_SIZE = 4.85;
const MODEL_EXIT_HYSTERESIS_MS = 360;

type RoverTeardownProps = {
  reducedMotion: boolean;
  locale?: Locale;
  className?: string;
  progress?: number;
  active?: boolean;
};

type TeardownAnnouncement =
  | { kind: 'initial' }
  | { kind: 'selected'; layerId: RoverTeardownLayerId }
  | { kind: 'tour'; layerId: RoverTeardownLayerId }
  | { kind: 'reassembled' }
  | { kind: 'tour-paused' }
  | { kind: 'tour-started' }
  | { kind: 'all-open' }
  | { kind: 'explore-started' }
  | { kind: 'explore-ended' }
  | { kind: 'separation'; percent: number };

type RuntimeLayer = {
  definition: RoverTeardownLayer;
  group: THREE.Group;
  materials: Set<THREE.Material>;
  focus: THREE.Vector3;
  visualOrder: number;
};

type TeardownRuntime = {
  assembly: THREE.Group;
  layers: RuntimeLayer[];
  center: THREE.Vector3;
  scale: number;
  dispose: () => void;
};

type OrbitLike = {
  target: THREE.Vector3;
  update: () => void;
};

type GeometryGroup = {
  start: number;
  count: number;
  materialIndex?: number;
};

function makeMaterialClone(
  material: THREE.Material,
  materialCache: Map<string, THREE.Material>,
) {
  const cached = materialCache.get(material.uuid);
  if (cached) return cached;

  const clone = material.clone();
  clone.name = material.name;
  clone.userData.teardownOpacity = material.opacity;
  clone.userData.teardownDepthWrite = material.depthWrite;
  const standard = clone as THREE.MeshStandardMaterial;
  if (standard.emissive?.isColor) {
    clone.userData.teardownEmissive = standard.emissive.getHexString();
    clone.userData.teardownEmissiveIntensity =
      standard.emissiveIntensity ?? 0;
  }
  materialCache.set(material.uuid, clone);
  return clone;
}

/**
 * The source GLB exposes material groups rather than independent mechanical
 * assemblies. We split its indexed ranges into visual layers for this
 * educational treatment; the grouping and movement are interpretive, not a
 * service procedure or a literal disassembly sequence.
 */
function buildTeardownRuntime(source: THREE.Object3D): TeardownRuntime {
  source.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(source);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const largestSide = Math.max(size.x, size.y, size.z) || 1;
  const scale = MODEL_SIZE / largestSide;

  const assembly = new THREE.Group();
  assembly.name = 'opportunity-material-teardown';

  const runtimeLayers = roverTeardownLayers.map((definition) => {
    const group = new THREE.Group();
    group.name = `teardown-layer-${definition.id}`;
    assembly.add(group);
    return {
      definition,
      group,
      materials: new Set<THREE.Material>(),
      focus: new THREE.Vector3(),
      visualOrder: Math.max(
        0,
        TEARDOWN_FEATURED_LAYER_ORDER.indexOf(definition.id),
      ),
    } satisfies RuntimeLayer;
  });

  const layerById = new Map(
    runtimeLayers.map((layer) => [layer.definition.id, layer]),
  );
  const materialCache = new Map<string, THREE.Material>();
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();

  source.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;

    object.updateWorldMatrix(true, false);
    const sourceMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    const groups: GeometryGroup[] =
      object.geometry.groups.length > 0
        ? object.geometry.groups.map((group: GeometryGroup) => ({
            start: group.start,
            count: group.count,
            materialIndex: group.materialIndex ?? 0,
          }))
        : [
            {
              start: 0,
              count:
                object.geometry.index?.count ??
                object.geometry.attributes.position?.count ??
                0,
              materialIndex: 0,
            },
          ];

    groups.forEach((drawGroup, index) => {
      const sourceMaterial =
        sourceMaterials[drawGroup.materialIndex ?? 0] ?? sourceMaterials[0];
      if (!sourceMaterial) return;

      const definition =
        getTeardownLayerByMaterial(sourceMaterial.name) ?? roverTeardownLayers[0];
      const runtimeLayer = layerById.get(definition.id);
      if (!runtimeLayer) return;

      const geometry = object.geometry.clone();
      geometry.clearGroups();
      geometry.setDrawRange(drawGroup.start, drawGroup.count);
      geometries.add(geometry);

      const material = makeMaterialClone(sourceMaterial, materialCache);
      runtimeLayer.materials.add(material);
      materials.add(material);

      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `${object.name || 'source-rover'}-${definition.id}-${index}`;
      mesh.castShadow = object.castShadow;
      mesh.receiveShadow = object.receiveShadow;
      mesh.applyMatrix4(object.matrixWorld);
      mesh.matrixAutoUpdate = false;
      runtimeLayer.group.add(mesh);
    });
  });

  runtimeLayers.forEach((runtimeLayer) => {
    const layerBounds = new THREE.Box3().setFromObject(runtimeLayer.group);
    if (!layerBounds.isEmpty()) {
      const layerCenter = layerBounds.getCenter(new THREE.Vector3());
      runtimeLayer.focus
        .copy(layerCenter)
        .sub(center)
        .multiplyScalar(scale);
    }
  });

  return {
    assembly,
    layers: runtimeLayers,
    center,
    scale,
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    },
  };
}

function ExhibitEnvironment() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const generator = new THREE.PMREMGenerator(gl);
    const environment = new RoomEnvironment();
    const renderTarget = generator.fromScene(environment, 0.04);
    scene.environment = renderTarget.texture;
    scene.environmentIntensity = 0.66;
    environment.dispose();
    generator.dispose();

    return () => {
      scene.environment = null;
      renderTarget.dispose();
    };
  }, [gl, scene]);

  return null;
}

function FocusDirector({
  runtime,
  selectedId,
  separation,
  reducedMotion,
}: {
  runtime: TeardownRuntime;
  selectedId: RoverTeardownLayerId | null;
  separation: number;
  reducedMotion: boolean;
}) {
  const controls = useThree((state) => state.controls) as OrbitLike | null;
  const desired = useRef(new THREE.Vector3(0, -0.08, 0.08));
  const layerOffset = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!controls) return;
    const layer = runtime.layers.find(
      (candidate) => candidate.definition.id === selectedId,
    );

    desired.current.set(0, -0.08, 0.08);
    if (layer) {
      layerOffset.current.fromArray(layer.definition.explode);
      desired.current
        .copy(layer.focus)
        .multiplyScalar(0.58)
        .addScaledVector(
          layerOffset.current,
          (separation / 100) * 0.42,
        );
    }

    const amount = reducedMotion ? 1 : 1 - Math.exp(-2.8 * delta);
    controls.target.lerp(desired.current, amount);
    controls.update();
  });

  return null;
}

function TeardownAssembly({
  runtime,
  separation,
  selectedId,
  hoveredId,
  reducedMotion,
  stagger,
  scrollDriven,
  modelRotation,
  onSelect,
  onHover,
}: {
  runtime: TeardownRuntime;
  separation: number;
  selectedId: RoverTeardownLayerId | null;
  hoveredId: RoverTeardownLayerId | null;
  reducedMotion: boolean;
  stagger: number;
  scrollDriven: boolean;
  modelRotation: number;
  onSelect: (id: RoverTeardownLayerId) => void;
  onHover: (id: RoverTeardownLayerId | null) => void;
}) {
  const rig = useRef<THREE.Group>(null);
  const targetPosition = useRef(new THREE.Vector3());
  const amount = separation / 100;

  useEffect(() => {
    runtime.layers.forEach((runtimeLayer) => {
      const isDimmed =
        selectedId !== null && selectedId !== runtimeLayer.definition.id;
      const isEmphasized =
        selectedId === runtimeLayer.definition.id ||
        hoveredId === runtimeLayer.definition.id;

      runtimeLayer.materials.forEach((material) => {
        const standard = material as THREE.MeshStandardMaterial;
        material.opacity = isDimmed
          ? Math.max(0.12, Number(material.userData.teardownOpacity ?? 1) * 0.18)
          : Number(material.userData.teardownOpacity ?? 1);
        material.transparent = isDimmed;
        material.depthWrite = isDimmed
          ? false
          : Boolean(material.userData.teardownDepthWrite ?? true);

        if (standard.emissive && standard.emissive.isColor) {
          standard.emissive.set(
            isEmphasized
              ? '#f2c26b'
              : `#${String(material.userData.teardownEmissive ?? '000000')}`,
          );
          standard.emissiveIntensity = isEmphasized
            ? 0.075
            : Number(material.userData.teardownEmissiveIntensity ?? 0);
        }
      });
    });
  }, [hoveredId, runtime, selectedId]);

  useFrame((state, delta) => {
    const damping = reducedMotion ? 1 : 1 - Math.exp(-9 * delta);

    runtime.layers.forEach((runtimeLayer) => {
      const staggerAmount = scrollDriven
        ? getTeardownLayerStaggerAmount(
            stagger,
            runtimeLayer.visualOrder,
            runtime.layers.length,
          )
        : 1;
      targetPosition.current
        .fromArray(runtimeLayer.definition.explode)
        .multiplyScalar(amount * staggerAmount)
        .divideScalar(runtime.scale);
      runtimeLayer.group.position.lerp(targetPosition.current, damping);
    });

    if (!rig.current) return;
    const targetScale = 1 - amount * 0.14;
    const nextScale = THREE.MathUtils.lerp(
      rig.current.scale.x,
      targetScale,
      damping,
    );
    rig.current.scale.setScalar(nextScale);
    rig.current.rotation.y = THREE.MathUtils.lerp(
      rig.current.rotation.y,
      0.52 + modelRotation,
      damping,
    );
    rig.current.position.y = reducedMotion
      ? 0
      : Math.sin(state.clock.elapsedTime * 0.58) * 0.025;
  });

  return (
    <>
      <group ref={rig} rotation={[0, 0.52, 0]}>
        <group
          position={runtime.center
            .clone()
            .multiplyScalar(-runtime.scale)
            .toArray()}
          scale={runtime.scale}
        >
          {runtime.layers.map((runtimeLayer) => (
            <primitive
              key={runtimeLayer.definition.id}
              object={runtimeLayer.group}
              onPointerOver={
                scrollDriven
                  ? undefined
                  : (
                      event: THREE.Event & {
                        stopPropagation: () => void;
                      },
                    ) => {
                      event.stopPropagation();
                      onHover(runtimeLayer.definition.id);
                    }
              }
              onPointerOut={scrollDriven ? undefined : () => onHover(null)}
              onClick={
                scrollDriven
                  ? undefined
                  : (
                      event: THREE.Event & {
                        stopPropagation: () => void;
                      },
                    ) => {
                      event.stopPropagation();
                      onSelect(runtimeLayer.definition.id);
                    }
              }
            />
          ))}
        </group>
      </group>
      <FocusDirector
        runtime={runtime}
        selectedId={selectedId}
        separation={separation}
        reducedMotion={reducedMotion}
      />
    </>
  );
}

function LoadingRover() {
  return (
    <mesh position={[0, 0, 0]} rotation={[0.2, 0.5, 0]}>
      <boxGeometry args={[2.8, 0.38, 2.2]} />
      <meshStandardMaterial color="#6f7f87" wireframe />
    </mesh>
  );
}

function TeardownModel({
  separation,
  selectedId,
  hoveredId,
  reducedMotion,
  stagger,
  scrollDriven,
  modelRotation,
  onSelect,
  onHover,
}: {
  separation: number;
  selectedId: RoverTeardownLayerId | null;
  hoveredId: RoverTeardownLayerId | null;
  reducedMotion: boolean;
  stagger: number;
  scrollDriven: boolean;
  modelRotation: number;
  onSelect: (id: RoverTeardownLayerId) => void;
  onHover: (id: RoverTeardownLayerId | null) => void;
}) {
  const source = useGLTF(MODEL_URL).scene;
  const runtime = useMemo(() => buildTeardownRuntime(source), [source]);

  useEffect(() => () => runtime.dispose(), [runtime]);

  return (
    <TeardownAssembly
      runtime={runtime}
      separation={separation}
      selectedId={selectedId}
      hoveredId={hoveredId}
      reducedMotion={reducedMotion}
      stagger={stagger}
      scrollDriven={scrollDriven}
      modelRotation={modelRotation}
      onSelect={onSelect}
      onHover={onHover}
    />
  );
}

function TeardownViewport({
  separation,
  selectedId,
  hoveredId,
  reducedMotion,
  tourRunning,
  active,
  stagger,
  scrollDriven,
  modelRotation,
  modelMounted,
  onSelect,
  onHover,
}: {
  separation: number;
  selectedId: RoverTeardownLayerId | null;
  hoveredId: RoverTeardownLayerId | null;
  reducedMotion: boolean;
  tourRunning: boolean;
  active: boolean;
  stagger: number;
  scrollDriven: boolean;
  modelRotation: number;
  modelMounted: boolean;
  onSelect: (id: RoverTeardownLayerId) => void;
  onHover: (id: RoverTeardownLayerId | null) => void;
}) {
  return (
    <Canvas
      dpr={[1, 1.55]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [5.5, 3.5, 6.15], fov: 36 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.24;
      }}
    >
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 12, 24]} />
      <ExhibitEnvironment />
      <ambientLight intensity={0.92} color="#b9c7d4" />
      <hemisphereLight args={['#ffd2b0', '#13202b', 1.08]} />
      <directionalLight
        position={[4.8, 6.2, 3.8]}
        intensity={6.1}
        color="#ffd8b3"
        castShadow
      />
      <directionalLight position={[-4.5, 2, -3]} intensity={3.8} color="#6c9dc4" />
      <directionalLight position={[-3, 1, 4]} intensity={2.1} color="#8fb8cc" />
      <spotLight
        position={[0, 7, 1]}
        angle={0.45}
        penumbra={0.8}
        intensity={84}
        color="#f2c26b"
      />

      <Suspense fallback={<LoadingRover />}>
        {modelMounted ? (
          <TeardownModel
            separation={separation}
            selectedId={selectedId}
            hoveredId={hoveredId}
            reducedMotion={reducedMotion}
            stagger={stagger}
            scrollDriven={scrollDriven}
            modelRotation={modelRotation}
            onSelect={onSelect}
            onHover={onHover}
          />
        ) : null}
      </Suspense>

      <mesh position={[0, -2.95, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.1, 96]} />
        <meshStandardMaterial color="#050505" roughness={0.92} />
      </mesh>
      <mesh position={[0, -2.92, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.15, 3.19, 128]} />
        <meshBasicMaterial color="#f2c26b" transparent opacity={0.42} />
      </mesh>
      <ContactShadows
        position={[0, -2.88, 0]}
        opacity={0.55}
        scale={9.4}
        blur={2.8}
        far={5.4}
        color="#000000"
      />
      <OrbitControls
        makeDefault
        enabled={!scrollDriven}
        target={[0, -0.08, 0.08]}
        enablePan={false}
        enableRotate={!scrollDriven}
        minDistance={4.5}
        maxDistance={10.5}
        minPolarAngle={0.55}
        maxPolarAngle={1.48}
        autoRotate={!reducedMotion && !scrollDriven && tourRunning}
        autoRotateSpeed={0.52}
        enableDamping={!reducedMotion && !scrollDriven}
        enableZoom={false}
      />
    </Canvas>
  );
}

export default function RoverTeardown({
  reducedMotion,
  locale = 'pt-BR',
  className,
  progress,
  active = true,
}: RoverTeardownProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, '');
  const copy = getRoverTeardownCopy(locale);
  const [frozenProgress, setFrozenProgress] = useState<number | null>(null);
  const scrollDriven = progress !== undefined && frozenProgress === null;
  const timelineProgress = frozenProgress ?? progress;
  const timeline = useMemo(
    () =>
      timelineProgress === undefined
        ? null
        : getTeardownTimelineState(timelineProgress),
    [timelineProgress],
  );
  const localizedLayers = useMemo(
    () =>
      roverTeardownLayers.map((layer) => ({
        ...layer,
        ...copy.layerContent[layer.id],
      })),
    [copy],
  );
  const [separation, setSeparation] = useState(0);
  const [selectedId, setSelectedId] =
    useState<RoverTeardownLayerId | null>(null);
  const [hoveredId, setHoveredId] =
    useState<RoverTeardownLayerId | null>(null);
  const [tourRunning, setTourRunning] = useState(false);
  const [keepModelMounted, setKeepModelMounted] = useState(false);
  const [announcement, setAnnouncement] =
    useState<TeardownAnnouncement>({ kind: 'initial' });
  const effectiveSeparation = scrollDriven
    ? timeline?.separation ?? separation
    : separation;
  const displayedSeparation = Math.round(effectiveSeparation);
  const effectiveSelectedId = scrollDriven
    ? selectedId ?? timeline?.featuredLayerId ?? null
    : selectedId;
  const shouldMountModel = active || keepModelMounted;
  const isExploring = frozenProgress !== null;

  const selectedLayer = useMemo(
    () =>
      localizedLayers.find((layer) => layer.id === effectiveSelectedId) ??
      null,
    [effectiveSelectedId, localizedLayers],
  );
  const hoveredLayer = localizedLayers.find(
    (layer) => layer.id === hoveredId,
  );

  useEffect(() => {
    if (active) {
      setKeepModelMounted(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setKeepModelMounted(false);
    }, MODEL_EXIT_HYSTERESIS_MS);
    return () => window.clearTimeout(timer);
  }, [active]);

  useEffect(() => {
    if (reducedMotion && tourRunning) {
      setTourRunning(false);
    }
  }, [reducedMotion, tourRunning]);

  useEffect(() => {
    if (!scrollDriven) return;
    setSelectedId(null);
    setHoveredId(null);
    setTourRunning(false);
  }, [scrollDriven]);

  useEffect(() => {
    if (!isExploring) return;

    const body = document.body;
    const html = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    const previousBodyPaddingRight = body.style.paddingRight;

    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousBodyOverflow;
      html.style.overflow = previousHtmlOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
      body.style.paddingRight = previousBodyPaddingRight;
    };
  }, [isExploring]);

  useEffect(() => {
    if (active || frozenProgress === null) return;
    setFrozenProgress(null);
  }, [active, frozenProgress]);

  useEffect(() => {
    if (!tourRunning || reducedMotion || scrollDriven) return;
    const timer = window.setTimeout(() => {
      const currentIndex = selectedId
        ? localizedLayers.findIndex((layer) => layer.id === selectedId)
        : -1;
      const next =
        localizedLayers[
          (currentIndex + 1 + localizedLayers.length) %
            localizedLayers.length
        ];
      setSelectedId(next.id);
      setAnnouncement({ kind: 'tour', layerId: next.id });
    }, 3400);
    return () => window.clearTimeout(timer);
  }, [
    localizedLayers,
    reducedMotion,
    scrollDriven,
    selectedId,
    tourRunning,
  ]);

  const selectLayer = (id: RoverTeardownLayerId) => {
    if (scrollDriven) return;
    const layer = localizedLayers.find((candidate) => candidate.id === id);
    if (!layer) return;
    setSelectedId(id);
    setTourRunning(false);
    setAnnouncement({ kind: 'selected', layerId: id });
  };

  const resetView = () => {
    if (scrollDriven) return;
    setSeparation(0);
    setSelectedId(null);
    setHoveredId(null);
    setTourRunning(false);
    setAnnouncement({ kind: 'reassembled' });
  };

  const toggleTour = () => {
    if (reducedMotion || scrollDriven) return;
    if (tourRunning) {
      setTourRunning(false);
      setAnnouncement({ kind: 'tour-paused' });
      return;
    }
    setTourRunning(true);
    if (separation < 42) setSeparation(64);
    if (!selectedId) setSelectedId(localizedLayers[0].id);
    setAnnouncement({ kind: 'tour-started' });
  };

  const openAll = () => {
    if (scrollDriven) return;
    setSeparation(100);
    setAnnouncement({ kind: 'all-open' });
  };

  const toggleExploration = () => {
    if (progress === undefined) return;

    if (frozenProgress !== null) {
      setFrozenProgress(null);
      setSelectedId(null);
      setHoveredId(null);
      setTourRunning(false);
      setAnnouncement({ kind: 'explore-ended' });
      return;
    }

    setFrozenProgress(progress);
    setSeparation(timeline?.separation ?? separation);
    setSelectedId(null);
    setHoveredId(null);
    setTourRunning(false);
    setAnnouncement({ kind: 'explore-started' });
  };

  const currentLayer = hoveredLayer ?? selectedLayer;
  const announcementText = useMemo(() => {
    const layer =
      'layerId' in announcement
        ? localizedLayers.find(
            (candidate) => candidate.id === announcement.layerId,
          )
        : null;

    switch (announcement.kind) {
      case 'initial':
        return copy.announcements.initial;
      case 'selected':
        return layer
          ? copy.announcements.selectedLayer(layer.label)
          : copy.announcements.initial;
      case 'tour':
        return layer
          ? copy.announcements.tourLayer(layer.label, layer.summary)
          : copy.announcements.initial;
      case 'reassembled':
        return copy.announcements.reassembled;
      case 'tour-paused':
        return copy.announcements.tourPaused;
      case 'tour-started':
        return copy.announcements.tourStarted;
      case 'all-open':
        return copy.announcements.allOpen;
      case 'explore-started':
        return copy.announcements.exploreStarted;
      case 'explore-ended':
        return copy.announcements.exploreEnded;
      case 'separation':
        return copy.announcements.separation(announcement.percent);
    }
  }, [announcement, copy, localizedLayers]);

  return (
    <section
      className={[
        'rover-teardown',
        scrollDriven ? 'is-scroll-driven' : '',
        isExploring ? 'is-exploring' : '',
        tourRunning ? 'is-touring' : '',
        reducedMotion ? 'is-reduced-motion' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={copy.sectionAriaLabel}
    >
      <div className="teardown-toolbar">
        <div className="teardown-toolbar__intro">
          <span className="teardown-kicker">
            <ScanLine aria-hidden="true" size={16} />
            {copy.kicker}
          </span>
          <p>{copy.intro}</p>
        </div>
        <div className="teardown-actions">
          {progress !== undefined ? (
            <button
              className={`schematic-control teardown-explore-toggle ${
                isExploring ? 'is-active' : ''
              }`}
              type="button"
              onClick={toggleExploration}
              aria-pressed={isExploring}
            >
              <MousePointer2 aria-hidden="true" size={16} />
              {isExploring
                ? copy.actions.resumeJourney
                : copy.actions.explore3d}
            </button>
          ) : null}
          <button
            className={`schematic-control ${tourRunning ? 'is-active' : ''}`}
            type="button"
            onClick={toggleTour}
            disabled={reducedMotion || scrollDriven}
            aria-pressed={tourRunning}
            title={
              reducedMotion
                ? copy.actions.reducedMotionTourTitle
                : undefined
            }
          >
            {tourRunning ? (
              <Pause aria-hidden="true" size={16} />
            ) : (
              <Play aria-hidden="true" size={16} />
            )}
            {tourRunning
              ? copy.actions.tourPause
              : copy.actions.tourStart}
          </button>
          <button
            className="schematic-control"
            type="button"
            onClick={resetView}
            disabled={
              scrollDriven ||
              (effectiveSeparation === 0 &&
                selectedId === null &&
                !tourRunning)
            }
          >
            <RotateCcw aria-hidden="true" size={16} />
            {copy.actions.reassemble}
          </button>
          <button
            className="schematic-control"
            type="button"
            onClick={openAll}
            disabled={scrollDriven || effectiveSeparation === 100}
          >
            <Maximize2 aria-hidden="true" size={16} />
            {copy.actions.openAll}
          </button>
        </div>
      </div>

      <div className="teardown-separation schematic-separation">
        <label htmlFor={`${uid}-teardown-separation`}>
          {copy.separation.label}
          <output htmlFor={`${uid}-teardown-separation`}>
            {displayedSeparation}%
          </output>
        </label>
        <input
          id={`${uid}-teardown-separation`}
          type="range"
          min={0}
          max={100}
          step={1}
          value={displayedSeparation}
          style={
            {
              '--separation': `${displayedSeparation}%`,
            } as CSSProperties
          }
          disabled={scrollDriven}
          onChange={(event) => {
            if (scrollDriven) return;
            const next = Number(event.currentTarget.value);
            setSeparation(next);
            setAnnouncement({ kind: 'separation', percent: next });
          }}
          aria-describedby={`${uid}-teardown-help`}
        />
        <div className="schematic-tick-row" aria-hidden="true">
          <span>{copy.separation.assembled}</span>
          <span>{copy.separation.open}</span>
        </div>
      </div>

      <div
        className="teardown-layers"
        role="group"
        aria-label={copy.layersGroupLabel}
        tabIndex={0}
      >
        {localizedLayers.map((layer, index) => (
          <button
            key={layer.id}
            type="button"
            className={
              effectiveSelectedId === layer.id ? 'is-active' : ''
            }
            aria-pressed={effectiveSelectedId === layer.id}
            disabled={scrollDriven}
            onClick={
              scrollDriven ? undefined : () => selectLayer(layer.id)
            }
            onPointerEnter={
              scrollDriven ? undefined : () => setHoveredId(layer.id)
            }
            onPointerLeave={
              scrollDriven ? undefined : () => setHoveredId(null)
            }
            onFocus={
              scrollDriven ? undefined : () => setHoveredId(layer.id)
            }
            onBlur={scrollDriven ? undefined : () => setHoveredId(null)}
          >
            <span
              className="teardown-layers__swatch"
              style={{ backgroundColor: layer.color }}
              aria-hidden="true"
            />
            <span>
              <small>{String(index + 1).padStart(2, '0')}</small>
              {layer.label}
            </span>
          </button>
        ))}
      </div>

      <div className="teardown-workbench">
        <div
          className="teardown-stage"
          role="group"
          aria-label={copy.stage.ariaLabel}
          onPointerEnter={() => undefined}
        >
          <div
            className="teardown-canvas"
            aria-hidden="true"
            style={{
              opacity: timeline?.glbOpacity ?? 1,
              transition: reducedMotion
                ? 'none'
                : 'opacity 120ms linear',
            }}
          >
            <PlanetErrorBoundary
              fallback={
                <div className="teardown-render-fallback">
                  {copy.stage.renderFallback}
                </div>
              }
            >
              <TeardownViewport
                separation={effectiveSeparation}
                selectedId={effectiveSelectedId}
                hoveredId={hoveredId}
                reducedMotion={reducedMotion}
                tourRunning={tourRunning}
                active={active}
                stagger={timeline?.stagger ?? 1}
                scrollDriven={scrollDriven}
                modelRotation={timeline?.modelRotation ?? 0}
                modelMounted={shouldMountModel}
                onSelect={selectLayer}
                onHover={setHoveredId}
              />
            </PlanetErrorBoundary>
          </div>

          {timeline ? (
            <div
              aria-hidden="true"
              inert
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                opacity: scrollDriven ? timeline.schematicOpacity : 0,
                background:
                  'linear-gradient(180deg, rgba(0, 0, 0, 0.97), rgba(0, 0, 0, 0.9))',
                pointerEvents: 'none',
                transform: `scale(${0.985 + timeline.schematicOpacity * 0.015})`,
                transition: reducedMotion
                  ? 'none'
                  : 'opacity 120ms linear, transform 180ms ease-out',
              }}
            >
              <div
                style={{
                  width: '132%',
                  flex: '0 0 auto',
                  transform: 'scale(0.72)',
                  transformOrigin: 'center',
                }}
              >
                <RoverSchematic reducedMotion={reducedMotion} />
              </div>
            </div>
          ) : null}

          <div className="teardown-stage__chips" aria-hidden="true">
            <span>{copy.stage.officialGlb}</span>
            <span>
              {copy.stage.materialGroups(roverTeardownMaterialCount)}
            </span>
            <span>{copy.stage.openPercent(displayedSeparation)}</span>
          </div>

          <div className="teardown-stage__focus" aria-hidden="true">
            <span
              className="teardown-stage__focus-dot"
              style={{ backgroundColor: currentLayer?.color ?? '#f2c26b' }}
            />
            <span>
              <small>
                {currentLayer?.eyebrow ?? copy.stage.focusEyebrowFallback}
              </small>
              <strong>
                {currentLayer?.label ?? copy.stage.focusLabelFallback}
              </strong>
            </span>
          </div>

          <p id={`${uid}-teardown-help`} className="sr-only">
            {copy.stage.help(
              localizedLayers.length,
              roverTeardownMaterialCount,
            )}
          </p>
        </div>

        <aside className="teardown-detail" aria-live="polite">
          {selectedLayer ? (
            <>
              <p className="teardown-detail__index">
                {copy.detail.layerLabel}{' '}
                {String(
                  localizedLayers.findIndex(
                    (layer) => layer.id === selectedLayer.id,
                  ) + 1,
                ).padStart(2, '0')}{' '}
                / {String(localizedLayers.length).padStart(2, '0')}
              </p>
              <p
                className="teardown-detail__eyebrow"
                style={{ color: selectedLayer.color }}
              >
                {selectedLayer.eyebrow}
              </p>
              <h3>{selectedLayer.label}</h3>
              <p className="teardown-detail__summary">
                {selectedLayer.summary}
              </p>
              <p className="teardown-detail__copy">{selectedLayer.detail}</p>
              <a
                className="teardown-source"
                href={selectedLayer.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                {selectedLayer.sourceLabel}
                <ArrowUpRight aria-hidden="true" size={15} />
              </a>
            </>
          ) : (
            <>
              <p className="teardown-detail__index">
                {copy.detail.exploreMode}
              </p>
              <p className="teardown-detail__eyebrow">
                {copy.detail.exploreEyebrow}
              </p>
              <h3>{copy.detail.chooseLayerTitle}</h3>
              <p className="teardown-detail__summary">
                {copy.detail.exploreSummary}
              </p>
              <p className="teardown-detail__copy">
                {copy.detail.exploreCopy}
              </p>
            </>
          )}

          <div className="teardown-honesty">
            <Layers aria-hidden="true" size={18} />
            <div>
              <strong>{copy.detail.honestyTitle}</strong>
              <p>{copy.detail.honestyBody}</p>
            </div>
          </div>

          <a
            className="teardown-source"
            href="https://science.nasa.gov/resource/spirit-and-opportunity-rover-3d-model/"
            target="_blank"
            rel="noreferrer"
          >
            {copy.detail.modelSourceLabel}
            <ArrowUpRight aria-hidden="true" size={15} />
          </a>
        </aside>
      </div>

      <p className="teardown-disclaimer">
        {copy.disclaimer(
          localizedLayers.length,
          roverTeardownMaterialCount,
        )}
      </p>

      <p className="sr-only" aria-live="polite">
        {announcementText}
      </p>
    </section>
  );
}
