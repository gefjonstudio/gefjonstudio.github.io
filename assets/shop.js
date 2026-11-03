// Gefjon Studio: flip through the crate, drop the needle on Sound Sleep samples.
(() => {
  let audio = null, current = null;
  const crate = document.querySelector('.crate');
  if (crate) {
    const sleeves = [...crate.querySelectorAll('.sleeve')];
    const n = sleeves.length;
    const now = document.querySelector('.now');
    const count = document.querySelector('.crate-ctl .count');
    const data = JSON.parse(document.getElementById('crate-data').textContent);
    let active = 0, busy = false;

    const place = () => sleeves.forEach((s, i) => {
      const pos = (i - active + n) % n;
      s.dataset.pos = pos;
      s.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
      s.tabIndex = -1;
    });
    const render = () => {
      const d = data[active];
      now.querySelector('h2').textContent = d.name;
      now.querySelector('.what').textContent = d.what;
      now.querySelector('.line').textContent = d.line;
      now.querySelector('ol').innerHTML = d.tracks.map((t, i) => `<li><span>A${i + 1}</span>${t}</li>`).join('');
      const acts = now.querySelector('.acts');
      acts.querySelector('.primary').outerHTML = d.store
        ? `<a class="btn primary" href="${d.store}">Get it on the App Store ${ICON_OUT}</a>`
        : `<a class="btn primary" href="${d.page}">See ${d.name} ${ICON_NEXT}</a>`;
      acts.querySelector('.secondary').outerHTML = d.store
        ? `<a class="btn ghost secondary" href="${d.page}">What's inside</a>`
        : `<span class="soonnote secondary">In review at Apple. Out soon.</span>`;
      const needle = acts.querySelector('.needle');
      needle.hidden = !d.sample;
      needle.dataset.sample = d.sample || '';
      stop();
      count.textContent = `${active + 1} of ${n}`;
      const get = document.querySelector('.crate-ctl .get');
      if (get) { get.href = d.store || d.page; get.innerHTML = (d.store ? 'Get it ' + ICON_OUT : 'See it ' + ICON_NEXT); }
    };
    const ICON_OUT = document.getElementById('i-out').innerHTML;
    const ICON_NEXT = document.getElementById('i-next').innerHTML;

    const go = (dir) => {
      if (busy) return;
      busy = true;
      if (dir > 0) {
        const front = sleeves[active];
        front.classList.add('lift');
        setTimeout(() => {
          active = (active + 1) % n;
          front.classList.remove('lift');
          place(); render();
          busy = false;
        }, 260);
      } else {
        active = (active - 1 + n) % n;
        place(); render();
        setTimeout(() => (busy = false), 300);
      }
    };
    document.querySelector('.crate-ctl .next').onclick = () => go(1);
    document.querySelector('.crate-ctl .prev').onclick = () => go(-1);
    crate.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    sleeves.forEach((s, i) => s.addEventListener('click', () => {
      if (i === active) location.href = data[i].page;
      else { active = i; place(); render(); }
    }));
    let x0 = null, y0 = null;
    crate.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; });
    crate.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { e.preventDefault(); go(dx < 0 ? 1 : -1); }
    });
    // a swipe shouldn't also count as a click on the front sleeve
    crate.addEventListener('click', (e) => { if (busy) e.stopPropagation(); }, true);
    place(); render();
  }

  // needle drops: any [data-sample] button plays its clip; one at a time
  function stop() {
    if (audio) { audio.pause(); audio = null; }
    if (current) { current.setAttribute('aria-pressed', 'false'); current = null; }
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sample]');
    if (!b) return;
    if (current === b) { stop(); return; }
    stop();
    audio = new Audio(b.dataset.sample);
    audio.volume = 0.85;
    audio.play().catch(() => {});
    audio.onended = stop;
    current = b;
    b.setAttribute('aria-pressed', 'true');
  });
})();
