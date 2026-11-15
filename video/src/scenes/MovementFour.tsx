import { Img, interpolate, useCurrentFrame } from 'remotion';
import {
  DustField,
  Headline,
  SceneCanvas,
  ScreenKicker,
  SignalLine,
  StarField,
  easeInOut,
  easeOut,
  fadeWindow,
} from '../components/Cinematic';
import { FILM_ASSETS } from '../data/assets';

export function NinetyDaysScene() {
  const frame = useCurrentFrame();
  const duration = 300;
  const sceneOpacity = fadeWindow(frame, 0, duration, 18);
  const number = easeOut(frame, [0, 52], [0.84, 1]);
  const copy = easeOut(frame, [46, 110]);
  const date = easeOut(frame, [172, 232]);

  return (
    <SceneCanvas
      className="scene-ninety"
      style={{ opacity: sceneOpacity }}
    >
      <div className="scene-ninety__panorama">
        <Img src={FILM_ASSETS.finalPanorama} />
      </div>
      <div className="scene-ninety__wash" aria-hidden="true" />
      <div className="scene-ninety__number" style={{ transform: `scale(${number})` }}>
        90
        <span>sols planejados</span>
      </div>
      <div className="scene-ninety__copy" style={{ opacity: copy }}>
        <ScreenKicker>2004 · Meridiani Planum</ScreenKicker>
        <Headline className="headline-large">
          O plano era
          <br />
          uma missão curta.
        </Headline>
      </div>
      <div className="scene-ninety__date" style={{ opacity: date }}>
        25.01.2004
        <small>pouso em Marte · UTC</small>
      </div>
      <DustField intensity={0.72} />
    </SceneCanvas>
  );
}

export function FourteenYearsScene() {
  const frame = useCurrentFrame();
  const duration = 300;
  const sceneOpacity = fadeWindow(frame, 0, duration, 18);
  const reveal = easeOut(frame, [0, 70]);
  const rover = easeInOut(frame, [48, 220], [0.03, 1]);
  const line = easeOut(frame, [94, 232]);

  return (
    <SceneCanvas
      className="scene-fourteen"
      style={{ opacity: sceneOpacity }}
    >
      <StarField density={0.46} />
      <div
        className="scene-fourteen__rover"
        style={{
          opacity: rover,
          transform: `translateX(${easeOut(frame, [48, 220], [150, 0])}px) scale(${easeInOut(frame, [48, 220], [0.92, 1])})`,
        }}
      >
        <Img src={FILM_ASSETS.roverSelfie} />
      </div>
      <div className="scene-fourteen__copy" style={{ opacity: reveal }}>
        <ScreenKicker>O que continuou</ScreenKicker>
        <Headline className="headline-number">
          mais de
          <strong>14</strong>
          anos
        </Headline>
        <SignalLine frame={frame} start={66} duration={148} />
        <div className="scene-fourteen__note" style={{ opacity: line }}>
          A missão seguiu muito além do planejado.
        </div>
      </div>
      <DustField intensity={0.38} />
    </SceneCanvas>
  );
}

export function TraverseScene() {
  const frame = useCurrentFrame();
  const duration = 300;
  const sceneOpacity = fadeWindow(frame, 0, duration, 16);
  const mapScale = easeOut(frame, [0, 290], [1.02, 1.19]);
  const number = easeOut(frame, [28, 96]);
  const pathProgress = easeOut(frame, [84, 260]);

  return (
    <SceneCanvas
      className="scene-traverse"
      style={{ opacity: sceneOpacity }}
    >
      <div
        className="scene-traverse__map"
        style={{ transform: `scale(${mapScale}) translateX(-3%)` }}
      >
        <Img src={FILM_ASSETS.traverseMap} />
      </div>
      <div className="scene-traverse__wash" aria-hidden="true" />
      <div className="scene-traverse__path" aria-hidden="true">
        <i style={{ transform: `scaleX(${pathProgress})` }} />
      </div>
      <div className="scene-traverse__copy" style={{ opacity: number }}>
        <ScreenKicker>Rodas · rota · distância</ScreenKicker>
        <Headline className="headline-distance">
          45,16
          <span>km</span>
        </Headline>
        <div className="scene-traverse__fact">
          Uma jornada real, medida sobre Marte.
        </div>
      </div>
    </SceneCanvas>
  );
}

export function LastSignalScene() {
  const frame = useCurrentFrame();
  const duration = 300;
  const sceneOpacity = fadeWindow(frame, 0, duration, 18);
  const imageReveal = easeInOut(frame, [36, 168], [0, 0.88]);
  const dust = easeOut(frame, [0, 150], [0.24, 1.35]);
  const date = easeOut(frame, [12, 62]);
  const fact = easeOut(frame, [148, 220]);

  return (
    <SceneCanvas
      className="scene-last-signal"
      style={{ opacity: sceneOpacity }}
    >
      <div
        className="scene-last-signal__image"
        style={{
          opacity: imageReveal,
          transform: `scale(${interpolate(frame, [36, 290], [0.92, 1.1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })}) rotate(${interpolate(frame, [36, 290], [-1.5, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })}deg)`,
        }}
      >
        <Img src={FILM_ASSETS.lastSignal} />
        <div className="scene-last-signal__noise" aria-hidden="true" />
      </div>
      <div className="scene-last-signal__copy">
        <ScreenKicker style={{ opacity: date }}>O último conjunto de dados</ScreenKicker>
        <Headline className="headline-date" style={{ opacity: date }}>
          10.06.2018
        </Headline>
        <div className="scene-last-signal__sol">SOL 5111</div>
      </div>
      <div className="scene-last-signal__fact" style={{ opacity: fact }}>
        Uma imagem incompleta e ruidosa.
        <br />
        Não uma despedida.
      </div>
      <DustField intensity={dust} />
    </SceneCanvas>
  );
}

export function EvidenceScene() {
  const frame = useCurrentFrame();
  const duration = 300;
  const sceneOpacity = fadeWindow(frame, 0, duration, 16);
  const question = fadeWindow(frame, 6, 150, 14);
  const answer = easeOut(frame, [144, 204]);
  const discovery = easeOut(frame, [192, 250]);

  return (
    <SceneCanvas
      className="scene-evidence"
      style={{ opacity: sceneOpacity }}
    >
      <div
        className="scene-evidence__image"
        style={{
          transform: `scale(${easeOut(frame, [0, 280], [1.08, 1.26])})`,
        }}
      >
        <Img src={FILM_ASSETS.hematite} />
      </div>
      <div className="scene-evidence__wash" aria-hidden="true" />
      <div className="scene-evidence__quiz" style={{ opacity: question }}>
        <ScreenKicker>O que o Opportunity encontrou?</ScreenKicker>
        <Headline className="headline-large">
          O que ficou
          <br />
          em Marte?
        </Headline>
      </div>
      <div className="scene-evidence__answer" style={{ opacity: answer }}>
        <span>Evidências de</span>
        <strong>ambientes antigos com água.</strong>
      </div>
      <div className="scene-evidence__discovery" style={{ opacity: discovery }}>
        Não água líquida hoje.
        <br />
        Uma descoberta para investigar.
      </div>
      <div className="scene-evidence__crosshair" aria-hidden="true">
        <i />
        <i />
      </div>
    </SceneCanvas>
  );
}
