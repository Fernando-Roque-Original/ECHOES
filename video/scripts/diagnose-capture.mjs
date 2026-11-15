import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.CHROME_PATH ??
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: [
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--use-angle=swiftshader',
    '--disable-dev-shm-usage',
    '--font-render-hinting=none',
  ],
});

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  colorScheme: 'dark',
});
const page = await context.newPage();
page.on('console', (message) => {
  console.log(`[console:${message.type()}] ${message.text()}`);
});
page.on('pageerror', (error) => {
  console.log(`[pageerror] ${error.stack ?? error.message}`);
});
page.on('requestfailed', (request) => {
  console.log(
    `[requestfailed] ${request.url()} :: ${request.failure()?.errorText}`,
  );
});

await page.addInitScript(() => {
  localStorage.setItem('after-the-signal-locale', 'en');
});
await page.goto(process.env.ECHOS_URL ?? 'http://127.0.0.1:5175/', {
  waitUntil: 'domcontentloaded',
  timeout: 60_000,
});
await page.waitForTimeout(2500);

const webgl = await page.evaluate(() => {
  const canvas = document.createElement('canvas');
  const gl =
    canvas.getContext('webgl2') ??
    canvas.getContext('webgl') ??
    canvas.getContext('experimental-webgl');
  if (!gl) return { available: false };
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  return {
    available: true,
    vendor: debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : gl.getParameter(gl.VENDOR),
    renderer: debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER),
  };
});
console.log('webgl', webgl);

await page.locator('.cine-start').click();
await page.waitForTimeout(4500);
console.log(
  'state',
  await page.evaluate(() => ({
    phase: document.querySelector('.cine-app')?.getAttribute('data-ignition-phase'),
    appReady: document.querySelector('.cine-app')?.getAttribute('data-scene-ready'),
    stageReady: document.querySelector('.cine-stage')?.getAttribute('data-scene-ready'),
    canvas: (() => {
      const element = document.querySelector('.cine-stage canvas');
      if (!(element instanceof HTMLCanvasElement)) return null;
      return {
        width: element.width,
        height: element.height,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
      };
    })(),
  })),
);
await page.locator('.cine-stage').screenshot({
  path: 'video/out/diagnose-stage.png',
  timeout: 60_000,
});

await context.close();
await browser.close();
