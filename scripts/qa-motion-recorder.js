#!/usr/bin/env node
/* mehek-site motion QA gate (canon since 2026-07-14). Run before merging any
   branch that touches Hero or Work motion. Drives a real Chromium page with
   Playwright and checks the moving parts against the site's
   own non-negotiables (docs/DECISIONS.md, founder-site-HANDOFF.md):
     - the hero harmonograph actually animates, and goes fully static under
       prefers-reduced-motion (no reveal gimmick left running)
     - the Work grid contains six equal cards in two rows of three
     - Work clips play continuously, while reduced motion parks them
     - the Litos identity and Nourish device sizing stay aligned

   HOW TO RUN
     1. Start the dev server: npm run dev (or preview_start "mehek-site").
     2. node scripts/qa-motion-recorder.js [http://localhost:3505]
   Exits 0 and prints PASS per check, or exits 1 and prints which check failed.
*/

const { chromium } = require("playwright");

const BASE_URL = process.argv[2] || "http://localhost:3505";

function fail(msg) {
  console.error(`[FAIL] ${msg}`);
  process.exitCode = 1;
}
function pass(msg) {
  console.log(`[PASS] ${msg}`);
}

async function canvasSignature(page, selector) {
  // Full-canvas hash, not a fixed-point sample: the harmonograph is a thin,
  // deliberately compressed curve (Mehek directive: "figure much smaller"),
  // so a handful of fixed sample points can miss it entirely and read a
  // moving figure as static. Summing every pixel catches motion anywhere
  // on the canvas at the cost of a bit more compute on a small element.
  return page.$eval(selector, (el) => {
    const ctx = el.getContext("2d");
    const { width: w, height: h } = el;
    if (!w || !h) return 0;
    const data = ctx.getImageData(0, 0, w, h).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += data[i] * 3 + data[i + 1] * 6 + data[i + 2];
    }
    return sum;
  });
}

async function checkHeroMotion(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  const canvasSel = "canvas";
  await page.waitForSelector(canvasSel, { timeout: 10000 });

  const s1 = await canvasSignature(page, canvasSel);
  await page.waitForTimeout(2000);
  const s2 = await canvasSignature(page, canvasSel);
  await page.close();

  if (s1 === s2) {
    fail(`Hero harmonograph: canvas signature unchanged over 2s (${s1}) — looks stuck, not slowly drawing.`);
  } else {
    pass(`Hero harmonograph: canvas signature changed (${s1} -> ${s2}) — animating.`);
  }
}

async function checkHeroReducedMotionStatic(browser) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  const canvasSel = "canvas";
  await page.waitForSelector(canvasSel, { timeout: 10000 });

  const s1 = await canvasSignature(page, canvasSel);
  await page.waitForTimeout(1500);
  const s2 = await canvasSignature(page, canvasSel);

  // The accessible twin should render the full name in ink even with the
  // figure parked — a plain fetch / reduced-motion visitor must still get
  // the real text, not just a ghost waiting on a light that never sweeps.
  const heroText = await page.evaluate(() => {
    const hero = document.querySelector(".hero, [class*='hero']");
    return hero ? hero.innerText.trim() : "";
  });
  await page.close();

  if (s1 !== s2) {
    fail(`Hero harmonograph (reduced motion): canvas signature changed (${s1} -> ${s2}) — should be parked/static.`);
  } else {
    pass("Hero harmonograph (reduced motion): canvas signature static — figure parked as expected.");
  }
  if (!heroText || heroText.length < 5) {
    fail("Hero (reduced motion): no visible text content found in the hero — accessible twin may be missing.");
  } else {
    pass(`Hero (reduced motion): visible text present ("${heroText.slice(0, 40)}...").`);
  }
}

async function measureWorkGrid(page) {
  await page.waitForSelector(".car-grid .car-card");
  await page.locator(".car-grid").scrollIntoViewIfNeeded();
  return page.evaluate(() => {
    const cards = [...document.querySelectorAll(".car-grid .car-card")];
    const rects = cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width) };
    });
    const phone = document.querySelector(".phone-frame")?.getBoundingClientRect();
    const windowFrame = document.querySelector(".win-frame")?.getBoundingClientRect();
    const mediaStages = [...document.querySelectorAll(".project-media")].map((stage) =>
      Math.round(stage.getBoundingClientRect().height)
    );
    const litos = cards.find((card) => card.textContent?.includes("Litos"));
    const retiredBrand = ["role", "quick"].join("");
    return {
      count: cards.length,
      names: cards.map((card) => card.querySelector(".car-name")?.textContent?.trim() ?? ""),
      columns: new Set(rects.map((rect) => rect.x)).size,
      rows: new Set(rects.map((rect) => rect.y)).size,
      widths: new Set(rects.map((rect) => rect.width)).size,
      litosHref: litos?.getAttribute("href") ?? "",
      oldBrandPresent: document.documentElement.innerHTML.toLowerCase().includes(retiredBrand),
      phoneHeight: phone ? Math.round(phone.height) : 0,
      windowHeight: windowFrame ? Math.round(windowFrame.height) : 0,
      mediaStageHeights: [...new Set(mediaStages)],
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      durations: cards.map((card) => getComputedStyle(card).transitionDuration),
      delays: cards.map((card) => getComputedStyle(card).transitionDelay),
    };
  });
}

async function checkWorkGrid(browser) {
  const cases = [
    { width: 1280, columns: 3, rows: 2 },
    { width: 900, columns: 2, rows: 3 },
    { width: 620, columns: 1, rows: 6 },
  ];
  const measured = [];
  for (const expected of cases) {
    const page = await browser.newPage({
      viewport: { width: expected.width, height: 900 },
      reducedMotion: "reduce",
    });
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    const result = await measureWorkGrid(page);
    await page.close();
    measured.push({ expected, result });
    if (
      result.count !== 6 ||
      result.columns !== expected.columns ||
      result.rows !== expected.rows ||
      result.widths !== 1 ||
      result.mediaStageHeights.length !== 1 ||
      result.overflow
    ) {
      fail(`Work grid at ${expected.width}px: unexpected layout ${JSON.stringify(result)}.`);
    } else {
      pass(`Work grid at ${expected.width}px: ${expected.columns} column layout has six equal cards and no overflow.`);
    }
  }

  const result = measured[0].result;
  const expectedOrder = [
    "Litos",
    "BuildSmart",
    "Traeco",
    "The Rufescent film",
    "Earnings-drift trading system",
    "Nourish",
  ];
  if (JSON.stringify(result.names) !== JSON.stringify(expectedOrder)) {
    fail(`Work grid: unexpected project order ${JSON.stringify(result.names)}.`);
  } else {
    pass("Work grid: Traeco appears directly before the Rufescent project.");
  }
  if (result.litosHref !== "https://trylitos.com" || result.oldBrandPresent) {
    fail(`Work grid: Litos identity is inconsistent (${JSON.stringify(result)}).`);
  } else {
    pass("Work grid: Litos points to trylitos.com and the retired brand is absent.");
  }
  if (result.phoneHeight > result.windowHeight || result.windowHeight - result.phoneHeight > 32) {
    fail(`Work grid: Nourish is ${result.phoneHeight}px tall versus ${result.windowHeight}px for a browser window.`);
  } else {
    pass(`Work grid: Nourish stays slightly shorter inside an aligned media stage (${result.phoneHeight}px versus ${result.windowHeight}px).`);
  }

  const revealPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await revealPage.goto(BASE_URL, { waitUntil: "networkidle" });
  await revealPage.locator(".car-grid").scrollIntoViewIfNeeded();
  await revealPage.waitForFunction(() =>
    [...document.querySelectorAll(".car-grid .car-card")].every((card) => card.classList.contains("in"))
  );
  await revealPage.waitForFunction(() =>
    [...document.querySelectorAll(".car-grid .car-card")].every(
      (card) => getComputedStyle(card).transform === "none" && getComputedStyle(card).opacity === "1"
    )
  );
  const revealStyles = await revealPage.$$eval(".car-grid .car-card", (cards) =>
    cards.map((card) => ({
      duration: getComputedStyle(card).transitionDuration,
      delay: getComputedStyle(card).transitionDelay.split(",")[0].trim(),
    }))
  );
  await revealPage.close();
  const expectedDelays = ["0s", "0.12s", "0.24s", "0s", "0.12s", "0.24s"];
  if (
    revealStyles.some((style) => style.duration !== "1.2s") ||
    revealStyles.some((style, index) => style.delay !== expectedDelays[index])
  ) {
    fail(`Work reveal: expected a 1.2s row stagger, got ${JSON.stringify(revealStyles)}.`);
  } else {
    pass("Work reveal: cards use the intended 1.2 second row stagger.");
  }
}

async function checkWorkVideoMotion(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.locator(".car-grid").scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => {
      const videos = [...document.querySelectorAll(".car-grid video")];
      return videos.length === 4 && videos.every((video) => !video.paused && video.currentTime > 0);
    },
    { timeout: 10000 }
  );
  const states = await page.$$eval(".car-grid video", (videos) =>
    videos.map((video) => ({ paused: video.paused, currentTime: video.currentTime }))
  );
  const stillAnimations = await page.$$eval(".car-grid .has-still .win-shot", (images) =>
    images.map((image) => getComputedStyle(image).animationName)
  );
  await page.close();
  if (states.length !== 4 || states.some((state) => state.paused || state.currentTime <= 0)) {
    fail(`Work motion: expected four visible product clips to play, got ${JSON.stringify(states)}.`);
  } else {
    pass("Work motion: all four available product clips play while visible.");
  }
  if (stillAnimations.length !== 2 || stillAnimations.some((name) => name !== "project-still-drift")) {
    fail(`Work motion: expected two still projects to use subtle movement, got ${JSON.stringify(stillAnimations)}.`);
  } else {
    pass("Work motion: both still projects use the subtle drift treatment.");
  }

  const reducedPage = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  });
  await reducedPage.goto(BASE_URL, { waitUntil: "networkidle" });
  const reducedStates = await reducedPage.$$eval(".car-grid video", (videos) =>
    videos.map((video) => ({ paused: video.paused, currentTime: video.currentTime }))
  );
  const reducedStillAnimations = await reducedPage.$$eval(".car-grid .has-still .win-shot", (images) =>
    images.map((image) => getComputedStyle(image).animationName)
  );
  await reducedPage.close();
  if (reducedStates.some((state) => !state.paused || state.currentTime !== 0)) {
    fail(`Work motion (reduced): clips should be parked, got ${JSON.stringify(reducedStates)}.`);
  } else {
    pass("Work motion (reduced): all clips are parked on their poster frames.");
  }
  if (reducedStillAnimations.some((name) => name !== "none")) {
    fail(`Work motion (reduced): still-image movement should be disabled, got ${JSON.stringify(reducedStillAnimations)}.`);
  } else {
    pass("Work motion (reduced): still-image movement is disabled.");
  }
}

(async () => {
  const browser = await chromium.launch();
  try {
    await checkHeroMotion(browser);
    await checkHeroReducedMotionStatic(browser);
    await checkWorkGrid(browser);
    await checkWorkVideoMotion(browser);
  } catch (err) {
    fail(`Recorder crashed: ${err.message}`);
  } finally {
    await browser.close();
  }
  if (process.exitCode) {
    console.error("\nqa-motion-recorder: FAILED — see [FAIL] lines above.");
  } else {
    console.log("\nqa-motion-recorder: all checks passed.");
  }
})();
