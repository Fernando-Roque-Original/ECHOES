import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { findChromeExecutable } from './echos-reel-lib.mjs';

const projectRoot = path.resolve(import.meta.dirname, '..', '..');
const outputDir = path.join(projectRoot, 'video', 'out');
const executablePath = await findChromeExecutable();
const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: [
    '--enable-webgl',
    '--enable-gpu',
    '--force_high_performance_gpu',
    '--ignore-gpu-blocklist',
    '--disable-gpu-driver-bug-workarounds',
    '--use-angle=d3d11',
    '--disable-dev-shm-usage',
    '--font-render-hinting=none',
    '--hide-scrollbars',
  ],
});

const requests = [];
const failedRequests = [];

try {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    locale: 'pt-BR',
    timezoneId: 'UTC',
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  page.on('request', (request) => requests.push(request.url()));
  page.on('requestfailed', (request) => {
    failedRequests.push({
      url: request.url(),
      error: request.failure()?.errorText ?? 'unknown',
    });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      failedRequests.push({
        url: response.url(),
        error: `HTTP ${response.status()}`,
      });
    }
  });
  page.on('pageerror', (error) => console.error('PAGE ERROR', error));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      console.error('CONSOLE ERROR', message.text());
    }
  });

  await page.goto('http://127.0.0.1:5173/?world=moon', {
    waitUntil: 'networkidle',
  });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    const section = document.getElementById('jornada-moon');
    if (!section) throw new Error('Missing #jornada-moon');
    const rect = section.getBoundingClientRect();
    const top = window.scrollY + rect.top;
    const height = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + height * 0.72, behavior: 'instant' });
  });
  await page.waitForTimeout(8000);

  const state = await page.evaluate(() => {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') ?? probe.getContext('webgl');
    const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
    return {
      apolloReady: document.documentElement.dataset.echoesApolloReady,
      activeBeat: document.querySelector('.cine-beat.is-active')?.textContent
        ?.replace(/\s+/g, ' ')
        .trim()
        .slice(0, 200),
      fallbackVisible: Boolean(
        document.querySelector('.lunar-viewer__fallback'),
      ),
      canvasCount: document.querySelectorAll('.lunar-viewer canvas').length,
      renderer:
        gl && debugInfo
          ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          : 'unavailable',
    };
  });

  await mkdir(outputDir, { recursive: true });
  await page.screenshot({
    path: path.join(outputDir, 'qa-apollo.png'),
    animations: 'disabled',
  });
  console.log(
    JSON.stringify(
      {
        state,
        apolloRequests: requests.filter((url) =>
          /apollo|draco/i.test(url),
        ),
        failedRequests,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
