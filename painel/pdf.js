// --- CONFIGURAÇÕES TÉCNICAS E UTILITÁRIOS ---
const { jsPDF } = window.jspdf;
const MM_TO_PX = mm => mm * (96 / 25.4);

// Bloqueio de gestos para experiência de App
document.addEventListener('gesturestart', e => e.preventDefault());
let lastTouchEnd = 0;
document.addEventListener('touchend', e => { 
  const now = (new Date()).getTime(); 
  if (now - lastTouchEnd <= 300) e.preventDefault(); 
  lastTouchEnd = now; 
}, false);
document.body.addEventListener('touchmove', e => { e.preventDefault(); }, { passive:false });

// Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => 
    navigator.serviceWorker.register('/painel/service-worker.js').catch(err => console.warn(err))
  );
}

// --- SISTEMA DE AUTENTICAÇÃO ---
(function(){
  const content = document.querySelectorAll('.protected');
  const container = document.getElementById('key-container');
  const userInfo = document.getElementById('user-info');
  const input = document.getElementById('user-key');
  let remainingMsGlobal = 0;

  function base36Decode(str){
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for(let i=0; i<str.length; i+=2){
      result += String.fromCharCode(chars.indexOf(str[i]) * 36 + chars.indexOf(str[i+1]));
    }
    return result;
  }

  async function sha1(msg){
    const buffer = new TextEncoder("utf-8").encode(msg);
    const hash = await crypto.subtle.digest("SHA-1", buffer);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  async function verifyKey(key){
    const parts = key.split('-');
    if(parts.length !== 2) return false;
    let payload;
    try { payload = base36Decode(parts[0]); } catch(e){ return false; }
    const hash = await sha1(payload);
    if(hash.slice(0,8).toUpperCase() !== parts[1]) return false;
    const idx = payload.lastIndexOf(':');
    if(idx === -1) return false;
    const user = payload.slice(0, idx);
    const exp = parseFloat(payload.slice(idx+1));
    const now = Date.now();
    const remainingMs = exp < 1e10 ? exp * 60 * 1000 : exp - now;
    if(remainingMs <= 0) return false;
    return {user, remainingMs};
  }

  function formatRemaining(ms){
    const s = Math.floor(ms/1000), m = Math.floor(s/60), h = Math.floor(m/60), d = Math.floor(h/24);
    const remH = h % 24, remM = m % 60;
    if(d >= 1) return `${d}d ${remH}h ${remM}m`;
    if(h >= 1) return `${h}h ${remM}m`;
    return `${remM}m restantes`;
  }

  async function checkKey(key){
    const payload = await verifyKey(key);
    if(payload){
      content.forEach(c => c.style.display = 'block');
      if(container) container.style.display = 'none';
      localStorage.setItem('user_key', key);
      remainingMsGlobal = payload.remainingMs;
      if(userInfo) {
        userInfo.style.display = 'flex';
        userInfo.querySelector('.name').textContent = payload.user;
        userInfo.querySelector('.validity').textContent = formatRemaining(payload.remainingMs);
      }
      startCountdown();
    } else {
      localStorage.removeItem('user_key');
      const msg = document.getElementById('key-message');
      if(msg) msg.innerText = "KEY inválida ou expirada.";
    }
  }

  function startCountdown(){
    if(window.countdownInterval) clearInterval(window.countdownInterval);
    window.countdownInterval = setInterval(() => {
      remainingMsGlobal -= 1000;
      if(remainingMsGlobal <= 0){
        clearInterval(window.countdownInterval);
        location.reload();
      } else if(userInfo) {
        userInfo.querySelector('.validity').textContent = formatRemaining(remainingMsGlobal);
      }
    }, 1000);
  }

  const storedKey = localStorage.getItem('user_key');
  if(storedKey) checkKey(storedKey);

  const submitBtn = document.getElementById('submit-key');
  if(submitBtn) submitBtn.addEventListener('click', () => checkKey(input.value.trim()));
})();

// --- LÓGICA DE PROCESSAMENTO DE IMAGEM ---
let sourceImage = null;
let generatedPages = [];

const fileInput = document.getElementById('file');
const previewImg = document.getElementById('preview-img');
const genBtn = document.getElementById('gen');
const printBtn = document.getElementById('print');
const downloadBtn = document.getElementById('download');
const orientSelect = document.getElementById('orient');
const presetSelect = document.getElementById('preset');
const colsInput = document.getElementById('cols');

if(fileInput) {
    fileInput.addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        sourceImage = await loadImage(file);
        previewImg.src = URL.createObjectURL(file);
        previewImg.style.display = 'block';
        genBtn.disabled = false;
        resetUI();
    });
}

function loadImage(file) {
    return new Promise((res) => {
        const img = new Image();
        img.onload = () => res(img);
        img.src = URL.createObjectURL(file);
    });
}

function resetUI() {
    printBtn.style.display = 'none';
    downloadBtn.style.display = 'none';
    genBtn.style.display = 'inline-block';
}

if(genBtn) genBtn.addEventListener('click', () => {
    if (!sourceImage) return;

    const orient = orientSelect.value || 'portrait';
    const pageWmm = orient === "portrait" ? 210 : 297;
    const pageHmm = orient === "portrait" ? 297 : 210;
    
    const marginMm = 12; // Aba de colagem
    const bleedMm = 1.5; // Sangria (sobreposição) para evitar bordas brancas
    
    const pageWpx = MM_TO_PX(pageWmm);
    const pageHpx = MM_TO_PX(pageHmm);
    const marginPx = MM_TO_PX(marginMm);
    const bleedPx = MM_TO_PX(bleedMm);
    
    const printableWpx = pageWpx - marginPx;
    const printableHpx = pageHpx - marginPx;

    let colsCount = presetSelect.value === "custom" ? parseInt(colsInput.value) : parseInt(presetSelect.value.split('x')[1]);
    if(!colsCount) colsCount = 2;

    const srcSliceW = sourceImage.naturalWidth / colsCount;
    const scale = printableWpx / srcSliceW;
    const srcSliceH = printableHpx / scale;
    const actualRows = Math.ceil(sourceImage.naturalHeight / srcSliceH);

    generatedPages = [];

    for (let r = 0; r < actualRows; r++) {
        for (let c = 0; c < colsCount; c++) {
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(pageWpx);
            canvas.height = Math.round(pageHpx);
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const sx = c * srcSliceW;
            const sy = r * srcSliceH;
            const sw = srcSliceW; 
            const sh = srcSliceH;

            // --- DESENHO DA IMAGEM COM SANGRE (BLEED) ---
            // Desenhamos um pouco a mais (bleedPx) para garantir que não falte cor na dobra/corte
            ctx.drawImage(
                sourceImage, 
                sx, sy, sw, sh, 
                0, 0, 
                printableWpx + bleedPx, 
                printableHpx + bleedPx
            );

            // --- LINHAS DE CORTE PONTILHADAS EM TODAS AS MARGENS ---
            ctx.setLineDash([8, 4]);
            ctx.strokeStyle = "#aaaaaa";
            ctx.lineWidth = 1;

            // Linha Vertical Direita (Corte/Dobra)
            ctx.beginPath();
            ctx.moveTo(printableWpx, 0);
            ctx.lineTo(printableWpx, printableHpx);
            ctx.stroke();

            // Linha Horizontal Inferior (Corte/Dobra)
            ctx.beginPath();
            ctx.moveTo(0, printableHpx);
            ctx.lineTo(printableWpx, printableHpx);
            ctx.stroke();

            // --- ABAS DE COLAGEM ---
            ctx.setLineDash([]); // Linha contínua para delimitar a aba
            ctx.fillStyle = "#000000";
            ctx.font = "bold 14px Arial";
            ctx.textAlign = "center";

            // Aba Lateral (Direita)
            if (c < colsCount - 1) {
                ctx.strokeStyle = "#cccccc";
                ctx.strokeRect(printableWpx, 0, marginPx, printableHpx);
                
                ctx.save();
                ctx.translate(printableWpx + marginPx/2, printableHpx/2);
                ctx.rotate(Math.PI / 2);
                ctx.fillText("COLE AQUI", 0, 5);
                ctx.restore();
            }

            // Aba Inferior
            if (r < actualRows - 1) {
                ctx.strokeStyle = "#cccccc";
                ctx.strokeRect(0, printableHpx, printableWpx, marginPx);
                ctx.fillText("COLE AQUI", printableWpx/2, printableHpx + marginPx/1.5);
            }

            generatedPages.push({ canvas, pageWmm, pageHmm });
        }
    }

    genBtn.style.display = 'none';
    printBtn.style.display = 'inline-block';
    downloadBtn.style.display = 'inline-block';
});

function generatePDF() {
    if (generatedPages.length === 0) return null;
    const first = generatedPages[0];
    const pdf = new jsPDF({
        orientation: first.pageWmm > first.pageHmm ? "landscape" : "portrait",
        unit: "mm",
        format: [first.pageWmm, first.pageHmm]
    });

    generatedPages.forEach((pg, i) => {
        if (i > 0) pdf.addPage([pg.pageWmm, pg.pageHmm], pg.pageWmm > pg.pageHmm ? "landscape" : "portrait");
        pdf.addImage(pg.canvas.toDataURL("image/jpeg", 0.98), "JPEG", 0, 0, pg.pageWmm, pg.pageHmm);
    });
    return pdf;
}

if(printBtn) printBtn.addEventListener('click', () => {
    const pdf = generatePDF();
    if (pdf) window.open(pdf.output("bloburl"), "_blank");
});

if(downloadBtn) downloadBtn.addEventListener('click', () => {
    const pdf = generatePDF();
    if (pdf) pdf.save(`painel_${Date.now()}.pdf`);
});
