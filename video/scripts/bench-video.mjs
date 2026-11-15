import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { findChromeExecutable } from './echos-reel-lib.mjs';

const outputDir = path.resolve(
  import.meta.dirname,
  '..',
  '.cache',
  'video-bench',
);
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: await findChromeExecutable(),
  args: [
    '--enable-webgl',
    '--enable-gpu',
    '--force_high_performance_gpu',
    '--ignore-gpu-blocklist',
    '--disable-gpu-driver-bug-workarounds',
    '--use-angle=d3d11',
    '--disable-dev-shm-usage',
    '--hide-scrollbars',
  ],
});

try {
  for (const [width, height] of [
    [1920, 1080],
    [1280, 720],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      recordVideo: {
        dir: outputDir,
        size: { width, height },
      },
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173', {
      waitUntil: 'networkidle',
    });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => document.querySelector('.cine-start')?.click());
    await page.waitForTimeout(8000);
    const startedAt = performance.now();
    await page.evaluate(async () => {
      const start = performance.now();
      await new Promise((resolve) => {
        const tick = (now) => {
          window.scrollBy({ top: 3, behavior: 'instant' });
          if (now - start < 5000) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });
    });
    const elapsed = (performance.now() - startedAt) / 1000;
    const video = page.video();
    await context.close();
    console.log(
      JSON.stringify({
        width,
        height,
        elapsed: Number(elapsed.toFixed(2)),
        videoPath: await video?.path(),
      }),
    );
  }
} finally {
  await browser.close();
}
