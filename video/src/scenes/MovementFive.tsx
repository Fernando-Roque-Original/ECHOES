import { Img, useCurrentFrame } from 'remotion';
import {
  ChildSilhouette,
  DustField,
  Headline,
  IllustrativeNote,
  SceneCanvas,
  ScreenKicker,
  SignalLine,
  SolarSystemStage,
  StarField,
  easeInOut,
  easeOut,
  fadeWindow,
} from '../components/Cinematic';
import { FILM_ASSETS } from '../data/assets';

export function ImpactScene() {
  const frame = useCurrentFrame();
  const duration = 360;
  const sceneOpacity = fadeWindow(frame, 0, duration, 18);
  const glow = easeOut(frame, [0, 120], [0.22, 0.8]);
  const lineOne = fadeWindow(frame, 14, 188, 16);
  const lineTwo = easeOut(frame, [172, 236]);

  return (
    <SceneCanvas
      className="scene-impact"
      style={{ opacity: sceneOpacity }}
    >
      <div className="scene-impact__projection" style={{ opacity: glow }} aria-hidden="true">
        <Img src={FILM_ASSETS.marsTexture} />
      </div>
      <ChildSilhouette
        style={{
          transform: `translateX(-10px) scale(${easeOut(frame, [0, 340], [0.98, 1.04])})`,
        }}
      />
      <div className="scene-impact__copy">
        <ScreenKicker style={{ opacity: lineOne }}>O que pode começar</ScreenKicker>
        <Headline className="headline-large" style={{ opacity: lineOne }}>
          Uma história real
          <br />
          pode ser o começo
          <br />
          <em>de um novo cientista.</em>
        </Headline>
        <div className="scene-impact__audiences" style={{ opacity: lineTwo }}>
          <span>escolas públicas</span>
          <span>professores</span>
          <span>famílias</span>
        </div>
      </div>
      <IllustrativeNote compact />
      <DustField intensity={0.18} />
    </SceneCanvas>
  );
}

export function TransformationScene() {
  const frame = useCurrentFrame();
  const duration = 300;
  const sceneOpacity = fadeWindow(frame, 0, duration, 16);
  const light = easeOut(frame, [0, 116], [0.12, 1]);
  const text = easeOut(frame, [32, 100]);
  const questions = [
    'Como?',
    'Por quê?',
    'E se?',
  ];

  return (
    <SceneCanvas
      className="scene-transformation"
      style={{ opacity: sceneOpacity }}
    >
      <div className="scene-transformation__projection" style={{ opacity: light }}>
        <Img src={FILM_ASSETS.finalPanorama} />
      </div>
      <div className="scene-transformation__child">
        <ChildSilhouette />
      </div>
      <div className="scene-transformation__copy" style={{ opacity: text }}>
        <ScreenKicker>Transformação</ScreenKicker>
        <Headline className="headline-large">
          Ela não está
          <br />
          apenas vendo ciência.
        </Headline>
        <Headline className="headline-statement is-warm">
          Está fazendo
          <br />
          as perguntas
          <br />
          que a ciência faz.
        </Headline>
      </div>
      <div className="scene-transformation__questions" aria-hidden="true">
        {questions.map((question, index) => {
          const appear = easeInOut(frame, [82 + index * 24, 118 + index * 24]);
          return (
            <span
              key={question}
              style={{
                opacity: appear,
                transform: `translateY(${(1 - appear) * 22}px)`,
              }}
            >
              {question}
            </span>
          );
        })}
      </div>
      <IllustrativeNote compact />
    </SceneCanvas>
  );
}

export function FutureScene() {
  const frame = useCurrentFrame();
  const duration = 360;
  const sceneOpacity = fadeWindow(frame, 0, duration, 18);
  const zoom = easeInOut(frame, [0, 340], [0.05, 0.22]);
  const line = easeOut(frame, [28, 100]);
  const next = easeOut(frame, [180, 250]);

  return (
    <SceneCanvas
      className="scene-future"
      style={{ opacity: sceneOpacity }}
    >
      <SolarSystemStage focus={frame > 120 ? 'moon' : null} zoom={zoom} />
      <div className="scene-future__copy" style={{ opacity: line }}>
        <ScreenKicker>O arquivo continua</ScreenKicker>
        <Headline className="headline-large">
          A Lua já está aberta.
        </Headline>
      </div>
      <div className="scene-future__next" style={{ opacity: next }}>
        Novos mundos.
        <br />
        Novas histórias.
      </div>
      <SignalLine
        frame={frame}
        start={60}
        duration={250}
        className="scene-future__signal"
      />
    </SceneCanvas>
  );
}

export function LegacyScene() {
  const frame = useCurrentFrame();
  const duration = 390;
  const sceneOpacity = fadeWindow(frame, 0, duration, 18);
  const first = easeOut(frame, [0, 62]);
  const second = easeOut(frame, [48, 118]);
  const third = easeOut(frame, [98, 168]);
  const conclusion = easeOut(frame, [244, 318]);

  return (
    <SceneCanvas
      className="scene-legacy"
      style={{ opacity: sceneOpacity }}
    >
      <StarField density={0.74} speed={0.009} />
      <div className="scene-legacy__numbers">
        <div style={{ opacity: first }}>
          <strong>90</strong>
          <span>sols planejados</span>
        </div>
        <div style={{ opacity: second }}>
          <strong>14+</strong>
          <span>anos de missão</span>
        </div>
        <div style={{ opacity: third }}>
          <strong className="is-distance">45,16</strong>
          <span>quilômetros</span>
        </div>
      </div>
      <SignalLine frame={frame} start={44} duration={236} />
      <Headline className="headline-statement" style={{ opacity: conclusion }}>
        A missão terminou.
        <br />
        <em>A descoberta ficou.</em>
      </Headline>
      <div className="scene-legacy__source">
        Opportunity · MER-B · NASA/JPL-Caltech
      </div>
    </SceneCanvas>
  );
}

export function FinaleScene() {
  const frame = useCurrentFrame();
  const duration = 240;
  const sceneOpacity = fadeWindow(frame, 0, duration, 16);
  const lineOne = easeOut(frame, [8, 54]);
  const lineTwo = easeOut(frame, [46, 92]);
  const brand = easeOut(frame, [100, 150]);
  const team = easeOut(frame, [126, 178]);
  const signature = easeOut(frame, [150, 206]);
  const lineProgress = easeOut(frame, [0, 190]);

  return (
    <SceneCanvas
      className="scene-finale"
      style={{ opacity: sceneOpacity }}
    >
      <StarField density={0.88} speed={0.006} />
      <div className="scene-finale__solar" aria-hidden="true">
        <SolarSystemStage showLabels={false} />
      </div>
      <div className="scene-finale__signal" aria-hidden="true">
        <i style={{ transform: `scaleX(${lineProgress})` }} />
      </div>
      <div className="scene-finale__copy">
        <Headline className="headline-closing" style={{ opacity: lineOne }}>
          O sinal termina.
        </Headline>
        <Headline className="headline-closing is-warm" style={{ opacity: lineTwo }}>
          A luz continua.
        </Headline>
        <div className="scene-finale__brand" style={{ opacity: brand }}>
          <i aria-hidden="true" />
          After the Signal
        </div>
        <div className="scene-finale__team" style={{ opacity: team }}>
          Uma experiência criada por <strong>ECHOES</strong>
        </div>
        <div className="scene-finale__signature" style={{ opacity: signature }}>
          Arquivos reais. Curiosidade de criança.
          <br />
          Histórias que não terminam.
        </div>
      </div>
    </SceneCanvas>
  );
}
