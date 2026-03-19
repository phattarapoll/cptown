document.addEventListener('DOMContentLoaded', () => {
    const BOOKING_API_URL = 'https://script.google.com/macros/s/AKfycbw8wDGyZWTmG3DLWRwt8_k9x3iYKSxkTl3Rulyll5ObGxOTkJrw3xwB-xBSwBBeOhVE/exec';
    const queueDisplay = document.getElementById('queueDisplay');
    const queueLoading = document.getElementById('queueLoading');

    // --- 1. ฟังก์ชันจัดการวันที่แบบครอบจักรวาล ---
    function parseDateSafe(dateStr) {
        if (!dateStr) return new Date();
        
        // พยายามสร้าง Date Object แบบปกติก่อน
        let d = new Date(dateStr);
        
        // ถ้าสร้างไม่ได้ หรือปีเพี้ยน (เช่น ปี 2026 กลายเป็น 2569) ให้แยกส่วนเอง
        if (isNaN(d.getTime()) || d.getFullYear() > 2500) {
            const parts = String(dateStr).split(/[\/\s,:]+/);
            if (parts.length >= 3) {
                let day = parseInt(parts[0]);
                let month = parseInt(parts[1]) - 1;
                let year = parseInt(parts[2]);
                
                if (year > 2500) year -= 543; // แปลง พ.ศ. เป็น ค.ศ.
                
                let hr = parseInt(parts[3]) || 0;
                let min = parseInt(parts[4]) || 0;
                let sec = parseInt(parts[5]) || 0;
                
                d = new Date(year, month, day, hr, min, sec);
            }
        }
        return isNaN(d.getTime()) ? new Date() : d;
    }

    async function fetchBookingData() {
        if (queueLoading) queueLoading.classList.remove('hidden');
        try {
            const response = await fetch(BOOKING_API_URL);
            const data = await response.json();
            if (queueLoading) queueLoading.classList.add('hidden');
            
            // ตรวจสอบว่ามีข้อมูลส่งมาจริงไหม
            if (Array.isArray(data)) {
                updateQueueDisplay(data);
            } else {
                console.error("Data is not an array:", data);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            if (queueLoading) queueLoading.classList.add('hidden');
            queueDisplay.innerHTML = '<p class="text-center text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
        }
    }

    function updateQueueDisplay(bookings) {
        queueDisplay.innerHTML = '';
        const now = new Date();

        // 2. จัดกลุ่มเช็คคิวซ้ำ
        const grouped = {};
        const processedBookings = bookings.map(b => {
            const bDate = parseDateSafe(b.date);
            return { ...b, parsedDate: bDate };
        });

        processedBookings.forEach(b => {
            const dateKey = b.parsedDate.toDateString();
            const key = `${dateKey}_${b.timeSlot}`;
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

        // 3. แยกคิว
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

        // 4. วาดการแสดงผล
        if (currentAppt) renderCard(currentAppt, true, now);

        if (upcoming.length > 0) {
            queueDisplay.innerHTML += `<div class="text-lg font-bold text-blue-700 mt-6 mb-3 border-b pb-1 px-3">คิวรอรับบริการ</div>`;
            upcoming.forEach(appt => renderCard(appt, false, now));
        } else if (!currentAppt) {
            queueDisplay.innerHTML = '<p class="text-center text-gray-500 py-10">ไม่มีรายการนัดหมายในขณะนี้</p>';
        }
        
        if (typeof handleAutoScroll === 'function') handleAutoScroll();
    }

    function renderCard(appt, isCurrent, now) {
        const isDup = appt.isDuplicate;
        const apptTimestamp = appt.parsedDate;
        
        const fullBookingDate = apptTimestamp.toLocaleDateString('th-TH', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        const card = document.createElement('div');
        card.className = `queue-card mb-4 p-4 rounded-lg border shadow-sm ${isCurrent ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200'}`;
        card.style.borderLeft = `6px solid ${isDup ? '#EF4444' : (isCurrent ? '#3B82F6' : '#10B981')}`;

        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <p class="text-xl font-bold text-gray-800">${maskLastName(appt.patientName)}</p>
                ${isDup ? '<span class="blink-red text-red-600 font-bold text-[10px] border border-red-600 px-2 py-0.5 rounded-full bg-red-50">รอตรวจสอบ (คิวซ้ำ)</span>' 
                        : '<span class="text-green-600 font-bold text-[10px] border border-green-600 px-2 py-0.5 rounded-full bg-green-50">ผ่านการตรวจสอบ</span>'}
            </div>
            <p class="text-blue-800 font-bold text-base">เวลานัด: ${appt.timeSlot}</p>
            <p class="text-gray-500 text-[11px] mt-1">วันนัดบริการ: ${fullBookingDate} น.</p>
            <div class="mt-3 pt-2 border-t border-dashed border-gray-200 flex justify-between items-center text-xs">
                <span class="text-gray-400">สถานะ: ${isCurrent ? 'กำลังรับบริการ' : 'รอเรียก'}</span>
                <span class="time-remaining font-bold ${isCurrent ? 'text-blue-600' : 'text-green-600'}" data-timestamp="${apptTimestamp.getTime()}">
                    ${isCurrent ? 'เข้าพบเจ้าหน้าที่' : 'ในอีก: ' + formatTimeRemaining(apptTimestamp - now)}
                </span>
            </div>
        `;
        queueDisplay.appendChild(card);
    }

    // --- Helper Functions ---
    function maskLastName(name) {
        if (!name) return 'ไม่ระบุชื่อ';
        let parts = name.trim().split(/\s+/);
        return parts.length > 1 ? `${parts[0]} ${parts[1][0]}***` : name;
    }

    function formatTimeRemaining(ms) {
        if (ms < 0) return "ถึงเวลานัด";
        const totalMinutes = Math.floor(ms / 60000);
        const days = Math.floor(totalMinutes / 1440);
        const hours = Math.floor((totalMinutes % 1440) / 60);
        const mins = totalMinutes % 60;
        return `${days > 0 ? days + ' วัน ' : ''}${hours > 0 ? hours + ' ชม. ' : ''}${mins} นาที`;
    }

    // เริ่มทำงาน
    fetchBookingData();
    setInterval(fetchBookingData, 60000);
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