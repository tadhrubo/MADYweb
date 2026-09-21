import { chromium } from 'playwright';
import sharp from 'sharp';
import { spawn } from 'node:child_process';
import http from 'node:http';

function checkServer(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => resolve(res.statusCode === 200)).on('error', () => resolve(false));
  });
}

async function ensureServer() {
  const url = 'http://127.0.0.1:4173/';
  if (await checkServer(url)) return null;

  console.log('Starting vite preview server...');
  const child = spawn('npx', ['vite', 'preview', '--port', '4173', '--host', '127.0.0.1'], {
    shell: true,
    stdio: 'pipe',
  });

  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 250));
    if (await checkServer(url)) {
      console.log('Preview server ready at', url);
      return child;
    }
  }
  throw new Error('Server failed to start in time');
}

const serverProcess = await ensureServer();

try {
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ];

  console.log('\n--- VIEWPORT & RESPONSIVE ASSERTIONS ---');
  for (const { width, height } of viewports) {
    const page = await browser.newPage({ viewport: { width, height } });
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
    // Wait for preloader to dismiss
    await page.waitForTimeout(1500);

    // Scroll to section 3
    await page.evaluate(() => {
      document.querySelector('.pure-quality')?.scrollIntoView({ behavior: 'instant' });
    });
    // Park mouse far away
    await page.mouse.move(5, 5);
    await page.waitForTimeout(1000);

    const docScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const winInnerWidth = await page.evaluate(() => window.innerWidth);

    console.log(
      `[${width}x${height}] scrollWidth: ${docScrollWidth}, innerWidth: ${winInnerWidth}, consoleErrors: ${consoleErrors.length}`
    );

    if (docScrollWidth > winInnerWidth) {
      throw new Error(`Horizontal scroll detected at ${width}x${height}: scrollWidth ${docScrollWidth} > innerWidth ${winInnerWidth}`);
    }
    if (consoleErrors.length > 0) {
      throw new Error(`Console errors at ${width}x${height}: ${JSON.stringify(consoleErrors)}`);
    }

    // Capture screenshot scrolled to section 3
    await page.screenshot({ path: `screenshots/section3-${width}x${height}.png` });
    await page.close();
  }

  console.log('\n--- SECTION 3 CONTENT & LAYOUT ASSERTIONS (1440x900) ---');
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    document.querySelector('.pure-quality')?.scrollIntoView({ behavior: 'instant' });
  });
  await page.mouse.move(5, 5);
  await page.waitForTimeout(1000);

  // Assertion 1: Zero placeholders, eight <img> elements with naturalWidth > 0 and correct src
  const imgData = await page.evaluate(() => {
    const section = document.querySelector('.pure-quality');
    const placeholders = section ? section.querySelectorAll('[class*="placeholder"], .ingredient span') : [];
    const imgs = section ? Array.from(section.querySelectorAll('.ingredient-sticker img')) : [];
    return {
      placeholderCount: placeholders.length,
      imgCount: imgs.length,
      imgs: imgs.map((img) => ({
        src: img.getAttribute('src'),
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      })),
    };
  });

  console.log('Placeholder count:', imgData.placeholderCount);
  console.log('Images found:', imgData.imgCount);
  imgData.imgs.forEach((img) => console.log(`  img src="${img.src}" naturalWidth=${img.naturalWidth}x${img.naturalHeight}`));

  if (imgData.placeholderCount !== 0) {
    throw new Error(`Found ${imgData.placeholderCount} placeholder elements in Section 3!`);
  }
  if (imgData.imgCount !== 8) {
    throw new Error(`Expected 8 ingredient images in Section 3, found ${imgData.imgCount}!`);
  }
  for (const img of imgData.imgs) {
    if (img.naturalWidth <= 0) {
      throw new Error(`Image ${img.src} failed to decode (naturalWidth = 0)!`);
    }
    if (!img.src || !img.src.includes('/assets/ingredients/') || !img.src.endsWith('.webp')) {
      throw new Error(`Image src ${img.src} invalid; must be under /assets/ingredients/ and end in .webp`);
    }
  }

  // Assertion 2: Headline lines font-size within 3% of each other, >= 40px at 1440 wide, no bounding box overlap
  const headlineData = await page.evaluate(() => {
    const lines = Array.from(document.querySelectorAll('.pure-quality .headline-line'));
    return lines.map((el) => {
      const cs = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        text: el.textContent?.trim(),
        fontSize: parseFloat(cs.fontSize),
        box: { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height },
      };
    });
  });

  console.log('\nHeadline lines:');
  headlineData.forEach((h, i) => console.log(`  Line ${i + 1} "${h.text}": fontSize=${h.fontSize.toFixed(2)}px, top=${h.box.top.toFixed(1)}, bottom=${h.box.bottom.toFixed(1)}`));

  if (headlineData.length !== 4) {
    throw new Error(`Expected 4 headline lines, found ${headlineData.length}!`);
  }

  const fontSizes = headlineData.map((h) => h.fontSize);
  const minFont = Math.min(...fontSizes);
  const maxFont = Math.max(...fontSizes);
  const fontDiffPct = ((maxFont - minFont) / minFont) * 100;
  console.log(`Headline font size variance: ${fontDiffPct.toFixed(2)}% (min: ${minFont.toFixed(2)}px, max: ${maxFont.toFixed(2)}px)`);

  if (minFont < 40) {
    throw new Error(`Headline line font size ${minFont}px is less than 40px!`);
  }
  if (fontDiffPct > 3) {
    throw new Error(`Headline line font sizes differ by ${fontDiffPct.toFixed(2)}% (limit is 3%)!`);
  }

  for (let i = 0; i < headlineData.length - 1; i++) {
    const curr = headlineData[i].box;
    const next = headlineData[i + 1].box;
    if (curr.bottom > next.top + 1) {
      throw new Error(`Headline line ${i + 1} overlaps line ${i + 2}! curr.bottom: ${curr.bottom}, next.top: ${next.top}`);
    }
  }
  console.log('Headline bounding box overlap check: NO overlap detected!');

  // Assertion 3: No ingredient bounding box intersects headline block (tolerance 8px)
  const intersectionCheck = await page.evaluate(() => {
    const headEl = document.querySelector('.pure-quality .quality-headline-block');
    if (!headEl) return { foundHead: false };
    const headBox = headEl.getBoundingClientRect();
    const stickers = Array.from(document.querySelectorAll('.pure-quality .ingredient-sticker'));
    const results = stickers.map((el) => {
      const box = el.getBoundingClientRect();
      const tol = 8;
      const overlapX = Math.min(box.right, headBox.right) - Math.max(box.left, headBox.left);
      const overlapY = Math.min(box.bottom, headBox.bottom) - Math.max(box.top, headBox.top);
      const intersects = overlapX > tol && overlapY > tol;
      return {
        className: el.className,
        box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
        intersects,
      };
    });
    return {
      foundHead: true,
      headBox: { left: headBox.left, right: headBox.right, top: headBox.top, bottom: headBox.bottom },
      results,
    };
  });

  console.log('\nHeadline Block Bounding Box:', intersectionCheck.headBox);
  intersectionCheck.results.forEach((r) => {
    console.log(`  ${r.className}: left=${r.box.left.toFixed(1)}, right=${r.box.right.toFixed(1)}, top=${r.box.top.toFixed(1)}, bottom=${r.box.bottom.toFixed(1)} -> intersects: ${r.intersects}`);
    if (r.intersects) {
      throw new Error(`Ingredient ${r.className} intersects headline block with 8px tolerance!`);
    }
  });

  // Assertion 4: Wave proof for Section 3 and Section 4
  console.log('\n--- WAVE PROOF ASSERTIONS ---');

  async function testWave(sectionSelector, seamDescription, colorMatchFn, colorName) {
    console.log(`\nTesting ${seamDescription}...`);
    // Position the seam at y = 120 in viewport so scanning from 60px above section edge is at y = 60
    await page.evaluate((sel) => {
      const sec = document.querySelector(sel);
      if (sec) window.scrollTo(0, sec.offsetTop - 120);
    }, sectionSelector);
    await page.waitForTimeout(500);

    const cols = [0.1, 0.3, 0.5, 0.7, 0.9];
    const width = 1440;

    // Shot 1 at t = 0
    const shot1Buf = await page.screenshot();
    const { data: d1, info: info1 } = await sharp(shot1Buf).raw().toBuffer({ resolveWithObject: true });

    function getPixel(data, info, x, y) {
      const idx = (y * info.width + x) * info.channels;
      return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
    }

    const seamY_t0 = [];
    for (const pct of cols) {
      const x = Math.floor(width * pct);
      let foundY = null;
      // Section edge is at y = 120; scan from 60px above (y = 60) down to y = 140
      for (let y = 60; y <= 180; y++) {
        const p = getPixel(d1, info1, x, y);
        if (colorMatchFn(p)) {
          foundY = y;
          break;
        }
      }
      seamY_t0.push({ pct, x, y: foundY });
    }

    console.log(`Seam Y at t = 0s (target: ${colorName}):`, seamY_t0.map((s) => `${(s.pct * 100).toFixed(0)}%: y=${s.y}`));
    for (const s of seamY_t0) {
      if (s.y === null) throw new Error(`Could not find ${colorName} pixel at column ${(s.pct * 100).toFixed(0)}% for ${seamDescription}!`);
    }

    const minY = Math.min(...seamY_t0.map((s) => s.y));
    const maxY = Math.max(...seamY_t0.map((s) => s.y));
    const variance = maxY - minY;
    console.log(`Variance across columns: ${variance}px (required >= 12px)`);
    if (variance < 12) {
      throw new Error(`${seamDescription} top edge variance ${variance}px is less than required 12px!`);
    }

    // Shot 2 at t = 6s
    console.log('Waiting 6s for wave animation...');
    await page.waitForTimeout(6000);
    const shot2Buf = await page.screenshot();
    const { data: d2, info: info2 } = await sharp(shot2Buf).raw().toBuffer({ resolveWithObject: true });

    const seamY_t6 = [];
    for (const pct of cols) {
      const x = Math.floor(width * pct);
      let foundY = null;
      for (let y = 60; y <= 140; y++) {
        const p = getPixel(d2, info2, x, y);
        if (colorMatchFn(p)) {
          foundY = y;
          break;
        }
      }
      seamY_t6.push({ pct, x, y: foundY });
    }

    console.log(`Seam Y at t = 6s:`, seamY_t6.map((s) => `${(s.pct * 100).toFixed(0)}%: y=${s.y}`));
    const deltas = seamY_t0.map((s, i) => Math.abs((seamY_t6[i].y ?? 0) - (s.y ?? 0)));
    const maxDelta = Math.max(...deltas);
    console.log(`Deltas over 6s:`, deltas, `max delta: ${maxDelta}px (required >= 2px)`);
    if (maxDelta < 2) {
      throw new Error(`${seamDescription} did not animate: max delta over 6s was ${maxDelta}px (< 2px)!`);
    }
  }

  // Section 3: Cream pixel check (G > 180, B > 150, R > 200)
  await testWave('.pure-quality', 'Section 3 Top Wave', (p) => p.r > 200 && p.g > 180 && p.b > 150, 'cream');

  // Section 4: Yellow pixel check (R > 200, G > 140, B < 80)
  await testWave('.story-section', 'Section 4 Top Wave', (p) => p.r > 200 && p.g > 140 && p.b < 80, 'yellow');

  // prefers-reduced-motion check
  console.log('\nTesting under emulated prefers-reduced-motion: reduce...');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    const sec = document.querySelector('.pure-quality');
    if (sec) window.scrollTo(0, sec.offsetTop - 120);
  });
  await page.waitForTimeout(500);

  const reduced1Buf = await page.screenshot();
  const { data: rd1, info: rInfo1 } = await sharp(reduced1Buf).raw().toBuffer({ resolveWithObject: true });
  await page.waitForTimeout(3000);
  const reduced2Buf = await page.screenshot();
  const { data: rd2, info: rInfo2 } = await sharp(reduced2Buf).raw().toBuffer({ resolveWithObject: true });

  let reducedMovement = false;
  const cols = [0.1, 0.3, 0.5, 0.7, 0.9];
  for (const pct of cols) {
    const x = Math.floor(1440 * pct);
    for (let y = 60; y <= 140; y++) {
      const idx = (y * rInfo1.width + x) * rInfo1.channels;
      if (Math.abs(rd1[idx] - rd2[idx]) > 5 || Math.abs(rd1[idx + 1] - rd2[idx + 1]) > 5 || Math.abs(rd1[idx + 2] - rd2[idx + 2]) > 5) {
        reducedMovement = true;
        break;
      }
    }
  }
  console.log('Reduced motion movement detected:', reducedMovement);
  if (reducedMovement) {
    throw new Error('Wave moved under prefers-reduced-motion: reduce!');
  }

  await page.close();
  await browser.close();
  console.log('\n>>> ALL VERIFICATION ASSERTIONS PASSED PERFECTLY! <<<');
} finally {
  if (serverProcess) {
    serverProcess.kill();
  }
}
