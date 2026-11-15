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
import type { Locale } from '../i18n';
import { getUiCopy } from '../i18n/ui';
import { useExperienceStore } from '../state/experienceStore';

export function SettingsPanel({ locale = 'en' }: { locale?: Locale }) {
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
  const copy = getUiCopy(locale).settings;

  if (!open) return null;

  return (
    <section
      id="settings-panel"
      className="settings-panel"
      aria-label={copy.ariaLabel}
      role="dialog"
    >
      <div className="settings-panel__heading">
        <Settings2 aria-hidden="true" />
        <div>
          <strong>{copy.title}</strong>
          <span>{copy.description}</span>
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
            <strong>{copy.sound}</strong>
            <small>{audioEnabled ? copy.soundOn : copy.soundOff}</small>
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
            <strong>{copy.captions}</strong>
            <small>
              {subtitlesEnabled ? copy.captionsVisible : copy.captionsHidden}
            </small>
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
            <strong>{copy.motion}</strong>
            <small>
              {reducedMotion ? copy.motionReduced : copy.motionDefault}
            </small>
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
            <strong>{copy.text}</strong>
            <small>{largeText ? copy.textLarge : copy.textDefault}</small>
          </span>
        </button>
      </div>
      <button
        className="settings-panel__source-link"
        type="button"
        onClick={openSources}
      >
        <ExternalLink aria-hidden="true" />
        {copy.sourcesLink}
      </button>
      <button
        className="settings-panel__close"
        type="button"
        onClick={togglePreferences}
      >
        {copy.close}
      </button>
    </section>
  );
}
