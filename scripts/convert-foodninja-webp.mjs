import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = 'public/assets/foodNinja';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

console.log(`Converting ${files.length} foodNinja PNGs to WebP...`);

for (const file of files) {
  const inputPath = path.join(dir, file);
  const outputPath = path.join(dir, file.replace(/\.png$/, '.webp'));
  const originalSize = fs.statSync(inputPath).size;

  await sharp(inputPath)
    .webp({ quality: 85, effort: 6 })
    .toFile(outputPath);

  const newSize = fs.statSync(outputPath).size;
  console.log(`Converted ${file} (${(originalSize / (1024*1024)).toFixed(2)} MB) -> ${(newSize / 1024).toFixed(1)} KB`);
  
  // Remove large original png if > 500KB
  if (originalSize > 500 * 1024) {
    fs.unlinkSync(inputPath);
  }
}

console.log('FoodNinja assets converted successfully!');
