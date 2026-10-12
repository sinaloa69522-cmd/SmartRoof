/* SmartRoof: software para contratistas de techos (medición, propuestas, CRM, facturas). */
'use strict';

// ---------- utilidades ----------
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
const loc = () => state?.settings?.lang === 'en' ? 'en-US' : 'es-MX';
const fmtDate = d => d ? new Date(d.length === 10 ? d + 'T12:00:00' : d).toLocaleDateString(loc(), { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const num = (n, d = 0) => new Intl.NumberFormat(loc(), { maximumFractionDigits: d, minimumFractionDigits: d }).format(n || 0);
function money(n) {
  try { return new Intl.NumberFormat(loc(), { style: 'currency', currency: state.settings.currency || 'USD', currencyDisplay: 'narrowSymbol' }).format(n || 0); }
  catch { return '$' + (n || 0).toFixed(2); }
}
const r2 = n => Math.round(n * 100) / 100;
const inFrame = (() => { try { return window.self !== window.top; } catch { return true; } })();

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, 2600);
}
// confirmación en dos toques (el visor no permite confirm())
function armed(el) {
  if (el.dataset.armed) return true;
  el.dataset.armed = '1'; const prev = el.innerHTML; el.textContent = '¿Seguro? Toca otra vez';
  setTimeout(() => { if (el.isConnected) { el.innerHTML = prev; delete el.dataset.armed; } }, 3500);
  return false;
}
async function copyText(text, fallbackEl) {
  try { await navigator.clipboard.writeText(text); toast('Copiado al portapapeles'); }
  catch {
    if (fallbackEl) { fallbackEl.hidden = false; fallbackEl.value = text; fallbackEl.focus(); fallbackEl.select(); toast('Selecciona el texto y cópialo'); }
    else toast('No se pudo copiar');
  }
}

// ---------- catálogo y constantes ----------
const STAGES = [
  { id: 'lead', name: 'Nuevo prospecto', color: 'var(--muted)' },
  { id: 'inspeccion', name: 'Inspección', color: 'var(--info)' },
  { id: 'propuesta', name: 'Propuesta enviada', color: 'var(--warn)' },
  { id: 'aprobado', name: 'Aprobado', color: 'var(--ok)' },
  { id: 'produccion', name: 'En producción', color: 'var(--accent)' },
  { id: 'facturado', name: 'Facturado', color: 'var(--info)' },
  { id: 'pagado', name: 'Pagado', color: 'var(--ok)' },
  { id: 'perdido', name: 'Perdido', color: 'var(--bad)' },
];
const stageName = id => STAGES.find(s => s.id === id)?.name || id;
const OPEN_STAGES = ['lead', 'inspeccion', 'propuesta'];

const LINE_TYPES = {
  eave: { name: 'Alero', color: '#2f9e44', key: '1' },
  rake: { name: 'Hastial', color: '#1c7ed6', key: '2' },
  ridge: { name: 'Cumbrera', color: '#e03131', key: '3' },
  hip: { name: 'Limatesa', color: '#f76707', key: '4' },
  valley: { name: 'Limahoya', color: '#ae3ec9', key: '5' },
  flash: { name: 'Tapajuntas', color: '#0c8599', key: '6' },
  step: { name: 'Tapaj. escalonado', color: '#5c7cfa', key: '7' },
};
const PITCHES = Array.from({ length: 19 }, (_, i) => i); // 0/12 .. 18/12

const FORMULAS = {
  bundles: 'Paquetes de teja (3 por cuadro + desperdicio)',
  sqw: 'Cuadros con desperdicio',
  sq: 'Cuadros medidos (sin desperdicio)',
  underlay: 'Rollos de membrana (10 cuadros c/u)',
  iw: 'Rollos hielo y agua (aleros + limahoyas ÷ 66 ft)',
  starter: 'Arranque (aleros + hastiales ÷ 105 ft)',
  ridgecap: 'Caballete (cumbreras + limatesas ÷ 33 ft)',
  drip: 'Gotero (aleros + hastiales ÷ 10 ft)',
  ridgevent: 'Ventila de cumbrera (cumbreras ÷ 4 ft)',
  nails: 'Cajas de clavos (1 por 20 cuadros)',
  flash: 'Tapajuntas (lineales ÷ 10 ft)',
  penetrations: 'Penetraciones (tubos/ventilas)',
  one: 'Cantidad fija: 1',
  manual: 'Manual',
};
const DEFAULT_CATALOG = [
  { id: 'shingle3tab', name: 'Teja asfáltica 3-tab', unit: 'paq', kind: 'material', formula: 'bundles', cost: 31, price: 42 },
  { id: 'shingleArch', name: 'Teja arquitectónica (laminada)', unit: 'paq', kind: 'material', formula: 'bundles', cost: 38, price: 52 },
  { id: 'shinglePrem', name: 'Teja premium de diseñador', unit: 'paq', kind: 'material', formula: 'bundles', cost: 64, price: 88 },
  { id: 'underlay', name: 'Membrana sintética', unit: 'rollo', kind: 'material', formula: 'underlay', cost: 78, price: 105 },
  { id: 'iw', name: 'Barrera de hielo y agua', unit: 'rollo', kind: 'material', formula: 'iw', cost: 92, price: 128 },
  { id: 'starter', name: 'Teja de arranque', unit: 'paq', kind: 'material', formula: 'starter', cost: 44, price: 60 },
  { id: 'ridgecap', name: 'Teja de caballete', unit: 'paq', kind: 'material', formula: 'ridgecap', cost: 58, price: 80 },
  { id: 'drip', name: 'Gotero metálico 10 ft', unit: 'pza', kind: 'material', formula: 'drip', cost: 9, price: 14 },
  { id: 'ridgevent', name: 'Ventila de cumbrera 4 ft', unit: 'pza', kind: 'material', formula: 'ridgevent', cost: 15, price: 24 },
  { id: 'nails', name: 'Clavos en bobina', unit: 'caja', kind: 'material', formula: 'nails', cost: 52, price: 70 },
  { id: 'boots', name: 'Bota para tubería', unit: 'pza', kind: 'material', formula: 'penetrations', cost: 12, price: 20 },
  { id: 'flashing', name: 'Tapajuntas metálico 10 ft', unit: 'pza', kind: 'material', formula: 'flash', cost: 11, price: 18 },
  { id: 'tearoff', name: 'Retiro de techo existente', unit: 'cuadro', kind: 'labor', formula: 'sq', cost: 55, price: 85 },
  { id: 'install', name: 'Mano de obra de instalación', unit: 'cuadro', kind: 'labor', formula: 'sq', cost: 95, price: 145 },
  { id: 'dumpster', name: 'Contenedor y limpieza', unit: 'serv', kind: 'other', formula: 'one', cost: 380, price: 475 },
  { id: 'permit', name: 'Permiso municipal', unit: 'serv', kind: 'other', formula: 'one', cost: 200, price: 250 },
];
const TIERS = [
  { name: 'Bueno', desc: 'Teja 3-tab, garantía de 25 años', shingle: 'shingle3tab', extras: [] },
  { name: 'Mejor', desc: 'Teja arquitectónica, garantía de 30 años y ventilación', shingle: 'shingleArch', extras: ['ridgevent'] },
  { name: 'Excelente', desc: 'Teja premium de diseñador, garantía de por vida', shingle: 'shinglePrem', extras: ['ridgevent'] },
];
const BASE_ITEMS = ['underlay', 'iw', 'starter', 'ridgecap', 'drip', 'nails', 'boots', 'flashing', 'tearoff', 'install', 'dumpster', 'permit'];

const DEFAULT_SETTINGS = {
  company: 'Techos Del Valle', phone: '(512) 555-0142', email: 'oficina@techosdelvalle.com', license: 'Lic. TX-48213',
  currency: 'USD', taxRate: 8.25, homeCenter: [30.2672, -97.7431],
  terms: 'Se requiere un depósito del 30% para programar el trabajo. El saldo se paga al terminar. Garantía de mano de obra de 5 años. Cualquier reparación de madera dañada se cobra aparte a $95 por hoja de triplay.',
  intro: 'Gracias por la oportunidad de visitar su propiedad. Abajo encontrará las medidas de su techo y tres opciones de reemplazo. Elija la que prefiera y firme para aprobar.',
  est: { tab: [380, 460], arch: [470, 620], prem: [720, 960], metal: [950, 1350] },
};

// ---------- estado ----------
const KEY = 'cumbrera-v1';
let state;
let clientMode = false, clientReply = null;
let route = { view: 'panel' };

function save() {
  if (clientMode) return;
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { toast('No se pudo guardar en este navegador (espacio lleno o bloqueado)'); }
}
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); if (s && s.jobs) return s; } } catch { }
  return null;
}
const cat = id => state.catalog.find(c => c.id === id);
const getJob = id => state.jobs.find(j => j.id === id);
function log(job, text) { job.activity = job.activity || []; job.activity.unshift({ t: new Date().toISOString(), text }); }
function setStage(job, stage, why) {
  if (job.stage === stage) return;
  job.stage = stage; log(job, why || `Movido a «${stageName(stage)}»`);
}
function newMeasurement() {
  return { mode: 'grid', facets: [], lines: [], defaultPitch: 6, penetrations: 3, waste: null, ftPerUnit: null, image: null, imgW: 0, imgH: 0, center: null, origin: null, zoom: 19 };
}

// ---------- matemáticas de medición ----------
const pitchFactor = p => Math.sqrt(1 + (p / 12) ** 2);
const hipFactor = p => Math.sqrt(1 + (p * p) / 288); // limatesa/limahoya a 45° en planta
function toFt(m, pt) {
  if (m.mode === 'sat') {
    const o = m.origin || m.center || pt;
    return [(pt[1] - o[1]) * Math.cos(o[0] * Math.PI / 180) * 111320 * 3.28084, (pt[0] - o[0]) * 110574 * 3.28084];
  }
  const k = m.mode === 'image' ? (m.ftPerUnit || 0) : 1;
  return [pt[1] * k, pt[0] * k];
}
function polyArea(m, pts) {
  const p = pts.map(q => toFt(m, q)); let a = 0;
  for (let i = 0; i < p.length; i++) { const j = (i + 1) % p.length; a += p[i][0] * p[j][1] - p[j][0] * p[i][1]; }
  return Math.abs(a) / 2;
}
function segLen(m, a, b) { const p = toFt(m, a), q = toFt(m, b); return Math.hypot(p[0] - q[0], p[1] - q[1]); }
function calc(m) {
  const r = { facets: [], plan: 0, area: 0, lines: {}, pitch: m?.defaultPitch ?? 6, squares: 0, ok: true, empty: true, penetrations: m?.penetrations || 0 };
  for (const t in LINE_TYPES) r.lines[t] = 0;
  if (!m) return r;
  if (m.mode === 'image' && !m.ftPerUnit) r.ok = false;
  const byPitch = {};
  m.facets.forEach((f, i) => {
    const plan = polyArea(m, f.pts), area = plan * pitchFactor(f.pitch);
    r.facets.push({ id: f.id, n: i + 1, pitch: f.pitch, plan, area });
    r.plan += plan; r.area += area; byPitch[f.pitch] = (byPitch[f.pitch] || 0) + area;
  });
  const pred = Object.entries(byPitch).sort((a, b) => b[1] - a[1])[0];
  if (pred) r.pitch = +pred[0];
  m.lines.forEach(l => {
    const L = segLen(m, l.a, l.b); let k = 1;
    if (l.type === 'rake' || l.type === 'step') k = pitchFactor(r.pitch);
    if (l.type === 'hip' || l.type === 'valley') k = hipFactor(r.pitch);
    r.lines[l.type] += L * k;
  });
  r.empty = !m.facets.length;
  r.squares = r.area / 100;
  r.suggestedWaste = (r.lines.hip + r.lines.valley > 0 || m.facets.length > 4) ? 15 : 10;
  r.wasteUsed = m.waste ?? r.suggestedWaste;
  r.wasteTable = [0, 5, 10, 12, 15, 17, 20].map(w => ({ w, area: r.area * (1 + w / 100), sq: Math.ceil(r.area * (1 + w / 100) / 100 * 3) / 3 }));
  return r;
}
function quantities(r, w) {
  const S = r.squares * (1 + w / 100), L = r.lines, has = r.area > 0;
  return {
    bundles: Math.ceil(S * 3), sqw: r2(Math.ceil(S * 3) / 3), sq: Math.ceil(r.squares * 10) / 10,
    underlay: has ? Math.ceil(S / 10) : 0, iw: Math.ceil((L.eave + L.valley) / 66), starter: Math.ceil((L.eave + L.rake) / 105),
    ridgecap: Math.ceil((L.ridge + L.hip) / 33), drip: Math.ceil((L.eave + L.rake) / 10), ridgevent: Math.ceil(L.ridge / 4),
    nails: has ? Math.ceil(S / 20) : 0, flash: Math.ceil((L.flash + L.step) / 10), penetrations: r.penetrations || 0, one: 1, manual: 1,
  };
}
// Clasifica aristas de facetas: compartidas = cumbrera/limatesa, perimetrales = alero/hastial
function autoLines(m) {
  const key = (a, b) => [a.join(','), b.join(',')].sort().join('|');
  const count = {}, seg = {};
  m.facets.forEach(f => f.pts.forEach((p, i) => { const q = f.pts[(i + 1) % f.pts.length]; const k = key(p, q); count[k] = (count[k] || 0) + 1; seg[k] = [p, q]; }));
  const boundary = new Set();
  for (const k in seg) if (count[k] === 1) seg[k].forEach(p => boundary.add(p.join(',')));
  const ridgeEnds = new Set(), out = [];
  for (const k in seg) {
    if (count[k] < 2) continue;
    const [a, b] = seg[k]; const ba = boundary.has(a.join(',')), bb = boundary.has(b.join(','));
    const type = ba === bb ? 'ridge' : 'hip';
    if (type === 'ridge') { ridgeEnds.add(a.join(',')); ridgeEnds.add(b.join(',')); }
    out.push({ k, a, b, type });
  }
  for (const k in seg) {
    if (count[k] !== 1) continue;
    const [a, b] = seg[k];
    const type = (ridgeEnds.has(a.join(',')) && boundary.has(a.join(','))) || (ridgeEnds.has(b.join(',')) && boundary.has(b.join(','))) ? 'rake' : 'eave';
    out.push({ k, a, b, type });
  }
  const existing = new Set(m.lines.map(l => key(l.a, l.b)));
  return out.filter(o => !existing.has(o.k)).map(o => ({ id: uid(), type: o.type, a: o.a.slice(), b: o.b.slice() }));
}

// ---------- propuestas, facturas, pedidos ----------
function lineFrom(c, q) {
  return { cid: c.id, name: c.name, unit: c.unit, kind: c.kind, qty: c.formula === 'manual' ? 1 : (q[c.formula] ?? 0), price: c.price, cost: c.cost };
}
function buildProposal(job, keep) {
  const r = calc(job.measurement); const q = quantities(r, r.wasteUsed ?? 10);
  const options = TIERS.map(t => ({
    name: tr(t.name), desc: tr(t.desc),
    lines: [t.shingle, ...BASE_ITEMS, ...t.extras].map(cat).filter(Boolean).map(c => lineFrom(c, q)).filter(l => l.qty > 0),
  }));
  const p = keep || {};
  return {
    options, taxRate: p.taxRate ?? state.settings.taxRate, discount: p.discount || 0, intro: p.intro ?? state.settings.intro,
    terms: p.terms ?? state.settings.terms, validUntil: p.validUntil || addDays(today(), 30), status: 'draft', created: today(), selected: null, signature: null,
  };
}
function optTotals(opt, p) {
  const sub = opt.lines.reduce((s, l) => s + (+l.qty || 0) * (+l.price || 0), 0);
  const cost = opt.lines.reduce((s, l) => s + (+l.qty || 0) * (+l.cost || 0), 0);
  const disc = Math.min(+p.discount || 0, sub); const base = sub - disc; const tax = base * (+p.taxRate || 0) / 100;
  return { sub, disc, tax, total: base + tax, cost, profit: base - cost, margin: base > 0 ? (base - cost) / base : 0 };
}
function jobValue(j) {
  if (j.invoice) return invTotals(j.invoice).total;
  const p = j.proposal; if (!p || !p.options.length) return j.estimate || 0;
  const i = p.selected ?? Math.min(1, p.options.length - 1);
  return optTotals(p.options[i], p).total;
}
function createInvoice(job) {
  const p = job.proposal; const i = p.selected ?? Math.min(1, p.options.length - 1); const opt = p.options[i];
  job.invoice = {
    number: 'F-' + (state.seq.invoice++), issued: today(), due: addDays(today(), 15), option: opt.name,
    lines: opt.lines.map(l => ({ name: l.name, unit: l.unit, qty: l.qty, price: l.price })), taxRate: p.taxRate, discount: p.discount, payments: [], depositPct: 30,
  };
  log(job, `Factura ${job.invoice.number} creada (${money(invTotals(job.invoice).total)})`);
}
function invTotals(inv) {
  const sub = inv.lines.reduce((s, l) => s + (+l.qty || 0) * (+l.price || 0), 0);
  const disc = Math.min(+inv.discount || 0, sub); const tax = (sub - disc) * (+inv.taxRate || 0) / 100; const total = sub - disc + tax;
  const paid = inv.payments.reduce((s, p) => s + (+p.amount || 0), 0); const balance = r2(total - paid);
  let status = 'Emitida', cls = 'info';
  if (balance <= 0.004 && total > 0) { status = 'Pagada'; cls = 'ok'; }
  else if (paid > 0) { status = 'Pago parcial'; cls = 'warn'; }
  else if (inv.due < today()) { status = 'Vencida'; cls = 'bad'; }
  return { sub, disc, tax, total, paid, balance, status, cls };
}
function createOrder(job) {
  const p = job.proposal; const i = p.selected ?? Math.min(1, p.options.length - 1);
  job.order = {
    number: 'P-' + (state.seq.order++), supplier: 'ABC Supply – Austin', delivery: addDays(today(), 5), status: 'Borrador', notes: tr('Entregar en la entrada. Llamar 30 min antes.'),
    items: p.options[i].lines.filter(l => l.kind === 'material').map(l => ({ name: l.name, unit: l.unit, qty: l.qty })),
  };
  log(job, `Pedido de material ${job.order.number} creado`);
}

// ---------- datos de ejemplo ----------
function rectGable(w, d, pitch) { // techo a dos aguas, cumbrera a lo largo de x
  const h = d / 2; const P = (x, y) => [y, x];
  return { facets: [{ id: uid(), pitch, pts: [P(0, 0), P(w, 0), P(w, h), P(0, h)] }, { id: uid(), pitch, pts: [P(0, h), P(w, h), P(w, d), P(0, d)] }] };
}
function rectHip(w, d, pitch) {
  const h = d / 2; const P = (x, y) => [y, x];
  const a = P(0, 0), b = P(w, 0), c = P(w, d), e = P(0, d), r1 = P(h, h), r2_ = P(w - h, h);
  return { facets: [
    { id: uid(), pitch, pts: [a, b, r2_, r1] }, { id: uid(), pitch, pts: [r2_, c, e, r1].reverse() },
    { id: uid(), pitch, pts: [e, a, r1] }, { id: uid(), pitch, pts: [b, c, r2_] },
  ] };
}
function seedMeasurement(shape, pen) {
  const m = newMeasurement(); m.facets = shape.facets; m.penetrations = pen; m.lines = autoLines(m); return m;
}
function seedState() {
  state = { jobs: [], catalog: JSON.parse(JSON.stringify(DEFAULT_CATALOG)), settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), seq: { invoice: 1001, order: 501 }, hideExampleNote: false };
  const ago = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); };
  const mk = (o) => ({ id: uid(), example: true, phone: '', email: '', notes: '', source: 'Referido', activity: [], measurement: null, proposal: null, invoice: null, order: null, ...o });

  const j1 = mk({ name: 'María González', phone: '(512) 555-0187', email: 'maria.g@example.com', address: '1420 Oak Ridge Dr, Austin, TX 78745', stage: 'propuesta', source: 'Google', created: ago(9), notes: 'Granizo en abril. Quiere cambiar a teja arquitectónica color carbón.' });
  j1.measurement = seedMeasurement(rectHip(52, 34, 6), 4);
  j1.proposal = buildProposal(j1); j1.proposal.status = 'sent'; j1.proposal.sentOn = ago(2).slice(0, 10);
  j1.activity = [{ t: ago(2), text: 'Propuesta enviada al cliente' }, { t: ago(4), text: 'Medición terminada: techo a cuatro aguas' }, { t: ago(9), text: 'Prospecto creado desde Google' }];

  const j2 = mk({ name: 'Carlos Ramírez', phone: '(512) 555-0110', email: 'cramirez@example.com', address: '88 Mesa Verde Ln, Round Rock, TX 78664', stage: 'aprobado', source: 'Estimador web', created: ago(16) });
  j2.measurement = seedMeasurement(rectGable(44, 30, 8), 3);
  j2.proposal = buildProposal(j2); j2.proposal.status = 'signed'; j2.proposal.selected = 1;
  j2.proposal.signature = { name: 'Carlos Ramírez', date: ago(1).slice(0, 10), img: null };
  j2.activity = [{ t: ago(1), text: 'Propuesta firmada: opción «Mejor»' }, { t: ago(5), text: 'Propuesta enviada al cliente' }, { t: ago(16), text: 'Prospecto creado desde el estimador web' }];

  const j3 = mk({ name: 'Familia Hernández', phone: '(737) 555-0133', email: 'hernandez.casa@example.com', address: '5021 Cedar Bend, Pflugerville, TX 78660', stage: 'facturado', created: ago(40) });
  j3.measurement = seedMeasurement(rectGable(38, 26, 5), 2);
  j3.proposal = buildProposal(j3); j3.proposal.status = 'signed'; j3.proposal.selected = 1; j3.proposal.signature = { name: 'Rosa Hernández', date: ago(25).slice(0, 10), img: null };
  createInvoice(j3); j3.invoice.issued = ago(6).slice(0, 10); j3.invoice.due = addDays(j3.invoice.issued, 15);
  j3.invoice.payments.push({ id: uid(), date: ago(20).slice(0, 10), amount: r2(invTotals(j3.invoice).total * 0.3), method: 'Cheque' });
  createOrder(j3); j3.order.status = 'Entregado';
  j3.activity = [{ t: ago(6), text: `Factura ${j3.invoice.number} enviada` }, { t: ago(20), text: 'Depósito recibido (cheque)' }, { t: ago(25), text: 'Propuesta firmada: opción «Mejor»' }];

  const j4 = mk({ name: 'Laura Méndez', phone: '(512) 555-0199', email: 'laura.mendez@example.com', address: '702 Willow Creek Rd, Cedar Park, TX 78613', stage: 'lead', source: 'Estimador web', created: ago(0), estimate: 14800, notes: 'Estimación instantánea: casa de 1,900 ft², pendiente media, teja arquitectónica. Rango $12,600 – $16,600.' });
  j4.activity = [{ t: ago(0), text: 'Prospecto creado desde el estimador web' }];
  const j5 = mk({ name: 'Iglesia Bautista Central', phone: '(512) 555-0122', email: 'admin@ibcentral.example.org', address: '300 E 6th St, Austin, TX 78701', stage: 'inspeccion', source: 'Referido', created: ago(3), notes: 'Goteras en el salón social. Inspección programada el jueves 9:00.' });
  j5.activity = [{ t: ago(3), text: 'Inspección programada' }];
  const j6 = mk({ name: 'Pedro Salas', phone: '(512) 555-0164', email: 'psalas@example.com', address: '1180 Brushy Creek Rd, Leander, TX 78641', stage: 'pagado', created: ago(70) });
  j6.measurement = seedMeasurement(rectGable(34, 24, 6), 2);
  j6.proposal = buildProposal(j6); j6.proposal.status = 'signed'; j6.proposal.selected = 0; j6.proposal.signature = { name: 'Pedro Salas', date: ago(50).slice(0, 10), img: null };
  createInvoice(j6); j6.invoice.issued = ago(30).slice(0, 10); j6.invoice.payments.push({ id: uid(), date: ago(28).slice(0, 10), amount: invTotals(j6.invoice).total, method: 'Transferencia' });
  j6.activity = [{ t: ago(28), text: 'Factura pagada por completo' }];
  const j7 = mk({ name: 'Jorge Castillo', phone: '(512) 555-0151', email: 'jcastillo@example.com', address: '45 Pecan St, Georgetown, TX 78626', stage: 'produccion', created: ago(21) });
  j7.measurement = seedMeasurement(rectHip(40, 32, 7), 3);
  j7.proposal = buildProposal(j7); j7.proposal.status = 'signed'; j7.proposal.selected = 2; j7.proposal.signature = { name: 'Jorge Castillo', date: ago(8).slice(0, 10), img: null };
  createOrder(j7); j7.order.status = 'Enviado';
  j7.activity = [{ t: ago(3), text: 'Instalación programada para el lunes' }, { t: ago(8), text: 'Propuesta firmada: opción «Excelente»' }];
  state.jobs.push(j4, j5, j1, j2, j7, j3, j6);
  state.jobs.forEach(j => j.created = j.created || new Date().toISOString());
}

// ---------- iconos ----------
const I = {
  panel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
  jobs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="5" height="16"/><rect x="10" y="4" width="5" height="10"/><rect x="17" y="4" width="4" height="13"/></svg>',
  est: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 15h4M12 13v4"/></svg>',
  cat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
  set: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14"/></svg>',
  logo: '<svg width="30" height="30" viewBox="0 0 32 32"><path d="M2 18 16 6l14 12" fill="none" stroke="var(--accent)" stroke-width="3.2" stroke-linejoin="round"/><path d="M7 17v10h18V17" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 27v-6h8v6" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
};

// ---------- shell ----------
const NAV = [
  { v: 'panel', name: 'Panel', icon: I.panel },
  { v: 'trabajos', name: 'Trabajos', icon: I.jobs },
  { v: 'estimador', name: 'Estimador web', icon: I.est },
  { v: 'catalogo', name: 'Catálogo de precios', icon: I.cat },
  { v: 'ajustes', name: 'Ajustes', icon: I.set },
];
function renderNav() {
  const cur = route.view === 'job' || route.view === 'cliente' ? 'trabajos' : route.view;
  $('#nav').innerHTML = NAV.map(n => `<button data-act="go" data-v="${n.v}" aria-current="${cur === n.v}" title="${n.name}">${n.icon}<span>${n.name}</span></button>`).join('');
  $('#brandName').textContent = 'SmartRoof';
  $('#brandCo').textContent = state.settings.company;
}
function go(r) {
  if (route.view === 'job' && route.tab === 'medicion' && !(r.view === 'job' && r.id === route.id && r.tab === 'medicion')) destroyMap();
  route = r;
  let h = r.view;
  if (r.view === 'job') h = `t-${r.id}-${r.tab || 'resumen'}`;
  if (r.view === 'cliente') h = `c-${r.id}`;
  try { if (location.hash !== '#' + h) history.replaceState(null, '', '#' + h); } catch { }
  render();
  window.scrollTo(0, 0);
}
function parseHash() {
  const h = (location.hash || '').slice(1);
  let m;
  if ((m = h.match(/^t-([a-z0-9]+)-([a-z]+)$/)) && getJob(m[1])) return { view: 'job', id: m[1], tab: m[2] };
  if ((m = h.match(/^c-([a-z0-9]+)$/)) && getJob(m[1])) return { view: 'cliente', id: m[1] };
  if (NAV.some(n => n.v === h)) return { view: h };
  return { view: 'panel' };
}
function render() {
  renderNav();
  const main = $('#main');
  const V = { panel: viewPanel, trabajos: viewPipeline, estimador: viewEstimator, catalogo: viewCatalog, ajustes: viewSettings, job: viewJob, cliente: viewClient };
  const job = route.id && getJob(route.id);
  if ((route.view === 'job' || route.view === 'cliente') && !job) route = { view: 'trabajos' };
  main.innerHTML = (V[route.view] || viewPanel)();
  if (route.view === 'job' && route.tab === 'medicion') initMap();
  if (route.view === 'cliente') initSigPad();
}

const stagePill = s => { const st = STAGES.find(x => x.id === s); return `<span class="pill"><i class="dot" style="background:${st?.color}"></i>${esc(st?.name || s)}</span>`; };
const exampleNote = () => (state.jobs.some(j => j.example) && !state.hideExampleNote) ? `<div class="banner"><p><b>Datos de ejemplo.</b> Los trabajos marcados como «ejemplo» sirven para explorar la app. Puedes borrarlos cuando quieras.</p><button class="btn sm" data-act="delExamples">Borrar ejemplos</button><button class="btn sm ghost" data-act="hideNote">Ocultar aviso</button></div>` : '';

// ---------- Panel ----------
function viewPanel() {
  const jobs = state.jobs;
  const open = jobs.filter(j => OPEN_STAGES.includes(j.stage));
  const pipelineVal = open.reduce((s, j) => s + jobValue(j), 0);
  const won = jobs.filter(j => ['aprobado', 'produccion', 'facturado', 'pagado'].includes(j.stage));
  const wonVal = won.reduce((s, j) => s + jobValue(j), 0);
  const receivable = jobs.filter(j => j.invoice).reduce((s, j) => s + Math.max(0, invTotals(j.invoice).balance), 0);
  const decided = won.length + jobs.filter(j => j.stage === 'perdido').length;
  const close = decided ? won.length / decided : 0;
  const byStage = STAGES.filter(s => s.id !== 'perdido').map(s => { const js = jobs.filter(j => j.stage === s.id); return { s, n: js.length, v: js.reduce((a, j) => a + jobValue(j), 0) }; });
  const maxV = Math.max(1, ...byStage.map(b => b.v));
  const todo = [];
  jobs.forEach(j => {
    if (j.stage === 'lead' && !j.measurement?.facets?.length) todo.push({ j, t: 'Medir el techo', tab: 'medicion' });
    else if (j.measurement?.facets?.length && !j.proposal && !['perdido'].includes(j.stage)) todo.push({ j, t: 'Preparar propuesta', tab: 'propuesta' });
    if (j.proposal?.status === 'draft' && j.proposal.options.length) todo.push({ j, t: 'Enviar propuesta', tab: 'propuesta' });
    if (j.proposal?.status === 'signed' && !j.invoice) todo.push({ j, t: 'Crear factura de depósito', tab: 'factura' });
    if (j.proposal?.status === 'signed' && !j.order && j.stage !== 'pagado') todo.push({ j, t: 'Pedir materiales', tab: 'pedido' });
    if (j.invoice) { const it = invTotals(j.invoice); if (it.balance > 0 && it.status === 'Vencida') todo.push({ j, t: `Cobrar saldo vencido de ${money(it.balance)}`, tab: 'factura' }); else if (it.balance > 0) todo.push({ j, t: `Cobrar saldo de ${money(it.balance)}`, tab: 'factura' }); }
  });
  const acts = jobs.flatMap(j => (j.activity || []).map(a => ({ ...a, j }))).sort((a, b) => b.t.localeCompare(a.t)).slice(0, 8);
  return `
  <div class="pagehead"><div><h1>Panel</h1><p class="sub">${esc(state.settings.company)} · ${fmtDate(today())}</p></div>
    <button class="btn primary" data-act="newJob">${I.plus} Nuevo trabajo</button></div>
  ${exampleNote()}
  <div class="kpis">
    <div class="kpi"><span class="label">Embudo abierto</span><span class="v">${money(pipelineVal)}</span><span class="small muted">${open.length} trabajos sin cerrar</span></div>
    <div class="kpi"><span class="label">Ventas ganadas</span><span class="v">${money(wonVal)}</span><span class="small muted">${won.length} trabajos aprobados o más</span></div>
    <div class="kpi"><span class="label">Por cobrar</span><span class="v">${money(receivable)}</span><span class="small muted">saldo de facturas</span></div>
    <div class="kpi"><span class="label">Tasa de cierre</span><span class="v">${num(close * 100)}%</span><span class="small muted">${won.length} de ${decided} decididos</span></div>
  </div>
  <div class="two">
    <div class="panel"><div class="panel-head"><h3>Valor por etapa</h3><button class="btn sm ghost" data-act="go" data-v="trabajos">Ver tablero</button></div>
      <div class="bars">${byStage.map(b => `<div class="bar"><span>${esc(b.s.name)} <span class="muted mono">${b.n}</span></span><div class="track"><div class="fill" style="width:${(b.v / maxV * 100).toFixed(1)}%"></div></div><span class="n">${money(b.v)}</span></div>`).join('')}</div>
    </div>
    <div class="panel"><h3>Siguientes pasos</h3>
      ${todo.length ? `<div class="stack" style="gap:6px;margin-top:10px">${todo.slice(0, 8).map(t => `<button class="card" data-act="open" data-id="${t.j.id}" data-tab="${t.tab}"><span class="t">${esc(t.t)}</span><span class="a">${esc(t.j.name)} · ${esc(t.j.address || '')}</span></button>`).join('')}</div>` : '<p class="muted" style="margin-top:8px">Todo al día.</p>'}
    </div>
  </div>
  <div class="panel"><h3>Actividad reciente</h3><div class="activity" style="margin-top:10px">${acts.map(a => `<div><time>${fmtDate(a.t)}</time><span><a href="#" data-act="open" data-id="${a.j.id}">${esc(a.j.name)}</a>: ${esc(a.text)}</span></div>`).join('') || '<p class="muted">Sin actividad todavía.</p>'}</div></div>`;
}

// ---------- Tablero (CRM) ----------
let filter = '';
function viewPipeline() {
  const q = filter.toLowerCase();
  const jobs = state.jobs.filter(j => !q || [j.name, j.address, j.email, j.phone].join(' ').toLowerCase().includes(q));
  return `
  <div class="pagehead"><div><h1>Trabajos</h1><p class="sub">Arrastra una tarjeta para cambiarla de etapa.</p></div>
    <div class="row"><input id="jobSearch" type="search" placeholder="Buscar cliente o dirección" value="${esc(filter)}" style="width:240px" data-inp="search"><button class="btn primary" data-act="newJob">${I.plus} Nuevo trabajo</button></div></div>
  ${exampleNote()}
  <div class="board">${STAGES.map(s => {
    const js = jobs.filter(j => j.stage === s.id);
    return `<section class="col" data-stage="${s.id}"><div class="col-head"><b>${esc(s.name)}</b><span>${js.length} · ${money(js.reduce((a, j) => a + jobValue(j), 0))}</span></div>
      ${js.map(j => `<div class="card" draggable="true" tabindex="0" data-act="open" data-id="${j.id}">
        <span class="t">${esc(j.name)}</span><span class="a">${esc(j.address || 'Sin dirección')}</span>
        <div class="b"><span class="row" style="gap:4px">${j.example ? '<span class="pill">ejemplo</span>' : ''}${j.measurement?.facets?.length ? `<span class="pill acc">${num(calc(j.measurement).squares, 1)} sq</span>` : ''}${j.proposal?.status === 'signed' ? '<span class="pill ok">Firmada</span>' : ''}</span><span class="val">${jobValue(j) ? money(jobValue(j)) : ''}</span></div></div>`).join('')}
    </section>`;
  }).join('')}</div>`;
}

// ---------- Detalle del trabajo ----------
const TABS = [['resumen', 'Resumen'], ['medicion', 'Medición'], ['informe', 'Informe'], ['propuesta', 'Propuesta'], ['factura', 'Factura'], ['pedido', 'Pedido de material']];
function viewJob() {
  const j = getJob(route.id); const tab = route.tab || 'resumen';
  const body = { resumen: tabSummary, medicion: tabMeasure, informe: tabReport, propuesta: tabProposal, factura: tabInvoice, pedido: tabOrder }[tab] || tabSummary;
  return `
  <div class="jobhead"><div class="stack" style="gap:6px"><button class="btn sm ghost" data-act="go" data-v="trabajos" style="align-self:flex-start">← Trabajos</button>
    <h1>${esc(j.name)} ${j.example ? '<span class="pill">ejemplo</span>' : ''}</h1><p class="muted">${esc(j.address || 'Sin dirección')}</p></div>
    <div class="row"><label class="field"><span>Etapa</span><select data-chg="stage">${STAGES.map(s => `<option value="${s.id}" ${s.id === j.stage ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label>
    <div class="kpi" style="padding:8px 14px"><span class="label">Valor</span><span class="v" style="font-size:1.3rem">${money(jobValue(j))}</span></div></div></div>
  <nav class="tabs" role="tablist">${TABS.map(([k, n]) => `<button role="tab" aria-selected="${k === tab}" data-act="tab" data-tab="${k}">${n}</button>`).join('')}</nav>
  ${body(j)}`;
}
function tabSummary(j) {
  const m = j.measurement, r = m ? calc(m) : null;
  const steps = [
    { n: 'Medir', done: !!m?.facets?.length, info: r && !r.empty ? `${num(r.area)} ft² · ${num(r.squares, 1)} sq` : 'Dibuja el techo', tab: 'medicion' },
    { n: 'Proponer', done: j.proposal && j.proposal.status !== 'draft', info: j.proposal ? (j.proposal.status === 'draft' ? 'Borrador' : 'Enviada') : 'Genera opciones', tab: 'propuesta' },
    { n: 'Firmar', done: j.proposal?.status === 'signed', info: j.proposal?.signature ? `${esc(j.proposal.signature.name)}` : 'Firma del cliente', tab: 'propuesta' },
    { n: 'Facturar', done: !!j.invoice, info: j.invoice ? j.invoice.number : 'Crea la factura', tab: 'factura' },
    { n: 'Cobrar', done: j.invoice && invTotals(j.invoice).balance <= 0, info: j.invoice ? `Saldo ${money(invTotals(j.invoice).balance)}` : '—', tab: 'factura' },
  ];
  const nowIdx = steps.findIndex(s => !s.done);
  return `
  <div class="steps">${steps.map((s, i) => `<button class="step ${s.done ? 'done' : ''} ${i === nowIdx ? 'now' : ''}" data-act="tab" data-tab="${s.tab}" style="text-align:left;font:inherit;color:inherit;cursor:pointer"><span class="k">PASO ${i + 1}${s.done ? ' · LISTO' : ''}</span><b>${s.n}</b><span class="small muted">${s.info}</span></button>`).join('')}</div>
  <div class="two">
    <div class="panel"><h3>Cliente</h3>
      <div class="grid2" style="margin-top:12px">
        <label class="field"><span>Nombre</span><input id="f-name" data-chg="jobField" data-k="name" value="${esc(j.name)}"></label>
        <label class="field"><span>Origen</span><select id="f-source" data-chg="jobField" data-k="source">${['Referido', 'Google', 'Estimador web', 'Facebook', 'Puerta a puerta', 'Aseguradora', 'Otro'].map(o => `<option ${o === j.source ? 'selected' : ''}>${o}</option>`).join('')}</select></label>
        <label class="field"><span>Teléfono</span><input id="f-phone" data-chg="jobField" data-k="phone" value="${esc(j.phone)}"></label>
        <label class="field"><span>Correo</span><input id="f-email" data-chg="jobField" data-k="email" value="${esc(j.email)}"></label>
      </div>
      <label class="field" style="margin-top:12px"><span>Dirección de la propiedad</span><input id="f-address" data-chg="jobField" data-k="address" value="${esc(j.address)}"></label>
      <label class="field" style="margin-top:12px"><span>Notas</span><textarea id="f-notes" data-chg="jobField" data-k="notes">${esc(j.notes)}</textarea></label>
      <div class="row" style="margin-top:12px"><span class="small muted">Creado ${fmtDate(j.created)}</span><span class="spacer"></span><button class="btn sm danger" data-act="delJob">Eliminar trabajo</button></div>
    </div>
    <div class="panel"><h3>Actividad</h3>
      <form class="row" data-form="note" style="margin-top:10px"><input id="noteText" name="t" placeholder="Agregar nota o llamada" style="flex:1"><button class="btn sm">Agregar</button></form>
      <div class="activity" style="margin-top:12px">${(j.activity || []).map(a => `<div><time>${fmtDate(a.t)}</time><span>${esc(a.text)}</span></div>`).join('') || '<p class="muted">Sin actividad.</p>'}</div>
    </div>
  </div>`;
}

// ---------- Medición (mapa) ----------
let map = null, shapes = null, rubber = null;
const M = { tool: 'select', lineType: 'eave', draft: [], sel: null, hist: [], calib: null };
const meas = () => getJob(route.id).measurement;

function tabMeasure(j) {
  if (!j.measurement) { j.measurement = newMeasurement(); if (!inFrame && j.address) j.measurement.mode = 'sat'; save(); }
  M.tool = j.measurement.facets.length ? 'select' : 'facet'; M.draft = []; M.sel = null; M.hist = []; M.calib = null;
  return `<div class="measure"><div class="stack" style="min-width:0"><div class="mapbox"><div id="map"></div><div class="hud" id="hud">Listo</div><div class="mapnote" id="satNote" hidden></div></div><section class="panel" id="svbox" hidden></section></div>
    <aside class="panel stack" id="mpanel"></aside></div>`;
}
function destroyMap() { if (map) { map.remove(); map = null; } }
function tok(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'; }

function makeGrid() {
  const G = L.GridLayer.extend({
    createTile(c) {
      const t = document.createElement('canvas'); const s = this.getTileSize(); t.width = s.x; t.height = s.y;
      const ctx = t.getContext('2d'); const sc = Math.pow(2, c.z);
      const steps = [0.5, 1, 2, 5, 10, 20, 50, 100, 200]; const minor = steps.find(v => v * sc >= 10) || 200; const major = minor * 5;
      const x0 = c.x * s.x / sc, x1 = x0 + s.x / sc, y0 = -c.y * s.y / sc, y1 = y0 - s.y / sc;
      const g = tok('--grid'), gs = tok('--grid-strong');
      for (let x = Math.ceil(x0 / minor) * minor; x <= x1; x += minor) { ctx.strokeStyle = Math.abs(x / major - Math.round(x / major)) < 1e-6 ? gs : g; ctx.beginPath(); const px = Math.round((x - x0) * sc) + .5; ctx.moveTo(px, 0); ctx.lineTo(px, s.y); ctx.stroke(); }
      for (let y = Math.floor(y0 / minor) * minor; y >= y1; y -= minor) { ctx.strokeStyle = Math.abs(y / major - Math.round(y / major)) < 1e-6 ? gs : g; ctx.beginPath(); const py = Math.round((y0 - y) * sc) + .5; ctx.moveTo(0, py); ctx.lineTo(s.x, py); ctx.stroke(); }
      return t;
    },
  });
  return new G();
}
function initMap() {
  const m = meas(); destroyMap();
  const el = $('#map');
  if (!window.L) { el.innerHTML = '<div class="empty"><b>No se pudo cargar el mapa.</b><span>Revisa tu conexión a internet y recarga la página.</span></div>'; updatePanel(); return; }
  if (m.mode === 'sat') {
    const needGeo = !m.center; if (!m.center) m.center = state.settings.homeCenter.slice();
    if (needGeo && getJob(route.id).address) setTimeout(() => geocode(getJob(route.id).address).then(ll => ll && centerOn(ll)), 0);
    map = L.map(el, { doubleClickZoom: false, maxZoom: 22 }).setView(m.center, m.zoom || 19);
    const tl = satLayer(state.settings.satSource || (state.settings.googleKey ? 'google' : 'esri')).addTo(map);
    el.classList.toggle('enhance', state.settings.satEnhance === true);
    let good = 0, bad = 0;
    tl.on('tileload', () => { good++; $('#satNote') && ($('#satNote').hidden = true); });
    tl.on('tileerror', () => { if (++bad >= 2 && !good) showSatNote(); });
    map.on('moveend', () => { m.zoom = map.getZoom(); const c = map.getCenter(); m.center = [c.lat, c.lng]; save(); });
  } else {
    map = L.map(el, { crs: L.CRS.Simple, doubleClickZoom: false, minZoom: -4, maxZoom: 6, zoomSnap: 0.25, attributionControl: false });
    if (m.mode === 'image' && m.image) { const b = [[0, 0], [m.imgH, m.imgW]]; L.imageOverlay(m.image, b).addTo(map); map.fitBounds(b); }
    else if (m.mode === 'image') map.setView([0, 0], 0);
    else { makeGrid().addTo(map); map.setView([16, 26], 3); }
  }
  shapes = L.layerGroup().addTo(map);
  rubber = L.polyline([], { color: tok('--ink'), weight: 2, dashArray: '6 6', interactive: false }).addTo(map);
  map.on('click', onMapClick); map.on('mousemove', onMapMove);
  drawShapes(); fitShapes(); updatePanel();
  setTimeout(() => map && map.invalidateSize(), 60);
}
function showSatNote() {
  const n = $('#satNote'); if (!n) return;
  n.hidden = false;
  n.innerHTML = `<b>Las imágenes satelitales no cargan aquí.</b> ${inFrame ? 'Esta vista previa bloquea mapas externos. Abre el archivo <span class="mono">index.html</span> directamente en tu navegador para usar el satélite, o' : 'Revisa tu conexión, o'} cambia a <b>Imagen</b> y sube una captura satelital del techo (con su barra de escala) para medir sobre ella.`;
}
function allVerts() { const m = meas(); const v = []; m.facets.forEach(f => v.push(...f.pts)); m.lines.forEach(l => v.push(l.a, l.b)); v.push(...M.draft); return v; }
function snapPt(ll) {
  const p = map.latLngToContainerPoint(ll); let best = null, bd = 12;
  for (const v of allVerts()) { const d = p.distanceTo(map.latLngToContainerPoint(v)); if (d < bd) { bd = d; best = v; } }
  if (best) return [best[0], best[1]];
  const m = meas();
  if (m.mode === 'grid') { const g = map.getZoom() >= 3 ? 0.5 : 1; return [Math.round(ll.lat / g) * g, Math.round(ll.lng / g) * g]; }
  return [ll.lat, ll.lng];
}
const samePt = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];
function pushHist() { const m = meas(); M.hist.push(JSON.stringify({ f: m.facets, l: m.lines })); if (M.hist.length > 60) M.hist.shift(); }
function commit() { save(); drawShapes(); updatePanel(); }
function onMapClick(e) {
  const m = meas();
  if (M.tool === 'select') { if (M.sel) { M.sel = null; drawShapes(); updatePanel(); } return; }
  const pt = snapPt(e.latlng);
  if (m.mode === 'sat' && !m.origin) m.origin = pt.slice();
  if (M.tool === 'facet') {
    if (M.draft.length >= 3 && samePt(pt, M.draft[0])) return closeFacet();
    if (M.draft.length && samePt(pt, M.draft[M.draft.length - 1])) return;
    M.draft.push(pt);
  } else if (M.tool === 'line') {
    if (!M.draft.length) M.draft.push(pt);
    else if (!samePt(pt, M.draft[0])) { pushHist(); m.lines.push({ id: uid(), type: M.lineType, a: M.draft[0], b: pt }); M.draft = [pt]; commit(); }
  } else if (M.tool === 'calib') {
    M.draft.push(pt);
    if (M.draft.length === 2) { M.calib = M.draft.slice(); M.draft = []; updatePanel(); setTimeout(() => $('#calibLen')?.focus(), 30); }
  }
  drawShapes(); hud();
}
function closeFacet() {
  const m = meas(); if (M.draft.length < 3) return;
  pushHist(); m.facets.push({ id: uid(), pts: M.draft, pitch: m.defaultPitch }); M.draft = []; rubber.setLatLngs([]);
  commit(); hud('Faceta cerrada. Dibuja la siguiente o usa «Líneas desde facetas».');
}
function onMapMove(e) {
  if (!M.draft.length || M.tool === 'select') { rubber.setLatLngs([]); return; }
  const last = M.draft[M.draft.length - 1]; const pt = snapPt(e.latlng);
  rubber.setLatLngs([last, pt]);
  const m = meas();
  if (m.mode === 'image' && !m.ftPerUnit && M.tool !== 'calib') hud('Calibra la escala para ver medidas');
  else if (M.tool === 'calib') hud(`${num(Math.hypot(pt[0] - last[0], pt[1] - last[1]))} px`);
  else hud(`Segmento: ${num(segLen(m, last, pt), 1)} ft${M.tool === 'facet' && M.draft.length >= 3 ? ' · clic en el primer punto o Enter para cerrar' : ''}`);
}
function hud(t) {
  const h = $('#hud'); if (!h) return;
  if (t) { h.textContent = t; return; }
  h.textContent = { select: 'Toca una faceta o línea para editarla', facet: M.draft.length ? `${M.draft.length} puntos · Enter para cerrar · Esc para cancelar` : 'Haz clic en cada esquina de la faceta', line: M.draft.length ? 'Clic para terminar la línea · Esc para soltar' : `Dibujando: ${LINE_TYPES[M.lineType].name}`, calib: 'Marca dos puntos de una distancia conocida' }[M.tool];
}
function drawShapes() {
  if (!map) return;
  const m = meas(); const r = calc(m); shapes.clearLayers();
  $('#map').classList.toggle('drawing', M.tool !== 'select');
  const acc = tok('--accent'), ink = tok('--ink'), bub = M.tool !== 'select';
  m.facets.forEach((f, i) => {
    const sel = M.sel?.id === f.id;
    const poly = L.polygon(f.pts, { color: ink, weight: sel ? 3 : 1.2, fillColor: acc, fillOpacity: sel ? .5 : .25, bubblingMouseEvents: bub }).addTo(shapes);
    poly.on('click', () => { if (M.tool !== 'select') return; M.sel = { kind: 'facet', id: f.id }; drawShapes(); updatePanel(); });
    const rf = r.facets[i];
    poly.bindTooltip(`F${i + 1} · ${f.pitch}/12${r.ok ? `<br>${num(rf.area)} ft²` : ''}`, { permanent: true, direction: 'center', className: 'facet-tip', interactive: false });
  });
  m.lines.forEach(l => {
    const sel = M.sel?.id === l.id;
    const pl = L.polyline([l.a, l.b], { color: LINE_TYPES[l.type].color, weight: sel ? 8 : 4, opacity: .95, bubblingMouseEvents: bub }).addTo(shapes);
    pl.on('click', () => { if (M.tool !== 'select') return; M.sel = { kind: 'line', id: l.id }; drawShapes(); updatePanel(); });
    if (sel && r.ok) pl.bindTooltip(`${LINE_TYPES[l.type].name}: ${num(segLen(m, l.a, l.b), 1)} ft`, { permanent: true, className: 'facet-tip' });
  });
  allVerts().forEach(v => L.circleMarker(v, { radius: 3, color: ink, weight: 1, fillColor: tok('--surface'), fillOpacity: 1, interactive: false }).addTo(shapes));
  if (M.draft.length) {
    L.polyline(M.draft, { color: acc, weight: 3, interactive: false }).addTo(shapes);
    if (M.tool === 'facet' && M.draft.length >= 3) L.circleMarker(M.draft[0], { radius: 8, color: acc, weight: 3, fill: false, interactive: false }).addTo(shapes);
  }
  if (M.calib) L.polyline(M.calib, { color: tok('--info'), weight: 3, dashArray: '4 4', interactive: false }).addTo(shapes);
  hud();
}
function fitShapes() {
  const v = meas().facets.flatMap(f => f.pts).concat(meas().lines.flatMap(l => [l.a, l.b]));
  if (v.length > 1 && meas().mode !== 'image') map.fitBounds(L.latLngBounds(v), { padding: [40, 40], maxZoom: meas().mode === 'sat' ? 21 : 5 });
}
function setTool(t) { M.tool = t; M.draft = []; if (rubber) rubber.setLatLngs([]); if (t !== 'calib') M.calib = null; if (t !== 'select') M.sel = null; drawShapes(); updatePanel(); }

function updatePanel() {
  const el = $('#mpanel'); if (!el) return;
  const j = getJob(route.id), m = j.measurement, r = calc(m);
  const selF = M.sel?.kind === 'facet' && m.facets.find(f => f.id === M.sel.id);
  const selL = M.sel?.kind === 'line' && m.lines.find(l => l.id === M.sel.id);
  const tools = [['select', 'Seleccionar', 'V'], ['facet', 'Faceta', 'F'], ['line', 'Línea', 'L']];
  if (m.mode === 'image') tools.push(['calib', 'Calibrar escala', 'C']);
  const chips = cur => Object.entries(LINE_TYPES).map(([k, t]) => `<button class="chip" data-act="lineType" data-k="${k}" aria-pressed="${cur === k}"><i class="dot" style="background:${t.color}"></i>${t.name} <span class="muted mono">${t.key}</span></button>`).join('');
  el.innerHTML = `
    <div class="stack" style="gap:6px"><span class="label">Fuente del dibujo</span>
      <div class="seg">${[['grid', 'Plano'], ['image', 'Imagen'], ['sat', 'Satélite']].map(([k, n]) => `<button data-act="mode" data-k="${k}" aria-pressed="${m.mode === k}">${n}</button>`).join('')}</div>
      ${m.mode === 'grid' ? '<p class="small muted">Cuadrícula en pies. Dibuja con las medidas de la inspección.</p>' : ''}
      ${m.mode === 'image' ? `<label class="btn sm" style="align-self:flex-start">Subir foto aérea o captura<input id="imgFile" type="file" accept="image/*" data-chg="image" hidden></label>
        ${m.image ? (m.ftPerUnit ? `<p class="small muted">Escala: 1 px = ${num(m.ftPerUnit, 3)} ft</p>` : '<p class="small" style="color:var(--warn)">Falta calibrar la escala: usa «Calibrar escala» sobre la barra de escala o una medida conocida.</p>') : '<p class="small muted">Sube una captura satelital (Google Maps, Nearmap, EagleView) o foto de dron.</p>'}` : ''}
      ${m.mode === 'sat' ? `<form class="row" data-form="geo"><input id="geoQ" name="q" placeholder="Dirección o lat, lng" value="${esc(j.address || '')}" style="flex:1"><button class="btn sm">Ir</button></form><button class="btn sm" data-act="myLoc" style="align-self:flex-start">Usar mi ubicación (en la obra)</button>
      <label class="field"><span>Imagen satelital</span><select id="satSrc" data-chg="satSrc">${Object.entries(SAT_SOURCES).map(([k, v]) => `<option value="${k}" ${k === (state.settings.satSource || (state.settings.googleKey ? 'google' : 'esri')) ? 'selected' : ''}>${v.name}</option>`).join('')}</select></label>
      <label class="row small" style="gap:6px"><input type="checkbox" id="satEnh" data-chg="satEnh" ${state.settings.satEnhance === true ? 'checked' : ''}> Realzar contraste y brillo</label>
      <p class="small muted">Si una imagen se ve borrosa o vieja, prueba otra fuente.</p>` : ''}
    </div>
    <button class="btn" data-act="streetView" style="align-self:flex-start">Ver Street View</button>
    <div class="stack" style="gap:6px"><span class="label">Herramienta</span>
      <div class="tools">${tools.map(([k, n, key]) => `<button class="tool" data-act="tool" data-k="${k}" aria-pressed="${M.tool === k}">${n}<kbd>${key}</kbd></button>`).join('')}</div>
      ${M.tool === 'line' ? `<div class="chips">${chips(M.lineType)}</div>` : ''}
      ${M.tool === 'calib' && M.calib ? `<form class="row" data-form="calib"><input id="calibLen" name="len" type="number" step="0.1" min="0.1" placeholder="Distancia real" style="width:130px"><span>ft</span><button class="btn sm primary">Aplicar</button></form>` : ''}
      <div class="row"><button class="btn sm" data-act="undo" ${M.hist.length || M.draft.length ? '' : 'disabled'}>Deshacer</button>
        <button class="btn sm" data-act="autoLines" ${m.facets.length ? '' : 'disabled'}>Líneas desde facetas</button>
        ${M.tool === 'facet' && M.draft.length >= 3 ? '<button class="btn sm primary" data-act="closeFacet">Cerrar faceta</button>' : ''}</div>
    </div>
    ${selF ? `<div class="stack" style="gap:6px;border-top:1px solid var(--line);padding-top:12px"><span class="label">Faceta F${m.facets.indexOf(selF) + 1}</span>
      <label class="field"><span>Pendiente</span><select id="selPitch" data-chg="facetPitch">${PITCHES.map(p => `<option value="${p}" ${p === selF.pitch ? 'selected' : ''}>${p}/12</option>`).join('')}</select></label>
      <p class="small muted">${r.ok ? `Planta ${num(polyArea(m, selF.pts))} ft² × ${num(pitchFactor(selF.pitch), 3)} = <b>${num(polyArea(m, selF.pts) * pitchFactor(selF.pitch))} ft²</b>` : ''}</p>
      <div class="row"><button class="btn sm" data-act="pitchAll">Aplicar a todas</button><button class="btn sm danger" data-act="delSel">Eliminar faceta</button></div></div>` : ''}
    ${selL ? `<div class="stack" style="gap:6px;border-top:1px solid var(--line);padding-top:12px"><span class="label">Línea seleccionada</span>
      <div class="chips">${chips(selL.type)}</div><div class="row"><button class="btn sm danger" data-act="delSel">Eliminar línea</button></div></div>` : ''}
    <div class="grid2" style="gap:8px">
      <label class="field"><span>Pendiente nueva</span><select id="defPitch" data-chg="defPitch">${PITCHES.map(p => `<option value="${p}" ${p === m.defaultPitch ? 'selected' : ''}>${p}/12</option>`).join('')}</select></label>
      <label class="field"><span>Penetraciones</span><input id="pens" type="number" min="0" value="${m.penetrations}" data-chg="pens"></label>
      <label class="field"><span>Desperdicio</span><select id="waste" data-chg="waste"><option value="">Sugerido (${r.suggestedWaste}%)</option>${[0, 5, 10, 12, 15, 17, 20].map(w => `<option value="${w}" ${m.waste === w ? 'selected' : ''}>${w}%</option>`).join('')}</select></label>
    </div>
    <div style="border-top:1px solid var(--line);padding-top:12px" class="stack">
      <div class="mstats"><span>Área total del techo</span><span class="n big">${r.ok ? num(r.area) : '—'} <span class="small">ft²</span></span>
        <span>Cuadros (sq)</span><span class="n">${r.ok ? num(r.squares, 2) : '—'}</span>
        <span>Con ${r.wasteUsed}% desperdicio</span><span class="n">${r.ok ? num(r.squares * (1 + r.wasteUsed / 100), 2) : '—'}</span>
        <span>Pendiente predominante</span><span class="n">${r.pitch}/12</span>
        <span>Facetas</span><span class="n">${m.facets.length}</span>
        ${Object.entries(LINE_TYPES).map(([k, t]) => `<span><i class="dot" style="background:${t.color}"></i> ${t.name}</span><span class="n">${r.ok ? num(r.lines[k]) : '—'} ft</span>`).join('')}
      </div>
      <div class="row"><button class="btn primary" data-act="tab" data-tab="informe">Ver informe</button><button class="btn" data-act="tab" data-tab="propuesta">Propuesta →</button>
        <button class="btn sm ghost danger" data-act="clearDrawing" ${m.facets.length || m.lines.length ? '' : 'disabled'}>Borrar dibujo</button></div>
    </div>`;
}
function setMode(k) {
  const m = meas(); if (m.mode === k) return;
  m.mode = k; m.facets = []; m.lines = []; m.origin = null; M.hist = [];
  if (k !== 'image') { m.image = null; m.ftPerUnit = null; }
  save(); M.tool = k === 'image' ? 'select' : 'facet'; initMap();
}
function loadImage(file) {
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1800 / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      const m = meas(); m.image = c.toDataURL('image/jpeg', .82); m.imgW = c.width; m.imgH = c.height; m.ftPerUnit = null; m.facets = []; m.lines = [];
      save(); M.tool = 'calib'; initMap(); toast('Imagen cargada. Ahora calibra la escala.');
    };
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
}

// Busca la dirección: primero el geocodificador de Esri, luego OpenStreetMap
async function geocode(q) {
  hud('Buscando la propiedad…');
  try {
    const r = await fetch('https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&maxLocations=1&SingleLine=' + encodeURIComponent(q));
    const d = await r.json(); const c = d.candidates && d.candidates[0];
    if (c) return [c.location.y, c.location.x];
  } catch { }
  try {
    const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q));
    const d = await r.json(); if (d[0]) return [+d[0].lat, +d[0].lon];
    toast('No encontré esa dirección. Prueba con ciudad y código postal.'); return null;
  } catch { }
  toast(inFrame ? 'La búsqueda de direcciones no funciona en esta vista previa.' : 'No se pudo buscar la dirección. Revisa tu conexión o escribe lat, lng.');
  hud(); return null;
}
async function showStreetView() {
  const j = J(), m = meas(), box = $('#svbox'); if (!box) return;
  let ll = m.addrLL || null;
  if (!ll && j.address) ll = await geocode(j.address);
  if (!ll && m.mode === 'sat' && map) { const c = map.getCenter(); ll = [c.lat, c.lng]; }
  if (!ll) { toast('Escribe la dirección del trabajo para ver Street View'); return; }
  m.addrLL = ll; save(); hud();
  const key = state.settings.googleKey, at = `${ll[0].toFixed(6)},${ll[1].toFixed(6)}`;
  const ext = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${at}`;
  box.hidden = false;
  box.innerHTML = `<div class="panel-head"><h3>Street View</h3><div class="row"><a class="btn sm" href="${ext}" target="_blank" rel="noopener">Abrir en Google Maps</a><button class="btn sm ghost" data-act="svClose">Cerrar</button></div></div>`
    + (key && !inFrame
      ? `<iframe class="sv" src="https://www.google.com/maps/embed/v1/streetview?key=${encodeURIComponent(key)}&location=${at}&fov=80&language=${state.settings.lang === 'en' ? 'en' : 'es'}" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Street View de ${esc(j.address || 'la propiedad')}"></iframe>
         <p class="small muted" style="margin-top:6px">Arrastra para girar la vista. Si aparece un error, activa «Maps Embed API» en tu proyecto de Google Cloud.</p>`
      : `<p class="muted">${inFrame ? 'Street View no se puede mostrar en esta vista previa.' : 'Para verlo aquí, agrega tu llave de Google en Ajustes.'} Mientras, usa «Abrir en Google Maps».</p>`);
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function centerOn(ll) {
  const m = meas(); if (!m) return;
  m.center = ll; m.addrLL = ll; m.zoom = 19; if (!m.facets.length && !m.lines.length) m.origin = null; save();
  if (map && m.mode === 'sat') { map.setView(ll, 19); hud(); }
}

// Fuentes de imagen satelital (sin llave de API)
const SAT_SOURCES = {
  esri: { name: 'Esri (recomendada)', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', native: 19, attr: 'Imágenes © Esri, Maxar' },
  clarity: { name: 'Esri Clarity', url: 'https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', native: 19, attr: 'Imágenes © Esri, Maxar, Vexcel' },
  bing: { name: 'Bing', native: 19, attr: 'Imágenes © Microsoft' },
  google: { name: 'Google (requiere llave)', native: 21, attr: 'Imágenes © Google' },
};
function satLayer(k) {
  const s = SAT_SOURCES[k] || SAT_SOURCES.esri;
  const opts = { maxZoom: 22, maxNativeZoom: s.native, attribution: s.attr, detectRetina: false };
  if (k === 'google') {
    const key = state.settings.googleKey;
    const G = L.TileLayer.extend({
      createTile(c, done) {
        const img = document.createElement('img'); img.alt = '';
        googleSession().then(sess => { img.src = `https://tile.googleapis.com/v1/2dtiles/${c.z}/${c.x}/${c.y}?session=${sess}&key=${encodeURIComponent(key)}`; })
          .catch(() => done(new Error('google'), img));
        img.onload = () => done(null, img); img.onerror = () => done(new Error('tile'), img);
        return img;
      },
    });
    if (!key) { setTimeout(() => toast('Agrega tu llave de Google Maps en Ajustes'), 300); return L.tileLayer(SAT_SOURCES.esri.url, { maxZoom: 22, maxNativeZoom: 19 }); }
    return new G('', opts);
  }
  if (k === 'bing') {
    const B = L.TileLayer.extend({
      getTileUrl(c) {
        let q = ''; for (let i = c.z; i > 0; i--) { let d = 0; const m = 1 << (i - 1); if (c.x & m) d++; if (c.y & m) d += 2; q += d; }
        return `https://ecn.t${(c.x + c.y) % 4}.tiles.virtualearth.net/tiles/a${q}.jpeg?g=14000`;
      },
    });
    return new B('', opts);
  }
  return L.tileLayer(s.url, opts);
}

let gSess = null;
function googleSession() {
  const key = state.settings.googleKey;
  if (gSess && gSess.key === key && gSess.exp > Date.now()) return gSess.p;
  const p = fetch('https://tile.googleapis.com/v1/createSession?key=' + encodeURIComponent(key), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mapType: 'satellite', language: loc(), region: 'MX', scale: 'scaleFactor2x', highDpi: true }) })
    .then(r => r.json()).then(d => { if (!d.session) { toast('Google rechazó la llave: ' + (d.error?.message || 'revisa que «Map Tiles API» esté activada')); throw new Error('no session'); } return d.session; });
  gSess = { key, p, exp: Date.now() + 12 * 3600e3 }; p.catch(() => { gSess = null; });
  return p;
}

// Logo de la empresa: encabezado y marca de agua en documentos
const logoImg = () => state.settings.logo ? `<img class="doc-logo" src="${state.settings.logo}" alt="${esc(state.settings.company)}">` : '';
const wmark = () => state.settings.logo && state.settings.wmOn !== false ? `<img class="wm" src="${state.settings.logo}" alt="" aria-hidden="true" style="opacity:${(state.settings.wmOpacity ?? 8) / 100}">` : '';
function loadLogo(file) {
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 700 / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      state.settings.logo = c.toDataURL('image/png'); save(); toast('Logo guardado'); render();
    };
    img.onerror = () => toast('No se pudo leer esa imagen. Usa PNG o JPG.');
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
}

// ---------- Informe ----------
function diagramSVG(m, opts = {}) {
  if (!m || !m.facets.length && !m.lines.length) return '<div class="empty">Sin dibujo todavía.</div>';
  if (m.mode === 'image' && !m.ftPerUnit) return '<div class="empty">Falta calibrar la escala de la imagen.</div>';
  const pts = m.facets.flatMap(f => f.pts).concat(m.lines.flatMap(l => [l.a, l.b])).map(p => toFt(m, p));
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const W = 640, H = 400, pad = 36; const s = Math.min((W - 2 * pad) / Math.max(1, maxX - minX), (H - 2 * pad) / Math.max(1, maxY - minY));
  const ox = (W - (maxX - minX) * s) / 2, oy = (H - (maxY - minY) * s) / 2;
  const X = p => { const f = toFt(m, p); return [(ox + (f[0] - minX) * s).toFixed(1), (oy + (maxY - f[1]) * s).toFixed(1)]; };
  const r = calc(m);
  let out = `<svg class="diagram" viewBox="0 0 ${W} ${H}" role="img" aria-label="Diagrama del techo">`;
  m.facets.forEach((f, i) => {
    const P = f.pts.map(X); out += `<polygon class="fc" points="${P.map(p => p.join(',')).join(' ')}"/>`;
    const cx = P.reduce((a, p) => a + +p[0], 0) / P.length, cy = P.reduce((a, p) => a + +p[1], 0) / P.length;
    out += `<text class="lbl" x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle">F${i + 1}</text><text class="lbl" x="${cx.toFixed(1)}" y="${(cy + 16).toFixed(1)}" text-anchor="middle">${f.pitch}/12${opts.areas ? ' · ' + num(r.facets[i].area) : ''}</text>`;
  });
  m.lines.forEach(l => {
    const a = X(l.a), b = X(l.b);
    out += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${LINE_TYPES[l.type].color}" stroke-width="3.5" stroke-linecap="round"/>`;
    if (opts.lengths !== false) out += `<text class="lbl" x="${((+a[0] + +b[0]) / 2).toFixed(1)}" y="${((+a[1] + +b[1]) / 2 - 4).toFixed(1)}" text-anchor="middle">${num(segLen(m, l.a, l.b))}'</text>`;
  });
  return out + '</svg>';
}
const legend = () => `<div class="legend">${Object.values(LINE_TYPES).map(t => `<span><i style="background:${t.color}"></i>${t.name}</span>`).join('')}</div>`;
function tabReport(j) {
  const m = j.measurement;
  if (!m || !m.facets.length) return `<div class="panel empty"><b>Todavía no hay medición.</b><span>Dibuja las facetas del techo para generar el informe.</span><button class="btn primary" data-act="tab" data-tab="medicion">Ir a Medición</button></div>`;
  const r = calc(m); const q = quantities(r, r.wasteUsed);
  return `<div class="row">${!inFrame ? '<button class="btn" data-act="print">Imprimir / PDF</button>' : ''}<button class="btn" data-act="tab" data-tab="medicion">Editar medición</button><button class="btn primary" data-act="tab" data-tab="propuesta">Crear propuesta →</button></div>
  <article class="doc">${wmark()}
    <div class="doc-head"><div><span class="label">Informe de medición</span><h1>${esc(j.address || j.name)}</h1><p class="muted">Preparado para ${esc(j.name)} · ${fmtDate(today())}</p></div>
      <div style="text-align:right">${logoImg()}<b>${esc(state.settings.company)}</b><p class="small muted">${esc(state.settings.phone)}<br>${esc(state.settings.license)}</p></div></div>
    <div class="doc-tiles"><div><span class="label">Área total</span><b>${num(r.area)} ft²</b><span class="small muted">${num(r.area * 0.092903, 1)} m²</span></div>
      <div><span class="label">Cuadros</span><b>${num(r.squares, 2)}</b><span class="small muted">1 sq = 100 ft²</span></div>
      <div><span class="label">Pendiente predominante</span><b>${r.pitch}/12</b><span class="small muted">${num(Math.atan(r.pitch / 12) * 180 / Math.PI, 1)}°</span></div>
      <div><span class="label">Facetas</span><b>${m.facets.length}</b><span class="small muted">Desperdicio sugerido ${r.suggestedWaste}%</span></div></div>
    <div>${diagramSVG(m)}${legend()}</div>
    <div class="grid2">
      <div><h3>Longitudes</h3><div class="tablewrap"><table><thead><tr><th>Tipo</th><th class="n">Pies</th><th class="n">Metros</th></tr></thead><tbody>
        ${Object.entries(LINE_TYPES).map(([k, t]) => `<tr><td><i class="dot" style="background:${t.color}"></i> ${t.name}</td><td class="n">${num(r.lines[k])}</td><td class="n">${num(r.lines[k] * 0.3048, 1)}</td></tr>`).join('')}
        <tr><td>Aleros + hastiales (gotero)</td><td class="n">${num(r.lines.eave + r.lines.rake)}</td><td class="n">${num((r.lines.eave + r.lines.rake) * 0.3048, 1)}</td></tr>
        <tr><td>Cumbreras + limatesas (caballete)</td><td class="n">${num(r.lines.ridge + r.lines.hip)}</td><td class="n">${num((r.lines.ridge + r.lines.hip) * 0.3048, 1)}</td></tr></tbody></table></div>
        <p class="small muted" style="margin-top:6px">Hastiales y limatesas/limahoyas ajustados por pendiente.</p></div>
      <div><h3>Facetas</h3><div class="tablewrap"><table><thead><tr><th>Faceta</th><th>Pendiente</th><th class="n">Planta ft²</th><th class="n">Real ft²</th></tr></thead><tbody>
        ${r.facets.map(f => `<tr><td>F${f.n}</td><td>${f.pitch}/12</td><td class="n">${num(f.plan)}</td><td class="n">${num(f.area)}</td></tr>`).join('')}
        <tr><td><b>Total</b></td><td></td><td class="n"><b>${num(r.plan)}</b></td><td class="n"><b>${num(r.area)}</b></td></tr></tbody></table></div></div>
    </div>
    <div><h3>Tabla de desperdicio</h3><div class="tablewrap"><table><thead><tr><th>Desperdicio</th>${r.wasteTable.map(w => `<th class="n">${w.w}%</th>`).join('')}</tr></thead><tbody>
      <tr><td>Área ft²</td>${r.wasteTable.map(w => `<td class="n" ${w.w === r.suggestedWaste ? 'style="background:var(--accent-soft);font-weight:600"' : ''}>${num(w.area)}</td>`).join('')}</tr>
      <tr><td>Cuadros</td>${r.wasteTable.map(w => `<td class="n" ${w.w === r.suggestedWaste ? 'style="background:var(--accent-soft);font-weight:600"' : ''}>${num(w.sq, 2)}</td>`).join('')}</tr></tbody></table></div></div>
    <div><h3>Materiales estimados (con ${r.wasteUsed}% de desperdicio)</h3><div class="tablewrap"><table><thead><tr><th>Material</th><th class="n">Cantidad</th><th>Base del cálculo</th></tr></thead><tbody>
      ${[['Teja (paquetes)', q.bundles, FORMULAS.bundles], ['Membrana sintética (rollos)', q.underlay, FORMULAS.underlay], ['Hielo y agua (rollos)', q.iw, FORMULAS.iw], ['Teja de arranque (paquetes)', q.starter, FORMULAS.starter], ['Caballete (paquetes)', q.ridgecap, FORMULAS.ridgecap], ['Gotero (piezas de 10 ft)', q.drip, FORMULAS.drip], ['Ventila de cumbrera (piezas)', q.ridgevent, FORMULAS.ridgevent], ['Clavos (cajas)', q.nails, FORMULAS.nails], ['Botas para tubería', q.penetrations, FORMULAS.penetrations]].map(x => `<tr><td>${x[0]}</td><td class="n">${num(x[1])}</td><td class="small muted">${x[2]}</td></tr>`).join('')}</tbody></table></div></div>
  </article>`;
}

// ---------- Propuesta ----------
let optIdx = 1;
function tabProposal(j) {
  const p = j.proposal;
  if (!p) {
    const has = j.measurement?.facets?.length;
    return `<div class="panel empty"><b>Genera la propuesta en un clic.</b><span>${has ? 'Usaremos la medición y tu catálogo de precios para armar tres opciones: Bueno, Mejor y Excelente.' : 'Primero mide el techo, o crea la propuesta vacía y agrega partidas a mano.'}</span>
      <div class="row" style="justify-content:center"><button class="btn primary" data-act="genProposal">Generar propuesta</button>${!has ? '<button class="btn" data-act="tab" data-tab="medicion">Medir el techo</button>' : ''}</div></div>`;
  }
  optIdx = Math.min(optIdx, p.options.length - 1);
  const o = p.options[optIdx]; const t = optTotals(o, p); const locked = p.status === 'signed';
  const statusPill = { draft: '<span class="pill">Borrador</span>', sent: '<span class="pill warn">Enviada · esperando firma</span>', signed: `<span class="pill ok">Firmada por ${esc(p.signature?.name)} el ${fmtDate(p.signature?.date)}</span>` }[p.status];
  return `
  <div class="row">${statusPill}<span class="spacer"></span>
    ${!locked ? '<button class="btn" data-act="regenProposal">Recalcular desde medición</button>' : ''}
    <button class="btn" data-act="clientView">Vista del cliente</button>
    ${!locked ? '<button class="btn primary" data-act="shareProposal">Enviar al cliente</button>' : ''}
    ${p.status === 'draft' ? '<button class="btn" data-act="sendProposal">Marcar como enviada</button>' : ''}
    ${locked ? '<button class="btn primary" data-act="tab" data-tab="factura">Ir a factura →</button>' : ''}</div>
  ${locked ? '<p class="small muted">La propuesta está firmada. Para cambiar partidas, hazlo en la factura.</p>' : ''}
  <div class="panel">
    <div class="panel-head"><div class="seg">${p.options.map((op, i) => `<button data-act="opt" data-i="${i}" aria-pressed="${i === optIdx}">${esc(op.name)}${p.selected === i ? ' ✓' : ''}</button>`).join('')}</div>
      ${!locked ? `<div class="row"><button class="btn sm" data-act="addOption">Agregar opción</button>${p.options.length > 1 ? '<button class="btn sm danger" data-act="delOption">Quitar opción</button>' : ''}</div>` : ''}</div>
    <div class="grid2" style="margin-bottom:12px"><label class="field"><span>Nombre de la opción</span><input id="optName" data-chg="optName" value="${esc(o.name)}" ${locked ? 'disabled' : ''}></label>
      <label class="field"><span>Descripción</span><input id="optDesc" data-chg="optDesc" value="${esc(o.desc || '')}" ${locked ? 'disabled' : ''}></label></div>
    <div class="tablewrap"><table><thead><tr><th>Partida</th><th class="n">Cant.</th><th>Unidad</th><th class="n">Precio</th><th class="n">Importe</th><th class="n">Margen</th><th></th></tr></thead><tbody>
      ${o.lines.map((l, i) => `<tr><td style="min-width:200px"><input id="ln-${i}" data-chg="line" data-i="${i}" data-k="name" value="${esc(l.name)}" ${locked ? 'disabled' : ''}></td>
        <td class="n"><input class="qty" id="lq-${i}" type="number" step="any" data-chg="line" data-i="${i}" data-k="qty" value="${l.qty}" ${locked ? 'disabled' : ''}></td><td>${esc(l.unit)}</td>
        <td class="n"><input class="pr" id="lp-${i}" type="number" step="any" data-chg="line" data-i="${i}" data-k="price" value="${l.price}" ${locked ? 'disabled' : ''}></td>
        <td class="n">${money(l.qty * l.price)}</td><td class="n small muted">${l.price ? num((1 - (l.cost || 0) / l.price) * 100) + '%' : '—'}</td>
        <td>${!locked ? `<button class="btn sm ghost" data-act="delLine" data-i="${i}" aria-label="Quitar partida">✕</button>` : ''}</td></tr>`).join('')}
    </tbody></table></div>
    ${!locked ? `<div class="row" style="margin-top:10px"><select id="addCat" style="max-width:320px"><option value="">Agregar del catálogo…</option>${state.catalog.map(c => `<option value="${c.id}">${esc(c.name)} · ${money(c.price)}/${esc(c.unit)}</option>`).join('')}</select><button class="btn sm" data-act="addLine">Agregar</button><button class="btn sm ghost" data-act="addCustom">Partida libre</button></div>` : ''}
    <div class="totals"><span>Subtotal</span><span class="n">${money(t.sub)}</span>
      <span>Descuento</span><span class="n">−${money(t.disc)}</span><span>Impuesto (${num(p.taxRate, 2)}%)</span><span class="n">${money(t.tax)}</span>
      <span class="grand">Total</span><span class="n grand">${money(t.total)}</span>
      <span class="small muted">Costo estimado / ganancia</span><span class="n small muted">${money(t.cost)} / ${money(t.profit)} (${num(t.margin * 100)}%)</span></div>
  </div>
  <div class="panel"><h3>Condiciones</h3>
    <div class="grid3" style="margin-top:12px"><label class="field"><span>Impuesto %</span><input id="pTax" type="number" step="0.01" data-chg="prop" data-k="taxRate" value="${p.taxRate}" ${locked ? 'disabled' : ''}></label>
      <label class="field"><span>Descuento (${esc(state.settings.currency)})</span><input id="pDisc" type="number" step="1" data-chg="prop" data-k="discount" value="${p.discount}" ${locked ? 'disabled' : ''}></label>
      <label class="field"><span>Válida hasta</span><input id="pValid" type="date" data-chg="prop" data-k="validUntil" value="${p.validUntil}" ${locked ? 'disabled' : ''}></label></div>
    <label class="field" style="margin-top:12px"><span>Mensaje para el cliente</span><textarea id="pIntro" data-chg="prop" data-k="intro" ${locked ? 'disabled' : ''}>${esc(p.intro)}</textarea></label>
    <label class="field" style="margin-top:12px"><span>Términos</span><textarea id="pTerms" data-chg="prop" data-k="terms" ${locked ? 'disabled' : ''}>${esc(p.terms)}</textarea></label>
    ${!locked ? '<div class="row" style="margin-top:12px"><span class="spacer"></span><button class="btn sm danger" data-act="delProposal">Eliminar propuesta</button></div>' : ''}
  </div>`;
}

// ---------- Vista del cliente (firma) ----------
let clientSel = null;
function viewClient() {
  const j = getJob(route.id), p = j.proposal, s = state.settings, m = j.measurement, r = m ? calc(m) : null;
  if (!p) { route = { view: 'job', id: j.id, tab: 'propuesta' }; return viewJob(); }
  if (clientSel == null || clientSel >= p.options.length) clientSel = p.selected ?? Math.min(1, p.options.length - 1);
  const signed = p.status === 'signed';
  return `${clientMode ? '' : `<div class="row"><button class="btn sm ghost" data-act="tab" data-tab="propuesta" data-id="${j.id}">← Volver al editor</button><span class="small muted">Así verá tu cliente la propuesta. Puede elegir opción y firmar aquí mismo, o envíale el enlace para que lo haga desde su teléfono.</span><span class="spacer"></span><button class="btn sm primary" data-act="shareProposal">Enviar al cliente</button></div>`}
  <article class="doc">${wmark()}
    <div class="doc-head"><div><span class="label">Propuesta de techo</span><h1>${esc(j.name)}</h1><p class="muted">${esc(j.address)}</p></div>
      <div style="text-align:right">${logoImg()}<b>${esc(s.company)}</b><p class="small muted">${esc(s.phone)}<br>${esc(s.email)}<br>${esc(s.license)}</p></div></div>
    <p>${esc(p.intro)}</p>
    ${r && !r.empty && r.ok ? `<div class="grid2" style="align-items:center"><div>${diagramSVG(m, { lengths: false })}</div>
      <div class="mstats"><span>Área del techo</span><span class="n">${num(r.area)} ft²</span><span>Cuadros</span><span class="n">${num(r.squares, 1)}</span><span>Pendiente</span><span class="n">${r.pitch}/12</span><span>Facetas</span><span class="n">${m.facets.length}</span><span>Aleros</span><span class="n">${num(r.lines.eave)} ft</span><span>Cumbreras y limatesas</span><span class="n">${num(r.lines.ridge + r.lines.hip)} ft</span></div></div>` : ''}
    <div><h3>Elija su opción</h3><div class="options" style="margin-top:10px">${p.options.map((o, i) => { const t = optTotals(o, p); return `
      <div class="opt ${i === clientSel ? 'on' : ''}" ${signed ? '' : `data-act="clientOpt" data-i="${i}" role="button" tabindex="0"`}>
        <div class="row"><b style="font-size:1.05rem">${esc(o.name)}</b>${signed && p.selected === i ? '<span class="stamp">Elegida</span>' : ''}</div>
        <span class="price">${money(t.total)}</span><span class="small" style="color:#5a6573">${esc(o.desc || '')}</span>
        <ul>${o.lines.slice(0, 7).map(l => `<li>${esc(l.name)}</li>`).join('')}${o.lines.length > 7 ? `<li>y ${o.lines.length - 7} partidas más</li>` : ''}</ul></div>`; }).join('')}</div></div>
    <div><h3>Términos</h3><p class="small" style="margin-top:6px;color:#5a6573">${esc(p.terms)}</p><p class="small" style="margin-top:6px;color:#5a6573">Propuesta válida hasta ${fmtDate(p.validUntil)}. Impuesto ${num(p.taxRate, 2)}% incluido en los totales.</p></div>
    ${signed ? `<div class="stack"><span class="stamp" style="align-self:flex-start">✓ Aprobada</span>
        <div style="max-width:340px">${p.signature.img ? `<img class="sigimg" src="${p.signature.img}" alt="Firma de ${esc(p.signature.name)}">` : `<div class="signame">${esc(p.signature.name)}</div>`}<div class="sigline">${esc(p.signature.name)} · ${fmtDate(p.signature.date)} · Opción «${esc(p.options[p.selected]?.name)}»</div></div></div>`
      : `<form class="stack" data-form="sign"><h3>Aceptación</h3>
        <p class="small" style="color:#5a6573">Al firmar, acepto la opción «<b>${esc(p.options[clientSel].name)}</b>» por <b>${money(optTotals(p.options[clientSel], p).total)}</b> y los términos de arriba.</p>
        <canvas class="sigpad" id="sigpad" aria-label="Área de firma"></canvas>
        <div class="row"><input id="signName" name="name" placeholder="Nombre completo" value="${esc(j.name)}" required style="flex:1;min-width:180px;background:#fff;color:#111821;border-color:#c8ced6"><button type="button" class="btn sm" data-act="clearSig">Borrar firma</button><button class="btn primary">Aceptar y firmar</button></div></form>`}
  </article>${clientMode && signed ? replyBox(s) : ''}`;
}
let sig = { drawn: false };
function initSigPad() {
  const c = $('#sigpad'); if (!c) return;
  const ratio = window.devicePixelRatio || 1; const rect = c.getBoundingClientRect();
  c.width = rect.width * ratio; c.height = rect.height * ratio;
  const ctx = c.getContext('2d'); ctx.scale(ratio, ratio); ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#111821';
  sig = { drawn: false, c };
  let down = false, last = null;
  const pos = e => { const b = c.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  c.addEventListener('pointerdown', e => { down = true; last = pos(e); c.setPointerCapture(e.pointerId); });
  c.addEventListener('pointermove', e => { if (!down) return; const p = pos(e); ctx.beginPath(); ctx.moveTo(...last); ctx.lineTo(...p); ctx.stroke(); last = p; sig.drawn = true; });
  const up = () => { down = false; }; c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
}

// ---------- Enviar al cliente por enlace ----------
// La propuesta viaja comprimida dentro del enlace (#p=…). El cliente elige, firma y devuelve otro enlace (#f=…) que la app del techador importa.
const APP_URL = 'https://sinaloa69522-cmd.github.io/SmartRoof/';
const appBase = () => (/^https?:$/.test(location.protocol) && !inFrame) ? location.origin + location.pathname : APP_URL;
const b64u = u8 => { let b = ''; for (let i = 0; i < u8.length; i += 0x8000) b += String.fromCharCode(...u8.subarray(i, i + 0x8000)); return btoa(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64u = s => { const b = atob(s.replace(/-/g, '+').replace(/_/g, '/')); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
async function pack(obj) {
  const raw = new TextEncoder().encode(JSON.stringify(obj));
  if (!window.CompressionStream) return 'j' + b64u(raw);
  const z = new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
  return 'z' + b64u(z);
}
async function unpack(s) {
  const u = unb64u(decodeURIComponent(s).slice(1));
  const raw = s[0] === 'z' ? new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()) : u;
  return JSON.parse(new TextDecoder().decode(raw));
}
function shrinkImg(src, maxW, maxH, type) {
  return new Promise(res => {
    if (!src) return res(null);
    const img = new Image(); img.onload = () => {
      const k = Math.min(1, maxW / img.width, maxH / img.height); const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL(type, 0.7));
    }; img.onerror = () => res(null); img.src = src;
  });
}
const optSum = p => p.options.map(o => Math.round(optTotals(o, p).total * 100) / 100);
async function proposalLink(j) {
  const s = state.settings, p = j.proposal;
  const data = {
    v: 1, id: j.id, name: j.name, address: j.address,
    co: { company: s.company, phone: s.phone, email: s.email, license: s.license, currency: s.currency, lang: s.lang || 'es', wmOn: s.wmOn, wmOpacity: s.wmOpacity, logo: await shrinkImg(s.logo, 240, 120, 'image/webp') },
    m: j.measurement ? { ...j.measurement, image: null } : null,
    p: { intro: p.intro, terms: p.terms, validUntil: p.validUntil, taxRate: p.taxRate, discount: p.discount, options: p.options.map(o => ({ name: o.name, desc: o.desc, lines: o.lines.map(l => ({ name: l.name, unit: l.unit, qty: l.qty, price: l.price })) })) },
  };
  return appBase() + '#p=' + await pack(data);
}
async function shareModal(j) {
  openModal(`<h2>Enviar al cliente</h2><p class="small muted">Generando el enlace…</p>`);
  let url; try { url = await proposalLink(j); } catch { closeModal(); toast('No se pudo crear el enlace'); return; }
  const p = j.proposal;
  if (p.status === 'draft') { p.status = 'sent'; p.sentOn = today(); log(j, 'Propuesta enviada al cliente'); if (OPEN_STAGES.includes(j.stage)) setStage(j, 'propuesta', 'Movido a «Propuesta enviada»'); save(); render(); }
  const msg = tr(`Hola ${j.name}, aquí está su propuesta de techo de ${state.settings.company}. Puede elegir su opción, aprobar y firmar desde este enlace:`);
  const subj = tr(`Propuesta de techo de ${state.settings.company}`);
  openModal(`<h2>Enviar al cliente</h2>
    <p class="small muted">Tu cliente abre este enlace en su teléfono o computadora, elige su opción, aprueba y firma. Al terminar, le aparece un botón para mandarte su firma de regreso. Cuando abras ese enlace aquí, la propuesta queda firmada sola.</p>
    <textarea id="shareLink" readonly rows="3" style="font-size:12px;word-break:break-all">${esc(url)}</textarea>
    <div class="row" style="flex-wrap:wrap">
      <a class="btn primary" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(msg + ' ' + url)}">WhatsApp</a>
      <a class="btn" href="sms:${encodeURIComponent((j.phone || '').replace(/[^\d+]/g, ''))}?&body=${encodeURIComponent(msg + ' ' + url)}">Mensaje de texto</a>
      <a class="btn" href="mailto:${encodeURIComponent(j.email || '')}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(msg + '\n\n' + url)}">Correo</a>
      <button class="btn" data-act="copyLink">Copiar enlace</button>
      ${navigator.share ? `<button class="btn" data-act="nativeShare" data-text="${esc(msg)}">Compartir…</button>` : ''}
      <span class="spacer"></span><button class="btn ghost" data-act="closeModal">Cerrar</button></div>`);
}
async function makeReply(j) {
  const p = j.proposal;
  try {
    const img = await shrinkImg(p.signature.img, 420, 140, 'image/png');
    clientReply = appBase() + '#f=' + await pack({ v: 1, id: j.id, sel: p.selected, opt: p.options[p.selected].name, total: optSum(p)[p.selected], name: p.signature.name, date: p.signature.date, img });
  } catch { clientReply = null; }
  render(); $('#replyBox')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function replyBox(s) {
  if (!clientReply) return `<div class="banner" style="margin-top:16px"><p><b>¡Gracias!</b> Preparando el envío de su firma…</p></div>`;
  const msg = tr(`Hola ${s.company}, ya elegí mi opción y firmé la propuesta. Aquí está mi firma:`);
  return `<div class="banner stack" id="replyBox" style="gap:10px;margin-top:16px;align-items:stretch"><p><b>¡Gracias! Último paso:</b> envíe su firma a ${esc(s.company)} con uno de estos botones.</p>
    <div class="row" style="flex-wrap:wrap">
      <a class="btn primary" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(msg + ' ' + clientReply)}">Enviar por WhatsApp</a>
      <a class="btn" href="mailto:${encodeURIComponent(s.email || '')}?subject=${encodeURIComponent(tr('Propuesta firmada'))}&body=${encodeURIComponent(msg + '\n\n' + clientReply)}">Enviar por correo</a>
      <a class="btn" href="sms:${encodeURIComponent((s.phone || '').replace(/[^\d+]/g, ''))}?&body=${encodeURIComponent(msg + ' ' + clientReply)}">Mensaje de texto</a>
      <button class="btn" data-act="copyReply">Copiar enlace</button>
      ${navigator.share ? `<button class="btn" data-act="nativeShare" data-which="reply" data-text="${esc(msg)}">Compartir…</button>` : ''}</div></div>`;
}
async function importReply(code) {
  history.replaceState(null, '', location.pathname + location.search);
  let d; try { d = await unpack(code); } catch { toast('El enlace de firma está incompleto o dañado'); return; }
  const j = getJob(d.id);
  if (!j || !j.proposal) { toast('No encontré ese trabajo en este dispositivo. Abre el enlace donde hiciste la propuesta.'); go({ view: 'panel' }); return; }
  const p = j.proposal;
  if (p.status === 'signed') { toast('Esta propuesta ya estaba firmada'); go({ view: 'job', id: j.id, tab: 'propuesta' }); return; }
  const sel = Math.min(d.sel ?? 0, p.options.length - 1);
  p.signature = { name: d.name, date: d.date || today(), img: d.img, remote: true }; p.selected = sel; p.status = 'signed';
  log(j, `Propuesta firmada por ${d.name} desde su teléfono: opción «${p.options[sel].name}» (${money(optTotals(p.options[sel], p).total)})`);
  const changed = Math.abs((optSum(p)[sel] || 0) - (d.total || 0)) > 0.01;
  if (changed) log(j, `Ojo: el cliente firmó un total de ${money(d.total)}; la propuesta cambió después de enviarla`);
  if (['lead', 'inspeccion', 'propuesta'].includes(j.stage)) setStage(j, 'aprobado');
  save(); go({ view: 'job', id: j.id, tab: 'propuesta' });
  toast(changed ? `Firmada por ${d.name}, pero el total cambió desde que la enviaste` : `¡Propuesta firmada por ${d.name}!`);
}
async function startClientMode(code) {
  clientMode = true; document.body.classList.add('clientmode');
  let d; try { d = await unpack(code); } catch { $('#main').innerHTML = '<div class="panel empty"><b>Este enlace está incompleto.</b><span>Pide a tu contratista que te lo envíe de nuevo.</span></div>'; return; }
  state = { settings: { ...DEFAULT_SETTINGS, ...d.co }, catalog: [], seq: { order: 1, invoice: 1 }, jobs: [{ id: d.id, name: d.name, address: d.address, stage: 'propuesta', activity: [], measurement: d.m, proposal: { ...d.p, status: 'sent', selected: null, signature: null }, invoice: null, order: null }] };
  route = { view: 'cliente', id: d.id };
  document.title = (d.co.company || 'SmartRoof') + ' · ' + (state.settings.lang === 'en' ? 'Proposal' : 'Propuesta');
  applyLang(); render();
}

// ---------- Factura ----------
function tabInvoice(j) {
  const inv = j.invoice;
  if (!inv) {
    const ok = j.proposal && j.proposal.options.length;
    return `<div class="panel empty"><b>Sin factura.</b><span>${ok ? (j.proposal.status === 'signed' ? `Se creará con la opción firmada «${esc(j.proposal.options[j.proposal.selected ?? 0].name)}».` : 'La propuesta aún no está firmada; se usará la opción «' + esc(j.proposal.options[Math.min(1, j.proposal.options.length - 1)].name) + '».') : 'Primero crea una propuesta.'}</span>
      ${ok ? '<button class="btn primary" data-act="createInvoice">Crear factura</button>' : '<button class="btn" data-act="tab" data-tab="propuesta">Ir a propuesta</button>'}</div>`;
  }
  const t = invTotals(inv); const s = state.settings; const dep = r2(t.total * inv.depositPct / 100);
  return `<div class="row"><span class="pill ${t.cls}">${t.status}</span><span class="spacer"></span>${!inFrame ? '<button class="btn" data-act="print">Imprimir / PDF</button>' : ''}<button class="btn" data-act="copyInvoice">Copiar resumen para enviar</button></div>
  <textarea id="copyFallback" hidden readonly style="width:100%;min-height:120px"></textarea>
  <div class="two">
  <article class="doc" style="max-width:none">${wmark()}
    <div class="doc-head"><div><span class="label">Factura</span><h1>${esc(inv.number)}</h1><p class="muted small">Emitida ${fmtDate(inv.issued)} · Vence ${fmtDate(inv.due)}</p></div>
      <div style="text-align:right">${logoImg()}<b>${esc(s.company)}</b><p class="small muted">${esc(s.phone)}<br>${esc(s.email)}</p></div></div>
    <div><span class="label">Facturar a</span><p><b>${esc(j.name)}</b><br>${esc(j.address)}<br>${esc(j.email)}</p></div>
    <div class="tablewrap"><table><thead><tr><th>Concepto</th><th class="n">Cant.</th><th class="n">Precio</th><th class="n">Importe</th><th></th></tr></thead><tbody>
      ${inv.lines.map((l, i) => `<tr><td><input id="il-${i}" data-chg="invLine" data-i="${i}" data-k="name" value="${esc(l.name)}" style="background:transparent;color:#111821;border-color:#dde2e8"></td><td class="n"><input class="qty" id="iq-${i}" type="number" step="any" data-chg="invLine" data-i="${i}" data-k="qty" value="${l.qty}" style="background:transparent;color:#111821;border-color:#dde2e8"></td>
        <td class="n"><input class="pr" id="ip-${i}" type="number" step="any" data-chg="invLine" data-i="${i}" data-k="price" value="${l.price}" style="background:transparent;color:#111821;border-color:#dde2e8"></td><td class="n">${money(l.qty * l.price)}</td><td><button class="btn sm ghost" data-act="delInvLine" data-i="${i}" aria-label="Quitar" style="color:#5a6573">✕</button></td></tr>`).join('')}
    </tbody></table></div>
    <div class="row"><button class="btn sm" data-act="addInvLine">Agregar concepto (cambio de obra)</button></div>
    <div class="totals"><span>Subtotal</span><span class="n">${money(t.sub)}</span>${t.disc ? `<span>Descuento</span><span class="n">−${money(t.disc)}</span>` : ''}
      <span>Impuesto (${num(inv.taxRate, 2)}%)</span><span class="n">${money(t.tax)}</span><span class="grand">Total</span><span class="n grand">${money(t.total)}</span>
      <span>Pagado</span><span class="n">−${money(t.paid)}</span><span class="grand">Saldo</span><span class="n grand">${money(t.balance)}</span></div>
  </article>
  <div class="stack">
    <div class="panel"><h3>Registrar pago</h3>
      <form class="stack" data-form="payment" style="margin-top:10px">
        <div class="grid2"><label class="field"><span>Monto</span><input id="payAmt" name="amount" type="number" step="0.01" min="0.01" value="${t.paid === 0 ? dep : Math.max(0, t.balance)}" required></label>
        <label class="field"><span>Fecha</span><input id="payDate" name="date" type="date" value="${today()}"></label></div>
        <label class="field"><span>Método</span><select id="payMethod" name="method">${['Tarjeta', 'Transferencia', 'Cheque', 'Efectivo', 'Financiamiento', 'Aseguradora'].map(x => `<option>${x}</option>`).join('')}</select></label>
        <button class="btn primary">Registrar pago</button></form>
      <p class="small muted" style="margin-top:8px">Depósito del ${inv.depositPct}%: <b>${money(dep)}</b></p></div>
    <div class="panel"><h3>Pagos</h3>${inv.payments.length ? `<div class="tablewrap" style="margin-top:6px"><table><tbody>${inv.payments.map(p => `<tr><td>${fmtDate(p.date)}</td><td>${esc(p.method)}</td><td class="n">${money(p.amount)}</td><td><button class="btn sm ghost" data-act="delPayment" data-pid="${p.id}" aria-label="Quitar pago">✕</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted" style="margin-top:6px">Sin pagos todavía.</p>'}</div>
    <div class="panel"><h3>Fechas</h3><div class="grid2" style="margin-top:10px"><label class="field"><span>Emitida</span><input id="invIssued" type="date" data-chg="inv" data-k="issued" value="${inv.issued}"></label><label class="field"><span>Vence</span><input id="invDue" type="date" data-chg="inv" data-k="due" value="${inv.due}"></label></div>
      <div class="row" style="margin-top:10px"><span class="spacer"></span><button class="btn sm danger" data-act="delInvoice">Eliminar factura</button></div></div>
  </div></div>`;
}

// ---------- Pedido de material ----------
function tabOrder(j) {
  const o = j.order;
  if (!o) return `<div class="panel empty"><b>Sin pedido de material.</b><span>${j.proposal ? 'Se arma con los materiales de la opción elegida y las cantidades de la medición.' : 'Primero crea una propuesta.'}</span>${j.proposal ? '<button class="btn primary" data-act="createOrder">Generar pedido</button>' : ''}</div>`;
  return `<div class="row"><span class="pill ${o.status === 'Entregado' ? 'ok' : o.status === 'Enviado' ? 'info' : ''}">${esc(o.status)}</span><span class="spacer"></span><button class="btn primary" data-act="copyOrder">Copiar pedido para el proveedor</button></div>
  <textarea id="copyFallback" hidden readonly style="width:100%;min-height:160px"></textarea>
  <div class="two"><div class="panel"><div class="panel-head"><h3>Pedido ${esc(o.number)}</h3></div>
    <div class="tablewrap"><table><thead><tr><th>Material</th><th class="n">Cantidad</th><th>Unidad</th><th></th></tr></thead><tbody>
      ${o.items.map((it, i) => `<tr><td><input id="oi-${i}" data-chg="orderItem" data-i="${i}" data-k="name" value="${esc(it.name)}"></td><td class="n"><input class="qty" id="oq-${i}" type="number" step="any" data-chg="orderItem" data-i="${i}" data-k="qty" value="${it.qty}"></td><td><input id="ou-${i}" data-chg="orderItem" data-i="${i}" data-k="unit" value="${esc(it.unit)}" style="max-width:80px"></td><td><button class="btn sm ghost" data-act="delOrderItem" data-i="${i}" aria-label="Quitar">✕</button></td></tr>`).join('')}
    </tbody></table></div><div class="row" style="margin-top:10px"><button class="btn sm" data-act="addOrderItem">Agregar material</button></div></div>
  <div class="panel stack"><h3>Entrega</h3>
    <label class="field"><span>Proveedor</span><input id="oSup" data-chg="order" data-k="supplier" value="${esc(o.supplier)}"></label>
    <div class="grid2"><label class="field"><span>Fecha de entrega</span><input id="oDel" type="date" data-chg="order" data-k="delivery" value="${o.delivery}"></label>
    <label class="field"><span>Estado</span><select id="oStat" data-chg="order" data-k="status">${['Borrador', 'Enviado', 'Confirmado', 'Entregado'].map(x => `<option ${x === o.status ? 'selected' : ''}>${x}</option>`).join('')}</select></label></div>
    <label class="field"><span>Dirección de entrega</span><input value="${esc(j.address)}" disabled></label>
    <label class="field"><span>Notas</span><textarea id="oNotes" data-chg="order" data-k="notes">${esc(o.notes)}</textarea></label>
    <div class="row"><span class="spacer"></span><button class="btn sm danger" data-act="delOrder">Eliminar pedido</button></div></div></div>`;
}

// ---------- Estimador web ----------
const EST_MATS = [['tab', 'Teja 3-tab'], ['arch', 'Teja arquitectónica'], ['prem', 'Teja premium'], ['metal', 'Lámina metálica']];
const EST_PITCH = [['low', 'Baja (hasta 4/12)', 3], ['med', 'Media (5–7/12)', 6], ['steep', 'Pronunciada (8/12 o más)', 10]];
let est = { foot: 1900, pitch: 'med', mat: 'arch', addr: '', done: false };
function estCalc() {
  const p = EST_PITCH.find(x => x[0] === est.pitch)[2]; const area = (+est.foot || 0) * 1.12 * pitchFactor(p); const sq = area / 100;
  const [lo, hi] = state.settings.est[est.mat]; return { area, sq, lo: Math.round(sq * lo / 100) * 100, hi: Math.round(sq * hi / 100) * 100 };
}
function viewEstimator() {
  const c = estCalc(); const s = state.settings;
  return `<div class="pagehead"><div><h1>Estimador web</h1><p class="sub">Tus clientes calculan un precio aproximado y te dejan sus datos. Cada solicitud entra como prospecto en el tablero.</p></div></div>
  <div class="two" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)">
    <div class="widget"><header><span class="label" style="color:var(--brand-muted)">${esc(s.company)}</span><h3>¿Cuánto cuesta tu techo nuevo?</h3></header>
      <form class="wb" data-form="estLead">
        <label class="field"><span>Dirección</span><input id="eAddr" name="addr" data-inp="est" data-k="addr" value="${esc(est.addr)}" placeholder="Calle, ciudad"></label>
        <div class="grid2"><label class="field"><span>Superficie de la casa (ft²)</span><input id="eFoot" type="number" min="300" step="50" data-inp="est" data-k="foot" value="${est.foot}"></label>
        <label class="field"><span>Pendiente</span><select id="ePitch" data-inp="est" data-k="pitch">${EST_PITCH.map(p => `<option value="${p[0]}" ${p[0] === est.pitch ? 'selected' : ''}>${p[1]}</option>`).join('')}</select></label></div>
        <div class="seg">${EST_MATS.map(m => `<button type="button" data-act="estMat" data-k="${m[0]}" aria-pressed="${est.mat === m[0]}">${m[1]}</button>`).join('')}</div>
        <div style="background:var(--surface-2);border-radius:8px;padding:12px"><span class="label">Precio estimado</span><div class="range" id="estRange">${money(c.lo)} – ${money(c.hi)}</div><span class="small muted" id="estSq">≈ ${num(c.sq, 1)} cuadros de techo</span></div>
        ${est.done ? '<p class="pill ok" style="align-self:flex-start">¡Gracias! Te llamaremos pronto.</p>' : `
        <div class="grid2"><label class="field"><span>Nombre</span><input id="eName" name="name" required></label><label class="field"><span>Teléfono</span><input id="ePhone" name="phone" required></label></div>
        <label class="field"><span>Correo</span><input id="eEmail" name="email" type="email"></label>
        <button class="btn primary block">Quiero mi inspección gratis</button>`}
        ${est.done ? '<button type="button" class="btn sm" data-act="estReset">Probar otra vez</button>' : ''}
      </form></div>
    <div class="panel stack"><h3>Precio por cuadro instalado</h3><p class="small muted">El rango del estimador usa estos valores. La superficie se ajusta por aleros (+12%) y por pendiente.</p>
      <div class="tablewrap"><table><thead><tr><th>Material</th><th class="n">Mínimo</th><th class="n">Máximo</th></tr></thead><tbody>
        ${EST_MATS.map(m => `<tr><td>${m[1]}</td><td class="n"><input class="pr" id="estlo-${m[0]}" type="number" data-chg="estPrice" data-k="${m[0]}" data-i="0" value="${s.est[m[0]][0]}"></td><td class="n"><input class="pr" id="esthi-${m[0]}" type="number" data-chg="estPrice" data-k="${m[0]}" data-i="1" value="${s.est[m[0]][1]}"></td></tr>`).join('')}</tbody></table></div>
      <p class="small muted">Para ponerlo en tu sitio web hace falta la versión con servidor (ver «Siguiente fase» en Ajustes). Aquí puedes usarlo en persona o por teléfono.</p></div>
  </div>`;
}

// ---------- Catálogo ----------
function viewCatalog() {
  return `<div class="pagehead"><div><h1>Catálogo de precios</h1><p class="sub">Cada producto calcula su cantidad a partir de la medición. Cambia aquí precios y costos.</p></div><button class="btn primary" data-act="addCat">${I.plus} Agregar producto</button></div>
  <div class="panel"><div class="tablewrap"><table><thead><tr><th>Producto</th><th>Tipo</th><th>Unidad</th><th>Cantidad según</th><th class="n">Costo</th><th class="n">Precio</th><th class="n">Margen</th><th></th></tr></thead><tbody>
    ${state.catalog.map((c, i) => `<tr><td style="min-width:200px"><input id="cn-${i}" data-chg="cat" data-i="${i}" data-k="name" value="${esc(c.name)}"></td>
      <td><select id="ck-${i}" data-chg="cat" data-i="${i}" data-k="kind">${[['material', 'Material'], ['labor', 'Mano de obra'], ['other', 'Otro']].map(([k, n]) => `<option value="${k}" ${k === c.kind ? 'selected' : ''}>${n}</option>`).join('')}</select></td>
      <td><input id="cu-${i}" data-chg="cat" data-i="${i}" data-k="unit" value="${esc(c.unit)}" style="max-width:80px"></td>
      <td style="min-width:220px"><select id="cf-${i}" data-chg="cat" data-i="${i}" data-k="formula">${Object.entries(FORMULAS).map(([k, n]) => `<option value="${k}" ${k === c.formula ? 'selected' : ''}>${n}</option>`).join('')}</select></td>
      <td class="n"><input class="pr" id="cc-${i}" type="number" step="any" data-chg="cat" data-i="${i}" data-k="cost" value="${c.cost}"></td>
      <td class="n"><input class="pr" id="cp-${i}" type="number" step="any" data-chg="cat" data-i="${i}" data-k="price" value="${c.price}"></td>
      <td class="n small muted">${c.price ? num((1 - c.cost / c.price) * 100) + '%' : '—'}</td>
      <td><button class="btn sm ghost" data-act="delCat" data-i="${i}" aria-label="Eliminar producto">✕</button></td></tr>`).join('')}
  </tbody></table></div></div>`;
}

// ---------- Ajustes ----------
function viewSettings() {
  const s = state.settings;
  return `<div class="pagehead"><div><h1>Ajustes</h1><p class="sub">Datos de tu empresa, impuestos y respaldo.</p></div></div>
  <div class="two">
    <div class="panel stack"><h3>Empresa</h3>
      <div class="grid2"><label class="field"><span>Nombre comercial</span><input id="sCo" data-chg="set" data-k="company" value="${esc(s.company)}"></label>
      <label class="field"><span>Licencia</span><input id="sLic" data-chg="set" data-k="license" value="${esc(s.license)}"></label>
      <label class="field"><span>Teléfono</span><input id="sPh" data-chg="set" data-k="phone" value="${esc(s.phone)}"></label>
      <label class="field"><span>Correo</span><input id="sEm" data-chg="set" data-k="email" value="${esc(s.email)}"></label>
      <label class="field"><span>Idioma / Language</span><select id="sLang" data-chg="lang"><option value="es" ${s.lang !== 'en' ? 'selected' : ''}>Español</option><option value="en" ${s.lang === 'en' ? 'selected' : ''}>English</option></select></label>
      <label class="field"><span>Moneda</span><select id="sCur" data-chg="set" data-k="currency">${['USD', 'MXN', 'EUR', 'COP', 'CAD'].map(c => `<option ${c === s.currency ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
      <label class="field"><span>Impuesto por defecto %</span><input id="sTax" type="number" step="0.01" data-chg="set" data-k="taxRate" value="${s.taxRate}"></label></div>
      <label class="field"><span>Mensaje de propuesta por defecto</span><textarea id="sIntro" data-chg="set" data-k="intro">${esc(s.intro)}</textarea></label>
      <label class="field"><span>Términos por defecto</span><textarea id="sTerms" data-chg="set" data-k="terms">${esc(s.terms)}</textarea></label>
      <div class="stack" style="gap:8px"><span class="field"><span style="font-size:12px;color:var(--muted);font-weight:600">Logo de la empresa</span></span>
        <div class="row">${s.logo ? `<img src="${s.logo}" alt="Logo actual" style="max-height:64px;max-width:180px;background:#fff;border:1px solid var(--line);border-radius:6px;padding:4px">` : '<span class="small muted">Sin logo todavía.</span>'}
          <label class="btn sm">${s.logo ? 'Cambiar logo' : 'Subir logo'}<input id="logoFile" type="file" accept="image/*" data-chg="logo" hidden></label>
          ${s.logo ? '<button class="btn sm danger" data-act="delLogo">Quitar</button>' : ''}</div>
        ${s.logo ? `<label class="row small" style="gap:6px"><input type="checkbox" id="wmOn" data-chg="wmOn" ${s.wmOn !== false ? 'checked' : ''}> Mostrar como marca de agua en propuestas, facturas e informes</label>
        <label class="field"><span>Intensidad de la marca de agua: <b id="wmVal">${s.wmOpacity ?? 8}%</b></span><input id="wmOp" type="range" min="3" max="25" value="${s.wmOpacity ?? 8}" data-inp="wmOp"></label>` : '<p class="small muted">PNG con fondo transparente se ve mejor.</p>'}
      </div>
      <label class="field"><span>Llave de Google Maps (para el satélite de Google)</span><input id="sGKey" data-chg="set" data-k="googleKey" value="${esc(s.googleKey || '')}" placeholder="AIza…" autocomplete="off"></label>
      <label class="field"><span>Centro del mapa satelital (lat, lng)</span><input id="sHome" data-chg="setHome" value="${s.homeCenter.join(', ')}"></label>
    </div>
    <div class="stack">
      <div class="panel stack"><h3>Respaldo</h3><p class="small muted">Los datos se guardan en este navegador. Copia un respaldo para pasarlos a otro equipo.</p>
        <div class="row"><button class="btn" data-act="backup">Copiar respaldo</button><button class="btn" data-act="showImport">Importar respaldo</button></div>
        <textarea id="copyFallback" hidden readonly style="min-height:100px"></textarea>
        <form class="stack" data-form="import" id="importForm" hidden><textarea id="importText" name="t" placeholder="Pega aquí el respaldo"></textarea><button class="btn primary">Importar y reemplazar datos</button></form>
        <div class="row"><button class="btn danger" data-act="delExamples">Borrar trabajos de ejemplo</button><button class="btn danger" data-act="resetAll">Restablecer todo</button></div></div>
      <div class="panel stack"><h3>Siguiente fase</h3><p class="small muted">Funciones de la versión con servidor que esta versión todavía no incluye:</p>
        <ul class="small" style="margin:0;padding-left:18px;display:grid;gap:4px">
          <li>Cuentas de usuario, equipo y datos en la nube compartidos entre dispositivos.</li>
          <li>Medición automática por IA desde imagen satelital y compra de informes.</li>
          <li>Envío de propuestas y facturas por correo/SMS con enlace de firma.</li>
          <li>Cobros en línea con tarjeta (Stripe) y financiamiento al cliente.</li>
          <li>Pedidos directos a proveedores (ABC Supply, SRS, Beacon) y calendario de cuadrillas.</li>
          <li>Widget del estimador para insertar en tu sitio web.</li>
        </ul></div>
    </div>
  </div>`;
}

// ---------- Modal ----------
function openModal(html) { const m = $('#modal'); m.innerHTML = `<div class="box" role="dialog" aria-modal="true">${html}</div>`; m.hidden = false; setTimeout(() => m.querySelector('input')?.focus(), 30); }
function closeModal() { $('#modal').hidden = true; $('#modal').innerHTML = ''; }
function newJobModal() {
  openModal(`<h2>Nuevo trabajo</h2><form class="stack" data-form="newJob">
    <label class="field"><span>Cliente</span><input id="nj-name" name="name" required placeholder="Nombre del cliente"></label>
    <label class="field"><span>Dirección de la propiedad</span><input id="nj-addr" name="address" placeholder="Calle, ciudad, CP"></label>
    <div class="grid2"><label class="field"><span>Teléfono</span><input id="nj-phone" name="phone"></label><label class="field"><span>Correo</span><input id="nj-email" name="email" type="email"></label></div>
    <label class="field"><span>Origen</span><select id="nj-src" name="source">${['Referido', 'Google', 'Estimador web', 'Facebook', 'Puerta a puerta', 'Aseguradora', 'Otro'].map(o => `<option>${o}</option>`).join('')}</select></label>
    <label class="field"><span>Notas</span><textarea id="nj-notes" name="notes"></textarea></label>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-act="closeModal">Cancelar</button><button class="btn primary">Crear y medir</button></div></form>`);
}

// ---------- acciones ----------
const J = () => getJob(route.id);
const ACT = {
  go: el => go({ view: el.dataset.v }),
  open: el => go({ view: 'job', id: el.dataset.id, tab: el.dataset.tab || 'resumen' }),
  tab: el => go({ view: 'job', id: el.dataset.id || route.id, tab: el.dataset.tab }),
  newJob: () => newJobModal(),
  closeModal: () => closeModal(),
  hideNote: () => { state.hideExampleNote = true; save(); render(); },
  delExamples: el => { if (!armed(el)) return; state.jobs = state.jobs.filter(j => !j.example); save(); toast('Ejemplos borrados'); go({ view: route.view === 'ajustes' ? 'ajustes' : 'trabajos' }); },
  resetAll: el => { if (!armed(el)) return; seedState(); save(); toast('Datos restablecidos'); go({ view: 'panel' }); },
  delJob: el => { if (!armed(el)) return; state.jobs = state.jobs.filter(j => j.id !== route.id); save(); toast('Trabajo eliminado'); go({ view: 'trabajos' }); },
  // medición
  tool: el => setTool(el.dataset.k),
  mode: el => setMode(el.dataset.k),
  lineType: el => {
    const k = el.dataset.k; const m = meas();
    if (M.sel?.kind === 'line') { const l = m.lines.find(x => x.id === M.sel.id); if (l) { pushHist(); l.type = k; commit(); } }
    else { M.lineType = k; updatePanel(); hud(); }
  },
  undo: () => {
    if (M.draft.length) { M.draft.pop(); drawShapes(); updatePanel(); return; }
    const h = M.hist.pop(); if (!h) return; const m = meas(); const s = JSON.parse(h); m.facets = s.f; m.lines = s.l; M.sel = null; commit();
  },
  closeFacet: () => closeFacet(),
  streetView: () => showStreetView(),
  svClose: () => { const b = $('#svbox'); b.hidden = true; b.innerHTML = ''; },
  myLoc: () => {
    if (!navigator.geolocation) { toast('Este dispositivo no comparte ubicación'); return; }
    hud('Obteniendo tu ubicación…');
    navigator.geolocation.getCurrentPosition(p => centerOn([p.coords.latitude, p.coords.longitude]),
      () => { toast(inFrame ? 'La ubicación no está disponible en esta vista previa.' : 'No se pudo obtener tu ubicación. Revisa el permiso del navegador.'); hud(); }, { enableHighAccuracy: true, timeout: 10000 });
  },
  autoLines: () => { const m = meas(); const add = autoLines(m); if (!add.length) { toast('Todas las aristas ya tienen línea'); return; } pushHist(); m.lines.push(...add); commit(); toast(`${add.length} líneas creadas. Revisa los tipos tocando cada línea.`); },
  delSel: () => { const m = meas(); if (!M.sel) return; pushHist(); m.facets = m.facets.filter(f => f.id !== M.sel.id); m.lines = m.lines.filter(l => l.id !== M.sel.id); M.sel = null; commit(); },
  pitchAll: () => { const m = meas(); const f = m.facets.find(x => x.id === M.sel?.id); if (!f) return; pushHist(); m.facets.forEach(x => x.pitch = f.pitch); m.defaultPitch = f.pitch; commit(); },
  clearDrawing: el => { if (!armed(el)) return; const m = meas(); pushHist(); m.facets = []; m.lines = []; m.origin = null; M.sel = null; commit(); },
  // propuesta
  genProposal: () => { const j = J(); j.proposal = buildProposal(j); optIdx = 1; log(j, 'Propuesta generada'); save(); render(); },
  regenProposal: el => { if (!armed(el)) return; const j = J(); const old = j.proposal; j.proposal = buildProposal(j, old); save(); toast('Cantidades recalculadas'); render(); },
  opt: el => { optIdx = +el.dataset.i; render(); },
  addOption: () => { const p = J().proposal; const base = p.options[optIdx]; p.options.push({ name: tr('Opción ' + (p.options.length + 1)), desc: '', lines: JSON.parse(JSON.stringify(base.lines)) }); optIdx = p.options.length - 1; save(); render(); },
  delOption: el => { if (!armed(el)) return; const p = J().proposal; p.options.splice(optIdx, 1); optIdx = 0; save(); render(); },
  delLine: el => { const p = J().proposal; p.options[optIdx].lines.splice(+el.dataset.i, 1); save(); render(); },
  addLine: () => { const id = $('#addCat').value; if (!id) return; const j = J(); const r = calc(j.measurement); const q = quantities(r, r.wasteUsed ?? 10); j.proposal.options[optIdx].lines.push(lineFrom(cat(id), q)); save(); render(); },
  addCustom: () => { J().proposal.options[optIdx].lines.push({ cid: null, name: tr('Partida adicional'), unit: tr('serv'), kind: 'other', qty: 1, price: 0, cost: 0 }); save(); render(); },
  sendProposal: () => { const j = J(); j.proposal.status = 'sent'; j.proposal.sentOn = today(); log(j, 'Propuesta enviada al cliente'); if (OPEN_STAGES.includes(j.stage)) setStage(j, 'propuesta', 'Movido a «Propuesta enviada»'); save(); toast('Propuesta marcada como enviada'); render(); },
  delProposal: el => { if (!armed(el)) return; J().proposal = null; save(); render(); },
  shareProposal: () => shareModal(J()),
  copyLink: () => copyText($('#shareLink').value, $('#shareLink')),
  copyReply: () => copyText(clientReply, null),
  nativeShare: el => { const url = el.dataset.which === 'reply' ? clientReply : $('#shareLink').value; navigator.share?.({ title: 'SmartRoof', text: el.dataset.text, url }).catch(() => { }); },
  clientView: () => { clientSel = null; go({ view: 'cliente', id: route.id }); },
  clientOpt: el => { clientSel = +el.dataset.i; render(); },
  clearSig: () => { const c = $('#sigpad'); if (c) { c.getContext('2d').clearRect(0, 0, c.width, c.height); sig.drawn = false; } },
  // factura
  createInvoice: () => { const j = J(); createInvoice(j); setStage(j, 'facturado'); save(); render(); },
  delInvoice: el => { if (!armed(el)) return; J().invoice = null; save(); render(); },
  addInvLine: () => { J().invoice.lines.push({ name: tr('Cambio de obra: reemplazo de triplay'), unit: tr('hoja'), qty: 1, price: 95 }); save(); render(); },
  delInvLine: el => { J().invoice.lines.splice(+el.dataset.i, 1); save(); render(); },
  delPayment: el => { const j = J(); j.invoice.payments = j.invoice.payments.filter(p => p.id !== el.dataset.pid); syncPaid(j); save(); render(); },
  copyInvoice: () => {
    const j = J(), inv = j.invoice, t = invTotals(inv), s = state.settings;
    copyText(`${s.company}\nFactura ${inv.number} para ${j.name}\n${j.address}\n\nTotal: ${money(t.total)}\nPagado: ${money(t.paid)}\nSaldo: ${money(t.balance)}\nVence: ${fmtDate(inv.due)}\n\nGracias por su preferencia. Dudas: ${s.phone} · ${s.email}`, $('#copyFallback'));
  },
  print: () => window.print(),
  // pedido
  createOrder: () => { createOrder(J()); save(); render(); },
  delOrder: el => { if (!armed(el)) return; J().order = null; save(); render(); },
  addOrderItem: () => { J().order.items.push({ name: 'Material', unit: 'pza', qty: 1 }); save(); render(); },
  delOrderItem: el => { J().order.items.splice(+el.dataset.i, 1); save(); render(); },
  copyOrder: () => {
    const j = J(), o = j.order;
    copyText(`Pedido ${o.number} · ${state.settings.company}\nProveedor: ${o.supplier}\nEntrega: ${fmtDate(o.delivery)} en ${j.address}\n\n${o.items.map(i => `- ${i.qty} ${i.unit}  ${i.name}`).join('\n')}\n\nNotas: ${o.notes}\nContacto: ${state.settings.phone}`, $('#copyFallback'));
  },
  // estimador
  estMat: el => { est.mat = el.dataset.k; render(); },
  estReset: () => { est.done = false; render(); },
  // catálogo
  addCat: () => { state.catalog.push({ id: uid(), name: 'Producto nuevo', unit: 'pza', kind: 'material', formula: 'manual', cost: 0, price: 0 }); save(); render(); },
  delCat: el => { if (!armed(el)) return; state.catalog.splice(+el.dataset.i, 1); save(); render(); },
  // respaldo
  delLogo: el => { if (!armed(el)) return; delete state.settings.logo; save(); render(); },
  backup: () => copyText(JSON.stringify(state), $('#copyFallback')),
  showImport: () => { $('#importForm').hidden = false; $('#importText').focus(); },
};
function syncPaid(j) {
  const t = invTotals(j.invoice);
  if (t.balance <= 0.004 && t.total > 0) setStage(j, 'pagado', 'Factura pagada por completo');
  else if (j.stage === 'pagado') setStage(j, 'facturado');
}

const CHG = {
  lang: el => setLang(el.value),
  stage: el => { const j = J(); setStage(j, el.value); save(); render(); },
  jobField: el => { const j = J(); j[el.dataset.k] = el.value; save(); if (el.dataset.k === 'name' || el.dataset.k === 'address') render(); },
  image: el => { if (el.files[0]) loadImage(el.files[0]); },
  logo: el => { if (el.files[0]) loadLogo(el.files[0]); },
  wmOn: el => { state.settings.wmOn = el.checked; save(); },
  satSrc: el => { state.settings.satSource = el.value; save(); initMap(); },
  satEnh: el => { state.settings.satEnhance = el.checked; save(); $('#map').classList.toggle('enhance', el.checked); },
  facetPitch: el => { const m = meas(); const f = m.facets.find(x => x.id === M.sel?.id); if (f) { pushHist(); f.pitch = +el.value; commit(); } },
  defPitch: el => { meas().defaultPitch = +el.value; save(); },
  pens: el => { meas().penetrations = Math.max(0, +el.value || 0); save(); updatePanel(); },
  waste: el => { meas().waste = el.value === '' ? null : +el.value; save(); updatePanel(); },
  optName: el => { J().proposal.options[optIdx].name = el.value; save(); render(); },
  optDesc: el => { J().proposal.options[optIdx].desc = el.value; save(); },
  line: el => { const l = J().proposal.options[optIdx].lines[+el.dataset.i]; const k = el.dataset.k; l[k] = k === 'name' ? el.value : +el.value || 0; save(); render(); },
  prop: el => { const p = J().proposal; const k = el.dataset.k; p[k] = ['taxRate', 'discount'].includes(k) ? +el.value || 0 : el.value; save(); if (['taxRate', 'discount'].includes(k)) render(); },
  invLine: el => { const j = J(); const l = j.invoice.lines[+el.dataset.i]; const k = el.dataset.k; l[k] = k === 'name' ? el.value : +el.value || 0; syncPaid(j); save(); render(); },
  inv: el => { J().invoice[el.dataset.k] = el.value; save(); render(); },
  orderItem: el => { const it = J().order.items[+el.dataset.i]; const k = el.dataset.k; it[k] = k === 'qty' ? +el.value || 0 : el.value; save(); },
  order: el => { const j = J(); j.order[el.dataset.k] = el.value; if (el.dataset.k === 'status') { log(j, `Pedido ${j.order.number}: ${el.value}`); render(); } save(); },
  estPrice: el => { state.settings.est[el.dataset.k][+el.dataset.i] = +el.value || 0; save(); render(); },
  cat: el => { const c = state.catalog[+el.dataset.i]; const k = el.dataset.k; c[k] = ['cost', 'price'].includes(k) ? +el.value || 0 : el.value; save(); if (['cost', 'price'].includes(k)) render(); },
  set: el => { const k = el.dataset.k; state.settings[k] = k === 'taxRate' ? +el.value || 0 : el.value; save(); renderNav(); },
  setHome: el => { const p = el.value.split(',').map(Number); if (p.length === 2 && p.every(isFinite)) { state.settings.homeCenter = p; save(); toast('Guardado'); } else toast('Escribe latitud y longitud separadas por coma'); },
};
const INP = {
  wmOp: el => { state.settings.wmOpacity = +el.value; $('#wmVal').textContent = el.value + '%'; save(); },
  search: el => { filter = el.value; const pos = el.selectionStart; render(); const n = $('#jobSearch'); n.focus(); n.setSelectionRange(pos, pos); },
  est: el => { est[el.dataset.k] = el.value; if (el.dataset.k === 'addr') return; const c = estCalc(); $('#estRange').textContent = `${money(c.lo)} – ${money(c.hi)}`; $('#estSq').textContent = `≈ ${num(c.sq, 1)} cuadros de techo`; },
};
const FORM = {
  newJob: fd => {
    const j = { id: uid(), name: fd.get('name').trim(), address: fd.get('address').trim(), phone: fd.get('phone').trim(), email: fd.get('email').trim(), source: fd.get('source'), notes: fd.get('notes').trim(), stage: 'lead', created: new Date().toISOString(), activity: [], measurement: null, proposal: null, invoice: null, order: null };
    log(j, `Prospecto creado (${j.source})`); state.jobs.unshift(j); save(); closeModal(); go({ view: 'job', id: j.id, tab: 'medicion' });
  },
  note: fd => { const t = fd.get('t').trim(); if (!t) return; log(J(), t); save(); render(); },
  calib: fd => {
    const len = +fd.get('len'); if (!(len > 0) || !M.calib) return;
    const [a, b] = M.calib; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (!d) return;
    const m = meas(); m.ftPerUnit = len / d; M.calib = null; save(); setTool('facet'); toast(`Escala aplicada: 1 px = ${num(m.ftPerUnit, 3)} ft`);
  },
  geo: async fd => {
    const q = (fd.get('q') || '').trim(); if (!q) return;
    const m = meas(); let ll = null;
    const mm = q.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (mm) ll = [+mm[1], +mm[2]];
    else ll = await geocode(q);
    if (ll) centerOn(ll);
  },
  sign: fd => {
    const j = J(), p = j.proposal; const name = (fd.get('name') || '').trim();
    if (!name) { toast('Escribe tu nombre para firmar'); return; }
    if (!sig.drawn) { toast('Dibuja tu firma en el recuadro'); return; }
    p.signature = { name, date: today(), img: sig.c.toDataURL('image/png') }; p.selected = clientSel; p.status = 'signed';
    log(j, `Propuesta firmada por ${name}: opción «${p.options[clientSel].name}» (${money(optTotals(p.options[clientSel], p).total)})`);
    if (['lead', 'inspeccion', 'propuesta'].includes(j.stage)) setStage(j, 'aprobado');
    save(); toast('Propuesta firmada'); render();
    if (clientMode) makeReply(j);
  },
  payment: fd => {
    const j = J(); const amt = r2(+fd.get('amount')); if (!(amt > 0)) return;
    j.invoice.payments.push({ id: uid(), date: fd.get('date') || today(), amount: amt, method: fd.get('method') });
    log(j, `Pago recibido: ${money(amt)} (${fd.get('method')})`); syncPaid(j); save(); toast('Pago registrado'); render();
  },
  estLead: fd => {
    const c = estCalc(); const mat = EST_MATS.find(m => m[0] === est.mat)[1];
    const j = { id: uid(), name: fd.get('name').trim(), phone: fd.get('phone').trim(), email: (fd.get('email') || '').trim(), address: est.addr, source: 'Estimador web', stage: 'lead', created: new Date().toISOString(), estimate: Math.round((c.lo + c.hi) / 2), notes: `Estimación instantánea: casa de ${num(+est.foot)} ft², pendiente ${EST_PITCH.find(p => p[0] === est.pitch)[1].toLowerCase()}, ${mat.toLowerCase()}. Rango ${money(c.lo)} – ${money(c.hi)}.`, activity: [], measurement: null, proposal: null, invoice: null, order: null };
    log(j, 'Prospecto creado desde el estimador web'); state.jobs.unshift(j); est.done = true; save(); render(); toast(`Nuevo prospecto: ${j.name}`);
  },
  import: fd => {
    try { const s = JSON.parse(fd.get('t')); if (!s.jobs || !s.catalog || !s.settings) throw 0; state = s; save(); toast('Datos importados'); go({ view: 'panel' }); }
    catch { toast('El texto no es un respaldo válido de SmartRoof'); }
  },
};

document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a) { if (e.target.id === 'modal') closeModal(); return; }
  if (a.tagName === 'A') e.preventDefault();
  if (a.closest('.board') && e.defaultPrevented) return;
  ACT[a.dataset.act]?.(a, e);
});
document.addEventListener('change', e => { const el = e.target.closest('[data-chg]'); if (el) CHG[el.dataset.chg]?.(el); });
document.addEventListener('input', e => { const el = e.target.closest('[data-inp]'); if (el) INP[el.dataset.inp]?.(el); });
document.addEventListener('submit', e => { const f = e.target.closest('[data-form]'); if (!f) return; e.preventDefault(); FORM[f.dataset.form]?.(new FormData(f), f); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#modal').hidden) { closeModal(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.card[data-act], .opt[data-act]')) { e.preventDefault(); e.target.click(); return; }
  if (!(route.view === 'job' && route.tab === 'medicion' && map)) return;
  if (e.target.matches('input, textarea, select')) return;
  const k = e.key.toLowerCase();
  if (e.key === 'Enter' && M.tool === 'facet') { closeFacet(); e.preventDefault(); }
  else if (e.key === 'Escape') { M.draft = []; rubber.setLatLngs([]); M.calib = null; drawShapes(); updatePanel(); }
  else if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); ACT.undo(); }
  else if (e.key === 'Delete' || e.key === 'Backspace') { if (M.sel) { e.preventDefault(); ACT.delSel(); } }
  else if (k === 'v') setTool('select'); else if (k === 'f') setTool('facet'); else if (k === 'l') setTool('line');
  else if (k === 'c' && meas().mode === 'image') setTool('calib');
  else { const t = Object.entries(LINE_TYPES).find(([, v]) => v.key === e.key); if (t) ACT.lineType({ dataset: { k: t[0] } }); }
});
// arrastrar tarjetas entre etapas
document.addEventListener('dragstart', e => { const c = e.target.closest?.('.card[draggable]'); if (c) { e.dataTransfer.setData('text/plain', c.dataset.id); e.dataTransfer.effectAllowed = 'move'; } });
document.addEventListener('dragover', e => { const col = e.target.closest?.('.col'); if (col) { e.preventDefault(); document.querySelectorAll('.col.over').forEach(c => c !== col && c.classList.remove('over')); col.classList.add('over'); } });
document.addEventListener('dragleave', e => { const col = e.target.closest?.('.col'); if (col && !col.contains(e.relatedTarget)) col.classList.remove('over'); });
document.addEventListener('drop', e => {
  const col = e.target.closest?.('.col'); if (!col) return; e.preventDefault();
  const j = getJob(e.dataTransfer.getData('text/plain')); if (j) { setStage(j, col.dataset.stage); save(); render(); toast(`${j.name} → ${stageName(col.dataset.stage)}`); }
});
window.addEventListener('hashchange', () => { if (clientMode) return; if (/^#f=/.test(location.hash)) { importReply(location.hash.slice(3)); return; } const r = parseHash(); if (JSON.stringify(r) !== JSON.stringify(route)) go(r); });

// ---------- instalar como app ----------
let installEvt = null;
const isStandalone = () => { try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch { return false; } };
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function updInstall() { const b = $('#installBtn'); if (b) b.hidden = inFrame || isStandalone() || !window.isSecureContext; }
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; updInstall(); });
window.addEventListener('appinstalled', () => { installEvt = null; updInstall(); toast('SmartRoof quedó instalada'); });
ACT.install = async () => {
  if (installEvt) {
    installEvt.prompt();
    try { const c = await installEvt.userChoice; if (c.outcome === 'accepted') toast('Instalando SmartRoof…'); } catch { }
    installEvt = null; updInstall(); return;
  }
  const steps = isIOS
    ? `<ol style="margin:0;padding-left:20px;display:grid;gap:8px"><li>Abre esta página en <b>Safari</b>.</li><li>Toca el botón <b>Compartir</b> (el cuadro con la flecha hacia arriba).</li><li>Elige <b>Agregar a pantalla de inicio</b> y toca <b>Agregar</b>.</li></ol>`
    : `<ol style="margin:0;padding-left:20px;display:grid;gap:8px"><li>En <b>Chrome o Edge</b>, abre el menú <b>⋮</b> del navegador.</li><li>Toca <b>Instalar app</b> o <b>Agregar a pantalla principal</b>.</li><li>Confirma con <b>Instalar</b>.</li></ol><p class="small muted">Si no aparece la opción, recarga la página y espera unos segundos.</p>`;
  openModal(`<h2>Instalar SmartRoof</h2><p>Tendrás SmartRoof con su propio ícono, en pantalla completa y sin la barra del navegador.</p>${steps}<div class="row" style="justify-content:flex-end"><button class="btn primary" data-act="closeModal">Entendido</button></div>`);
};
if ('serviceWorker' in navigator && window.isSecureContext && location.protocol !== 'file:' && !inFrame) { try { navigator.serviceWorker.register('sw.js').catch(() => { }); } catch { } }

// Cambia al otro idioma los textos de fábrica guardados (productos, unidades, opciones, notas de ejemplo); lo escrito por el usuario no se toca.
function swapData(l) {
  const known = new Set(['Partida adicional', 'Cambio de obra: reemplazo de triplay', 'hoja', 'Entregar en la entrada. Llamar 30 min antes.', DEFAULT_SETTINGS.intro, DEFAULT_SETTINGS.terms,
    'Granizo en abril. Quiere cambiar a teja arquitectónica color carbón.', 'Goteras en el salón social. Inspección programada el jueves 9:00.',
    ...DEFAULT_CATALOG.flatMap(c => [c.name, c.unit]), ...TIERS.flatMap(t => [t.name, t.desc])]);
  const back = {}; for (const k of known) if (EN[k]) back[EN[k]] = k;
  const sw = v => {
    if (typeof v !== 'string') return v;
    if (l === 'en') { if (known.has(v) && EN[v]) return EN[v]; const m = v.match(/^Opción (\d+)$/); return m ? 'Option ' + m[1] : v; }
    if (back[v]) return back[v]; const m = v.match(/^Option (\d+)$/); return m ? 'Opción ' + m[1] : v;
  };
  const fix = (o, ks) => { if (o) for (const k of ks) if (k in o) o[k] = sw(o[k]); };
  state.catalog.forEach(c => fix(c, ['name', 'unit']));
  for (const j of state.jobs) {
    fix(j, ['notes']); fix(j.proposal, ['intro', 'terms']);
    j.proposal?.options?.forEach(o => { fix(o, ['name', 'desc']); o.lines?.forEach(x => fix(x, ['name', 'unit'])); });
    j.invoice?.lines?.forEach(x => fix(x, ['name', 'unit']));
    fix(j.order, ['notes']); j.order?.items?.forEach(x => fix(x, ['name', 'unit']));
  }
}
function setLang(l) {
  const st = state.settings;
  for (const k of ['intro', 'terms']) { const es = DEFAULT_SETTINGS[k], en = EN[es]; if (l === 'en' && st[k] === es) st[k] = en; else if (l !== 'en' && st[k] === en) st[k] = es; }
  swapData(l);
  const wasEn = !!trObs; st.lang = l; save();
  if (wasEn && l !== 'en') { location.reload(); return; } // el texto fijo traducido vuelve al español al recargar
  applyLang(); render(); updLangBtn();
}
function updLangBtn() { const b = document.getElementById('langBtn'); if (b) b.querySelectorAll('[data-l]').forEach(x => x.classList.toggle('on', x.dataset.l === (state.settings.lang === 'en' ? 'en' : 'es'))); }
ACT.lang = () => setLang(state.settings.lang === 'en' ? 'es' : 'en');

// ---------- inicio ----------
state = load();
if (!state && !/^#p=/.test(location.hash)) { seedState(); save(); }
const _h = location.hash;
if (/^#p=/.test(_h)) startClientMode(_h.slice(3));
else {
  if (state.settings.lang === 'en') { swapData('en'); save(); }
  route = parseHash();
  render();
  applyLang();
  updLangBtn();
  updInstall();
  if (/^#f=/.test(_h)) importReply(_h.slice(3));
}
