import {
  ArrowUpRight,
  Box,
  Layers,
  ScanLine,
} from 'lucide-react';
import {
  useId,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import {
  getLunarModuleTeardownCopy,
  type LunarModulePartId,
} from '../i18n/lunarTeardown';
import type { Locale } from '../i18n/types';
import { LunarModuleViewer } from './LunarModuleViewer';

type LunarModuleTeardownProps = {
  reducedMotion: boolean;
  locale?: Locale;
  className?: string;
  progress?: number;
  active?: boolean;
};

function clampProgress(progress: number) {
  if (!Number.isFinite(progress)) return 0;
  return Math.min(1, Math.max(0, progress));
}

function LunarExplodedDiagram({
  selectedId,
  reducedMotion,
  titleId,
  descriptionId,
  title,
  description,
}: {
  selectedId: LunarModulePartId;
  reducedMotion: boolean;
  titleId: string;
  descriptionId: string;
  title: string;
  description: string;
}) {
  const gradientId = `${titleId}-foil`;
  const cabinGradientId = `${titleId}-cabin`;
  const glowId = `${titleId}-glow`;
  const patternId = `${titleId}-grid`;
  const partClass = (id: LunarModulePartId) =>
    `lunar-part lunar-part--${id}${
      selectedId === id ? ' is-active' : ''
    }`;

  return (
    <svg
      className={`lunar-diagram${
        reducedMotion ? ' is-reduced-motion' : ''
      }`}
      viewBox="0 0 560 640"
      role="img"
      aria-labelledby={`${titleId} ${descriptionId}`}
    >
      <title id={titleId}>{title}</title>
      <desc id={descriptionId}>{description}</desc>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5e4821" />
          <stop offset="0.38" stopColor="#d2a64e" />
          <stop offset="0.68" stopColor="#79602b" />
          <stop offset="1" stopColor="#2b2417" />
        </linearGradient>
        <linearGradient id={cabinGradientId} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#f3ead5" />
          <stop offset="0.58" stopColor="#bab8aa" />
          <stop offset="1" stopColor="#5d625f" />
        </linearGradient>
        <radialGradient id={glowId}>
          <stop offset="0" stopColor="#f2c26b" stopOpacity="0.38" />
          <stop offset="1" stopColor="#f2c26b" stopOpacity="0" />
        </radialGradient>
        <pattern id={patternId} width="32" height="32" patternUnits="userSpaceOnUse">
          <path
            d="M 32 0 L 0 0 0 32"
            fill="none"
            stroke="rgba(154, 203, 212, 0.11)"
            strokeWidth="0.8"
          />
        </pattern>
      </defs>

      <rect width="560" height="640" fill={`url(#${patternId})`} />
      <ellipse
        cx="280"
        cy="576"
        rx="202"
        ry="28"
        fill={`url(#${glowId})`}
        opacity="0.72"
      />
      <ellipse
        cx="280"
        cy="576"
        rx="162"
        ry="18"
        fill="none"
        stroke="rgba(242, 194, 107, 0.24)"
        strokeDasharray="4 10"
      />
      <path
        className="lunar-diagram__axis"
        d="M280 48V582"
        aria-hidden="true"
      />

      <g className="lunar-diagram__separation" aria-hidden="true">
        <path d="M278 306H282M278 412H282M278 496H282" />
        <path d="M244 354H316M248 464H312" strokeDasharray="3 9" />
      </g>

      <g className={partClass('antennas')}>
        <path
          className="lunar-part__stroke"
          d="M154 176 137 105M137 105l-20-18M137 105l24-4"
        />
        <circle className="lunar-part__dot" cx="154" cy="176" r="4" />
        <path
          className="lunar-part__stroke"
          d="M414 188c-25-29-17-71 20-84 39-13 71 19 60 55-6 18-19 31-34 38"
        />
        <path
          className="lunar-part__stroke"
          d="m451 185 9 45M478 169l37 16"
        />
        <ellipse
          className="lunar-part__dish"
          cx="432"
          cy="151"
          rx="8"
          ry="4"
          transform="rotate(-20 432 151)"
        />
        <circle className="lunar-part__dot" cx="460" cy="230" r="4" />
      </g>

      <g className={partClass('ascent')}>
        <path
          className="lunar-part__cabin"
          fill={`url(#${cabinGradientId})`}
          d="M198 177c42-42 121-43 164 0l-17 121c-31 25-98 25-130 0z"
        />
        <path
          className="lunar-part__metal"
          d="m198 177 16 121c16 12 36 18 66 18s50-6 65-18l17-121c-42-29-121-29-164 0z"
        />
        <path
          className="lunar-part__metal"
          d="M239 180h82l-9 39h-64z"
        />
        <path
          className="lunar-part__glass"
          d="m244 189 25-7-5 29h-24zM294 182l24 7 4 22h-24z"
        />
        <path
          className="lunar-part__stroke"
          d="M280 154v32M218 242h124M221 264h118"
        />
        <rect
          className="lunar-part__hatch"
          x="308"
          y="212"
          width="34"
          height="42"
          rx="5"
        />
        <circle className="lunar-part__dot" cx="188" cy="221" r="7" />
        <circle className="lunar-part__dot" cx="372" cy="221" r="7" />
        <path
          className="lunar-part__metal"
          d="M218 298h124l-18 18h-88z"
        />
      </g>

      <g className={partClass('descent')}>
        <path
          className="lunar-part__foil"
          fill={`url(#${gradientId})`}
          d="M126 330h308l-30 43-28 72H186l-30-72z"
        />
        <path
          className="lunar-part__metal"
          d="M126 330h308l-28 21H155z"
        />
        <path
          className="lunar-part__stroke"
          d="m155 351-27 23M214 351l-17 94M280 351v94M346 351l17 94M405 351l27 23M200 398h160M186 444h188"
        />
        <path
          className="lunar-part__stroke"
          d="M174 370h212M180 420h200"
          strokeDasharray="5 8"
        />
      </g>

      <g className={partClass('engine')}>
        <path
          className="lunar-part__metal"
          d="M254 442h52v31h-52z"
        />
        <path
          className="lunar-part__engine"
          d="M242 473h76l35 63h-31l-17-28h-50l-17 28h-31z"
        />
        <path
          className="lunar-part__stroke"
          d="M249 494h62M258 515h44"
        />
      </g>

      <g className={partClass('landing-gear')}>
        <path
          className="lunar-part__stroke lunar-part__stroke--leg"
          d="m151 397-71 134M409 397l71 134M194 415l-39 138M366 415l39 138"
        />
        <path
          className="lunar-part__stroke"
          d="m91 515 33 25M469 515l-33 25M167 536l31 23M393 536l-31 23"
        />
        <ellipse className="lunar-part__foot" cx="75" cy="536" rx="31" ry="10" />
        <ellipse className="lunar-part__foot" cx="485" cy="536" rx="31" ry="10" />
        <ellipse className="lunar-part__foot" cx="151" cy="558" rx="27" ry="9" />
        <ellipse className="lunar-part__foot" cx="409" cy="558" rx="27" ry="9" />
        <path
          className="lunar-part__metal"
          d="m86 516 18-12 24 21-8 13zM474 516l-18-12-24 21 8 13z"
        />
      </g>

      <g className="lunar-diagram__label" aria-hidden="true">
        <path d="M86 278h70" />
        <text x="44" y="265">ASCENT</text>
        <path d="M392 384h82" />
        <text x="432" y="372">DESCENT</text>
      </g>
    </svg>
  );
}

export default function LunarModuleTeardown({
  reducedMotion,
  locale = 'pt-BR',
  className,
  progress,
  active = true,
}: LunarModuleTeardownProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, '');
  const copy = getLunarModuleTeardownCopy(locale);
  const scrollDriven = progress !== undefined;
  const explosion = reducedMotion
    ? 0.58
    : clampProgress(progress ?? 0.58);
  const [viewMode, setViewMode] = useState<'3d' | 'diagram'>('3d');
  const [selectedId, setSelectedId] =
    useState<LunarModulePartId | null>(null);
  const guidedPart = useMemo(() => {
    const index = Math.min(
      copy.parts.length - 1,
      Math.floor(explosion * copy.parts.length),
    );
    return copy.parts[index];
  }, [copy.parts, explosion]);
  const selectedPart =
    copy.parts.find((part) => part.id === selectedId) ?? guidedPart;
  const selectedIndex = copy.parts.findIndex(
    (part) => part.id === selectedPart.id,
  );
  const style = {
    '--lm-explode': explosion,
    '--lm-ascent-y': `${explosion * -58}px`,
    '--lm-descent-y': `${explosion * 16}px`,
    '--lm-engine-y': `${explosion * 38}px`,
    '--lm-gear-y': `${explosion * 50}px`,
    '--lm-antenna-y': `${explosion * -34}px`,
  } as CSSProperties;

  return (
    <section
      className={[
        'lunar-teardown',
        scrollDriven ? 'is-scroll-driven' : '',
        active ? 'is-active' : '',
        reducedMotion ? 'is-reduced-motion' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      aria-label={copy.sectionAriaLabel}
    >
      <div className="lunar-teardown__toolbar">
        <div>
          <span className="lunar-teardown__kicker">
            <ScanLine aria-hidden="true" size={16} />
            {copy.kicker}
          </span>
          <p>{copy.intro}</p>
        </div>
        <div className="lunar-teardown__chips" aria-hidden="true">
          <span>{copy.chips.didactic}</span>
          <span>{copy.chips.assemblies}</span>
          <span>
            {copy.chips.exploded} {Math.round(explosion * 100)}%
          </span>
        </div>
      </div>

      <div className="lunar-workbench">
        <div className="lunar-stage">
          <div
            className="lunar-stage__mode"
            role="group"
            aria-label={copy.viewer.modeLabel}
          >
            <button
              type="button"
              className={viewMode === '3d' ? 'is-active' : ''}
              aria-pressed={viewMode === '3d'}
              onClick={() => setViewMode('3d')}
            >
              <Box aria-hidden="true" size={14} />
              {copy.viewer.model3d}
            </button>
            <button
              type="button"
              className={viewMode === 'diagram' ? 'is-active' : ''}
              aria-pressed={viewMode === 'diagram'}
              onClick={() => setViewMode('diagram')}
            >
              <ScanLine aria-hidden="true" size={14} />
              {copy.viewer.diagram}
            </button>
          </div>

          {viewMode === '3d' && active ? (
            <LunarModuleViewer
              active={active}
              reducedMotion={reducedMotion}
              scrollDriven={scrollDriven}
              progress={explosion}
              loadingLabel={copy.viewer.loading}
              fallbackLabel={copy.viewer.fallback}
            />
          ) : (
            <LunarExplodedDiagram
              selectedId={selectedPart.id}
              reducedMotion={reducedMotion}
              titleId={`${uid}-diagram-title`}
              descriptionId={`${uid}-diagram-description`}
              title={copy.diagramAriaLabel}
              description={copy.diagramDescription}
            />
          )}
          <div className="lunar-stage__readout" aria-hidden="true">
            <span>
              LM-5 / {viewMode === '3d' ? 'NASA GLB' : 'EAGLE'}
            </span>
            <span>{String(selectedIndex + 1).padStart(2, '0')} / 05</span>
          </div>
          <p className="lunar-stage__credit" aria-hidden="true">
            {viewMode === '3d'
              ? scrollDriven
                ? copy.viewer.scrollMode
                : copy.viewer.modelCredit
              : copy.diagramDescription}
          </p>
          <div className="lunar-stage__scale" aria-hidden="true">
            <span>ASSEMBLED</span>
            <i />
            <span>EXPLODED</span>
          </div>
        </div>

        <aside className="lunar-detail" aria-live="polite">
          <div
            className="lunar-parts"
            role="group"
            aria-label={copy.partsGroupLabel}
          >
            {copy.parts.map((part, index) => (
              <button
                key={part.id}
                type="button"
                className={selectedPart.id === part.id ? 'is-active' : ''}
                aria-pressed={selectedPart.id === part.id}
                onClick={() => setSelectedId(part.id)}
              >
                <i
                  aria-hidden="true"
                  style={{ backgroundColor: part.color }}
                />
                <span>{String(index + 1).padStart(2, '0')}</span>
                {part.label}
              </button>
            ))}
          </div>

          <div key={selectedPart.id} className="lunar-detail__content">
            <p className="lunar-detail__index">
              {copy.detail.partLabel}{' '}
              {String(selectedIndex + 1).padStart(2, '0')} / 05
            </p>
            <p
              className="lunar-detail__eyebrow"
              style={{ color: selectedPart.color }}
            >
              {selectedPart.eyebrow}
            </p>
            <h3>{selectedPart.label}</h3>
            <p className="lunar-detail__summary">
              {selectedPart.summary}
            </p>
            <p className="lunar-detail__copy">{selectedPart.detail}</p>
            <a
              className="lunar-source"
              href={selectedPart.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              {selectedPart.sourceLabel}
              <ArrowUpRight aria-hidden="true" size={15} />
            </a>
          </div>

          <div className="lunar-honesty">
            <Layers aria-hidden="true" size={18} />
            <div>
              <strong>{copy.detail.honestyTitle}</strong>
              <p>{copy.detail.honestyBody}</p>
            </div>
          </div>

          <div className="lunar-sources">
            <a
              className="lunar-source"
              href={copy.detail.sourceModelUrl}
              target="_blank"
              rel="noreferrer"
            >
              {copy.detail.sourceModel}
              <ArrowUpRight aria-hidden="true" size={15} />
            </a>
            <a
              className="lunar-source"
              href={copy.detail.sourceLandingUrl}
              target="_blank"
              rel="noreferrer"
            >
              {copy.detail.sourceLanding}
              <ArrowUpRight aria-hidden="true" size={15} />
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
