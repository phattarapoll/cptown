document.addEventListener('DOMContentLoaded', () => {
    // กำหนด URL ของ Google Apps Script Web App ของคุณ
    // *** สำคัญมาก: โปรดเปลี่ยน URL ด้านล่างนี้เป็น URL ของ Google Apps Script Web App ของคุณเอง ***
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxMdWfiovLFpb0aDCY0fsuREQFgKcbacZFq7LdoZoK_QdPiN8ic7Caomf4x_4c8k6jzng/exec';

    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthYearDisplay = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const timeSlotDetails = document.getElementById('timeSlotDetails');
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    const timeSlotsContainer = document.getElementById('timeSlots');
    const backToCalendarBtn = document.getElementById('backToCalendar');
    const bookingPopup = document.getElementById('bookingPopup');
    const closePopupBtn = document.getElementById('closePopup');
    const popupDate = document.getElementById('popupDate');
    const popupTimeSlot = document.getElementById('popupTimeSlot');
    const bookingForm = document.getElementById('bookingForm');
    const formMessage = document.getElementById('formMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');

    bookingForm.addEventListener('submit', submitBooking);

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDate = null;
    let selectedTimeSlot = null;

    let configData = {
        unavailableDates: [],
        unavailableWeekdays: [],
        timeSlots: [],
        holidayNames: []
    };
    let bookingData = {};
    let noShowCount = {}; 

    // --- ฟังก์ชันสำหรับซ่อนนามสกุลบางส่วน (Masking) ---
    function maskFullName(fullName) {
        if (!fullName || typeof fullName !== 'string') return '';
        
        const parts = fullName.trim().split(/\s+/).filter(p => p.length > 0);
        
        // ถ้ามีแค่ชื่อเดียว (หรือไม่มีนามสกุล) ก็แสดงชื่อเต็ม
        if (parts.length <= 1) {
            return fullName.trim(); 
        }

        const firstNameParts = parts.slice(0, -1);
        const lastNamePart = parts[parts.length - 1];

        // ถ้าพยัญชนะตัวแรกของนามสกุลเป็นตัวอักษรเดียว ก็แสดงตัวนั้นไปเลย
        if (lastNamePart.length <= 1) {
            return `${firstNameParts.join(' ')} ${lastNamePart}`;
        }

        // เก็บพยัญชนะตัวแรกของนามสกุล และแทนที่ส่วนที่เหลือด้วย ***
        const maskedLastName = `${lastNamePart.charAt(0)}***`;
        
        return `${firstNameParts.join(' ')} ${maskedLastName}`;
    }
    // -----------------------------------------------------------------------------------
    
    // --- ฟังก์ชัน: ตรวจสอบ No-Show โดยใช้การค้นหาชื่อแบบบางส่วน (Partial Match) ---
    function getNoShowCountByPartialName(currentName, noShowCountMap) {
        if (!currentName || currentName.length < 3) return 0; 

        const normalizedCurrentName = currentName.trim().toLowerCase();
        let maxCount = 0;
        
        for (const key in noShowCountMap) {
            if (noShowCountMap.hasOwnProperty(key)) {
                const normalizedKey = key.trim().toLowerCase();
                
                // ตรวจสอบว่าชื่อสั้นกว่า (ไม่ว่าจะเป็น key หรือ currentName) อยู่ในชื่อที่ยาวกว่าหรือไม่
                const [name1, name2] = [normalizedCurrentName, normalizedKey].sort((a, b) => a.length - b.length);
                
                if (name2.includes(name1) && name1.length > 2) { 
                    if (noShowCountMap[key] > maxCount) {
                        maxCount = noShowCountMap[key];
                    }
                }
            }
        }
        
        return maxCount;
    }
    // -----------------------------------------------------------------------------------


    async function fetchData() {
        try {
            loadingSpinner.classList.remove('hidden');
            const response = await fetch(`${WEB_APP_URL}?action=getConfigAndBookings`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('HTTP Error:', response.status, errorText);
                throw new Error(`Server Error: ${errorText || response.statusText}`);
            }

            const data = await response.json();

            if (!data || !data.config || !data.bookings || !data.noShowCount) {
                throw new Error("โครงสร้างข้อมูลที่ได้รับจากเซิร์ฟเวอร์ไม่ถูกต้อง");
            }
            
            configData = data.config;
            bookingData = data.bookings;
            noShowCount = data.noShowCount;
            
            if (!Array.isArray(configData.timeSlots)) {
                configData.timeSlots = [];
            }
            
            renderCalendar(currentMonth, currentYear);
            formMessage.textContent = '';
        } catch (error) {
            console.error('ข้อผิดพลาดในการดึงข้อมูล:', error.message);
            formMessage.textContent = `ไม่สามารถโหลดข้อมูลได้: ${error.message} โปรดลองอีกครั้งในภายหลัง`;
            formMessage.className = 'form-message error';
            renderCalendar(currentMonth, currentYear);
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    }

    function renderCalendar(monthIndex, year) {
        calendarGrid.innerHTML = '';
        currentMonthYearDisplay.textContent = `${getMonthName(monthIndex)} ${year}`;

        const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookingLimit = new Date();
        bookingLimit.setDate(today.getDate() + 31);
        bookingLimit.setHours(0, 0, 0, 0);

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyDiv);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, monthIndex, day);
            date.setHours(0, 0, 0, 0);
            const dateString = formatDateForComparison(date);
            const dayOfWeek = date.getDay();

            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day', 'day');
            dayDiv.innerHTML = `<span class="day-number">${day}</span>`;

            if (date.getTime() === today.getTime()) {
                dayDiv.classList.add('current-day');
            }
            
            if (dayOfWeek === 0 || dayOfWeek === 6) { 
                dayDiv.classList.add('day-weekend');
            }

            let isUnavailable = false;
            let displayReason = '';
            let tooltipReason = '';

            if (date < today) {
                isUnavailable = true;
                tooltipReason = 'วันนี้ผ่านไปแล้ว';
            } else if (date > bookingLimit) {
                isUnavailable = true;
                displayReason = 'เกินเวลาจอง';
                tooltipReason = 'เกินเวลาจอง';
            } else if (configData.unavailableWeekdays.includes(dayOfWeek)) {
                isUnavailable = true;
                displayReason = 'ปิดทำการ';
                tooltipReason = 'ปิดทำการ (เสาร์-อาทิตย์)';
            } else {
                const holidayIndex = configData.unavailableDates.indexOf(dateString);
                if (holidayIndex !== -1) {
                    isUnavailable = true;
                    const specificHolidayName = configData.holidayNames[holidayIndex] ? configData.holidayNames[holidayIndex].trim() : '';

                    if (specificHolidayName && specificHolidayName !== 'ปิด') {
                        displayReason = specificHolidayName;
                        tooltipReason = specificHolidayName;
                    } else {
                        if (!configData.unavailableWeekdays.includes(dayOfWeek)) {
                            displayReason = 'ปิดทำการ';
                            tooltipReason = 'ปิดทำการ';
                        }
                    }
                }
            }

            if (isUnavailable) {
                dayDiv.classList.add('unavailable');
                dayDiv.title = tooltipReason;
                if (displayReason) {
                    dayDiv.innerHTML += `<small>${displayReason}</small>`;
                }
                dayDiv.style.cursor = 'not-allowed';
            } else {
                const availableSlots = getAvailableSlotsCount(dateString);
                const totalSlots = configData.timeSlots.length;

                const slotCountSpan = document.createElement('span');
                slotCountSpan.classList.add('slot-count');

                if (totalSlots === 0) {
                    slotCountSpan.textContent = `ไม่มีคิวตั้งค่า`;
                    slotCountSpan.classList.add('full');
                    dayDiv.classList.add('unavailable');
                    dayDiv.title = 'ไม่มีช่วงเวลาที่ตั้งค่าไว้';
                    dayDiv.style.cursor = 'not-allowed';
                } else if (availableSlots > 0) {
                    slotCountSpan.classList.add('available');
                    slotCountSpan.textContent = `ว่าง ${availableSlots}/${totalSlots}`;
                } else {
                    slotCountSpan.classList.add('full');
                    slotCountSpan.textContent = `เต็ม ${availableSlots}/${totalSlots}`;
                    dayDiv.title = 'คิวเต็ม (คลิกเพื่อดูรายละเอียด)';
                }
                dayDiv.appendChild(slotCountSpan);

                if (totalSlots > 0 && !isUnavailable) {
                    dayDiv.addEventListener('click', () => showTimeSlots(date));
                } else {
                    dayDiv.classList.add('disabled');
                    dayDiv.style.cursor = 'not-allowed';
                }
            }
            calendarGrid.appendChild(dayDiv);
        }
    }

    function getAvailableSlotsCount(dateString) {
        if (!configData.timeSlots || configData.timeSlots.length === 0) {
            return 0;
        }

        let availableCount = configData.timeSlots.length;
        if (bookingData[dateString]) {
            for (const slot of configData.timeSlots) {
                if (bookingData[dateString][slot] && bookingData[dateString][slot].count && bookingData[dateString][slot].count > 0) {
                    availableCount--;
                }
            }
        }
        return availableCount;
    }

    function showTimeSlots(date) {
        selectedDate = date;
        selectedDateDisplay.textContent = `เลือกช่วงเวลาสำหรับ ${formatDateThai(date)}`;
        timeSlotsContainer.innerHTML = '';

        const existingBlinkingMessages = document.querySelectorAll('.blinking-message');
        existingBlinkingMessages.forEach(msg => msg.remove());

        const dateString = formatDateForComparison(date);
        const now = new Date();
        const isToday = (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear());

        const dayOfWeek = date.getDay();
        const dayOfMonth = date.getDate();

        if (dayOfWeek === 5) { // วันศุกร์
            const fridayWarning = document.createElement('div');
            fridayWarning.classList.add('blinking-message');
            fridayWarning.innerHTML = 'ให้บริการเฉพาะกลุ่ม 60 ปีขึ้นไป';
            selectedDateDisplay.insertAdjacentElement('afterend', fridayWarning);
        }

        if (dayOfWeek === 2 && dayOfMonth >= 8 && dayOfMonth <= 14) { // วันอังคาร ระหว่างวันที่ 8 ถึง 14
            const tuesdayWarning = document.createElement('div');
            tuesdayWarning.classList.add('blinking-message');
            tuesdayWarning.innerHTML = 'เฉพาะกลุ่มคลินิกเด็กดี';
            selectedDateDisplay.insertAdjacentElement('afterend', tuesdayWarning);
        }

        if (!configData.timeSlots || configData.timeSlots.length === 0) {
            timeSlotsContainer.innerHTML += '<div style="text-align: center; color: #e63946; font-weight: bold; font-size: 1.2em; padding: 20px;">ไม่มีช่วงเวลาให้เลือก โปรดติดต่อผู้ดูแลระบบ</div>';
        } else {
            configData.timeSlots.forEach(slot => {
                const timeSlotDiv = document.createElement('div');
                timeSlotDiv.classList.add('time-slot');
                timeSlotDiv.textContent = slot;

                let isSlotBooked = false;
                let userFullName = '';
                
                if (bookingData[dateString] && bookingData[dateString][slot]) {
                    if (bookingData[dateString][slot].count && bookingData[dateString][slot].count > 0) {
                        isSlotBooked = true;
                        userFullName = bookingData[dateString][slot].fullName;
                    }
                }

                let isPastTime = false;
                if (isToday) {
                    const [startHour, startMinute] = slot.split(' - ')[0].split(':').map(Number);
                    const slotStartDateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, startMinute, 0);
                    if (now > slotStartDateTime) {
                        isPastTime = true;
                    }
                }

                if (isSlotBooked || isPastTime) {
                    timeSlotDiv.classList.add('unavailable-slot');
                    timeSlotDiv.title = isSlotBooked ? 'ช่วงเวลานี้ถูกจองแล้ว' : 'ช่วงเวลานี้ผ่านไปแล้ว';

                    if (isSlotBooked) {
                        // *** ใช้ฟังก์ชัน maskFullName เพื่อซ่อนนามสกุลบางส่วน ***
                        timeSlotDiv.textContent = maskFullName(userFullName); 
                        
                        if (userFullName) {
                            const noShowCountForUser = getNoShowCountByPartialName(userFullName, noShowCount); 
                            
                            if (noShowCountForUser > 0) {
                                timeSlotDiv.classList.add('no-show-warning'); 
                                
                                if (noShowCountForUser === 1) {
                                    timeSlotDiv.classList.add('blink-yellow');
                                } else if (noShowCountForUser === 2) {
                                    timeSlotDiv.classList.add('blink-orange');
                                } else if (noShowCountForUser >= 3) {
                                    timeSlotDiv.classList.add('blink-red');
                                }
                                
                                timeSlotDiv.title += ` (ผู้จองมีประวัติผิดนัด ${noShowCountForUser} ครั้ง! ควรติดต่อเจ้าหน้าที่)`;
                                timeSlotDiv.innerHTML += `<small class="no-show-count-text">ผิดนัด ${noShowCountForUser} ครั้ง</small>`;
                            } else {
                                timeSlotDiv.title += ` (ผู้จอง: ${userFullName})`;
                            }
                        }
                    } else if (isPastTime) {
                         // หากเป็นเวลาที่ผ่านไปแล้ว ให้คงข้อความเวลาไว้
                    }

                    timeSlotDiv.style.cursor = 'not-allowed';
                } else {
                    timeSlotDiv.addEventListener('click', () => openBookingPopup(date, slot));
                }
                timeSlotsContainer.appendChild(timeSlotDiv);
            });
        }
        document.querySelector('.calendar-wrapper').classList.add('hidden');
        timeSlotDetails.classList.remove('hidden');
    }

    function openBookingPopup(date, slot) {
        const fullNameInput = document.getElementById('fullName');
        const currentFullName = fullNameInput.value.trim();

        if (currentFullName) {
            const noShowCountForUser = getNoShowCountByPartialName(currentFullName, noShowCount);
            
            if (noShowCountForUser >= 3) {
                const maxNoShowWarning = document.createElement('div');
                maxNoShowWarning.classList.add('blinking-message', 'blink-red', 'centered-no-radius');
                maxNoShowWarning.innerHTML = `⚠️ **ไม่สามารถจองได้** ⚠️<br>เนื่องจากมีประวัติผิดนัดบริการ **${noShowCountForUser} ครั้ง** (เกิน 3 ครั้ง)<br><small>แนะนำ เข้ารับบริการด้วยตนเอง หรือติดต่อเจ้าหน้าที่</small>`;
                
                document.querySelectorAll('.blinking-message').forEach(msg => msg.remove());

                timeSlotDetails.querySelector('h2').insertAdjacentElement('afterend', maxNoShowWarning);
                return; 
            }
        }

        selectedTimeSlot = slot;
        popupDate.textContent = formatDateThai(date);
        popupTimeSlot.textContent = slot;
        formMessage.textContent = '';
        formMessage.className = 'form-message';
        document.getElementById('bookingReason').value = ''; 
        bookingPopup.classList.remove('hidden');
        timeSlotDetails.classList.add('hidden');

        setTimeout(() => {
            bookingPopup.classList.add('is-active');
        }, 10);
    }

    async function submitBooking(event) {
        event.preventDefault();

        const fullName = document.getElementById('fullName').value.trim();
        const telNumber = document.getElementById('telNumber').value.trim();
        const bookingReason = document.getElementById('bookingReason').value.trim();
        const bookingDate = formatDateForComparison(selectedDate);

        const noShowCountForUser = getNoShowCountByPartialName(fullName, noShowCount);
        if (noShowCountForUser >= 3) {
            loadingSpinner.classList.add('hidden');
            formMessage.textContent = `❌ ไม่สามารถจองได้: คุณมีประวัติผิดนัด ${noShowCountForUser} ครั้ง (เกิน 3 ครั้ง)`;
            formMessage.className = 'form-message error';
            bookingPopup.classList.remove('hidden');
            bookingPopup.classList.add('is-active');
            return;
        }

        if (!fullName) {
            formMessage.textContent = 'กรุณาป้อนชื่อ-นามสกุล';
            formMessage.className = 'form-message error';
            return;
        }
        if (!telNumber) {
            formMessage.textContent = 'กรุณาป้อนเบอร์โทรศัพท์';
            formMessage.className = 'form-message error';
            return;
        }
        if (!bookingReason) {
            formMessage.textContent = 'กรุณาเลือกอาการ/เหตุผล';
            formMessage.className = 'form-message error';
            return;
        }

        formMessage.textContent = '';
        formMessage.className = 'form-message';
        bookingPopup.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');

        const formData = new FormData();
        formData.append('fullName', fullName);
        formData.append('telNumber', telNumber);
        formData.append('bookingDate', bookingDate);
        formData.append('timeSlot', selectedTimeSlot);
        formData.append('bookingReason', bookingReason);

        try {
            const response = await fetch(WEB_APP_URL, {
                method: 'POST',
                body: formData
            });

            const result = await response.text();
            console.log('ผลลัพธ์จากเซิร์ฟเวอร์:', result);

            if (result.includes('Booking successful!')) {
                loadingSpinner.classList.add('hidden');
                formMessage.textContent = 'ได้รับการจองคิวของท่านแล้ว กรุณานำบัตรประชาชน หรือเอกสารที่เกี่ยวข้องมาด้วย ขอบคุณครับ';
                formMessage.className = 'form-message success';
                bookingPopup.classList.remove('hidden');
                bookingPopup.classList.add('is-active');

                document.getElementById('fullName').value = '';
                document.getElementById('telNumber').value = '';
                document.getElementById('bookingReason').value = '';

                setTimeout(() => {
                    bookingPopup.classList.remove('is-active');
                    bookingPopup.classList.add('hidden');
                    timeSlotDetails.classList.add('hidden');
                    document.querySelector('.calendar-wrapper').classList.remove('hidden');
                    selectedDate = null;
                    selectedTimeSlot = null;
                    fetchData(); // โหลดข้อมูลใหม่เพื่อให้แสดงสถานะล่าสุด
                }, 4000);
            } else {
                loadingSpinner.classList.add('hidden');
                formMessage.textContent = 'เกิดข้อผิดพลาดในการจอง: ' + result;
                formMessage.className = 'form-message error';
                bookingPopup.classList.remove('hidden');
                bookingPopup.classList.add('is-active');
            }
        } catch (error) {
            loadingSpinner.classList.add('hidden');
            console.error('ข้อผิดพลาดในการส่งข้อมูลการจอง:', error);
            formMessage.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + error.message;
            formMessage.className = 'form-message error';
            bookingPopup.classList.remove('hidden');
            bookingPopup.classList.add('is-active');
        }
    }

    function getMonthName(monthIndex) {
        const monthNames = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        return monthNames[monthIndex];
    }

    function formatDateThai(date) {
        const day = date.getDate();
        const month = getMonthName(date.getMonth());
        const year = date.getFullYear() + 543;
        return `${day} ${month} ${year}`;
    }

    function formatDateForComparison(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    });

    backToCalendarBtn.addEventListener('click', () => {
        timeSlotDetails.classList.add('hidden');
        document.querySelector('.calendar-wrapper').classList.remove('hidden');
        selectedDate = null;
        selectedTimeSlot = null;
        renderCalendar(currentMonth, currentYear);
    });

    closePopupBtn.addEventListener('click', () => {
        bookingPopup.classList.remove('is-active');
        setTimeout(() => {
            bookingPopup.classList.add('hidden');
        }, 300);
    });

    fetchData();
});