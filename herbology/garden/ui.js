/* The stand-in UI for one plant: title, garden-care cards, the meter, test
   buttons. plant.html?p=<id> loads plants/<id>.js and the plant's entry in
   the catalog. In the game this file is replaced by React; the engine and the
   plant modules carry over unchanged. */
import { mountGarden } from './engine.js';
import { CATALOG, byId, deck } from './catalog.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export async function bootPage() {
  const id = new URLSearchParams(location.search).get('p') || 'mastitis';
  const entry = byId(id);
  if (!entry) { document.body.textContent = `No plant called "${id}".`; return; }
  const plant = (await import(`../plants/${id}.js`)).default;
  const idx = CATALOG.indexOf(entry);
  const prev = CATALOG[(idx + CATALOG.length - 1) % CATALOG.length], next = CATALOG[(idx + 1) % CATALOG.length];

  document.title = entry.name;
  if (plant.look?.bg) plant.look.bg.forEach((c, i) => document.documentElement.style.setProperty(`--bg${i}`, c));
  const cards = deck(id, plant.decoys ?? 2);
  const right = cards.filter((c) => c.ok).length;

  document.body.innerHTML = `
  <div class="app">
    <main class="stage" id="stage">
      <canvas id="c" aria-label="${esc(entry.name)}, an animated 3D plant creature"></canvas>
      <div class="title">
        <div class="kicker"><a href="./">Mother Nature's Herbology</a> · 3D test · ${entry.n} of ${CATALOG.length}</div>
        <h1>${esc(entry.name)}</h1>
        <div class="sub">${esc(entry.condition)}</div>
      </div>
      <div class="bubble" id="bubble" aria-live="polite"></div>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>
      <div class="hint">Drag to turn it. Choose the right garden care.</div>
      <div class="stats" id="stats"></div>
    </main>
    <aside class="panel">
      <section class="card">
        <div class="k">Garden care</div>
        <h2>${esc(plant.careTitle || 'Heal the plant')}</h2>
        <p>${right} of these treat ${esc(entry.condition.toLowerCase())}. ${cards.length - right} belong to other plants.</p>
        <div class="tools" id="tools"></div>
        <div class="meter">
          <div class="row"><span>Cursed</span><span id="pct">0%</span><span>Healed</span></div>
          <div class="bar"><i id="bar"></i></div>
        </div>
        ${entry.draft ? '<div class="draft">Draft: she has not written this plant up yet, so these cards are placeholders.</div>' : ''}
      </section>
      <section class="card">
        <details>
          <summary>What the plant is showing</summary>
          <ul>${(plant.shows || []).map((s) => `<li>${s}</li>`).join('')}</ul>
          ${plant.healedNote ? `<p>${plant.healedNote}</p>` : ''}
        </details>
      </section>
      <section class="card">
        <details>
          <summary>Signs and symptoms (her doc)</summary>
          <ul>${entry.signs.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
        </details>
      </section>
      <section class="dev">
        <div class="k">Test controls</div>
        <h2>Animation states</h2>
        <div class="btns">
          <button type="button" data-act="wrong">Wrong card</button>
          <button type="button" data-act="right">Right card</button>
          <button type="button" data-act="heal">Heal now</button>
          <button type="button" data-act="reset">Reset</button>
        </div>
        <label>Health <span id="hval">0%</span>
          <input type="range" id="health" min="0" max="100" value="0" step="1">
        </label>
      </section>
      <nav class="nav"><a href="plant.html?p=${prev.id}">← ${esc(prev.name)}</a><a href="plant.html?p=${next.id}">${esc(next.name)} →</a></nav>
    </aside>
  </div>`;

  let toastTimer = 0;
  const toast = (msg, tone = '', ms = 3400) => {
    const el = $('#toast'); el.textContent = msg; el.dataset.tone = tone; el.dataset.on = 'true';
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (el.dataset.on = 'false'), ms);
  };
  const setMeter = (v) => {
    $('#bar').style.width = `${Math.round(v * 100)}%`; $('#pct').textContent = `${Math.round(v * 100)}%`;
    $('#health').value = Math.round(v * 100); $('#hval').textContent = `${Math.round(v * 100)}%`;
  };

  let garden;
  try {
    garden = mountGarden({
      canvas: $('#c'), container: $('#stage'), plant: { ...plant, rightNeeded: right }, bubble: $('#bubble'),
      onEvent(e) {
        if (e.type === 'stats') $('#stats').textContent = `${e.fps.toFixed(0)} fps · ${e.calls} draws · ${(e.triangles / 1000).toFixed(1)}k tris`;
        if (e.type === 'progress') setMeter(e.value);
        if (e.type === 'healed') { setMeter(1); toast(`Healing potions: ${entry.potions}`, 'good', 6500); }
      },
    });
  } catch (err) {
    const m = document.createElement('div'); m.className = 'nogl';
    m.textContent = 'This test needs WebGL, which this browser has turned off. Try current Chrome, Edge, Safari or Firefox.';
    $('#stage').append(m);
    throw err;
  }

  const used = new Set();
  const toolsEl = $('#tools');
  function renderTools() {
    toolsEl.innerHTML = '';
    for (const c of cards) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'tool'; b.title = c.why;
      b.innerHTML = `<span class="ic" aria-hidden="true">${c.ic}</span><span>${esc(c.name)}</span>`;
      b.dataset.done = String(used.has(c.id)); b.disabled = used.has(c.id);
      b.addEventListener('click', () => {
        if (garden.healed) return;
        if (!c.ok) { garden.answer(false); b.dataset.bad = 'false'; void b.offsetWidth; b.dataset.bad = 'true'; toast(c.why, 'bad'); return; }
        used.add(c.id); b.dataset.done = 'true'; b.disabled = true;
        toast(`${c.name}: ${c.why}`, 'good');
        garden.answer(true);
      });
      toolsEl.append(b);
    }
  }
  renderTools(); setMeter(0);

  document.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => {
    const a = b.dataset.act;
    if (a === 'wrong' || a === 'right') garden.react(a);
    if (a === 'heal') garden.heal();
    if (a === 'reset') { garden.reset(); used.clear(); renderTools(); setMeter(0); }
  }));
  $('#health').addEventListener('input', (e) => { garden.setHealth(e.target.value / 100); $('#hval').textContent = `${e.target.value}%`; });

  window.__plant = { ...garden.debug, garden, answer: garden.answer, react: garden.react, heal: garden.heal, reset: () => { garden.reset(); used.clear(); renderTools(); setMeter(0); }, setHealth: garden.setHealth };
}
