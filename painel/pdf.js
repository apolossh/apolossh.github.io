```javascript
/**
 * Script para Gerador de Painéis com Escala Proporcional
 * Versão: 2.0 - Corrigida para evitar distorção (esticar) nas sobras
 */

(function() {
    const { jsPDF } = window.jspdf;
    const MM_TO_PX = mm => mm * (96 / 25.4);
    
    // Seletores do DOM (Baseados no seu código original)
    const fileInput = document.getElementById('file');
    const genBtn = document.getElementById('gen');
    const printBtn = document.getElementById('print');
    const downloadBtn = document.getElementById('download');
    const orientSelect = document.getElementById('orient');
    const colsInput = document.getElementById('cols'); // Campo de número de colunas
    
    let sourceImage = null;
    let generatedPages = [];

    // Função auxiliar para carregar imagem
    function loadImage(file) {
        return new Promise((res, rej) => {
            const img = new Image();
            img.onload = () => res(img);
            img.onerror = rej;
            img.src = URL.createObjectURL(file);
        });
    }

    // Evento de seleção de ficheiro
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        sourceImage = await loadImage(file);
        
        // Reset de estado da UI
        if(genBtn) {
            genBtn.disabled = false;
            genBtn.style.display = 'inline-block';
        }
        if(printBtn) printBtn.style.display = 'none';
        if(downloadBtn) downloadBtn.style.display = 'none';
        generatedPages = [];
    });

    // Lógica Principal de Geração
    if(genBtn) {
        genBtn.addEventListener('click', () => {
            if (!sourceImage) return;

            const orient = orientSelect.value || 'portrait';
            const pageWmm = orient === "portrait" ? 210 : 297;
            const pageHmm = orient === "portrait" ? 297 : 210;
            
            const marginMm = 12; // Largura da aba "COLE AQUI"
            const pageWpx = MM_TO_PX(pageWmm);
            const pageHpx = MM_TO_PX(pageHmm);
            const printableWpx = MM_TO_PX(pageWmm - marginMm);
            const printableHpx = MM_TO_PX(pageHmm - marginMm);

            // 1. Definir quantas colunas o usuário quer (ex: 2 ou 3)
            const colsCount = parseInt(colsInput.value) || 2;

            // 2. Calcular a ESCALA FIXA baseada na largura da folha útil
            // A largura total da imagem original será dividida pelo número de colunas
            const srcSliceW = sourceImage.naturalWidth / colsCount;
            const scale = printableWpx / srcSliceW;
            
            // 3. Calcular a altura de recorte baseada na altura útil da folha
            const srcSliceH = printableHpx / scale;

            // 4. Calcular quantas LINHAS são necessárias de verdade para não esticar nada
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

                    // Coordenadas na imagem original
                    const sx = c * srcSliceW;
                    const sy = r * srcSliceH;

                    // Tamanho do recorte (previne pegar além da imagem na última linha/coluna)
                    const sw = Math.min(srcSliceW, sourceImage.naturalWidth - sx);
                    const sh = Math.min(srcSliceH, sourceImage.naturalHeight - sy);

                    // TAMANHO DE DESTINO PROPORCIONAL (Evita esticar)
                    const dw = sw * scale;
                    const dh = sh * scale;

                    // Desenha o pedaço no canvas
                    ctx.drawImage(sourceImage, sx, sy, sw, sh, 0, 0, dw, dh);

                    // --- DESENHO DAS ABAS DE COLAGEM ---
                    ctx.setLineDash([5, 5]);
                    ctx.strokeStyle = "#888888";
                    ctx.lineWidth = 1;

                    // Aba Lateral Direita (se houver próxima coluna e o pedaço for largura total)
                    if (c < colsCount - 1 && sw >= srcSliceW * 0.98) {
                        ctx.strokeRect(dw, 0, MM_TO_PX(marginMm), dh);
                        ctx.save();
                        ctx.translate(dw + MM_TO_PX(marginMm) / 2, dh / 2);
                        ctx.rotate(Math.PI / 2);
                        ctx.fillStyle = "#666666";
                        ctx.font = "bold 14px sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText("COLE AQUI", 0, 0);
                        ctx.restore();
                    }

                    // Aba Inferior (se houver próxima linha e o pedaço for altura total)
                    if (r < actualRows - 1 && sh >= srcSliceH * 0.98) {
                        ctx.strokeRect(0, dh, dw, MM_TO_PX(marginMm));
                        ctx.fillStyle = "#666666";
                        ctx.font = "bold 14px sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText("COLE AQUI", dw / 2, dh + MM_TO_PX(marginMm) / 1.5);
                    }

                    // Guia de Corte (Borda fina)
                    ctx.setLineDash([]);
                    ctx.strokeStyle = "#eeeeee";
                    ctx.strokeRect(0, 0, dw, dh);

                    generatedPages.push({ canvas, pageWmm, pageHmm });
                }
            }

            // Atualiza UI
            if(genBtn) genBtn.style.display = 'none';
            if(printBtn) printBtn.style.display = 'inline-block';
            if(downloadBtn) downloadBtn.style.display = 'inline-block';
        });
    }

    // Função para gerar o PDF consolidado
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
            const imgData = pg.canvas.toDataURL("image/jpeg", 0.95);
            pdf.addImage(imgData, "JPEG", 0, 0, pg.pageWmm, pg.pageHmm);
        });
        return pdf;
    }

    // Eventos de Exportação
    if(printBtn) {
        printBtn.addEventListener('click', () => {
            const pdf = generatePDF();
            if (pdf) {
                pdf.autoPrint();
                window.open(pdf.output("bloburl"), "_blank");
            }
        });
    }

    if(downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const pdf = generatePDF();
            if (pdf) pdf.save(`painel-pro-${Date.now()}.pdf`);
        });
    }
})();

```
