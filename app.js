const LOGO = 'kprietonline_logo.jpg';

// Verification symbol — shown only on Wednesday (3) and Friday (5)
// Symbol changes every Wed/Fri automatically using week-based seed
const VERIFY_SYMBOLS = [
  // SVG icons as inline strings
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>'
];

// Cached once at startup — symbol never changes within a session
let _cachedSymbol;
function getVerifySymbol() {
  if (_cachedSymbol !== undefined) return _cachedSymbol;
  const now = new Date();
  const day = now.getDay();
  if (day !== 3 && day !== 5) { _cachedSymbol = null; return null; }
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  const seed = weekNum * 10 + (day === 5 ? 1 : 0);
  _cachedSymbol = VERIFY_SYMBOLS[seed % VERIFY_SYMBOLS.length];
  return _cachedSymbol;
}

let bg  = '#0a1f5c';
let acc = '#d4af37';
let count = 20;
let tokensPerPage = 8;
let mealLabel = localStorage.getItem('kpriet_meal') || 'Friday Lunch';
const MAX_TOKENS = 9999;
const TPP_KEY = 'kpriet_tpp';
let _renderTimer = null;

function scheduleRender() {
  if (_renderTimer) clearTimeout(_renderTimer);
  _renderTimer = setTimeout(render, 80);
}

function setMealLabel(val) {
  mealLabel = val.trim() || 'Friday Lunch';
  localStorage.setItem('kpriet_meal', mealLabel);
  scheduleRender();
}

function loadTPP() {
  const saved = parseInt(localStorage.getItem(TPP_KEY), 10);
  if (saved && saved >= 1 && saved <= 100) tokensPerPage = saved;
}

function saveTPP(val) {
  tokensPerPage = val;
  localStorage.setItem(TPP_KEY, val);
  updateTPPHint();
}

function updateTPPHint() {
  const hint = document.getElementById('tppHint');
  if (hint) hint.textContent = tokensPerPage + ' tokens per page · PDF will auto-paginate';
}

function setTPP(val, btn) {
  saveTPP(val);
  document.querySelectorAll('.tpp-btn').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  const custom = document.getElementById('tppCustom');
  if (custom) custom.value = '';
}

function setTPPCustom(val) {
  const n = parseInt(val, 10);
  if (!n || n < 1 || n > 100) return;
  saveTPP(n);
  document.querySelectorAll('.tpp-btn').forEach(function(b) { b.classList.remove('active'); });
}

function syncTPPButtons() {
  const presets = [4, 6, 8, 10, 12];
  document.querySelectorAll('.tpp-btn').forEach(function(btn, i) {
    btn.classList.toggle('active', presets[i] === tokensPerPage);
  });
  if (!presets.includes(tokensPerPage)) {
    const custom = document.getElementById('tppCustom');
    if (custom) custom.value = tokensPerPage;
  }
}

function padNum(n, total) {
  const digits = String(total).length;
  return String(n).padStart(digits, '0');
}

function buildToken(n, total) {
  const num = padNum(n, total);
  const sym = getVerifySymbol();
  const verifyBadge = sym
    ? '<div class="tok-verify" style="background:' + acc + ';" title="Verification Symbol">' + sym + '</div>'
    : '';
  return '<div class="tok" style="--t-bg:' + bg + ';--t-acc:' + acc + ';border-color:' + bg + ';">' 
    + '<div class="tok-banner" style="background:' + bg + ';">' 
    + '<img class="tok-logo" src="' + LOGO + '" alt="KPR"/>'
    + '<div class="tok-banner-text">'
    + '<span class="tok-inst">KPR Mess Token</span>'
    + '</div>'
    + (sym ? '<div class="tok-head-sym" style="color:' + acc + ';">' + sym + '</div>' : '')
    + '</div>'
    + '<div class="tok-body">'
    + '<div class="tok-num-wrap" style="border-color:' + acc + ';background:' + bg + '0f;">'
    + '<span class="tok-no-label" style="color:' + bg + ';">NO.</span>'
    + '<span class="tok-num" style="color:' + bg + ';">' + num + '</span>'
    + verifyBadge
    + '</div>'
    + '<div class="tok-meal-row" style="background:' + bg + ';color:' + acc + ';">' + mealLabel + '</div>'
    + '</div>'
    + '</div>';
}

function render() {
  document.documentElement.style.setProperty('--bg', bg);
  document.documentElement.style.setProperty('--acc', acc);
  const el = document.getElementById('countDisplay');
  if (el) el.value = count;
  // Build all HTML in one string, set innerHTML once
  const parts = [];
  for (let i = 1; i <= count; i++) parts.push(buildToken(i, count));
  document.getElementById('tokenGrid').innerHTML = parts.join('');
}

function setCountFromInput(val) {
  const raw = String(val).trim();
  if (raw === '' || raw === '-') return;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > MAX_TOKENS) return;
  count = n;
  scheduleRender();
}

function changeCount(d) {
  const next = count + d;
  if (next < 1 || next > MAX_TOKENS) return;
  count = next;
  render();
}

function setCount(n) {
  if (n < 1 || n > MAX_TOKENS) return;
  count = n;
  render();
}

function setColor(b, a, el) {
  bg = b; acc = a;
  document.querySelectorAll('.csw').forEach(function(s) { s.classList.remove('active'); });
  if (el) el.classList.add('active');
  render();
}

window.addEventListener('DOMContentLoaded', function () {
  var mi = document.getElementById('mealLabel');
  if (mi) mi.value = mealLabel;
  loadTPP();
  syncTPPButtons();
  updateTPPHint();
  render();
});

async function savePDF() {
  const btn = document.querySelector('.btn-pdf');
  const original = btn.textContent;
  btn.textContent = 'Generating\u2026';
  btn.disabled = true;

  const { jsPDF } = window.jspdf;
  const A4_W = 210, A4_H = 297, MARGIN = 8;
  const printW = A4_W - MARGIN * 2;
  const printH = A4_H - MARGIN * 2;

  const tpp = tokensPerPage;
  let cols;
  if (tpp <= 2) cols = 1;
  else if (tpp <= 4) cols = 2;
  else if (tpp === 6 || tpp === 9) cols = 3;
  else cols = 4;
  const rows = Math.ceil(tpp / cols);

  const DPI_SCALE = 3;
  const PX_W = Math.round(printW * DPI_SCALE);
  const PX_H = Math.round(printH * DPI_SCALE);
  const GAP = Math.round(3 * DPI_SCALE);
  const tokW = Math.floor((PX_W - GAP * (cols - 1)) / cols);
  const tokH = Math.floor((PX_H - GAP * (rows - 1)) / rows);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const totalPages = Math.ceil(count / tpp);

  try {
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage();

      const start = page * tpp + 1;
      const end   = Math.min(start + tpp - 1, count);

      const wrap = document.createElement('div');
      Object.assign(wrap.style, {
        position: 'fixed', top: '-9999px', left: '-9999px',
        width: PX_W + 'px',
        display: 'grid',
        gridTemplateColumns: 'repeat(' + cols + ', ' + tokW + 'px)',
        gridTemplateRows: 'repeat(' + rows + ', ' + tokH + 'px)',
        gap: GAP + 'px',
        background: '#ffffff',
        padding: '0',
        boxSizing: 'border-box',
      });

      for (let i = start; i <= end; i++) {
        const cell = document.createElement('div');
        cell.innerHTML = buildToken(i, count);
        const tok = cell.firstElementChild;
        Object.assign(tok.style, {
          width: tokW + 'px',
          height: tokH + 'px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box',
        });
        const scale = tokH / 120;
        tok.querySelector('.tok-num').style.fontSize = Math.max(10, Math.round(26 * scale)) + 'px';
        tok.querySelector('.tok-meal-row').style.fontSize = Math.max(6, Math.round(9 * scale)) + 'px';
        tok.querySelector('.tok-inst').style.fontSize = Math.max(5, Math.round(8 * scale)) + 'px';
        const wrap2 = tok.querySelector('.tok-num-wrap');
        const sz = Math.max(40, Math.round(72 * scale));
        wrap2.style.width = sz + 'px';
        wrap2.style.height = sz + 'px';
        tok.querySelector('.tok-body').style.flex = '1';
        tok.querySelector('.tok-body').style.display = 'flex';
        tok.querySelector('.tok-body').style.flexDirection = 'column';
        tok.querySelector('.tok-body').style.alignItems = 'center';
        tok.querySelector('.tok-body').style.justifyContent = 'center';
        wrap.appendChild(tok);
      }

      document.body.appendChild(wrap);

      const canvas = await html2canvas(wrap, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: PX_W,
        height: PX_H,
        windowWidth: PX_W,
        windowHeight: PX_H,
      });

      document.body.removeChild(wrap);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', MARGIN, MARGIN, printW, printH);
    }

    pdf.save('KPR_Mess_Tokens.pdf');
  } catch (err) {
    console.error('PDF error:', err);
  } finally {
    btn.textContent = original;
    btn.disabled = false;
  }
}
