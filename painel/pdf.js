document.addEventListener("DOMContentLoaded", function () {
  if (!window.jspdf || !window.jspdf.jsPDF) return;

  const jsPDF = window.jspdf.jsPDF;

  const fileInput = document.getElementById("file");
  const fileName = document.querySelector(".file-name");
  const previewImg = document.getElementById("preview-img");

  const orient = document.getElementById("orient");
  const preset = document.getElementById("preset");
  const customGrid = document.getElementById("customGrid");
  const rows = document.getElementById("rows");
  const cols = document.getElementById("cols");

  const gen = document.getElementById("gen");
  const printBtn = document.getElementById("print");
  const downloadBtn = document.getElementById("download");

  let originalImage = null;
  let pdfBlobUrl = null;

  function mmToPx(mm) {
    return mm * (96 / 25.4);
  }

  function showCustom() {
    customGrid.style.display = preset.value === "custom" ? "flex" : "none";
  }

  function getGrid() {
    if (preset.value === "custom") {
      return {
        rows: Math.max(1, parseInt(rows.value || "1", 10)),
        cols: Math.max(1, parseInt(cols.value || "1", 10))
      };
    }

    const parts = preset.value.split("x");
    return {
      rows: parseInt(parts[0], 10),
      cols: parseInt(parts[1], 10)
    };
  }

  function revokeUrl() {
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      pdfBlobUrl = null;
    }
  }

  function hideActions() {
    printBtn.style.display = "none";
    downloadBtn.style.display = "none";
  }

  function showActions() {
    printBtn.style.display = "inline-block";
    downloadBtn.style.display = "inline-block";
  }

  preset.addEventListener("change", showCustom);
  showCustom();

  fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];

    revokeUrl();
    hideActions();
    gen.disabled = true;
    originalImage = null;

    if (!file) {
      fileName.textContent = "Nenhum arquivo selecionado";
      previewImg.style.display = "none";
      previewImg.classList.remove("show");
      return;
    }

    fileName.textContent = file.name;

    const reader = new FileReader();

    reader.onload = function (ev) {
      const img = new Image();

      img.onload = function () {
        originalImage = img;
        gen.disabled = false;

        previewImg.src = ev.target.result;
        previewImg.style.display = "block";
        setTimeout(function () {
          previewImg.classList.add("show");
        }, 30);
      };

      img.src = ev.target.result;
    };

    reader.readAsDataURL(file);
  });

  gen.addEventListener("click", function () {
    if (!originalImage) return;

    gen.disabled = true;
    gen.textContent = "Gerando...";

    setTimeout(function () {
      const grid = getGrid();
      const colsCount = grid.cols;

      const isPortrait = orient.value === "portrait";

      const pageWmm = isPortrait ? 210 : 297;
      const pageHmm = isPortrait ? 297 : 210;

      const marginMm = 12;

      const printableWmm = pageWmm - marginMm;
      const printableHmm = pageHmm - marginMm;

      const pageWpx = mmToPx(pageWmm);
      const pageHpx = mmToPx(pageHmm);
      const printableWpx = mmToPx(printableWmm);
      const printableHpx = mmToPx(printableHmm);

      const srcSliceW = originalImage.naturalWidth / colsCount;
      const scale = printableWpx / srcSliceW;
      const srcSliceH = printableHpx / scale;

      const totalRows = Math.ceil(originalImage.naturalHeight / srcSliceH);

      const pdf = new jsPDF({
        orientation: isPortrait ? "portrait" : "landscape",
        unit: "mm",
        format: [pageWmm, pageHmm]
      });

      for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < colsCount; c++) {
          if (r !== 0 || c !== 0) {
            pdf.addPage([pageWmm, pageHmm], isPortrait ? "portrait" : "landscape");
          }

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
          ctx.strokeStyle = "#999";

          if (c < colsCount - 1) {
            ctx.strokeRect(dw, 0, mmToPx(marginMm), dh);
          }

          if (r < totalRows - 1) {
            ctx.strokeRect(0, dh, dw, mmToPx(marginMm));
          }

          ctx.setLineDash([]);
          ctx.strokeStyle = "#ddd";
          ctx.strokeRect(0, 0, dw, dh);

          pdf.addImage(
            canvas.toDataURL("image/jpeg", 0.95),
            "JPEG",
            0,
            0,
            pageWmm,
            pageHmm
          );
        }
      }

      revokeUrl();
      pdfBlobUrl = URL.createObjectURL(pdf.output("blob"));

      showActions();

      gen.disabled = false;
      gen.textContent = "Gerar PDF";
    }, 50);
  });

  downloadBtn.addEventListener("click", function () {
    if (!pdfBlobUrl) return;

    const a = document.createElement("a");
    a.href = pdfBlobUrl;
    a.download = "painel.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  printBtn.addEventListener("click", function () {
    if (!pdfBlobUrl) return;

    const win = window.open(pdfBlobUrl, "_blank");
    if (!win) return;

    setTimeout(function () {
      win.focus();
      win.print();
    }, 1000);
  });
});
