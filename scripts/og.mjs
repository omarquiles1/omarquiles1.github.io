// Genera imágenes: foto (AVIF/WebP/JPG), favicons PNG e imágenes Open Graph 1200×630.
// Uso: node scripts/og.mjs   (necesita materiales/avatar.jpg y las devDependencies)
import sharp from 'sharp';
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const profile = JSON.parse(readFileSync(join(ROOT, 'data/profile.json'), 'utf8'));
const src = join(ROOT, 'materiales/avatar.jpg');

if (existsSync(src)) {
  for (const w of [320, 460]) {
    const base = sharp(src).resize(w, w, { fit: 'cover' });
    await base.clone().avif({ quality: 55 }).toFile(join(ROOT, `assets/img/omar-${w}.avif`));
    await base.clone().webp({ quality: 78 }).toFile(join(ROOT, `assets/img/omar-${w}.webp`));
    await base.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(join(ROOT, `assets/img/omar-${w}.jpg`));
  }
  console.log('✓ foto');
} else console.warn('! falta materiales/avatar.jpg');

const svg = readFileSync(join(ROOT, 'favicon.svg'));
await sharp(svg, { density: 300 }).resize(32, 32).png().toFile(join(ROOT, 'favicon-32.png'));
await sharp(svg, { density: 600 }).resize(180, 180).flatten({ background: '#F6F4EE' }).png().toFile(join(ROOT, 'apple-touch-icon.png'));
console.log('✓ favicons');

const font = (f) => 'data:font/woff2;base64,' + readFileSync(join(ROOT, 'assets/fonts', f)).toString('base64');
const photo = existsSync(join(ROOT, 'assets/img/omar-460.jpg')) ? 'data:image/jpeg;base64,' + readFileSync(join(ROOT, 'assets/img/omar-460.jpg')).toString('base64') : '';
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'msedge' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const L of ['es', 'en']) {
  const html = `<!doctype html><meta charset="utf-8"><style>
    @font-face{font-family:S;src:url(${font('plex-sans-400.woff2')})}
    @font-face{font-family:S;font-weight:600;src:url(${font('plex-sans-600.woff2')})}
    @font-face{font-family:M;src:url(${font('plex-mono-500.woff2')})}
    *{margin:0;box-sizing:border-box}
    body{width:1200px;height:630px;background:#F6F4EE;color:#1B2430;font-family:S;
      background-image:linear-gradient(rgba(11,110,153,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(11,110,153,.11) 1px,transparent 1px),
      linear-gradient(rgba(11,110,153,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(11,110,153,.06) 1px,transparent 1px);
      background-size:100px 100px,100px 100px,20px 20px,20px 20px;padding:64px 72px;display:grid;grid-template-columns:1fr 300px;gap:56px;align-items:center;position:relative}
    .eb{font-family:M;font-size:22px;letter-spacing:.08em;text-transform:uppercase;color:#0B6E99;margin-bottom:22px}
    h1{font-size:76px;line-height:1.05;letter-spacing:-.02em;font-weight:600;margin-bottom:26px}
    p{text-wrap:balance;font-size:29px;line-height:1.4;color:#4A5563}
    img{width:300px;height:300px;border-radius:50%;border:2px solid #1B2430;padding:8px;background:#FCFBF7;object-fit:cover}
    .caj{position:absolute;left:72px;right:72px;bottom:36px;border-top:2px solid #1B2430;padding-top:12px;font-family:M;font-size:20px;color:#4A5563;display:flex;justify-content:space-between}
  </style><body>
    <div><div class="eb">${L === 'es' ? 'Ingeniería · fluidos · hardware · software' : 'Engineering · fluids · hardware · software'}</div>
    <h1>${profile.name}</h1><p>${L === 'es' ? 'Ingeniería en Tecnologías Industriales · Investigación en aerogeneradores de eje vertical (IUTA) · IA aplicada' : 'Industrial Technologies Engineering · Vertical axis wind turbine research (IUTA) · Applied AI'}</p></div>
    ${photo ? `<img src="${photo}" alt="">` : '<div></div>'}
    <div class="caj"><span>omarquiles1.github.io</span><span>OQ · 1:1</span></div>
  </body>`;
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(ROOT, `assets/og/og-${L}.png`) });
  console.log(`✓ og-${L}.png`);
}
await browser.close();
