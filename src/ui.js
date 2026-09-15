// The DOM layer over the room: top bar, compass, hint, one slide-in panel per wall,
// a detail view that drills into one item, and the badge scanner overlay.
import { profile, experiences, projects, videos, competitions, topPercent } from './data.js';

const WALLS = [['about', 'About'], ['experiences', 'Experiences'], ['projects', 'Projects'], ['competitions', 'Competitions']];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = n => n.toLocaleString('en-US');
const link = (href, text) => `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(text)}</a>`;
const pct = (r, of) => { const t = topPercent(r, of); return `${t < 10 ? t.toFixed(1) : Math.round(t)}%`; };

function aboutHTML() {
  return `
    <p class="lede">${esc(profile.tagline)}. ${esc(profile.intro)}</p>
    ${profile.bio.map(p => `<p>${esc(p)}</p>`).join('')}
    <h3>Education</h3>
    <ol class="tl">${profile.education.map(e => `<li><span class="when">${esc(e.when)}</span><span class="what">${esc(e.what)}</span><span class="where">${esc(e.where)}</span></li>`).join('')}</ol>
    <h3>Languages</h3>
    <ul class="langs">${profile.languages.map(([l, v]) => `<li><b>${esc(l)}</b> ${esc(v)}</li>`).join('')}</ul>
    <h3>Contact</h3>
    <p>${profile.emails.map(e => `<a href="mailto:${esc(e)}">${esc(e)}</a>`).join('<br>')}<br>${link(profile.github, profile.github.replace('https://', ''))}<br>${link(profile.kaggle, profile.kaggle.replace('https://www.', ''))}<br>${link(profile.youtube, 'YouTube playlist')}</p>`;
}
function expHTML() {
  return `<p class="lede">Three internships. Click a badge on the wall to scan it, or open the details here.</p>` +
    experiences.map((e, i) => `
    <article class="item" data-item="experience:${i}" tabindex="0">
      <h3>${esc(e.company)}</h3>
      <p class="meta">${esc(e.role)}<br>${esc(e.when)}</p>
      <p>${esc(e.summary)}</p>
      <button class="more" type="button" data-detail="experience:${i}">Details</button>
    </article>`).join('');
}
function projHTML() {
  const items = projects.map((p, i) => `
    <article class="item" data-item="project:${i}" tabindex="0">
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.blurb)}</p>
      <p class="skills">${esc(p.stack)}</p>
      <p class="row-links"><button class="more" type="button" data-detail="project:${i}">Details${p.video ? ' and demo' : ''}</button>${p.live ? link(p.live, 'Open the site') : ''}</p>
    </article>`).join('');
  const vids = videos.map((v, i) => `
    <article class="item" data-item="video:${i}" tabindex="0">
      <h3>${esc(v.title)}</h3>
      <p class="meta">YouTube, ${esc(v.date)}</p>
      <button class="more" type="button" data-detail="video:${i}">Watch</button>
    </article>`).join('');
  return `<p class="lede">Things I built outside a leaderboard. Click a monitor on the wall, or open the details here.</p>${items}
    <h3>Videos</h3>
    <p>My YouTube series: a deep learning paper explained, then rebuilt in PyTorch. The rack under the monitors shows these eight; click one to play it here.</p>${vids}
    <p>${link(profile.youtube, 'Full playlist on YouTube')}</p>`;
}
function compHTML() {
  const ranked = competitions.ranked.map((r, i) => `
    <article class="item" data-item="competition:${i}" tabindex="0">
      <div class="rankline"><span class="rank">${r.rank} <small>of ${fmt(r.of)}</small></span><span class="top ${esc(r.medal || '')}">top ${pct(r.rank, r.of)}</span></div>
      <h3>${esc(r.name)}</h3>
      <p class="meta">${esc(r.host)}</p>
      <p>${esc(r.note)}</p>
      <button class="more" type="button" data-detail="competition:${i}">Details${r.url ? ' and code' : ''}</button>
    </article>`).join('');
  const entered = competitions.entered.map(e => `<li>${esc(e.name)}<span>${esc(e.host)}. ${esc(e.note)}${e.url ? ' ' + link(e.url, 'Code') : ''}</span></li>`).join('');
  return `<p class="lede">Best results first, ranks as shown on ${link(profile.kaggle, 'my Kaggle profile')} or the organizer's leaderboard. Click a row on the screen, or open the details here.</p>${ranked}
    <h3>Also entered</h3><ul class="entered">${entered}</ul>`;
}

// One item, expanded. Returns the pieces the detail view renders.
function detail(kind, i) {
  if (kind === 'experience') {
    const e = experiences[i];
    return { back: 'experiences', eyebrow: `Internship, ${e.when}`, title: e.company, meta: e.role,
      body: `<p>${esc(e.summary)}</p><h4>What I did</h4><ul>${e.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul><h4>Stack</h4><p>${esc(e.skills)}</p>` };
  }
  if (kind === 'competition') {
    const c = competitions.ranked[i];
    const code = c.url ? link(c.url, 'Code and write-up on GitHub') : `<span class="muted">${esc(c.codeNote || 'No public code for this one.')}</span>`;
    return { back: 'competitions', eyebrow: `${c.host}, ${c.rank} of ${fmt(c.of)}, top ${pct(c.rank, c.of)}`, title: c.name, meta: c.note,
      body: `<h4>What it is</h4><p>${esc(c.what)}</p><h4>My approach</h4><p>${esc(c.approach)}</p><h4>Links</h4><p class="d-links">${code}${c.page ? '<br>' + link(c.page, 'Competition page') : ''}</p>` };
  }
  if (kind === 'project') {
    const p = projects[i];
    const links = [];
    if (p.live) links.push(link(p.live, 'Open the site'));
    if (p.url) links.push(link(p.url, 'Repository on GitHub'));
    if (p.playlist) links.push(link(profile.youtube, 'Videos on YouTube'));
    if (!p.url && !p.live) links.push('<span class="muted">Private repository</span>');
    // A demo loops silently: `demo` is a video file under public/ (for example 'demos/masef-helper.mp4'),
    // `video` a YouTube id. The section only appears once one exists, with the links right under it.
    let demo = '';
    if (p.demo) demo = `<div class="embed"><video src="${esc(import.meta.env.BASE_URL + p.demo)}" autoplay muted loop playsinline preload="metadata" aria-label="Demo of ${esc(p.title)}"></video></div>`;
    else if (p.shots && p.shots.length) demo = `<div class="embed slides" aria-label="Screens of ${esc(p.title)}">${p.shots.map((s, k) => `<img src="${esc(import.meta.env.BASE_URL + s)}" alt="" class="${k === 0 ? 'on' : ''}" loading="${k === 0 ? 'eager' : 'lazy'}">`).join('')}<span class="dots">${p.shots.map((s, k) => `<i class="${k === 0 ? 'on' : ''}"></i>`).join('')}</span></div>`;
    else if (p.video) demo = `<div class="embed"><iframe src="https://www.youtube-nocookie.com/embed/${esc(p.video)}?autoplay=1&mute=1&loop=1&playlist=${esc(p.video)}&controls=0&rel=0" title="Demo of ${esc(p.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    if (demo) demo = `<h4>Demo</h4><div class="demo">${demo}<button class="enlarge" type="button" data-enlarge>Click to enlarge</button></div>`;
    return { back: 'projects', eyebrow: p.year ? `Project, ${p.year}` : 'Project', title: p.title, meta: p.stack,
      body: `<p>${esc(p.blurb)}</p>${demo}<p class="d-links">${links.join('<br>')}</p><h4>How it works</h4><p>${esc(p.details)}</p>` };
  }
  if (kind === 'video') {
    const v = videos[i];
    return { back: 'projects', eyebrow: `YouTube, ${v.date}`, title: v.title, meta: 'From my series: a deep learning paper explained, then rebuilt in PyTorch',
      body: `<div class="embed"><iframe src="https://www.youtube-nocookie.com/embed/${esc(v.id)}" title="${esc(v.title)}" allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>
             <p class="d-links">${link('https://www.youtube.com/watch?v=' + v.id, 'Watch on YouTube')}<br>${link(profile.youtube, 'Full playlist')}</p>` };
  }
  return null;
}

const panel = (id, title, body) => `
  <aside class="panel" data-panel="${id}" aria-label="${title}">
    <div class="p-head"><h2>${title}</h2><button class="p-close" data-close type="button">Hide</button></div>
    <div class="p-body">${body}</div>
  </aside>`;

// `api.controls` and `api.onDetail` are assigned by main.js once the scene exists.
export function buildUI(root) {
  root.innerHTML = `
    <header class="bar">
      <button class="brand" data-go="about" type="button">Abdallah Melhem</button>
      <nav aria-label="Walls">
        ${WALLS.map(([id, l]) => `<button data-go="${id}" type="button">${l}</button>`).join('')}
        <a class="ext" href="${esc(profile.github)}" target="_blank" rel="noopener">GitHub</a>
      </nav>
    </header>
    <p class="hint" id="hint">Drag to look around. Click anything to step closer.</p>
    <div class="compass" id="compass" aria-label="Which wall you face">
      <div class="ring"><div class="needle" id="needle"></div></div>
      ${WALLS.map(([id, l]) => `<button class="c-${id}" data-go="${id}" type="button" aria-label="Face the ${l} wall">${l}</button>`).join('')}
    </div>
    <button class="back" id="back" type="button" hidden>Step back</button>
    ${panel('about', 'About', aboutHTML())}
    ${panel('experiences', 'Experiences', expHTML())}
    ${panel('projects', 'Projects', projHTML())}
    ${panel('competitions', 'Competitions', compHTML())}
    <aside class="panel detail" id="detail" aria-live="polite">
      <div class="p-head"><button class="p-back" id="detail-back" type="button">Back</button><button class="p-close" data-close type="button">Hide</button></div>
      <div class="p-body" id="detail-body"></div>
    </aside>
    <div class="lightbox" id="lightbox" hidden role="dialog" aria-label="Enlarged demo">
      <div class="lb-box" id="lb-box"></div>
      <button class="lb-close" id="lb-close" type="button">Close</button>
    </div>
    <div class="scanner" id="scanner" hidden aria-hidden="true">
      <div class="scan-card">
        <img id="scan-img" alt="">
        <i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>
        <div class="laser"></div>
      </div>
      <div class="status" id="scan-status">Scanning badge</div>
    </div>`;

  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const panels = Object.fromEntries($$('.panel[data-panel]').map(p => [p.dataset.panel, p]));
  const needle = $('#needle'), back = $('#back'), hint = $('#hint');
  const detailEl = $('#detail'), detailBody = $('#detail-body'), detailBack = $('#detail-back');
  const scanner = $('#scanner'), scanStatus = $('#scan-status'), scanImg = $('#scan-img');
  let scanTimers = [];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dismissed = {};
  let open = null, focused = false, detailOpen = false;
  const state = { panelOpen: false };

  function openPanel(id) {
    for (const k in panels) panels[k].classList.toggle('open', k === id);
    open = id; state.panelOpen = !!id || detailOpen;
    document.body.classList.toggle('panel-open', state.panelOpen);
  }
  // "Step back" and the detail's "Back to …" would mean the same thing, so only one shows at a time.
  const syncBack = () => { back.hidden = !focused || detailOpen; };
  // Screenshot slideshows advance on a timer while a detail (or the enlarged view) is open.
  const SLIDE_MS = 2200;
  function runSlides(box) {
    const imgs = [...box.querySelectorAll('img')], dots = [...box.querySelectorAll('.dots i')];
    if (!imgs.length) return null;
    // The box takes the shape of the screenshots, so nothing gets cropped.
    const fit = () => { if (imgs[0].naturalWidth) box.style.aspectRatio = `${imgs[0].naturalWidth} / ${imgs[0].naturalHeight}`; };
    if (imgs[0].complete) fit(); else imgs[0].addEventListener('load', fit, { once: true });
    if (imgs.length < 2 || reduced) return null;
    let k = imgs.findIndex(im => im.classList.contains('on'));
    return setInterval(() => {
      k = (k + 1) % imgs.length;
      imgs.forEach((im, i) => im.classList.toggle('on', i === k));
      dots.forEach((d, i) => d.classList.toggle('on', i === k));
    }, SLIDE_MS);
  }
  let slideTimer = null, lbTimer = null;
  function startSlides() {
    clearInterval(slideTimer); slideTimer = null;
    const box = detailBody.querySelector('.slides');
    if (box) slideTimer = runSlides(box);
    const btn = detailBody.querySelector('[data-enlarge]');
    if (btn) btn.addEventListener('click', openLightbox);
  }
  // Enlarged demo: a copy of the demo box fills the screen; click outside, Close or Escape puts it away.
  const lightbox = $('#lightbox'), lbBox = $('#lb-box');
  function openLightbox() {
    const src = detailBody.querySelector('.demo .embed');
    if (!src) return;
    lbBox.innerHTML = '';
    const copy = src.cloneNode(true);
    lbBox.appendChild(copy);
    lightbox.hidden = false;
    clearInterval(lbTimer); lbTimer = copy.classList.contains('slides') ? runSlides(copy) : null;
  }
  function closeLightbox() { lightbox.hidden = true; lbBox.innerHTML = ''; clearInterval(lbTimer); lbTimer = null; }
  $('#lb-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lightbox.hidden) { e.stopImmediatePropagation(); closeLightbox(); } }, true);
  function hideDetail() {
    clearInterval(slideTimer); slideTimer = null;
    closeLightbox();
    detailOpen = false; detailEl.classList.remove('open');
    detailBody.innerHTML = '';
    state.panelOpen = !!open; document.body.classList.toggle('panel-open', state.panelOpen);
    syncBack();
  }
  function showDetail(kind, i) {
    const d = detail(kind, i);
    if (!d) return;
    detailBack.textContent = `Back to ${d.back}`;
    detailBack.dataset.wall = d.back;
    detailBody.innerHTML = `<p class="eyebrow">${esc(d.eyebrow)}</p><h2>${esc(d.title)}</h2><p class="meta">${esc(d.meta)}</p>${d.body}`;
    detailBody.scrollTop = 0;
    detailOpen = true; detailEl.classList.add('open');
    state.panelOpen = true; document.body.classList.add('panel-open');
    syncBack();
    startSlides();
  }

  $$('[data-go]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.go;
    dismissed[id] = false; hideDetail();
    // Already facing this wall: just bring its panel back.
    if (api.controls?.wall === id && api.controls.settled) openPanel(id);
    api.controls?.goTo(id);
  }));
  // "Hide" collapses the panel for now; turning away and back, or a nav button, brings it back.
  $$('[data-close]').forEach(b => b.addEventListener('click', () => { hideDetail(); openPanel(null); }));
  back.addEventListener('click', () => api.controls?.unfocus());
  detailBack.addEventListener('click', () => { hideDetail(); api.controls?.unfocus(); });
  // Whole items are clickable; the Details button and links inside them keep their own behavior.
  $$('[data-detail]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const [k, i] = b.dataset.detail.split(':'); api.onDetail?.(k, +i); }));
  $$('.item[data-item]').forEach(el => {
    const act = e => { if (e.target.closest('a')) return; const [k, i] = el.dataset.item.split(':'); api.onDetail?.(k, +i); };
    el.addEventListener('click', act);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target === el) act(e); });
  });

  const api = {
    state,
    controls: null,
    onDetail: null,
    setWall(wall, settled) {
      $$('[data-go]').forEach(b => b.classList.toggle('active', b.dataset.go === wall));
      if (settled && !dismissed[wall]) { if (!detailOpen) openPanel(wall); else if (open !== wall) openPanel(wall); }
      else if (!settled && !focused) { hideDetail(); openPanel(null); }
    },
    setYaw(yaw) { needle.style.transform = `rotate(${180 + (yaw * 180) / Math.PI}deg)`; },
    highlight(kind, index) {
      $$('.item.active').forEach(el => el.classList.remove('active'));
      const el = root.querySelector(`[data-item="${kind}:${index}"]`);
      if (el) { el.classList.add('active'); el.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' }); }
    },
    setFocused(f) { focused = f; if (!f) { hideDetail(); api.cancelScan(); } syncBack(); },
    open(wall) { dismissed[wall] = false; openPanel(wall); },
    showDetail,
    hideDetail,
    hideHint() { hint.classList.add('gone'); },
    // Scanner: a small QR card pops up in front of the room, a laser sweeps it, it reports what it read, then it goes away.
    scan(qrSrc, label) {
      scanTimers.forEach(clearTimeout); scanTimers = [];
      // The card's pop-in and fade-out are driven by animation frames, not CSS animations, so they cannot stall.
      const tween = (from, to, ms) => new Promise(done => {
        const t0 = performance.now();
        let finished = false;
        const finish = () => { if (finished) return; finished = true; scanner.style.opacity = to; scanner.style.transform = `translate(-50%, -50%) scale(${0.85 + 0.15 * to})`; done(); };
        const step = () => {
          if (finished) return;
          const k = reduced ? 1 : Math.min(1, (performance.now() - t0) / ms);
          const e = 1 - Math.pow(1 - k, 3), v = from + (to - from) * e;
          scanner.style.opacity = v;
          scanner.style.transform = `translate(-50%, -50%) scale(${0.85 + 0.15 * v})`;
          if (k < 1) requestAnimationFrame(step); else finish();
        };
        step();
        // Animation frames pause in a background tab; a timer guarantees the tween still ends.
        setTimeout(finish, ms + 120);
      });
      return new Promise(resolve => {
        const sweep = reduced ? 250 : 1100;
        scanImg.src = qrSrc;
        scanStatus.textContent = 'Scanning badge';
        scanner.classList.remove('read');
        scanner.style.opacity = 0;
        scanner.hidden = false;
        tween(0, 1, 220);
        // Laser: down and back up once over the sweep.
        const laser = scanner.querySelector('.laser'), t0 = performance.now();
        const sweepStep = () => {
          const k = Math.min(1, (performance.now() - t0) / sweep);
          laser.style.top = `${5 + (1 - Math.cos(k * Math.PI * 2)) / 2 * 89}%`;
          if (k < 1 && !scanner.hidden) requestAnimationFrame(sweepStep);
        };
        if (!reduced) sweepStep();
        scanTimers.push(setTimeout(() => { scanStatus.textContent = `Read: ${label}`; scanner.classList.add('read'); }, sweep));
        scanTimers.push(setTimeout(() => tween(1, 0, 260).then(() => { scanner.hidden = true; resolve(); }), sweep + 600));
      });
    },
    cancelScan() { scanTimers.forEach(clearTimeout); scanTimers = []; scanner.hidden = true; },
  };
  return api;
}
