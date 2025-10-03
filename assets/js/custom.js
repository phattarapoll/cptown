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
            window.location.href = 'https://phattarapoll.github.io/cptown/ADM.html'; // Placeholder link
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

    // *** ฟังก์ชันช่วยเหลือเพื่อซ่อนนามสกุลบางส่วนด้วย ** (ตัด 4 อักษรสุดท้าย) ***
    function maskLastName(fullName) {
        if (!fullName) return '';
        const parts = fullName.trim().split(/\s+/); // แยกชื่อและนามสกุลด้วยช่องว่าง
        if (parts.length > 1) {
            const firstName = parts[0];
            const lastNameParts = parts.slice(1);
            let originalLastNameWord = lastNameParts[0]; // ใช้คำแรกของนามสกุล

            const originalLength = originalLastNameWord.length;
            let maskedPart = '';
            
            if (originalLength <= 4) {
                // ถ้าสั้นกว่าหรือเท่ากับ 4 อักษร ให้แสดงอักษรแรกและตามด้วย ** (เพื่อไม่ให้ว่างเปล่า)
                maskedPart = originalLastNameWord.substring(0, 1) + '**'; 
            } else {
                // ถ้ามากกว่า 4 อักษร ให้ตัด 4 ตัวสุดท้ายออกและแทนที่ด้วย **
                maskedPart = originalLastNameWord.substring(0, originalLength - 4) + '**';
            }
            
            // นำชื่อและนามสกุลที่ถูกปกปิดมาต่อกัน
            return `${firstName} ${maskedPart}`;
        }
        return fullName; // ถ้ามีแค่ชื่อหรือนามสกุลไม่มีช่องว่าง
    }

    async function fetchBookingData() {
        queueLoading.classList.remove('hidden'); // แสดงตัวโหลด
        queueError.classList.add('hidden'); // ซ่อนข้อความข้อผิดพลาด

        if (BOOKING_API_URL === 'https://script.google.com/macros/s/AKfycbwKFlYyhT0CJiUYjGiYddN0egMilOsySaG8TNhnY__Sx91_Y2cLaYvsLRt5zwALrzHR/exec' || BOOKING_API_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL')) { // ตรวจสอบ URL Placeholder
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

    // แก้ไขฟังก์ชัน updateQueueDisplay เพื่อรองรับการแสดงผลสถานะและการปกปิดนามสกุล
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
        } else if (currentServiceStatus.type === 'out_of_defined_hours') {
            const outOfHoursCard = document.createElement('div');
            outOfHoursCard.classList.add('queue-card', 'bg-gray-100', 'border-gray-300');
            outOfHoursCard.innerHTML = `
                <div class="flex items-center mb-2">
                    <i class="fas fa-clock text-gray-500 text-xl mr-2"></i>
                    <p class="font-bold text-gray-700 text-lg">สถานะปัจจุบัน:</p>
                </div>
                <p class="text-gray-600 text-xl font-semibold">นอกช่วงเวลาให้บริการ</p>
                <p class="text-gray-500 text-sm mt-1">โปรดตรวจสอบเวลาให้บริการ </p>
            `;
            queueDisplay.appendChild(outOfHoursCard);
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

        // แสดงคิวปัจจุบัน
        if (currentAppointment) {
            const maskedPatientName = maskLastName(currentAppointment.patientName); 
            
            const currentCard = document.createElement('div');
            currentCard.classList.add('queue-card', 'bg-blue-100', 'border-blue-400', 'current-queue');
            currentCard.innerHTML = `
                <div class="flex items-center mb-2">
                    <i class="fas fa-play-circle text-blue-600 text-xl mr-2"></i>
                    <p class="font-bold text-blue-800 text-lg">คิวปัจจุบัน</p>
                </div>
                <p class="text-gray-900 text-xl font-semibold">${maskedPatientName}</p>
                <p class="text-gray-700 text-sm">เวลา: ${currentAppointment.timeSlot}</p>
                <p class="text-red-600 text-sm mt-1">เรียกคิวบริการ : ห้องตรวจ2</p>
            `;
            queueDisplay.appendChild(currentCard);
        } else if (currentServiceStatus.type === 'operational' && bookings.length === 0) {
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
            const noCurrentCard = document.createElement('div');
            noCurrentCard.classList.add('queue-card', 'bg-gray-100', 'border-gray-300');
            noCurrentCard.innerHTML = `
                <div class="flex items-center mb-2">
                    <i class="fas fa-info-circle text-gray-500 text-xl mr-2"></i>
                    <p class="font-bold text-gray-700 text-lg">ให้บริการนอกพื้นที่  / ไม่มีคิวปัจจุบัน </p>
                </div>
                <p class="text-gray-600 text-sm">รอคิวถัดไป</p>
            `;
            queueDisplay.appendChild(noCurrentCard);
        }

        // แสดงคิวที่กำลังจะมาถึง
        if (upcomingAppointments.length > 0) {
            const upcomingHeader = document.createElement('div');
            upcomingHeader.classList.add('text-lg', 'font-bold', 'text-blue-700', 'mt-4', 'mb-2', 'border-b', 'border-blue-200', 'pb-1', 'px-3');
            upcomingHeader.innerHTML = `
                คิวที่กำลังจะมาถึง:
                <span class="text-sm font-normal text-gray-600">(${upcomingAppointments.length} คิวรอ)</span>
            `;
            queueDisplay.appendChild(upcomingHeader);

            upcomingAppointments.forEach(appt => {
                const maskedPatientName = maskLastName(appt.patientName);
                
                const futureCard = document.createElement('div');
                futureCard.classList.add('queue-card', 'bg-green-50', 'border-green-300', 'upcoming-queue-item');
                const apptDateTime = new Date(appt.date);
                const timeDiff = apptDateTime.getTime() - now.getTime();

                // สร้าง element สำหรับแสดงสถานะและเพิ่มคลาส CSS ที่เหมาะสม
                const statusElement = document.createElement('span');
                statusElement.textContent = appt.status;
                statusElement.classList.add('ml-4', 'font-bold', 'text-sm');

                if (appt.status === 'ผิดนัดบริการ') {
                    statusElement.classList.add('blink-red'); // ใช้คลาส CSS สำหรับการแสดงผลสีแดงกะพริบ
                } else if (appt.status === 'เรียบร้อย') {
                    statusElement.classList.add('text-green-600');
                } else {
                    statusElement.classList.add('text-gray-500'); // สถานะอื่นๆ
                }

                // ปรับเปลี่ยน innerHTML เพื่อให้สถานะแสดงต่อท้ายชื่อผู้ป่วย
                futureCard.innerHTML = `
                    <p class="font-semibold text-gray-800">
                        ${maskedPatientName} ${statusElement.outerHTML}
                    </p>
                    <p class="text-gray-600 text-sm">
                        ${apptDateTime.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })} เวลา ${appt.timeSlot}
                    </p>
                    <p class="text-green-600 text-xs mt-1">ในอีก: <span class="time-remaining pulse-red-background" data-timestamp="${apptDateTime.getTime()}">${formatTimeRemaining(timeDiff)}</span></p>
                `;
                queueDisplay.appendChild(futureCard);
            });
        } else if (!currentAppointment && queueDisplay.children.length === 0) {
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
        if (queueDisplay.children.length > 0) {
            const contentHeight = queueDisplay.scrollHeight;
            const containerHeight = scrollingQueueContainer.clientHeight - 50;
            if (contentHeight > containerHeight) {
                const scrollHeight = -(contentHeight - containerHeight);
                const animationDuration = contentHeight / 20;
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
    setInterval(updateAllTimeRemaining, 8000); // อัปเดตเวลาที่เหลือทุกๆ วินาที


    // 3. Service Open/Closed Toggle
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            const statusSpan = card.querySelector('.service-status');
            let currentStatus = card.dataset.status;

            if (currentStatus === 'open') {
                card.dataset.status = 'closed';
                statusSpan.textContent = 'closed';
                statusSpan.classList.remove('service-status-open');
                statusSpan.classList.add('service-status-closed');
            } else {
                card.dataset.status = 'open';
                statusSpan.textContent = 'open';
                statusSpan.classList.remove('service-status-closed');
                statusSpan.classList.add('service-status-open');
            }
        });
    });

    // 4. Scrolling Text for Patient Satisfaction Comments (LINE-like display)
    const scrollingCommentDisplay = document.getElementById('scrollingCommentDisplay');
    const sheetData = [
        { colA: "28/9/2020, 13:27:58", colK: "หมอน่ารัก นัดทำฟันที่บ้านก็ได้ ขอบคุณค่ะ" },
    // { colA: "", colK: "" },
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
	
// New logic for the Staff Login button
const staffDropdownBtn = document.getElementById('staffDropdownBtn');
const staffDropdownContent = document.getElementById('staffDropdownContent');
const passwordField = document.getElementById('passwordField');
const passwordForm = document.getElementById('passwordForm');
const staffLinks = document.getElementById('staffLinks');
const keypadBtns = staffDropdownContent.querySelectorAll('.keypad-btn');
const loginButton = document.getElementById('loginButton'); // เพิ่มบรรทัดนี้
const cancelButton = document.getElementById('cancelButton'); // เพิ่มบรรทัดนี้
const correctPassword = '3946';

if (staffDropdownBtn && staffDropdownContent && passwordField && passwordForm && staffLinks && keypadBtns && loginButton && cancelButton) {
    staffDropdownBtn.addEventListener('click', (event) => {
        staffDropdownContent.classList.toggle('active');
        // Reset the display when opened again
        passwordField.value = '';
        passwordForm.classList.remove('hidden');
        staffLinks.classList.add('hidden');
        event.stopPropagation();
    });

    // ฟังก์ชันสำหรับจัดการการล็อกอิน
    function attemptLogin() {
        if (passwordField.value === correctPassword) {
            passwordForm.classList.add('hidden');
            staffLinks.classList.remove('hidden');
        } else {
            alert('รหัสผ่านไม่ถูกต้อง');
            passwordField.value = '';
        }
    }

    keypadBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const value = btn.textContent.trim();
            if (btn.classList.contains('clear-btn')) {
                passwordField.value = '';
            } else if (btn.classList.contains('backspace-btn')) {
                passwordField.value = passwordField.value.slice(0, -1);
            } else { // เปลี่ยนเป็น else
            passwordField.value += value;
            }
            // ลบโค้ดตรวจสอบความยาว 4 ตัวที่ล็อกอินอัตโนมัติออก
        });
    });

    // เพิ่ม Event Listener สำหรับปุ่ม "ตกลง"
    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        attemptLogin();
    });

    // เพิ่ม Event Listener สำหรับปุ่ม "ยกเลิก"
    cancelButton.addEventListener('click', (e) => {
        e.preventDefault();
        passwordField.value = '';
        staffDropdownContent.classList.remove('active');
    });

    // Prevent closing the dropdown when clicking inside the content
    staffDropdownContent.addEventListener('click', (event) => {
        event.stopPropagation();
    });
}


});