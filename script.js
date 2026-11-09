// Radial timeline: every dated .entry becomes a dot. Ring = year, side = person.
(function buildOrbit() {
  const svg = document.getElementById('orbit');
  const readout = document.getElementById('orbit-readout');
  if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  const C = 240, R0 = 56, STEP = 40, Y0 = 2565, Y1 = 2569;
  const el = (tag, attrs, parent = svg) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent.appendChild(n);
    return n;
  };
  const radius = (y) => R0 + (y - Y0) * STEP;

  for (let y = Y0; y <= Y1; y++) {
    el('circle', { class: 'ring', cx: C, cy: C, r: radius(y) });
    el('text', { class: 'ring-label', x: C + 4, y: C - radius(y) - 4 }).textContent = y;
  }

  // Siwakorn fans out on the left, Rewat on the right (angles in degrees, 0 = east).
  const sides = { s: [118, 242, 'ศิวกร', 24], r: [-62, 62, 'เรวัต', 456] };
  const entries = [...document.querySelectorAll('.entry[data-year]')];
  const total = entries.length;

  for (const key in sides) {
    const [a0, a1, name, lx] = sides[key];
    const list = entries.filter((e) => e.closest('[data-person]').dataset.person === key);
    el('text', { class: 'side-label', x: lx, y: C + 4, 'text-anchor': key === 's' ? 'start' : 'end' }).textContent = name;
    list.forEach((entry, i) => {
      const a = ((a0 + (a1 - a0) * (list.length === 1 ? 0.5 : i / (list.length - 1))) * Math.PI) / 180;
      const r = radius(+entry.dataset.year);
      const x = C + r * Math.cos(a), y = C + r * Math.sin(a);
      const title = entry.querySelector('h4').textContent;
      const label = `${entry.dataset.year} · ${name} · ${title}`;
      el('line', { class: 'spoke', x1: C, y1: C, x2: x, y2: y });
      const g = el('g', { class: 'node', tabindex: 0, role: 'link', 'aria-label': label });
      el('title', {}, g).textContent = label;
      const award = entry.dataset.kind === 'award';
      el('circle', { cx: x, cy: y, r: award ? 6 : 4, class: award ? 'node-award' : 'node-activity' }, g);
      const show = () => (readout.textContent = label);
      const go = () => {
        entry.scrollIntoView({ behavior: 'smooth', block: 'center' });
        entry.classList.add('is-flash');
        setTimeout(() => entry.classList.remove('is-flash'), 1600);
      };
      g.addEventListener('mouseenter', show);
      g.addEventListener('focus', show);
      g.addEventListener('click', go);
      g.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); } });
    });
  }
  el('circle', { class: 'hub', cx: C, cy: C, r: 3 });

  const idle = `${total} รายการที่ระบุปี · ชี้ที่จุดเพื่ออ่าน`;
  readout.textContent = idle;
  svg.addEventListener('mouseleave', () => (readout.textContent = idle));
})();

// Stat figures are counted from the entries so they never drift from the log
(function stats() {
  const all = document.querySelectorAll('.entry');
  const set = (k, v) => document.querySelectorAll(`[data-stat="${k}"]`).forEach((n) => (n.textContent = v));
  set('total', all.length);
  set('award', [...all].filter((e) => e.dataset.kind === 'award').length);
})();

// Image viewer for log buttons and gallery photos
(function viewer() {
  const dlg = document.getElementById('viewer');
  const img = document.getElementById('viewer-img');
  const cap = document.getElementById('viewer-cap');
  const open = (src, text) => {
    img.src = src; img.alt = text; cap.textContent = text;
    dlg.showModal();
  };
  document.querySelectorAll('.see').forEach((b) =>
    b.addEventListener('click', () => open(b.dataset.img, b.dataset.cap)));
  document.querySelectorAll('.gallery figure').forEach((f) => {
    const i = f.querySelector('img');
    f.tabIndex = 0;
    const go = () => open(i.src, f.querySelector('figcaption')?.textContent || i.alt);
    f.addEventListener('click', go);
    f.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') go(); });
  });
  dlg.addEventListener('click', (ev) => { if (ev.target === dlg) dlg.close(); });
})();

// One entrance: fade and rise as blocks scroll into view
(function reveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) return items.forEach((n) => n.classList.add('is-in'));
  const io = new IntersectionObserver((list) => {
    list.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach((n) => io.observe(n));
})();
