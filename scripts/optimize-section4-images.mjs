import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = 'public/assets/section4/photos';
const files = ['grill-photo.jpg', 'roll-photo.jpg', 'fardin_box.jpg', 'bite-photo.jpg'];

async function run() {
  const placeholders = {};

  for (const file of files) {
    const inputPath = path.join(dir, file);
    if (!fs.existsSync(inputPath)) continue;

    const name = path.parse(file).name;
    const outputPath = path.join(dir, `${name}.webp`);

    // 1. Optimize to WebP (max width 1200px for sharp retina display)
    const info = await sharp(inputPath)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 84, effort: 6 })
      .toFile(outputPath);

    const oldStat = fs.statSync(inputPath);
    const newStat = fs.statSync(outputPath);
    console.log(`${file}: ${(oldStat.size / 1024).toFixed(1)} KB -> ${name}.webp: ${(newStat.size / 1024).toFixed(1)} KB (${Math.round((1 - newStat.size / oldStat.size) * 100)}% reduction)`);

    // 2. Generate tiny base64 blur placeholder (20x13 px blurred WebP)
    const blurBuffer = await sharp(inputPath)
      .resize(20, 13, { fit: 'cover' })
      .blur(2)
      .webp({ quality: 20 })
      .toBuffer();

    placeholders[name] = `data:image/webp;base64,${blurBuffer.toString('base64')}`;
  }

  // Save blur placeholders to a JSON file for import
  fs.writeFileSync('src/data/storyBlurData.json', JSON.stringify(placeholders, null, 2));
  console.log('Saved blur placeholders to src/data/storyBlurData.json');
}

run().catch(console.error);
