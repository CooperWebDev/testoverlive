const grid = document.getElementById('overlayGrid'), cats = document.getElementById('cats');
const ALL = [...OVERLAYS, ...EXTERNAL];
let current = 'all';

function previewLoop(box, srcs) {
  box.innerHTML = srcs.map((s, i) => `<img class="shot${i ? '' : ' on'}" src="${s}" alt="" loading="${i ? 'lazy' : 'eager'}">`).join('');
  const imgs = box.querySelectorAll('img'); let i = 0;
  setInterval(() => { imgs[i].classList.remove('on'); i = (i + 1) % imgs.length; imgs[i].classList.add('on'); }, 2200);
}

function card(o) {
  const el = document.createElement('article');
  el.className = 'overlay-card';
  el.innerHTML = `<div class="preview ${o.external ? '' : 'checker'}"></div>
    <div class="overlay-info"><div><h3>${o.name}</h3><p>${o.desc}</p></div>
    <a class="use-button" href="${o.external ? o.panel : 'studio.html?o=' + o.id}">${o.external ? 'Open panel' : 'Customise'}</a></div>`;
  return el;
}

function show(cat) {
  current = cat; grid.innerHTML = '';
  cats.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.c === cat));
  const list = ALL.filter(o => cat === 'all' || o.cat === cat);
  document.getElementById('overlayCount').textContent = list.length;
  list.forEach(o => {
    const el = card(o); grid.appendChild(el);
    const box = el.querySelector('.preview');
    if (o.external) previewLoop(box, o.previews);
    else mount(box, o, Object.assign(values(o, new URLSearchParams()), {demo: 1}), true);
  });
}

cats.innerHTML = [['all', 'All'], ...Object.entries(CATEGORIES)].map(([k, n]) => `<button class="category" data-c="${k}">${n}</button>`).join('');
cats.onclick = e => e.target.dataset.c && show(e.target.dataset.c);

/* Hero: a live lower third and goal bar, so the first thing you see is a real overlay */
const demo = document.getElementById('heroDemo');
demo.innerHTML = '<div class="d1"></div><div class="d2"></div><div class="d3"></div>';
[['lower-third', '.d1'], ['goal', '.d2'], ['nowplaying', '.d3']].forEach(([id, sel]) => {
  const o = find(id); mount(demo.querySelector(sel), o, values(o, new URLSearchParams()), false);
});

show('all');
addEventListener('resize', () => show(current));
