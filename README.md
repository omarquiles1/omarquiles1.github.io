# omarquiles1.github.io

Web personal de Omar Quiles García, en español e inglés. Es estática: GitHub Pages sirve los HTML tal cual, sin paso de build.

## Verla en local

```bash
python -m http.server 8080
```

Y abre http://localhost:8080. Usa rutas absolutas, así que hay que servirla desde la raíz: abrir `index.html` con doble clic no funciona bien.

## Editar el contenido

Todo el texto está en `data/*.json`, con los campos `es` y `en` en el mismo archivo:

| Archivo | Contenido |
|---|---|
| `profile.json` | Nombre, titular, sobre mí, enlaces, CV |
| `experience.json` | Experiencia y formación |
| `projects.json` | Investigación, proyectos y "lo que estoy construyendo" |
| `press.json` | Premios y prensa |
| `stack.json` | Herramientas |

Después de editar, regenera las páginas y haz commit del resultado:

```bash
node scripts/render.mjs
```

No edites a mano `index.html`, `en/`, `research/` ni `sitemap.xml`: se sobrescriben.

## Interruptor del CV

- **`profile.json` → `cv.available`:** ponlo en `true` cuando existan los PDF en `assets/cv/`.

## Herramientas (opcionales)

```bash
npm install
node scripts/check.mjs   # capturas, enlaces, sin JS, encabezados (necesita el servidor en :8080)
node scripts/og.mjs      # foto, favicons e imágenes Open Graph
```

Playwright usa Microsoft Edge por defecto; se cambia con la variable `PW_CHANNEL`.

## Estructura

- `assets/` contiene CSS, JS, fuentes IBM Plex (licencia OFL), imágenes y CV.
- `CNAME.disabled` deja preparado `omarquiles.is-a.dev`, sin activar.
