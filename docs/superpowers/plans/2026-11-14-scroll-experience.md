# After the Signal — Scroll Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o app em uma experiência contínua com sistema solar dominante, Marte e Lua selecionáveis e narrativa conduzida por scroll nativo.

**Architecture:** Um novo `ScrollExperience` renderiza a abertura, o palco orbital e as jornadas no mesmo documento. O modelo 3D existente é reutilizado com foco e callbacks explícitos; o conteúdo linear compartilha uma fonte única com o modo arquivo.

**Tech Stack:** React 19, TypeScript, Vite, Three.js, React Three Fiber, Motion, Zustand.

**Spec:** `docs/superpowers/specs/2026-11-14-scroll-experience-and-pitch-film-design.md`

## Global Constraints

- Manter scroll nativo, sem scroll hijacking.
- Marte e Lua são os únicos mundos visitáveis; os demais mostram “Ainda em silêncio”.
- A cena principal não usa cards, grades ou microtextos explicativos.
- Toda seleção por mouse/3D tem equivalente por teclado/toque.
- O GLB do Opportunity não é carregado no primeiro viewport.
- Fatos da seção 11 da spec não podem ser contraditos.
- `/?mode=archive` preserva todo o conteúdo essencial sem WebGL.

## Review Focus

- Falha de WebGL: o visitante precisa manter acesso ao conteúdo pelo modo arquivo.
- Movimento reduzido: zoom, parallax e rotação não podem ser a única forma de avançar.
- Deep links `?world=mars` e `?world=moon`: devem abrir o ramo correto sem prender o visitante.
- Acesso por teclado: planetas e mundos em silêncio precisam de alvos focáveis.
- Mobile: o sistema solar e os dados não podem causar overflow horizontal.

### Task 1: Query state and shared journey content

**Files:**
- Create: `src/app/queryState.ts`
- Create: `src/experience/journey.ts`
- Create: `src/experience/useSectionProgress.ts`
- Test: `src/test/queryState.test.ts`

**Interfaces:**
- Produces: `readQueryState(search?: string): { mode: ExperienceMode; world: World | null }`
- Produces: `marsJourney`, `moonJourney`, `legacyFacts`
- Produces: `useSectionProgress(ref): number`

- [ ] Write tests for archive mode, world parsing and invalid values.
- [ ] Run tests and confirm the module is missing.
- [ ] Add query parsing and immutable journey data.
- [ ] Run tests and confirm they pass.

### Task 2: Cinematic experience

**Files:**
- Create: `src/app/ScrollExperience.tsx`
- Create: `src/components/ExperienceStage.tsx`
- Create: `src/components/OrbitSelector.tsx`
- Create: `src/components/SilentWorldToast.tsx`
- Create: `src/components/scroll/MarsJourney.tsx`
- Create: `src/components/scroll/MoonJourney.tsx`
- Create: `src/components/scroll/MarsQuiz.tsx`
- Create: `src/components/scroll/JourneyFinale.tsx`
- Modify: `src/scenes/SolarSystem.tsx`
- Modify: `src/styles/global.css`
- Test: `src/test/ScrollExperience.test.tsx`

**Interfaces:**
- Consumes: `marsJourney`, `moonJourney`, `useSectionProgress`.
- Produces: landmarks `#ignicao`, `#orbita`, `#jornada-mars`, `#jornada-moon`, `#legado`.

- [ ] Write an interaction test for opening a world and returning to the orbit.
- [ ] Run it and confirm the new experience is absent.
- [ ] Implement the stage, selector, scroll journeys and quiz.
- [ ] Run the interaction test and confirm it passes.

### Task 3: Archive and application routing

**Files:**
- Create: `src/app/ArchiveExperience.tsx`
- Modify: `src/app/App.tsx`
- Test: `src/test/ArchiveExperience.test.tsx`

**Interfaces:**
- Consumes: `readQueryState`, journey data.
- Produces: archive route with the same facts, images and provenance.

- [ ] Write a test that archive mode exposes both world journeys without a canvas.
- [ ] Run it and confirm it fails.
- [ ] Implement archive rendering and route selection.
- [ ] Run it and confirm it passes.

### Task 4: QA, accessibility and visual verification

**Files:**
- Modify: `scripts/qa.mjs`
- Modify: `src/test/setup.ts`

- [ ] Update Playwright for the new opening/orbit/worlds and fail on HTTP errors or overflow.
- [ ] Run `rtk npm test`.
- [ ] Run `rtk npm run build`.
- [ ] Run the dev server and `rtk npm run qa`.
- [ ] Inspect desktop and mobile screenshots.

