/* OverLive overlay engine — shared by the gallery, the studio and overlay.html */
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const T = (k, l, d) => ({k, l, d});
const N = (k, l, d) => ({k, l, d, n: 1});

const CATEGORIES = {
  essentials: 'Essentials', scenes: 'Scenes', alerts: 'Alerts & goals',
  widgets: 'Widgets', sports: 'Sports'
};

const scene = (id, name, t1, t2, m) => ({
  id, name, cat: 'scenes', w: 1920, h: 1080, full: 1,
  desc: 'Full-screen scene with an optional live countdown.',
  f: [T('t1', 'Title', t1), T('t2', 'Subtitle', t2), N('m', 'Countdown (minutes, 0 = off)', m)],
  r: v => `<div class="glow"></div><h1>${esc(v.t1)}</h1><p>${esc(v.t2)}</p>` +
          (+v.m ? `<div class="cd" data-m="${v.m}">--:--</div>` : '')
});

const OVERLAYS = [
  { id: 'lower-third', name: 'Lower third', cat: 'essentials', w: 480, h: 110,
    desc: 'Name and title bar with an accent stripe.',
    f: [T('t1', 'Name', 'Your Name'), T('t2', 'Title', 'Streamer & creator')],
    r: v => `<i class="bar"></i><div><b>${esc(v.t1)}</b><span>${esc(v.t2)}</span></div>` },

  { id: 'webcam', name: 'Webcam frame', cat: 'essentials', w: 480, h: 270,
    desc: 'Glowing frame with a name tag. The centre stays transparent.',
    f: [T('t1', 'Name tag', 'YourName')],
    r: v => `<em>${esc(v.t1)}</em>` },

  { id: 'live', name: 'Live badge', cat: 'essentials', w: 170, h: 54,
    desc: 'Pulsing corner badge.',
    f: [T('t1', 'Text', 'LIVE')],
    r: v => `<i class="dot"></i><b>${esc(v.t1)}</b>` },

  { id: 'latest', name: 'Latest follower', cat: 'alerts', w: 380, h: 84,
    desc: 'Small label for your newest follower or sub.',
    f: [T('t1', 'Label', 'Latest follower'), T('t2', 'Name', 'NewViewer')],
    r: v => `<div><span>${esc(v.t1)}</span><b>${esc(v.t2)}</b></div>` },

  { id: 'alert', name: 'Alert box', cat: 'alerts', w: 560, h: 160,
    desc: 'Big alert card for follows, subs and raids.',
    f: [T('t1', 'Event', 'New follower'), T('t2', 'Name', 'NewViewer')],
    r: v => `<span>${esc(v.t1)}</span><b>${esc(v.t2)}</b>` },

  { id: 'goal', name: 'Goal bar', cat: 'alerts', w: 520, h: 100,
    desc: 'Progress bar for follower, sub or donation goals.',
    f: [T('t1', 'Label', 'Follower goal'), N('n1', 'Current', 420), N('n2', 'Target', 500)],
    r: v => { const p = Math.max(0, Math.min(100, v.n1 / (v.n2 || 1) * 100));
      return `<div class="row"><span>${esc(v.t1)}</span><b>${esc(v.n1)} / ${esc(v.n2)}</b></div><div class="track"><i style="width:${p}%"></i></div>`; } },

  scene('starting', 'Starting soon', 'Starting soon', 'Grab a drink, the stream begins shortly', 5),
  scene('brb', 'Be right back', 'Be right back', 'Back in a few minutes', 3),
  scene('ending', 'Stream ending', 'Thanks for watching', 'See you next time', 0),

  { id: 'nowplaying', name: 'Now playing', cat: 'widgets', w: 440, h: 112,
    desc: 'Current song with an animated equaliser.',
    f: [T('t1', 'Song', 'Midnight Drive'), T('t2', 'Artist', 'Neon Coast')],
    r: v => `<div class="art"><u></u><u></u><u></u><u></u></div><div><b>${esc(v.t1)}</b><span>${esc(v.t2)}</span></div>` },

  { id: 'countdown', name: 'Countdown timer', cat: 'widgets', w: 320, h: 120,
    desc: 'Live timer that counts down from the minutes you set.',
    f: [T('t1', 'Label', 'Starting in'), N('m', 'Minutes', 10)],
    r: v => `<span>${esc(v.t1)}</span><div class="cd" data-m="${v.m}">--:--</div>` },

  { id: 'socials', name: 'Social bar', cat: 'widgets', w: 760, h: 72,
    desc: 'Show where viewers can find you.',
    f: [T('t1', 'Twitch', '@yourname'), T('t2', 'YouTube', '@yourname'), T('t3', 'Discord', 'discord.gg/you')],
    r: v => [['Twitch', v.t1], ['YouTube', v.t2], ['Discord', v.t3]].map(x => `<p><u>${x[0]}</u>${esc(x[1])}</p>`).join('') },

  { id: 'ticker', name: 'News ticker', cat: 'widgets', w: 1280, h: 60,
    desc: 'Scrolling message bar for schedules and announcements.',
    f: [T('t1', 'Message', 'Streaming Mon, Wed and Fri at 7pm. Use code YOURNAME in the shop. Follow for more.')],
    r: v => `<b>UPDATE</b><div class="mq"><span>${esc(v.t1)}</span></div>` },

  { id: 'chat', name: 'Chat box', cat: 'widgets', w: 400, h: 600,
    desc: 'Twitch chat. Enter your channel, or leave blank for a demo.',
    f: [T('ch', 'Twitch channel', '')],
    r: v => v.ch && !v.demo
      ? `<iframe src="https://www.twitch.tv/embed/${encodeURIComponent(v.ch)}/chat?darkpopout&parent=${location.hostname || 'localhost'}"></iframe>`
      : ['Nova|that was insane','Kai|GG!!','Mira|first time here, love the setup','Jax|clip that','Sol|let\'s gooo'].map(x => { x = x.split('|'); return `<p><b>${x[0]}</b> ${x[1]}</p>`; }).join('') },

  { id: 'scoreboard', name: 'Mini scoreboard', cat: 'sports', w: 480, h: 88,
    desc: 'Simple two-team score strip.',
    f: [T('t1', 'Home', 'HOME'), N('n1', 'Home score', 2), T('t2', 'Away', 'AWAY'), N('n2', 'Away score', 1)],
    r: v => `<span>${esc(v.t1)}</span><b>${esc(v.n1)}</b><i>:</i><b>${esc(v.n2)}</b><span>${esc(v.t2)}</span>` }
];

/* Overlay that lives on its own site (kept from the original project) */
const EXTERNAL = [{
  id: 'football-scoreboard', name: 'Football scoreboard', cat: 'sports', external: true,
  desc: 'Advanced football scoreboard with its own control panel.',
  previews: [1, 2, 3, 4].map(i => `images/football-scoreboard/preview-${i}.png`),
  panel: 'https://secretpepper.github.io/football-scoreboard/control.html'
}];

const find = id => OVERLAYS.find(o => o.id === id);
const COLOR = '#8b5cf6';

/* Read values: defaults, overridden by URL params */
function values(o, params) {
  const v = {s: 1, w: o.w, h: o.h, c: COLOR};
  o.f.forEach(f => v[f.k] = f.d);
  for (const k in v) if (params.has(k)) {
    const raw = params.get(k), num = typeof v[k] === 'number' || (o.f.find(f => f.k === k) || {}).n;
    v[k] = num ? (isNaN(+raw) ? v[k] : +raw) : raw;
  }
  return v;
}

/* Only values that differ from the defaults go in the link, so every size gets its own URL */
function query(o, v) {
  const base = values(o, new URLSearchParams()), q = new URLSearchParams({o: o.id});
  for (const k in base) if (String(v[k]) !== String(base[k])) q.set(k, v[k]);
  return q;
}

function html(o, v) {
  const s = v.s;
  return `<div class="ov k-${o.id}" style="--c:${esc(v.c)};font-size:${16 * s}px;width:${v.w * s}px;height:${v.h * s}px">${o.r(v)}</div>`;
}

/* Draw an overlay into el. fit = shrink/grow to sit inside el (used for previews). */
function mount(el, o, v, fit) {
  el.innerHTML = html(o, v);
  const node = el.firstChild, now = Date.now();
  node.querySelectorAll('[data-m]').forEach(n => n.dataset.end = now + n.dataset.m * 6e4);
  if (!fit) return;
  const w = v.w * v.s, h = v.h * v.s;
  const k = Math.min(el.clientWidth / w, el.clientHeight / h) * (o.full ? 1 : .78);
  node.style.cssText += `;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(${Math.min(k, 3)})`;
}

setInterval(() => document.querySelectorAll('[data-end]').forEach(n => {
  const t = Math.max(0, Math.round((n.dataset.end - Date.now()) / 1000));
  n.textContent = String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
}), 500);
