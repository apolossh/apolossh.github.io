// --- CONFIGURAÇÕES ---
const { jsPDF } = window.jspdf;
const MM_TO_PX = mm => mm * (96 / 25.4);

// Bloqueio de gestos e zoom acidental
document.addEventListener('gesturestart', e => e.preventDefault());
let lastTouchEnd = 0;
document.addEventListener('touchend', e => { 
  const now = (new Date()).getTime(); 
  if (now - lastTouchEnd <= 300) e.preventDefault(); 
  lastTouchEnd = now; 
}, false);

// --- SISTEMA DE AUTENTICAÇÃO (MANTIDO) ---
(function(){
  const content = document.querySelectorAll('.protected');
  const container = document.getElementById('key-container');
  const input = document.getElementById('user-key');
  const userInfo = document.getElementById('user-info');
  
  async function sha1(msg){
    const buffer = new TextEncoder("utf-8").encode(msg);
    const hash = await crypto.subtle.digest("SHA-1", buffer);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  function base36Decode(str){
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for(let i=0; i<str.length; i+=2){
      result += String.fromCharCode(chars.indexOf(str[i]) * 36 + chars.indexOf(str[i+1]));
    }
    return result;
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
    const exp = parseFloat(payload.slice(idx+1));
    return exp > Date.now() || exp < 1e10; // Simplificado para o exemplo
  }

  async function checkKey(key){
    if(await verifyKey(key)){
      content.forEach(c => c.style.display = 'block');
      if(container) container.style.display = 'none';
      localStorage.setItem('user_key', key);
    }
  }

  const storedKey = localStorage.getItem('user_key');
  if(storedKey) checkKey(storedKey);
  
  const submitBtn = document.getElementById('submit-key');
  if(submitBtn) submitBtn.addEventListener('click', () => checkKey(input.value.trim()));
})();

// --- LÓGICA DE IMAGEM E PDF (REVISADA E ROBUSTA) ---
let sourceImage = null;
let generatedPages = [];

// Seletores
const fileInput = document.getElementById('file');
const fileBtn = document.querySelector('.file-upload-btn'); // O botão visível
const fileNameLabel = document.querySelector('.file-name');
const previewImg = document.getElementById('preview-img');
const genBtn = document.getElementById('gen');
const printBtn = document.getElementById('print');
const downloadBtn = document.getElementById('download');
const orientSelect = document.getElementById('orient');
const presetSelect = document.getElementById('preset');
const colsInput = document.getElementById('cols');

// 1. CORREÇÃO DO BOTÃO: Faz o botão bonito clicar no input real
if (fileBtn && fileInput) {
    fileBtn.addEventListener('click', () => fileInput.click());
}

// 2. CARREGAMENTO DA IMAGEM
if (fileInput) {
    fileInput.addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;

        if (fileNameLabel) fileNameLabel.textContent = file.name;

        sourceImage = await new Promise((res) => {
            const img = new Image();
            img.onload = () => res(img);
            img.src = URL.createObjectURL(file);
        });

        if (previewImg) {
            previewImg.src = sourceImage.src;
            previewImg.style.display = 'block';
        }

        genBtn.disabled = false;
        genBtn.style.display = 'inline-block';
        printBtn.style.display = 'none';
        downloadBtn.style.display = 'none';
    });
}

// 3. GERAÇÃO DO MOSAICO COM SANGRE E LINHAS TOTAIS
if (genBtn) {
    genBtn.addEventListener('click', () => {
        if (!sourceImage) return;

        const orient = orientSelect.value || 'portrait';
        const pageWmm = orient === "portrait" ? 210 : 297;
        const pageHmm = orient === "portrait" ? 297 : 210;
        
        const marginMm = 12; // Largura da aba
        const bleedMm = 2;   // Sangria de 2mm para evitar espaços brancos
        
        const pageWpx = MM_TO_PX(pageWmm);
        const pageHpx = MM_TO_PX(pageHmm);
        const marginPx = MM_TO_PX(marginMm);
        const bleedPx = MM_TO_PX(bleedMm);
        
        const printableWpx = pageWpx - marginPx;
        const printableHpx = pageHpx - marginPx;

        let colsCount = presetSelect.value === "custom" ? 
            (parseInt(colsInput.value) || 2) : 
            (parseInt(presetSelect.value.split('x')[1]) || 2);

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

                // Fundo Branco
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const sx = c * srcSliceW;
                const sy = r * srcSliceH;

                // DESENHO COM OVERLAP (SANGRE)
                // Desenhamos a imagem 2mm maior que a área útil para garantir o encaixe
                ctx.drawImage(
                    sourceImage, 
                    sx, sy, srcSliceW, srcSliceH, 
                    0, 0, 
                    printableWpx + bleedPx, 
                    printableHpx + bleedPx
                );

                // LINHAS DE CORTE PONTILHADAS EM TODAS AS BORDAS
                ctx.setLineDash([5, 5]);
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 1;

                // Linha Vertical (Direita)
                ctx.beginPath();
                ctx.moveTo(printableWpx, 0);
                ctx.lineTo(printableWpx, pageHpx);
                ctx.stroke();

                // Linha Horizontal (Baixo)
                ctx.beginPath();
                ctx.moveTo(0, printableHpx);
                ctx.lineTo(pageWpx, printableHpx);
                ctx.stroke();

                // ABAS DE COLAGEM
                ctx.setLineDash([]); 
                ctx.font = "bold 16px sans-serif";
                ctx.textAlign = "center";

                // Aba Lateral
                if (c < colsCount - 1) {
                    ctx.fillStyle = "#f9f9f9";
                    ctx.fillRect(printableWpx, 0, marginPx, printableHpx);
                    ctx.fillStyle = "#000000";
                    ctx.save();
                    ctx.translate(printableWpx + marginPx/2, printableHpx/2);
                    ctx.rotate(Math.PI / 2);
                    ctx.fillText("COLE AQUI", 0, 5);
                    ctx.restore();
                }

                // Aba Inferior
                if (r < actualRows - 1) {
                    ctx.fillStyle = "#f9f9f9";
                    ctx.fillRect(0, printableHpx, printableWpx, marginPx);
                    ctx.fillStyle = "#000000";
                    ctx.fillText("COLE AQUI", printableWpx/2, printableHpx + marginPx/1.5);
                }

                generatedPages.push({ canvas, pageWmm, pageHmm });
            }
        }

        genBtn.style.display = 'none';
        printBtn.style.display = 'inline-block';
        downloadBtn.style.display = 'inline-block';
    });
}

// 4. FUNÇÕES DE EXPORTAÇÃO
function getPDF() {
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
    const pdf = getPDF();
    if(pdf) window.open(pdf.output("bloburl"), "_blank");
});

if(downloadBtn) downloadBtn.addEventListener('click', () => {
    const pdf = getPDF();
    if(pdf) pdf.save(`painel_${Date.now()}.pdf`);
});
