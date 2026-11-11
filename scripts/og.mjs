// Genera imágenes: foto (AVIF/WebP/JPG), miniaturas de proyectos, favicons PNG e imágenes Open Graph 1200×630.
// Uso: node scripts/og.mjs   (necesita materiales/ y las devDependencies)
import sharp from 'sharp';
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const profile = JSON.parse(readFileSync(join(ROOT, 'data/profile.json'), 'utf8'));
const mat = (f) => join(ROOT, 'materiales', f);

if (existsSync(mat('avatar.jpg'))) {
  for (const w of [320, 460]) {
    const base = sharp(mat('avatar.jpg')).resize(w, w, { fit: 'cover' });
    await base.clone().avif({ quality: 55 }).toFile(join(ROOT, `assets/img/omar-${w}.avif`));
    await base.clone().webp({ quality: 78 }).toFile(join(ROOT, `assets/img/omar-${w}.webp`));
    await base.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(join(ROOT, `assets/img/omar-${w}.jpg`));
  }
  console.log('✓ foto');
} else console.warn('! falta materiales/avatar.jpg');

// Miniaturas 720×405 de capturas de webs públicas (materiales/<nombre>.png)
for (const name of ['mapaviles-panel']) {
  if (!existsSync(mat(`${name}.png`))) { console.warn(`! falta materiales/${name}.png`); continue; }
  const base = sharp(mat(`${name}.png`)).resize(720, 405, { fit: 'cover', position: 'top' });
  await base.clone().avif({ quality: 50 }).toFile(join(ROOT, `assets/img/${name}.avif`));
  await base.clone().webp({ quality: 74 }).toFile(join(ROOT, `assets/img/${name}.webp`));
  await base.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(join(ROOT, `assets/img/${name}.jpg`));
  console.log(`✓ ${name}`);
}

const svg = readFileSync(join(ROOT, 'favicon.svg'));
await sharp(svg, { density: 300 }).resize(32, 32).png().toFile(join(ROOT, 'favicon-32.png'));
await sharp(svg, { density: 600 }).resize(180, 180).png().toFile(join(ROOT, 'apple-touch-icon.png'));
console.log('✓ favicons');

const b64 = (p, type) => `data:${type};base64,` + readFileSync(p).toString('base64');
const font = (f) => b64(join(ROOT, 'assets/fonts', f), 'font/woff2');
const photo = b64(join(ROOT, 'assets/img/omar-460.jpg'), 'image/jpeg');
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'msedge' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const L of ['es', 'en']) {
  const html = `<!doctype html><meta charset="utf-8"><style>
    @font-face{font-family:D;font-weight:800;src:url(${font('sora-800.woff2')})}
    @font-face{font-family:S;src:url(${font('plex-sans-400.woff2')})}
    @font-face{font-family:S;font-weight:600;src:url(${font('plex-sans-600.woff2')})}
    *{margin:0;box-sizing:border-box}
    body{width:1200px;height:630px;overflow:hidden;color:#E8EEF6;font-family:S;background:radial-gradient(900px 500px at 78% 45%,#16294A 0%,#0B1424 62%);
      padding:0 80px;display:grid;grid-template-columns:1fr 330px;gap:60px;align-items:center;position:relative}
    .hi{font-weight:600;font-size:26px;color:#38BDF8;margin-bottom:14px}
    h1{font-family:D;font-weight:800;font-size:92px;line-height:.95;letter-spacing:-.045em;color:#fff;margin-bottom:26px}
    p{text-wrap:balance;font-size:28px;line-height:1.38;color:#A3B1C6}
    .ring{width:330px;height:330px;border-radius:50%;padding:9px;background:conic-gradient(from 200deg,#FB923C,#FDBA74,#38BDF8,#FB923C)}
    img{width:100%;height:100%;border-radius:50%;border:7px solid #0B1424;object-fit:cover;background:#fff}
    .bar{position:absolute;left:0;right:0;bottom:0;height:10px;background:linear-gradient(90deg,#FB923C,#38BDF8)}
    .tag{position:absolute;left:80px;bottom:44px;display:flex;gap:14px;align-items:center;font-weight:600;font-size:22px;color:#fff}
    .tag b{display:inline-grid;place-items:center;width:42px;height:42px;border-radius:11px;background:#FB923C;color:#1A0C02;font-family:D;font-size:17px}
  </style><body>
    <div><div class="hi">${profile.greeting[L]}</div>
    <h1>Omar<br>Quiles García</h1><p>${L === 'es' ? 'Ingeniería Industrial · Investigación en aerogeneradores de eje vertical (IUTA) · Ganador de Hackea Avilés 2026' : 'Industrial Engineering · Vertical axis wind turbine research (IUTA) · Hackea Avilés 2026 winner'}</p></div>
    <div class="ring"><img src="${photo}" alt=""></div>
    <div class="tag"><b>OQ</b>omarquiles1.github.io</div><div class="bar"></div>
  </body>`;
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(ROOT, `assets/og/og-${L}.png`) });
  console.log(`✓ og-${L}.png`);
}
await browser.close();
