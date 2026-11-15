import { chromium } from 'playwright-core';
import { findChromeExecutable } from './echos-reel-lib.mjs';

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
    '--disable-gpu-vsync',
    '--disable-frame-rate-limit',
  ],
});

async function measure(width, height, quality, fps, route = '/') {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:5173${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (route === '/') {
    await page.evaluate(() => document.querySelector('.cine-start')?.click());
    await page.waitForTimeout(12000);
  } else {
    await page.waitForTimeout(12000);
    await page.evaluate(() => {
      const section = document.getElementById('jornada-mars');
      if (section) {
        const rect = section.getBoundingClientRect();
        const top = window.scrollY + rect.top;
        const height = section.offsetHeight - window.innerHeight;
        window.scrollTo({ top: top + height * 0.66, behavior: 'instant' });
      }
    });
    await page.waitForTimeout(2500);
  }
  await page.mouse.move(width - 8, height / 2);
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(500);
  const gpu = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    const extension = gl?.getExtension('WEBGL_debug_renderer_info');
    return {
      renderer:
        gl && extension
          ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL)
          : 'unavailable',
      dpr: window.devicePixelRatio,
    };
  });

  let frames = 0;
  let bytes = 0;
  const startedAt = performance.now();
  await page.screencast.start({
    size: { width, height },
    quality,
    fps,
    onFrame: (frame) => {
      frames += 1;
      bytes += frame.data.length;
    },
  });
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
  await page.screencast.stop();
  const elapsed = (performance.now() - startedAt) / 1000;
  await context.close();
  return {
    width,
    height,
    quality,
    requestedFps: fps,
    gpu,
    frames,
    elapsed: Number(elapsed.toFixed(2)),
    actualFps: Number((frames / elapsed).toFixed(2)),
    megabytes: Number((bytes / 1024 / 1024).toFixed(2)),
  };
}

try {
  const results = [];
  results.push(await measure(1280, 720, 72, 60));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
  process.exit(0);
}
