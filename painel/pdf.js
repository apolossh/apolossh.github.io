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

const tabPx = MM_TO_PX(10);
const markPx = MM_TO_PX(6);

  const sliceWsrc = sourceImage.naturalWidth / cols;
  const sliceHsrc = sourceImage.naturalHeight / rows;

  let maxSliceW = 0;
  let maxSliceH = 0;
  for (let r=0; r<rows; r++) {
    for (let c=0; c<cols; c++) {
      const sliceW = (c === cols-1) ? sourceImage.naturalWidth - c*sliceWsrc : sliceWsrc;
      const sliceH = (r === rows-1) ? sourceImage.naturalHeight - r*sliceHsrc : sliceHsrc;
      maxSliceW = Math.max(maxSliceW, sliceW);
      maxSliceH = Math.max(maxSliceH, sliceH);
    }
  }

  const globalScaleX = (pageW - tabPx) / maxSliceW;
  const globalScaleY = (pageH - tabPx) / maxSliceH;
  const globalScale = Math.min(globalScaleX, globalScaleY);

  generatedPages = [];

  for(let r=0; r<rows; r++){
    const sliceH = (r === rows - 1) ? sourceImage.naturalHeight - r * sliceHsrc : sliceHsrc;

    for(let c=0; c<cols; c++){
      const sliceW = (c === cols - 1) ? sourceImage.naturalWidth - c * sliceWsrc : sliceWsrc;

      const canvas = document.createElement('canvas');
      canvas.width = pageW;
      canvas.height = pageH;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle="#fff"; 
      ctx.fillRect(0,0,pageW,pageH);

      const drawW = sliceW * globalScale;
      const drawH = sliceH * globalScale;

      const dx = (pageW - drawW - (c < cols-1 ? tabPx : 0)) / 2;
      const dy = (pageH - drawH - (r < rows-1 ? tabPx : 0)) / 2;

      ctx.drawImage(sourceImage, c*sliceWsrc, r*sliceHsrc, sliceW, sliceH, dx, dy, drawW, drawH);

      ctx.strokeStyle = "#888";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(dx, dy, drawW, drawH);
      ctx.setLineDash([]);

      if(c < cols - 1 && tabPx > 0){
        ctx.fillStyle="#fff"; 
        ctx.fillRect(dx+drawW, dy, tabPx, drawH);

        ctx.strokeStyle = "#888"; 
        ctx.lineWidth = 1; 
        ctx.setLineDash([4,4]);
        ctx.beginPath();
        ctx.moveTo(dx+drawW, dy);
        ctx.lineTo(dx+drawW, dy+drawH);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = "#000"; 
        ctx.lineWidth = 1.5;
        ctx.strokeRect(dx+drawW, dy, tabPx, drawH);

        ctx.setLineDash([5,3]);
        ctx.beginPath(); ctx.moveTo(dx+drawW,dy); ctx.lineTo(dx+drawW,dy+drawH); ctx.stroke();
        ctx.setLineDash([]);
        ctx.save();
        ctx.translate(dx+drawW+tabPx/2, dy+drawH/2);
        ctx.rotate(-Math.PI/2);
        ctx.fillStyle="#000"; ctx.font="bold 18px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText("COLE AQUI",0,0);
        ctx.restore();
      }

      if(r < rows - 1 && tabPx > 0){
        ctx.fillStyle="#fff"; 
        ctx.fillRect(dx, dy+drawH, drawW, tabPx);

        ctx.strokeStyle = "#888"; 
        ctx.lineWidth = 1; 
        ctx.setLineDash([4,4]);
        ctx.beginPath();
        ctx.moveTo(dx, dy+drawH);
        ctx.lineTo(dx+drawW, dy+drawH);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = "#000"; 
        ctx.lineWidth = 1.5;
        ctx.strokeRect(dx, dy+drawH, drawW, tabPx);

        ctx.setLineDash([5,3]);
        ctx.beginPath(); ctx.moveTo(dx,dy+drawH); ctx.lineTo(dx+drawW,dy+drawH); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle="#000"; ctx.font="bold 18px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText("COLE AQUI", dx+drawW/2, dy+drawH+tabPx/2);
      }

      ctx.strokeStyle="#000"; ctx.lineWidth=1.2; ctx.beginPath();
      ctx.moveTo(dx-markPx,dy); ctx.lineTo(dx,dy);
      ctx.moveTo(dx,dy-markPx); ctx.lineTo(dx,dy);
      ctx.moveTo(dx+drawW+markPx,dy); ctx.lineTo(dx+drawW,dy);
      ctx.moveTo(dx+drawW,dy-markPx); ctx.lineTo(dx+drawW,dy);
      ctx.moveTo(dx-markPx,dy+drawH); ctx.lineTo(dx,dy+drawH);
      ctx.moveTo(dx,dy+drawH+markPx); ctx.lineTo(dx,dy+drawH);
      ctx.moveTo(dx+drawW+markPx,dy+drawH); ctx.lineTo(dx+drawW,dy+drawH);
      ctx.moveTo(dx+drawW,dy+drawH+markPx); ctx.lineTo(dx+drawW,dy+drawH);
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
  c