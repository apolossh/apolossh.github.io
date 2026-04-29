// Proteção de gestos e toques originais
document.addEventListener('gesturestart', e => e.preventDefault());
let lastTouchEnd = 0;
document.addEventListener('touchend', e => { 
  const now = (new Date()).getTime(); 
  if (now - lastTouchEnd <= 300) e.preventDefault(); 
  lastTouchEnd = now; 
});
document.body.addEventListener('touchmove', e => { e.preventDefault(); }, { passive:false });

// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => 
    navigator.serviceWorker.register('/painel/service-worker.js').catch(err => console.warn(err))
  );
}

// --- SISTEMA DE KEY E INTERFACE ---
(function(){
  const content=document.querySelectorAll('.protected');
  content.forEach(c=>c.style.display='none');
  const container=document.getElementById('key-container');
  const userInfo=document.getElementById('user-info');
  const input=document.getElementById('user-key');
  let remainingMsGlobal=0;

  function base36Decode(str){
    const chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result='';
    for(let i=0;i<str.length;i+=2){
      result+=String.fromCharCode(chars.indexOf(str[i])*36+chars.indexOf(str[i+1]));
    }
    return result;
  }

  async function sha1(msg){
    const buffer=new TextEncoder("utf-8").encode(msg);
    const hash=await crypto.subtle.digest("SHA-1", buffer);
    return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  async function verifyKey(key){
    const parts=key.split('-');
    if(parts.length!==2) return false;
    let payload;
    try{ payload=base36Decode(parts[0]); } catch(e){ return false; }
    const hash=await sha1(payload);
    if(hash.slice(0,8).toUpperCase()!==parts[1]) return false;
    const idx=payload.lastIndexOf(':');
    if(idx===-1) return false;
    const user=payload.slice(0,idx);
    const exp=parseFloat(payload.slice(idx+1));
    const now=Date.now();
    const remainingMs=exp<1e10? exp*60*1000 : exp-now;
    if(remainingMs<=0) return false;
    return {user, remainingMs};
  }

  function formatRemaining(ms){
    const s=Math.floor(ms/1000), m=Math.floor(s/60), h=Math.floor(m/60), d=Math.floor(h/24);
    const remH=h%24, remM=m%60;
    if(d>=1) return d+' dias '+remH+'h '+remM+'m restantes';
    if(h>=1) return h+'h '+remM+'m restantes';
    if(m>=1) return m+'m restantes';
    return '0m restantes';
  }

  async function checkKey(key){
    const payload=await verifyKey(key);
    if(payload){
      content.forEach(c=>c.style.display='block');
      container.style.display='none';
      localStorage.setItem('user_key',key);
      remainingMsGlobal=payload.remainingMs;
      userInfo.style.display='flex';
      userInfo.querySelector('.name').textContent=payload.user;
      userInfo.querySelector('.validity').textContent=formatRemaining(payload.remainingMs);
      startCountdown();
    } else{
      localStorage.removeItem('user_key');
      const msg = document.getElementById('key-message');
      if(msg) msg.innerText="KEY inválida ou expirada.";
    }
  }

  function startCountdown(){
    if(window.countdownInterval) clearInterval(window.countdownInterval);
    window.countdownInterval=setInterval(()=>{
      remainingMsGlobal-=1000;
      if(remainingMsGlobal<=0){
        clearInterval(window.countdownInterval);
        userInfo.style.display='none';
        content.forEach(c=>c.style.display='none');
        container.style.display='block';
        localStorage.removeItem('user_key');
      } else userInfo.querySelector('.validity').textContent=formatRemaining(remainingMsGlobal);
    },1000);
  }

  const storedKey=localStorage.getItem('user_key');
  if(storedKey) checkKey(storedKey);

  const submitBtn = document.getElementById('submit-key');
  if(submitBtn) submitBtn.addEventListener('click', ()=>checkKey(input.value.trim()));
  if(input) input.addEventListener('keypress', e=>{ if(e.key==='Enter') checkKey(input.value.trim()); });

  const whatsappBtn=document.getElementById('whatsapp-btn');
  if(whatsappBtn) whatsappBtn.addEventListener('click', ()=> window.open('https://wa.me/5511998248013','_blank'));
})();

// --- LÓGICA DE PROCESSAMENTO DE IMAGEM (NOVA REGRA DE RECORTE) ---
const { jsPDF } = window.jspdf;
const MM_TO_PX = mm => mm * (96 / 25.4);

function loadImage(file){
  return new Promise((res, rej)=>{
    const img = new Image();
    img.onload = ()=>res(img);
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

let sourceImage = null;
let generatedPages = [];

// Seletores compatíveis com sua página
const fileInput = document.getElementById('file');
const fileBtn = document.querySelector('.file-upload-btn');
const fileName = document.querySelector('.file-name');
const previewImg = document.getElementById('preview-img');
const genBtn = document.getElementById('gen');
const printBtn = document.getElementById('print');
const downloadBtn = document.getElementById('download');
const orientSelect = document.getElementById('orient');
const presetSelect = document.getElementById('preset');
const rowsInput = document.getElementById('rows');
const colsInput = document.getElementById('cols');

if(fileBtn) fileBtn.addEventListener('click', () => fileInput.click());

if(fileInput) fileInput.addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  
  if(fileName) fileName.textContent = file.name;
  sourceImage = await loadImage(file);
  
  if(previewImg) {
    previewImg.src = URL.createObjectURL(file);
    previewImg.style.display = 'block';
    previewImg.classList.add('show');
  }
  
  atualizarMelhorOrientacao();
  genBtn.disabled = false;
  generatedPages = [];
  printBtn.style.display = 'none';
  downloadBtn.style.display = 'none';
  genBtn.style.display = 'inline-block';
});

function atualizarMelhorOrientacao() {
  if (!sourceImage) return;
  const ratioImg = sourceImage.naturalWidth / sourceImage.naturalHeight;
  const ratioPagePortrait = 210 / 297;
  const ratioPageLandscape = 297 / 210;
  const diffPortrait = Math.abs(ratioImg - ratioPagePortrait);
  const diffLandscape = Math.abs(ratioImg - ratioPageLandscape);
  const melhor = diffLandscape < diffPortrait ? "landscape" : "portrait";
  if (orientSelect) orientSelect.value = melhor;
}

function resetPDFButtons() {
    genBtn.style.display = 'inline-block';
    genBtn.disabled = !sourceImage;
    printBtn.style.display = 'none';
    downloadBtn.style.display = 'none';
}

[rowsInput, colsInput, presetSelect, orientSelect].forEach(el => {
    if(el) el.addEventListener('input', resetPDFButtons);
});

if(presetSelect) presetSelect.addEventListener('change', e => {
    const customGrid = document.getElementById('customGrid');
    if(customGrid) customGrid.style.display = (e.target.value === 'custom') ? 'flex' : 'none';
});

// --- O BOTÃO GERAR COM A NOVA LÓGICA DE RECORTE ---
if(genBtn) genBtn.addEventListener('click', () => {
    if (!sourceImage) return;

    const orient = orientSelect.value || 'portrait';
    const pageWmm = orient === "portrait" ? 210 : 297;
    const pageHmm = orient === "portrait" ? 297 : 210;
    
    const marginMm = 12; // Largura da aba "COLE AQUI"
    const pageWpx = MM_TO_PX(pageWmm);
    const pageHpx = MM_TO_PX(pageHmm);
    const printableWpx = MM_TO_PX(pageWmm - marginMm);
    const printableHpx = MM_TO_PX(pageHmm - marginMm);

    // Determina colunas
    let colsCount;
    if(presetSelect.value !== "custom") {
        colsCount = parseInt(presetSelect.value.split('x')[1]) || 2;
    } else {
        colsCount = parseInt(colsInput.value) || 2;
    }

    // LÓGICA DE RECORTE PROPORCIONAL
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
            const sw = Math.min(srcSliceW, sourceImage.naturalWidth - sx);
            const sh = Math.min(srcSliceH, sourceImage.naturalHeight - sy);

            const dw = sw * scale;
            const dh = sh * scale;

            // Desenha sem esticar
            ctx.drawImage(sourceImage, sx, sy, sw, sh, 0, 0, dw, dh);

            // Abas de colagem
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "#888888";
            ctx.lineWidth = 1;

            if (c < colsCount - 1 && sw >= srcSliceW * 0.98) {
                ctx.strokeRect(dw, 0, MM_TO_PX(marginMm), dh);
                ctx.save();
                ctx.translate(dw + MM_TO_PX(marginMm) / 2, dh / 2);
                ctx.rotate(Math.PI / 2);
                ctx.fillStyle = "#000"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
                ctx.fillText("COLE AQUI", 0, 0);
                ctx.restore();
            }

            if (r < actualRows - 1 && sh >= srcSliceH * 0.98) {
                ctx.strokeRect(0, dh, dw, MM_TO_PX(marginMm));
                ctx.fillStyle = "#000"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
                ctx.fillText("COLE AQUI", dw / 2, dh + MM_TO_PX(marginMm) / 1.5);
            }

            // Guia de corte
            ctx.setLineDash([]);
            ctx.strokeStyle = "#cccccc";
            ctx.strokeRect(0, 0, dw, dh);

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
        pdf.addImage(pg.canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pg.pageWmm, pg.pageHmm);
    });
    return pdf;
}

if(printBtn) printBtn.addEventListener('click', () => {
    const pdf = generatePDF();
    if (pdf) {
        pdf.autoPrint();
        window.open(pdf.output("bloburl"), "_blank");
    }
});

if(downloadBtn) downloadBtn.addEventListener('click', async () => {
    const pdf = generatePDF();
    if (!pdf) return;
    
    const agora = new Date();
    const dataHoraNome = `${agora.getDate()}-${agora.getMonth()+1}-${agora.getFullYear()}_${agora.getHours()}h${agora.getMinutes()}`;
    const nomeArquivo = `painel_${dataHoraNome}.pdf`;

    const blob = pdf.output("blob");
    const file = new File([blob], nomeArquivo, { type: "application/pdf" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: "Painel PDF" }); } catch (e) {}
    } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = nomeArquivo;
        link.click();
    }
});


