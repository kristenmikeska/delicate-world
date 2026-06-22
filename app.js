// ─── DELICATE WORLD — APP ────────────────────────────────────────────────────

// ── Navigation ───────────────────────────────────────────────────────────────

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('#nav .nav-links a').forEach(a => a.classList.remove('active'));
  const sec = document.getElementById('section-' + id);
  if (sec) sec.classList.add('active');
  const link = document.querySelector(`#nav .nav-links a[data-section="${id}"]`);
  if (link) link.classList.add('active');
  // Reset vault to desk scene when navigating to vault
  if (id === 'vault') closeVaultItem();
}

// ── Duality Slider ───────────────────────────────────────────────────────────

let dualityImages = { solar: [], soomi: [] };
let dualityIndex = { solar: 0, soomi: 0 };
let isDragging = false;

function initDuality() {
  const hero = document.querySelector('.duality-hero');
  const divider = document.querySelector('.duality-divider');
  const solarSide = document.querySelector('.duality-side.solar-side');
  const soomiSide = document.querySelector('.duality-side.soomi-side');

  ['solar', 'soomi'].forEach(side => {
    const container = document.querySelector(`.duality-side.${side}-side .bg-images`);
    const imgs = DUALITY[side].images;
    dualityImages[side] = [];
    imgs.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      if (i === 0) img.classList.add('visible');
      container.appendChild(img);
      dualityImages[side].push(img);
    });
  });

  setInterval(() => cycleImage('solar'), 4000);
  setInterval(() => cycleImage('soomi'), 5200);

  const onMove = (clientX) => {
    if (!isDragging) return;
    const rect = hero.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(15, Math.min(85, pct));
    solarSide.style.flex = `0 0 ${pct}%`;
    soomiSide.style.flex = `0 0 ${100 - pct}%`;
    divider.style.left = pct + '%';
  };

  divider.addEventListener('mousedown', () => { isDragging = true; });
  hero.addEventListener('mousemove', e => onMove(e.clientX));
  window.addEventListener('mouseup', () => { isDragging = false; });

  divider.addEventListener('touchstart', () => { isDragging = true; }, { passive: true });
  hero.addEventListener('touchmove', e => onMove(e.touches[0].clientX), { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });
}

function cycleImage(side) {
  const imgs = dualityImages[side];
  if (!imgs.length) return;
  imgs[dualityIndex[side]].classList.remove('visible');
  dualityIndex[side] = (dualityIndex[side] + 1) % imgs.length;
  imgs[dualityIndex[side]].classList.add('visible');
}

// ── Characters ───────────────────────────────────────────────────────────────

function buildCharacters() {
  const inner = document.querySelector('#section-characters .inner');
  inner.innerHTML = '';

  GROUPS.forEach(group => {
    const block = document.createElement('div');
    block.className = 'group-block';
    block.innerHTML = `
      <div class="group-meta">
        <div class="group-label">Group</div>
        <div class="group-title">${group.label}</div>
        <div class="group-sub">${group.sub}</div>
      </div>
      <div class="bubble-grid" id="group-${group.id}"></div>
    `;
    inner.appendChild(block);

    const grid = block.querySelector('.bubble-grid');
    group.characters.forEach(char => {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      const primaryThread = char.connections && char.connections.length
        ? char.connections[0].split('—')[0].trim()
        : (char.alias || char.role);
      const evidenceCount = (char.images || []).length;
      bubble.innerHTML = `
        ${char.pfp
          ? `<img class="bubble-img" src="${char.pfp}" alt="${char.name}" style="border-color:${char.accent}44">`
          : `<div class="bubble-placeholder">👤</div>`}
        <div class="bubble-copy">
          <div class="bubble-name">${char.name}</div>
          <div class="bubble-role" style="color:${char.accent}">${char.role}</div>
          <div class="bubble-thread">${primaryThread}</div>
          ${evidenceCount ? `<div class="bubble-evidence">${evidenceCount} images</div>` : ''}
        </div>
      `;
      bubble.addEventListener('click', () => openCharModal(char));
      grid.appendChild(bubble);
    });
  });
}

// ── Character Modal ───────────────────────────────────────────────────────────

let lightboxImages = [];
let lightboxIndex = 0;

function openCharModal(char) {
  const overlay = document.getElementById('modal-overlay');
  const modal = overlay.querySelector('.modal');

  const pfpHTML = char.pfp
    ? `<img class="modal-pfp" src="${char.pfp}" alt="${char.name}" style="border-color:${char.accent}">`
    : `<div class="modal-pfp-placeholder">👤</div>`;

  const connectionsHTML = char.connections && char.connections.length
    ? `<div class="modal-section">
        <div class="modal-section-label">Connections</div>
        <ul class="connections-list">${char.connections.map(c => `<li>${c}</li>`).join('')}</ul>
       </div>` : '';

  const loveHTML = char.typeoflove
    ? `<div class="modal-section">
        <div class="modal-section-label">Type of Love</div>
        <div class="type-love" style="border-color:${char.accent}">${char.typeoflove}</div>
       </div>` : '';

  const arcHTML = char.arc
    ? `<div class="modal-section">
        <div class="modal-section-label">Arc</div>
        <p>${char.arc}</p>
       </div>` : '';

  const galleryImages = char.images || [];
  const galleryHTML = galleryImages.length
    ? `<div class="modal-section">
        <div class="modal-section-label">Gallery</div>
        <div class="modal-gallery">
          ${galleryImages.map((src, i) => `<img src="${src}" alt="" data-index="${i}" data-gallery="char">`).join('')}
        </div>
       </div>` : '';

  modal.innerHTML = `
    <button class="modal-close" id="modal-close-btn">✕</button>
    <div class="modal-top">
      ${pfpHTML}
      <div class="modal-info">
        <div class="name">${char.name}</div>
        ${char.alias ? `<div class="alias">aka ${char.alias}</div>` : ''}
        <span class="role-tag" style="color:${char.accent};border-color:${char.accent}55;background:${char.accent}11">${char.role}</span><br>
        <div class="born">b. ${char.born} · age ${char.age2019} in 2019</div>
      </div>
    </div>
    <div class="modal-body">
      <div class="modal-section">
        <div class="modal-section-label">About</div>
        <p>${char.desc}</p>
      </div>
      ${loveHTML}
      ${arcHTML}
      ${connectionsHTML}
      ${galleryHTML}
    </div>
  `;

  lightboxImages = galleryImages;
  modal.querySelectorAll('.modal-gallery img').forEach(img => {
    img.addEventListener('click', () => openLightbox(parseInt(img.dataset.index)));
  });

  modal.querySelector('#modal-close-btn').addEventListener('click', closeModal);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ── Relationships ─────────────────────────────────────────────────────────────

function buildRelationships() {
  const inner = document.querySelector('#section-relationships .inner');
  inner.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'rel-grid';
  inner.appendChild(grid);

  RELATIONSHIPS.forEach(rel => {
    const card = document.createElement('div');
    card.className = 'rel-card';
    card.style.borderColor = rel.accent + '44';

    const thumb = rel.images[0]
      ? `<img class="rel-thumb" src="${rel.images[0]}" alt="${rel.label}">`
      : `<div class="rel-thumb-placeholder">🖼</div>`;

    card.innerHTML = `
      ${thumb}
      <div class="rel-info">
        <div class="rel-label" style="color:${rel.accent}">${rel.label}</div>
        <div class="rel-years" style="color:${rel.accent}99">${rel.years}</div>
        <div class="rel-desc">${rel.desc}</div>
      </div>
    `;
    card.addEventListener('click', () => openRelModal(rel));
    grid.appendChild(card);
  });
}

function openRelModal(rel) {
  const overlay = document.getElementById('modal-overlay');
  const modal = overlay.querySelector('.modal');

  lightboxImages = rel.images;

  modal.innerHTML = `
    <button class="modal-close" id="modal-close-btn">✕</button>
    <div class="modal-top">
      <div class="modal-info">
        <div class="name">${rel.label}</div>
        <div class="alias">${rel.years}</div>
        <span class="role-tag" style="color:${rel.accent};border-color:${rel.accent}55;background:${rel.accent}11">Relationship</span>
      </div>
    </div>
    <div class="modal-body">
      <div class="modal-section">
        <div class="modal-section-label">Story</div>
        <p>${rel.desc}</p>
      </div>
    </div>
    <div class="rel-modal-gallery">
      ${rel.images.map((src, i) => `<img src="${src}" alt="" data-index="${i}">`).join('')}
    </div>
  `;

  modal.querySelectorAll('.rel-modal-gallery img').forEach(img => {
    img.addEventListener('click', () => openLightbox(parseInt(img.dataset.index)));
  });

  modal.querySelector('#modal-close-btn').addEventListener('click', closeModal);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function openLightbox(index) {
  lightboxIndex = index;
  const lb = document.getElementById('lightbox');
  lb.querySelector('#lightbox-img').src = lightboxImages[index];
  lb.classList.add('open');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

document.getElementById('lightbox-close').addEventListener('click', closeLightbox);

document.getElementById('lightbox-prev').addEventListener('click', () => {
  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  document.getElementById('lightbox-img').src = lightboxImages[lightboxIndex];
});

document.getElementById('lightbox-next').addEventListener('click', () => {
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
  document.getElementById('lightbox-img').src = lightboxImages[lightboxIndex];
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeLightbox(); closeModal(); }
  if (e.key === 'ArrowLeft') document.getElementById('lightbox-prev').click();
  if (e.key === 'ArrowRight') document.getElementById('lightbox-next').click();
});

// ── Timeline ──────────────────────────────────────────────────────────────────

const MOOD_COLOR = {
  origin: '#8e44ad', tender: '#27ae60', painful: '#c0392b',
  tense: '#e67e22', chaotic: '#e74c3c', bittersweet: '#f39c12',
  'turning point': '#2980b9', resolution: '#1abc9c',
};

const ERA_DATA = {
  recherche:  { name: 'Recherche',         accent: '#c0392b' },
  between:    { name: 'Between Years',     accent: '#2980b9' },
  delicate:   { name: 'Delicate',          accent: '#8e44ad' },
  peace:      { name: 'Peace',             accent: '#27ae60' },
};

let tlIdFilter = null;
let tlEraFilter = null;

function buildTimeline() {
  const inner = document.querySelector('#section-timeline .inner');

  const filters = document.createElement('div');
  filters.className = 'timeline-filters';

  const idFilters = [
    { label: 'All', val: null, color: '#6a5a7a' },
    { label: 'Kim Soomi', val: 'soomi', color: '#8e44ad' },
    { label: 'Solar Lee', val: 'solar', color: '#c0392b' },
  ];
  const eraFilters = [
    { label: 'All Eras', val: null, color: '#6a5a7a' },
    ...Object.entries(ERA_DATA).map(([k,v]) => ({ label: v.name, val: k, color: v.accent })),
  ];

  [...idFilters, { divider: true }, ...eraFilters].forEach(f => {
    if (f.divider) {
      const d = document.createElement('div');
      d.style.cssText = 'width:1px;background:#2a1a3a;margin:0 4px;align-self:stretch';
      filters.appendChild(d);
      return;
    }
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = f.label;
    btn.dataset.val = f.val || '';
    btn.dataset.type = idFilters.includes(f) ? 'id' : 'era';
    btn.style.color = f.color;
    btn.style.borderColor = f.color + '55';
    btn.addEventListener('click', () => {
      if (btn.dataset.type === 'id') tlIdFilter = f.val;
      else tlEraFilter = f.val;
      renderTimeline();
    });
    filters.appendChild(btn);
  });

  inner.appendChild(filters);

  const line = document.createElement('div');
  line.className = 'timeline-line';
  line.id = 'timeline-line';
  inner.appendChild(line);

  renderTimeline();
}

function renderTimeline() {
  const line = document.getElementById('timeline-line');
  line.innerHTML = '';

  const filtered = TIMELINE_DATA.filter(t =>
    (!tlIdFilter || t.identity === tlIdFilter) &&
    (!tlEraFilter || t.era === tlEraFilter)
  );

  filtered.forEach(t => {
    const era = ERA_DATA[t.era] || {};
    const mc = MOOD_COLOR[t.mood] || '#5a4a7a';
    const isSoomi = t.identity === 'soomi';

    const ev = document.createElement('div');
    ev.className = 'timeline-event';
    ev.dataset.id = t.id;

    ev.innerHTML = `
      <div class="ev-header">
        <span class="ev-year">${t.year}</span>
        <span class="ev-title">${t.title}</span>
        ${t.ref ? `<span class="ev-tag" style="color:#8a6aaa;border-color:#3a1a5a22;background:#1a0a2a">${t.ref}</span>` : ''}
        <span class="ev-tag" style="color:${isSoomi?'#8e44ad':'#c0392b'};border-color:${isSoomi?'#8e44ad44':'#c0392b44'};margin-left:auto">${isSoomi?'Soomi':'Solar'}</span>
      </div>
      <div class="ev-era" style="color:${era.accent||'#5a4a6a'}">${era.name||t.era}</div>
      <div class="ev-desc">${t.desc.substring(0, 120)}${t.desc.length>120?'…':''}</div>
      <div class="timeline-event-detail" style="border-color:${mc}">${t.desc}</div>
    `;

    ev.style.position = 'relative';
    const dot = document.createElement('div');
    dot.style.cssText = `position:absolute;left:-30px;top:6px;width:10px;height:10px;border-radius:50%;background:${mc};border:2px solid #08080f;`;
    ev.insertBefore(dot, ev.firstChild);

    ev.addEventListener('click', () => ev.classList.toggle('expanded'));
    line.appendChild(ev);
  });
}

// ── Image path constants ──────────────────────────────────────────────────────
const SI  = 'images/solars-instagram/';
const DG  = 'images/delicate-gram/';
const SW  = 'images/sunwoo/';

// ── Relationship Web ──────────────────────────────────────────────────────────

const WEB_NODES = [
  // Protagonist
  { id:'solar',     label:'Solar',       x:600,  y:355, group:'protagonist', pfp:DG+'solarpfp.jpg' },
  // Lee Family
  { id:'jaesang',   label:'Jaesang Lee', x:240,  y:100, group:'lee-parent' },
  { id:'solji',     label:'Solji Lee',   x:110,  y:188, group:'lee-parent' },
  { id:'jaehyun',   label:'Jaehyun',     x:315,  y:225, group:'lee',         pfp:DG+'jaehyunpfp.jpg' },
  { id:'yein',      label:'Yein',        x:155,  y:302, group:'lee' },
  { id:'juyeon',    label:'Juyeon',      x:248,  y:442, group:'lee',         pfp:DG+'juyeonpfp.jpg' },
  { id:'chaerin',   label:'Chaerin',     x:150,  y:515, group:'lee',         pfp:DG+'chaerinselfie.jpg' },
  // Kim Family
  { id:'dongwoo',   label:'Dongwoo Kim', x:80,   y:562, group:'kim-parent',  deceased:true },
  { id:'sunwoo',    label:'Sunwoo',      x:372,  y:575, group:'gang-leader', pfp:DG+'sunwoopfp.jpg' },
  // Gang
  { id:'hyunjoon',  label:'Hyunjoon',    x:218,  y:668, group:'gang',        pfp:DG+'hyunjoonpfp.jpg' },
  { id:'eric',      label:'Eric',        x:342,  y:710, group:'gang',        pfp:DG+'ericpfp.jpg' },
  { id:'hyunjae',   label:'Hyunjae',     x:462,  y:710, group:'gang' },
  { id:'sangyeon',  label:'Sangyeon',    x:528,  y:650, group:'gang' },
  { id:'haknyeon',  label:'Haknyeon',    x:155,  y:775, group:'gang' },
  { id:'younghoon', label:'Younghoon',   x:435,  y:775, group:'gang' },
  // Castle / NYC friends
  { id:'chanhee',   label:'Chanhee',     x:488,  y:510, group:'castle',      pfp:DG+'chanheepfp.jpg' },
  { id:'kevin',     label:'Kevin',       x:605,  y:598, group:'castle',      pfp:DG+'kevinpfp.jpg' },
  { id:'jacob',     label:'Jacob',       x:698,  y:615, group:'castle',      pfp:DG+'jacobpfp.jpg' },
  { id:'changmin',  label:'Changmin',    x:792,  y:582, group:'castle' },
  // BTS
  { id:'jin',       label:'Jin',         x:880,  y:175, group:'bts',         pfp:DG+'jinpfp.jpg' },
  { id:'jungkook',  label:'Jungkook',    x:965,  y:270, group:'bts',         pfp:DG+'jungkookpfp.jpg' },
  { id:'jimin',     label:'Jimin',       x:1042, y:375, group:'bts',         pfp:DG+'jiminpfp.jpg' },
  { id:'taehyung',  label:'Taehyung',    x:1015, y:465, group:'bts',         pfp:DG+'taepfp.jpg' },
  { id:'yoongi',    label:'Yoongi',      x:952,  y:538, group:'bts',         pfp:DG+'yoongipfp.jpg' },
  { id:'namjoon',   label:'RM',          x:872,  y:568, group:'bts',         pfp:DG+'namjoonpfp.jpg' },
  { id:'hobi',      label:'Hobi',        x:808,  y:532, group:'bts',         pfp:DG+'hobipfp.jpg' },
  // iKON
  { id:'hanbin',    label:'Hanbin',      x:700,  y:72,  group:'ikon',        pfp:DG+'hanbinpfp.jpg' },
  { id:'bobby',     label:'Bobby',       x:792,  y:52,  group:'ikon',        pfp:DG+'bobbypfp.jpg' },
  { id:'junhoe',    label:'Junhoe',      x:848,  y:118, group:'ikon',        pfp:DG+'junepfp.jpg' },
  { id:'jinhwan',   label:'Jinhwan',     x:772,  y:192, group:'ikon',        pfp:DG+'jinhwanpfp.jpg' },
  { id:'donghyuk',  label:'Donghyuk',    x:902,  y:128, group:'ikon',        pfp:DG+'donghyukpfp.jpg' },
  { id:'yunhyeong', label:'Yunhyeong',   x:668,  y:145, group:'ikon',        pfp:DG+'yunpfp.jpg' },
  { id:'chanwoo',   label:'Chanwoo',     x:935,  y:200, group:'ikon',        pfp:DG+'chanwoopfp.jpg' },
];

const WEB_EDGES = [
  // ── Solar romantic / complicated ─────────────────────────────
  { s:'solar', t:'sunwoo',    type:'complicated' },
  { s:'solar', t:'jungkook',  type:'romantic' },
  { s:'solar', t:'jinhwan',   type:'complicated' },
  // ── Solar best friends ────────────────────────────────────────
  { s:'solar', t:'jimin',     type:'best-friends' },
  { s:'solar', t:'junhoe',    type:'best-friends' },
  { s:'solar', t:'chanhee',   type:'best-friends' },
  // ── Solar close ───────────────────────────────────────────────
  { s:'solar', t:'yoongi',    type:'close' },
  { s:'solar', t:'jin',       type:'close' },
  { s:'solar', t:'taehyung',  type:'close' },
  { s:'solar', t:'namjoon',   type:'close' },
  { s:'solar', t:'hobi',      type:'close' },
  { s:'solar', t:'hanbin',    type:'close' },
  { s:'solar', t:'donghyuk',  type:'close' },
  { s:'solar', t:'hyunjoon',  type:'close' },
  { s:'solar', t:'kevin',     type:'close' },
  { s:'solar', t:'jacob',     type:'close' },
  { s:'solar', t:'changmin',  type:'close' },
  // ── Solar gang-sister ─────────────────────────────────────────
  { s:'solar', t:'eric',      type:'gang-sister' },
  { s:'solar', t:'hyunjae',   type:'gang-sister' },
  { s:'solar', t:'sangyeon',  type:'gang-sister' },
  { s:'solar', t:'haknyeon',  type:'gang-sister' },
  { s:'solar', t:'younghoon', type:'gang-sister' },
  // ── Solar family ──────────────────────────────────────────────
  { s:'solar', t:'jaehyun',   type:'family' },
  { s:'solar', t:'juyeon',    type:'family' },
  { s:'solar', t:'chaerin',   type:'family' },
  { s:'solar', t:'yein',      type:'family' },
  { s:'solar', t:'jaesang',   type:'family' },
  { s:'solar', t:'solji',     type:'family' },
  // ── Lee family internal ───────────────────────────────────────
  { s:'jaesang', t:'solji',    type:'family' },
  { s:'jaesang', t:'jaehyun',  type:'family' },
  { s:'jaesang', t:'yein',     type:'family' },
  { s:'jaesang', t:'juyeon',   type:'family' },
  { s:'jaesang', t:'chaerin',  type:'family' },
  { s:'solji',   t:'jaehyun',  type:'family' },
  { s:'solji',   t:'yein',     type:'family' },
  { s:'jaehyun', t:'juyeon',   type:'family' },
  { s:'jaehyun', t:'chaerin',  type:'family' },
  { s:'juyeon',  t:'chaerin',  type:'family' },
  { s:'yein',    t:'juyeon',   type:'family' },
  { s:'yein',    t:'chaerin',  type:'family' },
  // ── Kim family ────────────────────────────────────────────────
  { s:'dongwoo', t:'sunwoo',   type:'family' },
  { s:'jaesang', t:'dongwoo',  type:'rivalry' },
  // ── Sunwoo & gang ─────────────────────────────────────────────
  { s:'sunwoo', t:'hyunjoon',  type:'gang' },
  { s:'sunwoo', t:'eric',      type:'gang' },
  { s:'sunwoo', t:'hyunjae',   type:'gang' },
  { s:'sunwoo', t:'sangyeon',  type:'gang' },
  { s:'sunwoo', t:'haknyeon',  type:'gang' },
  { s:'sunwoo', t:'younghoon', type:'gang' },
  // ── Gang internal ─────────────────────────────────────────────
  { s:'hyunjoon', t:'eric',      type:'gang' },
  { s:'hyunjoon', t:'hyunjae',   type:'gang' },
  { s:'hyunjoon', t:'sangyeon',  type:'gang' },
  { s:'hyunjoon', t:'haknyeon',  type:'gang' },
  { s:'hyunjoon', t:'younghoon', type:'gang' },
  { s:'eric',     t:'hyunjae',   type:'gang' },
  { s:'eric',     t:'sangyeon',  type:'gang' },
  { s:'eric',     t:'haknyeon',  type:'gang' },
  { s:'eric',     t:'younghoon', type:'gang' },
  { s:'hyunjae',  t:'sangyeon',  type:'gang' },
  { s:'hyunjae',  t:'haknyeon',  type:'gang' },
  { s:'hyunjae',  t:'younghoon', type:'gang' },
  { s:'sangyeon', t:'haknyeon',  type:'gang' },
  { s:'sangyeon', t:'younghoon', type:'gang' },
  { s:'haknyeon', t:'younghoon', type:'gang' },
  // ── BTS internal (all pairs) ──────────────────────────────────
  { s:'jimin',    t:'jungkook',  type:'best-friends' },
  { s:'jungkook', t:'jin',       type:'close' },
  { s:'jungkook', t:'taehyung',  type:'close' },
  { s:'jungkook', t:'yoongi',    type:'close' },
  { s:'jungkook', t:'namjoon',   type:'close' },
  { s:'jungkook', t:'hobi',      type:'close' },
  { s:'jimin',    t:'yoongi',    type:'close' },
  { s:'jimin',    t:'taehyung',  type:'close' },
  { s:'jimin',    t:'namjoon',   type:'close' },
  { s:'jimin',    t:'hobi',      type:'close' },
  { s:'jin',      t:'namjoon',   type:'close' },
  { s:'jin',      t:'hobi',      type:'close' },
  { s:'jin',      t:'jimin',     type:'close' },
  { s:'jin',      t:'yoongi',    type:'close' },
  { s:'jin',      t:'taehyung',  type:'close' },
  { s:'yoongi',   t:'namjoon',   type:'close' },
  { s:'yoongi',   t:'hobi',      type:'close' },
  { s:'yoongi',   t:'taehyung',  type:'close' },
  { s:'taehyung', t:'hobi',      type:'close' },
  { s:'taehyung', t:'namjoon',   type:'close' },
  { s:'namjoon',  t:'hobi',      type:'close' },
  // ── iKON internal (all pairs) ─────────────────────────────────
  { s:'jinhwan',   t:'junhoe',    type:'best-friends' },
  { s:'jinhwan',   t:'hanbin',    type:'close' },
  { s:'jinhwan',   t:'bobby',     type:'close' },
  { s:'jinhwan',   t:'donghyuk',  type:'close' },
  { s:'jinhwan',   t:'yunhyeong', type:'close' },
  { s:'jinhwan',   t:'chanwoo',   type:'close' },
  { s:'junhoe',    t:'hanbin',    type:'close' },
  { s:'junhoe',    t:'bobby',     type:'close' },
  { s:'junhoe',    t:'donghyuk',  type:'close' },
  { s:'junhoe',    t:'yunhyeong', type:'close' },
  { s:'junhoe',    t:'chanwoo',   type:'close' },
  { s:'hanbin',    t:'bobby',     type:'close' },
  { s:'hanbin',    t:'donghyuk',  type:'close' },
  { s:'hanbin',    t:'yunhyeong', type:'close' },
  { s:'hanbin',    t:'chanwoo',   type:'close' },
  { s:'bobby',     t:'donghyuk',  type:'close' },
  { s:'bobby',     t:'yunhyeong', type:'close' },
  { s:'bobby',     t:'chanwoo',   type:'close' },
  { s:'donghyuk',  t:'yunhyeong', type:'close' },
  { s:'donghyuk',  t:'chanwoo',   type:'close' },
  { s:'yunhyeong', t:'chanwoo',   type:'close' },
  // ── Cross-group tensions & dynamics ───────────────────────────
  { s:'jinhwan',  t:'jungkook',  type:'tension' },
  { s:'jinhwan',  t:'sunwoo',    type:'uneasy' },
  { s:'jungkook', t:'sunwoo',    type:'respect' },
  // ── Alliance ──────────────────────────────────────────────────
  { s:'jaesang',  t:'changmin',  type:'allies' },
  // ── Castle friends ────────────────────────────────────────────
  { s:'chanhee', t:'kevin',     type:'close' },
  { s:'chanhee', t:'jacob',     type:'close' },
  { s:'chanhee', t:'changmin',  type:'close' },
  { s:'kevin',   t:'jacob',     type:'close' },
  { s:'kevin',   t:'changmin',  type:'close' },
  // ── Cross-group friendships ───────────────────────────────────
  { s:'chaerin', t:'sunwoo',    type:'close' },
  { s:'chaerin', t:'eric',      type:'close' },
  { s:'chanhee', t:'sunwoo',    type:'close' },
];

const WEB_LEGEND_ITEMS = [
  { type:'romantic',     label:'Romantic' },
  { type:'complicated',  label:'Complicated' },
  { type:'best-friends', label:'Best Friends' },
  { type:'close',        label:'Close' },
  { type:'family',       label:'Family' },
  { type:'gang',         label:'Brothers (gang)' },
  { type:'gang-sister',  label:'Like Siblings' },
  { type:'tension',      label:'Rivals / Tension' },
  { type:'uneasy',       label:'Uneasy' },
  { type:'respect',      label:'Mutual Respect' },
  { type:'allies',       label:'Allies' },
  { type:'rivalry',      label:'Family Rivalry' },
];

function webCurve(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  return `M${x1},${y1} Q${mx - dy * 0.1},${my + dx * 0.1} ${x2},${y2}`;
}

function buildWeb() {
  const svg = document.getElementById('rel-web');
  if (!svg) return;
  svg.innerHTML = '';

  const NS = 'http://www.w3.org/2000/svg';
  const nodeMap = {};
  WEB_NODES.forEach(n => nodeMap[n.id] = n);

  const adj = {};
  WEB_NODES.forEach(n => adj[n.id] = new Set());

  // ── Defs: clipPaths for profile pictures ──────────────────────
  const defs = document.createElementNS(NS, 'defs');
  WEB_NODES.forEach(n => {
    if (!n.pfp) return;
    const r = n.id === 'solar' ? 26 : 20;
    const clip = document.createElementNS(NS, 'clipPath');
    clip.setAttribute('id', `clip-${n.id}`);
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', '0');
    c.setAttribute('cy', '0');
    c.setAttribute('r', String(r));
    clip.appendChild(c);
    defs.appendChild(clip);
  });
  svg.appendChild(defs);

  // ── Region labels ─────────────────────────────────────────────
  const regionG = document.createElementNS(NS, 'g');
  regionG.setAttribute('class', 'web-regions');
  [
    { label:'South Korea',      x:870,  y:420, size:88, opacity:0.04 },
    { label:'New York',         x:310,  y:700, size:50, opacity:0.07 },
    { label:'The Castle',       x:215,  y:85,  size:38, opacity:0.10 },
    { label:'YG Entertainment', x:795,  y:22,  size:15, opacity:0.22 },
    { label:'HYBE / Big Hit',   x:1035, y:148, size:15, opacity:0.22 },
  ].forEach(reg => {
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', String(reg.x));
    t.setAttribute('y', String(reg.y));
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('class', 'web-region-label');
    t.setAttribute('font-size', String(reg.size));
    t.setAttribute('opacity', String(reg.opacity));
    t.textContent = reg.label;
    regionG.appendChild(t);
  });
  svg.appendChild(regionG);

  // ── Draw edges ────────────────────────────────────────────────
  const edgeG = document.createElementNS(NS, 'g');
  edgeG.setAttribute('class', 'web-edges');
  const edgeEls = [];

  WEB_EDGES.forEach(e => {
    const src = nodeMap[e.s], tgt = nodeMap[e.t];
    if (!src || !tgt) return;
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', webCurve(src.x, src.y, tgt.x, tgt.y));
    path.setAttribute('class', `web-edge web-edge--${e.type}`);
    path.setAttribute('fill', 'none');
    edgeG.appendChild(path);
    edgeEls.push({ el: path, s: e.s, t: e.t });
    adj[e.s].add(e.t);
    adj[e.t].add(e.s);
  });
  svg.appendChild(edgeG);

  // ── Draw nodes ────────────────────────────────────────────────
  const nodeG = document.createElementNS(NS, 'g');
  nodeG.setAttribute('class', 'web-nodes');

  WEB_NODES.forEach(n => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', `web-node web-node--${n.group}${n.deceased ? ' web-node--deceased' : ''}`);
    g.setAttribute('transform', `translate(${n.x},${n.y})`);
    g.dataset.id = n.id;

    const r = n.id === 'solar' ? 26 : 20;

    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('r', String(r));
    g.appendChild(circle);

    if (n.pfp) {
      const img = document.createElementNS(NS, 'image');
      img.setAttribute('href', n.pfp);
      img.setAttribute('x', String(-r));
      img.setAttribute('y', String(-r));
      img.setAttribute('width', String(r * 2));
      img.setAttribute('height', String(r * 2));
      img.setAttribute('clip-path', `url(#clip-${n.id})`);
      img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      g.appendChild(img);
    }

    const txt = document.createElementNS(NS, 'text');
    txt.setAttribute('y', String(r + 13));
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('class', 'web-label');
    txt.textContent = n.label;
    g.appendChild(txt);

    g.addEventListener('mouseenter', () => {
      const connected = adj[n.id];
      edgeEls.forEach(({ el, s, t }) => {
        el.style.opacity = (s === n.id || t === n.id) ? '1' : '0.04';
      });
      document.querySelectorAll('#rel-web .web-node').forEach(nd => {
        const nid = nd.dataset.id;
        nd.style.opacity = (nid === n.id || connected.has(nid)) ? '1' : '0.15';
      });
    });

    g.addEventListener('mouseleave', () => {
      edgeEls.forEach(({ el }) => el.style.opacity = '');
      document.querySelectorAll('#rel-web .web-node').forEach(nd => nd.style.opacity = '');
    });

    g.addEventListener('click', () => showWebPopup(n, WEB_EDGES, nodeMap));

    nodeG.appendChild(g);
  });
  svg.appendChild(nodeG);

  // ── Legend ────────────────────────────────────────────────────
  const legendEl = document.getElementById('web-legend');
  if (legendEl) {
    legendEl.innerHTML = WEB_LEGEND_ITEMS.map(item => `
      <div class="web-legend-item">
        <svg width="28" height="10" viewBox="0 0 28 10">
          <line x1="0" y1="5" x2="28" y2="5" class="web-edge web-edge--${item.type}" style="opacity:1"/>
        </svg>
        <span>${item.label}</span>
      </div>
    `).join('');
  }
}

function showWebPopup(node, edges, nodeMap) {
  const popup = document.getElementById('web-popup');
  const backdrop = document.getElementById('web-popup-backdrop');
  if (!popup || !backdrop) return;

  const TYPE_LABELS = {
    'romantic':     'Romantic',
    'complicated':  'Complicated',
    'best-friends': 'Best Friends',
    'close':        'Close',
    'family':       'Family',
    'gang':         'Brothers (gang)',
    'gang-sister':  'Like Siblings',
    'tension':      'Rivals / Tension',
    'uneasy':       'Uneasy',
    'respect':      'Mutual Respect',
    'allies':       'Allies',
    'rivalry':      'Family Rivalry',
  };

  const groups = {};
  const ORDER = ['romantic','complicated','best-friends','close','family','gang','gang-sister','tension','uneasy','respect','allies','rivalry'];
  edges.forEach(e => {
    if (e.s !== node.id && e.t !== node.id) return;
    const otherId = e.s === node.id ? e.t : e.s;
    const other = nodeMap[otherId];
    if (!other) return;
    if (!groups[e.type]) groups[e.type] = [];
    groups[e.type].push(other.label);
  });

  const relHtml = ORDER
    .filter(t => groups[t])
    .map(t => `
      <div class="popup-group">
        <div class="popup-group-label popup-group-label--${t}">${TYPE_LABELS[t]}</div>
        <div class="popup-group-names">${groups[t].join(', ')}</div>
      </div>`)
    .join('') || '<p class="popup-empty">No connections listed.</p>';

  popup.querySelector('.web-popup-name').textContent = node.label;
  popup.querySelector('.web-popup-relations').innerHTML = relHtml;
  popup.classList.remove('hidden');
  backdrop.classList.remove('hidden');
}

// ── YG Artist Sub-pages ──────────────────────────────────────────────────────

function ygResetToMain() {
  const main   = document.getElementById('yg-main');
  const soomi  = document.getElementById('yg-page-soomi');
  const ikon   = document.getElementById('yg-page-ikon');
  const footer = document.querySelector('.yg-footer');
  const portal = document.getElementById('yg-portal');
  if (main)   main.style.display   = '';
  if (soomi)  soomi.style.display  = 'none';
  if (ikon)   ikon.style.display   = 'none';
  if (footer) footer.style.display = '';
  if (portal) portal.classList.add('hidden');
}

function ygArtist(page) {
  const main   = document.getElementById('yg-main');
  const soomi  = document.getElementById('yg-page-soomi');
  const ikon   = document.getElementById('yg-page-ikon');
  const footer = document.querySelector('.yg-footer');

  // Always hide both sub-pages first
  if (soomi)  soomi.style.display = 'none';
  if (ikon)   ikon.style.display  = 'none';

  if (!page) {
    if (main)   main.style.display   = '';
    if (footer) footer.style.display = '';
    const frame = document.getElementById('site-frame-yg');
    if (frame) frame.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (main)   main.style.display   = 'none';
  if (footer) footer.style.display = 'none';

  const target = page === 'soomi' ? soomi : page === 'ikon' ? ikon : null;
  if (target) target.style.display = 'block';

  const frame = document.getElementById('site-frame-yg');
  if (frame) frame.scrollTo({ top: 0, behavior: 'smooth' });
}

function openIkonEmails() {
  document.getElementById('yg-email-overlay').classList.remove('hidden');
}

function closeIkonEmails() {
  document.getElementById('yg-email-overlay').classList.add('hidden');
}

function openKimAssets() {
  document.getElementById('kim-assets-overlay').classList.remove('hidden');
}

function closeKimAssets() {
  document.getElementById('kim-assets-overlay').classList.add('hidden');
}

// ── Init ──────────────────────────────────────────────────────────────────────

function ledgerNav(el, cat) {
  // Update active state
  document.querySelectorAll('.ledger-nav a').forEach(a => a.classList.remove('ledger-nav-active'));
  el.classList.add('ledger-nav-active');

  if (cat === 'society') {
    const sec = document.querySelector('.ledger-society-section');
    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (cat === 'archive') {
    const sec = document.querySelector('.ledger-archive');
    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    // Business / Markets / Obituaries — scroll to top of the ledger site frame
    const frame = document.getElementById('site-frame-ledger');
    if (frame) frame.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function toggleLedgerArticle(id) {
  const art = document.getElementById(id);
  if (!art) return;
  const body = art.querySelector('.ledger-art-body');
  const btn  = art.querySelector('.ledger-art-toggle');
  if (!body) return;
  const isHidden = body.classList.contains('ledger-hidden');
  body.classList.toggle('ledger-hidden');
  if (btn) btn.textContent = isHidden ? 'Collapse ↑' : 'Read More ↓';
}

function openContactLightbox(src, label) {
  const lb = document.getElementById('contact-lightbox');
  document.getElementById('contact-lightbox-img').src = src;
  document.getElementById('contact-lightbox-label').textContent = label;
  lb.classList.remove('hidden');
}

function closeContactLightbox() {
  document.getElementById('contact-lightbox').classList.add('hidden');
  document.getElementById('contact-lightbox-img').src = '';
}

function unlockRedactedPulse() {
  const input = document.getElementById('pulse-redact-input');
  const error = document.getElementById('pulse-redact-error');
  if (!input) return;
  if (input.value.toUpperCase() === 'CASTLE') {
    document.getElementById('pulse-redact-lock').classList.add('pulse-hidden');
    document.getElementById('pulse-redact-content').classList.remove('pulse-locked');
    error.textContent = '';
  } else {
    error.textContent = '— ACCESS DENIED —';
    input.value = '';
    input.focus();
  }
}

function togglePulseArticle(id) {
  const art = document.getElementById(id);
  if (!art) return;
  const body = art.querySelector('.pulse-card-body-text, .pulse-featured-body');
  const btn  = art.querySelector('.pulse-art-toggle');
  if (!body) return;
  const isHidden = body.classList.contains('pulse-hidden');
  body.classList.toggle('pulse-hidden');
  if (btn) btn.textContent = isHidden ? '▲ Close' : '▼ Read More';
}

// ── Vault ──────────────────────────────────────────────────────────────────────

const VAULT_TRACKS = ['solo','bubblepop','liphip','howsthis','serene','onlyyou','justforyou','imapop','pib-title','pib-morning','pib-king','pib-five','pib-flames','pib-never','delicate'];

let vaultCurrentTrack = null;
let vaultPlaying = false;

// ── Vault Desk ──────────────────────────────────────────

const VAULT_OVERLAYS = ['notebook', 'phone', 'rings', 'gifts', 'engring'];

function openVaultItem(item) {
  const scene = document.getElementById('vault-desk-scene');
  if (scene) scene.style.display = 'none';
  VAULT_OVERLAYS.forEach(id => {
    const el = document.getElementById('vault-overlay-' + id);
    if (el) el.style.display = 'none';
  });
  const target = document.getElementById('vault-overlay-' + item);
  if (target) target.style.display = ['phone', 'rings', 'engring'].includes(item) ? 'flex' : 'block';
}

function closeVaultItem() {
  VAULT_OVERLAYS.forEach(id => {
    const el = document.getElementById('vault-overlay-' + id);
    if (el) el.style.display = 'none';
  });
  const scene = document.getElementById('vault-desk-scene');
  if (scene) scene.style.display = 'flex';
}

function openPhoneConvo(id) {
  const list = document.getElementById('vps-list');
  if (list) list.style.display = 'none';
  ['jinhwan', 'jungkook', 'chanhee', 'stalker'].forEach(cid => {
    const el = document.getElementById('vps-chat-' + cid);
    if (el) el.style.display = 'none';
  });
  const chat = document.getElementById('vps-chat-' + id);
  if (chat) {
    chat.style.display = 'flex';
    // scroll to bottom
    const msgs = chat.querySelector('.vps-messages');
    if (msgs) setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 50);
  }
}

function closePhoneConvo() {
  ['jinhwan', 'jungkook', 'chanhee', 'stalker'].forEach(cid => {
    const el = document.getElementById('vps-chat-' + cid);
    if (el) el.style.display = 'none';
  });
  const list = document.getElementById('vps-list');
  if (list) list.style.display = 'block';
}

function selectVaultTrack(id) {
  if (id === 'delicate') {
    // Show locked page
    document.querySelectorAll('.vault-notebook').forEach(n => n.classList.add('hidden'));
    const lp = document.getElementById('vn-delicate');
    if (lp) lp.classList.remove('hidden');
    document.querySelectorAll('.vault-track').forEach(t => t.classList.remove('active'));
    const tr = document.getElementById('vt-delicate');
    if (tr) tr.classList.add('active');
    // Update player
    const nameEl = document.getElementById('vault-player-name');
    if (nameEl) nameEl.textContent = '🔒 DELICATE — unreleased';
    vaultCurrentTrack = id;
    return;
  }
  document.querySelectorAll('.vault-notebook').forEach(n => n.classList.add('hidden'));
  document.querySelectorAll('.vault-track').forEach(t => t.classList.remove('active'));
  const nb = document.getElementById('vn-' + id);
  const tr = document.getElementById('vt-' + id);
  if (nb) nb.classList.remove('hidden');
  if (tr) tr.classList.add('active');
  // Hide default empty state
  const def = document.getElementById('vn-default');
  if (def) def.style.display = 'none';
  vaultCurrentTrack = id;
  // Update player name
  const nameEl = document.getElementById('vault-player-name');
  if (nameEl && tr) {
    const titleEl = tr.querySelector('.vault-track-title');
    if (titleEl) nameEl.textContent = titleEl.textContent;
  }
}

function toggleVaultPlay() {
  vaultPlaying = !vaultPlaying;
  const player = document.getElementById('vault-player');
  const btn = document.getElementById('vault-play-btn');
  if (player) player.classList.toggle('playing', vaultPlaying);
  if (btn) btn.textContent = vaultPlaying ? '⏸' : '▶';
}

function vaultSkip(dir) {
  if (!vaultCurrentTrack) return;
  const idx = VAULT_TRACKS.indexOf(vaultCurrentTrack);
  const next = VAULT_TRACKS[idx + dir];
  if (next) selectVaultTrack(next);
}

function toggleVaultEP() {
  const group = document.getElementById('vault-ep-subtracks');
  const arrow = document.getElementById('vault-ep-arrow');
  if (!group) return;
  const isHidden = group.classList.contains('hidden');
  group.classList.toggle('hidden', !isHidden);
  if (arrow) arrow.textContent = isHidden ? '▼' : '▶';
}

function navigateSite(siteId) {
  const newtab = document.getElementById('sites-newtab');
  const urlEl  = document.getElementById('sites-url');
  const URLS = { yg: 'yg-entertainment.com', ledger: 'uppereastsideledger.com', pulse: 'readthepulse.co', lee: 'lee-industries.com', kimco: 'kim-company.global' };
  if (siteId === 'lee') { setTimeout(initLeeStock, 200); }
  if (siteId === 'kimco') { setTimeout(checkKimTracking, 100); }
  if (siteId === 'yg') { setTimeout(ygResetToMain, 0); }

  document.querySelectorAll('.site-frame').forEach(f => f.classList.add('hidden'));

  if (!siteId) {
    if (newtab) newtab.classList.remove('hidden');
    if (urlEl) urlEl.textContent = 'about:sites';
  } else {
    if (newtab) newtab.classList.add('hidden');
    const frame = document.getElementById(`site-frame-${siteId}`);
    if (frame) frame.classList.remove('hidden');
    if (urlEl) urlEl.textContent = URLS[siteId] || siteId;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#nav .nav-links a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      showSection(a.dataset.section);
      if (a.dataset.section === 'sites') navigateSite(a.dataset.site || null);
    });
  });

  document.querySelectorAll('.browser-shortcut').forEach(btn => {
    btn.addEventListener('click', () => {
      showSection(btn.dataset.section);
      if (btn.dataset.site) navigateSite(btn.dataset.site);
    });
  });

  initDuality();
  buildCharacters();
  buildTimeline();
  buildWeb();

  showSection('home');
});

// ── SOCIAL DATA ───────────────────────────────────────────────────

// ── PFP MAP ───────────────────────────────────────────────────────
const PFP = {
  'j.min_bts':         DG + 'jiminpfp.jpg',
  'bts_seokjin':       DG + 'jinpfp.jpg',
  'bts_hobi':          DG + 'hobipfp.jpg',
  'RM_bts':            DG + 'namjoonpfp.jpg',
  'bts_yoongi':        DG + 'yoongipfp.jpg',
  'bts_taetae':        DG + 'taepfp.jpg',
  'jk_95':             DG + 'jungkookpfp.jpg',
  'j.min__':           DG + 'jiminpfp.jpg',
  'jk__real':          DG + 'jkprivpfp.jpg',
  'jinan_94':          DG + 'jinhwanpfp.jpg',
  'iKON_june':         DG + 'junepfp.jpg',
  'leader_hanbin':     DG + 'hanbinpfp.jpg',
  'ikon_donghyuk':     DG + 'donghyukpfp.jpg',
  'iKON_bobby':        DG + 'bobbypfp.jpg',
  'ikon_chanwoo':      DG + 'chanwoopfp.jpg',
  'jinan__':           DG + 'naniprivpfp.jpg',
  'june__':            DG + 'junepfp.jpg',
  'jaehyunlee__':      DG + 'jaepfp.jpg',
  'juyeonlee__':       DG + 'juyeonpfp.jpg',
  'chaerin_lee':       DG + 'chaerinselfie.jpg',
  'chanhee':           DG + 'chanheepfp.jpg',
  'sollee__':          DG + 'solarpfp.jpg',
  'kimsoomi_official': DG + 'soomipfp.jpg',
};

const SOCIAL_PROFILES = {

  // ── KIM SOOMI (@kimsoomi_official) ───────────────────────────
  soomi: {
    username: 'kimsoomi_official', verified: true,
    name: 'Kim Soomi 🌙',
    pfp: DG+'soomipfp.jpg',
    followers: '12.4M', following: '312', posts: '296',
    bio: 'YG Entertainment\n1995 ✦ Seoul\n🎤 Pain is Beauty — out now',
    link: 'yg-ent.com/soomi',
    locked: false, hasDuality: false,
    highlights: [
      { label:'Pain is Beauty', img: SI+'soomi-painisbeauty.jpg' },
      { label:'Awards',         img: SI+'soomi-withanaward.jpg' },
      { label:'On Stage',       img: SI+'soomi-onstage.jpg' },
      { label:'Chanel',         img: SI+'soomi-chanelmodel.jpg' },
    ],
    posts_data: [
      {
        img: SI+'soomi-painisbeauty.jpg',
        caption: 'pain is beauty is out ✦ thank you neverlands for everything. always. 🖤',
        likes: '2,341,009', date: 'JUNE 4, 2021',
        comments: [
          { user:'neverlands_official', pfp:DG+'fanpfp.jpg', text:'PAIN IS BEAUTY IS A MASTERPIECE WE ARE NOT OKAY 🖤🖤🖤' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'so proud of you.' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'nobody does it like you noona. nobody. 🖤' },
          { user:'ikon_donghyuk', pfp:DG+'donghyukpfp.jpg', text:'our soomi did that 🥲🖤' },
          { user:'soomi_neverland1', pfp:DG+'fanpfp2.jpg', text:"I have been listening for six hours. I don't know who I am anymore." },
        ]
      },
      {
        img: SI+'soomi-onstage.jpg',
        caption: 'neverlands. you carry me every single time. 🌙',
        likes: '1,892,443', date: 'MAY 2021',
        comments: [
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'you were something else up there.' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'NOONA ON STAGE IS A DIFFERENT SPECIES 😭' },
          { user:'neverlands_official', pfp:DG+'fanpfp.jpg', text:'SOOMI IS EATING EVERYONE ALIVE' },
          { user:'soomi_neverland2', pfp:DG+'fanpfp2.jpg', text:'I have watched this fancam 40 times' },
        ]
      },
      {
        img: SI+'soomi-withanaward.jpg',
        caption: 'this is for you, neverlands. always you.',
        likes: '3,201,887', date: 'DECEMBER 2020',
        comments: [
          { user:'neverlands_official', pfp:DG+'fanpfp.jpg', text:'YOU DESERVE EVERY SINGLE ONE 🏆🏆🏆' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'deserved.' },
          { user:'iKON_official', pfp:'', text:'we love you soomi!! 🖤' },
          { user:'soomi_neverland3', pfp:DG+'fanpfp2.jpg', text:'the best artist in the industry no debate' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'RIGHTFULLY HERS' },
        ]
      },
      {
        img: SI+'soomi-chanelmodel.jpg',
        caption: '✦',
        likes: '4,100,321', date: 'OCTOBER 2020',
        comments: [
          { user:'neverlands_official', pfp:DG+'fanpfp.jpg', text:'SOOMI FOR CHANEL I AM NOT OKAY' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'stunning.' },
          { user:'soomi_neverland1', pfp:DG+'fanpfp2.jpg', text:'THE MOST BEAUTIFUL WOMAN TO EVER EXIST' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'I am telling everyone I know this is my noona 😭' },
        ]
      },
      {
        img: SI+'soomi-painisbeauty-announcement-2021.png',
        caption: 'pain is beauty. coming june 4. 🖤',
        likes: '1,892,003', date: 'MAY 2021',
        comments: [
          { user:'neverlands_official', pfp:DG+'fanpfp.jpg', text:'WE ARE NOT READY 🖤🖤🖤' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'the title alone.' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'I CANNOT BREATHE THE TITLE 😭😭' },
          { user:'soomi_neverland2', pfp:DG+'fanpfp2.jpg', text:'I have not slept since this was announced' },
        ]
      },
      {
        img: SI+'soomi-onstage-kcon2020.jpg',
        caption: 'kcon. 🌙',
        likes: '987,332', date: 'JANUARY 2020',
        comments: [
          { user:'neverlands_official', pfp:DG+'fanpfp.jpg', text:'SOOMI OWNED KCON' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'I STUDY HER. FOR PERFORMANCE RESEARCH. 😭' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'well done.' },
          { user:'soomi_neverland1', pfp:DG+'fanpfp2.jpg', text:'I was there and I still cannot believe it' },
        ]
      },
      {
        img: SI+'soomi-onlyyou-announcement-2019.png',
        caption: 'only you. out november 15. 🌙',
        likes: '743,210', date: 'NOVEMBER 2019',
        comments: [
          { user:'neverlands_official', pfp:DG+'fanpfp.jpg', text:'ONLY YOU ERA LETS GO 🌙🌙🌙' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'soomi coming for everyone AGAIN' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'excited for this one.' },
          { user:'soomi_neverland3', pfp:DG+'fanpfp2.jpg', text:'the aesthetic the CONCEPT' },
        ]
      },
      {
        img: SI+'soomi-backstage-atherconcert-2019.jpg',
        caption: '',
        likes: '611,887', date: 'OCTOBER 2019',
        comments: [
          { user:'neverlands_official', pfp:DG+'fanpfp.jpg', text:'SOOMI BEHIND THE SCENES 🌙' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'the hardest worker I know.' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'she does not stop 😭' },
          { user:'soomi_neverland2', pfp:DG+'fanpfp2.jpg', text:'SOOMI YOU DESERVED EVERY SECOND' },
        ]
      },
      {
        img: SI+'SOOMI-neverlandconcert-promo-2019.png',
        caption: 'neverland concert. see you there. 🌙',
        likes: '834,002', date: 'SEPTEMBER 2019',
        comments: [
          { user:'neverlands_official', pfp:DG+'fanpfp.jpg', text:'NEVERLAND CONCERT I AM ON THE FLOOR' },
          { user:'soomi_neverland1', pfp:DG+'fanpfp2.jpg', text:'I HAVE MY TICKETS' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'our soomi 🖤' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'I WILL BE FRONT ROW I SWEAR TO GOD 😭' },
        ]
      },
      {
        img: SI+'soomi-howsthis-announcement-2018.png',
        caption: "how's this. out november 20.",
        likes: '512,443', date: 'NOVEMBER 2018',
        comments: [
          { user:'neverlands_official', pfp:DG+'fanpfp.jpg', text:'HOW IS THIS SO GOOD ALREADY' },
          { user:'soomi_neverland2', pfp:DG+'fanpfp2.jpg', text:'the title... I am deceased' },
          { user:'soomi_neverland3', pfp:DG+'fanpfp2.jpg', text:'SOOMI BACK TO SAVE US' },
        ]
      },
      {
        img: SI+'SOOMI-lip&hip-promo-bighit-2018.png',
        caption: 'lip & hip. march 2018. 🌙',
        likes: '398,001', date: 'MARCH 2018',
        comments: [
          { user:'neverlands_official', pfp:DG+'fanpfp.jpg', text:'LIP AND HIP SOOMI ERA' },
          { user:'soomi_neverland1', pfp:DG+'fanpfp2.jpg', text:'she is not playing with us' },
          { user:'soomi_neverland3', pfp:DG+'fanpfp2.jpg', text:'THE CONCEPT THE VISUALS' },
        ]
      },
      {
        img: SI+'soomi-vogue-photoshoot-2017.jpg',
        caption: '✦',
        likes: '289,773', date: 'SEPTEMBER 2017',
        comments: [
          { user:'neverlands_official', pfp:DG+'fanpfp.jpg', text:'SOOMI FOR VOGUE WE LOVE TO SEE IT' },
          { user:'soomi_neverland2', pfp:DG+'fanpfp2.jpg', text:'the most stunning human being alive' },
          { user:'soomi_neverland1', pfp:DG+'fanpfp2.jpg', text:'vogue knew what they were doing' },
        ]
      },
      {
        img: SI+'soomi-bubblepop-promo-bighit-2017.png',
        caption: 'bubble pop. april 2017.',
        likes: '201,004', date: 'APRIL 2017',
        comments: [
          { user:'neverlands_official', pfp:DG+'fanpfp.jpg', text:'BUBBLE POP SOOMI IS HERE' },
          { user:'soomi_neverland3', pfp:DG+'fanpfp2.jpg', text:'she is serving every single time' },
          { user:'soomi_neverland1', pfp:DG+'fanpfp2.jpg', text:'THE POSTER I CANNOT' },
        ]
      },
      {
        img: SI+'soomi-debutselfie-2016underbighit.jpg',
        caption: 'hi.',
        likes: '143,887', date: 'OCTOBER 2016',
        comments: [
          { user:'neverlands_official', pfp:DG+'fanpfp.jpg', text:'OUR GIRL IS HERE 🌙🌙' },
          { user:'soomi_neverland2', pfp:DG+'fanpfp2.jpg', text:'the debut selfie I am going to cry' },
          { user:'soomi_neverland1', pfp:DG+'fanpfp2.jpg', text:'she already HAS us' },
        ]
      },
      {
        img: SI+'soomi-solodebut-announcement-bighit-2016.png',
        caption: 'kim soomi. solo debut. september 2016.',
        likes: '98,441', date: 'SEPTEMBER 2016',
        comments: [
          { user:'neverlands_official', pfp:DG+'fanpfp.jpg', text:'KIM SOOMI SOLO DEBUT LETS GOOO' },
          { user:'soomi_neverland3', pfp:DG+'fanpfp2.jpg', text:'I have been waiting for this moment' },
          { user:'soomi_neverland1', pfp:DG+'fanpfp2.jpg', text:'the industry will never be the same' },
        ]
      },
      {
        img: SI+'soomi-backstage-kcon2016.jpg',
        caption: '',
        likes: '74,210', date: 'JULY 2016',
        comments: [
          { user:'neverlands_official', pfp:DG+'fanpfp.jpg', text:'SOOMI AT KCON 🌙🌙' },
          { user:'soomi_neverland2', pfp:DG+'fanpfp2.jpg', text:'she looked so good' },
          { user:'soomi_neverland1', pfp:DG+'fanpfp2.jpg', text:'already a star before the debut' },
        ]
      },
    ]
  },

  // ── SOLAR LEE (@sollee__) ─────────────────────────────────────
  solar: {
    username: 'sollee__', verified: false,
    name: 'solar',
    pfp: DG+'solarpfp.jpg',
    followers: '47', following: '61', posts: '51',
    bio: 'private',
    locked: false, hasDuality: true,
    highlights: [],
    posts_data: [
      // ── 2021 ──────────────────────────────────────────────────
      {
        img: SI+'solar-jungkookatbdayparty.jpg',
        caption: '',
        likes: '47', date: 'NOVEMBER 2021',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I am going to pass out' },
          { user:'kevin_moon', pfp:'', text:'I KNEW IT I KNEW IT' },
          { user:'jacob_moon', pfp:'', text:'😊💛' },
          { user:'changmin__', pfp:'', text:'the way I screamed' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'finally 🙄' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🥹' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'🖤' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'' },
          { user:'ikon_donghyuk', pfp:DG+'donghyukpfp.jpg', text:'WE LOVE JUNGKOOK-HYUNG 🥳' },
        ]
      },
      {
        img: SI+'solar-bdayparty-136.jpg',
        caption: '26 🎂 he really did all this 🥲',
        likes: '44', date: 'NOVEMBER 2021',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"THAT'S MY BEST FRIEND RIGHT THERE 😭😭😭" },
          { user:'kevin_moon', pfp:'', text:'HAPPY BIRTHDAY SOL WE LOVE YOUUUU 🎉' },
          { user:'jacob_moon', pfp:'', text:'happy birthday sol!! 🥳🥳' },
          { user:'changmin__', pfp:'', text:'our Sol is 26!!! 🥲🥲' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'happy birthday. 🖤' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'happy birthday noona 🎂' },
          { user:'ikon_donghyuk', pfp:DG+'donghyukpfp.jpg', text:'happy birthday soomi-noona!!! 🥳' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'happy birthday mi 🥰' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'happy birthday sol 🎂🖤' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'happy birthday Sol!! 🎉' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'happy birthday little sister 🥂' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'THATS MY SISTER!!!!! 😭😭' },
        ]
      },
      {
        img: SI+'solar-jungkook2021.jpg',
        caption: '',
        likes: '41', date: 'OCTOBER 2021',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'NO WAY. NO ABSOLUTE WAY.' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'you owe me the biggest explanation of your life' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'' },
          { user:'kevin_moon', pfp:'', text:'WAIT A MINUTE' },
          { user:'jacob_moon', pfp:'', text:'😯' },
          { user:'changmin__', pfp:'', text:'is nobody going to say anything???' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'👁👄👁' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🙂' },
        ]
      },
      {
        img: SI+'solar-jungkook-2021.jpg',
        caption: '',
        likes: '38', date: 'SEPTEMBER 2021',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'solar.' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'SOLAR.' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🥹🥹' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'not me third wheeling this feed' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'🖤' },
        ]
      },
      {
        img: SI+'solar-jimin-hoseok.jpg',
        caption: '',
        likes: '33', date: 'AUGUST 2021',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I want to be there 😭' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'and I was not invited??' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@iKON_june you were busy' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'best night 🧡' },
          { user:'bts_hobi', pfp:DG+'hobipfp.jpg', text:'MI 😭🧡' },
        ]
      },
      {
        img: DG+'solar-chanel-photoshoot-august2021.jpg',
        caption: '',
        likes: '41', date: 'AUGUST 2021',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I am obsessed with you' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'stunning 🖤' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'queen behavior 👑' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'🖤' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'she eats every single time' },
        ]
      },
      {
        img: SI+'solar-amusementpark-117.jpg',
        caption: 'last night in new york. kinda.',
        likes: '19', date: 'JULY 2021',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'WHO IS THAT IN THE BACKGROUND' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'nobody' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'Solar Kim I swear to GOD' },
          { user:'kevin_moon', pfp:'', text:'looks fun 😭 miss you sol' },
          { user:'jacob_moon', pfp:'', text:'your siblings are so cute 🥲' },
        ]
      },
      {
        img: SI+'solar-drinkinginny.jpg',
        caption: '',
        likes: '9', date: 'JULY 2021',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"I'm going to need you to call me back" },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'right now' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'solar' },
          { user:'jacob_moon', pfp:'', text:'please be safe sol 🙏' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'pick up your phone' },
        ]
      },
      {
        img: SI+'solar-posingnxttojungkookmodelad.jpg',
        caption: '',
        likes: '27', date: 'JUNE 2021',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'ARE YOU KIDDING ME' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'solar you have to tell me things like this' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'okay the size difference is sending me 💀' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'this is embarrassing for me' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'🙂' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'😂' },
        ]
      },
      {
        img: DG+'solar-solarandikonboys-early2021.png',
        caption: '',
        likes: '36', date: 'MARCH 2021',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I am so jealous of iKON it is actually insane' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'we love our honorary member 🖤' },
          { user:'ikon_donghyuk', pfp:DG+'donghyukpfp.jpg', text:'SOOMI-NOONA 🖤🖤' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'always 🖤' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'🖤' },
        ]
      },
      // ── 2020 ──────────────────────────────────────────────────
      {
        img: DG+'solar-chaerin-juyeon-running-june2020.jpg',
        caption: '',
        likes: '24', date: 'JUNE 2020',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'the three of you together is actually dangerous' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'🖤🖤' },
          { user:'sunwoo__', pfp:DG+'sunwoopfp.jpg', text:'the dream team honestly' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'we run this city 😌' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'💀' },
        ]
      },
      {
        img: DG+'solar-solarandjinhwan-innature-may2020.png',
        caption: '',
        likes: '29', date: 'MAY 2020',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'okay where is this and why am I not there' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'I also was not informed of this location' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'@iKON_june mind your business' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'this is so pretty 🖤' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🌿🧡' },
        ]
      },
      {
        img: SI+'solar-jimin.jpg',
        caption: '',
        likes: '32', date: 'MAY 2020',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'mi 🧡' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'🖤' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'my two favorite people 🥲' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'🖤' },
        ]
      },
      {
        img: DG+'solar-jihoon-jinhwan-ygfamily-april2020.png',
        caption: '',
        likes: '27', date: 'APRIL 2020',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'the YG family gathering that I was not invited to' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@chanhee you're not YG" },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"@sollee__ I am YG ADJACENT and that COUNTS" },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'the collab we needed 🖤' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'🖤' },
        ]
      },
      {
        img: SI+'solar-jaehyun-2020.jpg',
        caption: '',
        likes: '29', date: 'MARCH 2020',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I am going to need an explanation' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'WAIT' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@chanhee no explanation needed' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'🖤' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'🥂' },
        ]
      },
      {
        img: DG+'solar-performingonlyyou-withjinhwan-feb2020.jpg',
        caption: 'only you.',
        likes: '38', date: 'FEBRUARY 2020',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I am CRYING in the venue right now' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'🖤' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'jinhwan hyung really showed up huh' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'the stage was everything 🧡' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'I bawled my eyes out not sorry' },
        ]
      },
      {
        img: SI+'solar-inthestudio.jpg',
        caption: 'in here til god knows when',
        likes: '34', date: 'JANUARY 2020',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'come HOME' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'eat something' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'stop showing up to my studio' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:"I didn't say anything about coming there" },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'👀👀👀' },
        ]
      },
      // ── 2019 ──────────────────────────────────────────────────
      {
        img: SI+'solar-funnyface.jpg',
        caption: '',
        likes: '28', date: 'NOVEMBER 2019',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'you are an actual menace and I say that with love' },
          { user:'kevin_moon', pfp:'', text:'LMAOOO SOL 😭' },
          { user:'jacob_moon', pfp:'', text:'I love her so much 😭' },
          { user:'changmin__', pfp:'', text:'she really said send post' },
        ]
      },
      {
        img: DG+'solar-solarandjinhwan-outsideyg-2019.png',
        caption: '',
        likes: '30', date: 'OCTOBER 2019',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'just two people who are totally just friends' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'why do I feel like I was not supposed to see this' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'we are literally just standing outside' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@chanhee ignore him' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'🖤' },
        ]
      },
      {
        img: SI+'solar-athomeselfie.jpg',
        caption: 'bored out of my mind',
        likes: '31', date: 'SEPTEMBER 2019',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"answer the door I'm outside" },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'chanhee how did you know where I live' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I know everything' },
          { user:'jacob_moon', pfp:'', text:'call me sometime sol 😔' },
        ]
      },
      {
        img: DG+'solar-junhoeandsolar-funnyfaces-eating-2019.png',
        caption: '',
        likes: '26', date: 'AUGUST 2019',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'we are so normal' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'genuinely the worst photo of me ever taken' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'I love this so much 😭' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I want to eat with you two so bad' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'iconic honestly' },
        ]
      },
      {
        img: DG+'solar-jinhwanonawalk-2019.jpg',
        caption: '',
        likes: '23', date: 'MAY 2019',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'going on walks??? without telling me???' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@chanhee you're in new york" },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"@sollee__ I would have gotten on a plane" },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'also not invited. noted.' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'@iKON_june it was a walk not an event' },
        ]
      },
      {
        img: DG+'solar-jinhwan-outfordrinks-march2019.png',
        caption: '',
        likes: '21', date: 'MARCH 2019',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I am watching you two' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@chanhee don't" },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'out for drinks on a TUESDAY' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:"@iKON_june it's not a school night" },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'enjoy 🖤' },
        ]
      },
      {
        img: SI+'solar-selfiewalcohol.jpg',
        caption: 'lol',
        likes: '22', date: 'FEBRUARY 2019',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'answer your phone' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"solar I'm calling you right now" },
          { user:'jacob_moon', pfp:'', text:'sol please be safe 🙏' },
        ]
      },
      {
        img: DG+'solar-backstagewithjinhwan-lovescenarioera-2019.png',
        caption: '',
        likes: '19', date: 'JANUARY 2019',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'wait are you okay' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@chanhee I'm fine" },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'the iKON concert was INCREDIBLE tonight' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'🖤' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'thank you for being there 🖤' },
        ]
      },
      // ── 2018 ──────────────────────────────────────────────────
      {
        img: SI+'solar-outlate-partying-late2018-afterscandal.jpg',
        caption: '',
        likes: '3', date: 'NOVEMBER 2018',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'answer your phone' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'solar I am not joking' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'sol please take care of yourself' },
        ]
      },
      {
        img: SI+'solar-holdingdrinkatparty-late2018-afterscandal.jpg',
        caption: '',
        likes: '2', date: 'OCTOBER 2018',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'where are you' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'🖤' },
        ]
      },
      {
        img: SI+'solar-jungkook-2018.jpg',
        caption: '',
        likes: '11', date: 'MARCH 2018',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'😭💛' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'🖤' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'you two 🥲' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'pick up your phone' },
        ]
      },
      {
        img: SI+'solar-jkfrom2018.jpg',
        caption: '',
        likes: '6', date: 'FEBRUARY 2018',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'miss you 😔' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'sol.' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'take care of yourself sol' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'🖤' },
          { user:'RM_bts', pfp:DG+'namjoonpfp.jpg', text:'thinking of you' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'pick up your phone' },
        ]
      },
      // ── 2017 ──────────────────────────────────────────────────
      {
        img: SI+'solar-jimin-2017.jpg',
        caption: '',
        likes: '14', date: 'OCTOBER 2017',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🧡' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'😐' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'my kids 🥲' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'cute' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'mi why do you have a whole life in korea that I am not a part of' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@chanhee you're always welcome to visit 😌" },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'@sollee__ I literally said I would and you said it was a bad time every single time' },
        ]
      },
      {
        img: SI+'solar-jimineatinginhotelroom-2017.jpg',
        caption: '',
        likes: '10', date: 'SEPTEMBER 2017',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'delete this RIGHT NOW' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@j.min_bts you wouldn't let me eat in peace either" },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'😭😭' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'park jimin 😂' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'the way he looks BETRAYED 💀' },
        ]
      },
      {
        img: SI+'solar-jungkook-2017.jpg',
        caption: '',
        likes: '8', date: 'AUGUST 2017',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🧡' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'🖤' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'my favorite duo 🥲' },
          { user:'bts_taetae', pfp:DG+'taepfp.jpg', text:'SOL AND KOOKIE 😭' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I love this for you' },
        ]
      },
      {
        img: SI+'solar-taehyung-2017.jpg',
        caption: '',
        likes: '12', date: 'JULY 2017',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'when did THIS happen 😭' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'😐😐😐' },
          { user:'bts_taetae', pfp:DG+'taepfp.jpg', text:'🐯💛' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@jk_95 oh relax' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:"@sollee__ I'm very relaxed" },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'jungkook... 😂' },
        ]
      },
      // ── 2016 ──────────────────────────────────────────────────
      {
        img: SI+'solar-jimin-2016.jpg',
        caption: 'kcon nyc 🌊',
        likes: '9', date: 'JULY 2016',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'the beach was your idea and you complained the whole time 😭' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@j.min_bts the sand was EVERYWHERE' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'you two look so happy 🥲' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'I should have been invited to this' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@jk_95 you literally were there for a week before this 😭' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:"@sollee__ and yet somehow I wasn't there for THIS" },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I also was not invited. to new york. my own city.' },
        ]
      },
      {
        img: SI+'solar-jungkook-posing-restaraunt-2016.jpg',
        caption: '',
        likes: '5', date: 'MARCH 2016',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'YOU TWO 😭' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'🖤' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'happy to see this 🥲' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'look at her being normal and having fun 😭' },
        ]
      },
      // ── 2015 ──────────────────────────────────────────────────
      {
        img: SI+'solar-yoongi-jungkook-2015.jpg',
        caption: '',
        likes: '7', date: 'DECEMBER 2015',
        comments: [
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'delete this' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'no' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:"I look like I'm being held against my will" },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'you were not. you hugged us both. I have a witness.' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'confirmed' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'I hate you both' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:"the gummy smile doesn't lie yoongi 😂" },
        ]
      },
      {
        img: SI+'solar-jungkook-peacesign-2015.jpg',
        caption: '',
        likes: '6', date: 'SEPTEMBER 2015',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'you two 🧡' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'✌🖤' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'my kids 🥲' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'who is this and what has she done with Solar' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@chanhee I am perfectly capable of smiling" },
        ]
      },
      {
        img: SI+'solar-jungkook-2014.jpg',
        caption: '',
        likes: '5', date: 'JUNE 2015',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'what happened 😭' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'practice room floor happened' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'I was NOT sleeping I was resting my eyes' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@jk_95 you were snoring' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'someone get this kid a bed 😭' },
        ]
      },
      // ── 2014 ──────────────────────────────────────────────────
      {
        img: SI+'solar-jungkook-2013.jpg',
        caption: '',
        likes: '4', date: 'NOVEMBER 2014',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'YOU TWO 😭😭' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'this is from a year ago why are you posting this now' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@jk_95 I just found it on my camera roll leave me alone' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'the cutest trainee duo ever 🥲' },
        ]
      },
      // ── 2013 ──────────────────────────────────────────────────
      {
        img: SI+'solar-sunwooeating-early2013.jpg',
        caption: "don't tell him I took this",
        likes: '3', date: 'FEBRUARY 2013',
        comments: [
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:'solar.' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@ksw__ what" },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:'delete it.' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'keeping this forever' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'she won\'t delete it.' },
        ]
      },
      {
        img: SI+'solar-chaerin-afterpartypic-early2013.jpg',
        caption: '',
        likes: '3', date: 'JANUARY 2013',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'goodnight you two' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'I look insane' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@chaerin_lee we both do that's the point" },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'last night out.' },
        ]
      },
      {
        img: SI+'solar-atparty-early2013.jpg',
        caption: '',
        likes: '3', date: 'JANUARY 2013',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'there she is' },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:'one of the last ones' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'enjoy it while it lasts.' },
        ]
      },
      {
        img: SI+'solar-jaehyun-2013.jpg',
        caption: '',
        likes: '3', date: 'JANUARY 2013',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'okay this is genuinely sweet' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'take care of yourself out there.' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@jaehyunlee__ I will" },
        ]
      },
      {
        img: SI+'solar-newyork-photo.jpg',
        caption: '',
        likes: '3', date: 'JANUARY 2013',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'are you already being sentimental about the city' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@chanhee I'm leaving, yes" },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'Solar.' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'she already has her ticket.' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'...ok then.' },
        ]
      },
      // ── 2012 ──────────────────────────────────────────────────
      {
        img: SI+'solar-risquephoto-atparty-2012.jpg',
        caption: '',
        likes: '2', date: 'NOVEMBER 2012',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'solar what is this' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'I need you to put your jacket back on.' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@jaehyunlee__ relax" },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:'😐' },
        ]
      },
      {
        img: SI+'solar-chaerin-atparty.jpg',
        caption: '',
        likes: '3', date: 'DECEMBER 2012',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I cannot believe I missed this party' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@chanhee it was a disaster you were lucky' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'a disaster you organized, to be clear' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'do not look at us we look so feral' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@chaerin_lee we were' },
        ]
      },
      {
        img: SI+'solar-teethandjewelrybling-fromsunwoo-late2012.jpg',
        caption: '',
        likes: '2', date: 'SEPTEMBER 2012',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'where did you get all of that' },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:'looks good.' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'the drip 😭' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'Sunwoo gave you that, didn\'t he.' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@jaehyunlee__ ...yes" },
        ]
      },
      {
        img: SI+'solar-chaerin-running.jpg',
        caption: '',
        likes: '2', date: 'OCTOBER 2012',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'where are you RUNNING' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@chanhee away' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'it was fine we were fine' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'it was not fine at all actually' },
        ]
      },
      {
        img: SI+'solar-drinking-2012.jpg',
        caption: '',
        likes: '2', date: 'JULY 2012',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'what exactly are you drinking' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'a drink' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'Solar.' },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:"she's fine" },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"@ksw__ that's exactly what I'm worried about" },
        ]
      },
      {
        img: SI+'solar-vodka.jpg',
        caption: '',
        likes: '2', date: 'JUNE 2012',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'solar lee what is THAT' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'juice' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'Solar' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'she put it down I watched her put it down' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"@jaehyunlee__ that is literally not better jae" },
        ]
      },
      {
        img: SI+'solar-sunwoo-nyc-2012.jpg',
        caption: '',
        likes: '2', date: 'APRIL 2012',
        comments: [
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:'you said you weren\'t going to post that.' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@ksw__ I said I wouldn't tell anyone. I never said I wouldn't post it." },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'😭😭😭' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'he looks happy 😭' },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:'@eric_sim shut up' },
        ]
      },
      {
        img: SI+'chaerin-solar-moment.jpg',
        caption: '',
        likes: '2', date: 'MARCH 2012',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I love you two actually' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'this is the only good photo of me' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@chaerin_lee that is not true' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:"@sollee__ it genuinely is" },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'beautiful sisters' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'@jaehyunlee__ ok thanks jae' },
        ]
      },
      // ── 2011 ──────────────────────────────────────────────────
      {
        img: SI+'solar-atparty-2011.jpg',
        caption: '',
        likes: '1', date: 'DECEMBER 2011',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'who took this' },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:'I did.' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'@ksw__ why does she look like that' },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:'@chanhee it was that kind of night.' },
        ]
      },
      {
        img: DG+'solar-november2011-solarandsunwoo.png',
        caption: '',
        likes: '1', date: 'NOVEMBER 2011',
        comments: [
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:'why do you have this.' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@ksw__ I take a lot of photos. you know this." },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'sunwoo looks actually soft here' },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:"@chanhee I don't." },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'he does though' },
        ]
      },
      {
        img: SI+'solar-eric-atparty-2011.jpg',
        caption: '',
        likes: '1', date: 'OCTOBER 2011',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'who let you take this' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@eric_sim me' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'he looks SO uncomfortable 😭' },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:'he always looks like that.' },
        ]
      },
      {
        img: SI+'solar-jaehyun-selfie-2011.jpg',
        caption: '',
        likes: '1', date: 'AUGUST 2011',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'WAIT HES SMILING' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'delete this.' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@jaehyunlee__ absolutely not" },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'Solar.' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@jaehyunlee__ Jaehyun.' },
        ]
      },
      {
        img: DG+'solar-sunwooholdingdrink-july2011.jpg',
        caption: '',
        likes: '1', date: 'JULY 2011',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'what is he holding' },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:'a drink.' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'what KIND' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@chanhee the fun kind" },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'I was right there and I should have stopped this.' },
        ]
      },
      {
        img: SI+'solar-pillontongue-2011.jpg',
        caption: '',
        likes: '1', date: 'JUNE 2011',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'solar what is that' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'a vitamin' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'put it down.' },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:"she's fine." },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'@ksw__ KIM SUNWOO' },
        ]
      },
      {
        img: SI+'solar-sunwoo-atkimmansion-earlymorning-2011.jpg',
        caption: '',
        likes: '1', date: 'MARCH 2011',
        comments: [
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:'I am going to need you to delete that.' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'no' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'he looks so peaceful 😭' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'the mansion looks good in the morning' },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:"@eric_sim you're not helping." },
        ]
      },
      {
        img: DG+'solar-sunwooandchanhee-april2011.jpg',
        caption: '',
        likes: '1', date: 'APRIL 2011',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'wait I remember this night' },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:'delete it.' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'@ksw__ absolutely not you look great' },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:"@chanhee I don't." },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'the three of them in one place. iconic.' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'good times.' },
        ]
      },
    ]
  },

  // ── JUNGKOOK PRIVATE (@jk__real) ─────────────────────────────
  jungkook_priv: {
    username: 'jk__real', verified: false,
    name: 'jungkook',
    pfp: DG+'jkprivpfp.jpg',
    followers: '24', following: '19', posts: '19',
    bio: '🔒',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'jungkook-solar-selfies.jpg',
        caption: 'happy birthday sol. I would burn everything down for you. you know that. 🖤',
        likes: '24', date: 'NOVEMBER 2021',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🥹🥹🥹' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"stop it I'm going to cry" },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I am not okay' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'our kook 🥲' },
        ]
      },
      {
        img: DG+'jungkook-solar-seoul.jpg',
        caption: '',
        likes: '21', date: 'OCTOBER 2021',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🌙' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'ok this is actually so cute' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"I didn't know you took this" },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@sollee__ I take a lot of things you don't know about" },
        ]
      },
      {
        img: DG+'jungkook-solar-2021.jpg',
        caption: '',
        likes: '19', date: 'AUGUST 2021',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🧡🖤' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"we're healing 🥲" },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'so happy for you two 🥲' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'🖤' },
        ]
      },
      {
        img: DG+'jungkook-solar-2020.jpg',
        caption: '',
        likes: '18', date: 'DECEMBER 2020',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'💛' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'the slow burn is OVER thank god' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'chanhee' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"@sollee__ I'm just saying" },
        ]
      },
      {
        img: DG+'solar-bts-newyork.jpg',
        caption: 'kcon 2020. missed this.',
        likes: '22', date: 'JANUARY 2020',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'we missed you too 💛' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'the whole crew back together 🥲' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I missed you all so much' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'this photo 🥲' },
        ]
      },
      {
        img: DG+'jungkookpriv-jiminandkook-afterscandal-2018.jpg',
        caption: '',
        likes: '14', date: 'OCTOBER 2018',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'you are my best friend. no matter what.' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'my boys 🥲' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'🖤' },
        ]
      },
      {
        img: DG+'jungkook-guitar.jpg',
        caption: '',
        likes: '19', date: 'MARCH 2019',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🎸' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'this kid 🥲' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'practice' },
        ]
      },
      {
        img: DG+'jungkookpriv-btsselfie-2017.jpg',
        caption: '',
        likes: '19', date: 'NOVEMBER 2017',
        comments: [
          { user:'j.min__', pfp:DG+'jiminprivpfp.jpg', text:'💜' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'my boys 🥲' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'😐💜' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'miss you 🥹' },
        ]
      },
      {
        img: DG+'jungkookpriv-solar-busantrip2017.jpg',
        caption: '',
        likes: '17', date: 'AUGUST 2017',
        comments: [
          { user:'j.min__', pfp:DG+'jiminprivpfp.jpg', text:'🧡' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'busan 🥲' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I miss this' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'@sollee__ me too' },
        ]
      },
      {
        img: DG+'jungkookpriv-solarbeingfunny-withdrinks-2017.jpg',
        caption: '',
        likes: '15', date: 'APRIL 2017',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'jungkook delete this immediately' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@sollee__ never. this is my favorite thing I've ever taken." },
          { user:'j.min__', pfp:DG+'jiminprivpfp.jpg', text:'😭😭😭' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'I have never loved anyone more than I love solar in this photo 😂' },
        ]
      },
      {
        img: DG+'jungkook-solar-2018.jpg',
        caption: '',
        likes: '16', date: 'JANUARY 2018',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🥹' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I miss this' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'@sollee__ me too' },
        ]
      },
      {
        img: DG+'jungkookpriv-solarindress-2016-afterengagement.jpg',
        caption: '',
        likes: '20', date: 'AUGUST 2016',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'SOL 😭😭😭' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'absolutely beautiful 🥲' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'wow' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'🖤' },
        ]
      },
      {
        img: DG+'jungkookpriv-solkook-polaroid2016.jpg',
        caption: '',
        likes: '21', date: 'JUNE 2016',
        comments: [
          { user:'j.min__', pfp:DG+'jiminprivpfp.jpg', text:'🧡' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'🥲' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I forgot this existed' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@sollee__ I didn't" },
        ]
      },
      {
        img: DG+'jungkook-solar-2016.jpg',
        caption: 'she said yes 🖤',
        likes: '23', date: 'JULY 2016',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'MY BEST FRIENDS 😭😭😭' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'JUNGKOOK!!!!! 🎉🎉' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'finally' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'🖤' },
        ]
      },
      {
        img: DG+'jungkook-recording-2015.jpg',
        caption: '',
        likes: '8', date: 'SEPTEMBER 2015',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'get out of the studio' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@j.min_bts no" },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'jungkook did you eat' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@bts_seokjin yes" },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'liar I was with you all day' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'SOLAR THANK YOU' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@sollee__ don't do this to me" },
        ]
      },
      {
        img: DG+'jungkook-2015.jpg',
        caption: '',
        likes: '7', date: 'MAY 2015',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'why do you look so smug' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@j.min_bts because I am" },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'he does not he just always makes that face' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'that IS his face 😂' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'accurate' },
        ]
      },
      {
        img: DG+'jungkookpriv-solkook-polaroid2014.jpg',
        caption: '',
        likes: '7', date: 'FEBRUARY 2014',
        comments: [
          { user:'j.min__', pfp:DG+'jiminprivpfp.jpg', text:'YOU TWO 😭😭' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'already so sweet 🥲' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'stop it I\'m going to cry' },
        ]
      },
      {
        img: DG+'jungkookpriv-selfie-2014.jpg',
        caption: '',
        likes: '5', date: 'JULY 2014',
        comments: [
          { user:'j.min__', pfp:DG+'jiminprivpfp.jpg', text:'kookie 😭' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'my kid 🥲' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I love you' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@sollee__ I know" },
        ]
      },
      {
        img: DG+'jungkook-2014.jpg',
        caption: '',
        likes: '6', date: 'DECEMBER 2014',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'BABY KOOK 😭' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'little one 🥲' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I am literally obsessed with you' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@sollee__ as you should be" },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'this was like yesterday' },
        ]
      },
      {
        img: DG+'jungkook-taehyung-2013.jpg',
        caption: '',
        likes: '11', date: 'NOVEMBER 2013',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'BABIES 😭😭' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'look at you two 🥲' },
        ]
      },
      {
        img: DG+'jungkook-2013.jpg',
        caption: '',
        likes: '9', date: 'OCTOBER 2013',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'baby kook 🥺' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'😂' },
        ]
      },
      {
        img: DG+'jungkookpriv-solkook-2013selfie.jpg',
        caption: '',
        likes: '10', date: 'DECEMBER 2013',
        comments: [
          { user:'j.min__', pfp:DG+'jiminprivpfp.jpg', text:'YOU TWO 😭' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'from the very beginning 🥲' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'oh no' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@sollee__ what do you mean oh no" },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@jk__real look at us we're so little 😭" },
        ]
      },
    ]
  },

  // ── PARK JIMIN (@j.min_bts) — PUBLIC ─────────────────────────
  jimin: {
    username: 'j.min_bts', verified: true,
    name: 'Park Jimin',
    pfp: DG+'jiminpfp.jpg',
    followers: '19.2M', following: '88', posts: '241',
    bio: 'BTS 💜 HYBE\n1995 ✦ Busan, Korea',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'jimin-diorphotoshoot.jpg',
        caption: 'dior 🖤',
        likes: '9,221,003', date: 'OCTOBER 2021',
        comments: [
          { user:'ARMY_official', pfp:DG+'fanpfp.jpg', text:'JIMIN FOR DIOR 😭😭' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'hyung 🖤 honestly unfair' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'Dior made the right call. I said what I said. 🥲' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'expected nothing less' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'Chimmy in DIOR I am not well 😭🖤' },
          { user:'ARMY_2', pfp:DG+'fanpfp2.jpg', text:'THE MOST BEAUTIFUL MAN ALIVE' },
        ]
      },
      {
        img: DG+'jimin-modelshoot.jpg',
        caption: '💜',
        likes: '7,801,441', date: 'JUNE 2021',
        comments: [
          { user:'ARMY_official', pfp:DG+'fanpfp.jpg', text:'PARK JIMIN 💜💜💜' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'hyung please 😭' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'this kid makes me emotional every time 🥲' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I am not normal about you 😭' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'@sollee__ 🧡' },
        ]
      },
      {
        img: DG+'jimin-atmama.jpg',
        caption: 'ARMY 💜 thank you always.',
        likes: '8,441,002', date: 'DECEMBER 2021',
        comments: [
          { user:'ARMY_official', pfp:DG+'fanpfp.jpg', text:'JIMIN WE LOVE YOU 💜💜💜' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'hyung 💜 you were incredible' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'our Jimin 🥲 so proud' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'you never disappoint' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I screamed. I cried. in that order. 💜🧡' },
          { user:'ARMY_2', pfp:DG+'fanpfp2.jpg', text:'THE PERFORMANCE OF THE NIGHT 😭' },
        ]
      },
    ]
  },

  // ── PARK JIMIN PRIVATE (@j.min__) ────────────────────────────
  jimin_priv: {
    username: 'j.min__', verified: false,
    name: 'jimin',
    pfp: DG+'jiminprivpfp.jpg',
    followers: '18', following: '21', posts: '15',
    bio: '🔒',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'jiminpriv-jungkook-taehyung-selfie-2020.jpg',
        caption: '',
        likes: '17', date: 'MARCH 2020',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'us 🖤' },
          { user:'bts_taetae', pfp:DG+'taepfp.jpg', text:'JIMIN-AH 🐯' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'my three boys 🥲' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'I was cropped out. noted.' },
          { user:'j.min__', pfp:DG+'jiminprivpfp.jpg', text:"@bts_yoongi you weren't there hyung" },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'...noted.' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'my people 🥹' },
        ]
      },
      {
        img: DG+'jiminpriv-jungkook-onvacation-2018-afterscandal.jpg',
        caption: '',
        likes: '11', date: 'OCTOBER 2018',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'needed this' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'rest well. both of you. 🥲' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'good' },
          { user:'bts_taetae', pfp:DG+'taepfp.jpg', text:'I want to come next time 😭' },
          { user:'j.min__', pfp:DG+'jiminprivpfp.jpg', text:'@bts_taetae next time' },
        ]
      },
      {
        img: DG+'jiminpriv-jungkook-yoongi-vacation-2018.jpg',
        caption: '',
        likes: '13', date: 'APRIL 2018',
        comments: [
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'I allowed this photo. reluctantly.' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'@bts_yoongi hyung you literally smiled' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:"@jk__real I was squinting" },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'my kids 🥲 have fun' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I am so jealous right now' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@sollee__ you'll come next time" },
        ]
      },
      {
        img: DG+'jiminpriv-jimin-solar-polaroid-2018-beforescandal.jpg',
        caption: '',
        likes: '14', date: 'FEBRUARY 2018',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'🙂' },
          { user:'j.min__', pfp:DG+'jiminprivpfp.jpg', text:'@jk__real relax' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@j.min__ very relaxed" },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'you two 🥲' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'jungkook.' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@bts_yoongi what" },
        ]
      },
      {
        img: DG+'jiminpriv-jiminandsolar-2017.jpg',
        caption: '',
        likes: '16', date: 'OCTOBER 2017',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'🙂' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'you two 🥲' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'🖤' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'Chimmy 🧡' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'@sollee__ 🙂' },
          { user:'j.min__', pfp:DG+'jiminprivpfp.jpg', text:"@jk__real I will kick you out of this account" },
        ]
      },
      {
        img: DG+'jiminpriv-backstage-jungkook-solar-2016.jpg',
        caption: 'kcon 🖤',
        likes: '12', date: 'JULY 2016',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'best week 🖤' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'🧡🖤' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'I love you three 🥲' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'new york.' },
        ]
      },
      {
        img: DG+'jiminpriv-solaronrooftop2016.jpg',
        caption: '',
        likes: '11', date: 'JULY 2016',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'new york 🥲' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'🖤' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I miss that rooftop' },
        ]
      },
      {
        img: DG+'jiminpriv-jiminandsolar-2015.jpg',
        caption: '',
        likes: '9', date: 'AUGUST 2015',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'😐' },
          { user:'j.min__', pfp:DG+'jiminprivpfp.jpg', text:'@jk__real relax' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@j.min__ I'm very relaxed" },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'jungkook 😂' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'jungkookah. I can see you commenting.' },
        ]
      },
      {
        img: DG+'jiminpriv-2015-pinkhair.jpg',
        caption: '',
        likes: '8', date: 'APRIL 2015',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'who is this' },
          { user:'j.min__', pfp:DG+'jiminprivpfp.jpg', text:"@jk__real it's me" },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@j.min__ I know I just wanted you to explain the hair" },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'iconic era 🥲' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'Chimmy you looked SO good' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'this color actually suited you' },
        ]
      },
      {
        img: DG+'jiminpriv-jimin-solar-2014.jpg',
        caption: '',
        likes: '7', date: 'JULY 2014',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'🙂' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'what are you two up to' },
          { user:'j.min__', pfp:DG+'jiminprivpfp.jpg', text:'@jk__real jungkookah' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@j.min__ what" },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@jk__real just friends. calm down.' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@sollee__ I'm calm" },
        ]
      },
      {
        img: DG+'jiminpriv-jimin-jungkook-selfie-2014.jpg',
        caption: '',
        likes: '6', date: 'MARCH 2014',
        comments: [
          { user:'j.min__', pfp:DG+'jiminprivpfp.jpg', text:'my jungkookah 🥺' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'hyung 🖤' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'my kids 🥲' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'you two are impossible to separate' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'❤' },
        ]
      },
      {
        img: DG+'jiminpriv-jimin-jungkook-2013.jpg',
        caption: '',
        likes: '5', date: 'DECEMBER 2013',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'we look twelve' },
          { user:'j.min__', pfp:DG+'jiminprivpfp.jpg', text:"@jk__real we were basically twelve" },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'babies 🥲' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I need to sit down' },
        ]
      },
      {
        img: DG+'jiminpriv-jimin-solar-2013.jpg',
        caption: '',
        likes: '4', date: 'OCTOBER 2013',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'when was this' },
          { user:'j.min__', pfp:DG+'jiminprivpfp.jpg', text:"@jk__real few weeks ago" },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'@j.min__ ok' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'new friends 🥲' },
        ]
      },
      {
        img: DG+'jiminpriv-mirrorselfie-2013.jpg',
        caption: '',
        likes: '4', date: 'OCTOBER 2013',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'baby hyung 😭' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'look how young 🥲' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'this was like yesterday' },
        ]
      },
      {
        img: DG+'jiminpriv-btsdebutselfie.jpg',
        caption: '',
        likes: '3', date: 'JUNE 2013',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'THE DEBUT ERA 😭' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'how far we have come 🥲' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:"don't make me feel old" },
          { user:'bts_taetae', pfp:DG+'taepfp.jpg', text:'US!!! 😭🐯' },
        ]
      },
    ]
  },

  // ── KOO JUNHOE (@iKON_june) — PUBLIC ─────────────────────────
  junhoe: {
    username: 'iKON_june', verified: true,
    name: 'Koo Junhoe',
    pfp: DG+'junepfp.jpg',
    followers: '2.8M', following: '211', posts: '198',
    bio: 'iKON 🖤 YG Entertainment\n1997 ✦ Seoul, Korea',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'junhoe-onstage-mama.jpg',
        caption: 'MAMA 🖤 iKONICS thank you always',
        likes: '1,104,882', date: 'DECEMBER 2021',
        comments: [
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg', text:'JUNE AT MAMA 🖤🖤🖤' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'well done' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'proud of you 🖤' },
          { user:'kimsoomi_official', pfp:DG+'soomipfp.jpg', text:'JUNE-YA 😭🖤' },
          { user:'ikonics_2', pfp:DG+'fanpfp2.jpg', text:'THE BEST VOCAL IN THE INDUSTRY' },
        ]
      },
      {
        img: DG+'junhoe-modelshoot.jpg',
        caption: '🖤',
        likes: '892,441', date: 'AUGUST 2021',
        comments: [
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg', text:'SO HANDSOME 🖤🖤' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'go touch grass' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:"@jinan_94 you're just jealous" },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'😂🖤' },
          { user:'kimsoomi_official', pfp:DG+'soomipfp.jpg', text:'June 😭' },
        ]
      },
      {
        img: DG+'junhoe-jinhwan-2021.jpg',
        caption: '',
        likes: '721,004', date: 'JUNE 2021',
        comments: [
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg',   text:'JUNE AND JINAN 🖤🖤🖤' },
          { user:'jinan_94',         pfp:DG+'jinhwanpfp.jpg',text:'go touch grass' },
          { user:'iKON_june',        pfp:DG+'junepfp.jpg',  text:"@jinan_94 hyung this is a good photo and you know it" },
          { user:'leader_hanbin',    pfp:DG+'hanbinpfp.jpg',text:'my boys 🖤' },
          { user:'kimsoomi_official',pfp:DG+'soomipfp.jpg', text:'🥹🖤' },
        ]
      },
      {
        img: DG+'junhoe-poolmountainshot.jpg',
        caption: '',
        likes: '631,002', date: 'MARCH 2021',
        comments: [
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg', text:'WHERE IS THIS 😭🖤' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'you did not invite me' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:"@jinan_94 hyung you were busy" },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'go enjoy the water' },
        ]
      },
      {
        img: DG+'junhoe-ikonforvogue.jpg',
        caption: '🖤 vogue',
        likes: '864,002', date: 'JUNE 2020',
        comments: [
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg',   text:'iKON FOR VOGUE 🖤🖤🖤 THE INDUSTRY' },
          { user:'jinan_94',         pfp:DG+'jinhwanpfp.jpg',text:'good work' },
          { user:'leader_hanbin',    pfp:DG+'hanbinpfp.jpg',text:'proud 🖤' },
          { user:'kimsoomi_official',pfp:DG+'soomipfp.jpg', text:'MY BOYS 🥹🖤' },
          { user:'sollee__',         pfp:DG+'solarpfp.jpg', text:'iKON 🖤' },
          { user:'ikonics_2',        pfp:DG+'fanpfp2.jpg',  text:'THIS SHOULD HAVE BEEN THE COVER' },
        ]
      },
      {
        img: DG+'junhoe-jinhwan-ikonconcert.jpg',
        caption: 'iKONICS 🖤',
        likes: '921,004', date: 'JANUARY 2020',
        comments: [
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg', text:'JINAN AND JUNE 🖤🖤' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'best night' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'we were incredible 🖤' },
          { user:'kimsoomi_official', pfp:DG+'soomipfp.jpg', text:'you two 🥲🖤' },
          { user:'ikonics_2', pfp:DG+'fanpfp2.jpg', text:'THIS CONCERT CHANGED MY LIFE' },
        ]
      },
      {
        img: DG+'junhoe-bobby-selfie.jpg',
        caption: '',
        likes: '803,221', date: 'SEPTEMBER 2019',
        comments: [
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg', text:'JUNE AND BOBBY 🖤' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'what are you two doing' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:"@jinan_94 being iconic. obviously." },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'😂' },
        ]
      },
    ]
  },

  // ── KOO JUNHOE PRIVATE (@june__) ─────────────────────────────
  junhoe_priv: {
    username: 'june__', verified: false,
    name: 'june',
    pfp: DG+'junhoeprivpfp.jpg',
    followers: '22', following: '18', posts: '6',
    bio: '🔒',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'junhoepriv-solarpeacesign-onplane.jpg',
        caption: '',
        likes: '19', date: 'JUNE 2021',
        comments: [
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'june.' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:"@jinan__ what" },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I did not approve this' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:"@sollee__ too bad" },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'😂' },
        ]
      },
      {
        img: DG+'junhoepriv-jinhwaneating-fluffycheeks.jpg',
        caption: '',
        likes: '16', date: 'MARCH 2021',
        comments: [
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'delete this.' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:'@jinan__ never' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'the cheeks 😭' },
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'@sollee__ DO NOT encourage him' },
        ]
      },
      {
        img: DG+'junhoepriv-peacesignincar.png',
        caption: '',
        likes: '13', date: 'APRIL 2020',
        comments: [
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'where are you going' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:"@jinan__ nowhere just sitting in this car" },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'same 😐' },
        ]
      },
      {
        img: DG+'junhoepriv-junhoeandsolar-innewyork-2020.png',
        caption: '',
        likes: '21', date: 'FEBRUARY 2020',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'miss this already' },
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'you two are always together' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:'@jinan__ 🙄' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'NYC trio 🗽' },
        ]
      },
      {
        img: DG+'junhoepriv-jinhwanlookingatsolar-onygtvshow-2019.jpg',
        caption: '',
        likes: '17', date: 'SEPTEMBER 2019',
        comments: [
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'what are you even looking at' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:'@jinan__ the camera obviously' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'😭😭' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'lmao hanbin catching the whole thing' },
        ]
      },
      {
        img: DG+'junhoepriv-june2019-jinhwanandsolar-songwriting.png',
        caption: 'these two have been in here for six hours. they look insane.',
        likes: '18', date: 'JUNE 2019',
        comments: [
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'delete this' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:"@jinan__ you haven't even looked up in two hours" },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'we are WORKING june' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:"@sollee__ you're staring at each other" },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'let them cook 😭' },
        ]
      },
      {
        img: DG+'junhoepriv-celebratorydrinking.jpg',
        caption: '',
        likes: '18', date: 'NOVEMBER 2018',
        comments: [
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'we deserve this 🥂' },
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'so proud 🖤' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:'@jinan__ hyung you cried' },
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:"@june__ I did not" },
        ]
      },
      {
        img: DG+'junhoepriv-jinhwan-animeposing.jpg',
        caption: '',
        likes: '14', date: 'AUGUST 2017',
        comments: [
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'delete this immediately' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:'@jinan__ never' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'iconic 😭' },
          { user:'ikon_donghyuk', pfp:DG+'donghyukpfp.jpg', text:'jinhwan hyung 💀' },
        ]
      },
      {
        img: DG+'junhoepriv-jinhwan-filming.jpg',
        caption: '',
        likes: '11', date: 'APRIL 2017',
        comments: [
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'I told you not to film me' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:'@jinan__ but you were so focused' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'this is sweet actually' },
        ]
      },
      {
        img: DG+'junhoepriv-solareatingpizza.jpg',
        caption: '',
        likes: '9', date: 'JUNE 2016',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I was EATING' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:'@sollee__ and you looked hilarious' },
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'😂' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I hate you both' },
        ]
      },
    ]
  },

  // ── KIM JINHWAN (@jinan_94) — PUBLIC ─────────────────────────
  jinhwan: {
    username: 'jinan_94', verified: true,
    name: 'Kim Jinhwan',
    pfp: DG+'jinhwanpfp.jpg',
    followers: '3.1M', following: '198', posts: '190',
    bio: 'iKON 🖤 YG Entertainment\n1994 ✦ Jeju, Korea',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'jinhwan-awardshow.jpg',
        caption: 'MAMA 🖤 iKONICS thank you always',
        likes: '721,003', date: 'DECEMBER 2021',
        comments: [
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg', text:'JINAN 🖤🖤🖤' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'hyung you ate that whole stage' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'💪🖤' },
          { user:'kimsoomi_official', pfp:DG+'soomipfp.jpg', text:'🥹🖤' },
          { user:'ikonics_2', pfp:DG+'fanpfp2.jpg', text:'THE BEST OF THE NIGHT' },
        ]
      },
      {
        img: DG+'jinhwan-photoshoot-thestar-june2021.png',
        caption: 'The Star 🖤',
        likes: '651,004', date: 'JUNE 2021',
        comments: [
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg',   text:'JINAN THE STAR COVER 🖤🖤🖤' },
          { user:'iKON_june',        pfp:DG+'junepfp.jpg',  text:'hyung you look too good I genuinely cannot handle this' },
          { user:'leader_hanbin',    pfp:DG+'hanbinpfp.jpg',text:'🖤' },
          { user:'kimsoomi_official',pfp:DG+'soomipfp.jpg', text:'🥹🖤' },
          { user:'ikonics_2',        pfp:DG+'fanpfp2.jpg',  text:'THE COVER WE DESERVED' },
        ]
      },
      {
        img: DG+'jinhwan-magazinephotoshoot-2020.jpg',
        caption: '',
        likes: '579,221', date: 'JULY 2020',
        comments: [
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg',   text:'JINAN 🖤🖤🖤' },
          { user:'iKON_june',        pfp:DG+'junepfp.jpg',  text:'hyung said model behavior' },
          { user:'leader_hanbin',    pfp:DG+'hanbinpfp.jpg',text:'💪🖤' },
          { user:'kimsoomi_official',pfp:DG+'soomipfp.jpg', text:'always 🥹🖤' },
          { user:'sollee__',         pfp:DG+'solarpfp.jpg', text:'🖤' },
        ]
      },
      {
        img: DG+'jinhwan-onstage-kcon.jpg',
        caption: 'KCON 2020 🖤 iKONICS thank you',
        likes: '621,004', date: 'JANUARY 2020',
        comments: [
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg', text:'JINAN 🖤🖤🖤' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'THIS is what years of practice looks like 🖤' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'💪' },
          { user:'kimsoomi_official', pfp:DG+'soomipfp.jpg', text:'🥹🖤' },
        ]
      },
      {
        img: DG+'jinhwan-backstage.jpg',
        caption: 'backstage with my boys 🖤',
        likes: '534,210', date: 'JANUARY 2020',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'the best night 🖤' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'iKON forever' },
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg', text:'WE LOVE YOU BOYS 🖤🖤' },
          { user:'kimsoomi_official', pfp:DG+'soomipfp.jpg', text:'my boys 🥹' },
        ]
      },
      {
        img: DG+'jinhwan-december20190-photoofhim-nature.jpg',
        caption: '',
        likes: '510,882', date: 'DECEMBER 2019',
        comments: [
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg',   text:'JINAN 🖤🖤' },
          { user:'iKON_june',        pfp:DG+'junepfp.jpg',  text:'hyung where even is this' },
          { user:'jinan_94',         pfp:DG+'jinhwanpfp.jpg',text:'@iKON_june far from you' },
          { user:'iKON_june',        pfp:DG+'junepfp.jpg',  text:'@jinan_94 HYUNG 😭' },
          { user:'leader_hanbin',    pfp:DG+'hanbinpfp.jpg',text:'🖤' },
        ]
      },
      {
        img: DG+'jinhwan-seongnam.jpg',
        caption: 'seongnam 🌙',
        likes: '541,009', date: 'SEPTEMBER 2019',
        comments: [
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg', text:'JINAN AND SOOMI 🖤🖤🖤' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'wait when did this happen' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'🖤' },
          { user:'kimsoomi_official', pfp:DG+'soomipfp.jpg', text:'🌙🖤' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'😭🖤' },
        ]
      },
      {
        img: DG+'jinhwan-lovescenarioera-2019.png',
        caption: 'love scenario era. throwback. 🖤',
        likes: '503,112', date: 'AUGUST 2019',
        comments: [
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg', text:'THE ERA 🖤🖤🖤' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'the throwback hurts. we were SO good. 🖤' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'we did well 🖤' },
          { user:'kimsoomi_official', pfp:DG+'soomipfp.jpg', text:'MY FAVORITE ERA 😭🖤' },
        ]
      },
      {
        img: DG+'jinhwanpfp.jpg',
        caption: 'iKONICS 🖤',
        likes: '498,231', date: 'MARCH 2019',
        comments: [
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg', text:'JINAN 🖤🖤🖤' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'hyung you look tired go to bed' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'🙄' },
          { user:'kimsoomi_official', pfp:DG+'soomipfp.jpg', text:'🥹' },
        ]
      },
      {
        img: DG+'jinhwan-june-tourism.jpg',
        caption: '',
        likes: '389,002', date: 'OCTOBER 2018',
        comments: [
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg', text:'JINAN AND JUNE TOURIST MODE 🖤🖤' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'hyung said let\'s do something normal for once' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'only you two 😂🖤' },
          { user:'ikonics_2', pfp:DG+'fanpfp2.jpg', text:'I LOVE THEM SO MUCH' },
        ]
      },
      {
        img: DG+'jinhwan-blingblingstage-late2018.jpg',
        caption: '',
        likes: '451,003', date: 'NOVEMBER 2018',
        comments: [
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg',   text:'JINAN ON STAGE 🖤🖤🖤' },
          { user:'iKON_june',        pfp:DG+'junepfp.jpg',  text:'hyung killed this whole set' },
          { user:'leader_hanbin',    pfp:DG+'hanbinpfp.jpg',text:'iKON 🖤' },
          { user:'kimsoomi_official',pfp:DG+'soomipfp.jpg', text:'🥹🖤' },
        ]
      },
      {
        img: DG+'jinhwan-blingbling.jpg',
        caption: 'Bling Bling era 🖤',
        likes: '412,009', date: 'JUNE 2018',
        comments: [
          { user:'ikonics_official', pfp:DG+'fanpfp.jpg', text:'THE ERA THAT STARTED IT ALL 🖤' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'hyung looked SO good here' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'throwback 🖤' },
        ]
      },
    ]
  },

  // ── KIM JINHWAN PRIVATE (@jinan__) ───────────────────────────
  jinhwan_priv: {
    username: 'jinan__', verified: false,
    name: 'jinhwan',
    pfp: DG+'jinhwanpfp.jpg',
    followers: '31', following: '29', posts: '21',
    bio: '🔒',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'jinhwan-solar-backstage.jpg',
        caption: '',
        likes: '28', date: 'JUNE 2021',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'you two were INCREDIBLE tonight' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'my two favourite artists 🖤' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"I still can't believe we pulled that off 😭" },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@sollee__ we always do' },
        ]
      },
      {
        img: DG+'jinhwan-athomeselfie.jpg',
        caption: '',
        likes: '19', date: 'MARCH 2021',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'hyung answer your phone' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'you good?' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@leader_hanbin yeah. just tired.' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"I'm coming over" },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:"@sollee__ you don't have to" },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@jinan__ I know' },
        ]
      },
      {
        img: DG+'jinhwanpriv-jinhwanandsolar-april2021.png',
        caption: '',
        likes: '22', date: 'APRIL 2021',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'hyung what is going on with your face' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:"@iKON_june I'm smiling. people do that." },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:"@jinan__ you DON'T though. that's the thing." },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'🖤' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@iKON_june go away' },
        ]
      },
      {
        img: DG+'ikon-selfie.jpg',
        caption: 'my people 🖤',
        likes: '24', date: 'FEBRUARY 2021',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'THE BEST LOOKING GROUP IN THE INDUSTRY' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'🖤' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I love you all so much 🥲' },
        ]
      },
      {
        img: DG+'jinhwan-cafe.jpg',
        caption: '',
        likes: '14', date: 'JANUARY 2021',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'where is this' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:"@iKON_june none of your business" },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I know exactly where this is' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@sollee__ 🤫' },
        ]
      },
      {
        img: DG+'jinhwan-skyselfie.jpg',
        caption: '',
        likes: '21', date: 'DECEMBER 2020',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'hyung where are you going' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@iKON_june just walking' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"call me when you're done walking" },
        ]
      },
      {
        img: DG+'jinhwan-niceview.jpg',
        caption: '',
        likes: '18', date: 'NOVEMBER 2020',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'actually stunning' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'🖤' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'take me next time' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@sollee__ deal' },
        ]
      },
      {
        img: DG+'jinhwanpriv-solarandjinhwan-2020.png',
        caption: '',
        likes: '23', date: 'SEPTEMBER 2020',
        comments: [
          { user:'iKON_june',     pfp:DG+'junepfp.jpg',    text:"hyung I'm going to need context" },
          { user:'jinan__',       pfp:DG+'jinhwanpfp.jpg', text:'@iKON_june there is no context' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg',  text:'🖤' },
        ]
      },
      {
        img: DG+'jinhwanpriv-atikondorm-june2020.jpg',
        caption: '',
        likes: '19', date: 'JUNE 2020',
        comments: [
          { user:'iKON_june',     pfp:DG+'junepfp.jpg',    text:'hyung that is MY spot on the couch' },
          { user:'jinan__',       pfp:DG+'jinhwanpfp.jpg', text:"@iKON_june it's my couch now" },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg',  text:'at home 🖤' },
          { user:'sollee__',      pfp:DG+'solarpfp.jpg',   text:'I miss this place' },
        ]
      },
      {
        img: DG+'jinhwanpriv-marieclare-photoshoot-march2020.png',
        caption: '',
        likes: '26', date: 'MARCH 2020',
        comments: [
          { user:'iKON_june',     pfp:DG+'junepfp.jpg',    text:'hyung please' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg',  text:'🖤' },
          { user:'sollee__',      pfp:DG+'solarpfp.jpg',   text:'you always look like this and act like it is nothing' },
          { user:'jinan__',       pfp:DG+'jinhwanpfp.jpg', text:"@sollee__ it's just a shoot" },
          { user:'sollee__',      pfp:DG+'solarpfp.jpg',   text:'@jinan__ right.' },
        ]
      },
      {
        img: DG+'jinhwanpriv-photo-of-him-bysolar-february2020.jpg',
        caption: '',
        likes: '21', date: 'FEBRUARY 2020',
        comments: [
          { user:'iKON_june',     pfp:DG+'junepfp.jpg',    text:'WHO took this' },
          { user:'jinan__',       pfp:DG+'jinhwanpfp.jpg', text:'@iKON_june someone who knows how to be quiet' },
          { user:'iKON_june',     pfp:DG+'junepfp.jpg',    text:'@jinan__ HYUNG' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg',  text:'🖤' },
        ]
      },
      {
        img: DG+'jinhwanpriv-solarandjinhwan-innewyork-early2020.png',
        caption: '',
        likes: '24', date: 'FEBRUARY 2020',
        comments: [
          { user:'iKON_june',     pfp:DG+'junepfp.jpg',    text:"hyung you were in new york and didn't call me" },
          { user:'jinan__',       pfp:DG+'jinhwanpfp.jpg', text:'@iKON_june you were in Seoul' },
          { user:'iKON_june',     pfp:DG+'junepfp.jpg',    text:"@jinan__ I would have taken a flight" },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg',  text:'looks cold 🖤' },
          { user:'sollee__',      pfp:DG+'solarpfp.jpg',   text:'it was freezing' },
        ]
      },
      {
        img: DG+'jinhwan-newyears.jpg',
        caption: 'new year 🌙',
        likes: '26', date: 'JANUARY 2020',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'hyung happy new year 🖤' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'새해 복 많이 받으세요 🖤' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'happy new year jinhwan 🌙' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@sollee__ 🌙' },
        ]
      },
      {
        img: DG+'jinhwanpriv-onplane-tokconny-january2020.jpg',
        caption: '',
        likes: '17', date: 'JANUARY 2020',
        comments: [
          { user:'iKON_june',     pfp:DG+'junepfp.jpg',    text:'hyung how are you posting from the air' },
          { user:'jinan__',       pfp:DG+'jinhwanpfp.jpg', text:"@iKON_june wifi" },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg',  text:'see you there 🖤' },
          { user:'sollee__',      pfp:DG+'solarpfp.jpg',   text:"I'm already there" },
          { user:'jinan__',       pfp:DG+'jinhwanpfp.jpg', text:'@sollee__ I know.' },
        ]
      },
      {
        img: DG+'jinhwanpriv-jinhwanandsolar-leavingmama2019.png',
        caption: '',
        likes: '25', date: 'DECEMBER 2019',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'hyung you two went to MAMA and I did not get a single text' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:"@iKON_june you were literally there" },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:"@jinan__ I KNOW but you didn't tell me you were leaving TOGETHER" },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'incredible night 🖤' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'best dressed in the building 🖤' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@sollee__ obviously' },
        ]
      },
      {
        img: DG+'jinhwanpriv-solarandjinhwan-sittingoutsideinnature-late2019.png',
        caption: '',
        likes: '20', date: 'NOVEMBER 2019',
        comments: [
          { user:'iKON_june',     pfp:DG+'junepfp.jpg',    text:'HYUNG. EXPLAIN.' },
          { user:'jinan__',       pfp:DG+'jinhwanpfp.jpg', text:"@iKON_june explain what" },
          { user:'iKON_june',     pfp:DG+'junepfp.jpg',    text:'@jinan__ HYUNG COME ON' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg',  text:'🖤' },
        ]
      },
      {
        img: DG+'jinhwanpriv-november2019-inthesnow.jpg',
        caption: '',
        likes: '15', date: 'NOVEMBER 2019',
        comments: [
          { user:'iKON_june',     pfp:DG+'junepfp.jpg',    text:'hyung where are you' },
          { user:'jinan__',       pfp:DG+'jinhwanpfp.jpg', text:'@iKON_june outside' },
          { user:'sollee__',      pfp:DG+'solarpfp.jpg',   text:'come inside it is too cold' },
          { user:'jinan__',       pfp:DG+'jinhwanpfp.jpg', text:"@sollee__ I'm okay" },
        ]
      },
      {
        img: DG+'jinhwanpriv-jinhwanatcafe-november2019.jpg',
        caption: '',
        likes: '13', date: 'NOVEMBER 2019',
        comments: [
          { user:'iKON_june',     pfp:DG+'junepfp.jpg',    text:'which cafe is this' },
          { user:'jinan__',       pfp:DG+'jinhwanpfp.jpg', text:"@iKON_june why" },
          { user:'iKON_june',     pfp:DG+'junepfp.jpg',    text:"@jinan__ I'm coming" },
          { user:'jinan__',       pfp:DG+'jinhwanpfp.jpg', text:"@iKON_june please don't" },
          { user:'sollee__',      pfp:DG+'solarpfp.jpg',   text:'@iKON_june I will tell you later' },
        ]
      },
      {
        img: DG+'jinhwan-walk.jpg',
        caption: '',
        likes: '12', date: 'OCTOBER 2019',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'WHATS NEXT TO YOU' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@iKON_june a friend' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'@jinan__ HYUNG THATS A MONKEY' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'only jinhwan' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I have so many questions' },
        ]
      },
      {
        img: DG+'jinhwan-incar.jpg',
        caption: '',
        likes: '9', date: 'JUNE 2019',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'where are you going at this hour' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@iKON_june out' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"I'm in the car" },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'@sollee__ WHAT' },
        ]
      },
      {
        img: DG+'jinhwanpriv-celebratinghisbday-withsolar-feb2019.png',
        caption: '',
        likes: '20', date: 'FEBRUARY 2019',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'HAPPY BIRTHDAY HYUNG 🎂🖤' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'happy birthday jinhwan 🖤 we love you' },
          { user:'ikon_donghyuk', pfp:DG+'donghyukpfp.jpg', text:'happy birthday hyung!!! 🥳' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'happy birthday. I hope it is everything. 🖤' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@sollee__ it is. thank you.' },
        ]
      },
      {
        img: DG+'jinhwanpriv-2018-watchingperfonphone.png',
        caption: '',
        likes: '18', date: 'NOVEMBER 2018',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'hyung what performance is this' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@iKON_june ours' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'@jinan__ which one' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'I do this too 🖤' },
        ]
      },
      {
        img: DG+'jinhwanpriv-donghyuk-bobby-jinhwan-atbeach-2018.png',
        caption: '',
        likes: '22', date: 'JUNE 2018',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'WHY WASNT I THERE' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@iKON_june you were busy' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'@jinan__ I was NOT' },
          { user:'ikon_donghyuk', pfp:DG+'donghyukpfp.jpg', text:'the best day 🌊' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'take me next time 🖤' },
        ]
      },
      {
        img: DG+'jinhwanpriv-ikon-groupphoto-2017.png',
        caption: 'my people 🖤',
        likes: '28', date: 'MARCH 2017',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'THE BEST LOOKING GROUP ALIVE' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'iKON 🖤' },
          { user:'ikon_donghyuk', pfp:DG+'donghyukpfp.jpg', text:'WE EAT 😭🖤' },
        ]
      },
      {
        img: DG+'jinhwan-bobby-2016.jpg',
        caption: '',
        likes: '31', date: 'AUGUST 2016',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'throwback 😭😭' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'we were so young 🥲' },
        ]
      },
    ]
  },

  // ── JEON JUNGKOOK (@jk_95) — PUBLIC ──────────────────────────
  jungkook: {
    username: 'jk_95', verified: true,
    name: 'Jeon Jungkook',
    pfp: DG+'jungkookpfp.jpg',
    followers: '28.9M', following: '72', posts: '316',
    bio: 'BTS 💜 HYBE\n1995 ✦ Busan, Korea',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'jungkook-awardshow.jpg',
        caption: 'MAMA 💜 ARMY thank you',
        likes: '11,203,441', date: 'DECEMBER 2021',
        comments: [
          { user:'ARMY_official', pfp:DG+'fanpfp.jpg', text:'JUNGKOOK WE LOVE YOU 💜💜💜' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'I am the proudest person alive right now 😭💜' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'this kid 🥲' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'good.' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'💜' },
          { user:'ARMY_2', pfp:DG+'fanpfp2.jpg', text:'THE PERFORMANCE OF THE YEAR' },
        ]
      },
      {
        img: DG+'jungkook-comebackselfie.jpg',
        caption: 'ARMY 💜',
        likes: '9,431,002', date: 'MAY 2021',
        comments: [
          { user:'ARMY_official', pfp:DG+'fanpfp.jpg', text:'JUNGKOOK WE LOVE YOU 💜💜💜' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'our comeback king 😭' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'he is so photogenic it is unfair 🥲' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'HIM. 😭' },
          { user:'ARMY_2', pfp:DG+'fanpfp2.jpg', text:'OUR GOLDEN MAKNAE 😭' },
        ]
      },
      {
        img: DG+'jungkook-photoshoot.jpg',
        caption: '💜',
        likes: '8,003,441', date: 'JUNE 2020',
        comments: [
          { user:'ARMY_official', pfp:DG+'fanpfp.jpg', text:'JUNGKOOK YOU ARE UNREAL 💜💜' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'why does he always do this to us 😭' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'good photo' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'jungkookah 🥹' },
          { user:'ARMY_2', pfp:DG+'fanpfp2.jpg', text:'THE MOST BEAUTIFUL MAN' },
        ]
      },
      {
        img: DG+'jungkook-onstage-atkcon2020.jpg',
        caption: 'KCON 2020 💜 ARMY thank you',
        likes: '7,441,002', date: 'JANUARY 2020',
        comments: [
          { user:'ARMY_official', pfp:DG+'fanpfp.jpg', text:'JUNGKOOK YOU OWNED THAT STAGE 💜💜' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'my best friend 😭💜' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'I watched the whole thing twice 🥲' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I was THERE for this and I am still not over it' },
          { user:'ARMY_2', pfp:DG+'fanpfp2.jpg', text:'THE GOLDEN MAKNAE DELIVERED' },
        ]
      },
      {
        img: DG+'jungkook-babyjungkookpic.jpg',
        caption: 'found this.',
        likes: '9,201,003', date: 'OCTOBER 2019',
        comments: [
          { user:'ARMY_official', pfp:DG+'fanpfp.jpg', text:'BABY JUNGKOOK 😭😭😭 💜' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'BABY KOOK I AM NOT OKAY 😭😭' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'look at this child 🥲' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'this is the best thing I have ever seen' },
          { user:'ARMY_2', pfp:DG+'fanpfp2.jpg', text:'HE HAS NOT CHANGED AT ALL 😭' },
        ]
      },
      {
        img: DG+'jungkook-niceview-2018-afterscandal.jpg',
        caption: '',
        likes: '5,103,221', date: 'OCTOBER 2018',
        comments: [
          { user:'ARMY_official', pfp:DG+'fanpfp.jpg', text:'JUNGKOOK 💜💜' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'you good kid? 🥲' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'nice view' },
          { user:'ARMY_2', pfp:DG+'fanpfp2.jpg', text:'we love you jungkook 💜' },
        ]
      },
      {
        img: DG+'jungkook-2016.jpg',
        caption: 'KCON 💜 ARMY',
        likes: '6,891,002', date: 'JUNE 2016',
        comments: [
          { user:'ARMY_official', pfp:DG+'fanpfp.jpg', text:'JUNGKOOK 💜💜' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'my baby 😭 look how young' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'I remember this. I was so proud of him.' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'baby kook' },
          { user:'ARMY_2', pfp:DG+'fanpfp2.jpg', text:'HE WAS ALWAYS THIS TALENTED 😭' },
        ]
      },
    ]
  },

  // ── LEE JAEHYUN (@jaehyunlee__) ─────────────────────────────
  jaehyun_lee: {
    username: 'jaehyunlee__', verified: false,
    name: 'Lee Jaehyun',
    pfp: DG+'jaepfp.jpg',
    followers: '1,203', following: '88', posts: '4',
    bio: 'new york',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'jaehyun-yachtandfoodviews.jpg',
        caption: '',
        likes: '1,104', date: 'AUGUST 2021',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'invite me next time' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'the view 😭' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'living well 🥂' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'the food too 😭' },
        ]
      },
      {
        img: DG+'jaehyun-sideprofilecar-leatherjacketglasses.jpg',
        caption: '',
        likes: '988', date: 'JUNE 2021',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'who took this' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:"@chaerin_lee none of your business" },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'looking good jae' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'my brother 🥲' },
        ]
      },
      {
        img: DG+'jaehyun-carpicatleemansion.jpg',
        caption: 'home.',
        likes: '871', date: 'JULY 2020',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'miss this 🥲' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'nothing like it' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'the car AND the house 😭' },
        ]
      },
      {
        img: DG+'jaehyun-picofjuyeonouttoeat.jpg',
        caption: '',
        likes: '644', date: 'FEBRUARY 2020',
        comments: [
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'I was EATING' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:"@juyeonlee__ and you looked happy" },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'juyeon 😭' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I love this 🥲' },
        ]
      },
    ]
  },

  // ── LEE JUYEON (@juyeonlee__) ───────────────────────────────
  juyeon_lee: {
    username: 'juyeonlee__', verified: false,
    name: 'Lee Juyeon',
    pfp: DG+'juyeonpfp.jpg',
    followers: '891', following: '120', posts: '22',
    bio: 'new york',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'juyeon-chaerin-dragonhats.jpg',
        caption: '',
        likes: '712', date: 'AUGUST 2021',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'delete this or I will delete you' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:"@chaerin_lee no" },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'why.' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I love you both so much 😭' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'ICONIC 😭😭' },
        ]
      },
      {
        img: DG+'juyeon-chaerin.jpg',
        caption: '',
        likes: '601', date: 'JULY 2021',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'delete' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:"@chaerin_lee no" },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'what are you two doing 😭' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I love you idiots 🥲' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'the funniest people alive honestly' },
        ]
      },
      {
        img: DG+'juyeon-mirrorselfie.jpg',
        caption: '',
        likes: '441', date: 'MAY 2021',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'who are you and what did you do with my embarrassing brother' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:"@chaerin_lee shut up" },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'looking good juyeon' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'that is MY little brother 😭' },
        ]
      },
      {
        img: DG+'juyeon-facemask.jpg',
        caption: '',
        likes: '312', date: 'MARCH 2021',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'what is on your face' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:"@chaerin_lee skincare" },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'@juyeonlee__ ok king' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'self care 🥲' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'?' },
        ]
      },
      {
        img: DG+'juyeon-leesiblingsshoppingcarts.jpg',
        caption: '',
        likes: '488', date: 'APRIL 2021',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'this was the best day' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:"@chaerin_lee agreed" },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'you two are unhinged' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I want to be there 😭' },
        ]
      },
      {
        img: DG+'juyeon-sitting.jpg',
        caption: 'nothing like this city.',
        likes: '322', date: 'FEBRUARY 2020',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'new york 🥲' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'facts' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'agreed' },
        ]
      },
      {
        img: DG+'juyeon-openingbottle.jpg',
        caption: '',
        likes: '271', date: 'JANUARY 2020',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'juyeon.' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:"@chaerin_lee it was a celebration" },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'what were you celebrating' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:"@jaehyunlee__ being alive" },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'valid' },
        ]
      },
      {
        img: DG+'juyeon-alcoholcupcakes.jpg',
        caption: '',
        likes: '248', date: 'NOVEMBER 2019',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'I have questions' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:"@chaerin_lee no you don't" },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'what is happening 😭' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'juyeon.' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:"@jaehyunlee__ I'm fine" },
        ]
      },
      {
        img: DG+'juyeon-bdaypic-2012.jpg',
        caption: '',
        likes: '189', date: 'DECEMBER 2012',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'WE WERE SO LITTLE 😭😭' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:"@chaerin_lee speak for yourself I was tall" },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'you were not that tall' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:"@jaehyunlee__ I was." },
        ]
      },
    ]
  },

  // ── CHOI CHANHEE (@chanhee) ───────────────────────────────────
  chanhee: {
    username: 'chanhee', verified: false,
    name: 'Choi Chanhee',
    pfp: DG+'chanheepfp.jpg',
    followers: '1,204', following: '340', posts: '91',
    bio: 'new york\nfashion. columbia. future ceo (allegedly). solar\'s keeper (unfortunately)',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'chanhee-inseoul-october2021.jpg',
        caption: '',
        likes: '1,102', date: 'OCTOBER 2021',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'HE IS HERE' },
          { user:'kevin_moon', pfp:'', text:'chanhee in SEOUL??' },
          { user:'jacob_moon', pfp:'', text:'look at him thriving 😭' },
          { user:'changmin__', pfp:'', text:'about time you showed up' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"@sollee__ I said I would visit didn't I" },
        ]
      },
      {
        img: DG+'chanhee-andsolar-eatingout-september2021.png',
        caption: '',
        likes: '978', date: 'SEPTEMBER 2021',
        comments: [
          { user:'kevin_moon', pfp:'', text:'the two most important people 😭' },
          { user:'jacob_moon', pfp:'', text:'LOOK AT HER SMILING' },
          { user:'changmin__', pfp:'', text:'wait she looks happy. Is she okay?' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@changmin__ I am perfectly capable of being happy' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'@changmin__ she threatened me twice during this meal and yes she is fine' },
        ]
      },
      {
        img: DG+'chanheepfp.jpg',
        caption: 'surviving',
        likes: '892', date: 'AUGUST 2021',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'barely 🙂' },
          { user:'kevin_moon', pfp:'', text:'hang in there king 💪' },
          { user:'jacob_moon', pfp:'', text:'you got this hee!! 🙏' },
          { user:'changmin__', pfp:'', text:'what happened' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'@changmin__ Solar happened' },
        ]
      },
      {
        img: DG+'chanhee-wooatsolar.jpg',
        caption: 'caught him smiling. sending this to everyone I know.',
        likes: '1,003', date: 'JULY 2021',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'CHANHEE DELETE THIS RIGHT NOW' },
          { user:'kevin_moon', pfp:'', text:'NO WAY IS THAT HIM SMILING 😭' },
          { user:'jacob_moon', pfp:'', text:'this is the most important photo ever taken' },
          { user:'changmin__', pfp:'', text:'framing this' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"@sollee__ absolutely not it's going in an album" },
        ]
      },
      {
        img: DG+'chanhee-nyc-pic.jpg',
        caption: '',
        likes: '741', date: 'MAY 2021',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'my favorite city and my favorite person' },
          { user:'kevin_moon', pfp:'', text:'the coat. iconic.' },
          { user:'jacob_moon', pfp:'', text:'king behavior as always 😭' },
          { user:'changmin__', pfp:'', text:'NYC will never not look good on you' },
        ]
      },
      {
        img: DG+'chanhee-baking.jpg',
        caption: 'brownies. I am capable of more than you think.',
        likes: '634', date: 'APRIL 2020',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'send me some RIGHT NOW' },
          { user:'kevin_moon', pfp:'', text:'CHANHEE CAN BAKE???' },
          { user:'jacob_moon', pfp:'', text:'saving this for when I need to feel better' },
          { user:'changmin__', pfp:'', text:'send those to me immediately' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'@sollee__ you are in korea' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@chanhee I will get on a plane' },
        ]
      },
      {
        img: DG+'chanhee-inthecity.jpg',
        caption: '',
        likes: '891', date: 'MARCH 2020',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'this is literally all you do' },
          { user:'kevin_moon', pfp:'', text:'FASHION ICON 😭😭' },
          { user:'jacob_moon', pfp:'', text:'king behavior' },
          { user:'changmin__', pfp:'', text:'serving as always' },
        ]
      },
      {
        img: DG+'chanhee-jacob-changmin.jpg',
        caption: 'the usual suspects',
        likes: '740', date: 'SEPTEMBER 2019',
        comments: [
          { user:'kevin_moon', pfp:'', text:'WHY WASNT I INVITED' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'WHY WASNT I INVITED' },
          { user:'changmin__', pfp:'', text:'@kevin_moon @sollee__ you were both busy 😭' },
          { user:'jacob_moon', pfp:'', text:'next time for sure 🥺' },
        ]
      },
      {
        img: DG+'chanhee-nycrooftop.jpg',
        caption: 'miss home sometimes',
        likes: '312', date: 'JUNE 2019',
        comments: [
          { user:'kevin_moon', pfp:'', text:'YOU SHOULD COME VISIT' },
          { user:'jacob_moon', pfp:'', text:'miss you hee 🥺' },
          { user:'changmin__', pfp:'', text:'bro literally just come back' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I miss it too sometimes' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"@sollee__ I KNOW U DO THAT'S WHY U SHOULD COME HOME" },
        ]
      },
      {
        img: DG+'chanhee-collegestudy.jpg',
        caption: 'columbia. year one.',
        likes: '201', date: 'OCTOBER 2013',
        comments: [
          { user:'kevin_moon', pfp:'', text:'WE MADE IT 😭' },
          { user:'jacob_moon', pfp:'', text:'so proud of you hee 🥺' },
          { user:'changmin__', pfp:'', text:'king of columbia' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I am genuinely so proud of you 🥲' },
        ]
      },
    ]
  },

  // ── LEE CHAERIN (@chaerin_lee) ────────────────────────────────
  chaerin: {
    username: 'chaerin_lee', verified: false,
    name: 'Lee Chaerin',
    pfp: DG+'chaerinselfie.jpg',
    followers: '2,841', following: '412', posts: '204',
    bio: 'new york\n1999',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'chaerin-fluffydesignerjacketsunglasses.jpg',
        caption: '',
        likes: '312', date: 'OCTOBER 2021',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'my sister 😭' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'okay you look good' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'chaerin.' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:"@jaehyunlee__ what" },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'ICON 😭' },
        ]
      },
      {
        img: DG+'chaerin-hangover.jpg',
        caption: '',
        likes: '241', date: 'AUGUST 2021',
        comments: [
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'chaerin.' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:"@juyeonlee__ I'm fine" },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'drink some water' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'call me 😭' },
        ]
      },
      {
        img: DG+'chaerin-solar-moment.jpg',
        caption: '',
        likes: '271', date: 'AUGUST 2021',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'this is my favorite photo' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:"@sollee__ mine too 🥲" },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'you two 😭' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'❤' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'my girls 🥲' },
        ]
      },
      {
        img: DG+'juyeon-chaerin.jpg',
        caption: '',
        likes: '188', date: 'JULY 2021',
        comments: [
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'delete' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:"@juyeonlee__ absolutely not" },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I love you two 😭' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'what were you making that face for' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:"@jaehyunlee__ mind your business jae" },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'a pair 😭' },
        ]
      },
      {
        img: DG+'chaerin-amusementpark.jpg',
        caption: 'I will never legally confirm or deny how we got in',
        likes: '204', date: 'JULY 2021',
        comments: [
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'chaerin this is going to get us arrested' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:"@juyeonlee__ it'll be fine" },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:"it was fine. we're fine." },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'🤐' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'SOLAR. EXPLAIN.' },
        ]
      },
      {
        img: DG+'chaerin-shopping.jpg',
        caption: 'therapeutic',
        likes: '122', date: '2021',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'how many bags is that' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'@sollee__ a healthy amount' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'chaerin...' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:"@juyeonlee__ don't" },
        ]
      },
      {
        img: DG+'chaerin-shoppingcart.jpg',
        caption: '',
        likes: '98', date: '2021',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'who pushed you 😭' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'I did' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'this is a lawsuit waiting to happen' },
        ]
      },
      {
        img: DG+'chaerin-leesiblingsfunnyselfie.jpg',
        caption: '',
        likes: '144', date: 'MARCH 2021',
        comments: [
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'the three of us 🥲' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'good photo' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'LEE SIBLINGS 😭' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'MY BABIES 😭😭' },
        ]
      },
      {
        img: DG+'chaerin-photoatparty.jpg',
        caption: '',
        likes: '61', date: '2018',
        comments: [
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'cute 🥺' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'be safe chae' },
        ]
      },
      {
        img: DG+'chaerin-atcolumbia.jpg',
        caption: '',
        likes: '48', date: '2018',
        comments: [
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'my sister at columbia 😭' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'proud of you' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'CHAERIN 😭😭' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'she really did it 🥹' },
        ]
      },
      {
        img: DG+'chaerin-party.jpg',
        caption: '',
        likes: '38', date: '2017',
        comments: [
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'did mom say you could go to this' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:"@juyeonlee__ don't worry about it" },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:"I'm picking you up at midnight" },
        ]
      },
      {
        img: DG+'chaerin-solarandsunwoo-2012.jpg',
        caption: '',
        likes: '22', date: '2012',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'WE WERE SO YOUNG 😭' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:"@sollee__ babies" },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'the throwback 😭' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'miss this era' },
        ]
      },
      {
        img: DG+'chaerin-sunwoosmotorcycle.jpg',
        caption: "don't tell my parents",
        likes: '14', date: '2011',
        comments: [
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'dad is going to lose it' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'@jaehyunlee__ mind ur business' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'CHAERIN WHAT ARE YOU DOING' },
        ]
      },
      {
        img: DG+'chaerin-babychaerin-babyjuyeon.jpg',
        caption: '',
        likes: '8', date: '2011',
        comments: [
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'chaerin delete this RIGHT NOW' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:"@juyeonlee__ never 🥰" },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'😭😭' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I AM GOING TO CRY' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'BABY CHAERIN AND BABY JUYEON 😭😭😭' },
        ]
      },
    ]
  },

  // ── KIM SUNWOO (@ksw__) ──────────────────────────────────────
  sunwoo: {
    username: 'ksw__', verified: false,
    name: 'Kim Sunwoo',
    pfp: DG+'sunwoopfp.jpg',
    followers: '892', following: '14', posts: '5',
    bio: 'new york',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'sunwoo-nyc.jpg',
        caption: '',
        likes: '201', date: '2021',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'bro who took this 😭' },
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:"I did. he didn't know." },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'saving this immediately' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'delete this' },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:"@hyunjoon_k we'll talk." },
        ]
      },
      {
        img: DG+'sunwoo-moneyandguns.jpg',
        caption: '',
        likes: '163', date: '2021',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'no caption needed ig 🙄' },
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'facts' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'the audacity' },
        ]
      },
      {
        img: DG+'sunwoo-motorcycle.jpg',
        caption: '',
        likes: '312', date: '2020',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'LETS GOOOO 🔥' },
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'she misses you bro' },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:'@hyunjoon_k delete your account' },
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'@ksw__ no ❤' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I have never seen this in my life' },
        ]
      },
      {
        img: DG+'sunwoo-blurry.jpg',
        caption: '',
        likes: '89', date: '2019',
        comments: [
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'who took this 😭' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'the jacket. iconic.' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"first post in god knows how long and it's blurry" },
        ]
      },
      {
        img: DG+'sunwooandsolar-motorcycle.jpg',
        caption: '',
        likes: '74', date: '2012',
        comments: [
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'WE WERE SO YOUNG 😭😭' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'throwback 🥲' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I remember this day' },
        ]
      },
    ]
  },

  // ── ERIC SIM (@eric_sim) ──────────────────────────────────────
  eric: {
    username: 'eric_sim', verified: false,
    name: 'Eric',
    pfp: DG+'ericpfp.jpg',
    followers: '892', following: '1,204', posts: '341',
    bio: 'new york\nliving life',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'sunwoo-with-food.jpg',
        caption: 'he eats food like a normal person sometimes. thought you should know.',
        likes: '501', date: '2021',
        comments: [
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'💀💀💀' },
          { user:'sangyeon__', pfp:'', text:'Eric you have a death wish' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I needed this for my collection thank you' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'Eric run' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:"@sollee__ he doesn't even know how to use instagram" },
        ]
      },
      {
        img: DG+'eric-sunwoo.jpg',
        caption: 'took me three years but I got him',
        likes: '412', date: '2021',
        comments: [
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:"LMAOOO HES GONNA KILL YOU" },
          { user:'sangyeon__', pfp:'', text:'Eric this is your bravest act' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I have the same photo. great minds.' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'delete this before he sees it' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:"@sollee__ absolutely not" },
        ]
      },
      {
        img: DG+'eric-party.jpg',
        caption: '',
        likes: '244', date: '2021',
        comments: [
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'this was a night 😭' },
          { user:'sangyeon__', pfp:'', text:'I went home early and I stand by that decision' },
        ]
      },
      {
        img: DG+'eric-hyunjae-smoking.jpg',
        caption: '',
        likes: '312', date: '2021',
        comments: [
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'not me being left out' },
          { user:'sangyeon__', pfp:'', text:'you guys look terrible' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'@sangyeon__ thank u' },
        ]
      },
      {
        img: DG+'eric-wheelie.jpg',
        caption: '',
        likes: '389', date: '2020',
        comments: [
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'LETS GOOO 🔥' },
          { user:'sangyeon__', pfp:'', text:'please wear a helmet' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:"@sangyeon__ helmets are for people who are scared" },
          { user:'sangyeon__', pfp:'', text:"@eric_sim you SHOULD be scared" },
        ]
      },
      {
        img: DG+'eric-goofygaspump.jpg',
        caption: '',
        likes: '178', date: '2020',
        comments: [
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:"I was THERE and I still dont know what you were doing" },
          { user:'sangyeon__', pfp:'', text:'Eric.' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:"@sangyeon__ don't Eric me" },
        ]
      },
      {
        img: DG+'eric-donuts.jpg',
        caption: 'breakfast',
        likes: '203', date: '2020',
        comments: [
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'bro 😭' },
          { user:'sangyeon__', pfp:'', text:'that is not breakfast' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:"@sangyeon__ it literally is tho" },
        ]
      },
    ]
  },

  // ── HYUNJOON KIM (@hyunjoon_k) ───────────────────────────────
  hyunjoon: {
    username: 'hyunjoon_k', verified: false,
    name: 'Hyunjoon',
    pfp: DG+'hyunjoonpfp.jpg',
    followers: '1,341', following: '892', posts: '210',
    bio: 'new york',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'hyunjoon-handsomeleader.jpg',
        caption: 'the boss is out tonight',
        likes: '883', date: '2021',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'FINALLY HES WEARING SOMETHING NICE' },
          { user:'sangyeon__', pfp:'', text:'he looks like he runs a country' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I am saving this photo' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'delete this' },
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:"@sollee__ no ❤" },
        ]
      },
      {
        img: DG+'hyunjoon-thirsttrap.jpg',
        caption: '',
        likes: '802', date: '2021',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'BRO 😭😭' },
          { user:'sangyeon__', pfp:'', text:'alright' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'@sangyeon__ THATS IT? ALRIGHT???' },
        ]
      },
      {
        img: DG+'hyunjoon-partyshot.jpg',
        caption: '',
        likes: '634', date: '2021',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'this was the best night of my life' },
          { user:'sangyeon__', pfp:'', text:'you say that every time' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:"@sangyeon__ because it keeps being true" },
        ]
      },
      {
        img: DG+'hyunjoon-dragrace.jpg',
        caption: '',
        likes: '721', date: '2021',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'LETS GOOOOO 🔥🔥🔥' },
          { user:'sangyeon__', pfp:'', text:'I genuinely fear for all of you' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'😭😭' },
        ]
      },
      {
        img: DG+'hyunjoon-drugstash.jpg',
        caption: '',
        likes: '290', date: '2020',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'bro is not subtle at all 😭' },
          { user:'sangyeon__', pfp:'', text:'Hyunjoon.' },
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:"@sangyeon__ it's fine" },
        ]
      },
      {
        img: DG+'hyunjoon-alcohol.jpg',
        caption: 'the essentials',
        likes: '490', date: '2020',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'📞 calling me?' },
          { user:'sangyeon__', pfp:'', text:'Hyunjoon...' },
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:"@sangyeon__ don't start" },
        ]
      },
      {
        img: DG+'hyunjoon-solandwooparty.jpg',
        caption: '2011 🕰️',
        likes: '1,002', date: '2011',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'THE THROWBACK 😭😭😭' },
          { user:'sangyeon__', pfp:'', text:'they were so young' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'HYUNJOON WHAT IS THIS' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'Hyunjoon I will find you' },
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:"@sollee__ worth it ❤" },
        ]
      },
    ]
  },

};

// ── SOCIAL STATE ──────────────────────────────────────────────────
let currentSocialProfile = 'soomi';
let socialDualityTab = 'solar';

const SIDEBAR_KEYS = [
  'soomi',
  'solar',
  'jinhwan', 'jinhwan_priv',
  'jungkook', 'jungkook_priv',
  'jimin', 'jimin_priv',
  'junhoe', 'junhoe_priv',
  'jaehyun_lee',
  'juyeon_lee',
  'chanhee',
  'sunwoo',
  'chaerin',
  'eric',
  'hyunjoon',
];

// ── LOAD PROFILE ──────────────────────────────────────────────────
function loadSocialProfile(key) {
  currentSocialProfile = key;
  if (key !== 'solar') socialDualityTab = 'solar';

  document.querySelectorAll('.s-item').forEach((el, i) => {
    el.classList.toggle('s-active', SIDEBAR_KEYS[i] === key);
  });

  const p = SOCIAL_PROFILES[key];
  const feed = document.getElementById('social-feed');

  let html = `<div class="sph">
    <img class="sph-avatar" src="${p.pfp}" onerror="this.style.background='#333'"/>
    <div class="sph-info">
      <div class="sph-username">
        ${p.username}
        ${p.verified ? '<span class="sph-verified">✔</span>' : ''}
        <button class="sph-follow-btn ${p.locked ? 'private' : ''}">${p.locked ? 'Request' : 'Follow'}</button>
      </div>
      <div class="sph-stats">
        <div class="sph-stat"><strong>${p.posts}</strong><span>posts</span></div>
        <div class="sph-stat"><strong>${p.followers}</strong><span>followers</span></div>
        <div class="sph-stat"><strong>${p.following}</strong><span>following</span></div>
      </div>
      <div class="sph-name">${p.name}</div>
      <div class="sph-bio">${p.bio}</div>
      ${p.link ? `<div class="sph-link">${p.link}</div>` : ''}
      ${p.locked ? `<div class="sph-private-note">🔒 This account is private.</div>` : ''}
    </div>
  </div>`;

  if (p.highlights && p.highlights.length) {
    html += `<div class="sph-highlights">`;
    p.highlights.forEach(h => {
      html += `<div class="hl-item">
        <div class="hl-ring"><div class="hl-inner"><img src="${h.img}" onerror="this.style.background='#555'"/></div></div>
        <span class="hl-label">${h.label}</span>
      </div>`;
    });
    html += `</div>`;
  }

  if (p.hasDuality) {
    html += `<div class="social-duality-bar">
      <div class="social-duality-tab ${socialDualityTab==='solar'?'active':''}" onclick="switchSocialTab('solar')">◻ Solar Lee</div>
      <div class="social-duality-tab ${socialDualityTab==='soomi'?'active':''}" onclick="switchSocialTab('soomi')">⬛ Kim Soomi</div>
    </div>`;
  }

  if (p.locked) {
    html += `<div class="social-locked">
      <div class="lock-icon">🔒</div>
      <h3>This account is private.</h3>
      <p>Follow ${p.username} to see their posts.</p>
    </div>`;
  } else {
    const posts = (key === 'solar' && socialDualityTab === 'soomi')
      ? SOCIAL_PROFILES.soomi.posts_data
      : p.posts_data;
    const resolvedKey = (key === 'solar' && socialDualityTab === 'soomi') ? 'soomi' : key;

    html += `<div class="social-post-grid">`;
    posts.forEach((post, i) => {
      html += `<div class="social-grid-item" onclick="openSocialModal(${i},'${resolvedKey}')">
        <img src="${post.img}" onerror="this.style.background='#1a1a1a'"/>
      </div>`;
    });
    html += `</div>`;
  }

  feed.innerHTML = html;
}

function switchSocialTab(tab) {
  socialDualityTab = tab;
  loadSocialProfile('solar');
}

// ── POST MODAL ────────────────────────────────────────────────────
function openSocialModal(index, profileKey) {
  const p = SOCIAL_PROFILES[profileKey];
  const post = p.posts_data[index];

  document.getElementById('socialModalImg').src = post.img;
  document.getElementById('socialModalPfp').src = p.pfp;
  document.getElementById('socialModalUsername').textContent = p.username;
  document.getElementById('socialModalLikes').textContent = post.likes + ' likes';
  document.getElementById('socialModalDate').textContent = post.date;

  let html = `<div class="social-modal-caption"><strong>${p.username}</strong> ${post.caption}</div>`;
  (post.comments || []).forEach(c => {
    html += `<div class="social-comment">
      <img src="${c.pfp||''}" onerror="this.style.background='#2a2a2a'"/>
      <div class="social-comment-body">
        <strong>${c.user}</strong> ${c.text}
        ${c.time ? `<div class="social-comment-time">${c.time}</div>` : ''}
      </div>
    </div>`;
  });

  document.getElementById('socialModalComments').innerHTML = html;
  document.getElementById('socialModalBg').classList.add('open');
}

document.getElementById('socialModalClose').addEventListener('click', () => {
  document.getElementById('socialModalBg').classList.remove('open');
});
document.getElementById('socialModalBg').addEventListener('click', function(e) {
  if (e.target === this) this.classList.remove('open');
});

// ── AUTO-LOAD ON FIRST VISIT ──────────────────────────────────────
(function() {
  const orig = window.showSection;
  window.showSection = function(id) {
    orig(id);
    if (id === 'social' && !document.getElementById('social-feed').innerHTML.trim()) {
      loadSocialProfile('soomi');
    }
  };
})();

// ═══════════════════════════════════════════════════════════
// LEE INDUSTRIES
// ═══════════════════════════════════════════════════════════

function leeSection(id) {
  document.querySelectorAll('#site-frame-lee .lee-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#site-frame-lee .lee-nav a').forEach(a => a.classList.remove('active'));
  const panel = document.getElementById('lee-panel-' + id);
  if (panel) panel.classList.add('active');
  const link = document.querySelector(`#site-frame-lee .lee-nav a[data-lee="${id}"]`);
  if (link) link.classList.add('active');
  // Flag press room visit for Kim Company inter-site tracking
  if (id === 'press') {
    try { sessionStorage.setItem('lee_sec_visited', '1'); } catch(e) {}
  }
}

function toggleLeePress(id) {
  const item = document.getElementById(id);
  if (!item) return;
  item.classList.toggle('open');
}

let _leeStockInit = false;
let leePrice = 184.50;

function initLeeStock() {
  if (_leeStockInit) return;
  _leeStockInit = true;
  const priceEl  = document.getElementById('lee-stock-price');
  const changeEl = document.getElementById('lee-stock-change');
  const notice   = document.getElementById('lee-buyback-notice');
  if (!priceEl) return;

  // Trigger a dip after 12 seconds to show buyback
  setTimeout(() => {
    leePrice -= 3.40;
    if (priceEl) priceEl.textContent = '$' + leePrice.toFixed(2);
    if (changeEl) { changeEl.textContent = '▼ -3.40 (-1.84%)'; changeEl.style.color = '#cc4444'; }
    if (notice) { notice.style.display = 'block'; setTimeout(() => { notice.style.display = 'none'; }, 7000); }
  }, 12000);

  setInterval(() => {
    const delta = (Math.random() - 0.508) * 0.9;
    leePrice = Math.max(162, Math.min(218, leePrice + delta));
    if (priceEl) priceEl.textContent = '$' + leePrice.toFixed(2);
    const sign = delta >= 0 ? '▲ +' : '▼ ';
    if (changeEl) {
      changeEl.textContent = sign + Math.abs(delta).toFixed(2) + ' (' + (delta >= 0 ? '+' : '') + ((delta / leePrice) * 100).toFixed(2) + '%)';
      changeEl.style.color = delta >= 0 ? '#4caf7d' : '#cc4444';
    }
    if (delta < -0.7 && notice) {
      notice.style.display = 'block';
      setTimeout(() => { notice.style.display = 'none'; }, 6000);
    }
  }, 3200);
}

let _leeJuyeonBuf = '';
function checkLeeJuyeon(e) {
  _leeJuyeonBuf += (e.key || '').toLowerCase();
  if (_leeJuyeonBuf.length > 12) _leeJuyeonBuf = _leeJuyeonBuf.slice(-12);
  if (_leeJuyeonBuf.includes('juyeon')) {
    const msg = document.getElementById('lee-juyeon-message');
    if (msg) { msg.style.display = 'block'; _leeJuyeonBuf = ''; }
  }
  if (_leeJuyeonBuf.includes('solar')) {
    _leeJuyeonBuf = '';
    showLeeRepatriation();
  }
}

// ── Pulse: Court order banner (Missing Heiress article) ────
function showPulseCourtOrder() {
  const btnWrap = document.getElementById('redact-5-btn-wrap');
  const order   = document.getElementById('pulse-court-order');
  if (btnWrap) btnWrap.style.display = 'none';
  if (order)   order.classList.remove('hidden');
}

// ── YG Entertainment: Internal portal ──────────────────────
function openYGPortal() {
  const portal = document.getElementById('yg-portal');
  if (portal) {
    portal.classList.remove('hidden');
    portal.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
function unlockYGPortal() {
  const input   = document.getElementById('yg-portal-input');
  const error   = document.getElementById('yg-portal-error');
  const lock    = document.getElementById('yg-portal-lock');
  const content = document.getElementById('yg-portal-content');
  if (!input) return;
  if (input.value.toUpperCase() === 'YG_SOLOIST') {
    lock.style.display = 'none';
    content.classList.remove('hidden');
    error.textContent = '';
  } else {
    error.textContent = '— ACCESS DENIED —';
    input.value = '';
    input.focus();
  }
}
function showYGPaymentRecord() {
  const rec = document.getElementById('yg-payment-record');
  const btn = document.getElementById('yg-sig-btn');
  if (rec) rec.classList.remove('hidden');
  if (btn) btn.style.pointerEvents = 'none';
}

// ── Lee Industries: Repatriation Protocol ──────────────────
function showLeeRepatriation() {
  const overlay = document.getElementById('lee-repatriate-overlay');
  if (overlay) overlay.classList.remove('hidden');
}

// ── Lee Industries: T&C modal ──────────────────────────────
function openLeeTnC() {
  const el = document.getElementById('lee-tnc-overlay');
  if (el) el.classList.remove('hidden');
}
function closeLeeTnC() {
  const el = document.getElementById('lee-tnc-overlay');
  if (el) el.classList.add('hidden');
}

// ── Lee Industries: Jaehyun three-tap easter egg ───────────
let _leeTapTimes = [];
function leeSubmitTap() {
  const now = Date.now();
  // Reset sequence if last tap was more than 3 seconds ago
  if (_leeTapTimes.length > 0 && now - _leeTapTimes[_leeTapTimes.length - 1] > 3000) {
    _leeTapTimes = [];
  }
  _leeTapTimes.push(now);
  if (_leeTapTimes.length === 3) {
    const gap1 = _leeTapTimes[1] - _leeTapTimes[0];
    const gap2 = _leeTapTimes[2] - _leeTapTimes[1];
    // Rhythmic: each gap between 350ms and 2500ms
    if (gap1 >= 350 && gap1 <= 2500 && gap2 >= 350 && gap2 <= 2500) {
      _leeTapTimes = [];
      const overlay = document.getElementById('lee-jaehyun-overlay');
      if (overlay) {
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.add('hidden'), 9000);
      }
    } else {
      _leeTapTimes = [now];
    }
  }
}

function openChaerin() {
  const overlay = document.getElementById('chaerin-overlay');
  if (overlay) overlay.classList.remove('hidden');
}

function closeChaerin() {
  const overlay = document.getElementById('chaerin-overlay');
  if (overlay) overlay.classList.add('hidden');
}

// ═══════════════════════════════════════════════════════════
// KIM COMPANY
// ═══════════════════════════════════════════════════════════

function kimSection(id) {
  document.querySelectorAll('#site-frame-kimco .kim-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#site-frame-kimco .kim-nav a').forEach(a => a.classList.remove('active'));
  const panel = document.getElementById('kim-panel-' + id);
  if (panel) panel.classList.add('active');
  const link = document.querySelector(`#site-frame-kimco .kim-nav a[data-kim="${id}"]`);
  if (link) link.classList.add('active');
}

function checkKimTracking() {
  try {
    if (sessionStorage.getItem('lee_sec_visited')) {
      const warn = document.getElementById('kim-tracking-warn');
      if (warn) {
        warn.style.display = 'block';
        warn.style.animation = 'kim-blink 2s ease';
      }
    }
  } catch(e) {}
}

let _kimBrooklynActive = false;
let _kimSolarBuf = '';

function kimBrooklynEnter() {
  _kimBrooklynActive = true;
  _kimSolarBuf = '';
  document.addEventListener('keydown', _kimSolarKey);
}

function kimBrooklynLeave() {
  _kimBrooklynActive = false;
  document.removeEventListener('keydown', _kimSolarKey);
  const el = document.getElementById('kim-solar-typed');
  if (el) el.textContent = '';
}

function _kimSolarKey(e) {
  if (!_kimBrooklynActive) return;
  if (e.key.length !== 1) return;
  _kimSolarBuf += e.key.toLowerCase();
  if (_kimSolarBuf.length > 7) _kimSolarBuf = _kimSolarBuf.slice(-7);
  const el = document.getElementById('kim-solar-typed');
  if (el) el.textContent = '> ' + _kimSolarBuf.toUpperCase() + '_';
  if (_kimSolarBuf.includes('solar')) {
    _kimBrooklynActive = false;
    document.removeEventListener('keydown', _kimSolarKey);
    setTimeout(openKimSolarFiles, 300);
  }
}

function openKimSolarFiles() {
  const overlay = document.getElementById('kim-solar-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
    startIncheonCountdown();
  }
}

function closeKimSolarFiles() {
  const overlay = document.getElementById('kim-solar-overlay');
  if (overlay) overlay.classList.add('hidden');
}

function startIncheonCountdown() {
  const display = document.getElementById('kim-countdown-display');
  const sub = document.getElementById('kim-countdown-sub');
  if (!display) return;
  const target = new Date('2021-11-15T03:00:00Z');
  const now = new Date();
  if (now > target) {
    const elapsed = Math.floor((now - target) / 86400000);
    display.textContent = 'ELAPSED';
    display.classList.add('elapsed');
    if (sub) sub.textContent = `TARGET DATE PASSED — ${elapsed} DAYS AGO — PHASE 2 STATUS: [REDACTED]`;
  } else {
    const tick = () => {
      const r = target - new Date();
      if (r <= 0) { display.textContent = 'ELAPSED'; return; }
      const d = Math.floor(r / 86400000);
      const h = Math.floor((r % 86400000) / 3600000);
      const m = Math.floor((r % 3600000) / 60000);
      const s = Math.floor((r % 60000) / 1000);
      display.textContent = `${String(d).padStart(2,'0')}:${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      setTimeout(tick, 1000);
    };
    tick();
  }
}

function toggleKimAudio(blockId) {
  const block = document.getElementById(blockId);
  if (!block) return;
  block.classList.toggle('playing');
  const btn = block.querySelector('.kim-audio-play');
  if (btn) btn.textContent = block.classList.contains('playing') ? '⏸' : '▶';
  const audio = block.querySelector('audio');
  if (audio && audio.src) {
    if (block.classList.contains('playing')) audio.play().catch(() => {});
    else audio.pause();
  }
}
