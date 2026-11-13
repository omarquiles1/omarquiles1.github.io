// Mejoras opcionales: sin este archivo la web se ve entera (todas las tarjetas visibles, tema del sistema).
(() => {
  const root = document.documentElement;
  const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } } };

  // Tema claro/oscuro
  const btn = document.querySelector('.theme-btn');
  if (btn) {
    const current = () => root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const sync = () => btn.setAttribute('aria-pressed', String(current() === 'dark'));
    sync();
    btn.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      store.set('theme', next);
      sync();
    });
  }

  // Filtro de proyectos
  const bar = document.querySelector('.filters');
  if (bar) {
    const cards = [...document.querySelectorAll('.cards .card')];
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-filter]');
      if (!b) return;
      const f = b.dataset.filter;
      bar.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      cards.forEach((c) => { c.hidden = f !== 'all' && c.dataset.cat !== f; });
    });
  }

  // Visor de imágenes de la galería: <dialog> nativo; sin JS, el enlace abre la imagen.
  const zooms = document.querySelectorAll('a.zoom');
  if (zooms.length && 'HTMLDialogElement' in window) {
    const es = root.lang.startsWith('es');
    const dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.innerHTML = `<div class="lightbox-bar"><span></span><button type="button">${es ? 'Cerrar' : 'Close'}</button></div><img alt="">`;
    document.body.append(dlg);
    const [cap, img] = [dlg.querySelector('span'), dlg.querySelector('img')];
    dlg.querySelector('button').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    zooms.forEach((z) => z.addEventListener('click', (e) => {
      e.preventDefault();
      img.src = z.getAttribute('href');
      img.alt = z.dataset.caption || '';
      cap.textContent = z.dataset.caption || '';
      dlg.showModal();
    }));
  }

  // Líneas de corriente: se animan después de cargar y solo mientras el hero está a la vista.
  const flow = document.querySelector('.flow');
  if (flow && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const start = () => {
      if (!('IntersectionObserver' in window)) { flow.classList.add('on'); return; }
      new IntersectionObserver(([e]) => flow.classList.toggle('on', e.isIntersecting)).observe(flow.closest('.hero') || flow);
    };
    const later = () => setTimeout(start, 2500);
    document.readyState === 'complete' ? later() : addEventListener('load', later, { once: true });
  }
})();
