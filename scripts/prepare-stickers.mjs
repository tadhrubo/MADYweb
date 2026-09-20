import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const slots = {
  chicken: 'chicken1.png',
  flatbread: 'flatBread1.png',
  'garlic-sauce': 'garlicSauce.png',
  lettuce: 'lettuce1.png',
  pickles: 'pickle1.png',
  chili: 'redChilli.png',
  'red-onion': 'redonion.png',
  tomato: 'tomato1.png',
};

const sourceDir = 'asset/ingredients';
const cutoutDir = path.join(sourceDir, 'cutouts');
const publicDir = 'public/assets/ingredients';
const screenshotDir = 'screenshots';

async function exists(file) {
  try { await fs.access(file); return true; } catch { return false; }
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function sampleRing(data, info, ring = 8) {
  const rs = [], gs = [], bs = [];
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (x >= ring && y >= ring && x < info.width - ring && y < info.height - ring) continue;
      const i = (y * info.width + x) * info.channels;
      rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2]);
    }
  }
  return { r: median(rs), g: median(gs), b: median(bs) };
}

function dist(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function fallbackCutout(data, info, color) {
  const { width, height, channels } = info;
  const total = width * height;
  const reachable = new Uint8Array(total);
  const queue = [];

  const canPass = (p) => {
    const i = p * channels;
    return dist(data[i], data[i + 1], data[i + 2], color.r, color.g, color.b) <= 34;
  };

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (reachable[p]) return;
    if (!canPass(p)) return;
    reachable[p] = 1;
    queue.push(p);
  };

  for (let x = 0; x < width; x++) { push(x, 0); push(x, height - 1); }
  for (let y = 0; y < height; y++) { push(0, y); push(width - 1, y); }

  for (let q = 0; q < queue.length; q++) {
    const p = queue[q], x = p % width, y = Math.floor(p / width);
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }

  const alpha = new Uint8Array(total);
  for (let p = 0; p < total; p++) {
    if (!reachable[p]) {
      alpha[p] = 255;
    } else {
      const i = p * channels;
      const d = dist(data[i], data[i + 1], data[i + 2], color.r, color.g, color.b);
      if (d <= 14) {
        alpha[p] = 0;
      } else {
        alpha[p] = Math.round(Math.min(1, (d - 14) / 20) * 255);
      }
    }
  }

  // Erode alpha by 1px
  const eroded = new Uint8Array(alpha);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      if (alpha[p] === 0) continue;
      const minA = Math.min(alpha[p - 1], alpha[p + 1], alpha[p - width], alpha[p + width]);
      if (minA === 0) {
        eroded[p] = 0;
      } else if (minA < alpha[p]) {
        eroded[p] = minA;
      }
    }
  }

  const out = Buffer.alloc(total * 4);
  for (let p = 0; p < total; p++) {
    const i = p * channels;
    const o = p * 4;
    out[o] = data[i];
    out[o + 1] = data[i + 1];
    out[o + 2] = data[i + 2];
    out[o + 3] = eroded[p];
  }

  return sharp(out, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

async function transparentPct(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let transparent = 0;
  for (let i = 3; i < data.length; i += info.channels) {
    if (data[i] < 250) transparent++;
  }
  return transparent / (info.width * info.height);
}

async function addDieCutStickerBorder(trimmedBuffer) {
  const trimmed = sharp(trimmedBuffer).ensureAlpha();
  const { data: trimmedData, info: trimmedInfo } = await trimmed.raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = trimmedInfo;

  const border = Math.max(3, Math.round(Math.max(W, H) * 0.018));
  const pad = border + 4;
  const paddedW = W + pad * 2;
  const paddedH = H + pad * 2;

  // Extract padded alpha channel
  const paddedAlpha = Buffer.alloc(paddedW * paddedH);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const srcI = (y * W + x) * 4 + 3;
      const dstI = (y + pad) * paddedW + (x + pad);
      paddedAlpha[dstI] = trimmedData[srcI];
    }
  }

  // Blur alpha and threshold at 1 to build white silhouette
  // Note: extractChannel(0) ensures 1 channel raw output
  const blurredRes = await sharp(paddedAlpha, { raw: { width: paddedW, height: paddedH, channels: 1 } })
    .blur(border)
    .threshold(1)
    .extractChannel(0)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const silhouetteMask = blurredRes.data;

  // 1px hairline outside white silhouette (#E3DCD0)
  const hairlineMask = new Uint8Array(paddedW * paddedH);
  for (let y = 1; y < paddedH - 1; y++) {
    for (let x = 1; x < paddedW - 1; x++) {
      const p = y * paddedW + x;
      if (silhouetteMask[p] === 0) {
        if (
          silhouetteMask[p - 1] === 255 || silhouetteMask[p + 1] === 255 ||
          silhouetteMask[p - paddedW] === 255 || silhouetteMask[p + paddedW] === 255 ||
          silhouetteMask[p - paddedW - 1] === 255 || silhouetteMask[p - paddedW + 1] === 255 ||
          silhouetteMask[p + paddedW - 1] === 255 || silhouetteMask[p + paddedW + 1] === 255
        ) {
          hairlineMask[p] = 1;
        }
      }
    }
  }

  // Construct RGBA buffer for border + hairline
  const bgSilhouette = Buffer.alloc(paddedW * paddedH * 4);
  for (let p = 0; p < paddedW * paddedH; p++) {
    const o = p * 4;
    if (silhouetteMask[p] === 255) {
      bgSilhouette[o] = 255;
      bgSilhouette[o + 1] = 255;
      bgSilhouette[o + 2] = 255;
      bgSilhouette[o + 3] = 255;
    } else if (hairlineMask[p] === 1) {
      // #E3DCD0
      bgSilhouette[o] = 0xE3;
      bgSilhouette[o + 1] = 0xDC;
      bgSilhouette[o + 2] = 0xD0;
      bgSilhouette[o + 3] = 255;
    }
  }

  const trimmedPng = await sharp(trimmedData, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();

  const composited = await sharp(bgSilhouette, { raw: { width: paddedW, height: paddedH, channels: 4 } })
    .composite([{ input: trimmedPng, left: pad, top: pad }])
    .png()
    .toBuffer();

  return sharp(composited)
    .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88, alphaQuality: 92 })
    .toBuffer();
}

async function makeSticker(slot, sourceFile) {
  const source = path.join(sourceDir, sourceFile);
  const handmade = path.join(cutoutDir, `${slot}.png`);

  if (!(await exists(source))) {
    console.error(`Missing source file for slot "${slot}": ${source}`);
    process.exit(1);
  }

  let cutoutBuffer;
  let method = 'handmade cutout';

  if (await exists(handmade)) {
    cutoutBuffer = await fs.readFile(handmade);
  } else {
    const img = sharp(source).ensureAlpha();
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    let alphaPixels = 0;
    for (let i = 3; i < data.length; i += info.channels) {
      if (data[i] < 250) alphaPixels++;
    }

    if (alphaPixels / (info.width * info.height) >= 0.02) {
      cutoutBuffer = await img.png().toBuffer();
      method = 'source transparency';
    } else {
      let bgRemovalModule = null;
      try {
        bgRemovalModule = await import('@imgly/background-removal-node');
      } catch {}

      if (bgRemovalModule && bgRemovalModule.removeBackground) {
        try {
          const blob = await bgRemovalModule.removeBackground(source);
          const arrayBuffer = await blob.arrayBuffer();
          cutoutBuffer = Buffer.from(arrayBuffer);
          method = '@imgly/background-removal-node';
        } catch {
          bgRemovalModule = null;
        }
      }

      if (!cutoutBuffer) {
        const color = sampleRing(data, info);
        cutoutBuffer = await fallbackCutout(data, info, color);
        method = 'fallback (flood-fill)';
      }

      await fs.mkdir(cutoutDir, { recursive: true });
      await fs.writeFile(handmade, cutoutBuffer);
    }
  }

  await fs.mkdir(publicDir, { recursive: true });
  // Trim transparent margins
  const trimmed = await sharp(cutoutBuffer)
    .ensureAlpha()
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 4 })
    .png()
    .toBuffer();

  const finalWebp = await addDieCutStickerBorder(trimmed);
  const outPath = path.join(publicDir, `${slot}.webp`);
  await fs.writeFile(outPath, finalWebp);

  const meta = await sharp(finalWebp).metadata();
  const pct = await transparentPct(finalWebp);

  return {
    slot,
    source: sourceFile,
    method,
    dimensions: `${meta.width}x${meta.height}`,
    transparent: `${(pct * 100).toFixed(1)}%`,
    suspicious: (pct < 0.25 || pct > 0.92) ? 'FLAGGED' : 'OK'
  };
}

// Ensure directories
await fs.mkdir(screenshotDir, { recursive: true });
await fs.mkdir(publicDir, { recursive: true });

const rows = [];
for (const [slot, source] of Object.entries(slots)) {
  rows.push(await makeSticker(slot, source));
}

console.table(rows);

// Generate contact sheet: all eight on the cream color (#F6E3C8), 4x2 grid
const thumbs = await Promise.all(
  rows.map((row) =>
    sharp(path.join(publicDir, `${row.slot}.webp`))
      .resize({ width: 260, height: 220, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()
  )
);

const labels = rows
  .map(
    (row, i) =>
      `<text x="${(i % 4) * 320 + 160}" y="${Math.floor(i / 4) * 290 + 268}" text-anchor="middle" font-family="Arial" font-weight="700" font-size="22" fill="#E41B23">${row.slot}</text>`
  )
  .join('');

const base = sharp({
  create: {
    width: 1280,
    height: 580,
    channels: 4,
    background: '#F6E3C8',
  },
});

await base
  .composite([
    ...thumbs.map((input, i) => ({
      input,
      left: (i % 4) * 320 + 30,
      top: Math.floor(i / 4) * 290 + 24,
    })),
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="580">${labels}</svg>`),
      left: 0,
      top: 0,
    },
  ])
  .png()
  .toFile(path.join(screenshotDir, 'stickers-contact-sheet.png'));

console.log('Contact sheet saved to screenshots/stickers-contact-sheet.png');
