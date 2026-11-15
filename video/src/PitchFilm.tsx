import type { ComponentType } from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {
  findCaptionAtFrame,
  type CaptionCue,
} from './data/captions';
import {
  AccessScene,
  ArchiveScene,
  DistanceScene,
} from './scenes/MovementTwo';
import {
  FourteenYearsScene,
  LastSignalScene,
  NinetyDaysScene,
  EvidenceScene,
  TraverseScene,
} from './scenes/MovementFour';
import {
  FinaleScene,
  FutureScene,
  ImpactScene,
  LegacyScene,
  TransformationScene,
} from './scenes/MovementFive';
import {
  InterruptionScene,
  OpeningDoorScene,
  SignalArrivalScene,
} from './scenes/MovementOne';
import {
  MarsDiveScene,
  OrbitScene,
  SolutionScene,
} from './scenes/MovementThree';
import {
  FILM_MOVEMENTS,
  FILM_SCENES,
  FILM_TOTAL_FRAMES,
  frameToTimecode,
  type SceneId,
} from './timeline';
import './styles.css';

export interface PitchFilmProps {
  showCaptions: boolean;
  animatic: boolean;
}

const SCENE_COMPONENTS: Record<SceneId, ComponentType> = {
  abertura: OpeningDoorScene,
  'chegada-do-sinal': SignalArrivalScene,
  interrupcao: InterruptionScene,
  arquivo: ArchiveScene,
  distancia: DistanceScene,
  acesso: AccessScene,
  solucao: SolutionScene,
  orbita: OrbitScene,
  mergulho: MarsDiveScene,
  'noventa-dias': NinetyDaysScene,
  'quatorze-anos': FourteenYearsScene,
  trajeto: TraverseScene,
  'ultimo-sinal': LastSignalScene,
  evidencia: EvidenceScene,
  impacto: ImpactScene,
  transformacao: TransformationScene,
  futuro: FutureScene,
  legado: LegacyScene,
  assinatura: FinaleScene,
};

function Caption({
  cue,
  frame,
}: {
  cue: CaptionCue;
  frame: number;
}) {
  const localFrame = frame - cue.startFrame;
  const duration = cue.endFrame - cue.startFrame;
  const opacity = interpolate(
    localFrame,
    [0, 5, duration - 5, duration],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  return (
    <AbsoluteFill className="cine-captions">
      <div className="cine-captions__shade" aria-hidden="true" />
      <div className="cine-captions__cue" style={{ opacity }}>
        {cue.text}
      </div>
    </AbsoluteFill>
  );
}

function CaptionTrack() {
  const frame = useCurrentFrame();
  const cue = findCaptionAtFrame(frame);
  if (!cue) return null;

  return <Caption cue={cue} frame={frame} />;
}

function AnimaticOverlay() {
  const frame = useCurrentFrame();
  const movement = FILM_MOVEMENTS.find(
    (item) =>
      frame >= item.from &&
      frame < item.from + item.durationInFrames,
  );
  const progress = frame / (FILM_TOTAL_FRAMES - 1);

  return (
    <>
      <div className="cine-animatic">
        <strong>ANIMATIC</strong>
        <span>{movement?.title ?? 'After the Signal'}</span>
        <b>
          {frameToTimecode(frame)} / {frameToTimecode(FILM_TOTAL_FRAMES)}
        </b>
      </div>
      <div className="cine-animatic__rail" aria-hidden="true">
        <i style={{ transform: `scaleX(${progress})` }} />
        {FILM_MOVEMENTS.map((item) => (
          <span
            key={item.id}
            style={{
              left: `${(item.from / FILM_TOTAL_FRAMES) * 100}%`,
            }}
          />
        ))}
      </div>
    </>
  );
}

export function PitchFilm({
  showCaptions,
  animatic,
}: PitchFilmProps) {
  return (
    <AbsoluteFill className="film-root">
      <Audio src={staticFile('audio/mix.wav')} />
      {FILM_SCENES.map((scene) => {
        const SceneComponent = SCENE_COMPONENTS[scene.id];
        return (
          <Sequence
            key={`${scene.movementId}-${scene.id}`}
            from={scene.from}
            durationInFrames={scene.durationInFrames}
            name={`${scene.title} · ${scene.id}`}
          >
            <SceneComponent />
          </Sequence>
        );
      })}
      {showCaptions ? <CaptionTrack /> : null}
      {animatic ? <AnimaticOverlay /> : null}
    </AbsoluteFill>
  );
}
