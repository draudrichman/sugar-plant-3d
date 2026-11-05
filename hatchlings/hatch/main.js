/* The hatchery page: the 3D shelf (engine.js) and the parchment card that
   opens when a creature has hatched. Which eggs are hatched is remembered in
   this browser. */

import { CREATURES as ALL } from './creatures.js';
import { mountHatchery } from './engine.js';

const $ = (id) => document.getElementById(id);

// which shelf: the 3D-modelled creatures (the default), her painted ones, or ?only=<id> for one
const qs = new URLSearchParams(location.search);
const set = qs.get('set') === 'painted' ? 'painted' : '3d';
const CREATURES = qs.get('only') ? ALL.filter((c) => c.id === qs.get('only')) : ALL.filter((c) => (set === '3d') === !!c.model);
document.querySelectorAll('.sets a').forEach((a) => a.setAttribute('aria-current', String(a.dataset.set === set)));
const KEY = 'nt-hatchlings-test';
const saved = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
  } catch {
    return new Set();
  }
};
const save = (set) => {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    /* a private window: progress lasts the visit */
  }
};
const hatched = saved();
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

$('total').textContent = CREATURES.length;
const tally = () => ($('count').textContent = CREATURES.filter((c) => hatched.has(c.id)).length);
tally();

let open = null;
function showCard(id) {
  const c = CREATURES.find((x) => x.id === id);
  if (!c) return;
  open = id;
  $('cardNo').textContent = `Hatchling no. ${c.n}`;
  $('cardName').textContent = c.name;
  $('cardDis').textContent = c.disease;
  const tabs = $('tabs');
  tabs.innerHTML = c.sections.map(([label], i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-i="${i}">${esc(label)}</button>`).join('');
  const pick = (i) => {
    tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(Number(b.dataset.i) === i)));
    $('tabBody').innerHTML = `<p>${esc(c.sections[i][1])}</p>`;
  };
  tabs.onclick = (e) => {
    const b = e.target.closest('button');
    if (b) pick(Number(b.dataset.i));
  };
  pick(0);
  const card = $('card');
  card.hidden = false;
  requestAnimationFrame(() => card.classList.add('on'));
  hatchery.setCard(true);
  $('hint').classList.add('gone');
}
function hideCard() {
  open = null;
  const card = $('card');
  card.classList.remove('on');
  setTimeout(() => {
    if (!open) card.hidden = true;
  }, 450);
  hatchery.setCard(false);
}

const hatchery = await mountHatchery($('scene'), CREATURES, {
  onFocus() {
    document.querySelector('.stage').classList.add('focused');
    $('back').hidden = false;
    $('pager').hidden = true;
    $('hint').classList.add('gone');
  },
  onBack() {
    document.querySelector('.stage').classList.remove('focused');
    $('back').hidden = true;
    pagerShown();
    $('hint').classList.remove('gone');
  },
  onHatching() {
    $('hint').classList.add('gone');
  },
  onHatched(id) {
    hatched.add(id);
    save(hatched);
    tally();
    showCard(id);
  },
  onPage(i) {
    dots(i);
  },
});
hatchery.setHatched([...hatched]);

const back = () => {
  hideCard();
  hatchery.back();
};
$('back').onclick = back;
$('cardBack').onclick = back;
$('again').onclick = () => {
  const id = open;
  hideCard();
  hatched.delete(id);
  save(hatched);
  tally();
  hatchery.reset(id);
  setTimeout(() => hatchery.hatch(id), 350);
};
$('reset').onclick = () => {
  hideCard();
  hatched.clear();
  save(hatched);
  tally();
  hatchery.reset();
  hatchery.back();
};
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !$('back').hidden) back();
});

// the shelf a page at a time: three eggs, or one on a narrow screen
function dots(i) {
  $('dots').innerHTML = Array.from({ length: hatchery.pages() }, (_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('');
}
function pagerShown() {
  $('pager').hidden = hatchery.pages() < 2 || !$('back').hidden;
  dots(hatchery.page_);
}
addEventListener('resize', () => {
  hatchery.page(Math.min(hatchery.page_, hatchery.pages() - 1));
  pagerShown();
});
$('prev').onclick = () => hatchery.page(hatchery.page_ - 1);
$('next').onclick = () => hatchery.page(hatchery.page_ + 1);
pagerShown();

$('veil').classList.add('gone');
