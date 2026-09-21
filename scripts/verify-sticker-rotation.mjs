import { chromium } from 'playwright';
import fs from 'fs';

fs.mkdirSync('screenshots', { recursive: true });

console.log('=== SCROLL-LINKED STICKER ROTATION VERIFICATION ===');
const browser = await chromium.launch({ headless: true });

try {
  // 1. DESKTOP TEST
  console.log('\n--- 1. DESKTOP (1440x900) VERIFICATION ---');
  const deskPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const deskErrors = [];
  deskPage.on('console', msg => {
    if (msg.type() === 'error') deskErrors.push(msg.text());
  });
  deskPage.on('pageerror', err => deskErrors.push(err.message));

  await deskPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await deskPage.waitForTimeout(2500);

  // Helper to get transforms
  async function getDoodleTransforms(page) {
    return await page.evaluate(() => {
      const scrollY = window.scrollY;
      const doodles = Array.from(document.querySelectorAll('.story-section .story-doodle-img'));
      return {
        scrollY,
        items: doodles.map(img => ({
          src: img.getAttribute('src'),
          inlineTransform: img.style.transform,
          computedTransform: window.getComputedStyle(img).transform
        }))
      };
    });
  }

  // Initial at scrollY = 0
  const initial = await getDoodleTransforms(deskPage);
  console.log('Initial scrollY =', initial.scrollY);
  initial.items.forEach(d => console.log(`  ${d.src} -> inline: "${d.inlineTransform}"`));

  // Scroll to 2000px
  await deskPage.evaluate(() => window.scrollTo(0, 2000));
  await deskPage.waitForTimeout(300);

  const scrolled2000 = await getDoodleTransforms(deskPage);
  console.log('\nScrolled to scrollY =', scrolled2000.scrollY);
  scrolled2000.items.forEach(d => console.log(`  ${d.src} -> inline: "${d.inlineTransform}"`));

  // Verify formulas at 2000px:
  // grill: 2000 * 0.1 = 200deg
  // roll: -2000 * 0.08 = -160deg
  // bite: 2000 * 0.12 = 240deg
  const expectedGrill = `rotate(${scrolled2000.scrollY * 0.1}deg)`;
  const expectedRoll = `rotate(-${scrolled2000.scrollY * 0.08}deg)`;
  const expectedBite = `rotate(${scrolled2000.scrollY * 0.12}deg)`;

  const grill = scrolled2000.items.find(d => d.src.includes('grill-doodle.png'));
  const roll = scrolled2000.items.find(d => d.src.includes('roll-doodle.png'));
  const bite = scrolled2000.items.find(d => d.src.includes('bite-doodle.png'));

  if (!grill || !roll || !bite) {
    throw new Error('Could not find all 3 doodle images in DOM');
  }

  console.log('\nChecking formula precision:');
  console.log(`  Grill: expected "${expectedGrill}", actual "${grill.inlineTransform}" -> match: ${grill.inlineTransform === expectedGrill}`);
  console.log(`  Roll:  expected "${expectedRoll}", actual "${roll.inlineTransform}" -> match: ${roll.inlineTransform === expectedRoll}`);
  console.log(`  Bite:  expected "${expectedBite}", actual "${bite.inlineTransform}" -> match: ${bite.inlineTransform === expectedBite}`);

  if (grill.inlineTransform !== expectedGrill || roll.inlineTransform !== expectedRoll || bite.inlineTransform !== expectedBite) {
    throw new Error('Rotation formulas do not match requested specifications!');
  }
  console.log('[PASS] Desktop scroll-linked rotation formulas verified perfectly!');

  // Take screenshot of Section 4 when scrolled
  await deskPage.evaluate(() => {
    const el = document.querySelector('.story-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await deskPage.waitForTimeout(500);

  await deskPage.screenshot({
    path: 'screenshots/desktop-section4-scrolled.png',
    animations: 'disabled'
  });


  // 2. MOBILE TEST (390x844)
  console.log('\n--- 2. MOBILE (390x844) VERIFICATION ---');
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  
  await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2500);

  // Scroll down on mobile
  await mobilePage.evaluate(() => window.scrollTo(0, 1800));
  await mobilePage.waitForTimeout(300);

  const mobileScrolled = await getDoodleTransforms(mobilePage);
  console.log('Mobile scrollY =', mobileScrolled.scrollY);
  mobileScrolled.items.forEach(d => console.log(`  ${d.src} -> inline: "${d.inlineTransform}"`));

  const mobileExpectedGrill = `rotate(${mobileScrolled.scrollY * 0.1}deg)`;
  const mobileExpectedRoll = `rotate(-${mobileScrolled.scrollY * 0.08}deg)`;
  const mobileExpectedBite = `rotate(${mobileScrolled.scrollY * 0.12}deg)`;

  const mGrill = mobileScrolled.items.find(d => d.src.includes('grill-doodle.png'));
  const mRoll = mobileScrolled.items.find(d => d.src.includes('roll-doodle.png'));
  const mBite = mobileScrolled.items.find(d => d.src.includes('bite-doodle.png'));

  console.log('\nChecking mobile formula precision:');
  console.log(`  Grill: expected "${mobileExpectedGrill}", actual "${mGrill.inlineTransform}" -> match: ${mGrill.inlineTransform === mobileExpectedGrill}`);
  console.log(`  Roll:  expected "${mobileExpectedRoll}", actual "${mRoll.inlineTransform}" -> match: ${mRoll.inlineTransform === mobileExpectedRoll}`);
  console.log(`  Bite:  expected "${mobileExpectedBite}", actual "${mBite.inlineTransform}" -> match: ${mBite.inlineTransform === mobileExpectedBite}`);

  if (mGrill.inlineTransform !== mobileExpectedGrill || mRoll.inlineTransform !== mobileExpectedRoll || mBite.inlineTransform !== mobileExpectedBite) {
    throw new Error('Mobile rotation formulas do not match requested specifications!');
  }
  console.log('[PASS] Mobile scroll-linked rotation formulas verified perfectly!');

  // Take screenshot of Section 4 on mobile
  await mobilePage.evaluate(() => {
    const el = document.querySelector('.story-row-grill');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await mobilePage.waitForTimeout(500);

  await mobilePage.screenshot({
    path: 'screenshots/mobile-section4-scrolled.png',
    animations: 'disabled'
  });

  console.log('\n>>> ALL STICKER ROTATION TESTS PASSED WITH 100% SUCCESS! <<<');
} catch (err) {
  console.error('Error during sticker rotation verification:', err);
  process.exit(1);
} finally {
  await browser.close();
}
