// ─── DELICATE WORLD — APP ────────────────────────────────────────────────────

// ── Navigation ───────────────────────────────────────────────────────────────

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('#nav .nav-links a').forEach(a => a.classList.remove('active'));
  const sec = document.getElementById('section-' + id);
  if (sec) sec.classList.add('active');
  const link = document.querySelector(`#nav .nav-links a[data-section="${id}"]`);
  if (link) link.classList.add('active');
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
      <div class="group-label">Group</div>
      <div class="group-title">${group.label}</div>
      <div class="group-sub">${group.sub}</div>
      <div class="bubble-grid" id="group-${group.id}"></div>
    `;
    inner.appendChild(block);

    const grid = block.querySelector('.bubble-grid');
    group.characters.forEach(char => {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.innerHTML = `
        ${char.pfp
          ? `<img class="bubble-img" src="${char.pfp}" alt="${char.name}" style="border-color:${char.accent}44">`
          : `<div class="bubble-placeholder">👤</div>`}
        <div class="bubble-name">${char.name}</div>
        <div class="bubble-role" style="color:${char.accent}">${char.role}</div>
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

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#nav .nav-links a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      showSection(a.dataset.section);
    });
  });

  document.querySelectorAll('.home-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
  });

  initDuality();
  buildCharacters();
  buildRelationships();
  buildTimeline();

  showSection('home');
});

// ── SOCIAL DATA ───────────────────────────────────────────────────

const SI  = 'images/solars-instagram/';
const DG  = 'images/delicate-gram/';
const SW  = 'images/Sunwoo/';

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
    followers: '12.4M', following: '312', posts: '284',
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
        img: SI+'solar-painisbeautystage.jpg',
        caption: 'pain is beauty is out ✦ thank you neverlands for everything. always. 🖤',
        likes: '2,341,009', date: 'JUNE 4, 2021',
        comments: [
          { user:'neverlands_official', pfp:'', text:'SOOMI WE ARE SO PROUD OF YOU 🖤🖤🖤', time:'2h' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'so proud of you.', time:'2h' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'greatest artist alive 🙏', time:'3h' },
          { user:'ikon_donghyuk', pfp:DG+'donghyukpfp.jpg', text:'our soomi!!! 🥲', time:'3h' },
          { user:'soomi_neverland1', pfp:'', text:"I'm literally crying this album changed my life", time:'4h' },
        ]
      },
      {
        img: SI+'soomi-onstage.jpg',
        caption: 'neverlands. you carry me every single time. 🌙',
        likes: '1,892,443', date: 'MAY 2021',
        comments: [
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'she ate and left no crumbs 🔥', time:'1h' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'YOOOO THE STAGE PRESENCE 😭', time:'2h' },
          { user:'neverlands_official', pfp:'', text:'SOOMI IS EATING EVERYONE ALIVE', time:'2h' },
          { user:'soomi_neverland2', pfp:'', text:'I have watched this fancam 40 times', time:'3h' },
        ]
      },
      {
        img: SI+'soomi-withanaward.jpg',
        caption: 'this is for you, neverlands. always you.',
        likes: '3,201,887', date: 'DECEMBER 2020',
        comments: [
          { user:'neverlands_official', pfp:'', text:'YOU DESERVE EVERY SINGLE ONE 🏆🏆🏆', time:'30m' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'deserved.', time:'1h' },
          { user:'iKON_official', pfp:'', text:'we love you soomi!! 🖤', time:'1h' },
          { user:'soomi_neverland3', pfp:'', text:'the best artist in the industry no debate', time:'2h' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'RIGHTFULLY HERS', time:'2h' },
        ]
      },
      {
        img: SI+'soomi-chanelmodel.jpg',
        caption: '✦',
        likes: '4,100,321', date: 'OCTOBER 2020',
        comments: [
          { user:'neverlands_official', pfp:'', text:'SOOMI FOR CHANEL I AM NOT OKAY', time:'15m' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'stunning.', time:'30m' },
          { user:'soomi_neverland1', pfp:'', text:'THE MOST BEAUTIFUL WOMAN TO EVER EXIST', time:'1h' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'bro she really ate 😭😭', time:'1h' },
        ]
      },
    ]
  },

  // ── SOLAR LEE (@sollee__) ─────────────────────────────────────
  solar: {
    username: 'sollee__', verified: false,
    name: 'solar',
    pfp: DG+'solarpfp.jpg',
    followers: '47', following: '61', posts: '29',
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
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I am going to pass out', time:'' },
          { user:'kevin_moon', pfp:'', text:'I KNEW IT I KNEW IT', time:'' },
          { user:'jacob_moon', pfp:'', text:'😊💛', time:'' },
          { user:'changmin__', pfp:'', text:'the way I screamed', time:'' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'finally 🙄', time:'' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🥹', time:'' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'🖤', time:'' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'', time:'' },
          { user:'ikon_donghyuk', pfp:DG+'donghyukpfp.jpg', text:'WE LOVE JUNGKOOK-HYUNG 🥳', time:'' },
        ]
      },
      {
        img: SI+'solar-bdayparty-136.jpg',
        caption: '26 🎂 he really did all this 🥲',
        likes: '44', date: 'NOVEMBER 2021',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"THAT'S MY BEST FRIEND RIGHT THERE 😭😭😭", time:'' },
          { user:'kevin_moon', pfp:'', text:'HAPPY BIRTHDAY SOL WE LOVE YOUUUU 🎉', time:'' },
          { user:'jacob_moon', pfp:'', text:'happy birthday sol!! 🥳🥳', time:'' },
          { user:'changmin__', pfp:'', text:'our Sol is 26!!! 🥲🥲', time:'' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'happy birthday. 🖤', time:'' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'happy birthday noona 🎂', time:'' },
          { user:'ikon_donghyuk', pfp:DG+'donghyukpfp.jpg', text:'happy birthday soomi-noona!!! 🥳', time:'' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'happy birthday mi 🥰', time:'' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'happy birthday sol 🎂🖤', time:'' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'happy birthday Sol!! 🎉', time:'' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'happy birthday little sister 🥂', time:'' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'THATS MY SISTER!!!!! 😭😭', time:'' },
        ]
      },
      {
        img: SI+'solar-jungkook2021.jpg',
        caption: '',
        likes: '41', date: 'OCTOBER 2021',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'NO WAY. NO ABSOLUTE WAY.', time:'' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'you owe me the biggest explanation of your life', time:'' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'', time:'' },
          { user:'kevin_moon', pfp:'', text:'WAIT A MINUTE', time:'' },
          { user:'jacob_moon', pfp:'', text:'😯', time:'' },
          { user:'changmin__', pfp:'', text:'is nobody going to say anything???', time:'' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'👁👄👁', time:'' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🙂', time:'' },
        ]
      },
      {
        img: SI+'solar-jungkook-2021.jpg',
        caption: '',
        likes: '38', date: 'SEPTEMBER 2021',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'solar.', time:'' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'SOLAR.', time:'' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🥹🥹', time:'' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'not me third wheeling this feed', time:'' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'🖤', time:'' },
        ]
      },
      {
        img: SI+'solar-jimin-hoseok.jpg',
        caption: '',
        likes: '33', date: 'AUGUST 2021',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I want to be there 😭', time:'' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'and I was not invited??', time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@iKON_june you were busy', time:'' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'best night 🧡', time:'' },
          { user:'bts_hobi', pfp:DG+'hobipfp.jpg', text:'MI 😭🧡', time:'' },
        ]
      },
      {
        img: SI+'solar-amusementpark-117.jpg',
        caption: 'last night in new york. kinda.',
        likes: '19', date: 'JULY 2021',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'WHO IS THAT IN THE BACKGROUND', time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'nobody', time:'' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'Solar Kim I swear to GOD', time:'' },
          { user:'kevin_moon', pfp:'', text:'looks fun 😭 miss you sol', time:'' },
          { user:'jacob_moon', pfp:'', text:'your siblings are so cute 🥲', time:'' },
        ]
      },
      {
        img: SI+'solar-drinkinginny.jpg',
        caption: '',
        likes: '9', date: 'JULY 2021',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"I'm going to need you to call me back", time:'' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'right now', time:'' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'solar', time:'' },
          { user:'jacob_moon', pfp:'', text:'please be safe sol 🙏', time:'' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'pick up your phone', time:'' },
        ]
      },
      // ── 2020 ──────────────────────────────────────────────────
      {
        img: SI+'solar-inthestudio.jpg',
        caption: 'in here til god knows when',
        likes: '34', date: 'JANUARY 2020',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'come HOME', time:'' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'eat something', time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'stop showing up to my studio', time:'' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:"I didn't say anything about coming there", time:'' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'👀👀👀', time:'' },
        ]
      },
      // ── 2019 ──────────────────────────────────────────────────
      {
        img: SI+'solar-funnyface.jpg',
        caption: '',
        likes: '28', date: 'NOVEMBER 2019',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'you are an actual menace and I say that with love', time:'' },
          { user:'kevin_moon', pfp:'', text:'LMAOOO SOL 😭', time:'' },
          { user:'jacob_moon', pfp:'', text:'I love her so much 😭', time:'' },
          { user:'changmin__', pfp:'', text:'she really said send post', time:'' },
        ]
      },
      {
        img: SI+'solar-athomeselfie.jpg',
        caption: 'bored out of my mind',
        likes: '31', date: 'SEPTEMBER 2019',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"answer the door I'm outside", time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'chanhee how did you know where I live', time:'' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I know everything', time:'' },
          { user:'jacob_moon', pfp:'', text:'call me sometime sol 😔', time:'' },
        ]
      },
      {
        img: SI+'solar-selfiewalcohol.jpg',
        caption: 'lol',
        likes: '22', date: 'FEBRUARY 2019',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'answer your phone', time:'' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"solar I'm calling you right now", time:'' },
          { user:'jacob_moon', pfp:'', text:'sol please be safe 🙏', time:'' },
        ]
      },
      // ── 2018 ──────────────────────────────────────────────────
      {
        img: SI+'solar-jungkook-2018.jpg',
        caption: '',
        likes: '11', date: 'MARCH 2018',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'😭💛', time:'' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'🖤', time:'' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'you two 🥲', time:'' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'pick up your phone', time:'' },
        ]
      },
      {
        img: SI+'solar-jkfrom2018.jpg',
        caption: '',
        likes: '6', date: 'FEBRUARY 2018',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'miss you 😔', time:'' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'sol.', time:'' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'take care of yourself sol', time:'' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'🖤', time:'' },
          { user:'RM_bts', pfp:DG+'namjoonpfp.jpg', text:'thinking of you', time:'' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'pick up your phone', time:'' },
        ]
      },
      // ── 2017 ──────────────────────────────────────────────────
      {
        img: SI+'solar-jimin-2017.jpg',
        caption: '',
        likes: '14', date: 'OCTOBER 2017',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🧡', time:'' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'😐', time:'' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'my kids 🥲', time:'' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'cute', time:'' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'mi why do you have a whole life in korea that I am not a part of', time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@chanhee you're always welcome to visit 😌", time:'' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'@sollee__ I literally said I would and you said it was a bad time every single time', time:'' },
        ]
      },
      {
        img: SI+'solar-taehyung-2017.jpg',
        caption: '',
        likes: '12', date: 'JULY 2017',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'when did THIS happen 😭', time:'' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'😐😐😐', time:'' },
          { user:'bts_taetae', pfp:DG+'taepfp.jpg', text:'🐯💛', time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@jk_95 oh relax', time:'' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:"@sollee__ I'm very relaxed", time:'' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'jungkook... 😂', time:'' },
        ]
      },
      // ── 2016 ──────────────────────────────────────────────────
      {
        img: SI+'solar-jimin-2016.jpg',
        caption: 'kcon nyc 🌊',
        likes: '9', date: 'JULY 2016',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'the beach was your idea and you complained the whole time 😭', time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@j.min_bts the sand was EVERYWHERE', time:'' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'you two look so happy 🥲', time:'' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'I should have been invited to this', time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@jk_95 you literally were there for a week before this 😭', time:'' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:"@sollee__ and yet somehow I wasn't there for THIS", time:'' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I also was not invited. to new york. my own city.', time:'' },
        ]
      },
      // ── 2015 ──────────────────────────────────────────────────
      {
        img: SI+'solar-yoongi-jungkook-2015.jpg',
        caption: '',
        likes: '7', date: 'DECEMBER 2015',
        comments: [
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'delete this', time:'' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'no', time:'' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:"I look like I'm being held against my will", time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'you were not. you hugged us both. I have a witness.', time:'' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'confirmed', time:'' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'I hate you both', time:'' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:"the gummy smile doesn't lie yoongi 😂", time:'' },
        ]
      },
      {
        img: SI+'solar-jungkook-2014.jpg',
        caption: '',
        likes: '5', date: 'JUNE 2015',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'what happened 😭', time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'practice room floor happened', time:'' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'I was NOT sleeping I was resting my eyes', time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@jk_95 you were snoring', time:'' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'someone get this kid a bed 😭', time:'' },
        ]
      },
      // ── 2014 ──────────────────────────────────────────────────
      {
        img: SI+'solar-jungkook-2013.jpg',
        caption: '',
        likes: '4', date: 'NOVEMBER 2014',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'YOU TWO 😭😭', time:'' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'this is from a year ago why are you posting this now', time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@jk_95 I just found it on my camera roll leave me alone', time:'' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'the cutest trainee duo ever 🥲', time:'' },
        ]
      },
      // ── 2013 ──────────────────────────────────────────────────
      {
        img: SI+'solar-newyork-photo.jpg',
        caption: '',
        likes: '3', date: 'JANUARY 2013',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'is this new york?', time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@j.min_bts yeah. from a while ago.', time:'' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'you should show me someday', time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@jk_95 someday', time:'' },
        ]
      },
      // ── 2012 ──────────────────────────────────────────────────
      {
        img: SI+'solar-chaerin-atparty.jpg',
        caption: '',
        likes: '3', date: 'DECEMBER 2012',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I cannot believe I missed this party', time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@chanhee it was a disaster you were lucky', time:'' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'a disaster you organized, to be clear', time:'' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'do not look at us we look so feral', time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@chaerin_lee we were', time:'' },
        ]
      },
      {
        img: SI+'solar-chaerin-running.jpg',
        caption: '',
        likes: '2', date: 'OCTOBER 2012',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'where are you RUNNING', time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@chanhee away', time:'' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'it was fine we were fine', time:'' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'it was not fine at all actually', time:'' },
        ]
      },
      {
        img: SI+'solar-vodka.jpg',
        caption: '',
        likes: '2', date: 'JUNE 2012',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'solar lee what is THAT', time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'juice', time:'' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'Solar', time:'' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'she put it down I watched her put it down', time:'' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"@jaehyunlee__ that is literally not better jae", time:'' },
        ]
      },
      {
        img: SI+'chaerin-solar-moment.jpg',
        caption: '',
        likes: '2', date: 'MARCH 2012',
        comments: [
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I love you two actually', time:'' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'this is the only good photo of me', time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@chaerin_lee that is not true', time:'' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:"@sollee__ it genuinely is", time:'' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'beautiful sisters', time:'' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'@jaehyunlee__ ok thanks jae', time:'' },
        ]
      },
    ]
  },

  // ── JUNGKOOK PRIVATE (@jk__real) ─────────────────────────────
  jungkook_priv: {
    username: 'jk__real', verified: false,
    name: 'jungkook',
    pfp: DG+'jkprivpfp.jpg',
    followers: '24', following: '19', posts: '15',
    bio: '🔒',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'jungkook-solar-selfies.jpg',
        caption: 'happy birthday sol. I would burn everything down for you. you know that. 🖤',
        likes: '24', date: 'NOVEMBER 2021',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🥹🥹🥹', time:'5m' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"stop it I'm going to cry", time:'10m' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I am not okay', time:'20m' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'our kook 🥲', time:'30m' },
        ]
      },
      {
        img: DG+'jungkook-solar-seoul.jpg',
        caption: '',
        likes: '21', date: 'OCTOBER 2021',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🌙', time:'1h' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'ok this is actually so cute', time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"I didn't know you took this", time:'2h' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@sollee__ I take a lot of things you don't know about", time:'2h' },
        ]
      },
      {
        img: DG+'jungkook-solar-2021.jpg',
        caption: '',
        likes: '19', date: 'AUGUST 2021',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🧡🖤', time:'30m' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"we're healing 🥲", time:'1h' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'so happy for you two 🥲', time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'🖤', time:'2h' },
        ]
      },
      {
        img: DG+'jungkook-solar-2020.jpg',
        caption: '',
        likes: '18', date: 'DECEMBER 2020',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'💛', time:'30m' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'the slow burn is OVER thank god', time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'chanhee', time:'1h' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"@sollee__ I'm just saying", time:'1h' },
        ]
      },
      {
        img: DG+'solar-bts-newyork.jpg',
        caption: 'kcon 2020. missed this.',
        likes: '22', date: 'JANUARY 2020',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'we missed you too 💛', time:'30m' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'the whole crew back together 🥲', time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I missed you all so much', time:'1h' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'this photo 🥲', time:'2h' },
        ]
      },
      {
        img: DG+'jungkook-guitar.jpg',
        caption: '',
        likes: '19', date: 'MARCH 2019',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🎸', time:'1h' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'this kid 🥲', time:'2h' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'practice', time:'2h' },
        ]
      },
      {
        img: DG+'jungkook-solar-2018.jpg',
        caption: '',
        likes: '16', date: 'JANUARY 2018',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'🥹', time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I miss this', time:'2h' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'@sollee__ me too', time:'2h' },
        ]
      },
      {
        img: DG+'jungkook-solar-2016.jpg',
        caption: 'she said yes 🖤',
        likes: '23', date: 'JULY 2016',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'MY BEST FRIENDS 😭😭😭', time:'5m' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'JUNGKOOK!!!!! 🎉🎉', time:'10m' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'finally', time:'20m' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'🖤', time:'30m' },
        ]
      },
      {
        img: DG+'jungkook-recording-2015.jpg',
        caption: '',
        likes: '8', date: 'SEPTEMBER 2015',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'get out of the studio', time:'1h' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@j.min_bts no", time:'1h' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'jungkook did you eat', time:'2h' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@bts_seokjin yes", time:'2h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'liar I was with you all day', time:'2h' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'SOLAR THANK YOU', time:'2h' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@sollee__ don't do this to me", time:'2h' },
        ]
      },
      {
        img: DG+'jungkook-2015.jpg',
        caption: '',
        likes: '7', date: 'MAY 2015',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'why do you look so smug', time:'30m' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@j.min_bts because I am", time:'30m' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'he does not he just always makes that face', time:'1h' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'that IS his face 😂', time:'1h' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'accurate', time:'2h' },
        ]
      },
      {
        img: DG+'jungkook-2014.jpg',
        caption: '',
        likes: '6', date: 'DECEMBER 2014',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'BABY KOOK 😭', time:'1h' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'little one 🥲', time:'2h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I am literally obsessed with you', time:'2h' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@sollee__ as you should be", time:'2h' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'this was like yesterday', time:'3h' },
        ]
      },
      {
        img: DG+'jungkook-taehyung-2013.jpg',
        caption: '',
        likes: '11', date: 'NOVEMBER 2013',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'BABIES 😭😭', time:'1h' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'look at you two 🥲', time:'2h' },
        ]
      },
      {
        img: DG+'jungkook-2013.jpg',
        caption: '',
        likes: '9', date: 'OCTOBER 2013',
        comments: [
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'baby kook 🥺', time:'1h' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'😂', time:'2h' },
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
        img: DG+'jimin-awardshow.jpg',
        caption: 'ARMY 💜 thank you always.',
        likes: '8,441,002', date: 'DECEMBER 2021',
        comments: [
          { user:'ARMY_official', pfp:'', text:'JIMIN WE LOVE YOU 💜💜💜', time:'10m' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'hyung 💜', time:'20m' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'our Jimin 🥲', time:'30m' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'💜🧡', time:'45m' },
          { user:'ARMY_2', pfp:'', text:'THE PERFORMANCE OF THE NIGHT 😭', time:'1h' },
        ]
      },
      {
        img: DG+'jimin-on-stage.jpg',
        caption: 'ARMY, 고마워요. 💜',
        likes: '7,209,443', date: 'AUGUST 2021',
        comments: [
          { user:'ARMY_official', pfp:'', text:'JIMIN 💜💜', time:'15m' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'❤', time:'30m' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'ate and left no crumbs 💜', time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'CHIMMY 😭 you killed it', time:'1h' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'@sollee__ 🧡', time:'2h' },
        ]
      },
      {
        img: DG+'jimin-kcon2020.jpg',
        caption: 'KCON New York 💜 ARMY',
        likes: '6,001,882', date: 'JANUARY 2020',
        comments: [
          { user:'ARMY_official', pfp:'', text:'JIMIN IN NEW YORK 💜', time:'20m' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'missed you hyung 💜', time:'30m' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'the city missed you back 🥲', time:'1h' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'ARMY everywhere 💜', time:'1h' },
        ]
      },
      {
        img: DG+'jimin-selca.jpg',
        caption: '💜',
        likes: '5,812,003', date: 'MARCH 2019',
        comments: [
          { user:'ARMY_official', pfp:'', text:'THE MOST HANDSOME 💜', time:'5m' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'who is this man', time:'10m' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'@jk_95 your hyung', time:'10m' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'@j.min_bts 😭', time:'15m' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'handsome as always 🥲', time:'30m' },
        ]
      },
      {
        img: DG+'jimin-debut-era.jpg',
        caption: 'ARMY, from the very beginning. 💜',
        likes: '4,221,009', date: 'JUNE 2017',
        comments: [
          { user:'ARMY_official', pfp:'', text:'THE THROWBACK 💜💜', time:'20m' },
          { user:'jk_95', pfp:DG+'jungkookpfp.jpg', text:'HYUNG 😭', time:'30m' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'miss those days 🥲', time:'1h' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'😐💜', time:'1h' },
        ]
      },
    ]
  },

  // ── PARK JIMIN PRIVATE (@j.min__) ────────────────────────────
  jimin_priv: {
    username: 'j.min__', verified: false,
    name: 'jimin',
    pfp: DG+'jiminpfp.jpg',
    followers: '18', following: '21', posts: '11',
    bio: '🔒',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'jimin-solar-2021.jpg',
        caption: '',
        likes: '18', date: 'NOVEMBER 2021',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'🖤', time:'30m' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'Chimmy 🥲', time:'1h' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'our mi 🥲', time:'1h' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'🖤', time:'2h' },
        ]
      },
      {
        img: DG+'jimin-solar-rooftop.jpg',
        caption: '',
        likes: '14', date: 'JULY 2017',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'', time:'1h' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'beautiful city 🥲', time:'2h' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'🖤', time:'2h' },
        ]
      },
      {
        img: DG+'jimin-solar-kcon2016.jpg',
        caption: 'new york 💛',
        likes: '11', date: 'JULY 2016',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'that looks like my city', time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@jk__real it is not your city', time:'1h' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@sollee__ I was there for a whole week", time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"@jk__real I've been there for 18 years", time:'1h' },
          { user:'j.min__', pfp:DG+'jiminpfp.jpg', text:'you two 😭', time:'2h' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'KCON was so fun 💛', time:'2h' },
        ]
      },
      {
        img: DG+'jimin-bts-2015.jpg',
        caption: '',
        likes: '9', date: 'OCTOBER 2015',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'this was a good night', time:'1h' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'best boys 🥲', time:'2h' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'😐', time:'2h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'look at you all 🥹', time:'2h' },
        ]
      },
      {
        img: DG+'jimin-solar-2014.jpg',
        caption: '',
        likes: '6', date: 'APRIL 2014',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'😐', time:'1h' },
          { user:'j.min__', pfp:DG+'jiminpfp.jpg', text:'@jk__real you okay kookie', time:'1h' },
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:"@j.min__ I'm great actually", time:'1h' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'😂', time:'2h' },
          { user:'bts_yoongi', pfp:DG+'yoongipfp.jpg', text:'jungkook.', time:'2h' },
        ]
      },
      {
        img: DG+'jimin-solar-first-year.jpg',
        caption: '',
        likes: '4', date: 'NOVEMBER 2013',
        comments: [
          { user:'jk__real', pfp:DG+'jkprivpfp.jpg', text:'', time:'1h' },
          { user:'bts_seokjin', pfp:DG+'jinpfp.jpg', text:'already so close 🥲', time:'2h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'found this person on my first week here and never let go', time:'2h' },
          { user:'j.min__', pfp:DG+'jiminpfp.jpg', text:'@sollee__ 🧡', time:'2h' },
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
        img: DG+'june-onstage.jpg',
        caption: 'IKONICS 🖤',
        likes: '1,004,221', date: 'DECEMBER 2021',
        comments: [
          { user:'ikonics_official', pfp:'', text:'JUNE 🖤🖤', time:'10m' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'well done', time:'20m' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'🖤', time:'30m' },
          { user:'kimsoomi_official', pfp:DG+'soomipfp.jpg', text:'JUNE-YA 😭🖤', time:'1h' },
          { user:'ikonics_2', pfp:'', text:'THE VOCAL KING', time:'1h' },
        ]
      },
      {
        img: DG+'june-soomi-stage.jpg',
        caption: 'best night of my life. probably. iKONICS 🖤',
        likes: '892,004', date: 'JUNE 2021',
        comments: [
          { user:'ikonics_official', pfp:'', text:'JUNE AND SOOMI 😭🖤', time:'20m' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'well deserved', time:'30m' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'my two best artists 🖤', time:'1h' },
          { user:'kimsoomi_official', pfp:DG+'soomipfp.jpg', text:'I had so much fun 🖤😭', time:'1h' },
          { user:'ikonics_2', pfp:'', text:'ICONIC COLLAB 😭😭', time:'2h' },
        ]
      },
      {
        img: DG+'june-selca.jpg',
        caption: '🖤',
        likes: '741,003', date: 'MARCH 2021',
        comments: [
          { user:'ikonics_official', pfp:'', text:'SO HANDSOME 🖤', time:'5m' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'go to bed', time:'10m' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:"@jinan_94 I'm very awake", time:'10m' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'😂🖤', time:'20m' },
          { user:'kimsoomi_official', pfp:DG+'soomipfp.jpg', text:'go to bed', time:'30m' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:"@kimsoomi_official NOT YOU TOO", time:'30m' },
        ]
      },
      {
        img: DG+'june-kcon.jpg',
        caption: 'KCON LA 🖤 iKONICS thank you',
        likes: '621,009', date: 'JANUARY 2020',
        comments: [
          { user:'ikonics_official', pfp:'', text:'JUNE WE LOVE YOU 🖤', time:'30m' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'you were great', time:'1h' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'proud of you', time:'1h' },
        ]
      },
      {
        img: DG+'june-throwback.jpg',
        caption: 'debut era 🖤 how far weve come',
        likes: '891,002', date: 'SEPTEMBER 2018',
        comments: [
          { user:'ikonics_official', pfp:'', text:'THE THROWBACK 🖤🖤🖤', time:'10m' },
          { user:'jinan_94', pfp:DG+'jinhwanpfp.jpg', text:'we were babies', time:'20m' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'look how young 🥲', time:'30m' },
          { user:'ikonics_2', pfp:'', text:'I have been with you since DAY ONE', time:'1h' },
        ]
      },
    ]
  },

  // ── KOO JUNHOE PRIVATE (@june__) ─────────────────────────────
  junhoe_priv: {
    username: 'june__', verified: false,
    name: 'june',
    pfp: DG+'junepfp.jpg',
    followers: '22', following: '18', posts: '9',
    bio: '🔒',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'june-soomi-studio.jpg',
        caption: '',
        likes: '22', date: 'OCTOBER 2021',
        comments: [
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'what are you doing in her studio', time:'1h' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:"@jinan__ my job", time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'he barged in actually', time:'1h' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:"@sollee__ you were GLAD I was there", time:'1h' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'you two 😭', time:'2h' },
        ]
      },
      {
        img: DG+'june-soomi-dorm.jpg',
        caption: '',
        likes: '19', date: 'JUNE 2021',
        comments: [
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'this is my apartment', time:'30m' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:"@jinan__ it's OUR apartment", time:'30m' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'😭😭', time:'1h' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'who is laughing at what 😂', time:'1h' },
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'everyone is laughing at june. as always.', time:'1h' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:"@jinan__ I hate u", time:'1h' },
        ]
      },
      {
        img: DG+'june-soomi-laugh.jpg',
        caption: '',
        likes: '17', date: 'FEBRUARY 2021',
        comments: [
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'what happened', time:'30m' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:'I said something funny', time:'30m' },
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:"you don't usually make her laugh that hard", time:'30m' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:'@jinan__ I am always funny', time:'30m' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'he fell off the couch', time:'1h' },
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'...june', time:'1h' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'of course he did 😂', time:'1h' },
        ]
      },
      {
        img: DG+'june-ikon-backstage.jpg',
        caption: 'my people 🖤',
        likes: '21', date: 'JANUARY 2020',
        comments: [
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'🖤', time:'30m' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'iKON forever', time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I love you all 🥲', time:'1h' },
          { user:'ikon_donghyuk', pfp:DG+'donghyukpfp.jpg', text:'my brothers 🖤', time:'2h' },
        ]
      },
      {
        img: DG+'june-soomi-first-year.jpg',
        caption: '',
        likes: '12', date: 'MARCH 2019',
        comments: [
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'when did this happen', time:'1h' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:'@jinan__ we are best friends hyung, this is what that looks like', time:'1h' },
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:"@june__ I know I just didn't know you took a photo", time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I was there you were right in front of us both 😭', time:'2h' },
          { user:'jinan__', pfp:DG+'naniprivpfp.jpg', text:'...right.', time:'2h' },
          { user:'june__', pfp:DG+'junepfp.jpg', text:'ahjussi is going senile 🕊️', time:'2h' },
        ]
      },
    ]
  },

  // ── KIM JINHWAN (@jinan_94) — PUBLIC ─────────────────────────
  jinhwan: {
    username: 'jinan_94', verified: true,
    name: 'Kim Jinhwan',
    pfp: DG+'jinhwanpfp.jpg',
    followers: '3.1M', following: '198', posts: '187',
    bio: 'iKON 🖤 YG Entertainment\n1994 ✦ Jeju, Korea',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'jinhwan-awardshow.jpg',
        caption: 'MAMA 🖤 iKONICS thank you always',
        likes: '721,003', date: 'DECEMBER 2021',
        comments: [
          { user:'ikonics_official', pfp:'', text:'JINAN 🖤🖤🖤', time:'30m' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'hyung you ate that whole stage', time:'1h' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'💪🖤', time:'1h' },
          { user:'kimsoomi_official', pfp:DG+'soomipfp.jpg', text:'🥹🖤', time:'2h' },
          { user:'ikonics_2', pfp:'', text:'THE BEST OF THE NIGHT', time:'2h' },
        ]
      },
      {
        img: DG+'jinhwan-onstage-kcon.jpg',
        caption: 'KCON 2020 🖤 iKONICS thank you',
        likes: '621,004', date: 'JANUARY 2020',
        comments: [
          { user:'ikonics_official', pfp:'', text:'JINAN 🖤🖤🖤', time:'1h' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'hyung you ate that', time:'1h' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'💪', time:'2h' },
          { user:'kimsoomi_official', pfp:DG+'soomipfp.jpg', text:'🥹🖤', time:'2h' },
        ]
      },
      {
        img: DG+'jinhwan-backstage.jpg',
        caption: 'backstage with my boys 🖤',
        likes: '534,210', date: 'JANUARY 2020',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'the best night 🖤', time:'1h' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'iKON forever', time:'2h' },
          { user:'ikonics_official', pfp:'', text:'WE LOVE YOU BOYS 🖤🖤', time:'2h' },
          { user:'kimsoomi_official', pfp:DG+'soomipfp.jpg', text:'my boys 🥹', time:'3h' },
        ]
      },
      {
        img: DG+'jinhwanpfp.jpg',
        caption: 'iKONICS 🖤',
        likes: '498,231', date: 'MARCH 2019',
        comments: [
          { user:'ikonics_official', pfp:'', text:'JINAN 🖤🖤🖤', time:'1h' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'hyung you look tired go to bed', time:'2h' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'🙄', time:'2h' },
          { user:'kimsoomi_official', pfp:DG+'soomipfp.jpg', text:'🥹', time:'3h' },
        ]
      },
      {
        img: DG+'jinhwan-blingbling.jpg',
        caption: 'Bling Bling era 🖤',
        likes: '412,009', date: 'JUNE 2018',
        comments: [
          { user:'ikonics_official', pfp:'', text:'THE ERA THAT STARTED IT ALL 🖤', time:'1h' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'hyung looked SO good here', time:'1h' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'throwback 🖤', time:'2h' },
        ]
      },
    ]
  },

  // ── KIM JINHWAN PRIVATE (@jinan__) ───────────────────────────
  jinhwan_priv: {
    username: 'jinan__', verified: false,
    name: 'jinhwan',
    pfp: DG+'jinhwanpfp.jpg',
    followers: '31', following: '29', posts: '18',
    bio: '🔒',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'jinhwan-solar-backstage.jpg',
        caption: '',
        likes: '28', date: 'JUNE 2021',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'you two were INCREDIBLE tonight', time:'1h' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'my two favourite artists 🖤', time:'2h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"I still can't believe we pulled that off 😭", time:'2h' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@sollee__ we always do', time:'2h' },
        ]
      },
      {
        img: DG+'jinhwan-athomeselfie.jpg',
        caption: '',
        likes: '19', date: 'MARCH 2021',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'hyung answer your phone', time:'1h' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'you good?', time:'2h' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@leader_hanbin yeah. just tired.', time:'2h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"I'm coming over", time:'3h' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:"@sollee__ you don't have to", time:'3h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'@jinan__ I know', time:'3h' },
        ]
      },
      {
        img: DG+'ikon-selfie.jpg',
        caption: 'my people 🖤',
        likes: '24', date: 'FEBRUARY 2021',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'THE BEST LOOKING GROUP IN THE INDUSTRY', time:'10m' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'🖤', time:'30m' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I love you all so much 🥲', time:'1h' },
        ]
      },
      {
        img: DG+'jinhwan-cafe.jpg',
        caption: '',
        likes: '14', date: 'JANUARY 2021',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'where is this', time:'1h' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:"@iKON_june none of your business", time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I know exactly where this is', time:'2h' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@sollee__ 🤫', time:'2h' },
        ]
      },
      {
        img: DG+'jinhwan-skyselfie.jpg',
        caption: '',
        likes: '21', date: 'DECEMBER 2020',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'hyung where are you going', time:'30m' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@iKON_june just walking', time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"call me when you're done walking", time:'1h' },
        ]
      },
      {
        img: DG+'jinhwan-niceview.jpg',
        caption: '',
        likes: '18', date: 'NOVEMBER 2020',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'actually stunning', time:'1h' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'🖤', time:'2h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'take me next time', time:'2h' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@sollee__ deal', time:'2h' },
        ]
      },
      {
        img: DG+'jinhwan-newyears.jpg',
        caption: 'new year 🌙',
        likes: '26', date: 'JANUARY 2020',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'hyung happy new year 🖤', time:'30m' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'새해 복 많이 받으세요 🖤', time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'happy new year jinhwan 🌙', time:'1h' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@sollee__ 🌙', time:'1h' },
        ]
      },
      {
        img: DG+'jinhwan-walk.jpg',
        caption: '',
        likes: '12', date: 'OCTOBER 2019',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'WHATS NEXT TO YOU', time:'5m' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@iKON_june a friend', time:'10m' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'@jinan__ HYUNG THATS A MONKEY', time:'10m' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'only jinhwan', time:'20m' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I have so many questions', time:'1h' },
        ]
      },
      {
        img: DG+'jinhwan-incar.jpg',
        caption: '',
        likes: '9', date: 'JUNE 2019',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'where are you going at this hour', time:'1h' },
          { user:'jinan__', pfp:DG+'jinhwanpfp.jpg', text:'@iKON_june out', time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"I'm in the car", time:'1h' },
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'@sollee__ WHAT', time:'1h' },
        ]
      },
      {
        img: DG+'jinhwan-bobby-2016.jpg',
        caption: '',
        likes: '31', date: 'AUGUST 2016',
        comments: [
          { user:'iKON_june', pfp:DG+'junepfp.jpg', text:'throwback 😭😭', time:'1h' },
          { user:'leader_hanbin', pfp:DG+'hanbinpfp.jpg', text:'we were so young 🥲', time:'2h' },
        ]
      },
    ]
  },

  // ── JEON JUNGKOOK (@jk_95) — PUBLIC ──────────────────────────
  jungkook: {
    username: 'jk_95', verified: true,
    name: 'Jeon Jungkook',
    pfp: DG+'jungkookpfp.jpg',
    followers: '28.9M', following: '72', posts: '312',
    bio: 'BTS 💜 HYBE\n1995 ✦ Busan, Korea',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'jungkook-awardshow.jpg',
        caption: 'MAMA 💜 ARMY thank you',
        likes: '11,203,441', date: 'DECEMBER 2021',
        comments: [
          { user:'ARMY_official', pfp:'', text:'JUNGKOOK WE LOVE YOU 💜💜💜', time:'10m' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'❤', time:'20m' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'💜', time:'30m' },
          { user:'ARMY_2', pfp:'', text:'THE PERFORMANCE OF THE YEAR', time:'1h' },
        ]
      },
      {
        img: DG+'jungkook-comebackselfie.jpg',
        caption: 'ARMY 💜',
        likes: '9,431,002', date: 'MAY 2021',
        comments: [
          { user:'ARMY_official', pfp:'', text:'JUNGKOOK WE LOVE YOU 💜💜💜', time:'10m' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'❤', time:'30m' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'❤', time:'1h' },
          { user:'ARMY_2', pfp:'', text:'OUR GOLDEN MAKNAE 😭', time:'1h' },
        ]
      },
      {
        img: DG+'jungkook-2016.jpg',
        caption: 'KCON 💜 ARMY',
        likes: '6,891,002', date: 'JUNE 2016',
        comments: [
          { user:'ARMY_official', pfp:'', text:'JUNGKOOK 💜💜', time:'30m' },
          { user:'j.min_bts', pfp:DG+'jiminpfp.jpg', text:'my baby 😭', time:'1h' },
          { user:'ARMY_2', pfp:'', text:'SO TALENTED', time:'1h' },
        ]
      },
    ]
  },

  // ── LEE JAEHYUN (@jaehyunlee__) ─────────────────────────────
  jaehyun_lee: {
    username: 'jaehyunlee__', verified: false,
    name: 'Lee Jaehyun',
    pfp: DG+'jaepfp.jpg',
    followers: '1,203', following: '88', posts: '31',
    bio: 'new york',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'jae-solar-2021.jpg',
        caption: '',
        likes: '902', date: 'NOVEMBER 2021',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'MY SIBLINGS 😭😭', time:'20m' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'🥲🥲', time:'30m' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'finally all back together 🥹', time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'my family 🥲', time:'1h' },
          { user:'kevin_moon', pfp:'', text:'THE LEE SIBLINGS 😭😭', time:'2h' },
        ]
      },
      {
        img: DG+'jae-solo.jpg',
        caption: '',
        likes: '712', date: 'AUGUST 2021',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'who took this', time:'30m' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:"@chaerin_lee none of your business", time:'30m' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'😭 bro is mysterious', time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'jae looking good 🙂', time:'1h' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:"@sollee__ I always do", time:'1h' },
        ]
      },
      {
        img: DG+'jae-newyork-2020.jpg',
        caption: 'home.',
        likes: '601', date: 'JULY 2020',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'miss this 🥲', time:'1h' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'nothing like it', time:'2h' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'new york 🥲', time:'2h' },
        ]
      },
      {
        img: DG+'jae-party-2012.jpg',
        caption: '',
        likes: '312', date: 'DECEMBER 2012',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'THE THROWBACK', time:'1h' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'we were so young 😭', time:'2h' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'...wild era', time:'2h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:"I remember this night. fondly. and not.", time:'2h' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:"@sollee__ yeah", time:'2h' },
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
        img: DG+'juyeon-chaerin.jpg',
        caption: '',
        likes: '601', date: 'JULY 2021',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'delete', time:'5m' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:"@chaerin_lee no", time:'5m' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'what are you two doing 😭', time:'20m' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I love you idiots 🥲', time:'30m' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'the funniest people alive honestly', time:'1h' },
        ]
      },
      {
        img: DG+'juyeon-solo.jpg',
        caption: '',
        likes: '441', date: 'MAY 2021',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'who are you and what did you do with my embarrassing brother', time:'30m' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:"@chaerin_lee shut up", time:'30m' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'looking good juyeon', time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'that is MY little brother 😭', time:'1h' },
        ]
      },
      {
        img: DG+'juyeon-newyork.jpg',
        caption: 'nothing like this city.',
        likes: '322', date: 'FEBRUARY 2020',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'new york 🥲', time:'1h' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'facts', time:'2h' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'agreed', time:'2h' },
        ]
      },
      {
        img: DG+'juyeon-teen.jpg',
        caption: '',
        likes: '189', date: 'NOVEMBER 2016',
        comments: [
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'WE WERE SO LITTLE 😭😭', time:'30m' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:"@chaerin_lee speak for yourself I was tall", time:'30m' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'you were not that tall', time:'1h' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:"@jaehyunlee__ I was.", time:'1h' },
        ]
      },
    ]
  },

  // ── CHOI CHANHEE (@chanhee) ───────────────────────────────────
  chanhee: {
    username: 'chanhee', verified: false,
    name: 'Choi Chanhee',
    pfp: DG+'chanheepfp.jpg',
    followers: '1,204', following: '340', posts: '88',
    bio: 'new york → seoul\nbest friend. stylist. babysitter (unfortunately)',
    locked: false, hasDuality: false, highlights: [],
    posts_data: [
      {
        img: DG+'chanheepfp.jpg',
        caption: 'surviving',
        likes: '892', date: 'AUGUST 2021',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'barely 🙂', time:'2h' },
          { user:'kevin_moon', pfp:'', text:'hang in there king 💪', time:'3h' },
          { user:'jacob_moon', pfp:'', text:'you got this hee!! 🙏', time:'3h' },
          { user:'changmin__', pfp:'', text:'what happened', time:'4h' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'@changmin__ Solar happened', time:'4h' },
        ]
      },
      {
        img: DG+'chanhee-wooatsolar.jpg',
        caption: 'caught him smiling. sending this to everyone I know.',
        likes: '1,003', date: 'JULY 2021',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'CHANHEE DELETE THIS RIGHT NOW', time:'5m' },
          { user:'kevin_moon', pfp:'', text:'NO WAY IS THAT HIM SMILING 😭', time:'20m' },
          { user:'jacob_moon', pfp:'', text:'this is the most important photo ever taken', time:'30m' },
          { user:'changmin__', pfp:'', text:'framing this', time:'1h' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"@sollee__ absolutely not it's going in an album", time:'1h' },
        ]
      },
      {
        img: DG+'chanhee-inthecity.jpg',
        caption: '',
        likes: '891', date: 'MARCH 2020',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'this is literally all you do', time:'1h' },
          { user:'kevin_moon', pfp:'', text:'FASHION ICON 😭😭', time:'1h' },
          { user:'jacob_moon', pfp:'', text:'king behavior', time:'2h' },
          { user:'changmin__', pfp:'', text:'serving as always', time:'2h' },
        ]
      },
      {
        img: DG+'chanhee-jacob-changmin.jpg',
        caption: 'the usual suspects',
        likes: '740', date: 'SEPTEMBER 2019',
        comments: [
          { user:'kevin_moon', pfp:'', text:'WHY WASNT I INVITED', time:'30m' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'WHY WASNT I INVITED', time:'30m' },
          { user:'changmin__', pfp:'', text:'@kevin_moon @sollee__ you were both busy 😭', time:'1h' },
          { user:'jacob_moon', pfp:'', text:'next time for sure 🥺', time:'1h' },
        ]
      },
      {
        img: DG+'chanhee-nycrooftop.jpg',
        caption: 'miss home sometimes',
        likes: '312', date: 'JUNE 2019',
        comments: [
          { user:'kevin_moon', pfp:'', text:'YOU SHOULD COME VISIT', time:'1h' },
          { user:'jacob_moon', pfp:'', text:'miss you hee 🥺', time:'2h' },
          { user:'changmin__', pfp:'', text:'bro literally just come back', time:'2h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I miss it too sometimes', time:'3h' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"@sollee__ I KNOW U DO THAT'S WHY U SHOULD COME HOME", time:'3h' },
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
        img: DG+'juyeon-chaerin.jpg',
        caption: '',
        likes: '188', date: 'JULY 2021',
        comments: [
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'delete', time:'' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:"@juyeonlee__ absolutely not", time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'I love you two 😭', time:'' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'what were you making that face for', time:'' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:"@jaehyunlee__ mind your business jae", time:'' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'a pair 😭', time:'' },
        ]
      },
      {
        img: DG+'chaerin-amusementpark.jpg',
        caption: 'I will never legally confirm or deny how we got in',
        likes: '204', date: 'JULY 2021',
        comments: [
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'chaerin this is going to get us arrested', time:'' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:"@juyeonlee__ it'll be fine", time:'' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:"it was fine. we're fine.", time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'🤐', time:'' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'SOLAR. EXPLAIN.', time:'' },
        ]
      },
      {
        img: DG+'chaerin-shopping.jpg',
        caption: 'therapeutic',
        likes: '122', date: '2021',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'how many bags is that', time:'' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'@sollee__ a healthy amount', time:'' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'chaerin...', time:'' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:"@juyeonlee__ don't", time:'' },
        ]
      },
      {
        img: DG+'chaerin-shoppingcart.jpg',
        caption: '',
        likes: '98', date: '2021',
        comments: [
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'who pushed you 😭', time:'' },
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'I did', time:'' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'this is a lawsuit waiting to happen', time:'' },
        ]
      },
      {
        img: DG+'chaerin-photoatparty.jpg',
        caption: '',
        likes: '61', date: '2018',
        comments: [
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'cute 🥺', time:'' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'be safe chae', time:'' },
        ]
      },
      {
        img: DG+'chaerin-party.jpg',
        caption: '',
        likes: '38', date: '2017',
        comments: [
          { user:'juyeonlee__', pfp:DG+'juyeonpfp.jpg', text:'did mom say you could go to this', time:'' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:"@juyeonlee__ don't worry about it", time:'' },
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:"I'm picking you up at midnight", time:'' },
        ]
      },
      {
        img: DG+'chaerin-sunwoosmotorcycle.jpg',
        caption: "don't tell my parents",
        likes: '14', date: '2011',
        comments: [
          { user:'jaehyunlee__', pfp:DG+'jaepfp.jpg', text:'dad is going to lose it', time:'' },
          { user:'chaerin_lee', pfp:DG+'chaerinselfie.jpg', text:'@jaehyunlee__ mind ur business', time:'' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'CHAERIN WHAT ARE YOU DOING', time:'' },
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
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'bro who took this 😭', time:'2h' },
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:"I did. he didn't know.", time:'2h' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'saving this immediately', time:'3h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'delete this', time:'3h' },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:"@hyunjoon_k we'll talk.", time:'4h' },
        ]
      },
      {
        img: DG+'sunwoo-moneyanddrugs.jpg',
        caption: '',
        likes: '163', date: '2021',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'no caption needed ig 🙄', time:'1h' },
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'facts', time:'1h' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'the audacity', time:'2h' },
        ]
      },
      {
        img: DG+'sunwoo-motorcycle.jpg',
        caption: '',
        likes: '312', date: '2020',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'LETS GOOOO 🔥', time:'5m' },
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'she misses you bro', time:'10m' },
          { user:'ksw__', pfp:DG+'sunwoopfp.jpg', text:'@hyunjoon_k delete your account', time:'20m' },
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'@ksw__ no ❤', time:'20m' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I have never seen this in my life', time:'30m' },
        ]
      },
      {
        img: DG+'sunwoo-blurry.jpg',
        caption: '',
        likes: '89', date: '2019',
        comments: [
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'who took this 😭', time:'1h' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'the jacket. iconic.', time:'2h' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:"first post in god knows how long and it's blurry", time:'3h' },
        ]
      },
      {
        img: DG+'sunwooandsolar-motorcycle.jpg',
        caption: '',
        likes: '74', date: '2012',
        comments: [
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'WE WERE SO YOUNG 😭😭', time:'1h' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'throwback 🥲', time:'2h' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I remember this day', time:'3h' },
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
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'💀💀💀', time:'5m' },
          { user:'sangyeon__', pfp:'', text:'Eric you have a death wish', time:'20m' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I needed this for my collection thank you', time:'30m' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'Eric run', time:'1h' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:"@sollee__ he doesn't even know how to use instagram", time:'1h' },
        ]
      },
      {
        img: DG+'eric-sunwoo.jpg',
        caption: 'took me three years but I got him',
        likes: '412', date: '2021',
        comments: [
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:"LMAOOO HES GONNA KILL YOU", time:'10m' },
          { user:'sangyeon__', pfp:'', text:'Eric this is your bravest act', time:'30m' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I have the same photo. great minds.', time:'1h' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'delete this before he sees it', time:'1h' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:"@sollee__ absolutely not", time:'1h' },
        ]
      },
      {
        img: DG+'eric-party.jpg',
        caption: '',
        likes: '244', date: '2021',
        comments: [
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'this was a night 😭', time:'1h' },
          { user:'sangyeon__', pfp:'', text:'I went home early and I stand by that decision', time:'2h' },
        ]
      },
      {
        img: DG+'eric-hyunjae-smoking.jpg',
        caption: '',
        likes: '312', date: '2021',
        comments: [
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'not me being left out', time:'30m' },
          { user:'sangyeon__', pfp:'', text:'you guys look terrible', time:'1h' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'@sangyeon__ thank u', time:'1h' },
        ]
      },
      {
        img: DG+'eric-wheelie.jpg',
        caption: '',
        likes: '389', date: '2020',
        comments: [
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'LETS GOOO 🔥', time:'5m' },
          { user:'sangyeon__', pfp:'', text:'please wear a helmet', time:'30m' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:"@sangyeon__ helmets are for people who are scared", time:'1h' },
          { user:'sangyeon__', pfp:'', text:"@eric_sim you SHOULD be scared", time:'1h' },
        ]
      },
      {
        img: DG+'eric-goofygaspump.jpg',
        caption: '',
        likes: '178', date: '2020',
        comments: [
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:"I was THERE and I still dont know what you were doing", time:'1h' },
          { user:'sangyeon__', pfp:'', text:'Eric.', time:'2h' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:"@sangyeon__ don't Eric me", time:'2h' },
        ]
      },
      {
        img: DG+'eric-donuts.jpg',
        caption: 'breakfast',
        likes: '203', date: '2020',
        comments: [
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:'bro 😭', time:'1h' },
          { user:'sangyeon__', pfp:'', text:'that is not breakfast', time:'1h' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:"@sangyeon__ it literally is tho", time:'2h' },
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
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'FINALLY HES WEARING SOMETHING NICE', time:'10m' },
          { user:'sangyeon__', pfp:'', text:'he looks like he runs a country', time:'20m' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'I am saving this photo', time:'30m' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'delete this', time:'1h' },
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:"@sollee__ no ❤", time:'1h' },
        ]
      },
      {
        img: DG+'hyunjoon-thirsttrap.jpg',
        caption: '',
        likes: '802', date: '2021',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'BRO 😭😭', time:'30m' },
          { user:'sangyeon__', pfp:'', text:'alright', time:'1h' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'@sangyeon__ THATS IT? ALRIGHT???', time:'1h' },
        ]
      },
      {
        img: DG+'hyunjoon-partyshot.jpg',
        caption: '',
        likes: '634', date: '2021',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'this was the best night of my life', time:'1h' },
          { user:'sangyeon__', pfp:'', text:'you say that every time', time:'2h' },
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:"@sangyeon__ because it keeps being true", time:'2h' },
        ]
      },
      {
        img: DG+'hyunjoon-dragrace.jpg',
        caption: '',
        likes: '721', date: '2021',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'LETS GOOOOO 🔥🔥🔥', time:'5m' },
          { user:'sangyeon__', pfp:'', text:'I genuinely fear for all of you', time:'30m' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'😭😭', time:'1h' },
        ]
      },
      {
        img: DG+'hyunjoon-drugstash.jpg',
        caption: '',
        likes: '290', date: '2020',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'bro is not subtle at all 😭', time:'1h' },
          { user:'sangyeon__', pfp:'', text:'Hyunjoon.', time:'2h' },
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:"@sangyeon__ it's fine", time:'2h' },
        ]
      },
      {
        img: DG+'hyunjoon-alcohol.jpg',
        caption: 'the essentials',
        likes: '490', date: '2020',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'📞 calling me?', time:'30m' },
          { user:'sangyeon__', pfp:'', text:'Hyunjoon...', time:'1h' },
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:"@sangyeon__ don't start", time:'1h' },
        ]
      },
      {
        img: DG+'hyunjoon-solandwooparty.jpg',
        caption: '2011 🕰️',
        likes: '1,002', date: '2011',
        comments: [
          { user:'eric_sim', pfp:DG+'ericpfp.jpg', text:'THE THROWBACK 😭😭😭', time:'10m' },
          { user:'sangyeon__', pfp:'', text:'they were so young', time:'20m' },
          { user:'chanhee', pfp:DG+'chanheepfp.jpg', text:'HYUNJOON WHAT IS THIS', time:'30m' },
          { user:'sollee__', pfp:DG+'solarpfp.jpg', text:'Hyunjoon I will find you', time:'45m' },
          { user:'hyunjoon_k', pfp:DG+'hyunjoonpfp.jpg', text:"@sollee__ worth it ❤", time:'1h' },
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