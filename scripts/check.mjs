// Revisión local: capturas (1440 px y iPhone 13, claro/oscuro, ES/EN), enlaces internos,
// prueba sin JS, alt en imágenes, jerarquía de encabezados y errores de consola.
// Uso: python -m http.server 8080 (en otra terminal) y después: node scripts/check.mjs
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:8080';
const PAGES = ['/', '/en/'];
const OUT = '.shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'msedge' });
let problems = 0;
const fail = (m) => { problems++; console.log('✗', m); };

for (const [name, ctxOpts] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['iphone13', devices['iPhone 13']]]) {
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ ...ctxOpts, colorScheme: scheme, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    for (const p of PAGES) {
      const res = await page.goto(BASE + p, { waitUntil: 'networkidle' });
      if (!res.ok()) fail(`${p} → HTTP ${res.status()}`);
      const slug = p.replace(/\//g, '_') || '_';
      await page.screenshot({ path: `${OUT}/${name}-${scheme}${slug}.png`, fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      if (overflow) fail(`${name} ${p}: scroll horizontal`);
    }
    if (errors.length) fail(`${name}/${scheme}: errores de consola: ${errors.join(' | ')}`);
    await ctx.close();
  }
}

// Estructura, enlaces internos y alt (una pasada en escritorio)
const ctx = await browser.newContext();
const page = await ctx.newPage();
const seen = new Set();
for (const p of PAGES) {
  await page.goto(BASE + p, { waitUntil: 'networkidle' });
  const info = await page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    headings: [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => +h.tagName[1]),
    noAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
    lang: document.documentElement.lang,
    links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
    ids: [...document.querySelectorAll('[id]')].map((e) => e.id)
  }));
  if (info.h1 !== 1) fail(`${p}: ${info.h1} h1`);
  info.headings.reduce((prev, h) => { if (h > prev + 1) fail(`${p}: salto de encabezado h${prev}→h${h}`); return h; }, 1);
  if (info.noAlt) fail(`${p}: ${info.noAlt} imágenes sin alt`);
  for (const href of info.links) {
    if (href.startsWith('#')) { if (!info.ids.includes(href.slice(1))) fail(`${p}: ancla rota ${href}`); continue; }
    if (/^(https?:|mailto:)/.test(href)) { seen.add(href); continue; }
    const [path, hash] = href.split('#');
    const r = await page.request.get(BASE + path);
    if (!r.ok()) fail(`${p}: enlace interno roto ${href} (${r.status()})`);
    if (hash && !(await r.text()).includes(`id="${hash}"`)) fail(`${p}: ancla rota ${href}`);
  }
}
await ctx.close();

// Sin JavaScript: el contenido esencial tiene que estar
const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
const np = await nojs.newPage();
await np.goto(BASE + '/', { waitUntil: 'load' });
const cards = await np.locator('.cards .card:visible').count();
const txt = await np.locator('main').innerText();
if (cards < 3 || !txt.includes('Hackea Avilés')) fail('sin JS falta contenido');
await np.screenshot({ path: `${OUT}/nojs-desktop.png`, fullPage: true });
await nojs.close();

// Enlaces externos (HEAD/GET)
const api = await (await browser.newContext()).request;
for (const href of seen) {
  if (href.startsWith('mailto:')) continue;
  try {
    const r = await api.get(href, { timeout: 20000, maxRedirects: 5 });
    const s = r.status();
    if (s >= 400 && !(href.includes('linkedin.com') && s === 999)) fail(`externo ${href} → ${s}`);
    else console.log(`  ${s} ${href}`);
  } catch (e) { fail(`externo ${href} → ${e.message.split('\n')[0]}`); }
}

await browser.close();
console.log(problems ? `\n${problems} problema(s)` : '\n✓ todo correcto');
process.exit(problems ? 1 : 0);
