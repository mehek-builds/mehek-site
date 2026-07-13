#!/usr/bin/env node
/* mehek-site motion QA gate (canon since 2026-07-14). Run before merging any
   branch that touches Hero, Record, or Work motion. Drives a real Chromium
   page with Playwright and checks the three moving parts against the site's
   own non-negotiables (docs/DECISIONS.md, founder-site-HANDOFF.md):
     - the hero harmonograph actually animates, and goes fully static under
       prefers-reduced-motion (no reveal gimmick left running)
     - the Record scene's scroll-scrub lights nodes monotonically (no stuck-
       at-zero, no jump straight to fully-lit before the section is reached)
     - Work window hover-to-play clips actually play on hover and reset to
       the poster frame at rest

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

async function checkRecordScrub(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  const record = await page.$("#record");
  if (!record) {
    fail("Record scene: #record not found on page.");
    await page.close();
    return;
  }

  const litCounts = [];
  const box = await record.boundingBox();
  const sectionTop = box.y;
  const sectionHeight = box.height;
  const steps = 6;

  for (let i = 0; i <= steps; i++) {
    const y = sectionTop + (sectionHeight * i) / steps;
    await page.mouse.wheel(0, 0); // no-op, ensures a paint tick
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(300);
    const lit = await page.$$eval(".rec-node.lit", (els) => els.length);
    litCounts.push(lit);
  }
  await page.close();

  // Monotonic non-decreasing is the contract: the scrub should never light
  // fewer nodes further into the section than it did earlier.
  let monotonic = true;
  for (let i = 1; i < litCounts.length; i++) {
    if (litCounts[i] < litCounts[i - 1]) monotonic = false;
  }
  const allSameAndZero = litCounts.every((c) => c === 0);
  const allSameAndMax = new Set(litCounts).size === 1 && litCounts[0] > 0;

  if (allSameAndZero) {
    fail(`Record scrub: node lit-count stayed at 0 across the whole section (${litCounts.join(",")}) — scroll-scrub looks stuck.`);
  } else if (allSameAndMax) {
    fail(`Record scrub: node lit-count jumped straight to ${litCounts[0]} and never changed (${litCounts.join(",")}) — scrub not driving progressively.`);
  } else if (!monotonic) {
    fail(`Record scrub: lit-count went backwards while scrolling down (${litCounts.join(",")}) — should be non-decreasing.`);
  } else {
    pass(`Record scrub: lit-count progressed non-decreasing through the section (${litCounts.join(",")}).`);
  }
}

async function checkWorkHoverToPlay(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  const video = await page.$("video");
  if (!video) {
    fail("Work scene: no <video> element found — hover-to-play clips missing from the page.");
    await page.close();
    return;
  }
  await video.scrollIntoViewIfNeeded();
  const pausedBefore = await video.evaluate((v) => v.paused);

  const box = await video.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(600);
  const pausedDuringHover = await video.evaluate((v) => v.paused);

  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  const pausedAfter = await video.evaluate((v) => v.paused);
  await page.close();

  if (!pausedBefore) {
    fail("Work window: video is already playing before any hover — should start paused on the poster frame.");
  } else {
    pass("Work window: video starts paused (poster frame) at rest.");
  }
  if (pausedDuringHover) {
    fail("Work window: video did not start playing on hover.");
  } else {
    pass("Work window: video plays on hover.");
  }
  if (!pausedAfter) {
    fail("Work window: video kept playing after the cursor left — should reset to the poster frame.");
  } else {
    pass("Work window: video pauses/resets after hover ends.");
  }
}

(async () => {
  const browser = await chromium.launch();
  try {
    await checkHeroMotion(browser);
    await checkHeroReducedMotionStatic(browser);
    await checkRecordScrub(browser);
    await checkWorkHoverToPlay(browser);
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
