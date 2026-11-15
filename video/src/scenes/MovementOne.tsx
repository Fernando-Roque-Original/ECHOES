import { Img, useCurrentFrame } from 'remotion';
import {
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

export function OpeningDoorScene() {
  const frame = useCurrentFrame();
  const duration = 180;
  const sceneOpacity = fadeWindow(frame, 0, duration, 16);
  const firstLine = fadeWindow(frame, 8, 84, 10);
  const secondLine = fadeWindow(frame, 88, 174, 10);
  const childScale = easeOut(frame, [0, 170], [0.96, 1.04]);

  return (
    <SceneCanvas
      className="scene-opening"
      style={{ opacity: sceneOpacity }}
    >
      <StarField density={0.82} />
      <div className="scene-opening__window" aria-hidden="true" />
      <div className="scene-opening__glow" aria-hidden="true" />
      <ChildSilhouette
        style={{ transform: `translateX(42px) scale(${childScale})` }}
      />
      <div className="scene-opening__copy">
        <ScreenKicker>Uma porta para o céu</ScreenKicker>
        <Headline className="headline-hero" style={{ opacity: firstLine }}>
          Toda criança
          <br />
          já olhou
          <br />
          <em>para o céu.</em>
        </Headline>
        <Headline className="headline-large" style={{ opacity: secondLine }}>
          Mas nem toda criança
          <br />
          encontra uma porta
          <br />
          <em>para entrar nele.</em>
        </Headline>
      </div>
      <IllustrativeNote />
    </SceneCanvas>
  );
}

export function SignalArrivalScene() {
  const frame = useCurrentFrame();
  const duration = 240;
  const sceneOpacity = fadeWindow(frame, 0, duration, 18);
  const planetScale = easeOut(frame, [0, 220], [0.88, 1.08]);
  const dateOpacity = easeOut(frame, [18, 70]);
  const copyOpacity = easeOut(frame, [72, 116]);

  return (
    <SceneCanvas
      className="scene-signal-arrival"
      style={{ opacity: sceneOpacity }}
    >
      <StarField density={0.38} speed={0.018} />
      <div
        className="scene-signal-arrival__planet"
        style={{ transform: `scale(${planetScale})` }}
      >
        <Img src={FILM_ASSETS.marsTexture} />
        <div className="scene-signal-arrival__atmosphere" />
      </div>
      <div className="scene-signal-arrival__copy">
        <ScreenKicker>Marte · Meridiani Planum</ScreenKicker>
        <Headline
          className="headline-date"
          style={{ opacity: dateOpacity }}
        >
          10.06.2018
        </Headline>
        <SignalLine frame={frame} start={28} duration={92} />
        <div
          className="scene-signal-arrival__statement"
          style={{ opacity: copyOpacity }}
        >
          O último conjunto de dados
          <br />
          do Opportunity chegou de Marte.
        </div>
        <div className="scene-signal-arrival__telemetry">
          <span>SOL 5111</span>
          <span>TEMPESTADE DE POEIRA</span>
        </div>
      </div>
      <DustField intensity={1.25} />
    </SceneCanvas>
  );
}

export function InterruptionScene() {
  const frame = useCurrentFrame();
  const duration = 180;
  const sceneOpacity = fadeWindow(frame, 0, duration, 14);
  const missionOpacity = easeOut(frame, [8, 56]);
  const storyOpacity = easeOut(frame, [62, 112]);
  const lineProgress = easeOut(frame, [18, 144]);

  return (
    <SceneCanvas
      className="scene-interruption"
      style={{ opacity: sceneOpacity }}
    >
      <StarField density={0.46} />
      <div
        className="scene-interruption__mars"
        style={{
          transform: `translateX(${easeOut(frame, [0, 170], [180, -120])}px) scale(1.22)`,
          opacity: 0.46,
        }}
      >
        <Img src={FILM_ASSETS.finalPanorama} />
      </div>
      <div className="scene-interruption__copy">
        <Headline
          className="headline-statement"
          style={{ opacity: missionOpacity }}
        >
          A missão terminou.
        </Headline>
        <div
          className="scene-interruption__divider"
          style={{ transform: `scaleX(${lineProgress})` }}
        />
        <Headline
          className="headline-statement is-warm"
          style={{ opacity: storyOpacity }}
        >
          A história, não.
        </Headline>
      </div>
      <div className="scene-interruption__year">2018</div>
    </SceneCanvas>
  );
}
