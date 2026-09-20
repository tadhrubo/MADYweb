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

function std(values, avg) {
  return Math.sqrt(values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / Math.max(1, values.length));
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
  const color = { r: median(rs), g: median(gs), b: median(bs) };
  const stats = {
    r: Number(std(rs, color.r).toFixed(2)),
    g: Number(std(gs, color.g).toFixed(2)),
    b: Number(std(bs, color.b).toFixed(2)),
  };
  return { color, stats };
}

function dist(data, i, color) {
  return Math.sqrt((data[i] - color.r) ** 2 + (data[i + 1] - color.g) ** 2 + (data[i + 2] - color.b) ** 2);
}

function fallbackCutout(data, info, color) {
  const { width, height, channels } = info;
  const total = width * height;
  const reachable = new Uint8Array(total);
  const queue = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (reachable[p]) return;
    const i = p * channels;
    if (dist(data, i, color) > 34) return;
    reachable[p] = 1;
    queue.push(p);
  };
  for (let x = 0; x < width; x++) { push(x, 0); push(x, height - 1); }
  for (let y = 0; y < height; y++) { push(0, y); push(width - 1, y); }
  for (let q = 0; q < queue.length; q++) {
    const p = queue[q], x = p % width, y = Math.floor(p / width);
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }

  const out = Buffer.alloc(total * 4);
  for (let p = 0; p < total; p++) {
    const i = p * channels;
    const o = p * 4;
    const d = dist(data, i, color);
    let alpha = 255;
    if (reachable[p]) alpha = d <= 14 ? 0 : Math.round(Math.min(1, (d - 14) / 20) * 255);
    out[o] = Math.min(255, Math.round(data[i] * (alpha / 255) + 255 * (1 - alpha / 255) * 0.22));
    out[o + 1] = Math.min(255, Math.round(data[i + 1] * (alpha / 255) + 255 * (1 - alpha / 255) * 0.22));
    out[o + 2] = Math.min(255, Math.round(data[i + 2] * (alpha / 255) + 255 * (1 - alpha / 255) * 0.22));
    out[o + 3] = alpha;
  }

  const eroded = Buffer.from(out);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      const o = p * 4 + 3;
      if (out[o] === 0) continue;
      let minA = 255;
      for (const n of [p - width, p + width, p - 1, p + 1]) minA = Math.min(minA, out[n * 4 + 3]);
      if (minA < 255) eroded[o] = Math.max(0, Math.min(out[o], minA + 64) - 16);
    }
  }
  return sharp(eroded, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

async function transparentPct(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let transparent = 0;
  for (let i = 3; i < data.length; i += info.channels) if (data[i] < 250) transparent++;
  return transparent / (info.width * info.height);
}

async function makeSticker(slot, sourceFile) {
  const source = path.join(sourceDir, sourceFile);
  const handmade = path.join(cutoutDir, `${slot}.png`);
  if (!(await exists(source))) throw new Error(`Missing source for ${slot}: ${sourceFile}`);

  let cutoutBuffer;
  let method = 'handmade cutout';
  let ringStats = '';
  if (await exists(handmade)) {
    cutoutBuffer = await fs.readFile(handmade);
  } else {
    const img = sharp(source).ensureAlpha();
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    let alphaPixels = 0;
    for (let i = 3; i < data.length; i += info.channels) if (data[i] < 250) alphaPixels++;
    if (alphaPixels / (info.width * info.height) >= 0.02) {
      cutoutBuffer = await img.png().toBuffer();
      method = 'source transparency';
    } else {
      const { color, stats } = sampleRing(data, info);
      ringStats = ` std rgb ${stats.r}/${stats.g}/${stats.b}`;
      cutoutBuffer = await fallbackCutout(data, info, color);
      method = `local flood-fill${ringStats}`;
      await fs.mkdir(cutoutDir, { recursive: true });
      await fs.writeFile(handmade, cutoutBuffer);
    }
  }

  await fs.mkdir(publicDir, { recursive: true });
  const trimmed = sharp(cutoutBuffer).ensureAlpha().trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 });
  const { data: trimmedPng, info } = await trimmed.png().toBuffer({ resolveWithObject: true });
  const border = Math.max(3, Math.round(Math.max(info.width, info.height) * 0.018));
  const hairline = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${info.width + border * 2}" height="${info.height + border * 2}"><rect x="0.5" y="0.5" width="${info.width + border * 2 - 1}" height="${info.height + border * 2 - 1}" rx="${border * 1.6}" fill="white" stroke="#E3DCD0"/></svg>`);
  const final = await sharp({ create: { width: info.width + border * 2, height: info.height + border * 2, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: hairline, left: 0, top: 0 }, { input: trimmedPng, left: border, top: border }])
    .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88, alphaQuality: 92 })
    .toBuffer();
  const out = path.join(publicDir, `${slot}.webp`);
  await fs.writeFile(out, final);
  const meta = await sharp(final).metadata();
  const pct = await transparentPct(final);
  return { slot, source: sourceFile, method, dimensions: `${meta.width}x${meta.height}`, transparent: `${(pct * 100).toFixed(1)}%`, suspicious: pct < 0.25 || pct > 0.92 ? 'YES' : '' };
}

await fs.mkdir(screenshotDir, { recursive: true });
const rows = [];
for (const [slot, source] of Object.entries(slots)) rows.push(await makeSticker(slot, source));
console.table(rows);

const thumbs = await Promise.all(rows.map((row) => sharp(path.join(publicDir, `${row.slot}.webp`)).resize({ width: 260, height: 220, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()));
const labels = rows.map((row, i) => `<text x="${(i % 4) * 320 + 160}" y="${Math.floor(i / 4) * 290 + 268}" text-anchor="middle" font-family="Arial" font-weight="700" font-size="24" fill="#E41B23">${row.slot}</text>`).join('');
const base = sharp({ create: { width: 1280, height: 580, channels: 4, background: '#F6E3C8' } });
await base.composite([
  ...thumbs.map((input, i) => ({ input, left: (i % 4) * 320 + 30, top: Math.floor(i / 4) * 290 + 24 })),
  { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="580">${labels}</svg>`), left: 0, top: 0 },
]).png().toFile(path.join(screenshotDir, 'stickers-contact-sheet.png'));
