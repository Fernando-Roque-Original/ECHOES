import { Img, useCurrentFrame } from 'remotion';
import {
  ArchiveType,
  ChildSilhouette,
  DustField,
  Headline,
  IllustrativeNote,
  SceneCanvas,
  ScreenKicker,
  SignalLine,
  StarField,
  easeOut,
  fadeWindow,
} from '../components/Cinematic';
import { FILM_ASSETS } from '../data/assets';

const ARCHIVE_ROWS = [
  { top: 112, text: 'PIA22929 / MER-B / SOL 5111', speed: -0.36 },
  { top: 235, text: 'NASA/JPL-CALTECH · ATMOSPHERE · DUST OPACITY', speed: 0.22 },
  { top: 346, text: 'MERIDIANI PLANUM · TRAVERSE · 45.16 KM', speed: -0.18 },
  { top: 468, text: 'HEMATITE SPHERULES · SEDIMENTARY EVIDENCE', speed: 0.32 },
  { top: 590, text: 'RAW TELEMETRY · ENGINEERING CAMERA · PANCAM', speed: -0.28 },
  { top: 712, text: 'OPPORTUNITY / MER-01 / 2004—2018', speed: 0.17 },
  { top: 834, text: 'NASA SCIENCE ARCHIVE · ENGLISH · TECHNICAL DATA', speed: -0.2 },
];

export function ArchiveScene() {
  const frame = useCurrentFrame();
  const duration = 330;
  const sceneOpacity = fadeWindow(frame, 0, duration, 18);
  const firstTitle = fadeWindow(frame, 8, 148, 16);
  const secondTitle = easeOut(frame, [158, 214]);
  const zoom = easeOut(frame, [0, 320], [1.03, 1.12]);

  return (
    <SceneCanvas
      className="scene-archive"
      style={{ opacity: sceneOpacity }}
    >
      <div
        className="scene-archive__photo"
        style={{ transform: `scale(${zoom})` }}
      >
        <Img src={FILM_ASSETS.finalPanorama} />
      </div>
      <div className="scene-archive__wash" aria-hidden="true" />
      <div className="scene-archive__rows" aria-hidden="true">
        {ARCHIVE_ROWS.map((row, index) => (
          <ArchiveType
            key={row.text}
            style={{
              top: row.top,
              transform: `translateX(${(frame * row.speed - index * 85) % 220 - 110}px)`,
              opacity: 0.13 + (index % 3) * 0.06,
            }}
          >
            {row.text}
          </ArchiveType>
        ))}
      </div>
      <div className="scene-archive__copy">
        <ScreenKicker>O arquivo existe</ScreenKicker>
        <Headline className="headline-large" style={{ opacity: firstTitle }}>
          Histórias extraordinárias
          <br />
          vivem em arquivos técnicos.
        </Headline>
        <Headline className="headline-large is-warm" style={{ opacity: secondTitle }}>
          Em inglês.
          <br />
          Feitos para especialistas.
        </Headline>
      </div>
      <DustField intensity={0.22} />
    </SceneCanvas>
  );
}

export function DistanceScene() {
  const frame = useCurrentFrame();
  const duration = 240;
  const sceneOpacity = fadeWindow(frame, 0, duration, 16);
  const childScale = easeOut(frame, [0, 220], [0.92, 1]);
  const marsScale = easeOut(frame, [0, 220], [0.96, 1.07]);
  const textOpacity = easeOut(frame, [28, 92]);

  return (
    <SceneCanvas
      className="scene-distance"
      style={{ opacity: sceneOpacity }}
    >
      <StarField density={0.7} />
      <ChildSilhouette
        className="scene-distance__child"
        style={{ transform: `scale(${childScale})` }}
      />
      <div
        className="scene-distance__mars"
        style={{ transform: `scale(${marsScale})` }}
      >
        <Img src={FILM_ASSETS.marsTexture} />
      </div>
      <SignalLine
        frame={frame}
        start={16}
        duration={160}
        className="scene-distance__signal"
      />
      <div className="scene-distance__copy" style={{ opacity: textOpacity }}>
        <ScreenKicker>A distância</ScreenKicker>
        <Headline className="headline-large">
          A ciência parecia
          <br />
          estar do outro lado
          <br />
          <em>de uma porta fechada.</em>
        </Headline>
      </div>
      <IllustrativeNote compact />
    </SceneCanvas>
  );
}

export function AccessScene() {
  const frame = useCurrentFrame();
  const duration = 180;
  const sceneOpacity = fadeWindow(frame, 0, duration, 14);
  const first = easeOut(frame, [8, 52]);
  const second = easeOut(frame, [62, 108]);
  const doorOpen = easeOut(frame, [82, 166], [0.08, 0.88]);

  return (
    <SceneCanvas
      className="scene-access"
      style={{ opacity: sceneOpacity }}
    >
      <div
        className="scene-access__door"
        style={{
          transform: `scaleX(${doorOpen})`,
          opacity: 0.42 + doorOpen * 0.45,
        }}
        aria-hidden="true"
      />
      <div className="scene-access__copy">
        <Headline className="headline-large" style={{ opacity: first }}>
          Não falta curiosidade.
        </Headline>
        <Headline className="headline-statement is-warm" style={{ opacity: second }}>
          Falta acesso.
        </Headline>
      </div>
      <div className="scene-access__horizon" aria-hidden="true" />
    </SceneCanvas>
  );
}
