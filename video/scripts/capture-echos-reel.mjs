import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import {
  HIGHLIGHT_DURATION_SECONDS,
  MASTER_DURATION_SECONDS,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
  cleanupWorkDir,
  composeHighlight,
  composeSilentMaster,
  findChromeExecutable,
  materializeFrameSequence,
  renderOverlayAssets,
  sleep,
  validateMedia,
  writeHighlightSrt,
} from './echos-reel-lib.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..', '..');
const defaultOutDir = path.join(projectRoot, 'video', 'out');
const defaultWorkDir = path.join(
  projectRoot,
  'video',
  '.cache',
  '.echos-reel-capture',
);

const VISUAL_OVERRIDE_CSS = `
  /* Video-only editorial overrides. The site source remains untouched. */
  .cine-wordmark {
    gap: 10px !important;
  }

  .cine-wordmark > span {
    display: none !important;
  }

  .cine-wordmark::before {
    display: block !important;
    width: 8px !important;
    height: 8px !important;
    border-radius: 50% !important;
    background: var(--cine-gold) !important;
    box-shadow: 0 0 14px rgba(242, 191, 105, 0.92) !important;
    content: '' !important;
  }

  .cine-wordmark::after {
    display: block !important;
    color: var(--cine-paper) !important;
    content: 'ECHOES' !important;
    font-family: 'Bricolage Grotesque Variable', 'Bricolage Grotesque', sans-serif !important;
    font-size: 0.95rem !important;
    font-weight: 760 !important;
    letter-spacing: 0.08em !important;
    line-height: 1 !important;
  }

  .cine-ods {
    gap: 7px !important;
  }

  .cine-ods span {
    display: inline-flex !important;
    gap: 6px !important;
    align-items: center !important;
    justify-content: center !important;
    min-width: 72px !important;
    padding-inline: 10px !important;
  }

  .cine-ods span::before {
    display: inline-block !important;
    width: 15px !important;
    height: 15px !important;
    flex: 0 0 15px !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
    background-size: contain !important;
    content: '' !important;
  }

  .cine-ods span:nth-child(1)::before {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23F2BF69' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 4.5h6a4 4 0 0 1 4 4v11a3.5 3.5 0 0 0-3.5-3.5H2z'/%3E%3Cpath d='M22 4.5h-6a4 4 0 0 0-4 4v11a3.5 3.5 0 0 1 3.5-3.5H22z'/%3E%3Cpath d='M6 8.5h2M6 12h2M16 8.5h2M16 12h2'/%3E%3C/svg%3E") !important;
  }

  .cine-ods span:nth-child(2)::before {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23F2BF69' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 21h18'/%3E%3Cpath d='M4 21V10l6 3V9l6 3V4h4v17'/%3E%3Cpath d='M7 21v-3h3v3M16 7h1M16 11h1M16 15h1'/%3E%3C/svg%3E") !important;
  }

  /* Keep the teardown chapter strictly black; remove navy atmosphere layers. */
  .cine-journey__atmosphere.is-teardown,
  .cine-beat--teardown,
  .cine-beat--teardown .cine-beat__copy,
  .cine-beat--teardown .cine-beat__visual,
  .cine-beat__teardown,
  .rover-teardown,
  .teardown-toolbar,
  .teardown-separation,
  .teardown-workbench,
  .teardown-stage,
  .teardown-canvas,
  .teardown-detail,
  .teardown-actions .schematic-control,
  .teardown-layers button,
  .teardown-layers button.is-active,
  .teardown-stage__chips span,
  .teardown-stage__focus,
  .teardown-honesty,
  .teardown-stage > div[aria-hidden='true'][inert],
  .rover-schematic,
  .schematic-workbench,
  .schematic-separation,
  .schematic-control,
  .schematic-canvas,
  .schematic-detail {
    background: #000 !important;
    background-color: #000 !important;
    background-image: none !important;
  }

  .cine-journey__atmosphere.is-teardown::before,
  .cine-beat--teardown .cine-beat__visual::before,
  .cine-beat--teardown .cine-beat__visual::after,
  .cine-beat__teardown::before,
  .cine-beat__teardown::after,
  .teardown-stage::before,
  .teardown-stage::after {
    background: none !important;
    background-color: transparent !important;
    background-image: none !important;
    animation: none !important;
    opacity: 0 !important;
  }

  .cine-beat--teardown .cine-beat__visual,
  .teardown-workbench,
  .teardown-stage,
  .teardown-workbench,
  .rover-teardown,
  .schematic-workbench,
  .schematic-canvas,
  .schematic-detail {
    box-shadow: none !important;
  }

  .cine-beat--teardown .cine-beat__visual {
    border-color: rgba(242, 194, 107, 0.24) !important;
  }
`;

function parseArgs(argv) {
  const args = {
    url: process.env.ECHOS_URL ?? 'http://127.0.0.1:5173',
    outDir: defaultOutDir,
    workDir: defaultWorkDir,
    keepWork: false,
    skipCompose: false,
    inspect: false,
    preview: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--url') args.url = argv[++index];
    else if (token === '--out-dir') args.outDir = path.resolve(argv[++index]);
    else if (token === '--work-dir') args.workDir = path.resolve(argv[++index]);
    else if (token === '--keep-work') args.keepWork = true;
    else if (token === '--skip-compose') args.skipCompose = true;
    else if (token === '--inspect') args.inspect = true;
    else if (token === '--preview') args.preview = true;
    else if (token === '--help' || token === '-h') {
      console.log(
        [
          'Usage: node video/scripts/capture-echos-reel.mjs [options]',
          '  --url <url>        Site URL (default: http://127.0.0.1:5173)',
          '  --out-dir <path>   Final media directory',
          '  --work-dir <path>  Temporary capture directory',
          '  --keep-work        Keep the full frame sequence and frames',
          '  --skip-compose     Capture frames only',
          '  --inspect          Save visual QA screenshots and exit',
          '  --preview          Capture only the first 66 seconds',
        ].join('\n'),
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${token}`);
    }
  }

  return args;
}

function waitUntilEpoch(targetEpochMs) {
  return sleep(targetEpochMs - Date.now());
}

async function resolveBaseUrl(requestedUrl) {
  const candidates = [requestedUrl];
  try {
    const parsed = new URL(requestedUrl);
    if (parsed.hostname === '127.0.0.1') {
      parsed.hostname = 'localhost';
      candidates.push(parsed.toString());
    }
  } catch {
    // The browser will surface an invalid URL with a useful error.
  }

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(5_000),
      });
      if (response.ok || (response.status >= 300 && response.status < 500)) {
        return candidate.replace(/\/$/, '');
      }
    } catch {
      // Try the next local hostname.
    }
  }

  throw new Error(
    `The site is not reachable at ${requestedUrl}. Start Vite first.`,
  );
}

async function installVisualRoutes(context, page) {
  await context.route(
    /\/src\/components\/RoverTeardown\.tsx(?:\?.*)?$/,
    async (route) => {
      const response = await route.fetch();
      let body = await response.text();
      body = body
        .replaceAll('#07121a', '#000000')
        .replaceAll('#101d26', '#000000')
        .replaceAll('#020609', '#000000')
        .replaceAll('rgba(7, 18, 26, 0.97)', 'rgba(0, 0, 0, 0.98)')
        .replaceAll('rgba(7, 18, 26, 0.9)', 'rgba(0, 0, 0, 0.96)');
      await route.fulfill({
        response,
        body,
        headers: {
          ...response.headers(),
          'content-type': 'application/javascript; charset=utf-8',
        },
      });
    },
  );

  await page.addInitScript((cssText) => {
    try {
      localStorage.setItem('after-the-signal-locale', 'en');
    } catch {
      // Storage may be unavailable; the URL still uses the same page.
    }

    const inject = () => {
      if (!document.head) return;
      let style = document.getElementById('echos-reel-visual-overrides');
      if (!style) {
        style = document.createElement('style');
        style.id = 'echos-reel-visual-overrides';
        document.head.append(style);
      }
      style.textContent = cssText;
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject, { once: true });
    } else {
      inject();
    }
  }, VISUAL_OVERRIDE_CSS);
}

async function settle(page, delayMs = 250) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
    );
  });
  await sleep(delayMs);
}

async function sectionProgressTarget(page, sectionId, progress) {
  return page.evaluate(
    ({ id, targetProgress }) => {
      const section = document.getElementById(id);
      if (!section) throw new Error(`Missing #${id}`);
      const rect = section.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      const scrollableHeight = Math.max(1, rect.height - window.innerHeight);
      return top + scrollableHeight * Math.max(0, Math.min(1, targetProgress));
    },
    { id: sectionId, targetProgress: progress },
  );
}

async function smoothScrollSectionProgress(
  page,
  sectionId,
  progress,
  durationMs,
) {
  const target = await sectionProgressTarget(page, sectionId, progress);
  const start = await page.evaluate(() => window.scrollY);

  await page.mouse.move(VIDEO_WIDTH - 8, VIDEO_HEIGHT / 2);
  // Prime the native wheel path, then drive the long animation from one
  // in-page rAF loop. Hundreds of CDP wheel calls can add >10 seconds on a
  // WebGL-heavy page and make the fixed editorial timeline drift.
  await page.mouse.wheel(0, target >= start ? 1 : -1);

  await page.evaluate(
    async ({ from, to, duration }) => {
      const startedAt = performance.now();
      await new Promise((resolve) => {
        const tick = (now) => {
          const linear = Math.min(
            1,
            Math.max(0, (now - startedAt) / duration),
          );
          const eased = linear * linear * (3 - 2 * linear);
          window.scrollTo({
            top: from + (to - from) * eased,
            behavior: 'instant',
          });
          if (linear < 1) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });
      window.scrollTo({ top: to, behavior: 'instant' });
    },
    { from: start, to: target, duration: durationMs },
  );
}

async function clickElement(locator, { forceDom = false } = {}) {
  await locator.waitFor({ state: 'visible', timeout: 8_000 });
  if (forceDom) {
    await locator.evaluate((element) => element.click());
    return;
  }
  await locator.click({ timeout: 8_000 });
}

async function openWorld(page, world) {
  const card = page.locator(`.cine-world-card.is-${world}`);
  await card.waitFor({ state: 'visible', timeout: 10_000 });
  await page.waitForFunction(
    (selector) => {
      const element = document.querySelector(selector);
      return element instanceof HTMLButtonElement && !element.disabled;
    },
    `.cine-world-card.is-${world}`,
    { timeout: 10_000 },
  );
  await card.hover({ force: true, timeout: 5_000 }).catch(() => {});
  await sleep(300);
  await card.evaluate((element) => element.click());
}

async function answerQuiz(page) {
  const answer = page
    .locator('.cine-beat.is-active .cine-quiz__answer')
    .first();
  // The quiz can be attached before its reveal transform moves it fully into
  // view. Trigger the same DOM click directly so the editorial timeline does
  // not depend on Playwright's visibility/actionability heuristics.
  await answer.waitFor({ state: 'attached', timeout: 12_000 });
  await answer.evaluate((element) => {
    element.scrollIntoView({ block: 'center', inline: 'nearest' });
    element.click();
  });
  await page.waitForFunction(
    () =>
      document.querySelector(
        '.cine-beat.is-active .cine-quiz__answer.is-correct',
      ) !== null,
    undefined,
    { timeout: 5_000 },
  );
}

async function finishJourney(page) {
  const action = page.locator('.cine-beat.is-active .cine-action').first();
  await action.waitFor({ state: 'visible', timeout: 12_000 });
  await action.evaluate((element) => element.click());
}

async function launchBrowser() {
  const executablePath = await findChromeExecutable();
  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: [
      '--enable-webgl',
      '--enable-gpu',
      '--ignore-gpu-blocklist',
      '--use-angle=d3d11',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none',
      '--hide-scrollbars',
    ],
  });
  return { browser, executablePath };
}

async function createContext(browser) {
  return browser.newContext({
    viewport: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    locale: 'en-US',
    timezoneId: 'UTC',
    reducedMotion: 'no-preference',
  });
}

async function inspectVisuals({ baseUrl, workDir }) {
  const { browser, executablePath } = await launchBrowser();
  const context = await createContext(browser);
  await context.addInitScript(() => {
    try {
      localStorage.setItem('after-the-signal-locale', 'en');
    } catch {
      // Ignore storage restrictions.
    }
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  await installVisualRoutes(context, page);
  await mkdir(workDir, { recursive: true });

  try {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await settle(page, 1_200);
    await page.screenshot({
      path: path.join(workDir, 'inspect-opening.png'),
      animations: 'disabled',
    });

    const openingChecks = await page.evaluate(() => {
      const wordmark = document.querySelector('.cine-wordmark');
      const probeCanvas = document.createElement('canvas');
      const gl =
        probeCanvas.getContext('webgl2') ??
        probeCanvas.getContext('webgl');
      const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
      return {
        wordmarkText: wordmark?.innerText ?? '',
        wordmarkAfter: wordmark
          ? getComputedStyle(wordmark, '::after').content
          : 'missing',
        webglRenderer:
          gl && debugInfo
            ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
            : 'unavailable',
        odsLabels: Array.from(document.querySelectorAll('.cine-ods span')).map(
          (element) => ({
            text: element.textContent,
            icon: getComputedStyle(element, '::before').backgroundImage,
          }),
        ),
      };
    });

    await page.locator('.cine-start').click();
    await sleep(1_000);
    await smoothScrollSectionProgress(page, 'orbita', 0.4, 3_000);
    await settle(page, 800);
    await page.screenshot({
      path: path.join(workDir, 'inspect-orbit.png'),
      animations: 'disabled',
    });

    await page.goto(`${baseUrl}/?world=mars`, { waitUntil: 'networkidle' });
    await settle(page, 1_000);
    await smoothScrollSectionProgress(page, 'jornada-mars', 0.72, 1_500);
    await settle(page, 1_000);
    await page.screenshot({
      path: path.join(workDir, 'inspect-teardown.png'),
      animations: 'disabled',
    });
    const teardownChecks = await page.evaluate(() => {
      const selectors = [
        '.cine-journey__atmosphere.is-teardown',
        '.cine-beat--teardown .cine-beat__visual',
        '.teardown-workbench',
        '.teardown-stage',
        '.teardown-detail',
      ];
      return Object.fromEntries(
        selectors.map((selector) => {
          const element = document.querySelector(selector);
          return [
            selector,
            element ? getComputedStyle(element).backgroundColor : 'missing',
          ];
        }),
      );
    });

    await page.goto(`${baseUrl}/?world=moon`, { waitUntil: 'networkidle' });
    await settle(page, 1_000);
    await smoothScrollSectionProgress(page, 'jornada-moon', 0.94, 2_500);
    await settle(page, 700);
    const moonQuizBefore = await page.evaluate(() => {
      const activeBeat = document.querySelector('.cine-beat.is-active');
      const answers = activeBeat?.querySelectorAll('.cine-quiz__answer');
      return {
        activeBeatText: activeBeat?.textContent?.replace(/\s+/g, ' ').trim(),
        answers: answers?.length ?? 0,
      };
    });
    await answerQuiz(page);
    await settle(page, 500);
    const moonQuizAfter = await page.evaluate(
      () =>
        document.querySelector(
          '.cine-beat.is-active .cine-quiz__answer.is-correct',
        )?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
    );
    await page.screenshot({
      path: path.join(workDir, 'inspect-moon-quiz.png'),
      animations: 'disabled',
    });

    console.log(
      JSON.stringify(
        {
          executablePath,
          openingChecks,
          teardownChecks,
          moonQuizBefore,
          moonQuizAfter,
          screenshots: [
            path.join(workDir, 'inspect-opening.png'),
            path.join(workDir, 'inspect-orbit.png'),
            path.join(workDir, 'inspect-teardown.png'),
            path.join(workDir, 'inspect-moon-quiz.png'),
          ],
        },
        null,
        2,
      ),
    );
  } finally {
    await context.close();
    await browser.close();
  }
}

async function captureReel({ baseUrl, workDir, durationSeconds, preview }) {
  const framesDir = path.join(workDir, 'frames');
  await rm(framesDir, { recursive: true, force: true });
  await mkdir(framesDir, { recursive: true });

  const { browser, executablePath } = await launchBrowser();
  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  await installVisualRoutes(context, page);

  const capturedFrames = [];
  const writeQueue = [];
  let callbackIndex = 0;
  let resolveFirstFrame;
  const firstFramePromise = new Promise((resolve) => {
    resolveFirstFrame = resolve;
  });
  let firstFrameTimer;

  try {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await settle(page, 1_400);

    await page.screencast.start({
      size: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
      quality: 86,
      fps: VIDEO_FPS,
      onFrame: (frame) => {
        const framePath = path.join(
          framesDir,
          `capture-${String(callbackIndex++).padStart(6, '0')}.jpg`,
        );
        resolveFirstFrame?.(frame.timestamp);
        resolveFirstFrame = null;
        const write = writeFile(framePath, frame.data).then(() => {
          capturedFrames.push({ timestamp: frame.timestamp, file: framePath });
        });
        writeQueue.push(write);
        return write;
      },
    });
    console.log(JSON.stringify({ phase: 'screencast-started' }));

    const firstFrameTimeout = new Promise((_, reject) => {
      firstFrameTimer = setTimeout(
        () =>
          reject(
            new Error(
              'page.screencast did not deliver its first frame within 15 seconds.',
            ),
          ),
        15_000,
      );
    });
    const anchor = await Promise.race([firstFramePromise, firstFrameTimeout]);
    clearTimeout(firstFrameTimer);
    firstFrameTimer = undefined;
    const at = (seconds) => waitUntilEpoch(anchor + seconds * 1_000);
    const mark = (label) => {
      const elapsed = (Date.now() - anchor) / 1_000;
      console.log(
        JSON.stringify({
          phase: 'timeline',
          label,
          elapsedSeconds: elapsed.toFixed(2),
          capturedFrames: capturedFrames.length,
        }),
      );
    };

    // 0-3 s: opening hold.
    mark('opening');
    await at(3.0);
    await clickElement(page.locator('.cine-start'));

    // 4-14 s: ignition resolves into the orbit, then a slow card reveal.
    mark('ignition');
    await at(7.0);
    await smoothScrollSectionProgress(page, 'orbita', 0.18, 2_600);
    await smoothScrollSectionProgress(page, 'orbita', 0.31, 2_400);
    await smoothScrollSectionProgress(page, 'orbita', 0.46, 2_600);

    // 14.5-51.5 s: Mars, including the black-background teardown.
    mark('open-mars');
    await at(14.5);
    await openWorld(page, 'mars');
    await sleep(2_000);
    await at(16.6);
    await smoothScrollSectionProgress(page, 'jornada-mars', 0.06, 1_300);
    await smoothScrollSectionProgress(page, 'jornada-mars', 0.16, 2_000);
    await smoothScrollSectionProgress(page, 'jornada-mars', 0.25, 2_800);
    await smoothScrollSectionProgress(page, 'jornada-mars', 0.34, 3_200);
    await smoothScrollSectionProgress(page, 'jornada-mars', 0.43, 3_800);
    await smoothScrollSectionProgress(page, 'jornada-mars', 0.52, 4_000);
    await smoothScrollSectionProgress(page, 'jornada-mars', 0.61, 3_000);
    await smoothScrollSectionProgress(page, 'jornada-mars', 0.69, 3_200);
    await smoothScrollSectionProgress(page, 'jornada-mars', 0.76, 3_200);
    await smoothScrollSectionProgress(page, 'jornada-mars', 0.83, 3_200);
    await smoothScrollSectionProgress(page, 'jornada-mars', 0.90, 3_000);

    // 52-59 s: answer, reveal the finish action, and enter the Mars finale.
    mark('mars-quiz');
    await at(52.2);
    await answerQuiz(page);
    await at(55.8);
    await finishJourney(page);
    await at(59.4);
    await settle(page, 500);

    // 64-80 s: return to orbit and focus the Moon card.
    mark('return-to-orbit');
    await at(64.0);
    await clickElement(
      page.locator('.cine-finale__actions .cine-action').first(),
    );
    if (preview) {
      await sleep(1_200);
      await at(durationSeconds);
    } else {
      await sleep(3_400);
      await smoothScrollSectionProgress(page, 'orbita', 0.18, 1_800);
      await smoothScrollSectionProgress(page, 'orbita', 0.30, 1_800);
      await smoothScrollSectionProgress(page, 'orbita', 0.46, 2_200);
      await at(79.2);
      await page
        .locator('.cine-world-card.is-moon')
        .hover({ force: true, timeout: 5_000 })
        .catch(() => {});

      // 84-130 s: open the Moon and traverse every beat.
      mark('open-moon');
      await at(84.0);
      await openWorld(page, 'moon');
      await sleep(2_200);
      await at(86.6);
      await smoothScrollSectionProgress(page, 'jornada-moon', 0.07, 1_400);
      await smoothScrollSectionProgress(page, 'jornada-moon', 0.16, 2_200);
      await smoothScrollSectionProgress(page, 'jornada-moon', 0.24, 2_600);
      await smoothScrollSectionProgress(page, 'jornada-moon', 0.32, 3_200);
      await smoothScrollSectionProgress(page, 'jornada-moon', 0.40, 3_500);
      await smoothScrollSectionProgress(page, 'jornada-moon', 0.48, 3_500);
      await smoothScrollSectionProgress(page, 'jornada-moon', 0.56, 3_500);
      await smoothScrollSectionProgress(page, 'jornada-moon', 0.64, 3_500);
      await smoothScrollSectionProgress(page, 'jornada-moon', 0.72, 3_500);
      await smoothScrollSectionProgress(page, 'jornada-moon', 0.80, 3_500);
      // Seven weighted beats put the Moon quiz at ~0.881 progress. Move
      // beyond that boundary so the active quiz is mounted before the click.
      await smoothScrollSectionProgress(page, 'jornada-moon', 0.94, 3_500);

      // 132-145 s: Moon quiz, finale, then return to the opening.
      mark('moon-quiz');
      await at(132.0);
      await answerQuiz(page);
      await at(135.8);
      await finishJourney(page);
      await at(139.2);
      await settle(page, 500);
      await at(145.0);
      await clickElement(
        page.locator('.cine-finale__actions .cine-text-action').first(),
      );
    }

    // Hold the opening through the capture endpoint. The final five seconds
    // are replaced by frame 1 during materialization for a clean loop.
    mark('final-hold');
    await at(durationSeconds);
    mark('capture-end');
  } finally {
    clearTimeout(firstFrameTimer);
    await page.screencast.stop().catch(() => {});
    // Let any frame callbacks already in flight enqueue their writes before
    // taking the final settled snapshot.
    await sleep(100);
    await Promise.allSettled(writeQueue);
    await context.close();
    await browser.close();
  }

  if (!capturedFrames.length) {
    throw new Error('No frames were captured by page.screencast.');
  }

  capturedFrames.sort((left, right) => left.timestamp - right.timestamp);
  const coverageSeconds =
    (capturedFrames.at(-1).timestamp - capturedFrames[0].timestamp) / 1_000;
  if (coverageSeconds < durationSeconds - 2) {
    throw new Error(
      `Capture ended early: ${coverageSeconds.toFixed(2)}s of ${durationSeconds}s.`,
    );
  }

  return {
    executablePath,
    capturedFrames,
    coverageSeconds,
    frameDirectory: framesDir,
    preview,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseUrl = await resolveBaseUrl(args.url);
  const workDir = args.preview
    ? `${args.workDir}-preview`
    : args.workDir;
  const durationSeconds = args.preview ? 66 : MASTER_DURATION_SECONDS;

  await mkdir(args.outDir, { recursive: true });
  await mkdir(workDir, { recursive: true });

  if (args.inspect) {
    await inspectVisuals({ baseUrl, workDir });
    return;
  }

  console.log(
    JSON.stringify(
      {
        phase: 'capture',
        baseUrl,
        workDir,
        durationSeconds,
        resolution: `${VIDEO_WIDTH}x${VIDEO_HEIGHT}`,
        fps: VIDEO_FPS,
      },
      null,
      2,
    ),
  );

  const capture = await captureReel({
    baseUrl,
    workDir,
    durationSeconds,
    preview: args.preview,
  });
  console.log(
    JSON.stringify(
      {
        phase: 'captured',
        frames: capture.capturedFrames.length,
        coverageSeconds: Number(capture.coverageSeconds.toFixed(3)),
        executablePath: capture.executablePath,
      },
      null,
      2,
    ),
  );

  if (args.skipCompose) {
    console.log(
      JSON.stringify(
        { phase: 'skip-compose', capturedFrames: capture.capturedFrames },
        null,
        2,
      ),
    );
    return;
  }

  const sequence = await materializeFrameSequence({
    capturedFrames: capture.capturedFrames,
    durationSeconds,
    workDir,
    loopFreezeSeconds: args.preview ? 0 : 5,
  });
  console.log(JSON.stringify({ phase: 'materialized', ...sequence }, null, 2));

  const baseName = args.preview ? 'preview-echos' : 'echos';
  const masterPath = path.join(
    args.outDir,
    args.preview
      ? `${baseName}-${durationSeconds}s-silent-loop.mp4`
      : `${baseName}-3min-silent-loop.mp4`,
  );
  await composeSilentMaster({
    sequence,
    outputPath: masterPath,
    durationSeconds,
    onProgress: (text) => process.stderr.write(text),
  });

  let highlight = null;
  let srtPath = null;
  if (!args.preview) {
    const overlayLaunch = await launchBrowser();
    const overlayContext = await createContext(overlayLaunch.browser);
    let overlays;
    try {
      overlays = await renderOverlayAssets(overlayContext, workDir);
    } finally {
      await overlayContext.close().catch(() => {});
      await overlayLaunch.browser.close().catch(() => {});
    }
    const highlightPath = path.join(
      args.outDir,
      'echos-30s-en-captions.mp4',
    );
    srtPath = path.join(args.outDir, 'echos-30s-en.srt');
    highlight = await composeHighlight({
      masterPath,
      overlays,
      outputPath: highlightPath,
      onProgress: (text) => process.stderr.write(text),
    });
    await writeHighlightSrt(srtPath);
  }

  const validations = [];
  validations.push(
    await validateMedia({
      mediaPath: masterPath,
      expectedDuration: durationSeconds,
      durationTolerance: 0.4,
    }),
  );
  if (!args.preview) {
    validations.push(
      await validateMedia({
        mediaPath: path.join(
          args.outDir,
          'echos-30s-en-captions.mp4',
        ),
        expectedDuration: HIGHLIGHT_DURATION_SECONDS,
        durationTolerance: 0.4,
      }),
    );
  }

  console.log(
    JSON.stringify(
      {
        phase: 'complete',
        files: {
          master: masterPath,
          highlight: args.preview
            ? null
            : path.join(args.outDir, 'echos-30s-en-captions.mp4'),
          srt: srtPath,
        },
        highlight,
        validations,
      },
      null,
      2,
    ),
  );

  if (!args.keepWork) {
    await cleanupWorkDir(workDir);
  }
}

main().catch((error) => {
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
