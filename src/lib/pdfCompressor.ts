import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// Configure pdfjs worker URL
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  savingsPercentage: number;
  isCompressed: boolean;
}

/**
 * Automatically compresses PDF files on the client side.
 * Works for both digital PDFs and heavy scanned image PDFs.
 */
export async function compressPdfFile(
  file: File,
  onProgress?: (progressText: string) => void
): Promise<CompressionResult> {
  const originalSize = file.size;

  // If file is already smaller than 150 KB, no heavy rasterization needed
  if (originalSize < 150 * 1024) {
    return {
      compressedFile: file,
      originalSize,
      compressedSize: originalSize,
      savingsPercentage: 0,
      isCompressed: false
    };
  }

  try {
    if (onProgress) onProgress('Membaca struktur PDF...');
    const arrayBuffer = await file.arrayBuffer();

    // Strategy 1: Smart Stream & Object Compression with pdf-lib
    if (onProgress) onProgress('Mengompresi struktur stream PDF...');
    const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    
    // Save with object streams and clean unused objects
    const pdfLibBytes = await srcDoc.save({ useObjectStreams: true });
    
    let bestBytes = pdfLibBytes;

    // Strategy 2: If PDF is still large (> 400 KB) and has pages, attempt page image optimization via Canvas
    if (file.size > 400 * 1024) {
      try {
        if (onProgress) onProgress('Menganalisis halaman & mengompresi gambar skenario...');
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdfJsDoc = await loadingTask.promise;
        const pageCount = pdfJsDoc.numPages;

        // Limit page rasterization to max 30 pages to prevent memory issues
        if (pageCount <= 30) {
          const newPdfDoc = await PDFDocument.create();

          for (let i = 1; i <= pageCount; i++) {
            if (onProgress) onProgress(`Mengompresi Halaman ${i} dari ${pageCount}...`);
            const page = await pdfJsDoc.getPage(i);
            const viewport = page.getViewport({ scale: 1.2 }); // Good balance of sharpness & size

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            // Max dimension constraint for pages (1100px for optimal memory & Firestore compatibility)
            let width = viewport.width;
            let height = viewport.height;
            const maxDim = 1100;

            if (width > maxDim || height > maxDim) {
              const scale = maxDim / Math.max(width, height);
              width = Math.round(width * scale);
              height = Math.round(height * scale);
            }

            canvas.width = width;
            canvas.height = height;

            if (context) {
              await page.render({
                canvasContext: context,
                canvas: canvas,
                viewport: page.getViewport({ scale: canvas.width / (viewport.width / 1.2) })
              }).promise;

              const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.60);
              const jpegImageBytes = await fetch(jpegDataUrl).then(res => res.arrayBuffer());
              
              const embeddedImage = await newPdfDoc.embedJpg(jpegImageBytes);
              const newPage = newPdfDoc.addPage([canvas.width, canvas.height]);
              newPage.drawImage(embeddedImage, {
                x: 0,
                y: 0,
                width: canvas.width,
                height: canvas.height,
              });
            }
          }

          const rasterizedBytes = await newPdfDoc.save({ useObjectStreams: true });
          
          if (rasterizedBytes.length < bestBytes.length) {
            bestBytes = rasterizedBytes;
          }
        }
      } catch (rasterErr) {
        console.warn('PDF page raster compression skipped, using stream compression result:', rasterErr);
      }
    }

    // Check if compression saved space
    if (bestBytes.length < originalSize) {
      const compressedBlob = new Blob([bestBytes], { type: 'application/pdf' });
      const compressedFile = new File([compressedBlob], file.name, {
        type: 'application/pdf',
        lastModified: Date.now()
      });

      const savingsPercentage = Math.round(((originalSize - compressedFile.size) / originalSize) * 100);

      return {
        compressedFile,
        originalSize,
        compressedSize: compressedFile.size,
        savingsPercentage,
        isCompressed: true
      };
    }
  } catch (err) {
    console.error('Gagal mengompresi PDF:', err);
  }

  // Fallback if compression failed or didn't yield smaller size
  return {
    compressedFile: file,
    originalSize,
    compressedSize: originalSize,
    savingsPercentage: 0,
    isCompressed: false
  };
}
