import { chromium } from 'playwright';
import sharp from 'sharp';
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';

function checkServer(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => resolve(res.statusCode === 200)).on('error', () => resolve(false));
  });
}

async function ensureServer() {
  const url = 'http://127.0.0.1:4173/';
  if (await checkServer(url)) return null;

  console.log('Starting vite preview server on port 4173...');
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
  throw new Error('Preview server failed to start in time');
}

fs.mkdirSync('screenshots', { recursive: true });

const serverProcess = await ensureServer();

try {
  console.log('\n=== SECTION 4 PLAYWRIGHT VERIFICATION SUITE ===');
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 }
  ];

  console.log('\n--- 1. VIEWPORT SCREENSHOTS & RESPONSIVE ASSERTIONS ---');
  for (const { width, height } of viewports) {
    const page = await browser.newPage({ viewport: { width, height } });
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    // Scroll directly to Section 4
    await page.evaluate(() => {
      const el = document.querySelector('.story-section');
      if (el) el.scrollIntoView({ behavior: 'instant' });
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
      throw new Error(`Horizontal scroll at ${width}x${height}: scrollWidth ${docScrollWidth} > innerWidth ${winInnerWidth}`);
    }
    if (consoleErrors.length > 0) {
      throw new Error(`Console errors at ${width}x${height}: ${JSON.stringify(consoleErrors)}`);
    }

    const screenshotPath = `screenshots/section4-${width}x${height}.png`;
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved screenshot: ${screenshotPath}`);

    await page.close();
  }

  console.log('\n--- 2. SECTION 4 CONTENT ASSERTIONS (1440x900) ---');
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    document.querySelector('.story-section')?.scrollIntoView({ behavior: 'instant' });
  });
  await page.mouse.move(5, 5);
  await page.waitForTimeout(1200);

  // Assertion 1: Six <img> elements in Section 4 each with naturalWidth > 0
  const imagesReport = await page.evaluate(() => {
    const sec = document.querySelector('.story-section');
    if (!sec) return { foundSection: false, count: 0, list: [] };
    const imgs = Array.from(sec.querySelectorAll('img'));
    return {
      foundSection: true,
      count: imgs.length,
      list: imgs.map((img) => ({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt'),
        className: img.className,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      }))
    };
  });

  console.log(`Found ${imagesReport.count} images in Section 4:`);
  imagesReport.list.forEach((img, i) => {
    console.log(`  ${i + 1}. [${img.className}] src="${img.src}" (${img.naturalWidth}x${img.naturalHeight}) alt="${img.alt}"`);
  });

  if (imagesReport.count !== 6) {
    throw new Error(`Expected exactly 6 images in Section 4, found ${imagesReport.count}`);
  }
  for (const img of imagesReport.list) {
    if (!img.naturalWidth || img.naturalWidth <= 0) {
      throw new Error(`Image ${img.src} has naturalWidth <= 0 (failed to decode)!`);
    }
  }
  console.log('[PASS] All six <img> elements have naturalWidth > 0.');

  // Assertion 2: Three doodle images have transparent src (confirm alpha channel preserved in final element)
  console.log('\n--- 3. DOODLE TRANSPARENCY ASSERTION ---');
  const doodleAlphaReport = await page.evaluate(() => {
    const doodleImgs = Array.from(document.querySelectorAll('.story-section .story-doodle-img'));
    return doodleImgs.map((img) => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(img.naturalWidth, 300);
      canvas.height = Math.min(img.naturalHeight, 300);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let transparentPixels = 0;
      const total = canvas.width * canvas.height;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 250) transparentPixels++;
      }
      return {
        src: img.getAttribute('src'),
        totalSampled: total,
        transparentPixels,
        transparencyPct: (transparentPixels / total) * 100
      };
    });
  });

  console.log('Doodle in-browser alpha channel analysis:');
  doodleAlphaReport.forEach((d, i) => {
    console.log(`  ${i + 1}. ${d.src} -> ${d.transparencyPct.toFixed(2)}% transparent pixels in rendered canvas`);
  });

  if (doodleAlphaReport.length !== 3) {
    throw new Error(`Expected 3 doodle images, found ${doodleAlphaReport.length}`);
  }
  for (const d of doodleAlphaReport) {
    if (d.transparencyPct < 2.0) {
      throw new Error(`Doodle image ${d.src} does not have a transparent alpha channel (${d.transparencyPct.toFixed(2)}% < 2%)!`);
    }
  }
  console.log('[PASS] All three doodle images have confirmed preserved alpha channels.');

  // Assertion 3: Connector line's bounding box top within 20px of Card 1 bottom, and bottom within 20px of Card 3 top
  console.log('\n--- 4. CONNECTOR LINE BOUNDING BOX ASSERTION ---');
  const connectorReport = await page.evaluate(() => {
    const conn = document.querySelector('.story-connector-line');
    const card1 = document.querySelector('.story-row-grill .story-card');
    const card3 = document.querySelector('.story-row-bite .story-card');

    if (!conn || !card1 || !card3) {
      return { error: 'Missing elements', hasConn: !!conn, hasCard1: !!card1, hasCard3: !!card3 };
    }

    const connRect = conn.getBoundingClientRect();
    const card1Rect = card1.getBoundingClientRect();
    const card3Rect = card3.getBoundingClientRect();

    const topDiff = Math.abs(connRect.top - card1Rect.bottom);
    const bottomDiff = Math.abs(connRect.bottom - card3Rect.top);

    return {
      connBox: { top: connRect.top, bottom: connRect.bottom, height: connRect.height },
      card1Bottom: card1Rect.bottom,
      card3Top: card3Rect.top,
      topDiff,
      bottomDiff
    };
  });

  console.log('Connector Measurements:');
  console.log(`  Card 1 Bottom: ${connectorReport.card1Bottom.toFixed(2)}px`);
  console.log(`  Connector Top: ${connectorReport.connBox.top.toFixed(2)}px (Diff: ${connectorReport.topDiff.toFixed(2)}px, tolerance 20px)`);
  console.log(`  Card 3 Top: ${connectorReport.card3Top.toFixed(2)}px`);
  console.log(`  Connector Bottom: ${connectorReport.connBox.bottom.toFixed(2)}px (Diff: ${connectorReport.bottomDiff.toFixed(2)}px, tolerance 20px)`);

  if (connectorReport.topDiff > 20) {
    throw new Error(`Connector top diff ${connectorReport.topDiff}px exceeds 20px threshold!`);
  }
  if (connectorReport.bottomDiff > 20) {
    throw new Error(`Connector bottom diff ${connectorReport.bottomDiff}px exceeds 20px threshold!`);
  }
  console.log('[PASS] Connector line strictly spans between Card 1 bottom and Card 3 top within 20px.');

  // Assertion 4: Section 4's top wave is wavy (seam y values differ by at least 12px across 5 columns)
  console.log('\n--- 5. SECTION 4 TOP WAVE WAVINESS ASSERTION ---');
  await page.evaluate(() => {
    const sec = document.querySelector('.story-section');
    if (sec) window.scrollTo(0, sec.offsetTop - 120);
  });
  await page.waitForTimeout(600);

  const shotBuf = await page.screenshot();
  const { data: imgData, info: imgInfo } = await sharp(shotBuf).raw().toBuffer({ resolveWithObject: true });

  function getPixel(data, info, x, y) {
    const idx = (y * info.width + x) * info.channels;
    return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
  }

  // Section 4 wave color is yellow: R > 200, G > 140, B < 80
  const cols = [0.1, 0.3, 0.5, 0.7, 0.9];
  const seamY = [];
  for (const pct of cols) {
    const x = Math.floor(1440 * pct);
    let foundY = null;
    for (let y = 60; y <= 180; y++) {
      const p = getPixel(imgData, imgInfo, x, y);
      if (p.r > 200 && p.g > 140 && p.b < 80) {
        foundY = y;
        break;
      }
    }
    seamY.push({ pct, x, y: foundY });
  }

  console.log('Section 4 Seam Y values across columns:', seamY.map((s) => `${(s.pct * 100).toFixed(0)}%: y=${s.y}`));
  for (const s of seamY) {
    if (s.y === null) throw new Error(`Could not find yellow wave pixel at column ${(s.pct * 100).toFixed(0)}%!`);
  }

  const minY = Math.min(...seamY.map((s) => s.y));
  const maxY = Math.max(...seamY.map((s) => s.y));
  const waveVariance = maxY - minY;
  console.log(`Wave Y Variance: ${waveVariance}px (required >= 12px)`);

  if (waveVariance < 12) {
    throw new Error(`Section 4 top wave variance ${waveVariance}px is less than required 12px!`);
  }
  console.log('[PASS] Section 4 top wave is verified wavy (variance >= 12px).');

  await page.close();
  await browser.close();
  console.log('\n>>> ALL SECTION 4 ASSERTIONS PASSED WITH REAL MEASUREMENTS! <<<');
} finally {
  if (serverProcess) {
    serverProcess.kill();
  }
}
