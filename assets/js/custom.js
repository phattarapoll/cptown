// custom.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. ADMIN Login
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const ADMIN_PASSWORD = '3946'; // Hardcoded ADMIN password

    adminLoginBtn.addEventListener('click', () => {
        const password = prompt('กรุณาใส่รหัสผ่าน ADMIN:');
        if (password === ADMIN_PASSWORD) {
            alert('เข้าสู่ระบบ ADMIN สำเร็จ!');
            // Redirect to a private link or show admin-specific content
            window.location.href = 'https://cptown.6te.net/ADM.html'; // Placeholder link
        } else {
            alert('รหัสผ่านไม่ถูกต้อง!');
        }
    });

    // 2. Queue Display Functionality (Replaces Chat)
    const queueDisplay = document.getElementById('queueDisplay');
    const queueLoading = document.getElementById('queueLoading');
    const queueError = document.getElementById('queueError');
    const scrollingQueueContainer = document.querySelector('.scrolling-queue-container');
	const queueFullscreenToggle = document.getElementById('queueFullscreenToggle');

    // ** เพิ่มโค้ดสำหรับ Fullscreen API ที่นี่ **
    queueFullscreenToggle.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            // หากยังไม่ได้อยู่ในโหมดเต็มจอ ให้เข้าโหมดเต็มจอ
            if (scrollingQueueContainer.requestFullscreen) {
                scrollingQueueContainer.requestFullscreen();
            } else if (scrollingQueueContainer.mozRequestFullScreen) { /* Firefox */
                scrollingQueueContainer.mozRequestFullScreen();
            } else if (scrollingQueueContainer.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
                scrollingQueueContainer.webkitRequestFullscreen();
            } else if (scrollingQueueContainer.msRequestFullscreen) { /* IE/Edge */
                scrollingQueueContainer.msRequestFullscreen();
            }
        } else {
            // หากอยู่ในโหมดเต็มจอ ให้กดออกจากโหมดเต็มจอ
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { /* Firefox */
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE/Edge */
                document.msExitFullscreen();
            }
        }
    });

    // Event listener สำหรับเมื่อสถานะ Fullscreen มีการเปลี่ยนแปลง
    document.addEventListener('fullscreenchange', () => {
    const isFullscreen = document.fullscreenElement === scrollingQueueContainer;
    const fullscreenInfoRight = document.querySelector('.fullscreen-info-right');

    if (isFullscreen) {
        scrollingQueueContainer.classList.add('fullscreen-active', 'fullscreen-split');
        queueDisplay.style.height = '100%';
        queueDisplay.style.maxHeight = 'none';
        fullscreenInfoRight.classList.remove('hidden'); // แสดงข้อมูลด้านขวา
    } else {
        scrollingQueueContainer.classList.remove('fullscreen-active', 'fullscreen-split');
        queueDisplay.style.height = '600px';
        queueDisplay.style.maxHeight = '600px';
        fullscreenInfoRight.classList.add('hidden'); // ซ่อนข้อมูลด้านขวา
    }
});
	
	

    // สำคัญ: แทนที่ 'กรุณาใส่ URL Web App ของ Google Apps Script สำหรับฟังก์ชันคิวบริการที่นี่' ด้วย URL ที่ Deploy แล้วของคุณ
    const BOOKING_API_URL = 'https://script.google.com/macros/s/AKfycbw8wDGyZWTmG3DLWRwt8_k9x3iYKSxkTl3Rulyll5ObGxOTkJrw3xwB-xBSwBBeOhVE/exec'; // ตรวจสอบให้แน่ใจว่าเป็น URL ที่ Deploy แล้วของคุณ

    // กำหนดช่วงเวลาที่เกี่ยวข้องและประเภทของมันทั้งหมด
    const TIME_STATUS_SLOTS = [
        { start: '08:30', end: '09:30', type: 'operational', label: 'คิวที่1' },
        { start: '09:30', end: '10:30', type: 'operational', label: 'คิวที่2' },
        { start: '10:30', end: '11:00', type: 'operational', label: 'คิวที่3' },
        { start: '11:00', end: '11:30', type: 'operational', label: 'คิวที่4' },
        { start: '08:00', end: '08:30', type: 'preparing', label: 'เตรียมให้บริการ' },
        { start: '12:00', end: '13:00', type: 'preparing', label: 'พักเที่ยง' },
		{ start: '13:00', end: '16:30', type: 'preparing', label: 'งานเอกสาร/ล้างเครื่องมือ/ออกหน่วย' },
        { start: '16:30', end: '07:59', type: 'closed', label: 'ปิดบริการ' } // อันนี้ข้ามเที่ยงคืน
    ];

    // ฟังก์ชันช่วยเหลือเพื่อกำหนดสถานะบริการปัจจุบันตามเวลา
    function getCurrentServiceStatus(checkTime) {
		const dayOfWeek = checkTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
            return { type: 'closed', label: 'ปิดทำการวันหยุดสุดสัปดาห์' };
        }
        const checkHours = checkTime.getHours();
        const checkMinutes = checkTime.getMinutes();

        for (const slot of TIME_STATUS_SLOTS) {
            const [startHours, startMinutes] = slot.start.split(':').map(Number);
            const [endHours, endMinutes] = slot.end.split(':').map(Number);

            const slotStartTime = new Date(checkTime);
            slotStartTime.setHours(startHours, startMinutes, 0, 0);

            const slotEndTime = new Date(checkTime);
            slotEndTime.setHours(endHours, endMinutes, 0, 0);

            // จัดการช่วงเวลาปิดบริการข้ามคืน (เช่น 16:01 ถึง 07:59)
            if (slot.type === 'closed' && startHours > endHours) {
                // ถ้าเวลาปัจจุบันอยู่หลังช่วงเวลาเริ่มต้นของช่วงปิดของวันนี้ หรือก่อนเวลาสิ้นสุดของช่วงปิดของวันพรุ่งนี้
                const isAfterStartToday = (checkHours > startHours) || (checkHours === startHours && checkMinutes >= startMinutes);
                const isBeforeEndTomorrow = (checkHours < endHours) || (checkHours === endHours && checkMinutes <= endMinutes);

                if (isAfterStartToday || isBeforeEndTomorrow) {
                    return slot;
                }
            } else { // จัดการช่วงเวลาปกติรายวัน
                if (checkTime >= slotStartTime && checkTime < slotEndTime) {
                    return slot;
                }
            }
        }
        // หากไม่มีช่วงเวลาใดตรงกัน จะถือว่าอยู่นอกเวลาทำการที่กำหนด (เช่น ช่วงพักกลางวัน)
        return { type: 'out_of_defined_hours', label: 'นอกเวลาทำการที่กำหนด' };
    }

    function formatTimeRemaining(ms) {
        if (ms < 0) return "เลยเวลาแล้ว";
        const totalSeconds = Math.floor(ms / 1000);
        const days = Math.floor(totalSeconds / (3600 * 24));
        const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        let parts = [];
        if (days > 0) parts.push(`${days} วัน`);
        if (hours > 0) parts.push(`${hours} ชั่วโมง`);
        if (minutes > 0) parts.push(`${minutes} นาที`);

        return parts.length > 0 ? parts.join(' ') : 'กำลังจะเริ่ม';
    }

    async function fetchBookingData() {
        queueLoading.classList.remove('hidden'); // แสดงตัวโหลด
        queueError.classList.add('hidden'); // ซ่อนข้อความข้อผิดพลาด

        if (BOOKING_API_URL === 'https://script.google.com/macros/s/AKfycbwPyF_H9CQx2mBqb-C5CwaG3kKFI4nXgfSYY67LhKtrfcwSq2hPPBBLrwqhfmG8Epko/exec' || BOOKING_API_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL')) { // ตรวจสอบ URL Placeholder
            console.error('ข้อผิดพลาด: กรุณาใส่ URL ของ Google Apps Script Web App สำหรับคิวบริการในไฟล์ custom.js');
            queueLoading.classList.add('hidden');
            queueError.classList.remove('hidden');
            queueError.querySelector('p').textContent = 'ข้อผิดพลาด: กรุณาตั้งค่า URL สำหรับคิวบริการใน custom.js ให้ถูกต้อง';
            return;
        }

        try {
            const response = await fetch(BOOKING_API_URL);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            const data = await response.json();

            queueLoading.classList.add('hidden'); // ซ่อนตัวโหลดหลังจากโหลดข้อมูลสำเร็จ

            if (data.error) {
                console.error('Error fetching booking data:', data.error);
                queueError.classList.remove('hidden');
                queueError.querySelector('p').textContent = 'ไม่สามารถโหลดคิวได้: ' + data.error;
                return;
            }
            
            // Log ข้อมูลที่ได้รับจาก Apps Script เพื่อตรวจสอบ
            console.log("Data fetched from Apps Script:", data);

            updateQueueDisplay(data);

        } catch (error) {
            console.error('Error fetching booking data:', error);
            queueLoading.classList.add('hidden'); // ซ่อนตัวโหลด
            queueError.classList.remove('hidden'); // แสดงข้อความแสดงข้อผิดพลาด
            queueError.querySelector('p').textContent = 'ไม่สามารถโหลดคิวได้ กรุณาลองใหม่อีกครั้ง หรือตรวจสอบการตั้งค่า Apps Script และ URL (ข้อผิดพลาด CORS หรือเครือข่าย)';
        }
    }

    function updateQueueDisplay(bookings) {
        queueDisplay.innerHTML = ''; // ล้างการแสดงผลปัจจุบัน
        const now = new Date(); // เวลาปัจจุบันที่แน่นอน

        const currentServiceStatus = getCurrentServiceStatus(now); // รับสถานะของเวลาปัจจุบัน

        // --- แสดงสถานะบริการปัจจุบัน (ปิด/เตรียมให้บริการ/นอกเวลา) ---
        if (currentServiceStatus.type === 'closed') {
            const closedCard = document.createElement('div');
            closedCard.classList.add('queue-card', 'bg-red-100', 'border-red-400');
            closedCard.innerHTML = `
                <div class="flex items-center mb-2">
                    <i class="fas fa-door-closed text-red-600 text-xl mr-2"></i>
                    <p class="font-bold text-red-800 text-lg">สถานะปัจจุบัน:</p>
                </div>
                <p class="text-red-700 text-xl font-semibold">${currentServiceStatus.label}</p>
                <p class="text-gray-600 text-sm mt-1">กรุณามาตามเวลานัด</p>
            `;
            queueDisplay.appendChild(closedCard);
            // ไม่มี 'return;' ที่นี่ เพื่อให้แสดงคิวที่กำลังจะมาถึงต่อได้
        } else if (currentServiceStatus.type === 'preparing') {
            const preparingCard = document.createElement('div');
            preparingCard.classList.add('queue-card', 'bg-orange-100', 'border-orange-400');
            preparingCard.innerHTML = `
                <div class="flex items-center mb-2">
                    <i class="fas fa-hourglass-start text-orange-600 text-xl mr-2"></i>
                    <p class="font-bold text-orange-800 text-lg">สถานะปัจจุบัน:</p>
                </div>
                <p class="text-orange-700 text-xl font-semibold">${currentServiceStatus.label}</p>
                <p class="text-gray-600 text-sm mt-1">ตรวจฟัน ห้องตรวจ2</p>
            `;
            queueDisplay.appendChild(preparingCard);
            // ไม่มี 'return;' ที่นี่
        } else if (currentServiceStatus.type === 'out_of_defined_hours') {
            const outOfHoursCard = document.createElement('div');
            outOfHoursCard.classList.add('queue-card', 'bg-gray-100', 'border-gray-300');
            outOfHoursCard.innerHTML = `
                <div class="flex items-center mb-2">
                    <i class="fas fa-clock text-gray-500 text-xl mr-2"></i>
                    <p class="font-bold text-gray-700 text-lg">สถานะปัจจุบัน:</p>
                </div>
                <p class="text-gray-600 text-xl font-semibold">นอกเวลาทำการ</p>
                <p class="text-gray-500 text-sm mt-1">โปรดตรวจสอบเวลาให้บริการ</p>
            `;
            queueDisplay.appendChild(outOfHoursCard);
            // ไม่มี 'return;' ที่นี่
        }


        // --- ดำเนินการต่อเพื่อแสดงคิวปัจจุบันและคิวที่กำลังจะมาถึง ---
        let currentAppointment = null;
        const upcomingAppointments = [];

        for (const booking of bookings) {
            const bookingStartDateTime = new Date(booking.date);
            
            const timeParts = booking.timeSlot.split('-');
            let bookingEndDateTime;
            if (timeParts.length === 2) {
                const endTimeParts = timeParts[1].trim().split(':').map(Number);
                bookingEndDateTime = new Date(bookingStartDateTime);
                bookingEndDateTime.setHours(endTimeParts[0], endTimeParts[1], 0, 0);
            } else {
                console.warn(`Invalid timeSlot format for booking: ${booking.timeSlot}. Assuming 1 hour duration for end time calculation.`);
                bookingEndDateTime = new Date(bookingStartDateTime);
                bookingEndDateTime.setHours(bookingStartDateTime.getHours() + 1, bookingStartDateTime.getMinutes(), 0, 0);
            }

            if (now >= bookingStartDateTime && now < bookingEndDateTime) {
                currentAppointment = booking;
            } else if (bookingStartDateTime > now) {
                upcomingAppointments.push(booking);
            }
        }

        // แสดงคิวปัจจุบัน ถ้าสถานะไม่ใช่ closed/preparing/out_of_defined_hours หรือถ้ามีคิวปัจจุบันจริงๆ
        // (แก้ไข: เงื่อนไขการแสดงผลคิวปัจจุบัน/ออกหน่วย/ไม่มีคิวปัจจุบันถูกปรับให้แสดงหลังจาก status card เสมอ)
        if (currentAppointment) {
            const currentCard = document.createElement('div');
            currentCard.classList.add('queue-card', 'bg-blue-100', 'border-blue-400', 'current-queue');
            currentCard.innerHTML = `
                <div class="flex items-center mb-2">
                    <i class="fas fa-play-circle text-blue-600 text-xl mr-2"></i>
                    <p class="font-bold text-blue-800 text-lg">คิวปัจจุบัน:</p>
                </div>
                <p class="text-gray-900 text-xl font-semibold">${currentAppointment.patientName}</p>
                <p class="text-gray-700 text-sm">เวลา: ${currentAppointment.timeSlot}</p>
                <p class="text-red-600 text-sm mt-1">กำลังดำเนินการ</p>
            `;
            queueDisplay.appendChild(currentCard);
        } else if (currentServiceStatus.type === 'operational' && bookings.length === 0) {
            // แสดงกรณีออกหน่วย/ปฏิบัติงานเอกสารเฉพาะเมื่ออยู่ในเวลาทำการและไม่มีคิว
            const noQueueCard = document.createElement('div');
            noQueueCard.classList.add('queue-card', 'bg-yellow-100', 'border-yellow-400');
            noQueueCard.innerHTML = `
                <div class="flex items-center mb-2">
                    <i class="fas fa-briefcase text-yellow-600 text-xl mr-2"></i>
                    <p class="font-bold text-yellow-800 text-lg">สถานะปัจจุบัน:</p>
                </div>
                <p class="text-yellow-700 text-xl font-semibold">ออกหน่วย / ปฏิบัติงานเอกสาร</p>
                <p class="text-gray-600 text-sm mt-1">ไม่มีคิวบริการในช่วงนี้</p>
            `;
            queueDisplay.appendChild(noQueueCard);
        } else if (currentServiceStatus.type === 'operational' && !currentAppointment && bookings.length > 0) {
            // แสดงเมื่อไม่มีคิวปัจจุบัน แต่มีคิวในอนาคต (เฉพาะเมื่ออยู่ในเวลาทำการ)
            const noCurrentCard = document.createElement('div');
            noCurrentCard.classList.add('queue-card', 'bg-gray-100', 'border-gray-300');
            noCurrentCard.innerHTML = `
                <div class="flex items-center mb-2">
                    <i class="fas fa-info-circle text-gray-500 text-xl mr-2"></i>
                    <p class="font-bold text-gray-700 text-lg">ไม่มีคิวปัจจุบัน</p>
                </div>
                <p class="text-gray-600 text-sm">รอคิวถัดไป</p>
            `;
            queueDisplay.appendChild(noCurrentCard);
        }

        // แสดงคิวที่กำลังจะมาถึง
        if (upcomingAppointments.length > 0) {
            const upcomingHeader = document.createElement('div');
            upcomingHeader.classList.add('text-lg', 'font-bold', 'text-blue-700', 'mt-4', 'mb-2', 'border-b', 'border-blue-200', 'pb-1', 'px-3');
            upcomingHeader.textContent = 'คิวที่กำลังจะมาถึง:';
            queueDisplay.appendChild(upcomingHeader);

            upcomingAppointments.forEach(appt => {
                const futureCard = document.createElement('div');
                futureCard.classList.add('queue-card', 'bg-green-50', 'border-green-300', 'upcoming-queue-item');
                const apptDateTime = new Date(appt.date);
                const timeDiff = apptDateTime.getTime() - now.getTime();

                futureCard.innerHTML = `
                    <p class="font-semibold text-gray-800">${appt.patientName}</p>
                    <p class="text-gray-600 text-sm">
                        ${apptDateTime.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })} เวลา ${appt.timeSlot}
                    </p>
                    <p class="text-green-600 text-xs mt-1">ในอีก: <span class="time-remaining" data-timestamp="${apptDateTime.getTime()}">${formatTimeRemaining(timeDiff)}</span></p>
                `;
                queueDisplay.appendChild(futureCard);
            });
        } else if (!currentAppointment && queueDisplay.children.length === 0) {
            // กรณีไม่มีคิวปัจจุบัน และไม่มีคิวในอนาคตเลย และยังไม่มีการ์ดสถานะถูกเพิ่ม
            const noBookingsFoundCard = document.createElement('div');
            noBookingsFoundCard.classList.add('queue-card', 'bg-gray-100', 'border-gray-300');
            noBookingsFoundCard.innerHTML = `
                <div class="flex items-center mb-2">
                    <i class="fas fa-calendar-alt text-gray-500 text-xl mr-2"></i>
                    <p class="font-bold text-gray-700 text-lg">ไม่มีการจองคิวในขณะนี้</p>
                </div>
                <p class="text-gray-600 text-sm">โปรดตรวจสอบภายหลัง หรือทำการจองคิวใหม่</p>
            `;
            queueDisplay.appendChild(noBookingsFoundCard);
        }


        // คำนวณความสูงในการเลื่อนและใช้อนิเมชัน
        // ตรวจสอบว่ามีเนื้อหาให้เลื่อนหรือไม่
        if (queueDisplay.children.length > 0) { // มีการ์ดแสดงผลแล้ว
            const contentHeight = queueDisplay.scrollHeight;
            const containerHeight = scrollingQueueContainer.clientHeight - 50; // ลบความสูงของส่วนหัว
            if (contentHeight > containerHeight) {
                const scrollHeight = -(contentHeight - containerHeight);
                const animationDuration = contentHeight / 20; // ปรับความเร็วตามต้องการ (พิกเซลต่อวินาที)
                queueDisplay.style.setProperty('--scroll-height', `${scrollHeight}px`);
                queueDisplay.style.animationDuration = `${animationDuration}s`;
                queueDisplay.style.animationPlayState = 'running';
            } else {
                queueDisplay.style.animationPlayState = 'paused';
                queueDisplay.style.transform = 'translateY(0)';
            }
        }
    }

    // ฟังก์ชันเพื่ออัปเดตเวลาที่เหลือสำหรับรายการที่แสดงทั้งหมด
    function updateAllTimeRemaining() {
        const timeRemainingSpans = document.querySelectorAll('.time-remaining');
        const now = new Date().getTime();
        timeRemainingSpans.forEach(span => {
            const apptTimestamp = parseInt(span.dataset.timestamp);
            const timeDiff = apptTimestamp - now;
            span.textContent = formatTimeRemaining(timeDiff);
        });
    }

    // ดึงข้อมูลและอัปเดตครั้งแรก
    fetchBookingData();
    setInterval(fetchBookingData, 60000); // รีเฟรชข้อมูลทุกๆ 60 วินาที (1 นาที)
    setInterval(updateAllTimeRemaining, 1000); // อัปเดตเวลาที่เหลือทุกๆ วินาที


    // 3. Service Open/Closed Toggle
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            const statusSpan = card.querySelector('.service-status');
            let currentStatus = card.dataset.status;

            if (currentStatus === 'open') {
                card.dataset.status = 'closed';
                statusSpan.textContent = 'ปิด';
                statusSpan.classList.remove('service-status-open');
                statusSpan.classList.add('service-status-closed');
            } else {
                card.dataset.status = 'open';
                statusSpan.textContent = 'เปิด';
                statusSpan.classList.remove('service-status-closed');
                statusSpan.classList.add('service-status-open');
            }
        });
    });

    // 4. Scrolling Text for Patient Satisfaction Comments (LINE-like display)
    const scrollingCommentDisplay = document.getElementById('scrollingCommentDisplay');
    const sheetData = [
        { colA: "28/9/2020, 13:27:58", colK: "หมอน่ารัก นัดทำฟันที่บ้านก็ได้ ขอบคุณค่ะ" },
        { colA: "3/10/2020, 9:14:19", colK: "หมอน่ารัก พูดดี " },
        { colA: "3/10/2020, 9:14:19", colK: "ลูกชมว่าหมอมือนิ่ม น่ารัก" },
        { colA: "5/10/2020, 13:58:33", colK: "ไฮแทคเกินทำไม่ค่อยถูกค่ะ " },
        { colA: "7/10/2020, 8:12:01", colK: "ประทับใจมาก นัดเองได้ สุดยอด" },
        { colA: "7/10/2020, 10:15:29", colK: "มีความรู้สึกดีมากที่ลูกได้มารักษากับหมอ " },
        { colA: "7/10/2020, 8:12:01", colK: "ดีมาก" },
        { colA: "7/10/2020, 10:15:29", colK: "ดีมาก" },
        { colA: "8/10/2020, 18:53:45", colK: "มีความรู้สึกดีมากที่ลูกได้มารักษากับหมอ " },
        { colA: "11/10/2020, 9:38:05", colK: "เยี่ยมหมอสุดยอดมาก" },
        { colA: "16/10/2020, 14:35:31", colK: "หมอมือนิ่มมาก" },
        { colA: "19/10/2020, 9:12:22", colK: "เยี่ยมเลย หมอพูดน่ารัก ไม่ใช้อารมณ์" },
        { colA: "2/11/2020, 12:06:33", colK: "ดีมาก หมอยินดีช่วยเหลือเสมอ" },
        { colA: "4/11/2020, 8:31:21", colK: "ดีมาก" },
        { colA: "14/11/2020, 7:21:37", colK: "ลูกชมว่าหมอทำไม่เจ็บ มือเบา" },
        { colA: "24/11/2020, 12:31:43", colK: "หมอฟันมือนิ่ม พูดเพราะมากค่ะ" },
        { colA: "29/11/2020, 13:59:28", colK: "หมอเป็นกันเองมากค่ะ" },
        { colA: "11/12/2020, 13:53:01", colK: "หมอเป็นกันเองมากค่ะ" },
        { colA: "17/12/2020, 16:06:39", colK: "หมอบริการถึงบ้าน บริการดีมากๆ เห็นใจประชาชนคะ" },
        { colA: "22/12/2020, 20:40:25", colK: "ให้คำแนะนำ บริการดีมาก" },
        { colA: "24/12/2020, 11:39:44", colK: "ดีมาก" },
        { colA: "26/1/2021, 15:45:33", colK: "พูดจาดี อ่อนน้อม" },
        { colA: "27/1/2021, 7:45:04", colK: "หมอจริิงใจทำมาก ยอมรับเลย" },
        { colA: "28/1/2021, 20:29:32", colK: "ดีมากเลย" },
        { colA: "2/2/2021, 7:18:31", colK: "หมอน่ารักมากเลย หายกังวลเรื่องปวดฟันเลยค่ะ" },
        { colA: "5/2/2021, 8:02:58", colK: "หมอน่ารัก พูดดี เป็นกันเอง" },
        { colA: "20/2/2021, 8:15:36", colK: "สะดวกดี เข้าถึงบริการง่าย ทำได้ทุกเวลา" },
        { colA: "9/3/2021, 8:55:09", colK: "ขอบคุณที่ให้การรักษาอย่างดี" },
        { colA: "21/3/2021, 15:09:10", colK: "ดีเยีายม" },
        { colA: "5/6/2021, 17:45:03", colK: "ยินดีให้บริการมาก ชื่นชมที่สุดคะ" },
        { colA: "29/7/2021, 8:39:08", colK: "ความรู้และความตั้งใจ ที่ให้บริการ ดีมาก" },
        { colA: "1/11/2021, 13:47:52", colK: "หมอให้คำแนะนำดี จริงใจ" },
        { colA: "4/3/2022, 8:08:06", colK: "หมอฟันน่ารักนะ ยินดีให้บริการตลอด" },
        { colA: "25/5/2022, 7:22:32", colK: "ชื่นชมมาก ดีมาก" },
        { colA: "7/7/2022, 19:02:13", colK: "Dมาก" },
        { colA: "8/2/2023, 8:02:26", colK: "ดีมากทุกส่วนคับ" },
        { colA: "28/4/2023, 19:34:49", colK: "ใส่ในการให้บริการ" },
        { colA: "18/5/2023, 20:40:50", colK: "ไม่เคยเจอหมอที่จริงใจบริการแบบนี้เลย" },
        { colA: "6/9/2023, 16:53:21", colK: "ฝีมือดีมาก มือเบา " },
        { colA: "6/9/2023, 19:17:05", colK: "บริการดี" },
        { colA: "21/11/2023, 20:14:16", colK: "น่าชมเชยมากครับ" },
        { colA: "24/12/2023, 18:42:06", colK: "น่ารัก พูดดีมาก ดีใจที่เจอหมอที่อยากรักษาคนไข้แบบนี้" },
        { colA: "23/5/2024, 6:56:13", colK: "ให้คำแนะนำดีมากๆคะ" },
        { colA: "17/7/2024, 22:36:17", colK: "มือนิ่มมาก ถอนฟันไม่เจ็บเลย" },
        { colA: "24/7/2024, 18:04:31", colK: "ทำดีมาก ขอบคุณค่ะ" },
        { colA: "29/7/2024, 20:45:15", colK: "ขอบคุณหมอมากคะ ถึงจะเป็นคนไข้นอกพื้นที่หมอก็ยังเต็มใจทำให้ และบริการเป็นอย่างดี อยากอยู่ที่ชุมพรให้หมอดูแลมากๆคะ" },
        { colA: "7/9/2024, 7:30:00", colK: "ทำดีคะ" },
        { colA: "19/9/2024, 20:43:52", colK: "หมอมือนิ่มมาก ไม่เจ็บเหมือนที่อื่น" },
        { colA: "13/10/2024, 17:40:50", colK: "น้องบอกว่า หมอถอนฟันไม่เจ็บ ฉีดยาก็ไม่เจ็บคับ" },
        { colA: "5/1/2025, 21:19:45", colK: "ให้คำแนะนำและบริการดีมากค่ะ" },
        { colA: "6/2/2025, 17:16:09", colK: "พูดน่ารักมาก เป็นกันเอง อธิบายได้เข้าใจมากค่ะ" },
        { colA: "6/2/2025, 16:17:24", colK: "ขั้นเทพจริงค่ะ ฝีมือดีจริงๆ" },
        { colA: "6/2/2025, 19:19:38", colK: "ผมพึ่งรู้จาก chatGPT ว่าที่นี้เป็นสถานบริการอันดับ 1 ของชุมพร ที่โปรแกรมแนะนำ /หมอแนะนำดีมากคับ ขนาดว่าผมอยู่นอกพื้นที่" },
        { colA: "6/2/2025, 17:16:09", colK: "มือนิ่มมากคะ " },
        { colA: "1/5/2025, 14:46:28", colK: "เยี่ยมจริงคับผม" },
        { colA: "13/5/2025, 8:54:05", colK: "เยี่ยมจริงคับ สมคำล่ำลือ" },
        { colA: "14/5/2025, 11:06:15", colK: "ได้รับคำแนะนำที่ดีมากคับ" },
        { colA: "15/5/2025, 13:08:28", colK: "สุดยอดจิง ยก5นิ้วเลย" },
        { colA: "30/6/2025, 11:26:33", colK: "น้องหมอน่ารักมาก" },
        { colA: "27/5/2025, 10:50:08", colK: "ดีมาก" },
        { colA: "30/5/2025, 21:19:45", colK: "เยี่ยมจริง สะดวก ตอบแบบสอบถามก็ง่าย ดีมากๆคับ" },
        { colA: "31/5/2025, 17:16:09", colK: "ดีมากคะ" },
        { colA: "2/6/2025, 16:17:24", colK: "ขดีๆๆเลยคะ" },
        { colA: "5/6/2025, 19:19:38", colK: "ลูกบอกว่า หมอใจดีมาก ถอนฟันไม่เจ็บ ไม่ไปทำที่อื่นแล้ว" },
        { colA: "6/6/2025, 17:16:09", colK: "ให้คำแนะนำดีมาก " },
        { colA: "1/6/2025, 14:46:28", colK: "ไม่ถือตัวเลย น่ารักมากจ๊ะ" },
        { colA: "3/7/2025, 15:52:49, 8:54:05", colK: "เป็นแบบสอบถามที่ตอบง่ายที่สุดเท่าที่เคยเจอมา555" },
        { colA: "4/7/2025, 22:23:05, 11:06:15", colK: "ได้รับคำแนะนำที่ดีมากคับ" },
        { colA: "5/7/2025, 7:00:16", colK: "สุดยอดจิง ยก5นิ้วเลย" },
        { colA: "5/7/2025, 15:46:45", colK: "น้องหมอน่ารักมาก" },
        { colA: "6/7/2025, 6:41:18", colK: "ดีมาก" },
        { colA: "6/7/2025, 6:41:18", colK: "ลูกบอกว่า หมอใจดีมาก ถอนฟันไม่เจ็บ ไม่ไปทำที่อื่นแล้ว" },
        { colA: "6/7/2025, 6:41:18", colK: "ให้คำแนะนำดีมาก" },
        { colA: "6/7/2025, 6:41:18", colK: "ไม่ถือตัวเลย น่ารักมากจ๊ะ" },
        { colA: "6/7/2025, 6:41:18", colK: "จองง่ายดีค่ะ" },
        { colA: "7/7/2025, 16:52:47", colK: "ว้าวมาก ทึ่งเลย มีระบบแบบนี้ด้วย เทศบาลเมืองชุมพรน่าอยู่ นายกใข้โชคดีที่มีบุคลากรดี ประชาชนโชคดีที่มีพ่อเมืองดี เยี่ยมมาก" },
        { colA: "10/7/2025, 0:43:52", colK: "สะดวกมากคับ" },
        { colA: "21/7/2025, 9:55:35", colK: "ดีๆๆ เยี่ยมๆๆ" },
        { colA: "23/7/2025, 20:44:30", colK: "สะดวกคับ" },
        { colA: "25/7/2025, 13:52:59", colK: "ให้คำแนะนำดีมากๆคะ" },
    ];
	
	

    // Function to populate and animate comments for the LINE-like display
    function populateAndAnimateComments() {
        if (!scrollingCommentDisplay || sheetData.length === 0) {
            console.warn("Scrolling comment display element not found or sheetData is empty.");
            return;
        }

        scrollingCommentDisplay.innerHTML = ''; // Clear existing content

        // Append comments multiple times to ensure continuous loop
        // The number of repetitions depends on the container height and comment height
        // We'll append enough to fill the container and then some for seamless looping
        const commentsToAppend = [];
        // Add original data
        sheetData.forEach(item => commentsToAppend.push(item));
        // Add duplicates to make the scroll seamless
        for(let i = 0; i < 5; i++) { // Repeat data 5 times to ensure enough content for smooth loop
            sheetData.forEach(item => commentsToAppend.push(item));
        }


        commentsToAppend.forEach(item => {
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('scrolling-comment-item');
            // Format date to show only date part, similar to chat apps
            const datePart = item.colA.split(',')[0];
            commentDiv.innerHTML = `<span class="font-semibold text-gray-600 text-sm">${datePart}:</span> ${item.colK}`;
            scrollingCommentDisplay.appendChild(commentDiv);
        });

        // Calculate the total height of the content to determine animation duration
        // We need to wait a moment for the browser to render the appended elements
        setTimeout(() => {
            const totalContentHeight = scrollingCommentDisplay.scrollHeight;
            const containerHeight = scrollingCommentDisplay.parentElement.clientHeight - 64; // Subtract heading padding/height
            // Calculate height of one full cycle (original data set)
            // This is an approximation; for perfect loop, it should be the exact height of the original data block
            const singleCycleHeight = totalContentHeight / (commentsToAppend.length / sheetData.length);

            // If content is shorter than container, no need to scroll
            if (singleCycleHeight <= containerHeight) {
                scrollingCommentDisplay.style.animationPlayState = 'paused';
                scrollingCommentDisplay.style.transform = 'translateY(0)';
                return;
            }

            const scrollSpeedPxPerSec = 20; // Adjust this value for desired scroll speed (pixels per second)
            const animationDurationSeconds = singleCycleHeight / scrollSpeedPxPerSec;

            // Set the CSS variable for the animation in style.css
            // This will make the animation translate up by the height of one full cycle
            scrollingCommentDisplay.style.setProperty('--scroll-height', `-${singleCycleHeight}px`);

            // Apply the animation duration
            scrollingCommentDisplay.style.animationDuration = `${animationDurationSeconds}s`;
            scrollingCommentDisplay.style.animationPlayState = 'running'; // Ensure animation is running
        }, 100); // Small delay to ensure DOM is updated and scrollHeight is accurate
    }

    // Call the function to start the comments display
    populateAndAnimateComments();


    // 5. Fetch News from Google Sheet (for "กระดานข่าว" section)
    const newsBoard = document.getElementById('newsBoard');
    const newsLoading = document.getElementById('newsLoading');
    const newsError = document.getElementById('newsError');

    // Replace with your deployed Google Apps Script Web App URL
    const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbzHy1NyAVT3fOQzQpgeKf0L4duDNr94evxd-h-AUkYPKJYhfkQMN7T_iFwjJVtlQlLN/exec'; 

    async function fetchNewsFromGoogleSheet() {
        newsLoading.classList.remove('hidden');
        newsError.classList.add('hidden');
        newsBoard.innerHTML = ''; // Clear previous content

        try {
            const response = await fetch(GOOGLE_SHEET_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            newsLoading.classList.add('hidden'); // Hide loading spinner

            if (data.length === 0) {
                newsBoard.innerHTML = '<p class="text-center text-gray-600">ไม่มีข่าวสารในขณะนี้</p>';
                return;
            }

            data.forEach(newsItem => {
                const newsDiv = document.createElement('div');
                newsDiv.classList.add('bg-gray-50', 'p-4', 'rounded-lg', 'shadow-sm', 'border', 'border-gray-200');

                const date = new Date(newsItem.date).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                let linkHtml = '';
                if (newsItem.link && newsItem.link !== '') {
                    linkHtml = `<a href="${newsItem.link}" target="_blank" class="text-blue-600 hover:underline text-sm mt-2 block">เข้าสู่ระบบ  หรือ อ่านเพิ่มเติม <i class="fas fa-external-link-alt ml-1"></i></a>`;
                }

                newsDiv.innerHTML = `
                    <p class="font-semibold text-lg text-blue-700">${newsItem.title}</p>
                    <p class="text-sm text-gray-500">วันที่: ${date}</p>
                    ${linkHtml}
                `;
                newsBoard.appendChild(newsDiv);
            });

        } catch (error) {
            console.error('Error fetching news from Google Sheet:', error);
            newsLoading.classList.add('hidden'); // Hide loading spinner
            newsError.classList.remove('hidden'); // Show error message
        }
    }

    // Call the function to fetch news when the page loads
    // Make sure to replace 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE' with your actual deployed URL
    // If you don't replace it, you will see an error message.
    fetchNewsFromGoogleSheet();
});