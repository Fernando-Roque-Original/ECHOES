import {
  ArrowLeft,
  BookOpenText,
  Settings2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { useExperienceStore } from '../state/experienceStore';
import { DemoPilot } from './DemoPilot';
import { JourneyProgress } from './JourneyProgress';
import { MoonNotice } from './MoonNotice';
import { SettingsPanel } from './SettingsPanel';
import { SilentWorldNotice } from './SilentWorldNotice';
import { SourcesPanel } from './SourcesPanel';

const screenTitles: Record<string, string> = {
  home: 'Abertura',
  approach: 'Aproximação',
  map: 'Mapa de Marte',
  artifact: 'Objeto do museu',
  story: 'História',
  evidence: 'Evidência',
  legacy: 'Legado',
};

export function AppShell({ children }: { children: ReactNode }) {
  const screen = useExperienceStore((state) => state.screen);
  const audioEnabled = useExperienceStore((state) => state.audioEnabled);
  const preferencesOpen = useExperienceStore((state) => state.preferencesOpen);
  const sourcesOpen = useExperienceStore((state) => state.sourcesOpen);
  const moonNoticeOpen = useExperienceStore((state) => state.moonNoticeOpen);
  const silentWorldCode = useExperienceStore((state) => state.silentWorldCode);
  const toggleAudio = useExperienceStore((state) => state.toggleAudio);
  const togglePreferences = useExperienceStore((state) => state.togglePreferences);
  const goBack = useExperienceStore((state) => state.goBack);
  const goHome = useExperienceStore((state) => state.goHome);
  const largeText = useExperienceStore((state) => state.largeText);

  useEffect(() => {
    document.documentElement.classList.toggle('large-text', largeText);
  }, [largeText]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (sourcesOpen || moonNoticeOpen || silentWorldCode) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      if (preferencesOpen) {
        togglePreferences();
        return;
      }
      if (screen !== 'home') goBack();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [
    goBack,
    moonNoticeOpen,
    preferencesOpen,
    screen,
    silentWorldCode,
    sourcesOpen,
    togglePreferences,
  ]);

  return (
    <div className={`app app--${screen}`}>
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <div className="ambient-grain" aria-hidden="true" />

      <header className="topbar">
        <div className="topbar__identity">
          {screen !== 'home' ? (
            <button
              className="icon-button topbar__back"
              type="button"
              onClick={goBack}
              aria-label={`Voltar para ${screenTitles[screen] === 'Aproximação' ? 'a abertura' : 'a etapa anterior'}`}
            >
              <ArrowLeft aria-hidden="true" />
            </button>
          ) : null}
          <button className="wordmark" type="button" onClick={goHome}>
            <span className="wordmark__signal" aria-hidden="true" />
            <span>ECHOES</span>
          </button>
          <span className="topbar__section" aria-hidden="true">
            {screenTitles[screen]}
          </span>
        </div>

        <JourneyProgress />

        <div className="topbar__tools">
          <button
            className="tool-button"
            type="button"
            aria-pressed={audioEnabled}
            onClick={toggleAudio}
            aria-label={audioEnabled ? 'Desligar som' : 'Ligar som'}
          >
            {audioEnabled ? (
              <Volume2 aria-hidden="true" size={20} />
            ) : (
              <VolumeX aria-hidden="true" size={20} />
            )}
            <span className="tool-button__label">
              {audioEnabled ? 'Som ligado' : 'Som'}
            </span>
          </button>
          <button
            className="tool-button"
            type="button"
            aria-label="Abrir ajustes de leitura e som"
            aria-expanded={preferencesOpen}
            aria-controls="settings-panel"
            onClick={togglePreferences}
          >
            <Settings2 aria-hidden="true" size={20} />
            <span className="tool-button__label">Ajustes</span>
          </button>
          <button
            className="tool-button topbar__about"
            type="button"
            aria-label="Abrir fontes e proveniência"
            onClick={() => useExperienceStore.setState({ sourcesOpen: true })}
          >
            <BookOpenText aria-hidden="true" size={20} />
            <span className="tool-button__label">Fontes</span>
          </button>
        </div>
      </header>

      <main id="main-content" className="main-stage" tabIndex={-1}>
        {children}
      </main>

      <SettingsPanel />
      <SourcesPanel />
      <MoonNotice />
      <SilentWorldNotice />
      <DemoPilot />
      <div className="sr-only" aria-live="polite">
        {screenTitles[screen]}
      </div>
    </div>
  );
}

