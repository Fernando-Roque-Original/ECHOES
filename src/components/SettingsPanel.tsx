import {
  Captions,
  CaptionsOff,
  ExternalLink,
  Music2,
  Music4,
  Settings2,
  Type,
  Waves,
} from 'lucide-react';
import { useExperienceStore } from '../state/experienceStore';

export function SettingsPanel() {
  const open = useExperienceStore((state) => state.preferencesOpen);
  const audioEnabled = useExperienceStore((state) => state.audioEnabled);
  const subtitlesEnabled = useExperienceStore((state) => state.subtitlesEnabled);
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const largeText = useExperienceStore((state) => state.largeText);
  const togglePreferences = useExperienceStore((state) => state.togglePreferences);
  const toggleAudio = useExperienceStore((state) => state.toggleAudio);
  const toggleSubtitles = useExperienceStore((state) => state.toggleSubtitles);
  const toggleReducedMotion = useExperienceStore((state) => state.toggleReducedMotion);
  const toggleLargeText = useExperienceStore((state) => state.toggleLargeText);
  const openSources = useExperienceStore((state) => state.openSources);

  if (!open) return null;

  return (
    <section
      id="settings-panel"
      className="settings-panel"
      aria-label="Ajustes de acessibilidade"
      role="dialog"
    >
      <div className="settings-panel__heading">
        <Settings2 aria-hidden="true" />
        <div>
          <strong>Leitura e som</strong>
          <span>Você controla a experiência.</span>
        </div>
      </div>
      <div className="settings-panel__grid">
        <button
          type="button"
          aria-pressed={audioEnabled}
          className="setting-toggle"
          onClick={toggleAudio}
        >
          {audioEnabled ? (
            <Music4 aria-hidden="true" />
          ) : (
            <Music2 aria-hidden="true" />
          )}
          <span>
            <strong>Som</strong>
            <small>{audioEnabled ? 'Ligado' : 'Desligado'}</small>
          </span>
        </button>
        <button
          type="button"
          aria-pressed={subtitlesEnabled}
          className="setting-toggle"
          onClick={toggleSubtitles}
        >
          {subtitlesEnabled ? (
            <Captions aria-hidden="true" />
          ) : (
            <CaptionsOff aria-hidden="true" />
          )}
          <span>
            <strong>Legendas</strong>
            <small>{subtitlesEnabled ? 'Sempre visíveis' : 'Ocultas'}</small>
          </span>
        </button>
        <button
          type="button"
          aria-pressed={reducedMotion}
          className="setting-toggle"
          onClick={toggleReducedMotion}
        >
          <Waves aria-hidden="true" />
          <span>
            <strong>Movimento</strong>
            <small>{reducedMotion ? 'Reduzido' : 'Padrão'}</small>
          </span>
        </button>
        <button
          type="button"
          aria-pressed={largeText}
          className="setting-toggle"
          onClick={toggleLargeText}
        >
          <Type aria-hidden="true" />
          <span>
            <strong>Texto</strong>
            <small>{largeText ? 'Maior' : 'Padrão'}</small>
          </span>
        </button>
      </div>
      <button
        className="settings-panel__source-link"
        type="button"
        onClick={openSources}
      >
        <ExternalLink aria-hidden="true" />
        O que é real aqui?
      </button>
      <button
        className="settings-panel__close"
        type="button"
        onClick={togglePreferences}
      >
        Fechar ajustes
      </button>
    </section>
  );
}

