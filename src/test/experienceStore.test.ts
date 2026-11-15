import { beforeEach, describe, expect, it } from 'vitest';
import { useExperienceStore } from '../state/experienceStore';

const reset = () =>
  useExperienceStore.setState({
    screen: 'home',
    selectedWorld: null,
    selectedArtifact: null,
    chapterIndex: 0,
    audioEnabled: false,
    reducedMotion: true,
    subtitlesEnabled: true,
    sourcesOpen: false,
    preferencesOpen: false,
    moonNoticeOpen: false,
    silentWorldCode: null,
    historicPhotoOpen: false,
    demoStartedAt: null,
  });

describe('experience state machine', () => {
  beforeEach(reset);

  it('walks the complete Opportunity journey without dead ends', () => {
    const state = useExperienceStore.getState();
    state.startStory();
    expect(useExperienceStore.getState().screen).toBe('approach');

    useExperienceStore.getState().finishApproach();
    expect(useExperienceStore.getState().screen).toBe('map');

    useExperienceStore.getState().openArtifact();
    expect(useExperienceStore.getState().screen).toBe('artifact');

    useExperienceStore.getState().openStory();
    expect(useExperienceStore.getState().screen).toBe('story');

    useExperienceStore.getState().nextChapter();
    useExperienceStore.getState().nextChapter();
    useExperienceStore.getState().nextChapter();
    expect(useExperienceStore.getState().chapterIndex).toBe(3);

    useExperienceStore.getState().nextChapter();
    expect(useExperienceStore.getState().screen).toBe('evidence');

    useExperienceStore.getState().openLegacy();
    expect(useExperienceStore.getState().screen).toBe('legacy');
  });

  it('always provides a useful back route', () => {
    useExperienceStore.setState({ screen: 'legacy' });
    useExperienceStore.getState().goBack();
    expect(useExperienceStore.getState().screen).toBe('evidence');

    useExperienceStore.setState({ screen: 'evidence' });
    useExperienceStore.getState().goBack();
    expect(useExperienceStore.getState().screen).toBe('story');

    useExperienceStore.setState({ screen: 'story' });
    useExperienceStore.getState().goBack();
    expect(useExperienceStore.getState().screen).toBe('artifact');

    useExperienceStore.setState({ screen: 'artifact' });
    useExperienceStore.getState().goBack();
    expect(useExperienceStore.getState().screen).toBe('map');

    useExperienceStore.getState().goBack();
    expect(useExperienceStore.getState().screen).toBe('home');
  });

  it('opens the honest coming-soon state for the Moon', () => {
    useExperienceStore.getState().selectWorld('moon');
    expect(useExperienceStore.getState().screen).toBe('home');
    expect(useExperienceStore.getState().moonNoticeOpen).toBe(true);
    useExperienceStore.getState().closeMoonNotice();
    expect(useExperienceStore.getState().moonNoticeOpen).toBe(false);
  });

  it('records a silent world without pretending it has story content', () => {
    useExperienceStore.getState().openSilentWorld('ARQ-07');
    expect(useExperienceStore.getState().silentWorldCode).toBe('ARQ-07');
    useExperienceStore.getState().closeSilentWorld();
    expect(useExperienceStore.getState().silentWorldCode).toBeNull();
  });

  it('keeps audio off until an explicit toggle', () => {
    expect(useExperienceStore.getState().audioEnabled).toBe(false);
    useExperienceStore.getState().toggleAudio();
    expect(useExperienceStore.getState().audioEnabled).toBe(true);
    useExperienceStore.getState().toggleAudio();
    expect(useExperienceStore.getState().audioEnabled).toBe(false);
  });
});

