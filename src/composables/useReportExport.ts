import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function useReportExport() {
  const exportarRelatorio = async (selector: string = '.main-content', regionName?: string) => {
    try {
      const elemento = document.querySelector(selector) as HTMLElement;
      if (!elemento) {
        alert('Elemento para exportação não encontrado.');
        return;
      }

      const scale = Math.max(2, window.devicePixelRatio || 1);
      const canvas = await html2canvas(elemento, {
        backgroundColor: '#ffffff',
        useCORS: true,
        scale,
        width: elemento.scrollWidth,
        height: elemento.scrollHeight,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const usableWidth = pageWidth - margin * 2;

      pdf.setFontSize(20);
      pdf.text('Relatório de Monitoramento', margin, 20);

      pdf.setFontSize(12);
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      const horaAtual = new Date().toLocaleTimeString('pt-BR');
      pdf.text(`Data: ${dataAtual}`, margin, 30);
      pdf.text(`Hora: ${horaAtual}`, margin, 37);

      if (regionName) {
        pdf.text(`Região: ${regionName}`, margin, 44);
      }

      pdf.line(margin, 50, pageWidth - margin, 50);

      const canvasWidthPx = canvas.width;
      const canvasHeightPx = canvas.height;

      const imgWidthMm = usableWidth;

      const headerHeight = 55;
      const usableHeightFirstPage = pageHeight - margin - headerHeight;
      const usableHeightOtherPages = pageHeight - margin * 2;

      const pxPerMm = canvasWidthPx / imgWidthMm;
      const pxFirstPage = Math.floor(pxPerMm * usableHeightFirstPage);
      const pxOtherPage = Math.floor(pxPerMm * usableHeightOtherPages);

      const sliceCanvas = (srcCanvas: HTMLCanvasElement, sy: number, sh: number) => {
        const slice = document.createElement('canvas');
        slice.width = srcCanvas.width;
        slice.height = sh;
        const ctx = slice.getContext('2d')!;
        ctx.drawImage(srcCanvas, 0, sy, srcCanvas.width, sh, 0, 0, srcCanvas.width, sh);
        return slice;
      };

      let renderedPx = 0;

      const firstSliceHeightPx = Math.min(pxFirstPage, canvasHeightPx - renderedPx);
      if (firstSliceHeightPx > 0) {
        const firstSlice = sliceCanvas(canvas, renderedPx, firstSliceHeightPx);
        const firstData = firstSlice.toDataURL('image/jpeg', 0.95);
        const firstSliceHeightMm = (firstSliceHeightPx * imgWidthMm) / canvasWidthPx;

        pdf.addImage(firstData, 'JPEG', margin, headerHeight, imgWidthMm, firstSliceHeightMm);
        renderedPx += firstSliceHeightPx;
      }

      while (renderedPx < canvasHeightPx) {
        const sliceH = Math.min(pxOtherPage, canvasHeightPx - renderedPx);
        const slice = sliceCanvas(canvas, renderedPx, sliceH);
        const sliceData = slice.toDataURL('image/jpeg', 0.95);
        const sliceHeightMm = (sliceH * imgWidthMm) / canvasWidthPx;

        pdf.addPage();
        pdf.addImage(sliceData, 'JPEG', margin, margin, imgWidthMm, sliceHeightMm);
        renderedPx += sliceH;
      }

      const filename = `relatorio-monitoramento_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.pdf`;
      pdf.save(filename);
    } catch (err) {
      alert('Erro ao exportar relatório: ' + err);
    }
  };

  return {
    exportarRelatorio
  };
}
