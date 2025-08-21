const { jsPDF } = window.jspdf;
const MM_TO_PX = mm => mm * (96/25.4);

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

const fileInput = document.getElementById('file');
const genBtn = document.getElementById('gen');
const printBtn = document.getElementById('print');
const downloadBtn = document.getElementById('download');

fileInput.addEventListener('change', async e=>{
  const file = e.target.files[0];
  if(file){
    sourceImage = await loadImage(file);
    document.getElementById('orient').value = sourceImage.naturalWidth > sourceImage.naturalHeight ? "landscape" : "portrait";
    genBtn.disabled = false;
    generatedPages = [];
    printBtn.style.display = 'none';
    downloadBtn.style.display = 'none';
    genBtn.style.display = 'inline-block';
  }
});

document.getElementById('preset').addEventListener('change', e=>{
  document.getElementById('customGrid').style.display = (e.target.value === 'custom') ? 'flex' : 'none';
});

genBtn.addEventListener('click', ()=>{
  if(!sourceImage) return;

  const orient = document.getElementById('orient').value;
  let pageWmm = orient === "portrait" ? 210 : 297;
  let pageHmm = orient === "portrait" ? 297 : 210;
  const pageW = Math.round(MM_TO_PX(pageWmm));
  const pageH = Math.round(MM_TO_PX(pageHmm));

  let rows, cols;
  const preset = document.getElementById('preset').value;
  if(preset !== "custom"){
    [rows, cols] = preset.split("x").map(Number);
  } else {
    rows = parseInt(document.getElementById('rows').value);
    cols = parseInt(document.getElementById('cols').value);
  }

  const tabPx = MM_TO_PX(parseFloat(document.getElementById('tabMm').value));
  const markPx = MM_TO_PX(parseFloat(document.getElementById('markMm').value));

  const sliceWsrc = sourceImage.naturalWidth / cols;
  const sliceHsrc = sourceImage.naturalHeight / rows;

  generatedPages = [];

  for(let r=0; r<rows; r++){
    for(let c=0; c<cols; c++){
      const canvas = document.createElement('canvas');
      canvas.width = pageW;
      canvas.height = pageH;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle="#fff"; ctx.fillRect(0,0,pageW,pageH);

      let availW = pageW - ((c < cols-1) ? tabPx : 0);
      let availH = pageH - ((r < rows-1) ? tabPx : 0);
      const sliceAspect = sliceWsrc/sliceHsrc;
      let drawW = availW, drawH = availW/sliceAspect;
      if(drawH>availH){ drawH=availH; drawW=drawH*sliceAspect; }

      const dx = (pageW - ((c < cols-1) ? tabPx : 0) - drawW)/2;
      const dy = (pageH - ((r < rows-1) ? tabPx : 0) - drawH)/2;

      ctx.drawImage(sourceImage, c*sliceWsrc, r*sliceHsrc, sliceWsrc, sliceHsrc, dx, dy, drawW, drawH);

      ctx.strokeStyle="#000"; ctx.lineWidth=1.5; ctx.setLineDash([]); ctx.strokeRect(dx,dy,drawW,drawH);

      if(c<cols-1 && tabPx>0){
        ctx.fillStyle="#fff"; ctx.fillRect(dx+drawW,dy,tabPx,drawH);
        ctx.strokeStyle="#000"; ctx.strokeRect(dx+drawW,dy,tabPx,drawH);
        ctx.setLineDash([5,3]); ctx.beginPath(); ctx.moveTo(dx+drawW,dy); ctx.lineTo(dx+drawW,dy+drawH); ctx.stroke(); ctx.setLineDash([]);
        ctx.save(); ctx.translate(dx+drawW+tabPx/2, dy+drawH/2); ctx.rotate(-Math.PI/2); ctx.fillStyle="#000"; ctx.font="bold 18px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("COLE AQUI",0,0); ctx.restore();
      }

      if(r<rows-1 && tabPx>0){
        ctx.fillStyle="#fff"; ctx.fillRect(dx,dy+drawH,drawW,tabPx);
        ctx.strokeStyle="#000"; ctx.strokeRect(dx,dy+drawH,drawW,tabPx);
        ctx.setLineDash([5,3]); ctx.beginPath(); ctx.moveTo(dx,dy+drawH); ctx.lineTo(dx+drawW,dy+drawH); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle="#000"; ctx.font="bold 18px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("COLE AQUI", dx+drawW/2, dy+drawH+tabPx/2);
      }

      ctx.strokeStyle="#000"; ctx.lineWidth=1.2; ctx.beginPath();
      ctx.moveTo(dx-markPx,dy); ctx.lineTo(dx,dy); ctx.moveTo(dx,dy-markPx); ctx.lineTo(dx,dy);
      ctx.moveTo(dx+drawW+markPx,dy); ctx.lineTo(dx+drawW,dy); ctx.moveTo(dx+drawW,dy-markPx); ctx.lineTo(dx+drawW,dy);
      ctx.moveTo(dx-markPx,dy+drawH); ctx.lineTo(dx,dy+drawH); ctx.moveTo(dx,dy+drawH+markPx); ctx.lineTo(dx,dy+drawH);
      ctx.moveTo(dx+drawW+markPx,dy+drawH); ctx.lineTo(dx+drawW,dy+drawH); ctx.moveTo(dx+drawW,dy+drawH+markPx); ctx.lineTo(dx+drawW,dy+drawH);
      ctx.stroke();

      generatedPages.push({canvas,pageWmm,pageHmm, row: r, col: c});
    }
  }

  generatedPages.sort((a,b)=> a.row - b.row || a.col - b.col);

  genBtn.style.display = 'none';
  printBtn.style.display = 'inline-block';
  downloadBtn.style.display = 'inline-block';
});

function generatePDF(){
  if(generatedPages.length === 0) return null;
  const w = generatedPages[0].pageWmm;
  const h = generatedPages[0].pageHmm;
  const pdf = new jsPDF({orientation: w>h?"landscape":"portrait", unit:"mm", format:[w,h]});
  generatedPages.forEach((pg,i)=>{
    const img = pg.canvas.toDataURL("image/jpeg",1.0);
    if(i>0) pdf.addPage([pg.pageWmm,pg.pageHmm], w>h?"landscape":"portrait");
    pdf.addImage(img,"JPEG",0,0,pg.pageWmm,pg.pageHmm);
  });
  return pdf;
}

printBtn.addEventListener('click', ()=>{
  const pdf = generatePDF();
  if(pdf){
    pdf.autoPrint();
    window.open(pdf.output("bloburl"),"_blank");
  }
});

downloadBtn.addEventListener('click', async ()=>{
  const pdf = generatePDF();
  if(!pdf) return;

  const blob = pdf.output("blob");
  const file = new File([blob], "painel.pdf", {type:"application/pdf"});

  if(navigator.canShare && navigator.canShare({files:[file]})){
    try { await navigator.share({files:[file], title:"Painel PDF"}); }
    catch(e){ console.log(e); }
  } else {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(link.href);
  }
});

/* ===============================
   SUPORTE PWA COMPLETO INLINE
================================= */

// Manifest dinâmico
const manifest = {
  "name": "Painel PDF",
  "short_name": "Painel",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2196f3",
  "icons": [
    { "src": "painel/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "painel/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
};
const blobManifest = new Blob([JSON.stringify(manifest)], {type: "application/json"});
const manifestURL = URL.createObjectURL(blobManifest);
const linkManifest = document.createElement("link");
linkManifest.rel = "manifest";
linkManifest.href = manifestURL;
document.head.appendChild(linkManifest);

// iOS meta tags
const meta1 = document.createElement("meta");
meta1.name = "apple-mobile-web-app-capable";
meta1.content = "yes";
document.head.appendChild(meta1);

const meta2 = document.createElement("meta");
meta2.name = "apple-mobile-web-app-status-bar-style";
meta2.content = "default";
document.head.appendChild(meta2);

// Service Worker inline
const swCode = `
const CACHE_NAME = "painel-pdf-cache-v1";
const ASSETS = [
  "/",
  "painel.html",
  "painel/script.js",
  "jspdf.umd.min.js"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
`;
const blobSW = new Blob([swCode], {type: "application/javascript"});
const swURL = URL.createObjectURL(blobSW);
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register(swURL).catch(console.error);
}