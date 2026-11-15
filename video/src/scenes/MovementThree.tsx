import { Img, interpolate, useCurrentFrame } from 'remotion';
import {
  DustField,
  Headline,
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

export function SolutionScene() {
  const frame = useCurrentFrame();
  const duration = 300;
  const sceneOpacity = fadeWindow(frame, 0, duration, 16);
  const brand = easeOut(frame, [6, 54]);
  const statement = easeOut(frame, [66, 130]);
  const signature = easeOut(frame, [180, 246]);

  return (
    <SceneCanvas
      className="scene-solution"
      style={{ opacity: sceneOpacity }}
    >
      <StarField density={0.42} speed={0.008} />
      <div className="scene-solution__halo" aria-hidden="true" />
      <div className="scene-solution__copy">
        <ScreenKicker style={{ opacity: brand }}>A solução</ScreenKicker>
        <Headline className="headline-brand" style={{ opacity: brand }}>
          After
          <br />
          the Signal
        </Headline>
        <SignalLine frame={frame} start={58} duration={110} />
        <div className="scene-solution__statement" style={{ opacity: statement }}>
          O arquivo científico da NASA
          <br />
          vira uma experiência que uma criança
          <br />
          consegue explorar sozinha.
        </div>
        <div className="scene-solution__signature" style={{ opacity: signature }}>
          Arquivos reais.
          <br />
          Curiosidade de criança.
          <br />
          Histórias que não terminam.
        </div>
      </div>
      <div className="scene-solution__orbit" aria-hidden="true">
        <i />
        <i />
      </div>
    </SceneCanvas>
  );
}

export function OrbitScene() {
  const frame = useCurrentFrame();
  const duration = 300;
  const sceneOpacity = fadeWindow(frame, 0, duration, 16);
  const titleOpacity = easeOut(frame, [12, 62]);
  const labelOpacity = easeOut(frame, [90, 150]);
  const zoom = easeInOut(frame, [80, 285], [0, 0.18]);

  return (
    <SceneCanvas
      className="scene-orbit-film"
      style={{ opacity: sceneOpacity }}
    >
      <SolarSystemStage
        focus={frame > 140 ? 'mars' : null}
        zoom={zoom}
        showLabels={false}
      />
      <div className="scene-orbit-film__copy" style={{ opacity: titleOpacity }}>
        <ScreenKicker>Comece por aqui</ScreenKicker>
        <Headline className="headline-large">
          O sistema solar
          <br />
          é a porta.
        </Headline>
      </div>
      <div className="scene-orbit-film__worlds" style={{ opacity: labelOpacity }}>
        <span className="is-mars">Marte</span>
        <span className="is-moon">Lua</span>
      </div>
      <div className="scene-orbit-film__hint">
        <span aria-hidden="true" />
        escolha um mundo
      </div>
    </SceneCanvas>
  );
}

export function MarsDiveScene() {
  const frame = useCurrentFrame();
  const duration = 300;
  const sceneOpacity = fadeWindow(frame, 0, duration, 16);
  const titleOpacity = fadeWindow(frame, 12, 138, 12);
  const scale = interpolate(frame, [70, 290], [0.72, 3.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const atmosphereOpacity = easeOut(frame, [70, 190]);
  const copyOpacity = easeOut(frame, [162, 222]);

  return (
    <SceneCanvas
      className="scene-dive"
      style={{ opacity: sceneOpacity }}
    >
      <StarField density={0.5} speed={0.03} />
      <div
        className="scene-dive__planet"
        style={{ transform: `translateY(${easeOut(frame, [70, 290], [0, 160])}px) scale(${scale})` }}
      >
        <Img src={FILM_ASSETS.marsTexture} />
        <div
          className="scene-dive__atmosphere"
          style={{ opacity: atmosphereOpacity }}
        />
      </div>
      <Headline
        className="headline-world"
        style={{ opacity: titleOpacity }}
      >
        Marte
      </Headline>
      <div className="scene-dive__copy" style={{ opacity: copyOpacity }}>
        <ScreenKicker>Descida</ScreenKicker>
        <Headline className="headline-large">
          Atravesse o espaço.
          <br />
          Desça até a história.
        </Headline>
      </div>
      <DustField intensity={1.45} />
    </SceneCanvas>
  );
}
