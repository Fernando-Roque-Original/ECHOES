import { create } from 'zustand';

export type Screen =
  | 'home'
  | 'approach'
  | 'map'
  | 'artifact'
  | 'story'
  | 'evidence'
  | 'legacy';

export type World = 'mars' | 'moon';

export type UiState = {
  screen: Screen;
  selectedWorld: World | null;
  selectedArtifact: string | null;
  chapterIndex: number;
  audioEnabled: boolean;
  reducedMotion: boolean;
  subtitlesEnabled: boolean;
  largeText: boolean;
  demoMode: boolean;
  demoStartedAt: number | null;
  sourcesOpen: boolean;
  preferencesOpen: boolean;
  moonNoticeOpen: boolean;
  silentWorldCode: string | null;
  historicPhotoOpen: boolean;
};

type ExperienceStore = UiState & {
  selectWorld: (world: World) => void;
  startStory: () => void;
  finishApproach: () => void;
  openArtifact: () => void;
  openStory: () => void;
  openEvidence: () => void;
  openLegacy: () => void;
  goHome: () => void;
  goBack: () => void;
  nextChapter: () => void;
  previousChapter: () => void;
  setChapter: (index: number) => void;
  toggleAudio: () => void;
  toggleSubtitles: () => void;
  toggleReducedMotion: () => void;
  toggleLargeText: () => void;
  openSources: () => void;
  closeSources: () => void;
  togglePreferences: () => void;
  closeMoonNotice: () => void;
  openSilentWorld: (code: string) => void;
  closeSilentWorld: () => void;
  setHistoricPhotoOpen: (open: boolean) => void;
};

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const demoMode =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('demo') === '1';

const initialScreen: Screen =
  typeof window !== 'undefined' &&
  ['approach', 'map', 'artifact', 'story', 'evidence', 'legacy'].includes(
    new URLSearchParams(window.location.search).get('scene') ?? '',
  )
    ? (new URLSearchParams(window.location.search).get('scene') as Screen)
    : 'home';

export const useExperienceStore = create<ExperienceStore>((set, get) => ({
  screen: initialScreen,
  selectedWorld: initialScreen === 'home' ? null : 'mars',
  selectedArtifact: initialScreen === 'artifact' ? 'opportunity' : null,
  chapterIndex: 0,
  audioEnabled: false,
  reducedMotion: Boolean(prefersReducedMotion),
  subtitlesEnabled: true,
  largeText: false,
  demoMode,
  demoStartedAt:
    demoMode && initialScreen !== 'home' ? Date.now() : null,
  sourcesOpen: false,
  preferencesOpen: false,
  moonNoticeOpen: false,
  silentWorldCode: null,
  historicPhotoOpen: false,
  selectWorld: (world) =>
    set({
      selectedWorld: world,
      screen: world === 'mars' ? 'approach' : 'home',
      moonNoticeOpen: world === 'moon',
      demoStartedAt:
        demoMode && world === 'mars'
          ? (get().demoStartedAt ?? Date.now())
          : get().demoStartedAt,
    }),
  startStory: () =>
    set({
      selectedWorld: 'mars',
      selectedArtifact: 'opportunity',
      screen: 'approach',
      demoStartedAt: demoMode ? (get().demoStartedAt ?? Date.now()) : null,
    }),
  finishApproach: () => set({ screen: 'map' }),
  openArtifact: () => set({ screen: 'artifact', selectedArtifact: 'opportunity' }),
  openStory: () => set({ screen: 'story', chapterIndex: 0 }),
  openEvidence: () => set({ screen: 'evidence' }),
  openLegacy: () => set({ screen: 'legacy' }),
  goHome: () => set({ screen: 'home', selectedWorld: null, chapterIndex: 0 }),
  goBack: () => {
    const screen = get().screen;
    const backMap: Record<Screen, Screen> = {
      home: 'home',
      approach: 'home',
      map: 'home',
      artifact: 'map',
      story: 'artifact',
      evidence: 'story',
      legacy: 'evidence',
    };
    set({ screen: backMap[screen] });
  },
  nextChapter: () => {
    const { chapterIndex, openEvidence } = get();
    if (chapterIndex >= 3) {
      openEvidence();
      return;
    }
    set({ chapterIndex: chapterIndex + 1 });
  },
  previousChapter: () => set({ chapterIndex: Math.max(0, get().chapterIndex - 1) }),
  setChapter: (index) => set({ chapterIndex: Math.max(0, Math.min(3, index)) }),
  toggleAudio: () => set({ audioEnabled: !get().audioEnabled }),
  toggleSubtitles: () => set({ subtitlesEnabled: !get().subtitlesEnabled }),
  toggleReducedMotion: () => set({ reducedMotion: !get().reducedMotion }),
  toggleLargeText: () => set({ largeText: !get().largeText }),
  openSources: () => set({ sourcesOpen: true, preferencesOpen: false }),
  closeSources: () => set({ sourcesOpen: false }),
  togglePreferences: () => set({ preferencesOpen: !get().preferencesOpen }),
  closeMoonNotice: () => set({ moonNoticeOpen: false }),
  openSilentWorld: (code) =>
    set({ silentWorldCode: code, preferencesOpen: false }),
  closeSilentWorld: () => set({ silentWorldCode: null }),
  setHistoricPhotoOpen: (open) => set({ historicPhotoOpen: open }),
}));

