(() => {
  const { jsPDF } = window.jspdf || {};

  const fileInput = document.getElementById("file");
  const fileName = document.querySelector(".file-name");
  const previewImg = document.getElementById("preview-img");

  const orientSelect = document.getElementById("orient");
  const presetSelect = document.getElementById("preset");
  const customGrid = document.getElementById("customGrid");
  const rowsInput = document.getElementById("rows");
  const colsInput = document.getElementById("cols");

  const genBtn = document.getElementById("gen");
  const printBtn = document.getElementById("print");
  const downloadBtn = document.getElementById("download");

  let originalImage = null;
  let generatedPages = [];
  let generatedBlobUrl = null;

  const MM_TO_PX = mm => mm * (96 / 25.4);

  function updatePresetUI() {
    customGrid.style.display = presetSelect.value === "custom" ? "flex" : "none";
  }

  function getGrid() {
    if (presetSelect.value === "custom") {
      return {
        rows: Math.max(1, parseInt(rowsInput.value || "1", 10)),
        cols: Math.max(1, parseInt(colsInput.value || "1", 10))
      };
    }

    const [rows, cols] = presetSelect.value.split("x").map(v => parseInt(v, 10));
    return { rows, cols };
  }

  function revokePdfUrl() {
    if (generatedBlobUrl) {
      URL.revokeObjectURL(generatedBlobUrl);
      generatedBlobUrl = null;
    }
  }

  function resetOutput() {
    generatedPages = [];
    revokePdfUrl();
    printBtn.style.display = "none";
    downloadBtn.style.display = "none";
  }

  fileInput.addEventListener("change", e => {
    const file = e.target.files && e.target.files[0];
    resetOutput();

    if (!file) {
      fileName.textContent = "Nenhum arquivo selecionado";
      previewImg.classList.remove("show");
      previewImg.style.display = "none";
      genBtn.disabled = true;
      return;
    }

    fileName.textContent = file.name;

    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        originalImage = img;
        genBtn.disabled = false;

        previewImg.src = ev.target.result;
        previewImg.style.display = "block";
        requestAnimationFrame(() => previewImg.classList.add("show"));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  presetSelect.addEventListener("change", updatePresetUI);
  updatePresetUI();

  function generatePages() {
    if (!originalImage) return [];

    const orient = orientSelect.value;
    const { cols } = getGrid();

    const pageWmm = orient === "portrait" ? 210 : 297;
    const pageHmm = orient === "portrait" ? 297 : 210;

    const marginMm = 12;
    const printableWmm = pageWmm - marginMm;
    const printableHmm = pageHmm - marginMm;

    const pageWpx = MM_TO_PX(pageWmm);
    const pageHpx = MM_TO_PX(pageHmm);
    const printableWpx = MM_TO_PX(printableWmm);
    const printableHpx = MM_TO_PX(printableHmm);

    const srcSliceW = originalImage.naturalWidth / cols;
    const scale = printableWpx / srcSliceW;
    const srcSliceH = printableHpx / scale;

    const actualRows = Math.ceil(originalImage.naturalHeight / srcSliceH);

    const pages = [];

    for (let r = 0; r < actualRows; r++) {
      for (let c = 0; c < cols; c++) {
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(pageWpx);
        canvas.height = Math.round(pageHpx);

        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const sx = c * srcSliceW;
        const sy = r * srcSliceH;

        const sw = Math.min(srcSliceW, originalImage.naturalWidth - sx);
        const sh = Math.min(srcSliceH, originalImage.naturalHeight - sy);

        const dw = sw * scale;
        const dh = sh * scale;

        ctx.drawImage(originalImage, sx, sy, sw, sh, 0, 0, dw, dh);

        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "#bfc7d1";

        if (c < cols - 1 && sw >= srcSliceW * 0.95) {
          ctx.strokeRect(dw, 0, MM_TO_PX(marginMm), dh);
          ctx.save();
          ctx.translate(dw + MM_TO_PX(marginMm) / 2, dh / 2);
          ctx.rotate(Math.PI / 2);
          ctx.fillStyle = "#7c8794";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("COLE AQUI", 0, 0);
          ctx.restore();
        }

        if (r < actualRows - 1 && sh >= srcSliceH * 0.95) {
          ctx.strokeRect(0, dh, dw, MM_TO_PX(marginMm));
          ctx.fillStyle = "#7c8794";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("COLE AQUI", dw / 2, dh + MM_TO_PX(marginMm) / 1.5);
        }

        ctx.setLineDash([]);
        ctx.strokeStyle = "#e2e8f0";
        ctx.strokeRect(0, 0, dw, dh);

        pages.push({
          canvas,
          w: pageWmm,
          h: pageHmm
        });
      }
    }

    return pages;
  }

  function buildPdfBlob(pages) {
    const first = pages[0];

    const pdf = new jsPDF({
      orientation: first.w > first.h ? "landscape" : "portrait",
      unit: "mm",
      format: [first.w, first.h]
    });

    pages.forEach((pg, i) => {
      if (i > 0) {
        pdf.addPage([pg.w, pg.h], pg.w > pg.h ? "landscape" : "portrait");
      }

      pdf.addImage(
        pg.canvas.toDataURL("image/jpeg", 0.95),
        "JPEG",
        0,
        0,
        pg.w,
        pg.h
      );
    });

    return pdf.output("blob");
  }

  genBtn.addEventListener("click", () => {
    if (!originalImage || !jsPDF) return;

    genBtn.disabled = true;
    genBtn.textContent = "Gerando...";

    setTimeout(() => {
      generatedPages = generatePages();

      if (generatedPages.length) {
        revokePdfUrl();
        generatedBlobUrl = URL.createObjectURL(buildPdfBlob(generatedPages));
        printBtn.style.display = "inline-block";
        downloadBtn.style.display = "inline-block";
      }

      genBtn.disabled = false;
      genBtn.textContent = "Gerar PDF";
    }, 30);
  });

  downloadBtn.addEventListener("click", () => {
    if (!generatedBlobUrl) return;

    const a = document.createElement("a");
    a.href = generatedBlobUrl;
    a.download = "painel-pro-ajustado.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  printBtn.addEventListener("click", () => {
    if (!generatedBlobUrl) return;

    const win = window.open(generatedBlobUrl, "_blank");
    if (!win) return;

    const timer = setInterval(() => {
      try {
        if (win.document.readyState === "complete") {
          clearInterval(timer);
          win.focus();
          win.print();
        }
      } catch (_) {}
    }, 500);
  });
})();
