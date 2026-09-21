import { chromium } from 'playwright';
import fs from 'fs';

fs.mkdirSync('screenshots', { recursive: true });

console.log('=== 3D PEELING STICKER SCROLL ANIMATION VERIFICATION ===');
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

  // Helper to get transforms & classes
  async function getDoodleTransforms(page) {
    return await page.evaluate(() => {
      const scrollY = window.scrollY;
      const doodles = Array.from(document.querySelectorAll('.story-section .story-doodle-img'));
      return {
        scrollY,
        items: doodles.map(img => ({
          src: img.getAttribute('src'),
          className: img.className,
          inlineTransform: img.style.transform,
          computedTransform: window.getComputedStyle(img).transform
        }))
      };
    });
  }

  // Initial at scrollY = 0
  const initial = await getDoodleTransforms(deskPage);
  console.log('Initial scrollY =', initial.scrollY);
  initial.items.forEach(d => console.log(`  ${d.src} -> inline: "${d.inlineTransform}" [class: ${d.className}]`));

  // Check drop-shadow-xl class on all doodles
  for (const d of initial.items) {
    if (!d.className.includes('drop-shadow-xl')) {
      throw new Error(`Doodle ${d.src} does not have 'drop-shadow-xl' class applied!`);
    }
  }
  console.log('[PASS] All doodle sticker images have Tailwind drop-shadow-xl applied.');

  // Scroll to 2000px
  await deskPage.evaluate(() => window.scrollTo(0, 2000));
  await deskPage.waitForTimeout(300);

  const scrolled2000 = await getDoodleTransforms(deskPage);
  console.log('\nScrolled to scrollY =', scrolled2000.scrollY);
  scrolled2000.items.forEach(d => console.log(`  ${d.src} -> inline: "${d.inlineTransform}"`));

  const sY = scrolled2000.scrollY;
  const grillExpectedRot = Math.sin(sY * 0.005) * 12;
  const grillExpectedRotX = Math.cos(sY * 0.005) * 15;

  const rollExpectedRot = -Math.sin(sY * 0.005) * 10;
  const rollExpectedRotY = Math.cos(sY * 0.005) * 18;

  const biteExpectedRot = Math.cos(sY * 0.005) * 14;
  const biteExpectedRotX = Math.sin(sY * 0.005) * 12;

  const grill = scrolled2000.items.find(d => d.src.includes('grill-doodle.png'));
  const roll = scrolled2000.items.find(d => d.src.includes('roll-doodle.png'));
  const bite = scrolled2000.items.find(d => d.src.includes('bite-doodle.png'));

  if (!grill || !roll || !bite) {
    throw new Error('Could not find all 3 doodle images in DOM');
  }

  // Parse degrees from transform
  function parseTransformVals(str) {
    const rot = parseFloat(str.match(/rotate\(([-\d.]+)deg\)/)?.[1] ?? 'NaN');
    const rotX = parseFloat(str.match(/rotateX\(([-\d.]+)deg\)/)?.[1] ?? 'NaN');
    const rotY = parseFloat(str.match(/rotateY\(([-\d.]+)deg\)/)?.[1] ?? 'NaN');
    const hasPerspective = str.includes('perspective(500px)');
    return { rot, rotX, rotY, hasPerspective };
  }

  const gVals = parseTransformVals(grill.inlineTransform);
  const rVals = parseTransformVals(roll.inlineTransform);
  const bVals = parseTransformVals(bite.inlineTransform);

  console.log('\nChecking formula numerical precision at scrollY = ' + sY + ':');
  console.log(`  Grill: expected rotate=${grillExpectedRot.toFixed(3)}deg, rotX=${grillExpectedRotX.toFixed(3)}deg | actual rotate=${gVals.rot.toFixed(3)}deg, rotX=${gVals.rotX.toFixed(3)}deg`);
  console.log(`  Roll:  expected rotate=${rollExpectedRot.toFixed(3)}deg, rotY=${rollExpectedRotY.toFixed(3)}deg | actual rotate=${rVals.rot.toFixed(3)}deg, rotY=${rVals.rotY.toFixed(3)}deg`);
  console.log(`  Bite:  expected rotate=${biteExpectedRot.toFixed(3)}deg, rotX=${biteExpectedRotX.toFixed(3)}deg | actual rotate=${bVals.rot.toFixed(3)}deg, rotX=${bVals.rotX.toFixed(3)}deg`);

  const grillDiff = Math.abs(gVals.rot - grillExpectedRot) + Math.abs(gVals.rotX - grillExpectedRotX);
  const rollDiff = Math.abs(rVals.rot - rollExpectedRot) + Math.abs(rVals.rotY - rollExpectedRotY);
  const biteDiff = Math.abs(bVals.rot - biteExpectedRot) + Math.abs(bVals.rotX - biteExpectedRotX);

  if (grillDiff > 0.01 || rollDiff > 0.01 || biteDiff > 0.01 || !gVals.hasPerspective || !rVals.hasPerspective || !bVals.hasPerspective) {
    throw new Error('3D peeling rotation formulas do not match requested specifications within 0.01deg!');
  }
  console.log('[PASS] Desktop 3D peeling rotation formulas verified perfectly!');

  // Take screenshot of Section 4 when scrolled
  await deskPage.evaluate(() => {
    const el = document.querySelector('.story-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await deskPage.waitForTimeout(500);

  await deskPage.screenshot({
    path: 'screenshots/desktop-section4-peeling.png',
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

  const msY = mobileScrolled.scrollY;
  const mGrillExpectedRot = Math.sin(msY * 0.005) * 12;
  const mGrillExpectedRotX = Math.cos(msY * 0.005) * 15;

  const mRollExpectedRot = -Math.sin(msY * 0.005) * 10;
  const mRollExpectedRotY = Math.cos(msY * 0.005) * 18;

  const mBiteExpectedRot = Math.cos(msY * 0.005) * 14;
  const mBiteExpectedRotX = Math.sin(msY * 0.005) * 12;

  const mGrill = mobileScrolled.items.find(d => d.src.includes('grill-doodle.png'));
  const mRoll = mobileScrolled.items.find(d => d.src.includes('roll-doodle.png'));
  const mBite = mobileScrolled.items.find(d => d.src.includes('bite-doodle.png'));

  const mgVals = parseTransformVals(mGrill.inlineTransform);
  const mrVals = parseTransformVals(mRoll.inlineTransform);
  const mbVals = parseTransformVals(mBite.inlineTransform);

  console.log('\nChecking mobile formula precision at scrollY = ' + msY + ':');
  console.log(`  Grill: expected rotate=${mGrillExpectedRot.toFixed(3)}deg, rotX=${mGrillExpectedRotX.toFixed(3)}deg | actual rotate=${mgVals.rot.toFixed(3)}deg, rotX=${mgVals.rotX.toFixed(3)}deg`);
  console.log(`  Roll:  expected rotate=${mRollExpectedRot.toFixed(3)}deg, rotY=${mRollExpectedRotY.toFixed(3)}deg | actual rotate=${mrVals.rot.toFixed(3)}deg, rotY=${mrVals.rotY.toFixed(3)}deg`);
  console.log(`  Bite:  expected rotate=${mBiteExpectedRot.toFixed(3)}deg, rotX=${mBiteExpectedRotX.toFixed(3)}deg | actual rotate=${mbVals.rot.toFixed(3)}deg, rotX=${mbVals.rotX.toFixed(3)}deg`);

  const mgrillDiff = Math.abs(mgVals.rot - mGrillExpectedRot) + Math.abs(mgVals.rotX - mGrillExpectedRotX);
  const mrollDiff = Math.abs(mrVals.rot - mRollExpectedRot) + Math.abs(mrVals.rotY - mRollExpectedRotY);
  const mbiteDiff = Math.abs(mbVals.rot - mBiteExpectedRot) + Math.abs(mbVals.rotX - mBiteExpectedRotX);

  if (mgrillDiff > 0.01 || mrollDiff > 0.01 || mbiteDiff > 0.01 || !mgVals.hasPerspective || !mrVals.hasPerspective || !mbVals.hasPerspective) {
    throw new Error('Mobile 3D peeling formulas do not match requested specifications within 0.01deg!');
  }
  console.log('[PASS] Mobile 3D peeling formulas verified perfectly!');

  // Take screenshot of Section 4 on mobile
  await mobilePage.evaluate(() => {
    const el = document.querySelector('.story-row-grill');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await mobilePage.waitForTimeout(500);

  await mobilePage.screenshot({
    path: 'screenshots/mobile-section4-peeling.png',
    animations: 'disabled'
  });

  console.log('\n>>> ALL 3D PEELING STICKER TESTS PASSED WITH 100% SUCCESS! <<<');
} catch (err) {
  console.error('Error during 3D peeling verification:', err);
  process.exit(1);
} finally {
  await browser.close();
}
