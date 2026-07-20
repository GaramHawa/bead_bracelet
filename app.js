/* ═══════════════════════════════════════════
   STRANDCRAFT — Application Logic
   Updated thread SVG styling to match StrandCraft palette
   ═══════════════════════════════════════════ */

const BEADS = [
  { id:"BBP", name:"Baby Pink Pearl", file:"New folder/bbgpinkb.png" },
  { id:"BLU", name:"Blue Pearl",      file:"New folder/blueb.png" },
  { id:"BRZ", name:"Bronze Bead",     file:"New folder/bronzeb.png" },
  { id:"GRN", name:"Green Pearl",     file:"New folder/greenb.png" },
  { id:"LBL", name:"Light Blue Pearl",file:"New folder/lightblueb.png" },
  { id:"MRN", name:"Maroon Bead",     file:"New folder/maroonb.png" },
  { id:"OFW", name:"Off White Pearl", file:"New folder/offwhiteb.png" },
  { id:"SLV", name:"Silver Bead",     file:"New folder/silverb.png" },
  { id:"WHT", name:"White Pearl",     file:"New folder/whiteb.png" },
  { id:"YLW", name:"Yellow Pearl",    file:"New folder/yellowb.png" },
  { id:"YWH", name:"Cream Pearl",     file:"New folder/ywhiteb.png" },
];

const SIZE_CFG = {
  small:  { n:12, r:145 },
  medium: { n:18, r:200 },
  large:  { n:24, r:258 },
};

let currentSize = null;
let slots = [];
let dragPayload = null;

/* ── BUILD CATALOGUE ── */
function buildCatalogue() {
  const grid = document.getElementById('catalogue');
  grid.innerHTML = '';
  BEADS.forEach(b => {
    const el = document.createElement('div');
    el.className = 'bead-item';
    el.draggable = true;
    el.dataset.id   = b.id;
    el.dataset.file = b.file;
    el.innerHTML = `
      <img src="${b.file}" alt="${b.name}">
      <div class="bead-name">${b.name}</div>
      <div class="bead-id">${b.id}</div>`;
    el.addEventListener('dragstart', e => {
      dragPayload = { id: b.id, file: b.file };
      e.dataTransfer.effectAllowed = 'copy';
    });
    el.addEventListener('dragend', () => { dragPayload = null; });
    grid.appendChild(el);
  });
}

/* ── BUILD RING ── */
function buildRing(size) {
  const { n, r } = SIZE_CFG[size];
  const pad = 50;
  const dim = (r + pad) * 2;
  const cx = dim / 2, cy = dim / 2;
  slots = new Array(n).fill(null);

  const ring = document.getElementById('bracelet-ring');
  ring.innerHTML = '';
  ring.style.width  = dim + 'px';
  ring.style.height = dim + 'px';

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', dim);
  svg.setAttribute('height', dim);
  svg.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;';

  // Glow ring (Warm Beige tint)
  const glow = document.createElementNS(svgNS, 'circle');
  glow.setAttribute('cx', cx); glow.setAttribute('cy', cy); glow.setAttribute('r', r);
  glow.setAttribute('fill', 'none'); glow.setAttribute('stroke', 'rgba(208, 144, 108, 0.2)');
  glow.setAttribute('stroke-width', '12');
  svg.appendChild(glow);

  // Thread (Warm Beige #D0906C)
  const thread = document.createElementNS(svgNS, 'circle');
  thread.setAttribute('cx', cx); thread.setAttribute('cy', cy); thread.setAttribute('r', r);
  thread.setAttribute('fill', 'none'); thread.setAttribute('stroke', '#D0906C');
  thread.setAttribute('stroke-width', '2.5');
  thread.setAttribute('stroke-dasharray', '6 4');
  svg.appendChild(thread);
  ring.appendChild(svg);

  // Drop zones
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i / n) - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `position:absolute;width:80px;height:80px;left:${x}px;top:${y}px;transform:translate(-50%,-50%);`;

    const zone = document.createElement('div');
    zone.className = 'drop-zone';
    zone.dataset.idx = i;
    zone.innerHTML  = `<span class="slot-num">${i + 1}</span>`;

    const rmBtn = document.createElement('button');
    rmBtn.className = 'remove-btn';
    rmBtn.textContent = '×';
    rmBtn.title = 'Remove bead';
    rmBtn.addEventListener('click', e => { e.stopPropagation(); clearSlot(i); });

    wrapper.appendChild(zone);
    wrapper.appendChild(rmBtn);

    zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', e => {
      if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
    });
    zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('drag-over'); if (dragPayload) dropBead(i, dragPayload); });
    wrapper.addEventListener('mouseenter', () => { if(slots[i]) rmBtn.style.display='flex'; });
    wrapper.addEventListener('mouseleave', () => { rmBtn.style.display='none'; });
    ring.appendChild(wrapper);
  }
}

function dropBead(idx, payload) {
  slots[idx] = payload;
  const zone = getZone(idx);
  zone.innerHTML = `<img src="${payload.file}" alt="${payload.id}">`;
  zone.classList.add('filled', 'popped');
  setTimeout(() => zone.classList.remove('popped'), 350);
  updateUI();
}

function clearSlot(idx) {
  slots[idx] = null;
  const zone = getZone(idx);
  zone.className = 'drop-zone';
  zone.innerHTML = `<span class="slot-num">${idx + 1}</span>`;
  const rmBtn = zone.parentElement ? zone.parentElement.querySelector('.remove-btn') : null;
  if (rmBtn) rmBtn.style.display = 'none';
  updateUI();
}

function clearAll() {
  const n = SIZE_CFG[currentSize].n;
  for (let i = 0; i < n; i++) clearSlot(i);
}

function getZone(idx) {
  return document.querySelector(`.drop-zone[data-idx="${idx}"]`);
}

function updateUI() {
  const placed = slots.filter(Boolean).length;
  document.getElementById('tb-placed').textContent = placed;
  const code = slots.map((s, i) => s ? s.id : `_${i+1}`).join(' · ');
  document.getElementById('code-string').textContent = code;
}

function startCustomizer(size) {
  currentSize = size;
  document.getElementById('size-screen').style.display = 'none';
  const c = document.getElementById('customizer');
  c.classList.add('active');
  document.getElementById('tb-size').textContent = size[0].toUpperCase() + size.slice(1);
  document.getElementById('tb-total').textContent = SIZE_CFG[size].n;
  buildCatalogue();
  buildRing(size);
  updateUI();
}

function goBack() {
  document.getElementById('size-screen').style.display = 'flex';
  document.getElementById('customizer').classList.remove('active');
}

function copyCode() {
  const txt = document.getElementById('code-string').textContent;
  if (navigator.clipboard) navigator.clipboard.writeText(txt).then(showToast);
  else { const t=document.createElement('textarea');t.value=txt;document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t);showToast(); }
}

let toastTimer = null;
function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  const el = document.getElementById('code-string');
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}
