import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..', '..');
const outDir = path.resolve(projectRoot, 'video', 'public', 'reel', 'echos-en');
const baseUrl = process.env.ECHOS_URL ?? 'http://127.0.0.1:5173';
const executablePath =
  process.env.CHROME_PATH ??
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath,
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
  deviceScaleFactor: 1.5,
  colorScheme: 'dark',
});

const page = await context.newPage();
page.setDefaultTimeout(20_000);

await page.addInitScript(() => {
  localStorage.setItem('after-the-signal-locale', 'en');
});

async function settle(page, delay = 900) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  await page.waitForTimeout(delay);
}

async function shot(name) {
  await settle(page);
  await page.screenshot({
    path: path.join(outDir, `${name}.png`),
    timeout: 60_000,
  });
  console.log(`captured ${name}`);
}

async function scrollSectionProgress(sectionId, progress) {
  await page.evaluate(
    ({ sectionId: id, targetProgress }) => {
      const section = document.getElementById(id);
      if (!section) throw new Error(`Missing section #${id}`);
      const rect = section.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      const scrollableHeight = Math.max(1, rect.height - window.innerHeight);
      window.scrollTo({
        top: top + scrollableHeight * targetProgress,
        behavior: 'instant',
      });
    },
    { sectionId, targetProgress: progress },
  );
  await page.waitForTimeout(1150);
}

async function clickOrbitWorld(world) {
  const card = page.locator(`.cine-world-card.is-${world}`);
  await card.waitFor({ state: 'visible' });
  await card.click();
  await page.waitForTimeout(1750);
}

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await settle(page, 1600);
  await page.screenshot({
    path: path.join(outDir, '01-opening.png'),
    timeout: 60_000,
  });

  await page.locator('.cine-start').click();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(outDir, '02-begin-pulse.png'),
    timeout: 60_000,
  });
  await page.waitForTimeout(650);
  await page.screenshot({
    path: path.join(outDir, '03-ignition.png'),
    timeout: 60_000,
  });

  await page.waitForTimeout(2200);
  await scrollSectionProgress('orbita', 0.19);
  await shot('04-orbit-arrival');

  await scrollSectionProgress('orbita', 0.27);
  await shot('05-orbit-system');

  await scrollSectionProgress('orbita', 0.36);
  await shot('06-world-cards');

  await scrollSectionProgress('orbita', 0.47);
  await shot('07-world-cards-focus');

  await clickOrbitWorld('mars');
  await scrollSectionProgress('jornada-mars', 0.035);
  await shot('08-mars-hero');

  await scrollSectionProgress('jornada-mars', 0.18);
  await shot('09-mars-90-days');

  await scrollSectionProgress('jornada-mars', 0.42);
  await shot('10-mars-distance');

  await scrollSectionProgress('jornada-mars', 0.54);
  await shot('11-mars-last-signal');

  for (const [index, progress] of [
    [1, 0.64],
    [2, 0.71],
    [3, 0.78],
    [4, 0.84],
  ]) {
    await scrollSectionProgress('jornada-mars', progress);
    await page.waitForTimeout(1200);
    await shot(`12-teardown-${String(index).padStart(2, '0')}`);
  }

  // Deep links open the Moon journey directly. This is more deterministic than
  // returning to the orbit selector after the WebGL teardown capture.
  await page.goto(`${baseUrl}/?world=moon`, { waitUntil: 'networkidle' });
  await settle(page, 1800);
  await scrollSectionProgress('jornada-moon', 0.04);
  await shot('13-moon-hero');

  await scrollSectionProgress('jornada-moon', 0.31);
  await shot('14-moon-exosphere');

  await scrollSectionProgress('jornada-moon', 0.62);
  await shot('15-moon-regolith');

  await scrollSectionProgress('jornada-moon', 0.83);
  await shot('16-moon-ice');

  const metrics = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    title: document.title,
    bodyText: document.body.innerText.slice(0, 1200),
  }));
  console.log(JSON.stringify(metrics, null, 2));
} finally {
  await context.close();
  await browser.close();
}
