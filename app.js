const LOGO = 'kprietonline_logo.jpg';

let bg  = '#0a1f5c';
let acc = '#d4af37';
let count = 20;
let tokensPerPage = 8;
let mealLabel = localStorage.getItem('kpriet_meal') || 'Friday Lunch';
const MAX_TOKENS = 9999;
const TPP_KEY = 'kpriet_tpp';

function setMealLabel(val) {
  mealLabel = val.trim() || 'Friday Lunch';
  localStorage.setItem('kpriet_meal', mealLabel);
  render();
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
  const mealSVG = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle;margin-right:3px"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>';
  return '<div class="tok" style="border-color:' + bg + ';">'
    + '<div class="tok-head" style="background-color:' + bg + ';">'
    + '<img class="tok-logo" src="' + LOGO + '" alt="KPR" loading="eager"/>'
    + '<div class="tok-college" style="color:#ffffff;">KPR Mess Token</div>'
    + '</div>'
    + '<div class="tok-body">'
    + '<div class="tok-label">Token No.</div>'
    + '<div class="tok-num" style="color:' + bg + ';">' + num + '</div>'
    + '<div class="tok-line" style="background-color:' + acc + ';"></div>'
    + '<div class="tok-meal" style="color:' + bg + ';">' + mealSVG + mealLabel + '</div>'
    + '</div>'
    + '</div>';
}

function render() {
  document.documentElement.style.setProperty('--bg', bg);
  document.documentElement.style.setProperty('--acc', acc);
  const el = document.getElementById('countDisplay');
  if (el) el.value = count;
  let html = '';
  for (let i = 1; i <= count; i++) html += buildToken(i, count);
  document.getElementById('tokenGrid').innerHTML = html;
}

function setCountFromInput(val) {
  const raw = String(val).trim();
  if (raw === '' || raw === '-') return;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > MAX_TOKENS) return;
  count = n;
  render();
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
        tok.querySelector('.tok-num').style.fontSize = Math.max(10, Math.round(28 * scale)) + 'px';
        tok.querySelector('.tok-meal').style.fontSize = Math.max(7, Math.round(10 * scale)) + 'px';
        tok.querySelector('.tok-label').style.fontSize = Math.max(6, Math.round(8 * scale)) + 'px';
        tok.querySelector('.tok-body').style.flex = '1';
        tok.querySelector('.tok-body').style.display = 'flex';
        tok.querySelector('.tok-body').style.flexDirection = 'column';
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
