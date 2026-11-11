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
