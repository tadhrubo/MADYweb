import { chromium } from 'playwright';
import fs from 'fs';

fs.mkdirSync('screenshots', { recursive: true });

console.log('=== COPYWRITING UPDATE VERIFICATION ===');
const browser = await chromium.launch({ headless: true });

try {
  // 1. DESKTOP TEST
  console.log('\n--- 1. DESKTOP (1440x900) ---');
  const deskPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await deskPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await deskPage.waitForTimeout(2500);

  // Hero sticker check
  const stickerOneText = await deskPage.evaluate(() => {
    const el = document.querySelector('.sticker-one');
    return el?.innerText?.trim().replace(/\s+/g, ' ');
  });
  console.log('Hero Sticker text:', stickerOneText);
  if (stickerOneText !== 'CARVED HOT') {
    throw new Error(`Expected 'CARVED HOT', got '${stickerOneText}'`);
  }

  // Red Section (FoodFeel) check
  const foodFeelCopy = await deskPage.evaluate(() => {
    const eyebrow = document.querySelector('.food-feel .experience')?.innerText?.trim().replace(/\s+/g, ' ');
    const h2s = Array.from(document.querySelectorAll('.food-feel .feel-title h2')).map(h => h.innerText?.trim().replace(/\s+/g, ' '));
    return { eyebrow, h2s, full: [eyebrow, ...h2s].join(' ') };
  });
  console.log('FoodFeel Copy:', foodFeelCopy);
  if (foodFeelCopy.full !== 'STREET FOOD DONE DANGEROUSLY RIGHT') {
    throw new Error(`Expected 'STREET FOOD DONE DANGEROUSLY RIGHT', got '${foodFeelCopy.full}'`);
  }

  // Section 3 (PureQuality) check
  const pureQualityCopy = await deskPage.evaluate(() => {
    const eyebrow = document.querySelector('.pure-quality .quality-eyebrow')?.innerText?.trim().replace(/\s+/g, ' ');
    const lines = Array.from(document.querySelectorAll('.pure-quality .headline-line')).map(l => l.innerText?.trim().replace(/\s+/g, ' '));
    return { eyebrow, lines, fullHeadline: lines.join(' ') };
  });
  console.log('Section 3 Copy:', pureQualityCopy);
  if (pureQualityCopy.eyebrow !== 'ZERO SHORTCUTS') {
    throw new Error(`Expected eyebrow 'ZERO SHORTCUTS', got '${pureQualityCopy.eyebrow}'`);
  }
  if (pureQualityCopy.fullHeadline !== 'BUILT DIFFERENT FROM THE BREAD UP') {
    throw new Error(`Expected headline 'BUILT DIFFERENT FROM THE BREAD UP', got '${pureQualityCopy.fullHeadline}'`);
  }

  // Capture desktop screenshots
  // 1. Hero
  await deskPage.screenshot({ path: 'screenshots/copy-desktop-hero.png', animations: 'disabled' });

  // 2. Red section
  await deskPage.evaluate(() => {
    const el = document.querySelector('.food-feel');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await deskPage.waitForTimeout(500);
  await deskPage.screenshot({ path: 'screenshots/copy-desktop-foodfeel.png', animations: 'disabled' });

  // 3. Section 3
  await deskPage.evaluate(() => {
    const el = document.querySelector('.pure-quality');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await deskPage.waitForTimeout(500);
  await deskPage.screenshot({ path: 'screenshots/copy-desktop-section3.png', animations: 'disabled' });


  // 2. MOBILE TEST (390x844)
  console.log('\n--- 2. MOBILE (390x844) ---');
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2500);

  // Check horizontal overflow on mobile
  const mobileOverflow = await mobilePage.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth
    };
  });
  console.log('Mobile overflow check at top:', mobileOverflow);

  // Scroll to food-feel
  await mobilePage.evaluate(() => {
    const el = document.querySelector('.food-feel');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await mobilePage.waitForTimeout(500);

  const mobileFoodFeelOverflow = await mobilePage.evaluate(() => {
    const h2s = Array.from(document.querySelectorAll('.food-feel .feel-title h2'));
    const boxes = h2s.map(h => h.getBoundingClientRect());
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      boxes
    };
  });
  console.log('Mobile FoodFeel boxes & overflow:', mobileFoodFeelOverflow);
  await mobilePage.screenshot({ path: 'screenshots/copy-mobile-foodfeel.png', animations: 'disabled' });

  // Scroll to Section 3
  await mobilePage.evaluate(() => {
    const el = document.querySelector('.pure-quality');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await mobilePage.waitForTimeout(500);

  const mobileSec3Overflow = await mobilePage.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth
    };
  });
  console.log('Mobile Section 3 overflow:', mobileSec3Overflow);
  await mobilePage.screenshot({ path: 'screenshots/copy-mobile-section3.png', animations: 'disabled' });

  console.log('\n>>> ALL COPYWRITING VERIFICATIONS PASSED! <<<');
} catch (err) {
  console.error('Error during copywriting verification:', err);
  process.exit(1);
} finally {
  await browser.close();
}
