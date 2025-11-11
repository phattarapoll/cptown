document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const downloadButton = document.getElementById('downloadButton');
    const resultMessage = document.getElementById('resultMessage');
    const resultList = document.getElementById('resultList');
    const bulkDownloadControls = document.getElementById('bulkDownloadControls');
    const bulkDownloadMp3 = document.getElementById('bulkDownloadMp3');
    const bulkDownloadFlac = document.getElementById('bulkDownloadFlac');
    
    let validUrls = []; // เก็บ URL ที่ตรวจสอบแล้วว่าใช้ได้

    downloadButton.addEventListener('click', () => {
        const inputUrls = urlInput.value.trim();
        resultMessage.style.display = 'none';
        resultList.innerHTML = '<h2>รายการผลลัพธ์ (จำลอง)</h2>';
        bulkDownloadControls.style.display = 'none'; // ซ่อนปุ่มโหลดทั้งหมดก่อน
        validUrls = []; // ล้างรายการ URL ที่ใช้ได้เดิม

        // แยก URL โดยใช้บรรทัดใหม่
        const urlsArray = inputUrls.split('\n').map(url => url.trim()).filter(url => url !== "");

        if (urlsArray.length === 0) {
            resultMessage.textContent = '❌ กรุณาป้อน URL อย่างน้อยหนึ่งรายการ';
            resultMessage.classList.add('error');
            resultMessage.style.display = 'block';
            return;
        }

        // ประมวลผลแต่ละ URL
        urlsArray.forEach((url, index) => {
            const isValid = processUrl(url, index + 1);
            if (isValid) {
                validUrls.push(url);
            }
        });

        // แสดงปุ่มโหลดทั้งหมด หากมี URL ที่ใช้ได้
        if (validUrls.length > 0) {
            bulkDownloadControls.style.display = 'flex';
        }

        // แสดงข้อความรวม
        resultMessage.textContent = `✅ ประมวลผล ${validUrls.length} รายการที่รองรับเสร็จสิ้น (จำลอง)`;
        resultMessage.classList.remove('error');
        resultMessage.style.display = 'block';
    });
    
    // --- ฟังก์ชันสำหรับจัดการการดาวน์โหลดทั้งหมด ---
    bulkDownloadMp3.addEventListener('click', () => {
        simulateBulkDownload('MP3 (320K)');
    });

    bulkDownloadFlac.addEventListener('click', () => {
        simulateBulkDownload('FLAC (320K)');
    });

    function simulateBulkDownload(format) {
        if (validUrls.length === 0) {
            alert('⚠️ ไม่มีรายการที่สามารถดาวน์โหลดได้');
            return;
        }

        let message = `🔴 เริ่มการดาวน์โหลด ${format} จำนวน ${validUrls.length} รายการพร้อมกัน (จำลอง):\n\n`;
        validUrls.forEach((url, index) => {
            message += `[#${index + 1}] กำลังเตรียมไฟล์จาก: ${url}\n`;
        });
        
        alert(message);
        
        // ในการใช้งานจริง จะวนซ้ำเรียก API ดาวน์โหลดสำหรับแต่ละ URL ใน validUrls
    }

    // --- ฟังก์ชันประมวลผล URL เดี่ยว (เหมือนเดิม) ---
    function processUrl(url, itemNumber) {
        const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
        const isTiktok = url.includes('tiktok.com');

        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');
        
        let status;
        let platform;
        let title = `[วิดีโอ #${itemNumber}]`; 
        let isValid = false;

        if (isYoutube || isTiktok) {
            status = '✅ พร้อมดาวน์โหลด';
            platform = isYoutube ? 'YouTube' : 'TikTok';
            title = `${platform} คลิป #${itemNumber}`;
            isValid = true;
        } else {
            status = '❌ URL ไม่รองรับ';
            platform = 'ไม่ทราบแพลตฟอร์ม';
        }

        resultItem.innerHTML = `
            <h3>${title}</h3>
            <p><strong>URL ที่ป้อน:</strong> ${url}</p>
            <p><strong>สถานะ:</strong> <span style="color: ${status.startsWith('✅') ? 'green' : 'red'};">${status}</span></p>
            <div class="format-buttons">
                <button class="download-btn mp3-btn" data-format="mp3" data-url="${url}" ${isValid ? '' : 'disabled'} onclick="alert('🔴 [MP3 320k] การดาวน์โหลดจำลองสำหรับ ${platform} กำลังจะเริ่มขึ้น...')">
                    MP3 (320K)
                </button>
                
                <button class="download-btn flac-btn" data-format="flac" data-url="${url}" ${isValid ? '' : 'disabled'} onclick="alert('⚫ [FLAC 320k] การดาวน์โหลดจำลองสำหรับ ${platform} กำลังจะเริ่มขึ้น...')">
                    FLAC (320K)
                </button>
            </div>
        `;

        resultList.appendChild(resultItem);
        return isValid;
    }
});