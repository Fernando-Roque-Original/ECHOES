# After the Signal — 180-Second Pitch Film Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produzir um filme de pitch de 180 segundos, em português, sem slides, usando capturas reais do site, imagens NASA, motion graphics e uma criança representativa.

**Architecture:** Projeto Remotion próprio em `video/`, com cenas React/TypeScript, assets oficiais, capturas determinísticas via Playwright e uma composição master de 5400 frames a 30 fps.

**Tech Stack:** Remotion, React, TypeScript, Playwright, FFmpeg, assets NASA.

**Spec:** `docs/superpowers/specs/2026-11-14-scroll-experience-and-pitch-film-design.md`

## Global Constraints

- 1920 × 1080, 30 fps, exatamente 180 s / 5400 frames.
- Português do Brasil; pitch sem slides.
- Criança e escola representativas, marcadas como “situação ilustrativa”.
- O áudio da reunião informa decisões, mas nunca será narração final.
- Nenhuma fala, despedida ou emoção inventada para o Opportunity.
- Primeiros 15–30 s e frase final recebem tratamento prioritário.

## Review Focus

- Fatos científicos devem coincidir com `SOURCES.md` e a seção 11 da spec.
- A abertura não pode começar com uma sequência de estatísticas.
- A criança nunca pode ser enquadrada por pena ou pobreza.
- Capturas precisam continuar legíveis em 1080p e em reprodução comum.
- A ausência de locução final não pode esconder problemas de ritmo no animatic.

### Task 1: Project and animatic

**Files:**
- Create: `video/package.json`
- Create: `video/src/Root.tsx`
- Create: `video/src/PitchFilm.tsx`
- Create: `video/src/scenes/*`
- Create: `video/src/styles/*`
- Test: `video/src/__tests__/timeline.test.ts`

**Interfaces:**
- Produces: composition `PitchFilm`, 5400 frames, 1920 × 1080, 30 fps.

- [x] Add the failing timeline test for five narrative movements and exact frame total.
- [x] Scaffold Remotion and implement the static animatic.
- [ ] Render control frames at the five movement boundaries and inspect.

### Task 2: Product captures

**Files:**
- Create: `video/scripts/capture-site.mjs`
- Create: `video/public/captures/*`

**Interfaces:**
- Consumes: `#ignicao`, `#orbita`, `#jornada-mars`, `#legado`.
- Produces: deterministic 1920 × 1080 PNG sequences.

- [ ] Implement named capture states for orbit, Mars dive, rover, evidence and quiz.
- [ ] Run the capture script against the local site.
- [ ] Verify dimensions, filenames and content.

### Task 3: Finish and master

**Files:**
- Create: `video/public/audio/*`
- Create: `video/public/illustration/*`
- Create: `video/src/data/captions.ts`
- Create: `video/out/after-the-signal.mp4`
- Create: `video/out/after-the-signal.srt`

**Interfaces:**
- Consumes: approved animatic and captures.
- Produces: H.264/AAC master, SRT and burned-in captions variant.

- [ ] Replace temporary narration and placeholders with approved assets.
- [ ] Mix narration, music and sound design.
- [ ] Render master and caption variant; verify duration and legibility.

