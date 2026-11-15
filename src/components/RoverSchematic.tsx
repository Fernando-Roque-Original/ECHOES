import {
  ArrowUpRight,
  Layers,
  Maximize2,
  RotateCcw,
  ScanLine,
} from 'lucide-react';
import {
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  roverSchematicParts,
  roverSystems,
  type RoverSchematicPart,
  type RoverSystem,
} from '../content/roverSchematic';

type RoverSchematicProps = {
  reducedMotion: boolean;
};

const anchors: Record<RoverSchematicPart['id'], { x: number; y: number }> = {
  'solar-panels': { x: 310, y: 320 },
  'pancam-mast': { x: 560, y: 188 },
  'navigation-cameras': { x: 548, y: 142 },
  'high-gain-antenna': { x: 700, y: 250 },
  'radio-antennas': { x: 425, y: 214 },
  'robotic-arm': { x: 292, y: 452 },
  'hazard-cameras': { x: 355, y: 438 },
  body: { x: 500, y: 370 },
  'internal-core': { x: 500, y: 373 },
  'rocker-bogie': { x: 470, y: 448 },
  wheels: { x: 475, y: 500 },
};

function Wheel({
  cx,
  cy,
  radius,
  far = false,
}: {
  cx: number;
  cy: number;
  radius: number;
  far?: boolean;
}) {
  const spokes = Array.from({ length: 8 }, (_, index) => {
    const angle = (index / 8) * Math.PI * 2;
    return {
      x1: cx + Math.cos(angle) * radius * 0.32,
      y1: cy + Math.sin(angle) * radius * 0.32,
      x2: cx + Math.cos(angle) * radius * 0.74,
      y2: cy + Math.sin(angle) * radius * 0.74,
    };
  });

  return (
    <g className={far ? 'schematic-wheel is-far' : 'schematic-wheel'}>
      <circle cx={cx} cy={cy} r={radius} />
      <circle cx={cx} cy={cy} r={radius * 0.66} />
      <circle cx={cx} cy={cy} r={radius * 0.2} />
      {spokes.map((line, index) => (
        <line key={index} {...line} />
      ))}
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return (
          <line
            key={`tread-${index}`}
            x1={cx + Math.cos(angle) * radius * 0.88}
            y1={cy + Math.sin(angle) * radius * 0.88}
            x2={cx + Math.cos(angle) * radius}
            y2={cy + Math.sin(angle) * radius}
          />
        );
      })}
    </g>
  );
}

function SchematicPart({
  part,
  amount,
  selected,
  hovered,
  activeSystem,
  onHover,
  onSelect,
  children,
  internal = false,
  interactive = true,
}: {
  part: RoverSchematicPart;
  amount: number;
  selected: boolean;
  hovered: boolean;
  activeSystem: RoverSystem | 'todos';
  onHover: (id: RoverSchematicPart['id'] | null) => void;
  onSelect: (part: RoverSchematicPart) => void;
  children: ReactNode;
  internal?: boolean;
  interactive?: boolean;
}) {
  const dimmed = activeSystem !== 'todos' && part.system !== activeSystem;
  const transform = `translate(${part.explode.x * amount}px, ${part.explode.y * amount}px) rotate(${(part.explode.rotate ?? 0) * amount}deg)`;
  const className = [
    'schematic-part',
    `schematic-part--${part.id}`,
    selected ? 'is-selected' : '',
    hovered ? 'is-hovered' : '',
    dimmed ? 'is-dimmed' : '',
    internal ? 'schematic-part--internal' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const activate = () => onSelect(part);

  return (
    <g
      className={className}
      style={{ transform } as CSSProperties}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : -1}
      aria-label={interactive ? `${part.label}. ${part.summary}` : undefined}
      aria-pressed={interactive ? selected : undefined}
      aria-hidden={interactive ? undefined : true}
      data-part-id={part.id}
      onClick={interactive ? activate : undefined}
      onPointerEnter={
        interactive
          ? () => {
              onHover(part.id);
            }
          : undefined
      }
      onPointerLeave={interactive ? () => onHover(null) : undefined}
      onFocus={interactive ? () => onHover(part.id) : undefined}
      onBlur={interactive ? () => onHover(null) : undefined}
      onKeyDown={
        interactive
          ? (event: KeyboardEvent<SVGGElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                activate();
              }
            }
          : undefined
      }
    >
      {children}
    </g>
  );
}

function CameraBox({
  x,
  y,
  width = 28,
  height = 21,
}: {
  x: number;
  y: number;
  width?: number;
  height?: number;
}) {
  return (
    <g className="schematic-camera">
      <rect x={x} y={y} width={width} height={height} rx={4} />
      <circle cx={x + width / 2} cy={y + height / 2} r={Math.min(width, height) * 0.25} />
      <path d={`M${x + 5} ${y + 4} H${x + width - 5}`} />
    </g>
  );
}

export function RoverSchematic({ reducedMotion }: RoverSchematicProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, '');
  const [explode, setExplode] = useState(0);
  const [hoveredId, setHoveredId] = useState<RoverSchematicPart['id'] | null>(
    null,
  );
  const [selectedId, setSelectedId] =
    useState<RoverSchematicPart['id']>('body');
  const [activeSystem, setActiveSystem] = useState<RoverSystem | 'todos'>(
    'todos',
  );
  const [cutaway, setCutaway] = useState(false);
  const [announcement, setAnnouncement] = useState(
    'Esquema montado. Escolha uma peça para ver os detalhes.',
  );

  const selectedPart = useMemo(
    () =>
      roverSchematicParts.find((part) => part.id === selectedId) ??
      roverSchematicParts[0],
    [selectedId],
  );
  const visibleParts = useMemo(
    () =>
      activeSystem === 'todos'
        ? roverSchematicParts
        : roverSchematicParts.filter((part) => part.system === activeSystem),
    [activeSystem],
  );
  const selectedIndex = roverSchematicParts.findIndex(
    (part) => part.id === selectedId,
  );
  const selectedAnchor = anchors[selectedPart.id];
  const partAmount = (id: RoverSchematicPart['id']) =>
    hoveredId === id && explode < 26
      ? Math.max(explode / 100, 0.26)
      : explode / 100;
  const selectedAmount = partAmount(selectedPart.id);
  const calloutStart = {
    x: selectedAnchor.x + selectedPart.explode.x * selectedAmount,
    y: selectedAnchor.y + selectedPart.explode.y * selectedAmount,
  };

  const selectPart = (part: RoverSchematicPart) => {
    setSelectedId(part.id);
    if (part.id === 'internal-core') {
      setCutaway(true);
      setExplode((current) => Math.max(current, 42));
    }
    setAnnouncement(`Peça selecionada: ${part.label}.`);
  };

  const moveSelection = (direction: 1 | -1) => {
    const nextIndex =
      (selectedIndex + direction + roverSchematicParts.length) %
      roverSchematicParts.length;
    const nextPart = roverSchematicParts[nextIndex];
    selectPart(nextPart);
    window.requestAnimationFrame(() => {
      document.getElementById(`part-button-${nextPart.id}`)?.focus();
    });
  };

  const resetView = () => {
    setExplode(0);
    setHoveredId(null);
    setCutaway(false);
    setAnnouncement('Rover montado novamente.');
  };

  const openCutaway = () => {
    const next = !cutaway;
    setCutaway(next);
    if (next) {
      setSelectedId('internal-core');
      setExplode((current) => Math.max(current, 42));
      setAnnouncement(
        'Vista interna ativada. As peças internas são ilustrativas.',
      );
    } else {
      setAnnouncement('Vista externa restaurada.');
    }
  };

  const handleRootKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (
      event.key === 'Escape' &&
      (explode > 0 || cutaway || hoveredId !== null)
    ) {
      event.preventDefault();
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
      resetView();
      return;
    }

    const inPartNavigation = target.closest(
      '.schematic-part, .schematic-parts',
    );
    if (!inPartNavigation || target.closest('input, a')) return;
    if (
      event.key === 'ArrowRight' ||
      event.key === 'ArrowDown' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowUp'
    ) {
      event.preventDefault();
      moveSelection(
        event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1,
      );
    }
  };

  return (
    <section
      className={[
        'rover-schematic',
        cutaway ? 'is-cutaway' : '',
        reducedMotion ? 'is-reduced-motion' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Esquema interativo do Opportunity"
      onKeyDown={handleRootKeyDown}
    >
      <div className="schematic-toolbar">
        <div className="schematic-toolbar__intro">
          <span className="schematic-kicker">
            <ScanLine aria-hidden="true" size={16} />
            Carta de sistemas / MER-B
          </span>
          <p>
            Toque ou passe o cursor sobre uma peça para pré-visualizar a
            separação. Selecione para fixar os detalhes.
          </p>
        </div>
        <div className="schematic-actions">
          <button
            className="schematic-control"
            type="button"
            onClick={resetView}
            disabled={explode === 0 && !cutaway}
          >
            <RotateCcw aria-hidden="true" size={16} />
            Montar
          </button>
          <button
            className="schematic-control"
            type="button"
            onClick={() => {
              setExplode(100);
              setAnnouncement('Todas as peças separadas.');
            }}
            disabled={explode === 100}
          >
            <Maximize2 aria-hidden="true" size={16} />
            Explodir
          </button>
          <button
            className={`schematic-control ${cutaway ? 'is-active' : ''}`}
            type="button"
            aria-pressed={cutaway}
            onClick={openCutaway}
          >
            <Layers aria-hidden="true" size={16} />
            {cutaway ? 'Fechar corte' : 'Ver por dentro'}
          </button>
        </div>
      </div>

      <div className="schematic-separation">
        <label htmlFor={`${uid}-explode`}>
          Separação das peças
          <output htmlFor={`${uid}-explode`}>{explode}%</output>
        </label>
        <input
          id={`${uid}-explode`}
          type="range"
          min={0}
          max={100}
          step={1}
          value={explode}
          style={{ '--separation': `${explode}%` } as CSSProperties}
          onChange={(event) => {
            const next = Number(event.currentTarget.value);
            setExplode(next);
            setAnnouncement(`Separação em ${next} por cento.`);
          }}
          aria-describedby={`${uid}-keyboard-help`}
        />
        <div className="schematic-tick-row" aria-hidden="true">
          <span>Montado</span>
          <span>Separado</span>
        </div>
      </div>

      <div
        className="schematic-filters"
        role="group"
        aria-label="Filtrar peças por sistema"
      >
        {roverSystems.map((system) => (
          <button
            key={system.id}
            type="button"
            className={activeSystem === system.id ? 'is-active' : ''}
            aria-pressed={activeSystem === system.id}
            onClick={() => {
              setActiveSystem(system.id);
              setAnnouncement(
                system.id === 'todos'
                  ? 'Todas as peças destacadas.'
                  : `Sistema ${system.label} destacado.`,
              );
            }}
          >
            {system.label}
          </button>
        ))}
      </div>

      <div className="schematic-workbench">
        <div className="schematic-canvas">
          <div className="schematic-canvas__meta" aria-hidden="true">
            <span>VISTA LATERAL ILUSTRATIVA</span>
            <span>ESCALA NÃO TÉCNICA</span>
          </div>

          <svg
            viewBox="12 0 976 690"
            role="group"
            aria-labelledby={`${uid}-svg-title ${uid}-svg-description`}
          >
            <title id={`${uid}-svg-title`}>
              Esquema das peças do Opportunity
            </title>
            <desc id={`${uid}-svg-description`}>
              Desenho ilustrativo com corpo, painéis solares, mastro, câmeras,
              antenas, braço, suspensão e seis rodas. As formas não são
              geometria oficial da NASA.
            </desc>
            <defs>
              <pattern
                id={`${uid}-grid`}
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  className="schematic-grid__line"
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                />
              </pattern>
              <pattern
                id={`${uid}-solar`}
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <rect className="schematic-solar__cell" width="24" height="24" />
                <path className="schematic-solar__grid" d="M0 0H24V24H0Z" fill="none" />
              </pattern>
              <linearGradient id={`${uid}-metal`} x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#d9c9ae" />
                <stop offset="0.46" stopColor="#7f8b8d" />
                <stop offset="1" stopColor="#34434b" />
              </linearGradient>
              <filter id={`${uid}-glow`} x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <marker
                id={`${uid}-callout-dot`}
                markerWidth="8"
                markerHeight="8"
                refX="4"
                refY="4"
              >
                <circle cx="4" cy="4" r="3" />
              </marker>
            </defs>

            <rect className="schematic-grid" width="1000" height="700" fill={`url(#${uid}-grid)`} />
            <g className="schematic-axis" aria-hidden="true">
              <path d="M60 632 H940" />
              <path d="M500 64 V632" />
              <path d="M72 620 H116" />
              <path d="M72 620 V576" />
              <text x="124" y="624">X</text>
              <text x="510" y="82">Y</text>
              <text x="64" y="560">00</text>
            </g>

            <SchematicPart
              part={roverSchematicParts.find((part) => part.id === 'solar-panels')!}
              amount={partAmount('solar-panels')}
              selected={selectedId === 'solar-panels'}
              hovered={hoveredId === 'solar-panels'}
              activeSystem={activeSystem}
              onHover={setHoveredId}
              onSelect={selectPart}
            >
              <g className="schematic-solar-wings">
                <path d="M174 301 L416 284 L458 322 L218 344 Z" fill={`url(#${uid}-solar)`} />
                <path d="M584 284 L826 301 L782 344 L542 322 Z" fill={`url(#${uid}-solar)`} />
                <path d="M214 325 L225 336 M265 321 L276 332 M316 317 L327 328 M367 313 L378 324" />
                <path d="M786 325 L775 336 M735 321 L724 332 M684 317 L673 328 M633 313 L622 324" />
                <path d="M418 292 L520 292 M582 292 L682 292" />
              </g>
            </SchematicPart>

            <SchematicPart
              part={roverSchematicParts.find((part) => part.id === 'rocker-bogie')!}
              amount={partAmount('rocker-bogie')}
              selected={selectedId === 'rocker-bogie'}
              hovered={hoveredId === 'rocker-bogie'}
              activeSystem={activeSystem}
              onHover={setHoveredId}
              onSelect={selectPart}
            >
              <g className="schematic-bogie">
                <path d="M382 414 L330 444 L316 472" />
                <path d="M340 454 L465 474 L642 454" />
                <path d="M506 414 L540 462 L646 452" />
                <path d="M312 470 L325 452 L338 470" />
                <path d="M466 466 L480 452 L492 468" />
                <path d="M624 446 L640 432 L654 448" />
                <circle cx="330" cy="444" r="7" />
                <circle cx="540" cy="462" r="7" />
                <circle cx="642" cy="454" r="7" />
              </g>
            </SchematicPart>

            <SchematicPart
              part={roverSchematicParts.find((part) => part.id === 'wheels')!}
              amount={partAmount('wheels')}
              selected={selectedId === 'wheels'}
              hovered={hoveredId === 'wheels'}
              activeSystem={activeSystem}
              onHover={setHoveredId}
              onSelect={selectPart}
            >
              <g className="schematic-wheel-set">
                <Wheel cx={318} cy={470} radius={22} far />
                <Wheel cx={482} cy={478} radius={22} far />
                <Wheel cx={650} cy={468} radius={22} far />
                <Wheel cx={292} cy={510} radius={33} />
                <Wheel cx={474} cy={522} radius={33} />
                <Wheel cx={656} cy={510} radius={33} />
              </g>
            </SchematicPart>

            <SchematicPart
              part={roverSchematicParts.find((part) => part.id === 'radio-antennas')!}
              amount={partAmount('radio-antennas')}
              selected={selectedId === 'radio-antennas'}
              hovered={hoveredId === 'radio-antennas'}
              activeSystem={activeSystem}
              onHover={setHoveredId}
              onSelect={selectPart}
            >
              <g className="schematic-radio">
                <path d="M423 305 V170" />
                <circle cx="423" cy="164" r="6" />
                <rect x="432" y="205" width="24" height="38" rx="5" />
                <path d="M440 213 H448 M440 220 H448 M440 227 H448" />
              </g>
            </SchematicPart>

            <SchematicPart
              part={roverSchematicParts.find((part) => part.id === 'high-gain-antenna')!}
              amount={partAmount('high-gain-antenna')}
              selected={selectedId === 'high-gain-antenna'}
              hovered={hoveredId === 'high-gain-antenna'}
              activeSystem={activeSystem}
              onHover={setHoveredId}
              onSelect={selectPart}
            >
              <g className="schematic-high-gain">
                <path d="M615 326 L674 271" />
                <ellipse cx="700" cy="245" rx="48" ry="31" transform="rotate(-18 700 245)" />
                <ellipse cx="700" cy="245" rx="31" ry="18" transform="rotate(-18 700 245)" />
                <path d="M700 245 L746 228" />
                <circle cx="746" cy="228" r="5" />
              </g>
            </SchematicPart>

            <SchematicPart
              part={roverSchematicParts.find((part) => part.id === 'body')!}
              amount={partAmount('body')}
              selected={selectedId === 'body'}
              hovered={hoveredId === 'body'}
              activeSystem={activeSystem}
              onHover={setHoveredId}
              onSelect={selectPart}
            >
              <g className="schematic-body">
                <path className="schematic-body__shadow" d="M390 410 L610 410 L635 438 L366 438 Z" />
                <rect className="schematic-body__shell" x="390" y="310" width="220" height="108" rx="17" />
                <path className="schematic-body__deck" d="M405 310 L595 310 L617 330 L383 330 Z" />
                <path d="M410 342 H590 M410 366 H590 M410 390 H590" />
                <rect x="424" y="340" width="54" height="26" rx="4" />
                <rect x="492" y="340" width="34" height="26" rx="4" />
                <circle cx="552" cy="353" r="9" />
                <path d="M438 381 H562" />
              </g>
            </SchematicPart>

            <SchematicPart
              part={roverSchematicParts.find((part) => part.id === 'internal-core')!}
              amount={partAmount('internal-core')}
              selected={selectedId === 'internal-core'}
              hovered={hoveredId === 'internal-core'}
              activeSystem={activeSystem}
              onHover={setHoveredId}
              onSelect={selectPart}
              internal
              interactive={cutaway}
            >
              <g className="schematic-internals">
                <rect x="409" y="341" width="72" height="54" rx="5" />
                <path d="M414 349 H476 M414 357 H462 M414 365 H470 M414 373 H458" />
                <rect x="498" y="340" width="74" height="56" rx="7" />
                <path d="M512 353 H558 M512 365 H558 M512 377 H546" />
                <circle cx="565" cy="394" r="11" />
                <path d="M488 367 H497 M450 397 V412 M530 397 V412" />
                <text x="420" y="336">ELETRÔNICA</text>
                <text x="507" y="336">ENERGIA</text>
              </g>
            </SchematicPart>

            <SchematicPart
              part={roverSchematicParts.find((part) => part.id === 'pancam-mast')!}
              amount={partAmount('pancam-mast')}
              selected={selectedId === 'pancam-mast'}
              hovered={hoveredId === 'pancam-mast'}
              activeSystem={activeSystem}
              onHover={setHoveredId}
              onSelect={selectPart}
            >
              <g className="schematic-mast">
                <path d="M560 312 V198" />
                <path d="M560 247 L585 229" />
                <rect x="527" y="158" width="66" height="38" rx="8" />
                <CameraBox x={534} y={164} width={22} height={24} />
                <CameraBox x={564} y={164} width={22} height={24} />
                <text x="612" y="184">PANCAM</text>
              </g>
            </SchematicPart>

            <SchematicPart
              part={roverSchematicParts.find((part) => part.id === 'navigation-cameras')!}
              amount={partAmount('navigation-cameras')}
              selected={selectedId === 'navigation-cameras'}
              hovered={hoveredId === 'navigation-cameras'}
              activeSystem={activeSystem}
              onHover={setHoveredId}
              onSelect={selectPart}
            >
              <g className="schematic-navcams">
                <CameraBox x={526} y={126} width={32} height={21} />
                <CameraBox x={570} y={126} width={32} height={21} />
                <path d="M542 147 V158 M586 147 V158" />
                <text x="544" y="119">NAVCAM</text>
              </g>
            </SchematicPart>

            <SchematicPart
              part={roverSchematicParts.find((part) => part.id === 'robotic-arm')!}
              amount={partAmount('robotic-arm')}
              selected={selectedId === 'robotic-arm'}
              hovered={hoveredId === 'robotic-arm'}
              activeSystem={activeSystem}
              onHover={setHoveredId}
              onSelect={selectPart}
            >
              <g className="schematic-arm">
                <circle cx="382" cy="386" r="12" />
                <path d="M375 392 L322 432 L278 452" />
                <circle cx="322" cy="432" r="10" />
                <path d="M278 452 L246 472 L230 500" />
                <rect x="203" y="486" width="48" height="34" rx="5" transform="rotate(-16 227 503)" />
                <circle cx="221" cy="502" r="7" />
                <path d="M247 491 L258 487 M251 501 L262 497" />
                <text x="218" y="538">BRAÇO ROBÓTICO</text>
              </g>
            </SchematicPart>

            <SchematicPart
              part={roverSchematicParts.find((part) => part.id === 'hazard-cameras')!}
              amount={partAmount('hazard-cameras')}
              selected={selectedId === 'hazard-cameras'}
              hovered={hoveredId === 'hazard-cameras'}
              activeSystem={activeSystem}
              onHover={setHoveredId}
              onSelect={selectPart}
            >
              <g className="schematic-hazcams">
                <path d="M374 418 V429 M410 418 V429" />
                <CameraBox x={354} y={429} width={34} height={22} />
                <CameraBox x={396} y={429} width={34} height={22} />
                <text x="338" y="488">HAZCAMS</text>
              </g>
            </SchematicPart>

            <g
              className="schematic-callout"
              aria-hidden="true"
              style={
                {
                  '--callout-delay': reducedMotion ? '0ms' : '90ms',
                } as CSSProperties
              }
            >
              <path
                d={`M${calloutStart.x} ${calloutStart.y} L${selectedPart.callout.x} ${selectedPart.callout.y}`}
              />
              <circle cx={calloutStart.x} cy={calloutStart.y} r="5" />
              <circle cx={selectedPart.callout.x} cy={selectedPart.callout.y} r="3" />
              <text
                x={
                  selectedPart.callout.x > 720
                    ? selectedPart.callout.x - 10
                    : selectedPart.callout.x + 10
                }
                y={selectedPart.callout.y - 9}
                textAnchor={selectedPart.callout.x > 720 ? 'end' : 'start'}
              >
                {selectedPart.label.toUpperCase()}
              </text>
            </g>

            <g className="schematic-scale" aria-hidden="true">
              <path d="M60 666 H178" />
              <path d="M60 660 V672 M118 663 V669 M178 660 V672" />
              <text x="188" y="671">REFERÊNCIA VISUAL</text>
            </g>
          </svg>

          <p className="schematic-disclaimer">
            Esquema ilustrativo baseado em fontes da NASA. Não é geometria
            oficial, desenho de engenharia ou representação exata das peças
            internas.
          </p>
          <p id={`${uid}-keyboard-help`} className="sr-only">
            Use as setas para percorrer as peças, Enter para selecionar, Escape
            para montar novamente e as setas do controle deslizante para mudar a
            separação.
          </p>
        </div>

        <aside className="schematic-detail" aria-live="polite">
          <p className="schematic-detail__index">
            PEÇA {String(selectedIndex + 1).padStart(2, '0')} /{' '}
            {String(roverSchematicParts.length).padStart(2, '0')}
          </p>
          <h3>{selectedPart.label}</h3>
          <span className="schematic-detail__system">{selectedPart.system}</span>
          <p className="schematic-detail__summary">{selectedPart.summary}</p>
          <p className="schematic-detail__copy">{selectedPart.detail}</p>

          {selectedPart.inside ? (
            <div className="schematic-inside-note">
              <Layers aria-hidden="true" size={18} />
              <div>
                <strong>Dentro do corpo</strong>
                <p>{selectedPart.inside}</p>
              </div>
            </div>
          ) : null}

          <a
            className="schematic-source"
            href={selectedPart.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            {selectedPart.sourceLabel}
            <ArrowUpRight aria-hidden="true" size={15} />
          </a>

          <div className="schematic-parts" aria-label="Lista de peças">
            <p>Explorar peças</p>
            <div>
              {visibleParts.map((part) => (
                <button
                  key={part.id}
                  id={`part-button-${part.id}`}
                  type="button"
                  className={part.id === selectedId ? 'is-active' : ''}
                  aria-pressed={part.id === selectedId}
                  onClick={() => selectPart(part)}
                >
                  <span>
                    {String(
                      roverSchematicParts.findIndex(
                        (candidate) => candidate.id === part.id,
                      ) + 1,
                    ).padStart(2, '0')}
                  </span>
                  {part.label}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}

