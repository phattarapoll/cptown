document.addEventListener('DOMContentLoaded', () => {
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxf87dYGb0WAuoV1ptqNTujpTHURZQZhPfnfnw7nCrWOpjWcGJ6B1jag9-TF-J90Y0LSg/exec';// --- ของเดิม🛠️ https://script.google.com/macros/s/AKfycbzsXJO9TBwcIdTz0_5nt_a044mk76VfAGn2eIt8xhsUStVLX_7V_U_ICalH3FxFBM7ZDw/exec ---

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

    const cancelPopup = document.getElementById('cancelPopup');
    const closeCancelPopupBtn = document.getElementById('closeCancelPopup');
    const cancelPopupDateDisplay = document.getElementById('cancelPopupDate');
    const cancelPopupTimeSlotDisplay = document.getElementById('cancelPopupTimeSlot');
    const cancelPopupFullNameDisplay = document.getElementById('cancelPopupFullName');
    const cancelPasswordInput = document.getElementById('cancelPassword');
    const confirmCancelButton = document.getElementById('confirmCancelButton');
    const cancelFormMessage = document.getElementById('cancelFormMessage');

    bookingForm.addEventListener('submit', submitBooking);

    // --- 🛠️ ส่วนเพิ่มเติม: คุมระบบปุ่มเลือกอาการแทน Dropdown ---
    document.querySelectorAll('.reason-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.reason-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('bookingReason').value = this.getAttribute('data-value');
        });
    });

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDate = null;
    let selectedTimeSlot = null;

    let configData = { unavailableDates: [], unavailableWeekdays: [], timeSlots: [], holidayNames: [] };
    let bookingData = {};
    let noShowCount = {}; 
    let currentCancelDate = null;
    let currentCancelTimeSlot = null;
    
    closeCancelPopupBtn.addEventListener('click', () => {
        cancelPopup.classList.remove('is-active');
        if (!cancelPopup.classList.contains('hidden')) { 
             setTimeout(() => { cancelPopup.classList.add('hidden'); }, 300);
        }
        timeSlotDetails.classList.remove('hidden'); 
    });

    function removeTitle(fullName) {
        if (!fullName) return '';
        const titles = /^(นาย|นางสาว|นาง|ด\.ช\.|ด\.หญิง|เด็กชาย|เด็กหญิง)\s*/g;
        return fullName.replace(titles, '').trim();
    }

    function maskFullName(fullName) {
        if (!fullName || typeof fullName !== 'string') return '';
        const parts = fullName.trim().split(/\s+/).filter(p => p.length > 0);
        if (parts.length <= 1) return fullName.trim(); 
        const firstName = parts[0]; 
        const otherParts = parts.slice(1);
        const firstCharOfOtherParts = otherParts[0].charAt(0); 
        const maskedOtherParts = firstCharOfOtherParts + '***'; 
        return `${firstName} ${maskedOtherParts}`;
    }
    
    function getNoShowCountByPartialName(currentName, noShowCountMap) {
        if (!currentName || currentName.length < 3) return 0; 
        const normalizedCurrentName = currentName.trim().toLowerCase();
        let maxCount = 0;
        for (const key in noShowCountMap) {
            if (noShowCountMap.hasOwnProperty(key)) {
                const normalizedKey = key.trim().toLowerCase();
                const [name1, name2] = [normalizedCurrentName, normalizedKey].sort((a, b) => a.length - b.length);
                if (name2.includes(name1) && name1.length > 2) { 
                    if (noShowCountMap[key] > maxCount) { maxCount = noShowCountMap[key]; }
                }
            }
        }
        return maxCount;
    }

    async function fetchData() {
        try {
            loadingSpinner.classList.remove('hidden');
            const response = await fetch(`${WEB_APP_URL}?action=getConfigAndBookings`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server Error: ${errorText || response.statusText}`);
            }
            const data = await response.json();
            configData = data.config;
            bookingData = data.bookings;
            noShowCount = data.noShowCount;
            if (!Array.isArray(configData.timeSlots)) configData.timeSlots = [];
            renderCalendar(currentMonth, currentYear);
        } catch (error) {
            formMessage.textContent = `ไม่สามารถโหลดข้อมูลได้: ${error.message}`;
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
        bookingLimit.setDate(today.getDate() + 21);
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

            if (date.getTime() === today.getTime()) dayDiv.classList.add('current-day');
            if (dayOfWeek === 0 || dayOfWeek === 6) dayDiv.classList.add('day-weekend');

            let isUnavailable = false;
            let displayReason = '';
            let tooltipReason = '';

            if (date < today) {
                isUnavailable = true;
                tooltipReason = 'วันนี้ผ่านไปแล้ว';
            } else if (date > bookingLimit) {
                isUnavailable = true;
                displayReason = 'รอเปิด';
                tooltipReason = 'รอเปิด';
            } else if (configData.unavailableWeekdays.includes(dayOfWeek)) {
                isUnavailable = true;
                displayReason = 'ปิดทำการ';
                tooltipReason = 'ปิดทำการ (เสาร์-อาทิตย์)';
            } else {
                const holidayIndex = configData.unavailableDates.indexOf(dateString);
                if (holidayIndex !== -1) {
                    isUnavailable = true;
                    const specificHolidayName = configData.holidayNames[holidayIndex] ? configData.holidayNames[holidayIndex].trim() : '';
                    displayReason = specificHolidayName !== 'ปิด' ? specificHolidayName : 'ปิดทำการ';
                    tooltipReason = displayReason;
                }
            }

            if (isUnavailable) {
                dayDiv.classList.add('unavailable');
                dayDiv.title = tooltipReason;
                if (displayReason) dayDiv.innerHTML += `<small>${displayReason}</small>`;
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
                } else if (availableSlots > 0) {
                    slotCountSpan.classList.add('available');
                    slotCountSpan.textContent = `ว่าง ${availableSlots}`;
                    dayDiv.addEventListener('click', () => showTimeSlots(date));
                } else {
                    slotCountSpan.classList.add('full');
                    slotCountSpan.textContent = `เต็ม `;
                    dayDiv.addEventListener('click', () => showTimeSlots(date));
                }
                dayDiv.appendChild(slotCountSpan);
            }
            calendarGrid.appendChild(dayDiv);
        }
    }

    function getAvailableSlotsCount(dateString) {
        if (!configData.timeSlots || configData.timeSlots.length === 0) return 0;
        let availableCount = configData.timeSlots.length;
        if (bookingData[dateString]) {
            for (const slot of configData.timeSlots) {
                if (bookingData[dateString][slot] && bookingData[dateString][slot].count > 0) availableCount--;
            }
        }
        return availableCount;
    }

    function showTimeSlots(date) {
        selectedDate = date;
        selectedDateDisplay.textContent = `เลือกช่วงเวลาสำหรับ ${formatDateThai(date)}`;
        timeSlotsContainer.innerHTML = '';
        document.querySelectorAll('.blinking-message').forEach(msg => msg.remove());
        const dateString = formatDateForComparison(date);
        const now = new Date();
        const minBookingTime = new Date(now.getTime() + (60 * 60 * 1000));
        const dayOfWeek = date.getDay();
        const dayOfMonth = date.getDate();

        if (dayOfWeek === 2 && dayOfMonth >= 8 && dayOfMonth <= 14) {
            const tuesdayWarning = document.createElement('div');
            tuesdayWarning.classList.add('blinking-message');
            tuesdayWarning.innerHTML = 'เฉพาะกลุ่มคลินิกเด็กดี';
            selectedDateDisplay.insertAdjacentElement('afterend', tuesdayWarning);
        }
		
		if (dayOfWeek === 5) {
			const fridayWarning = document.createElement('div');
			fridayWarning.classList.add('blinking-message');
			fridayWarning.id = 'friday-special-warning'; 
			fridayWarning.innerHTML = 'ให้บริการเฉพาะกลุ่ม 60 ปีขึ้นไป และผู้ป่วยฉุกเฉิน';
			selectedDateDisplay.insertAdjacentElement('afterend', fridayWarning);
            setTimeout(() => { fridayWarning.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
        }

        if (!configData.timeSlots || configData.timeSlots.length === 0) {
            timeSlotsContainer.innerHTML += '<div style="text-align: center; color: #e63946; font-weight: bold; padding: 20px;">ไม่มีช่วงเวลาให้เลือก</div>';
        } else {
            configData.timeSlots.forEach(slot => {
                const timeSlotDiv = document.createElement('div');
                timeSlotDiv.classList.add('time-slot');
                let isSlotBooked = false;
                let userFullName = '';
                
                if (bookingData[dateString] && bookingData[dateString][slot] && bookingData[dateString][slot].count > 0) {
                    isSlotBooked = true;
                    userFullName = bookingData[dateString][slot].fullName;
                }

                const timePart = slot.split('-')[0].trim();
                const [startHour, startMinute] = timePart.split(':').map(Number);
                const slotStartDateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, startMinute, 0);
                const isTooLate = slotStartDateTime < minBookingTime;

                if (isSlotBooked) {
                    timeSlotDiv.classList.add('booked-slot');
                    timeSlotDiv.textContent = maskFullName(userFullName);
                    const cancelButton = document.createElement('button');
                    cancelButton.classList.add('cancel-button'); 
                    cancelButton.innerHTML = 'ยกเลิก';
                    const telNumberMasked = bookingData[dateString][slot].telNumber || '**********';
                    cancelButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        cancelBooking(dateString, slot, telNumberMasked, userFullName); 
                    });
                    timeSlotDiv.appendChild(cancelButton);
                    const noShowCountForUser = getNoShowCountByPartialName(userFullName, noShowCount);
                    if (noShowCountForUser > 0) {
                        timeSlotDiv.classList.add('no-show-warning');
                        timeSlotDiv.innerHTML += `<small class="no-show-count-text">⚠️ ${noShowCountForUser} ครั้ง</small>`;
                    }
                } else if (isTooLate) {
                    timeSlotDiv.classList.add('unavailable-slot');
                    timeSlotDiv.textContent = slot;
                    timeSlotDiv.style.cursor = 'not-allowed';
                } else {
                    timeSlotDiv.classList.add('available-slot');
                    timeSlotDiv.textContent = slot;
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
                alert(`ไม่สามารถจองได้เนื่องจากมีประวัติผิดนัด ${noShowCountForUser} ครั้ง`);
                return; 
            }
        }
        selectedTimeSlot = slot;
        popupDate.textContent = formatDateThai(date);
        popupTimeSlot.textContent = slot;
        formMessage.textContent = '';
        document.getElementById('bookingReason').value = ''; 
        
        // ล้างสถานะปุ่มกดเลือกอาการเพื่อเริ่มต้นใหม่
        document.querySelectorAll('.reason-btn').forEach(b => b.classList.remove('active'));

        bookingPopup.classList.remove('hidden');
        timeSlotDetails.classList.add('hidden');
        setTimeout(() => { bookingPopup.classList.add('is-active'); }, 10);
    }

    async function submitBooking(event) {
        event.preventDefault();

        let fullName = document.getElementById('fullName').value.trim();
        fullName = removeTitle(fullName); 

        const telNumber = document.getElementById('telNumber').value.trim();
        const bookingReason = document.getElementById('bookingReason').value.trim();
        const bookingDate = formatDateForComparison(selectedDate);
        const bookingDateThai = formatDateThai(selectedDate);

        if (!bookingReason) {
            formMessage.textContent = '❌ กรุณาเลือกอาการ/เหตุผลที่เข้ารับบริการ';
            formMessage.className = 'form-message error';
            return;
        }

        if (!fullName) {
            formMessage.textContent = 'กรุณาป้อนชื่อ-นามสกุล';
            formMessage.className = 'form-message error';
            return;
        }

        const nameParts = fullName.split(/\s+/).filter(p => p.length > 0);
        if (nameParts.length < 2) { 
             formMessage.textContent = '❌ กรุณาใส่ ชื่อ-นามสกุล ที่ถูกต้องและมีวรรคคั่น';
             formMessage.className = 'form-message error';
             return;
        }

        const noShowCountForUser = getNoShowCountByPartialName(fullName, noShowCount);
        if (noShowCountForUser >= 3) {
            formMessage.textContent = `❌ ไม่สามารถจองได้: ผิดนัด ${noShowCountForUser} ครั้ง`;
            formMessage.className = 'form-message error';
            return;
        }

        // === 🛠️ จุดแก้ไขตามความต้องการ: ปล่อย Popup เปิดอยู่ค้างไว้ และทำการแปลงสไตล์ปุ่ม ===
        const submitBtn = event.target.querySelector('.submit-button');
        const originalBtnContent = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังจองคิวให้ท่าน...';
        submitBtn.classList.add('is-submitting');
        loadingSpinner.classList.remove('hidden');

        const formData = new FormData();
        formData.append('fullName', fullName);
        formData.append('telNumber', telNumber);
        formData.append('phone', telNumber); 
        formData.append('bookingDate', bookingDate);
        formData.append('timeSlot', selectedTimeSlot);
        formData.append('bookingReason', bookingReason);
        formData.append('action', 'submitBooking');

        try {
            const response = await fetch(WEB_APP_URL, { method: 'POST', body: formData });
            const resultText = await response.text();
            let cancellationCode = null;
            let isSuccess = false;

            try {
                const result = JSON.parse(resultText); 
                isSuccess = result.status === 'Booking successful!' || result.status === 'Success';
                cancellationCode = result.cancellationCode || result.code;
            } catch (e) {
                isSuccess = resultText.includes('Booking successful!') || resultText.includes('Success');
            }

            if (isSuccess) {
                // คิวสำเร็จเสร็จสมบูรณ์ -> ทำการปิดหน้าต่าง Popup ต่างๆ ลงพร้อมกัน
                bookingPopup.classList.remove('is-active');
                bookingPopup.classList.add('hidden');
                loadingSpinner.classList.add('hidden');
                
                submitBtn.innerHTML = originalBtnContent;
                submitBtn.classList.remove('is-submitting');

                document.querySelector('.calendar-wrapper').classList.add('hidden');
                timeSlotDetails.classList.add('hidden');
                
                const codeDisplayHtml = cancellationCode ? `<div class="code-display-box" style="margin: 15px auto; padding: 15px; border-radius: 10px; border: 3px dashed #e63946; background-color: #ffe6e6;"><p style="margin: 0; font-weight: bold;">รหัสยกเลิกคิว (Code):</p><p style="margin: 5px 0 0 0; font-size: 3em; font-weight: bolder; color: #e63946;">${cancellationCode}</p></div>` : '';
                const successSummary = `<div class="glass-effect" style="margin: 40px auto; max-width: 600px; text-align: center; padding: 25px; border: 5px solid #2a9d8f; border-radius: 15px;"><h3 style="color: #2a9d8f;">✅ การจองคิวสำเร็จ ✅</h3>${codeDisplayHtml}<div style="text-align: left; padding: 15px; background: white; border-radius: 10px;"><p><strong>👤 ผู้จอง:</strong> ${fullName}</p><p><strong>🗓 วันที่นัด:</strong> ${bookingDateThai}</p><p><strong>⏰ ช่วงเวลา:</strong> ${selectedTimeSlot}</p><p><strong>📝 อาการ:</strong> ${bookingReason}</p></div><button onclick="window.location.reload();" style="margin-top: 20px; padding: 10px 20px; background: #e63946; color: white; border: none; border-radius: 8px; cursor: pointer;">กลับหน้าหลัก</button></div>`;
                document.querySelector('.container').insertAdjacentHTML('beforeend', successSummary);
            } else {
                loadingSpinner.classList.add('hidden');
                submitBtn.innerHTML = originalBtnContent;
                submitBtn.classList.remove('is-submitting');
                alert('เกิดข้อผิดพลาด: ' + resultText);
            }
        } catch (error) {
            loadingSpinner.classList.add('hidden');
            submitBtn.innerHTML = originalBtnContent;
            submitBtn.classList.remove('is-submitting');
            alert('เชื่อมต่อผิดพลาด: ' + error.message);
        }
    }

    function cancelBooking(dateString, slot, telNumberMasked, fullName) {
        currentCancelDate = dateString;
        currentCancelTimeSlot = slot;
        cancelPopupDateDisplay.textContent = formatDateThai(new Date(dateString));
        cancelPopupTimeSlotDisplay.textContent = slot;
        cancelPopupFullNameDisplay.textContent = maskFullName(fullName);
        cancelPasswordInput.value = '';
        cancelFormMessage.textContent = '';
        cancelPopup.classList.remove('hidden');
        timeSlotDetails.classList.add('hidden');
        setTimeout(() => { cancelPopup.classList.add('is-active'); }, 10);
    }
    
    confirmCancelButton.addEventListener('click', confirmCancel);

	async function confirmCancel() {
        const password = cancelPasswordInput.value.trim();
        if (password.length !== 6) {
            alert('กรุณาใส่รหัส 6 หลัก');
            return;
        }
        
        const confirmButton = document.getElementById('confirmCancelButton');
        if (confirmButton) {
            confirmButton.disabled = true;
            confirmButton.style.animation = 'pulse 1s infinite';
            confirmButton.innerText = 'กำลังส่งคำขอยกเลิก...';
        }

        const spinnerMessage = loadingSpinner.querySelector('p');
        if (spinnerMessage) {
            spinnerMessage.innerHTML = '<i class="fas fa-trash-alt animate-pulse"></i> กำลังทำการลบคิวในระบบ กรุณารอสักครู่...';
        }
        loadingSpinner.classList.remove('hidden');
        
        const formData = new FormData();
        formData.append('action', 'cancelBooking');
        formData.append('bookingDate', currentCancelDate);
        formData.append('timeSlot', currentCancelTimeSlot);
        formData.append('password', password);

        try {
            const response = await fetch(WEB_APP_URL, { method: 'POST', body: formData });
            const resultText = await response.text();
            
            loadingSpinner.classList.add('hidden');
            if (spinnerMessage) { spinnerMessage.innerText = 'กำลังประมวลผล...'; }
            if (confirmButton) {
                confirmButton.disabled = false;
                confirmButton.style.animation = 'none';
                confirmButton.innerText = 'ยืนยันการยกเลิก';
            }
            
            let statusMessage = '';
            let isSuccess = false;

            try {
                const jsonResult = JSON.parse(resultText);
                statusMessage = jsonResult.status;
                if (statusMessage === 'Cancel successful!') { isSuccess = true; }
            } catch (e) {
                statusMessage = resultText;
                if (resultText.includes('Cancel successful!')) { isSuccess = true; }
            }

            if (isSuccess) {
                alert('✅ ดำเนินการเสร็จสมบูรณ์!\nระบบได้ทำการลบคิวนัดหมายนี้เรียบร้อยแล้วครับ');
                window.location.reload();
            } else if (statusMessage === 'Invalid code!') {
                alert('❌ ยกเลิกไม่สำเร็จ: รหัสยกเลิกคิว 6 หลักไม่ถูกต้อง กรุณาตรวจสอบรหัสในคอลัมน์ G (Code) อีกครั้ง');
            } else if (statusMessage === 'Booking not found!') {
                alert('❌ ยกเลิกไม่สำเร็จ: ไม่พบข้อมูลการจองในระบบ');
            } else if (statusMessage.includes('Cannot cancel a past appointment')) {
                alert('❌ ยกเลิกไม่สำเร็จ: เกินเวลานัดหมาย ไม่สามารถยกเลิกย้อนหลังได้');
            } else if (statusMessage.includes('less than 1 hour')) {
                alert('❌ ยกเลิกไม่สำเร็จ: ไม่สามารถยกเลิกได้เนื่องจากเหลือน้อยกว่า 1 ชั่วโมงก่อนถึงเวลานัด');
            } else {
                alert('❌ เกิดข้อผิดพลาดจากระบบ: ' + statusMessage);
            }
        } catch (error) {
            loadingSpinner.classList.add('hidden');
            if (spinnerMessage) { spinnerMessage.innerText = 'กำลังประมวลผล...'; }
            if (confirmButton) {
                confirmButton.disabled = false;
                confirmButton.style.animation = 'none';
                confirmButton.innerText = 'ยืนยันการยกเลิก';
            }
            alert('🌐 เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย: ' + error.message);
        }
    }

    function getMonthName(monthIndex) {
        const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        return monthNames[monthIndex];
    }

    function formatDateThai(date) {
        const day = date.getDate();
        const month = getMonthName(date.getMonth());
        const year = date.getFullYear() + 543;
        return `${day} ${month} ${year}`;
    }
	
	// เพิ่มไว้ในส่วนที่จัดการกับ Form ใน customonline.js
const inputs = document.querySelectorAll('.form-input');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        setTimeout(() => {
            // เลื่อนหน้าจอให้ช่องที่เลือกขึ้นมาอยู่ด้านบน
            this.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300); // รอแป้นพิมพ์ดีดขึ้นมาก่อนแล้วค่อยเลื่อน
    });
});


    function formatDateForComparison(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar(currentMonth, currentYear);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar(currentMonth, currentYear);
    });

    backToCalendarBtn.addEventListener('click', () => {
        timeSlotDetails.classList.add('hidden');
        document.querySelector('.calendar-wrapper').classList.remove('hidden');
        renderCalendar(currentMonth, currentYear);
    });

    closePopupBtn.addEventListener('click', () => {
        bookingPopup.classList.remove('is-active');
        setTimeout(() => { bookingPopup.classList.add('hidden'); }, 300);
        timeSlotDetails.classList.remove('hidden');
    });

    fetchData();
});