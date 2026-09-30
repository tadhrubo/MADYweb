import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'screenshots/scroll-doodles');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function verifyScrollDoodles() {
  console.log('🚀 Starting Section 4 Scroll-Driven Doodles Verification at 1440x900...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  // Bypass intro loader
  await page.addInitScript(() => {
    sessionStorage.setItem('hasVisited', 'true');
  });

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Compute Section 4 scroll bounds
  const sectionMetrics = await page.evaluate(() => {
    const sec = document.querySelector('#story-bite, .story-section');
    if (!sec) return null;
    const rect = sec.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const sectionHeight = rect.height;
    const windowHeight = window.innerHeight;

    // offset ["start end", "end start"]
    const scrollStart = sectionTop - windowHeight;
    const scrollEnd = sectionTop + sectionHeight;
    const totalRange = scrollEnd - scrollStart;

    return { sectionTop, sectionHeight, windowHeight, scrollStart, scrollEnd, totalRange };
  });

  if (!sectionMetrics) {
    throw new Error('Section 4 element (#story-bite, .story-section) not found!');
  }

  console.log(`📐 Section 4 Metrics:`);
  console.log(`   Top: ${sectionMetrics.sectionTop}px, Height: ${sectionMetrics.sectionHeight}px`);
  console.log(`   Scroll Range: [${sectionMetrics.scrollStart}px -> ${sectionMetrics.scrollEnd}px] (Total: ${sectionMetrics.totalRange}px)\n`);

  const getDoodleData = async () => {
    return await page.evaluate(() => {
      const doodles = ['grill', 'roll', 'bite'];
      const data = {};
      for (const d of doodles) {
        const wrap = document.querySelector(`.story-doodle-scroll-${d}, .story-doodle-scroll-wrap.story-doodle-scroll-${d}`) ||
                     document.querySelectorAll('.story-doodle-scroll-wrap')[d === 'grill' ? 0 : d === 'roll' ? 1 : 2];
        if (!wrap) continue;
        const rect = wrap.getBoundingClientRect();
        const transform = window.getComputedStyle(wrap).transform;
        let translateY = 0;
        if (transform && transform !== 'none') {
          const matrix = transform.match(/matrix\(([^)]+)\)/);
          if (matrix) {
            translateY = parseFloat(matrix[1].split(',')[5]);
          } else {
            const matrix3d = transform.match(/matrix3d\(([^)]+)\)/);
            if (matrix3d) {
              translateY = parseFloat(matrix3d[1].split(',')[13]);
            }
          }
        }
        data[d] = {
          translateY,
          top: rect.top,
          bottom: rect.bottom,
        };
      }
      return data;
    });
  };

  const scrollToProgress = async (progress) => {
    const targetScrollY = Math.max(0, sectionMetrics.scrollStart + progress * sectionMetrics.totalRange);
    await page.evaluate((y) => window.scrollTo(0, y), targetScrollY);
    // Wait for spring physics (stiffness 60, damping 20) to settle
    await page.waitForTimeout(650);
  };

  // Chronological scroll progression
  const scrollSteps = [
    { p: 0.00, label: '0%' },
    { p: 0.25, label: '25%' },
    { p: 0.28, label: '28%' },
    { p: 0.50, label: '50%' },
    { p: 0.75, label: '75%' },
    { p: 1.00, label: '100%' },
  ];

  console.log('📊 Computed translateY at each scroll point:');

  let grillAt0 = null;
  let grillAt28 = null;

  for (const step of scrollSteps) {
    await scrollToProgress(step.p);
    const data = await getDoodleData();

    if (step.p === 0.00) grillAt0 = data.grill;
    if (step.p === 0.28) grillAt28 = data.grill;

    console.log(`\n--- Progress ${step.label} (p = ${step.p.toFixed(2)}) ---`);
    console.log(`   grill: translateY = ${data.grill?.translateY?.toFixed(2)}px (bounding top = ${data.grill?.top?.toFixed(2)}px)`);
    console.log(`   roll:  translateY = ${data.roll?.translateY?.toFixed(2)}px (bounding top = ${data.roll?.top?.toFixed(2)}px)`);
    console.log(`   bite:  translateY = ${data.bite?.translateY?.toFixed(2)}px (bounding top = ${data.bite?.top?.toFixed(2)}px)`);

    // Capture screenshot at each state
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `scroll-${step.label.replace('%', 'pct')}.png`),
      fullPage: false,
    });
  }

  // Assertions:
  console.log('\n🎯 ASSERTIONS:');

  // Condition 1: At scroll 0%, grill-doodle is at least 200px below visible area (top > window.innerHeight)
  const windowH = sectionMetrics.windowHeight;
  const grillTopAt0 = grillAt0.top;
  const distanceBelowVisible = grillTopAt0 - windowH;
  console.log(`1. Grill top at 0%: ${grillTopAt0.toFixed(2)}px (window height = ${windowH}px)`);
  console.log(`   Distance below visible area: ${distanceBelowVisible.toFixed(2)}px (requirement: >= 200px)`);

  if (distanceBelowVisible < 200) {
    throw new Error(`FAIL: Grill doodle at 0% is only ${distanceBelowVisible.toFixed(2)}px below visible area (< 200px)!`);
  } else {
    console.log(`   ✅ PASS: Grill is ${distanceBelowVisible.toFixed(2)}px below visible area (>= 200px requirement met!)`);
  }

  // Condition 2: At scroll 28%, grill-doodle's translateY is within 10px of 0
  const grillTranslateY28 = grillAt28?.translateY || 0;
  const diffFrom0 = Math.abs(grillTranslateY28);
  console.log(`2. Grill translateY at 28%: ${grillTranslateY28.toFixed(2)}px`);
  console.log(`   Difference from 0: ${diffFrom0.toFixed(2)}px (requirement: <= 10px)`);

  if (diffFrom0 > 10) {
    throw new Error(`FAIL: Grill doodle translateY at 28% is ${grillTranslateY28.toFixed(2)}px (> 10px from 0)!`);
  } else {
    console.log(`   ✅ PASS: Grill translateY at 28% is ${grillTranslateY28.toFixed(2)}px (within 10px of 0 requirement met!)`);
  }

  // Console error check
  console.log('\n🔍 Console error check:');
  if (consoleErrors.length > 0) {
    console.error('❌ Console errors detected:', consoleErrors);
    throw new Error(`Console errors found: ${consoleErrors.join(', ')}`);
  } else {
    console.log('✅ No console errors detected!');
  }

  console.log('\n🎉 ALL SCROLL-DRIVEN DOODLE VERIFICATIONS PASSED SUCCESSFULLY!\n');
  await browser.close();
}

verifyScrollDoodles().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
