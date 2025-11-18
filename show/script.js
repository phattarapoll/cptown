// script.js

// กำหนด Worker URL ของ PDF.js (สำคัญมากสำหรับการโหลดไฟล์)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.js';

// กำหนด URL ของไฟล์ PDF ของคุณ
const pdfUrl = 'img/1.pdf';

/**
 * ฟังก์ชันหลักในการโหลดและแสดงผล PDF
 */
async function renderPDF() {
    const container = document.getElementById('pdf-viewer-container');
    
    // 1. โหลดเอกสาร PDF
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdfDocument = await loadingTask.promise;

    // 2. สร้าง PDF Viewer
    // (ใช้ขนาดแรกของ container เป็น viewport)
    const eventBus = new pdfjsViewer.EventBus();
    
    const pdfViewer = new pdfjsViewer.PDFViewer({
        container: container,
        eventBus: eventBus,
        linkService: new pdfjsViewer.PDFLinkService({ eventBus: eventBus }),
        downloadManager: new pdfjsViewer.DownloadManager({}),
        // กำหนดความละเอียดเริ่มต้น (เช่น 1.0 คือ 100%)
        // PDF Reader จะจัดการการซูมด้วยตัวเอง
        scale: 'auto', 
    });

    // 3. กำหนดเอกสารให้กับ Viewer และเริ่มแสดงผล
    pdfViewer.setDocument(pdfDocument);

    // ********* การซูม *********
    // ผู้ใช้สามารถซูมได้โดยใช้ฟังก์ชันในตัวของ PDF Reader ที่เบราว์เซอร์ใช้
    // เช่น Ctrl + Scroll Wheel หรือการใช้ปุ่มซูมของ PDF Reader
    
    console.log(`PDF Document "${pdfUrl}" loaded successfully.`);
}

// เริ่มต้นการทำงานเมื่อหน้าเว็บโหลดเสร็จ
window.onload = renderPDF;