// Convierte imágenes de proyecto a AVIF, WebP y JPG con dimensiones fijas en assets/img/projects/.
//   node scripts/img.mjs buck                          → materiales/buck/{placa,osciloscopio,plecs}.* a 960×640
//   node scripts/img.mjs <entrada> <nombre> [ancho alto] → assets/img/projects/<nombre>.{avif,webp,jpg} (1440×810)
// Recorta al centro para llenar el tamaño (fit: cover) y quita los metadatos (EXIF, GPS).
import sharp from 'sharp';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'img', 'projects');
mkdirSync(OUT, { recursive: true });

async function convert(input, name, width, height) {
  const base = sharp(input).rotate().resize(width, height, { fit: 'cover', position: 'centre' });
  await base.clone().avif({ quality: 55 }).toFile(join(OUT, `${name}.avif`));
  await base.clone().webp({ quality: 78 }).toFile(join(OUT, `${name}.webp`));
  await base.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(join(OUT, `${name}.jpg`));
  console.log(`✓ ${name} (${width}×${height})`);
}

const [arg, name, w, h] = process.argv.slice(2);
if (!arg) {
  console.error('Uso: node scripts/img.mjs buck  |  node scripts/img.mjs <entrada> <nombre> [ancho alto]');
  process.exit(1);
}
if (arg === 'buck') {
  const dir = join(ROOT, 'materiales', 'buck');
  const files = existsSync(dir) ? readdirSync(dir) : [];
  for (const shot of ['placa', 'osciloscopio', 'plecs']) {
    const file = files.find((f) => parse(f).name.toLowerCase() === shot);
    if (!file) { console.warn(`Falta materiales/buck/${shot}.*`); continue; }
    await convert(join(dir, file), `buck-${shot}`, 960, 640);
  }
} else {
  await convert(arg, name, Number(w) || 1440, Number(h) || 810);
}
