// Genera las páginas estáticas a partir de data/*.json.
// Uso: node scripts/render.mjs   (sin dependencias; GitHub Pages sirve el resultado tal cual)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = (f) => JSON.parse(readFileSync(join(ROOT, 'data', f), 'utf8'));
const profile = load('profile.json');
const exp = load('experience.json');
const proj = load('projects.json');
const press = load('press.json');
const stack = load('stack.json');

const SITE = profile.site;
const YEAR = new Date().getFullYear();

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ext = (href) => /^https?:/.test(href) && !href.startsWith(SITE);
const a = (href, label, cls = '', extra = '') =>
  `<a href="${esc(href)}"${cls ? ` class="${cls}"` : ''}${ext(href) ? ' rel="noopener"' : ''}${extra}>${label}</a>`;

const UI = {
  es: {
    nav: [['sobre-mi', 'Sobre mí'], ['investigacion', 'Investigación'], ['proyectos', 'Proyectos'], ['experiencia', 'Experiencia']],
    skip: 'Saltar al contenido', menu: 'Secciones', theme: 'Cambiar tema claro/oscuro', langSwitch: 'Idioma',
    ctaProjects: 'Ver proyectos', ctaCv: 'Descargar CV', ctaContact: 'Contacto',
    sec: { about: 'Sobre mí', research: 'Investigación', projects: 'Proyectos', lab: 'Lo que estoy construyendo', exp: 'Experiencia', edu: 'Formación', career: 'Trayectoria', press: 'Prensa y reconocimientos', stack: 'Herramientas', contact: 'Contacto' },
    lead: {
      research: 'Mi trabajo actual como becario en el grupo FERES del IUTA.',
      projects: 'Proyectos de energía, hardware, software e instalaciones.',
      lab: 'Mi laboratorio personal: ideas que estoy construyendo ahora mismo.',
      career: 'Dónde he trabajado y dónde me he formado.',
      press: 'Lo que ha salido de los proyectos en equipo.',
      stack: 'Lo que uso para calcular, programar y construir.'
    },
    findMe: 'Encuéntrame en', all: 'Todos', filter: 'Filtrar por categoría', ongoing: 'En desarrollo', ongoingResearch: 'Investigación en curso',
    privateCode: 'Código privado', generic: 'Trabajo de prácticas · descripción genérica',
    labNote: 'Por ahora el código no es público.',
    contactTitle: '¿Hablamos?', contactText: 'Si te interesa algo de lo que hago, la forma más rápida de hablar conmigo es el correo. También estoy en LinkedIn.',
    writeMe: 'Escríbeme', photoAlt: 'Retrato de Omar Quiles García', top: 'Volver arriba',
    made: 'Web estática, sin rastreo ni cookies.', diagram: 'Esquema de doble disco actuador (DMST)'
  },
  en: {
    nav: [['about', 'About'], ['research', 'Research'], ['projects', 'Projects'], ['experience', 'Experience']],
    skip: 'Skip to content', menu: 'Sections', theme: 'Toggle light/dark theme', langSwitch: 'Language',
    ctaProjects: 'See projects', ctaCv: 'Download CV', ctaContact: 'Contact',
    sec: { about: 'About me', research: 'Research', projects: 'Projects', lab: 'What I am building', exp: 'Experience', edu: 'Education', career: 'Career', press: 'Press & awards', stack: 'Tools', contact: 'Contact' },
    lead: {
      research: 'My current work as a research scholar in the FERES group at IUTA.',
      projects: 'Energy, hardware, software and building-services projects.',
      lab: 'My personal lab: ideas I am building right now.',
      career: 'Where I have worked and studied.',
      press: 'What came out of the team projects.',
      stack: 'What I use to calculate, code and build.'
    },
    findMe: 'Find me on', all: 'All', filter: 'Filter by category', ongoing: 'In development', ongoingResearch: 'Ongoing research',
    privateCode: 'Private code', generic: 'Internship work · generic description',
    labNote: 'For now the code is not public.',
    contactTitle: "Let's talk", contactText: 'If something I do interests you, email is the fastest way to reach me. I am also on LinkedIn.',
    writeMe: 'Email me', photoAlt: 'Portrait of Omar Quiles García', top: 'Back to top',
    made: 'Static site, no tracking or cookies.', diagram: 'Double actuator disc scheme (DMST)'
  }
};
const IDS = {
  es: { about: 'sobre-mi', research: 'investigacion', projects: 'proyectos', lab: 'laboratorio', exp: 'experiencia', press: 'prensa', stack: 'herramientas', contact: 'contacto' },
  en: { about: 'about', research: 'research', projects: 'projects', lab: 'lab', exp: 'experience', press: 'press', stack: 'tools', contact: 'contact' }
};

// Iconos de trazo (24×24). Los de marca van rellenos.
const stroke = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICON = {
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.06c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.77 2.5 4.77 5.75v5.7h-4v-5.05c0-1.2-.02-2.75-1.7-2.75-1.7 0-1.95 1.3-1.95 2.65v5.15h-4v-11Z"/></svg>',
  github: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.53.1.72-.23.72-.5v-1.86c-2.92.64-3.54-1.24-3.54-1.24-.48-1.21-1.17-1.54-1.17-1.54-.95-.65.08-.64.08-.64 1.05.08 1.6 1.08 1.6 1.08.94 1.6 2.46 1.14 3.06.87.1-.68.37-1.14.66-1.4-2.33-.27-4.78-1.17-4.78-5.18 0-1.15.41-2.08 1.08-2.82-.1-.27-.47-1.34.1-2.79 0 0 .88-.28 2.89 1.08a10 10 0 0 1 5.26 0c2-1.36 2.88-1.08 2.88-1.08.58 1.45.21 2.52.1 2.79.68.74 1.08 1.67 1.08 2.82 0 4.02-2.45 4.9-4.79 5.16.38.33.71.97.71 1.96v2.9c0 .28.19.61.73.5A10.5 10.5 0 0 0 12 1.5Z"/></svg>',
  mail: stroke('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>'),
  theme: stroke('<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor"/>'),
  arrow: stroke('<path d="M5 12h14m-5-5 5 5-5 5"/>'),
  ext: stroke('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
  pin: stroke('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  lock: stroke('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  trophy: stroke('<path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6"/>'),
  tv: stroke('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="m9 2 3 4 3-4M8 21h8"/>'),
  radio: stroke('<rect x="3" y="8" width="18" height="12" rx="2"/><circle cx="15.5" cy="14" r="2.5"/><path d="M7 12h3M7 16h3M17 3 7 8"/>'),
  wind: stroke('<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>'),
  cpu: stroke('<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx=".5"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>'),
  spark: stroke('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/><circle cx="12" cy="12" r="2"/>'),
  code: stroke('<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>'),
  ruler: stroke('<path d="M3 17 17 3l4 4L7 21l-4-4ZM7 13l2 2M10 10l2 2M13 7l2 2"/>'),
  brief: stroke('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>'),
  cap: stroke('<path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6"/>'),
  download: stroke('<path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/>')
};
const STACK_ICONS = ['ruler', 'code', 'cpu', 'spark'];

// ── Líneas de corriente: flujo potencial alrededor de un cilindro ──────────
// ψ = U·y·(1 − R²/r²). Para cada valor de ψ se resuelve y(x) por bisección.
function streamlines() {
  const W = 1200, H = 600, cx = 600, cy = 300, R = 165;
  const ks = [0.12, 0.32, 0.6, 0.95, 1.4, 1.95, 2.6];
  const paths = [];
  for (const sign of [1, -1]) for (const k of ks) {
    const c = k * R;
    const pts = [];
    for (let x = -cx; x <= W - cx; x += 12) {
      let lo = Math.sqrt(Math.max(R * R - x * x, 0)) + 1e-6, hi = 900;
      const f = (y) => y * (1 - (R * R) / (x * x + y * y)) - c;
      for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; f(m) > 0 ? (hi = m) : (lo = m); }
      pts.push([cx + x, cy - sign * lo]);
    }
    paths.push('M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L'));
  }
  const body = paths.map((d, i) => `<path class="sl" d="${d}"/><path class="sp" style="animation-delay:-${(i * 0.83) % 6}s" d="${d}"/>`).join('');
  return `<svg class="flow" viewBox="0 0 ${W} ${H}" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".35" stop-color="#fff" stop-opacity=".9"/><stop offset=".8" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient>
      <mask id="fm"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask></defs>
      <g mask="url(#fm)">${body}</g>
    </svg>`;
}

// ── Ilustraciones de las tarjetas sin foto (dibujos, no fotos) ─────────────
const ART = {
  buck: `<g class="ln"><path d="M30 60h50l14-12M110 60h20"/><circle cx="96" cy="60" r="2.5" class="dot"/><path d="M130 60c6-14 14-14 18 0s12 14 18 0 12-14 18 0 12 14 18 0"/><path d="M202 60h60v28M262 104v26M248 88h28M248 104h28"/><path d="M118 60v70M108 92l10-14 10 14ZM106 78h24"/><path d="M30 130h232M30 60v70"/></g>
    <g class="ac"><path d="M196 152h10v-12h12v12h10v-12h12v12h10v-12h12v12h10"/><path d="M40 150c10-18 20-18 30 0s20 18 30 0"/></g>
    <text x="30" y="44">V<tspan dy="3" font-size="9">in</tspan></text><text x="270" y="78">V<tspan dy="3" font-size="9">out</tspan></text><text x="146" y="44">L</text><text x="196" y="174">PWM · ESP32</text>`,
  plan: `<g class="ln"><rect x="34" y="28" width="252" height="128" rx="2"/><path d="M34 92h96M130 28v58M130 104v52M210 28v128M210 92h76"/><path d="M146 92h48" stroke-dasharray="2 4"/></g>
    <g class="ac"><path d="M52 128h140v-70h70"/><circle cx="52" cy="128" r="6"/><circle cx="160" cy="58" r="5"/><circle cx="262" cy="58" r="5"/><rect x="248" y="118" width="22" height="22" rx="3"/><path d="M253 129h12M259 123v12"/></g>`,
  pipe: `<g class="ln"><path d="M40 120l70-40 70 40 70-40"/><path d="M40 136l70-40 70 40 70-40"/><path d="M110 80V40M110 96v0M126 88V48"/><path d="M180 120v36M196 128v28"/></g>
    <g class="ac"><path d="M100 86l20 0M170 126l20 0M240 86l20 0" stroke-width="5"/><circle cx="118" cy="34" r="14"/><path d="M118 34l7-6"/></g>`,
  agents: `<g class="ln"><path d="M160 92 80 50M160 92l80-42M160 92 80 134M160 92l80 42M80 50l160 0M80 134h160"/></g>
    <g class="ac"><circle cx="160" cy="92" r="20"/><circle cx="80" cy="50" r="12"/><circle cx="240" cy="50" r="12"/><circle cx="80" cy="134" r="12"/><circle cx="240" cy="134" r="12"/></g>`
};
const art = (k) => `<svg viewBox="0 0 320 184" class="art" aria-hidden="true">${ART[k]}</svg>`;

function dmstDiagram(L) {
  const t = L === 'es'
    ? { up: 'disco aguas arriba', down: 'disco aguas abajo', tube: 'tubo de corriente', strut: 'strut' }
    : { up: 'upwind disc', down: 'downwind disc', tube: 'streamtube', strut: 'strut' };
  return `
      <figure class="diagram">
        <svg viewBox="0 0 360 240" role="img" aria-labelledby="dg-t-${L}">
          <title id="dg-t-${L}">${UI[L].diagram}</title>
          <g class="d-flow"><path d="M10 70h340M10 120h340M10 170h340"/><path d="M24 64l8 6-8 6M24 114l8 6-8 6M24 164l8 6-8 6"/></g>
          <path class="d-tube" d="M10 100 C120 100 140 98 180 96 S260 90 350 88 M10 140 C120 140 140 142 180 144 S260 150 350 152"/>
          <circle class="d-rotor" cx="180" cy="120" r="72"/>
          <path class="d-disc" d="M150 48v144M210 48v144"/>
          <path class="d-strut" d="M180 120 L231 69"/>
          <circle class="d-hub" cx="180" cy="120" r="5"/>
          <rect class="d-blade" x="225" y="62" width="14" height="6" rx="3" transform="rotate(45 232 65)"/>
          <g class="d-label"><text x="150" y="40" text-anchor="middle">${t.up}</text><text x="210" y="212" text-anchor="middle">${t.down}</text><text x="350" y="80" text-anchor="end">${t.tube}</text><text x="246" y="60">${t.strut}</text><text x="14" y="58">U∞</text></g>
        </svg>
        <figcaption>${UI[L].diagram}</figcaption>
      </figure>`;
}

const secHead = (n, title, id, lead) => `
    <header class="sec-head">
      <p class="eyebrow" aria-hidden="true"><span>${String(n).padStart(2, '0')}</span></p>
      <h2 id="${id}-t">${esc(title)}</h2>
      ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
    </header>`;

function head(L, { title, description, path, alt, ogImage }) {
  const other = L === 'es' ? 'en' : 'es';
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'Person',
    name: profile.name, url: SITE + '/', email: `mailto:${profile.email}`,
    image: `${SITE}${profile.photo}-460.jpg`,
    jobTitle: L === 'es' ? 'Becario de investigación (IUTA, Universidad de Oviedo)' : 'Research Scholar (IUTA, University of Oviedo)',
    address: { '@type': 'PostalAddress', addressRegion: 'Asturias', addressCountry: 'ES' },
    alumniOf: [{ '@type': 'CollegeOrUniversity', name: 'Universidad de Oviedo' }, { '@type': 'CollegeOrUniversity', name: 'Gazi University' }],
    affiliation: { '@type': 'Organization', name: 'Instituto Universitario de Tecnología Industrial de Asturias (IUTA)' },
    award: 'Hackea Avilés 2026',
    knowsAbout: ['Vertical axis wind turbines', 'Fluid dynamics', 'MATLAB', 'Python', 'ESP32', 'Power electronics'],
    sameAs: [profile.linkedin, profile.github]
  };
  return `<!doctype html>
<html lang="${L}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${esc(profile.name)}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#0B1424">
<link rel="canonical" href="${SITE}${path}">
<link rel="alternate" hreflang="${L}" href="${SITE}${path}">
<link rel="alternate" hreflang="${other}" href="${SITE}${alt}">
<link rel="alternate" hreflang="x-default" href="${SITE}${L === 'es' ? path : alt}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/sora-800.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/plex-sans-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="${esc(profile.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:image" content="${SITE}${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(profile.name)} · ${esc(profile.headline[L])}">
<meta property="og:locale" content="${L === 'es' ? 'es_ES' : 'en_GB'}">
<meta property="og:locale:alternate" content="${L === 'es' ? 'en_GB' : 'es_ES'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}${ogImage}">
<script>try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch(e){}document.documentElement.classList.add('js')</script>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<script src="/assets/js/site.js" defer></script>
</head>`;
}

function topbar(L, base, alt) {
  const u = UI[L];
  const langs = [['es', '/', 'Español'], ['en', '/en/', 'English']];
  return `
<a class="skip" href="#main">${u.skip}</a>
<header class="topbar">
  <div class="wrap topbar-in">
    <a class="brand" href="${base}"><span class="brand-mark" aria-hidden="true">OQ</span><span class="brand-name">${esc(profile.name)}</span></a>
    <nav class="nav" aria-label="${u.menu}">
      <ul role="list">${u.nav.map(([id, t]) => `<li><a href="${base}#${id}">${t}</a></li>`).join('')}</ul>
    </nav>
    <div class="tools">
      ${a(`${base}#${IDS[L].contact}`, u.ctaContact, 'pill pill-accent nav-cta')}
      <ul class="lang" role="list" aria-label="${u.langSwitch}">
        ${langs.map(([code, href, name]) => code === L
          ? `<li><span aria-current="true" lang="${code}">${code.toUpperCase()}<span class="sr"> · ${name}</span></span></li>`
          : `<li><a href="${href}" hreflang="${code}" lang="${code}">${code.toUpperCase()}<span class="sr"> · ${name}</span></a></li>`).join('')}
      </ul>
      <button class="icon-btn theme-btn" type="button" aria-label="${u.theme}" hidden>${ICON.theme}</button>
    </div>
  </div>
</header>`;
}

function home(L) {
  const u = UI[L], id = IDS[L];
  const base = L === 'es' ? '/' : '/en/';
  const alt = L === 'es' ? '/en/' : '/';
  const r = proj.research;
  const cats = Object.entries(proj.categories).filter(([k]) => proj.projects.some((p) => p.category === k));
  const cv = profile.cv.available
    ? a(profile.cv[L], `${ICON.download}${u.ctaCv}`, 'btn btn-ghost')
    : '<!-- TODO: CV oculto hasta que existan assets/cv/CV_Omar_Quiles_ES.pdf y _EN.pdf (profile.json → cv.available) -->';
  const handle = (url) => decodeURIComponent(url.replace(/\/$/, '').split('/').pop());

  const thumb = (p) => p.thumb
    ? `<picture>
          <source type="image/avif" srcset="${p.thumb}.avif">
          <source type="image/webp" srcset="${p.thumb}.webp">
          <img src="${p.thumb}.jpg" width="720" height="405" loading="lazy" decoding="async" alt="${esc(p.thumbAlt[L])}">
        </picture>`
    : art(p.art);

  const card = (p) => `
      <li class="card" data-cat="${p.category}">
        ${p._todo ? `<!-- ${esc(p._todo)} -->` : ''}
        <div class="card-media media-${p.art || 'photo'}">${thumb(p)}</div>
        <div class="card-body">
          <p class="chips"><span class="chip">${esc(proj.categories[p.category][L])}</span>${p.badge ? `<span class="chip chip-soft">${esc(p.badge[L])}</span>` : ''}</p>
          <h3>${esc(p.title[L])}</h3>
          <p class="card-text">${esc(p.text[L])}</p>
          ${p.tags?.length ? `<ul class="tags" role="list">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
          <div class="card-foot">
            ${p.links?.length ? `<ul class="links" role="list">${p.links.map((l) => `<li>${a(l.href, `${esc(l.label[L])}${ICON.ext}`)}</li>`).join('')}</ul>` : ''}
            <p class="meta">${p.category === 'instalaciones' ? `${ICON.brief}${u.generic}` : `${ICON.lock}${u.privateCode}`}</p>
          </div>
        </div>
      </li>`;

  const tl = (items, kind) => items.map((e) => `
        <li class="tl-item">
          ${e.when[L] ? `<p class="when">${esc(e.when[L])}</p>` : ''}
          <h4>${esc(e.title[L])}</h4>
          <p class="org">${esc(kind === 'exp' ? e.org : e.org[L])}${kind === 'exp' ? ` <span>· ${esc(e.where[L])}</span>` : ''}</p>
          ${kind === 'exp' ? `<ul>${e.points[L].map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : (e.note[L] ? `<p>${esc(e.note[L])}</p>` : '')}
        </li>`).join('');

  const pressIcon = [ICON.trophy, ICON.tv, ICON.radio];
  const fmtDate = (d) => {
    const [y, m, day] = d.split('-').map(Number);
    const dt = new Date(Date.UTC(y, (m || 1) - 1, day || 1));
    return dt.toLocaleDateString(L === 'es' ? 'es-ES' : 'en-GB', { ...(day ? { day: 'numeric' } : {}), month: 'long', year: 'numeric', timeZone: 'UTC' });
  };

  return `${head(L, {
    title: `${profile.name} · ${L === 'es' ? 'Ingeniería industrial, fluidos y software' : 'Industrial engineering, fluids and software'}`,
    description: profile.metaDescription[L], path: base, alt, ogImage: `/assets/og/og-${L}.png`
  })}
<body>
${topbar(L, base, alt)}
<main id="main">
  <section class="hero" aria-labelledby="hero-t">
    <div class="wrap hero-in">
      <div class="hero-text">
        <p class="hello">${esc(profile.greeting[L])}</p>
        <h1 id="hero-t"><span>Omar</span> <span>Quiles García</span></h1>
        <p class="headline">${esc(profile.headline[L])}</p>
        <div class="cta">
          ${a(`${base}#${id.projects}`, `${u.ctaProjects}${ICON.arrow}`, 'btn btn-accent')}
          ${a(`${base}#${id.contact}`, u.ctaContact, 'btn btn-ghost')}
          ${cv}
        </div>
        <ul class="social" role="list">
          <li>${a(profile.linkedin, `${ICON.linkedin}<span class="sr">LinkedIn</span>`)}</li>
          <li>${a(profile.github, `${ICON.github}<span class="sr">GitHub</span>`)}</li>
          <li>${a(`mailto:${profile.email}`, `${ICON.mail}<span class="sr">Email</span>`)}</li>
        </ul>
      </div>
      <figure class="portrait">
        ${streamlines()}
        <div class="portrait-ring">
          <picture>
            <source type="image/avif" srcset="${profile.photo}-320.avif 320w, ${profile.photo}-460.avif 460w" sizes="(min-width: 960px) 320px, 240px">
            <source type="image/webp" srcset="${profile.photo}-320.webp 320w, ${profile.photo}-460.webp 460w" sizes="(min-width: 960px) 320px, 240px">
            <img src="${profile.photo}-460.jpg" width="460" height="460" alt="${u.photoAlt}" fetchpriority="high">
          </picture>
          <span class="award">${ICON.trophy}${esc(profile.badge[L])}</span>
        </div>
        <figcaption><span class="place">${ICON.pin}${esc(profile.place[L])}</span><span class="place-note">${esc(profile.placeNote[L])}</span></figcaption>
      </figure>
    </div>
    <p class="formula" aria-hidden="true">ψ = U<sub>∞</sub>·y·(1 − R²/r²)</p>
  </section>

  <div class="wrap">
    <ul class="stats" role="list">
      ${profile.stats.map((s) => `<li><strong>${esc(s.value)}</strong><span>${esc(s.label[L])}</span></li>`).join('')}
    </ul>
  </div>

  <section id="${id.about}" class="sec" aria-labelledby="${id.about}-t">
    <div class="wrap">
      <div class="about">
        <div>
          ${secHead(1, u.sec.about, id.about)}
          <div class="prose">${profile.about[L].map((p) => `<p>${esc(p)}</p>`).join('')}</div>
        </div>
        <aside class="find" aria-label="${u.findMe}">
          <h3>${u.findMe}</h3>
          <ul role="list">
            <li>${a(profile.linkedin, `<span class="find-ic">${ICON.linkedin}</span><span><strong>LinkedIn</strong><small>${esc(profile.name)}</small></span>`)}</li>
            <li>${a(profile.github, `<span class="find-ic">${ICON.github}</span><span><strong>GitHub</strong><small>@${esc(handle(profile.github))}</small></span>`)}</li>
            <li>${a(`mailto:${profile.email}`, `<span class="find-ic">${ICON.mail}</span><span><strong>Email</strong><small>${esc(profile.email)}</small></span>`)}</li>
          </ul>
        </aside>
      </div>
      <ul class="focus" role="list">
        ${profile.focus.map((f) => `<li><span class="focus-ic">${ICON[f.icon]}</span><h3>${esc(f.title[L])}</h3><p>${esc(f.text[L])}</p></li>`).join('')}
      </ul>
    </div>
  </section>

  <section class="band" aria-label="${esc(profile.quoteLabel[L])}">
    <div class="wrap">
      <p class="band-label">${esc(profile.quoteLabel[L])}</p>
      <blockquote><p>«${esc(profile.quote[L])}»</p></blockquote>
    </div>
  </section>

  <section id="${id.research}" class="sec" aria-labelledby="${id.research}-t">
    <div class="wrap">
      ${secHead(2, u.sec.research, id.research, u.lead.research)}
      <article class="feature">
        <div class="feature-text">
          <p class="chips"><span class="chip chip-live">${u.ongoingResearch}</span><span class="chip">IUTA · FERES</span></p>
          <h3>${esc(r.title[L])}</h3>
          <p>${esc(r.summary[L])}</p>
          <p class="muted">${esc(r.context[L])}</p>
          <ul class="tags" role="list">${r.tools.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        </div>
        <div class="feature-media">${dmstDiagram(L)}</div>
      </article>
    </div>
  </section>

  <section id="${id.projects}" class="sec sec-alt" aria-labelledby="${id.projects}-t">
    <div class="wrap">
      ${secHead(3, u.sec.projects, id.projects, u.lead.projects)}
      <div class="filters" role="group" aria-label="${u.filter}" hidden>
        <button type="button" aria-pressed="true" data-filter="all">${u.all}</button>
        ${cats.map(([k, v]) => `<button type="button" aria-pressed="false" data-filter="${k}">${esc(v[L])}</button>`).join('')}
      </div>
      <ul class="cards" role="list">${proj.projects.map(card).join('')}
      </ul>
    </div>
  </section>

  <section id="${id.lab}" class="sec" aria-labelledby="${id.lab}-t">
    <div class="wrap">
      ${secHead(4, u.sec.lab, id.lab, u.lead.lab)}
      <ul class="lab" role="list">
        ${proj.lab.map((x) => `<li><p class="status">${u.ongoing}</p><h3>${esc(x.title[L])}</h3><p>${esc(x.text[L])}</p></li>`).join('')}
      </ul>
      <p class="note-line">${ICON.lock}${u.labNote}</p>
    </div>
  </section>

  <section id="${id.exp}" class="sec sec-alt" aria-labelledby="${id.exp}-t">
    <div class="wrap">
      ${secHead(5, u.sec.career, id.exp, u.lead.career)}
      <div class="career">
        <div>
          <h3 class="col-title">${ICON.brief}${u.sec.exp}</h3>
          <ol class="tl" role="list">${tl(exp.experience, 'exp')}</ol>
        </div>
        <div>
          <h3 class="col-title">${ICON.cap}${u.sec.edu}</h3>
          <ol class="tl" role="list">${tl(exp.education, 'edu')}</ol>
        </div>
      </div>
    </div>
  </section>

  <section id="${id.press}" class="sec" aria-labelledby="${id.press}-t">
    <div class="wrap">
      ${secHead(6, u.sec.press, id.press, u.lead.press)}
      <ul class="press" role="list">
        ${press.items.map((p, i) => `
        <li class="${i === 0 ? 'press-main' : ''}">
          ${p._todo ? `<!-- ${esc(p._todo)} -->` : ''}
          <span class="press-ic">${pressIcon[i] || ICON.trophy}</span>
          <p class="when">${esc(p.kind[L])} · <time datetime="${p.date}">${fmtDate(p.date)}</time></p>
          <h3>${p.href ? a(p.href, esc(p.title[L])) : esc(p.title[L])}</h3>
          <p>${esc(p.text[L])}</p>
        </li>`).join('')}
      </ul>
    </div>
  </section>

  <section id="${id.stack}" class="sec sec-alt" aria-labelledby="${id.stack}-t">
    <div class="wrap">
      ${secHead(7, u.sec.stack, id.stack, u.lead.stack)}
      <div class="stack">
        ${stack.groups.map((g, i) => `
        <div class="stack-card">
          <h3>${ICON[STACK_ICONS[i]] || ''}${esc(g.title[L])}</h3>
          <ul class="pills" role="list">${g.items.map((it) => `<li>${esc(L === 'en' ? stack.en_overrides[it] || it : it)}</li>`).join('')}</ul>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <section id="${id.contact}" class="contact" aria-labelledby="${id.contact}-t">
    <div class="wrap contact-in">
      <div>
        <p class="eyebrow"><span>08</span> ${u.sec.contact}</p>
        <h2 id="${id.contact}-t">${u.contactTitle}</h2>
        <p>${u.contactText}</p>
      </div>
      <div class="contact-actions">
        ${a(`mailto:${profile.email}`, `${ICON.mail}${u.writeMe}`, 'btn btn-accent btn-lg')}
        <p class="contact-mail">${esc(profile.email)}</p>
        <ul class="social" role="list">
          <li>${a(profile.linkedin, `${ICON.linkedin}<span class="sr">LinkedIn</span>`)}</li>
          <li>${a(profile.github, `${ICON.github}<span class="sr">GitHub</span>`)}</li>
        </ul>
      </div>
    </div>
  </section>
</main>
<footer class="footer">
  <div class="wrap footer-in">
    <p><span class="brand-mark" aria-hidden="true">OQ</span> © ${YEAR} ${esc(profile.name)}</p>
    <p class="muted">${u.made}</p>
    ${a('#main', `${u.top} ↑`, 'to-top')}
  </div>
</footer>
</body>
</html>
`;
}

const out = (rel, html) => {
  const f = join(ROOT, rel);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, html);
  console.log('✓', rel);
};
out('index.html', home('es'));
out('en/index.html', home('en'));

const REV = new Date().toISOString().slice(0, 10);
const urls = ['/', '/en/'];
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${REV}</lastmod>
    <xhtml:link rel="alternate" hreflang="es" href="${SITE}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/"/>
  </url>`).join('\n')}
</urlset>
`);
