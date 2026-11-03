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
const REV = new Date().toISOString().slice(0, 10);

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ext = (href) => /^https?:/.test(href) && !href.startsWith(SITE);
const a = (href, label, cls = '') =>
  `<a href="${esc(href)}"${cls ? ` class="${cls}"` : ''}${ext(href) ? ' rel="noopener"' : ''}>${label}</a>`;

const UI = {
  es: {
    nav: [['investigacion', 'Investigación'], ['proyectos', 'Proyectos'], ['experiencia', 'Experiencia'], ['contacto', 'Contacto']],
    skip: 'Saltar al contenido', menu: 'Secciones', theme: 'Cambiar tema claro/oscuro', langLabel: 'English', langCode: 'EN',
    ctaProjects: 'Ver proyectos', ctaCv: 'Descargar CV', ctaContact: 'Contacto',
    sec: { about: 'Sobre mí', research: 'Investigación', projects: 'Proyectos', lab: 'Lo que estoy construyendo', exp: 'Experiencia', edu: 'Formación y certificados', press: 'Prensa y reconocimientos', stack: 'Stack', contact: 'Contacto' },
    all: 'Todos', filter: 'Filtrar por categoría', more: 'Ver el proyecto', ongoing: 'en desarrollo',
    labIntro: 'Mi laboratorio personal. Todo está en desarrollo y, por ahora, el código no es público.',
    contactText: 'La forma más rápida de hablar conmigo es el correo. También estoy en LinkedIn y GitHub.',
    photoAlt: 'Retrato de Omar Quiles García',
    footer: { author: 'Autor', scale: 'Escala', rev: 'Revisión', sheet: 'Hoja', title: 'Plano', made: 'Web estática, sin rastreo ni cookies.' }
  },
  en: {
    nav: [['research', 'Research'], ['projects', 'Projects'], ['experience', 'Experience'], ['contact', 'Contact']],
    skip: 'Skip to content', menu: 'Sections', theme: 'Toggle light/dark theme', langLabel: 'Español', langCode: 'ES',
    ctaProjects: 'See projects', ctaCv: 'Download CV', ctaContact: 'Contact',
    sec: { about: 'About', research: 'Research', projects: 'Projects', lab: 'What I am building', exp: 'Experience', edu: 'Education & certificates', press: 'Press & awards', stack: 'Stack', contact: 'Contact' },
    all: 'All', filter: 'Filter by category', more: 'See the project', ongoing: 'in development',
    labIntro: 'My personal lab. Everything is in development and, for now, the code is not public.',
    contactText: 'Email is the fastest way to reach me. I am also on LinkedIn and GitHub.',
    photoAlt: 'Portrait of Omar Quiles García',
    footer: { author: 'Author', scale: 'Scale', rev: 'Revision', sheet: 'Sheet', title: 'Drawing', made: 'Static site, no tracking or cookies.' }
  }
};
const IDS = {
  es: { about: 'sobre-mi', research: 'investigacion', projects: 'proyectos', lab: 'laboratorio', exp: 'experiencia', edu: 'formacion', press: 'prensa', stack: 'stack', contact: 'contacto' },
  en: { about: 'about', research: 'research', projects: 'projects', lab: 'lab', exp: 'experience', edu: 'education', press: 'press', stack: 'stack', contact: 'contact' }
};

const ICON = {
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.06c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.77 2.5 4.77 5.75v5.7h-4v-5.05c0-1.2-.02-2.75-1.7-2.75-1.7 0-1.95 1.3-1.95 2.65v5.15h-4v-11Z"/></svg>',
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.53.1.72-.23.72-.5v-1.86c-2.92.64-3.54-1.24-3.54-1.24-.48-1.21-1.17-1.54-1.17-1.54-.95-.65.08-.64.08-.64 1.05.08 1.6 1.08 1.6 1.08.94 1.6 2.46 1.14 3.06.87.1-.68.37-1.14.66-1.4-2.33-.27-4.78-1.17-4.78-5.18 0-1.15.41-2.08 1.08-2.82-.1-.27-.47-1.34.1-2.79 0 0 .88-.28 2.89 1.08a10 10 0 0 1 5.26 0c2-1.36 2.88-1.08 2.88-1.08.58 1.45.21 2.52.1 2.79.68.74 1.08 1.67 1.08 2.82 0 4.02-2.45 4.9-4.79 5.16.38.33.71.97.71 1.96v2.9c0 .28.19.61.73.5A10.5 10.5 0 0 0 12 1.5Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3.5 6 8.5 7 8.5-7"/></svg>',
  theme: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>'
};

const socials = (L) => `
  <ul class="social" role="list">
    <li>${a(profile.linkedin, `${ICON.linkedin}<span class="sr">LinkedIn</span>`)}</li>
    <li>${a(profile.github, `${ICON.github}<span class="sr">GitHub</span>`)}</li>
    <li>${a(`mailto:${profile.email}`, `${ICON.mail}<span class="sr">Email</span>`)}</li>
  </ul>`;

const sectionHead = (num, title, id) =>
  `<header class="sec-head"><span class="sec-num" aria-hidden="true">${String(num).padStart(2, '0')}</span><h2 id="${id}-t">${esc(title)}</h2><span class="cota" aria-hidden="true"></span></header>`;

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
<meta name="theme-color" content="#F6F4EE" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0E1A2B" media="(prefers-color-scheme: dark)">
<link rel="canonical" href="${SITE}${path}">
<link rel="alternate" hreflang="${L}" href="${SITE}${path}">
<link rel="alternate" hreflang="${other}" href="${SITE}${alt}">
<link rel="alternate" hreflang="x-default" href="${SITE}${L === 'es' ? path : alt}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
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

function topbar(L, { home, alt, sectionLinks = true }) {
  const u = UI[L];
  return `
<a class="skip" href="#main">${u.skip}</a>
<header class="topbar">
  <div class="wrap topbar-in">
    <a class="mark" href="${home}"><span class="mono" aria-hidden="true">OQ</span><span class="mark-name">${esc(profile.name)}</span></a>
    <nav aria-label="${u.menu}">
      <ul role="list">
        ${sectionLinks ? u.nav.map(([id, t]) => `<li><a href="${home}#${id}">${t}</a></li>`).join('') : ''}
        <li><a class="lang" href="${alt}" hreflang="${L === 'es' ? 'en' : 'es'}" lang="${L === 'es' ? 'en' : 'es'}">${u.langCode}<span class="sr"> · ${u.langLabel}</span></a></li>
        <li><button class="theme-btn" type="button" aria-label="${u.theme}" hidden>${ICON.theme}</button></li>
      </ul>
    </nav>
  </div>
</header>`;
}

function footer(L, sheet) {
  const f = UI[L].footer;
  return `
<footer class="wrap cajetin" aria-label="Pie">
  <dl>
    <div class="c-title"><dt>${f.title}</dt><dd>${esc(profile.role[L])}</dd></div>
    <div><dt>${f.author}</dt><dd>O. Quiles García</dd></div>
    <div><dt>${f.scale}</dt><dd>1:1</dd></div>
    <div><dt>${f.rev}</dt><dd><time datetime="${REV}">${REV}</time></dd></div>
    <div><dt>${f.sheet}</dt><dd>${sheet}</dd></div>
  </dl>
  <p class="foot-note">${f.made} © ${REV.slice(0, 4)} ${esc(profile.name)}</p>
</footer>
</body>
</html>
`;
}

function home(L) {
  const u = UI[L], id = IDS[L];
  const base = L === 'es' ? '/' : '/en/';
  const alt = L === 'es' ? '/en/' : '/';
  const r = proj.research;
  const cats = Object.entries(proj.categories).filter(([k]) => proj.projects.some((p) => p.category === k));

  const cv = profile.cv.available ? a(profile.cv[L], u.ctaCv, 'btn') : '<!-- TODO: CV oculto hasta que existan assets/cv/CV_Omar_Quiles_ES.pdf y _EN.pdf (profile.json → cv.available) -->';

  const card = (p) => `
      <li class="card" data-cat="${p.category}">
        ${p._todo ? `<!-- ${esc(p._todo)} -->` : ''}
        <p class="card-meta"><span class="tag tag-cat">${esc(proj.categories[p.category][L])}</span>${p.badge ? `<span class="badge">${esc(p.badge[L])}</span>` : ''}</p>
        <h3>${esc(p.title[L])}</h3>
        <p>${esc(p.text[L])}</p>
        ${p.tags?.length ? `<ul class="tags" role="list">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
        ${p.links?.length ? `<ul class="links" role="list">${p.links.map((l) => `<li>${a(l.href, `${esc(l.label[L])}`)}</li>`).join('')}</ul>` : ''}
      </li>`;


  return `${head(L, {
    title: `${profile.name} · ${L === 'es' ? 'Ingeniería industrial, fluidos y software' : 'Industrial engineering, fluids and software'}`,
    description: profile.metaDescription[L], path: base, alt, ogImage: `/assets/og/og-${L}.png`
  })}
<body>
${topbar(L, { home: base, alt })}
<main id="main">
  <section class="hero wrap" aria-labelledby="hero-t">
    <div class="hero-text">
      <p class="eyebrow mono">${esc(profile.location[L])} · ${esc(profile.pronouns)}</p>
      <h1 id="hero-t">${esc(profile.name)}</h1>
      <p class="headline">${esc(profile.headline[L])}</p>
      <div class="cta">
        ${a(`${base}#${id.projects}`, u.ctaProjects, 'btn btn-primary')}
        ${cv}
        ${a(`${base}#${id.contact}`, u.ctaContact, 'btn')}
      </div>
      ${socials(L)}
    </div>
    <figure class="hero-photo">
      <picture>
        <source type="image/avif" srcset="${profile.photo}-320.avif 320w, ${profile.photo}-460.avif 460w" sizes="(min-width: 900px) 300px, 220px">
        <source type="image/webp" srcset="${profile.photo}-320.webp 320w, ${profile.photo}-460.webp 460w" sizes="(min-width: 900px) 300px, 220px">
        <img src="${profile.photo}-460.jpg" width="460" height="460" alt="${u.photoAlt}" fetchpriority="high">
      </picture>
      <figcaption class="mono" aria-hidden="true">Ø 300 · ${L === 'es' ? 'vista frontal' : 'front view'}</figcaption>
    </figure>
  </section>

  <section id="${id.about}" class="wrap sec" aria-labelledby="${id.about}-t">
    ${sectionHead(1, u.sec.about, id.about)}
    <div class="prose">${profile.about[L].map((p) => `<p>${esc(p)}</p>`).join('')}</div>
  </section>

  <section id="${id.research}" class="wrap sec" aria-labelledby="${id.research}-t">
    ${sectionHead(2, u.sec.research, id.research)}
    <article class="feature">
      <div>
        <p class="eyebrow mono">IUTA · FERES · ${L === 'es' ? 'en curso' : 'ongoing'}</p>
        <h3>${esc(r.title[L])}</h3>
        <p>${esc(r.summary[L])}</p>
        <p class="muted">${esc(r.context[L])}</p>
      </div>
      ${dmstDiagram(L)}
    </article>
  </section>

  <section id="${id.projects}" class="wrap sec" aria-labelledby="${id.projects}-t">
    ${sectionHead(3, u.sec.projects, id.projects)}
    <div class="filters" role="group" aria-label="${u.filter}" hidden>
      <button type="button" aria-pressed="true" data-filter="all">${u.all}</button>
      ${cats.map(([k, v]) => `<button type="button" aria-pressed="false" data-filter="${k}">${esc(v[L])}</button>`).join('')}
    </div>
    <ul class="cards" role="list">${proj.projects.map(card).join('')}
    </ul>
    <p class="filter-empty muted" hidden aria-live="polite"></p>
  </section>

  <section id="${id.lab}" class="wrap sec" aria-labelledby="${id.lab}-t">
    ${sectionHead(4, u.sec.lab, id.lab)}
    <p class="muted">${u.labIntro}</p>
    <ul class="lab" role="list">
      ${proj.lab.map((x) => `<li><h3>${esc(x.title[L])} <span class="status mono">${u.ongoing}</span></h3><p>${esc(x.text[L])}</p></li>`).join('')}
    </ul>
  </section>

  <section id="${id.exp}" class="wrap sec" aria-labelledby="${id.exp}-t">
    ${sectionHead(5, u.sec.exp, id.exp)}
    <ol class="timeline" role="list">
      ${exp.experience.map((e) => `
      <li>
        <p class="when mono">${esc(e.when[L])}</p>
        <div>
          <h3>${esc(e.title[L])}</h3>
          <p class="org">${esc(e.org)} · <span class="muted">${esc(e.where[L])}</span></p>
          <ul>${e.points[L].map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
          ${e.link ? a(e.link[L], `${u.more} ${ICON.arrow}`, 'inline-link') : ''}
        </div>
      </li>`).join('')}
    </ol>
  </section>

  <section id="${id.edu}" class="wrap sec" aria-labelledby="${id.edu}-t">
    ${sectionHead(6, u.sec.edu, id.edu)}
    <ul class="edu" role="list">
      ${exp.education.map((e) => `
      <li>
        <h3>${esc(e.title[L])}</h3>
        <p class="org">${esc(e.org[L])}</p>
        ${e.when[L] ? `<p class="when mono">${esc(e.when[L])}</p>` : ''}
        ${e.note[L] ? `<p>${esc(e.note[L])}</p>` : ''}
      </li>`).join('')}
    </ul>
  </section>

  <section id="${id.press}" class="wrap sec" aria-labelledby="${id.press}-t">
    ${sectionHead(7, u.sec.press, id.press)}
    <ul class="press" role="list">
      ${press.items.map((p) => `
      <li>
        ${p._todo ? `<!-- ${esc(p._todo)} -->` : ''}
        <p class="when mono"><span class="tag">${esc(p.kind[L])}</span> <time datetime="${p.date}">${fmtDate(p.date, L)}</time></p>
        <h3>${p.href ? a(p.href, esc(p.title[L])) : esc(p.title[L])}</h3>
        <p>${esc(p.text[L])}</p>
      </li>`).join('')}
    </ul>
  </section>

  <section id="${id.stack}" class="wrap sec" aria-labelledby="${id.stack}-t">
    ${sectionHead(8, u.sec.stack, id.stack)}
    <div class="stack">
      ${stack.groups.map((g) => `
      <div>
        <h3 class="mono">${esc(g.title[L])}</h3>
        <ul class="tags" role="list">${g.items.map((i) => `<li>${esc(L === 'en' ? stack.en_overrides[i] || i : i)}</li>`).join('')}</ul>
      </div>`).join('')}
    </div>
  </section>

  <section id="${id.contact}" class="wrap sec" aria-labelledby="${id.contact}-t">
    ${sectionHead(9, u.sec.contact, id.contact)}
    <p class="prose">${u.contactText}</p>
    <p class="contact-mail">${a(`mailto:${profile.email}`, esc(profile.email))}</p>
    <ul class="links" role="list">
      <li>${a(profile.linkedin, 'LinkedIn')}</li>
      <li>${a(profile.github, 'GitHub')}</li>
    </ul>
  </section>
</main>
${footer(L, '1/1')}`;
}

function fmtDate(d, L) {
  const [y, m, day] = d.split('-').map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, day || 1));
  const opts = day ? { day: 'numeric', month: 'long', year: 'numeric' } : { month: 'long', year: 'numeric' };
  return dt.toLocaleDateString(L === 'es' ? 'es-ES' : 'en-GB', { ...opts, timeZone: 'UTC' });
}

// Esquema genérico de un DMST (teoría pública, sin datos del grupo).
function dmstDiagram(L) {
  const t = L === 'es'
    ? { title: 'Esquema de doble disco actuador (DMST)', up: 'disco aguas arriba', down: 'disco aguas abajo', tube: 'tubo de corriente', strut: 'strut' }
    : { title: 'Double actuator disc scheme (DMST)', up: 'upwind disc', down: 'downwind disc', tube: 'streamtube', strut: 'strut' };
  return `
      <figure class="diagram">
        <svg viewBox="0 0 360 240" role="img" aria-labelledby="dg-t">
          <title id="dg-t">${t.title}</title>
          <g class="d-flow">
            <path d="M10 70h340M10 120h340M10 170h340"/>
            <path d="M24 64l8 6-8 6M24 114l8 6-8 6M24 164l8 6-8 6"/>
          </g>
          <path class="d-tube" d="M10 100 C120 100 140 98 180 96 S260 90 350 88 M10 140 C120 140 140 142 180 144 S260 150 350 152"/>
          <circle class="d-rotor" cx="180" cy="120" r="72"/>
          <path class="d-disc" d="M150 48v144M210 48v144"/>
          <path class="d-strut" d="M180 120 L231 69"/>
          <circle class="d-hub" cx="180" cy="120" r="5"/>
          <rect class="d-blade" x="225" y="62" width="14" height="6" rx="3" transform="rotate(45 232 65)"/>
          <g class="d-label">
            <text x="150" y="40" text-anchor="middle">${t.up}</text>
            <text x="210" y="212" text-anchor="middle">${t.down}</text>
            <text x="350" y="80" text-anchor="end">${t.tube}</text>
            <text x="246" y="60">${t.strut}</text>
            <text x="14" y="58">U∞</text>
          </g>
        </svg>
        <figcaption class="mono">${t.title}</figcaption>
      </figure>`;
}

const out = (rel, html) => {
  const f = join(ROOT, rel);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, html);
  console.log('✓', rel);
};
out('index.html', home('es'));
out('en/index.html', home('en'));

const urls = ['/', '/en/'];
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((u) => {
  const pair = u.startsWith('/en/') ? u.slice(3) : '/en' + u;
  const es = u.startsWith('/en/') ? pair : u, en = u.startsWith('/en/') ? u : pair;
  return `  <url><loc>${SITE}${u}</loc><lastmod>${REV}</lastmod>
    <xhtml:link rel="alternate" hreflang="es" href="${SITE}${es}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}${en}"/>
  </url>`;
}).join('\n')}
</urlset>
`);
