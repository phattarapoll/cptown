document.addEventListener('DOMContentLoaded', () => {
    // --- 1. การตั้งค่า API URLs ---
    const BOOKING_API_URL = 'https://script.google.com/macros/s/AKfycbw8wDGyZWTmG3DLWRwt8_k9x3iYKSxkTl3Rulyll5ObGxOTkJrw3xwB-xBSwBBeOhVE/exec';
    const NEWS_API_URL = 'https://script.google.com/macros/s/AKfycbzHy1NyAVT3fOQzQpgeKf0L4duDNr94evxd-h-AUkYPKJYhfkQMN7T_iFwjJVtlQlLN/exec';

    // Elements สำหรับระบบคิว
    const queueDisplay = document.getElementById('queueDisplay');
    const queueLoading = document.getElementById('queueLoading');

    // Elements สำหรับกระดานข่าว
    const newsBoard = document.getElementById('newsBoard');
    const newsLoading = document.getElementById('newsLoading');
    const newsError = document.getElementById('newsError');

    // --- 2. ฟังก์ชันจัดการวันที่ (Date Helper) ---
    function parseDateSafe(dateStr) {
        if (!dateStr) return new Date();
        let d = new Date(dateStr);
        if (isNaN(d.getTime()) || d.getFullYear() > 2500) {
            const parts = String(dateStr).split(/[\/\s,:]+/);
            if (parts.length >= 3) {
                let day = parseInt(parts[0]);
                let month = parseInt(parts[1]) - 1;
                let year = parseInt(parts[2]);
                if (year > 2500) year -= 543;
                let hr = parseInt(parts[3]) || 0;
                let min = parseInt(parts[4]) || 0;
                let sec = parseInt(parts[5]) || 0;
                d = new Date(year, month, day, hr, min, sec);
            }
        }
        return isNaN(d.getTime()) ? new Date() : d;
    }

    // --- 3. ระบบจัดการคิว (Queue System) ---
    async function fetchBookingData() {
        if (queueLoading) queueLoading.classList.remove('hidden');
        try {
            const response = await fetch(BOOKING_API_URL);
            const data = await response.json();
            if (queueLoading) queueLoading.classList.add('hidden');
            if (Array.isArray(data)) {
                updateQueueDisplay(data);
            }
        } catch (error) {
            console.error('Fetch Queue Error:', error);
            if (queueLoading) queueLoading.classList.add('hidden');
            queueDisplay.innerHTML = '<p class="text-center text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูลคิว</p>';
        }
    }

    function updateQueueDisplay(bookings) {
        queueDisplay.innerHTML = '';
        const now = new Date();
        const grouped = {};
        const processedBookings = bookings.map(b => ({ ...b, parsedDate: parseDateSafe(b.date) }));

        processedBookings.forEach(b => {
            const key = `${b.parsedDate.toDateString()}_${b.timeSlot}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(b);
        });

        const finalizedBookings = [];
        for (const key in grouped) {
            grouped[key].sort((a, b) => a.parsedDate - b.parsedDate);
            grouped[key].forEach((b, idx) => {
                b.isDuplicate = idx > 0;
                finalizedBookings.push(b);
            });
        }

        let currentAppt = null;
        const upcoming = [];

        finalizedBookings.forEach(booking => {
            const bStart = booking.parsedDate;
            const timeParts = String(booking.timeSlot).split('-');
            const bEnd = new Date(bStart);
            if (timeParts[1]) {
                const [h, m] = timeParts[1].split(':').map(Number);
                bEnd.setHours(h || 0, m || 0, 0, 0);
            }
            if (now >= bStart && now < bEnd && !booking.isDuplicate) {
                currentAppt = booking;
            } else if (bStart > now) {
                upcoming.push(booking);
            }
        });

        if (currentAppt) renderQueueCard(currentAppt, true, now);
        if (upcoming.length > 0) {
            queueDisplay.innerHTML += `<div class="text-lg font-bold text-blue-700 mt-6 mb-3 border-b pb-1 px-3">คิวรอรับบริการ</div>`;
            upcoming.forEach(appt => renderQueueCard(appt, false, now));
        } else if (!currentAppt) {
            queueDisplay.innerHTML = '<p class="text-center text-gray-500 py-10">ไม่มีรายการนัดหมายในขณะนี้</p>';
        }
    }

    function renderQueueCard(appt, isCurrent, now) {
        const isDup = appt.isDuplicate; // เช็คจากข้อมูลว่า "ไม่ปกติ" (ซ้ำ) หรือไม่
        const apptTimestamp = appt.parsedDate;
        const fullBookingDate = apptTimestamp.toLocaleDateString('th-TH', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const card = document.createElement('div');
        card.className = `queue-card mb-4 p-4 rounded-lg border shadow-sm ${isCurrent ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200'}`;
        card.style.borderLeft = `6px solid ${isDup ? '#EF4444' : (isCurrent ? '#3B82F6' : '#10B981')}`;

        // ส่วนของการตัดสินใจเลือกข้อความสถานะ
        let statusText = '';
        if (isDup) {
            // 1. ถ้าไม่ปกติ
            statusText = '<span class="text-red-500 font-bold">ลงทะเบียนใหม่</span>';
        } else if (isCurrent) {
            // 2. ถ้าปกติ และอยู่ในช่วงเวลา
            statusText = 'เข้ารับบริการ';
        } else {
            // 3. ถ้าปกติ และยังไม่ถึงเวลา (หรือเลยเวลามาแล้วในรายการ upcoming)
            statusText = 'รอเรียก';
        }

        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <p class="text-xl font-bold text-gray-800">${maskLastName(appt.patientName)}</p>
                ${isDup ? '<span class="text-red-600 font-bold text-[10px] border border-red-600 px-2 py-0.5 rounded-full bg-red-50">สถานะ : ไม่ปกติ</span>' 
                        : '<span class="text-green-600 font-bold text-[10px] border border-green-600 px-2 py-0.5 rounded-full bg-green-50">สถานะ : ปกติ</span>'}
            </div>
            <p class="text-blue-800 font-bold text-base">เวลานัด: ${appt.timeSlot}</p>
            <p class="text-gray-500 text-[11px] mt-1">วันนัดบริการ: ${fullBookingDate} น.</p>
            <div class="mt-3 pt-2 border-t border-dashed border-gray-200 flex justify-between items-center text-xs">
                <span class="text-gray-400">กรุณา: ${statusText}</span>
                <span class="time-remaining font-bold ${isCurrent ? 'text-blue-600' : 'text-green-600'}" data-timestamp="${apptTimestamp.getTime()}">
                    ${isCurrent ? 'เข้าห้องตรวจ2' : 'ในอีก: ' + formatTimeRemaining(apptTimestamp - now)}
                </span>
            </div>
        `;
        queueDisplay.appendChild(card);
    }

    // --- 4. ระบบกระดานข่าว (News System) ---
    async function fetchNewsFromGoogleSheet() {
        if (!newsBoard) return;
        if (newsLoading) newsLoading.classList.remove('hidden');
        if (newsError) newsError.classList.add('hidden');
        newsBoard.innerHTML = ''; 

        try {
            const response = await fetch(NEWS_API_URL);
            const data = await response.json();
            if (newsLoading) newsLoading.classList.add('hidden');

            if (!data || data.length === 0) {
                newsBoard.innerHTML = '<p class="text-center text-gray-600">ไม่มีข่าวสารในขณะนี้</p>';
                return;
            }

            data.forEach(newsItem => {
                const newsDiv = document.createElement('div');
                newsDiv.className = 'bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-100 mb-3';
                const date = new Date(newsItem.date).toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });

                let linkHtml = '';
                if (newsItem.link && newsItem.link !== '') {
                    linkHtml = `<a href="${newsItem.link}" target="_blank" class="text-blue-600 hover:underline text-xs mt-2 block font-medium">อ่านเพิ่มเติม <i class="fas fa-external-link-alt ml-1"></i></a>`;
                }

                newsDiv.innerHTML = `
                    <p class="font-bold text-primary-navy mb-1">${newsItem.title}</p>
                    <p class="text-[11px] text-gray-500"><i class="far fa-calendar-alt mr-1"></i> ${date}</p>
                    ${linkHtml}
                `;
                newsBoard.appendChild(newsDiv);
            });
        } catch (error) {
            console.error('Fetch News Error:', error);
            if (newsLoading) newsLoading.classList.add('hidden');
            if (newsError) newsError.classList.remove('hidden');
        }
    }

    // --- 5. Helper Functions ---
    function maskLastName(name) {
        if (!name) return 'ไม่ระบุชื่อ';
        let parts = name.trim().split(/\s+/);
        return parts.length > 1 ? `${parts[0]} ${parts[1][0]}***` : name;
    }

    // แก้ไขฟังก์ชันแสดงผลเวลานับถอยหลังตามคำขอ
    function formatTimeRemaining(ms) {
        if (ms < 0) return "ถึงเวลานัด";
        
        const totalMinutes = Math.floor(ms / 60000);
        const days = Math.floor(totalMinutes / 1440);
        const hours = Math.floor((totalMinutes % 1440) / 60);
        const mins = totalMinutes % 60;

        let result = "";
        if (days > 0) result += `${days} วัน `;
        if (hours > 0) result += `${hours} ชม. `;
        result += `${mins} นาที`;
        
        return result.trim();
    }

    // --- 6. เริ่มการทำงาน ---
    fetchBookingData();
    fetchNewsFromGoogleSheet(); // เรียกใช้ระบบข่าว

    // ตั้งเวลาอัปเดตข้อมูลอัตโนมัติ
    setInterval(fetchBookingData, 60000); // อัปเดตคิวทุก 1 นาที
    setInterval(fetchNewsFromGoogleSheet, 300000); // อัปเดตข่าวทุก 5 นาที
    
    // อัปเดตเวลานับถอยหลังทุก 10 วินาที
    setInterval(() => {
        const currentTime = new Date().getTime();
        document.querySelectorAll('.time-remaining').forEach(span => {
            const target = parseInt(span.dataset.timestamp);
            if (span.textContent.includes('ในอีก:')) {
                span.textContent = 'ในอีก: ' + formatTimeRemaining(target - currentTime);
            }
        });
    }, 10000);
});