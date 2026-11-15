import { mkdir, writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright-core';

const baseUrl = process.env.QA_URL ?? 'http://127.0.0.1:5173';
const outputDir = '.qa';
const languageStorageKey = 'after-the-signal-locale';

const pageErrors = [];
const consoleErrors = [];
const httpErrors = [];
const layoutIssues = [];
const a11yIssues = [];
const flowErrors = [];

const irrelevantConsoleErrors = [
  /Download the React DevTools/i,
  /Autofill\./i,
];

const marsBeats = [
  '90 dias',
  '14 anos',
  '45,16 km',
  '10 de junho de 2018',
  'O que ficou',
  'Desmontar para entender',
  'O que você descobriu?',
];

const moonBeats = [
  '1969',
  'Exosfera fina',
  'Poeira afiada',
  'Gelo nas sombras',
  'Próximo passo',
  'Eagle, por dentro',
  'O que você descobriu?',
];

await mkdir(outputDir, { recursive: true });

function formatError(error) {
  return error instanceof Error ? error.stack ?? error.message : String(error);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function assertNoFinale(page, label) {
  assert(
    (await page.locator('#legado').count()) === 0,
    `${label}: finale was rendered before the quiz completion action`,
  );
}

function slug(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function watchPage(page, label) {
  page.on('pageerror', (error) => {
    const message = `${label}: ${error.stack ?? error.message}`;
    if (!pageErrors.includes(message)) pageErrors.push(message);
  });

  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (irrelevantConsoleErrors.some((pattern) => pattern.test(text))) return;
    const entry = `${label}: ${text}`;
    if (!consoleErrors.includes(entry)) consoleErrors.push(entry);
  });

  page.on('response', (response) => {
    if (response.status() < 400) return;
    httpErrors.push(
      `${label}: HTTP ${response.status()} ${response.request().method()} ${response.url()}`,
    );
  });
}

async function waitForScrollToSettle(page, timeoutMs = 2500) {
  const deadline = Date.now() + timeoutMs;
  let previousY = await page.evaluate(() => window.scrollY);
  let stableSamples = 0;

  while (Date.now() < deadline) {
    await page.waitForTimeout(80);
    const currentY = await page.evaluate(() => window.scrollY);
    stableSamples =
      Math.abs(currentY - previousY) < 0.5 ? stableSamples + 1 : 0;
    previousY = currentY;

    if (stableSamples >= 3) return;
  }
}

async function waitForStableUi(page) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  await waitForScrollToSettle(page);

  const activeImage = page.locator('.cine-beat.is-active img').first();
  if ((await activeImage.count()) > 0) {
    await activeImage.evaluate(
      (image) =>
        new Promise((resolve) => {
          if (image.complete) {
            resolve(true);
            return;
          }
          image.addEventListener('load', () => resolve(true), { once: true });
          image.addEventListener('error', () => resolve(true), { once: true });
        }),
    );
  }

  await page.waitForTimeout(180);
}

async function auditLayout(page, label) {
  const result = await page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    return {
      clientWidth: root.clientWidth,
      rootScrollWidth: root.scrollWidth,
      bodyScrollWidth: body?.scrollWidth ?? root.scrollWidth,
    };
  });

  if (
    result.rootScrollWidth > result.clientWidth + 1 ||
    result.bodyScrollWidth > result.clientWidth + 1
  ) {
    layoutIssues.push(
      `${label}: horizontal overflow ` +
        `(root ${result.rootScrollWidth}px, body ${result.bodyScrollWidth}px, ` +
        `viewport ${result.clientWidth}px)`,
    );
  }
}

async function auditAccessibility(page, label) {
  try {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    for (const violation of results.violations) {
      if (violation.impact !== 'serious' && violation.impact !== 'critical') {
        continue;
      }

      a11yIssues.push({
        page: label,
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        targets: violation.nodes
          .slice(0, 8)
          .map((node) => node.target.join(' ')),
      });
    }
  } catch (error) {
    flowErrors.push(`${label}: Axe failed: ${formatError(error)}`);
  }
}

async function capture(page, fileName, label, { fullPage = false } = {}) {
  await waitForStableUi(page);
  await page.mouse.move(1, 1);
  await page.screenshot({
    path: `${outputDir}/${fileName}`,
    fullPage,
    animations: 'disabled',
  });
  await auditLayout(page, label);
  await auditAccessibility(page, label);
}

async function requireVisible(locator, label, timeout = 20000) {
  const count = await locator.count();
  assert(count > 0, `Missing accessible element: ${label}`);
  await locator.first().waitFor({ state: 'visible', timeout });
  return locator.first();
}

async function waitForActiveBeat(page, world, headline) {
  const sectionId = `jornada-${world}`;
  await page.waitForFunction(
    ({ id, expected }) => {
      const heading = document.querySelector(
        `#${id} .cine-beat.is-active h2`,
      );
      return heading?.textContent?.trim() === expected;
    },
    { id: sectionId, expected: headline },
    { timeout: 7000 },
  );
}

async function waitForSectionTop(page, sectionId) {
  await page.waitForFunction(
    (id) => document.getElementById(id) !== null,
    sectionId,
    { timeout: 8000 },
  );
  await waitForScrollToSettle(page);
  await page.waitForFunction(
    (id) => {
      const section = document.getElementById(id);
      if (!section) return false;
      return Math.abs(section.getBoundingClientRect().top) <= 4;
    },
    sectionId,
    { timeout: 8000 },
  );
}

async function scrollOrbitToProgress(page, progress) {
  const orbit = page.locator('#orbita');
  await requireVisible(orbit, 'orbit section');

  await orbit.evaluate((element, requestedProgress) => {
    const rect = element.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const scrollableHeight = Math.max(1, rect.height - window.innerHeight);
    window.scrollTo({
      top: absoluteTop + scrollableHeight * requestedProgress,
      behavior: 'instant',
    });
  }, progress);
  await waitForScrollToSettle(page);
}

async function assertOrbitLocked(page) {
  const orbit = page.locator('#orbita');
  const worlds = orbit.locator('.cine-orbit__worlds');

  await requireVisible(
    orbit.getByText('Role para explorar', { exact: true }),
    'orbit scroll hint before the card reveal',
  );
  assert(
    (await worlds.getAttribute('aria-hidden')) === 'true',
    'World card deck was not hidden before the reveal threshold',
  );
  assert(
    await worlds.evaluate((element) => element.inert === true),
    'World card deck was not inert before the reveal threshold',
  );
  assert(
    (await orbit
      .getByRole('button', { name: 'Explorar 01 Marte', exact: true })
      .count()) === 0,
    'Mars card became accessible before the reveal threshold',
  );
  assert(
    (await orbit
      .getByRole('button', { name: 'Explorar 02 Lua', exact: true })
      .count()) === 0,
    'Moon card became accessible before the reveal threshold',
  );
}

async function revealOrbit(page) {
  await scrollOrbitToProgress(page, 0.21);
  await assertOrbitLocked(page);

  await scrollOrbitToProgress(page, 0.6);

  await page.waitForFunction(
    () => {
      const worlds = document.querySelector('.cine-orbit__worlds');
      const cards = Array.from(document.querySelectorAll('.cine-world-card'));
      return (
        worlds?.getAttribute('aria-hidden') === 'false' &&
        getComputedStyle(worlds).pointerEvents !== 'none' &&
        cards.length === 2 &&
        cards.every(
          (card) =>
            Number.parseFloat(getComputedStyle(card).opacity) >= 0.62 &&
            card.getBoundingClientRect().height > 0,
        )
      );
    },
    undefined,
    { timeout: 5000 },
  );

  const group = page.getByRole('group', { name: 'Escolha um astro' });
  await requireVisible(group, 'revealed world cards');
  assert(
    (await group.locator('.cine-world-card').count()) === 2,
    'Expected exactly two rendered world cards',
  );
  return group;
}

async function activateWorldCard(page, group, name, world, label) {
  const button = await requireVisible(
    group.getByRole('button', { name, exact: true }),
    `${label} world card`,
  );
  const journey = page.locator(`#jornada-${world}`);

  await button.hover();
  await page.waitForTimeout(80);

  assert(
    (await journey.count()) === 0,
    `${label}: hover opened the journey before a click`,
  );

  let clickFailure = null;
  try {
    await button.click({ force: true, noWaitAfter: true, timeout: 5000 });
  } catch (error) {
    clickFailure = error;
  }

  if ((await journey.count()) === 0 && clickFailure) {
    await button.focus();
    await page.keyboard.press('Enter');
  }

  try {
    await journey.first().waitFor({ state: 'visible', timeout: 8000 });
  } catch (error) {
    const pointerFailure = clickFailure
      ? ` Pointer click failed: ${formatError(clickFailure)}`
      : '';
    throw new Error(
      `${label}: the journey did not open after activation.${pointerFailure} ${formatError(error)}`,
    );
  }

  assert(
    (await journey.count()) === 1,
    `${label}: expected one journey region after activation`,
  );
}

async function wheelToBeat(page, world, index, count, headline) {
  const sectionId = `jornada-${world}`;
  const section = page.locator(`#${sectionId}`);
  await requireVisible(section, `journey #${sectionId}`);

  const beatWeights = Array.from({ length: count }, (_, beatIndex) =>
    (world === 'mars' || world === 'moon') && beatIndex === 5 ? 2.4 : 1,
  );
  const totalWeight = beatWeights.reduce((sum, weight) => sum + weight, 0);
  const startWeight = beatWeights
    .slice(0, index)
    .reduce((sum, weight) => sum + weight, 0);
  const beatProgress =
    (startWeight + beatWeights[index] * 0.5) / totalWeight;

  const geometry = await section.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      absoluteTop: window.scrollY + rect.top,
      scrollableHeight: Math.max(1, rect.height - window.innerHeight),
    };
  });
  const targetY =
    geometry.absoluteTop +
    geometry.scrollableHeight * beatProgress;

  const viewport = page.viewportSize();
  await page.mouse.move(
    Math.round((viewport?.width ?? 1000) / 2),
    Math.round((viewport?.height ?? 800) / 2),
  );

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const currentY = await page.evaluate(() => window.scrollY);
    const remaining = targetY - currentY;
    if (Math.abs(remaining) <= 2) break;

    const wheelDelta =
      Math.sign(remaining) *
      Math.min(
        Math.abs(remaining),
        Math.max(360, (viewport?.height ?? 800) * 0.65),
      );
    await page.mouse.wheel(0, wheelDelta);
    await waitForScrollToSettle(page);
    await page.waitForTimeout(70);
  }

  await waitForActiveBeat(page, world, headline);
}

async function answerQuiz(
  page,
  {
    wrongAnswer,
    correctAnswer,
    wrongFeedback,
    correctFeedback,
    finishLabel,
  },
) {
  await requireVisible(
    page.getByRole('group', { name: 'Respostas' }),
    'quiz answers group',
  );

  const wrong = page.getByRole('button', { name: wrongAnswer });
  await requireVisible(wrong, 'incorrect quiz answer');
  await wrong.click();

  await requireVisible(
    page.locator('.cine-quiz__answer.is-selected.is-incorrect'),
    'selected incorrect quiz state',
  );
  await assertNoFinale(page, 'after an incorrect answer');
  await requireVisible(
    page.getByText(wrongFeedback, { exact: true }),
    'incorrect quiz feedback',
  );
  assert(
    (await page.getByRole('button', { name: finishLabel }).count()) === 0,
    `${finishLabel} appeared before a correct answer`,
  );

  const correct = page.getByRole('button', { name: correctAnswer });
  await requireVisible(correct, 'correct quiz answer');
  await correct.click();

  await requireVisible(
    page.locator('.cine-quiz__answer.is-selected.is-correct'),
    'selected correct quiz state',
  );
  assert(
    (await page.locator('.cine-quiz__answer.is-incorrect').count()) === 0,
    'Incorrect quiz state remained selected after the correct answer',
  );
  await requireVisible(
    page.getByText(correctFeedback, { exact: true }),
    'correct quiz feedback',
  );
  await assertNoFinale(page, 'after the correct answer');
  return requireVisible(
    page.getByRole('button', { name: finishLabel }),
    'quiz finish action',
  );
}

async function assertLunarTeardown(page) {
  await requireVisible(
    page.getByRole('region', {
      name: 'Demonstração didática do Módulo Lunar Eagle',
    }),
    'Eagle lunar module teardown',
  );
  await requireVisible(
    page.getByRole('img', {
      name: /Vista explodida didática do Módulo Lunar Eagle/,
    }),
    'Eagle exploded diagram',
  );

  const assemblyGroup = await requireVisible(
    page.getByRole('group', {
      name: 'Conjuntos do Módulo Lunar Eagle',
    }),
    'Eagle assembly controls',
  );
  assert(
    (await assemblyGroup.getByRole('button').count()) === 5,
    'Eagle teardown must expose exactly five assemblies',
  );

  await requireVisible(
    page.getByText('O que esta vista é', { exact: true }),
    'Eagle teardown honesty label',
  );
  await requireVisible(
    page.getByText(
      /Não é CAD oficial, não reproduz cada componente interno/,
    ),
    'Eagle teardown honesty copy',
  );

  const detail = page.locator('.lunar-detail__content');
  const previousDetail = await detail.innerText();
  const descentButton = assemblyGroup.getByRole('button', {
    name: /Estágio de descida/,
  });
  await descentButton.click();
  await page.waitForFunction(
    (previous) => {
      const content = document.querySelector('.lunar-detail__content');
      return (
        content !== null &&
        content.textContent !== previous &&
        content.textContent?.includes('Estágio de descida')
      );
    },
    previousDetail,
    { timeout: 5000 },
  );
  assert(
    (await descentButton.getAttribute('aria-pressed')) === 'true',
    'Selecting the Eagle descent stage did not update its pressed state',
  );
  assert(
    (await detail.innerText()) !== previousDetail,
    'Selecting another Eagle assembly did not update the detail content',
  );

  const workbenchColor = await page
    .locator('.lunar-workbench')
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  assert(
    workbenchColor === 'rgb(0, 0, 0)',
    `Eagle workbench must use a black background, found ${workbenchColor}`,
  );
}

async function openCinematic(page) {
  await page.goto(baseUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  const openingHeading = await requireVisible(
    page.locator('.cine-ignition h1'),
    'opening heading',
  );
  assert(
    /Abandonados/.test((await openingHeading.innerText()) ?? ''),
    'Opening heading copy changed unexpectedly',
  );
  const wordmark = await requireVisible(
    page.locator('.cine-wordmark'),
    'ECHOES team wordmark',
  );
  assert(
    (await wordmark.getAttribute('aria-label')) === 'ECHOES',
    'Top-left wordmark must expose the ECHOES accessible name',
  );
  const odsBadges = await requireVisible(
    page.locator('.cine-ods'),
    'ODS 4 and 9 badges',
  );
  assert(
    /ODS 4.*ODS 9/.test((await odsBadges.getAttribute('aria-label')) ?? ''),
    'ODS badges are missing their combined accessible label',
  );
  const startButton = await requireVisible(
    page.locator('.cine-start'),
    'accessible start button',
  );
  assert(
    (await startButton.getAttribute('aria-label')) ===
      'Começar a explorar o Sistema Solar',
    'Start button is missing its accessible name',
  );
  await requireVisible(
    page.getByRole('button', { name: 'Abrir ajustes de leitura' }),
    'settings button',
  );
  await requireVisible(
    page.getByRole('button', { name: 'Abrir fontes e proveniência' }),
    'sources button',
  );
  await requireVisible(
    page.getByRole('link', { name: 'Abrir modo arquivo acessível' }),
    'archive link',
  );
  assert(
    (await page.locator('#jornada-mars, #jornada-moon').count()) === 0,
    'A journey was rendered before the opening action',
  );
}

async function captureCinematicFlow(page, prefix) {
  let step = 0;
  const shot = async (label, options) => {
    step += 1;
    await capture(
      page,
      `${prefix}-${String(step).padStart(2, '0')}-${slug(label)}.png`,
      `${prefix} ${label}`,
      options,
    );
  };

  await openCinematic(page);
  await shot('opening');

  await page.locator('.cine-start').click();
  await waitForSectionTop(page, 'orbita');

  await requireVisible(
    page.getByRole('heading', { name: 'Escolha um astro' }),
    'orbit heading',
  );
  await requireVisible(
    page.getByRole('heading', { name: 'Sistema Solar', exact: true }),
    'solar system heading',
  );
  await scrollOrbitToProgress(page, 0.18);
  await assertOrbitLocked(page);
  await shot('orbit locked before reveal');

  const orbitWorlds = await revealOrbit(page);
  const cards = orbitWorlds.getByRole('button');
  const cardCount = await cards.count();
  assert(cardCount === 2, `Expected exactly 2 world cards, found ${cardCount}`);
  assert(
    (await page.getByRole('button', { name: /Mercúrio/ }).count()) === 0,
    'Mercury must not be exposed as a selectable card',
  );
  await requireVisible(
    orbitWorlds.getByRole('button', {
      name: 'Explorar 01 Marte',
      exact: true,
    }),
    'Explorar Marte button',
  );
  await requireVisible(
    orbitWorlds.getByRole('button', {
      name: 'Explorar 02 Lua',
      exact: true,
    }),
    'Explorar Lua button',
  );
  await shot('orbit revealed');

  await activateWorldCard(
    page,
    orbitWorlds,
    'Explorar 01 Marte',
    'mars',
    'Mars',
  );
  await waitForSectionTop(page, 'jornada-mars');
  await requireVisible(
    page.getByRole('region', { name: 'Jornada por Marte' }),
    'Mars journey region',
  );
  await requireVisible(
    page.getByRole('button', { name: 'Voltar à órbita' }),
    'back to orbit button',
  );

  for (const [index, headline] of marsBeats.entries()) {
    await wheelToBeat(page, 'mars', index, marsBeats.length, headline);
    await shot(`Mars ${headline}`);
  }

  const marsFinish = await answerQuiz(page, {
    wrongAnswer: /Florestas ainda vivas na superfície/,
    correctAnswer: /Evidências de ambientes antigos com água/,
    wrongFeedback:
      'Ainda não. Volte à imagem das esferas de hematita e tente outra pista.',
    correctFeedback:
      'Pista encontrada. O Opportunity encontrou minerais ligados a ambientes antigos com água.',
    finishLabel: 'Ver o que ficou',
  });
  await shot('Mars quiz solved');

  assert(
    (await page.getByRole('region', { name: 'O legado do Opportunity' }).count()) ===
      0,
    'Mars finale was rendered before the quiz completion action',
  );

  await marsFinish.click();
  await waitForSectionTop(page, 'legado');
  await requireVisible(
    page.getByRole('region', { name: 'O legado do Opportunity' }),
    'Mars finale region',
  );
  await requireVisible(
    page.getByRole('heading', {
      name: 'A missão terminou. A descoberta ficou.',
    }),
    'Mars finale heading',
  );
  const exploreAnotherWorld = await requireVisible(
    page.getByRole('button', { name: 'Explorar outro mundo' }),
    'explore another world button',
  );
  await requireVisible(
    page.getByRole('button', { name: 'Voltar ao início' }),
    'back home button',
  );
  await shot('Mars finale');

  await exploreAnotherWorld.click();
  await page.waitForFunction(() => !document.getElementById('legado'));
  await waitForSectionTop(page, 'orbita');
  const moonOrbit = await revealOrbit(page);

  await activateWorldCard(
    page,
    moonOrbit,
    'Explorar 02 Lua',
    'moon',
    'Moon',
  );
  await waitForSectionTop(page, 'jornada-moon');
  await requireVisible(
    page.getByRole('region', { name: 'Jornada pela Lua' }),
    'Moon journey region',
  );

  for (const [index, headline] of moonBeats.entries()) {
    await wheelToBeat(page, 'moon', index, moonBeats.length, headline);
    if (headline === 'Eagle, por dentro') {
      await assertLunarTeardown(page);
    }
    await shot(`Moon ${headline}`);
  }

  const moonFinish = await answerQuiz(page, {
    wrongAnswer: /A Lua é um vácuo absoluto e não tem exosfera/,
    correctAnswer: /Gelo de água em regiões permanentemente sombreadas/,
    wrongFeedback:
      'Ainda não. Releia a pista sobre as sombras e tente outra resposta.',
    correctFeedback:
      'Pista encontrada. A NASA encontrou evidências de gelo de água em regiões permanentemente sombreadas da Lua.',
    finishLabel: 'Ver o legado lunar',
  });
  await shot('Moon quiz solved');

  assert(
    (await page.getByRole('region', { name: 'O legado lunar' }).count()) === 0,
    'Moon finale was rendered before the quiz completion action',
  );

  await moonFinish.click();
  await waitForSectionTop(page, 'legado');
  await requireVisible(
    page.getByRole('region', { name: 'O legado lunar' }),
    'Moon finale region',
  );
  await requireVisible(
    page.getByRole('heading', {
      name: 'A primeira pegada abriu o caminho.',
    }),
    'Moon finale heading',
  );
  await requireVisible(
    page.getByRole('button', { name: 'Explorar outro mundo' }),
    'Moon explore another world button',
  );
  await requireVisible(
    page.getByRole('button', { name: 'Voltar ao início' }),
    'Moon back home button',
  );
  await shot('Moon finale');
}

async function captureLanguagePersistence(page, prefix) {
  await openCinematic(page);

  const ptGroup = await requireVisible(
    page.getByRole('group', { name: 'Selecionar idioma' }),
    'Portuguese language group',
  );
  const ptButton = await requireVisible(
    ptGroup.getByRole('button', { name: 'Idioma: PT-BR' }),
    'Portuguese language button',
  );
  const enButton = await requireVisible(
    ptGroup.getByRole('button', { name: 'Idioma: EN' }),
    'English language button',
  );
  assert(
    (await ptButton.getAttribute('aria-pressed')) === 'true',
    'PT-BR was not the initial pressed language',
  );
  assert(
    (await enButton.getAttribute('aria-pressed')) === 'false',
    'EN was initially pressed before the language switch',
  );

  await enButton.click();
  const enGroup = await requireVisible(
    page.getByRole('group', { name: 'Select language' }),
    'English language group',
  );
  const persistedEnButton = await requireVisible(
    enGroup.getByRole('button', { name: 'Language: EN' }),
    'English pressed language button',
  );
  assert(
    (await persistedEnButton.getAttribute('aria-pressed')) === 'true',
    'EN was not marked as the active language',
  );

  const switchedState = await page.evaluate((key) => ({
    lang: document.documentElement.lang,
    storedLocale: window.localStorage.getItem(key),
  }), languageStorageKey);
  assert(
    switchedState.lang === 'en',
    `Expected document lang "en", found "${switchedState.lang}"`,
  );
  assert(
    switchedState.storedLocale === 'en',
    `Expected persisted locale "en", found "${switchedState.storedLocale}"`,
  );
  await capture(
    page,
    `${prefix}-language-en.png`,
    `${prefix} language EN`,
  );

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('html[lang="en"]').waitFor({
    state: 'attached',
    timeout: 15000,
  });
  await requireVisible(
    page.getByRole('button', {
      name: 'Begin exploring the Solar System',
      exact: true,
    }),
    'English start button after reload',
    15000,
  );
  const reloadedGroup = await requireVisible(
    page.getByRole('group', { name: 'Select language' }),
    'English language group after reload',
  );
  const reloadedEnButton = await requireVisible(
    reloadedGroup.getByRole('button', { name: 'Language: EN' }),
    'English language button after reload',
  );
  assert(
    (await reloadedEnButton.getAttribute('aria-pressed')) === 'true',
    'Persisted EN language was not restored after reload',
  );

  const restoredState = await page.evaluate((key) => ({
    lang: document.documentElement.lang,
    storedLocale: window.localStorage.getItem(key),
  }), languageStorageKey);
  assert(
    restoredState.lang === 'en',
    `Expected document lang "en" after reload, found "${restoredState.lang}"`,
  );
  assert(
    restoredState.storedLocale === 'en',
    `Expected persisted locale "en" after reload, found "${restoredState.storedLocale}"`,
  );
}

async function captureArchive(page, prefix) {
  await page.goto(`${baseUrl}/?mode=archive`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await requireVisible(
    page.getByRole('heading', {
      name: 'O sinal termina. A luz continua.',
    }),
    'archive hero heading',
  );
  await requireVisible(
    page.getByRole('heading', { name: 'Jornada de Marte', exact: true }),
    'archive Mars heading',
  );
  await requireVisible(
    page.getByRole('heading', { name: 'Jornada da Lua', exact: true }),
    'archive Moon heading',
  );
  await requireVisible(
    page.getByText('10 de junho de 2018', { exact: true }),
    'archive Opportunity last signal',
  );
  await requireVisible(
    page.getByText('Exosfera fina', { exact: true }),
    'archive Moon exosphere fact',
  );
  assert(
    (await page.getByText('Sem vento', { exact: true }).count()) === 0,
    'Archive still exposes the obsolete "Sem vento" fact',
  );
  await requireVisible(
    page.getByText('45,16 km', { exact: true }),
    'archive Opportunity distance',
  );
  await requireVisible(
    page.getByText(/Evidências de ambientes antigos com água/),
    'archive Opportunity water evidence',
  );
  await requireVisible(
    page.getByRole('link', { name: 'ECHOES' }),
    'archive wordmark link',
  );

  const canvasCount = await page.locator('canvas').count();
  assert(
    canvasCount === 0,
    `Archive mode contains ${canvasCount} canvas element(s)`,
  );

  await capture(
    page,
    `${prefix}-archive.png`,
    `${prefix} archive`,
    { fullPage: true },
  );
}

async function withContext(label, options, callback) {
  let context;
  try {
    context = await browser.newContext(options);
    const page = await context.newPage();
    watchPage(page, label);
    await callback(page);
  } finally {
    await context?.close().catch(() => {});
  }
}

async function runStep(label, callback) {
  try {
    await callback();
  } catch (error) {
    flowErrors.push(`${label}: ${formatError(error)}`);
  }
}

let browser;

try {
  browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: [
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-angle=swiftshader',
      '--disable-dev-shm-usage',
    ],
  });

  await runStep('desktop cinematic', () =>
    withContext(
      'desktop',
      { viewport: { width: 1440, height: 1000 } },
      (page) => captureCinematicFlow(page, 'desktop'),
    ),
  );

  await runStep('mobile cinematic', () =>
    withContext(
      'mobile',
      {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
      },
      (page) => captureCinematicFlow(page, 'mobile'),
    ),
  );

  await runStep('language persistence', () =>
    withContext(
      'language',
      { viewport: { width: 1440, height: 1000 } },
      (page) => captureLanguagePersistence(page, 'desktop'),
    ),
  );

  await runStep('desktop archive', () =>
    withContext(
      'desktop-archive',
      { viewport: { width: 1440, height: 1000 } },
      (page) => captureArchive(page, 'desktop'),
    ),
  );

  await runStep('mobile archive', () =>
    withContext(
      'mobile-archive',
      {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
      },
      (page) => captureArchive(page, 'mobile'),
    ),
  );
} catch (error) {
  flowErrors.push(`QA bootstrap: ${formatError(error)}`);
} finally {
  await browser?.close().catch(() => {});
}

const report = {
  baseUrl,
  outputDir,
  pageErrors,
  consoleErrors,
  httpErrors,
  layoutIssues,
  a11yIssues,
  flowErrors,
};

await writeFile(
  `${outputDir}/report.json`,
  `${JSON.stringify({ ...report, generatedAt: new Date().toISOString() }, null, 2)}\n`,
  'utf8',
);

console.log(JSON.stringify(report, null, 2));

const hasFailures = Object.values({
  pageErrors,
  consoleErrors,
  httpErrors,
  layoutIssues,
  a11yIssues,
  flowErrors,
}).some((issues) => issues.length > 0);

if (hasFailures) process.exitCode = 1;
