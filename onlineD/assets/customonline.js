document.addEventListener('DOMContentLoaded', () => {
    // กำหนด URL ของ Google Apps Script Web App ของคุณ setTimeout
    // **สำคัญมาก: เปลี่ยน YOUR_WEB_APP_URL_HERE ให้เป็น URL ที่คุณได้จากการ Deploy Code.gs**
<<<<<<< HEAD
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw7wH8r9lCEgMTlIiySJfZ_vsniBCeyiaBlYtXZhIOHe34CLUfXQpT8rt36av32ZqIPOQ/exec'; 
=======
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxzZQKx25Qpb6WONZZ3oQ3ggY85HE8UgTszkrHj8XATPnS-0cVbQyg1I9eW2C6Lq0pbWw/exec'; 
>>>>>>> parent of f31b927 (Update customonline.js)

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
    const loadingSpinner = document.getElementById('loadingSpinner'); // Get the new spinner element
	
	bookingForm.addEventListener('submit', submitBooking);


    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDate = null;
    let selectedTimeSlot = null;

    let configData = {
        unavailableDates: [],
        unavailableWeekdays: [], // 0=อาทิตย์, 1=จันทร์, ..., 6=เสาร์
        timeSlots: [],
        holidayNames: []
    };
    let bookingData = {}; // จะเก็บข้อมูลการจองในแต่ละวัน { 'YYYY-MM-DD': { 'HH:MM - HH:MM': count } }

    /**
     * ดึงข้อมูลการตั้งค่าและข้อมูลการจองจาก Google Apps Script
     */
    async function fetchData() {
        try {
            const response = await fetch(`${WEB_APP_URL}?action=getConfigAndBookings`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('HTTP Error:', response.status, errorText);
                throw new Error(`Server Error: ${errorText || response.statusText}`);
            }

            const data = await response.json();
            
            if (data && data.config && data.bookings) {
                configData = data.config;
                bookingData = data.bookings;
			if (!Array.isArray(configData.timeSlots)) {
				console.warn("configData.timeSlots ไม่ใช่ Array หรือเป็น undefined, กำหนดค่าเริ่มต้นเป็น Array ว่าง");
				configData.timeSlots = [];
			}
                console.log('Config Data:', configData);
                console.log('Booking Data:', bookingData);
                renderCalendar(currentMonth, currentYear);
                formMessage.textContent = '';
            } else {
                throw new Error("โครงสร้างข้อมูลที่ได้รับจากเซิร์ฟเวอร์ไม่ถูกต้อง");
            }
        } catch (error) {
            console.error('ข้อผิดพลาดในการดึงข้อมูล:', error.message);
            formMessage.textContent = `ไม่สามารถโหลดข้อมูลได้: ${error.message} โปรดลองอีกครั้งในภายหลัง`;
            formMessage.className = 'form-message error';
            renderCalendar(currentMonth, currentYear);
        }
    }

    /**
     * สร้างปฏิทินสำหรับเดือนและปีที่กำหนด
     * @param {number} monthIndex - ดัชนีเดือน (0-11)
     * @param {number} year - ปี
     */
    function renderCalendar(monthIndex, year) {
        calendarGrid.innerHTML = '';
        currentMonthYearDisplay.textContent = `${getMonthName(monthIndex)} ${year}`;

        // Date.getDay() จะคืนค่าเป็น: 0=อาทิตย์, 1=จันทร์, ..., 6=เสาร์
        const firstDayOfMonth = new Date(year, monthIndex, 1).getDay(); // วันที่ 1 ของเดือนเป็นวันอะไร (0-6)
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); // จำนวนวันในเดือน

        // เติมช่องว่างสำหรับวันก่อนหน้าของเดือน
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyDiv);
        }

        // เพิ่มวันในเดือน
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, monthIndex, day);
            const dateString = formatDateForComparison(date); //YYYY-MM-DD
            const dayOfWeek = date.getDay(); // 0=อาทิตย์, 1=จันทร์...

            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            dayDiv.innerHTML = `<span class="day-number">${day}</span>`;

            // ตรวจสอบวันปัจจุบัน (ต้อง setHours เพื่อเปรียบเทียบแค่ "วันที่")
            const today = new Date();
            today.setHours(0, 0, 0, 0); // รีเซ็ตเวลาของวันนี้
            date.setHours(0, 0, 0, 0);   // รีเซ็ตเวลาของวันในปฏิทิน
			
			// กำหนดวันที่ล่วงหน้าสูงสุดที่จองได้ (1 เดือนนับจาก today)
			const maxBookingDate = new Date();
			maxBookingDate.setMonth(maxBookingDate.getMonth() + 1); // เพิ่มไป 1 เดือน
			maxBookingDate.setDate(maxBookingDate.getDate()); // ให้เป็นวันเดียวกันในเดือนถัดไป
			maxBookingDate.setHours(0, 0, 0, 0); // Normalize maxBookingDate


            if (date.getTime() === today.getTime()) {
                dayDiv.classList.add('current-day');
            }

            // ตรวจสอบวันในอดีต
            if (date < today) {
                dayDiv.classList.add('disabled');
                dayDiv.title = 'วันนี้ผ่านไปแล้ว';
            } else {
                let isUnavailable = false;
                let displayReason = ''; // ข้อความที่จะแสดงผลบนปฏิทิน (e.g., "ปิดทำการ", "ออกหน่วย")
                let tooltipReason = ''; // ข้อความสำหรับ tooltip เมื่อเอาเมาส์ชี้

                // 1. ตรวจสอบวันหยุดตามวันในสัปดาห์ (เสาร์-อาทิตย์)
                if (configData.unavailableWeekdays.includes(dayOfWeek)) {
                    isUnavailable = true;
                    displayReason = 'ปิดทำการ'; // แสดง "ปิดทำการ" บนปฏิทิน
                    tooltipReason = 'ปิดทำการ (เสาร์-อาทิตย์)'; // แสดง "ปิดทำการ (เสาร์-อาทิตย์)" ใน tooltip
                }
				
				// 2. ตรวจสอบว่าวันที่เกินระยะจองสูงสุด 1 เดือนหรือไม่
				if (!isUnavailable && date > maxBookingDate) {
				isUnavailable = true;
				displayReason = 'เกินระยะจอง'; // หรือ 'เกินระยะจอง'
				tooltipReason = 'สามารถจองได้ล่วงหน้าไม่เกิน 1 เดือน';
				}


                // 2. ตรวจสอบวันหยุดที่กำหนดเอง (รวมถึงวันอังคารที่ 2 ของเดือน หรือวันหยุดอื่นๆ จาก config sheet)
                const holidayIndex = configData.unavailableDates.indexOf(dateString);
                if (holidayIndex !== -1) {
                    isUnavailable = true; // วันนี้เป็นวันหยุดที่กำหนดเอง
                    const specificHolidayName = configData.holidayNames[holidayIndex] ? configData.holidayNames[holidayIndex].trim() : '';
                    
                    // ถ้ามีชื่อวันหยุดเฉพาะเจาะจง และชื่อนั้นไม่ใช่คำว่า 'ปิด'
                    if (specificHolidayName && specificHolidayName !== 'ปิด') {
                        displayReason = specificHolidayName; // ใช้ชื่อวันหยุดนั้นๆ บนปฏิทิน
                        tooltipReason = specificHolidayName; // ใช้ชื่อวันหยุดนั้นๆ ใน tooltip
                    } else { // ถ้าชื่อวันหยุดเป็น 'ปิด' หรือว่างเปล่า
                        // เราไม่ต้องการแสดง "ปิด" ทั้งบนปฏิทินและใน tooltip สำหรับกรณีนี้
                        // แต่ถ้าวันนั้นเป็นวันหยุดสุดสัปดาห์อยู่แล้ว (ถูกตั้งค่า "ปิดทำการ" ไว้แล้ว) ให้คงค่าเดิมไว้
                        if (!configData.unavailableWeekdays.includes(dayOfWeek)) { // ถ้าไม่ใช่เสาร์หรืออาทิตย์
                           displayReason = ''; // ไม่แสดงข้อความบนปฏิทิน
                           tooltipReason = ''; // ไม่แสดงข้อความใน tooltip
                        }
                        // ถ้าเป็นวันหยุดสุดสัปดาห์ด้วย (displayReason และ tooltipReason มีค่า "ปิดทำการ" อยู่แล้ว)
                        // ก็ไม่ต้องทำอะไรตรงนี้ ปล่อยให้แสดง "ปิดทำการ" ต่อไป
                    }
                }
                
                if (isUnavailable) {
                    dayDiv.classList.add('unavailable');
                    dayDiv.title = tooltipReason; // กำหนด tooltip จากค่าที่เราตั้งไว้
                    
                    // แสดงข้อความบนปฏิทิน (<small> tag) ก็ต่อเมื่อ displayReason มีค่า (ไม่เป็นค่าว่างเปล่า)
                    if (displayReason) { 
                        dayDiv.innerHTML += `<small>${displayReason}</small>`;
                    }
                } else {
                    // แสดงสถานะคิวว่าง
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
                    } else { // availableSlots === 0
                        slotCountSpan.classList.add('full');
                        slotCountSpan.textContent = `เต็ม ${availableSlots}/${totalSlots}`;
                        dayDiv.classList.add('unavailable');
                        dayDiv.title = 'คิวเต็ม';
                    }
                    dayDiv.appendChild(slotCountSpan);

                    if (availableSlots > 0 && totalSlots > 0) {
                        dayDiv.addEventListener('click', () => showTimeSlots(date));
                    } else {
                        dayDiv.classList.add('disabled');
                        dayDiv.style.cursor = 'not-allowed';
                    }
                }
            } // end of else (not past date)
            calendarGrid.appendChild(dayDiv);
        } // end of day loop
    } // end of renderCalendar

    /**
     * ดึงจำนวนช่องเวลาที่ว่างสำหรับวันที่กำหนด
     * @param {string} dateString - วันที่ในรูปแบบYYYY-MM-DD
     * @returns {number} จำนวนช่องเวลาที่ว่าง
     */
    function getAvailableSlotsCount(dateString) {
        // ตรวจสอบว่า configData.timeSlots มีข้อมูลหรือไม่
        if (!configData.timeSlots || configData.timeSlots.length === 0) {
            console.warn("Time slots are not configured or empty.");
            return 0; // ไม่มี slots ให้จอง
        }

        let availableCount = configData.timeSlots.length;
        if (bookingData[dateString]) {
            for (const slot of configData.timeSlots) {
                // สมมติว่าแต่ละช่องรับได้ 1 คิว ถ้ามีข้อมูลใน bookingData แสดงว่าถูกจองแล้ว
                // หรือถ้ามีการจองมากกว่า 0 (เช่น 1 คิว)
                if (bookingData[dateString][slot] && bookingData[dateString][slot] > 0) { 
                    availableCount--;
                }
            }
        }
        return availableCount;
    }


    /**
     * แสดงรายละเอียดช่วงเวลาสำหรับวันที่เลือก
     * @param {Date} date - วันที่ที่เลือก
     */
    function showTimeSlots(date) {
        selectedDate = date;
        selectedDateDisplay.textContent = `เลือกช่วงเวลาสำหรับ ${formatDateThai(date)}`;
        timeSlotsContainer.innerHTML = ''; // Clear previous slots

        // Remove any existing blinking messages before adding new ones
        const existingBlinkingMessages = document.querySelectorAll('.blinking-message');
        existingBlinkingMessages.forEach(msg => msg.remove());


        const dateString = formatDateForComparison(date); //YYYY-MM-DD
        const now = new Date();
        const isToday = (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear());

        const dayOfWeek = date.getDay(); // 0=อาทิตย์, 1=จันทร์, ..., 5=ศุกร์, 6=เสาร์
        const dayOfMonth = date.getDate();

        // Check if it's a Friday
        if (dayOfWeek === 5) { // If it's Friday
            const fridayWarning = document.createElement('div');
            fridayWarning.classList.add('blinking-message');
            fridayWarning.innerHTML = 'ให้บริการเฉพาะกลุ่ม 60 ปีขึ้นไป'; // The blinking message
            selectedDateDisplay.insertAdjacentElement('afterend', fridayWarning); 
        }

        // Check if it's the second Tuesday of the month (Tuesday is 2, day 8-14)
        if (dayOfWeek === 2 && dayOfMonth >= 8 && dayOfMonth <= 14) {
            const tuesdayWarning = document.createElement('div');
            tuesdayWarning.classList.add('blinking-message');
            tuesdayWarning.innerHTML = 'เฉพาะกลุ่มคลินิกเด็กดี'; // New blinking message
            selectedDateDisplay.insertAdjacentElement('afterend', tuesdayWarning); 
        }


        // ตรวจสอบว่ามี timeSlots หรือไม่ก่อนจะวนลูป
        if (!configData.timeSlots || configData.timeSlots.length === 0) {
            timeSlotsContainer.innerHTML += '<div style="text-align: center; color: #e63946; font-weight: bold; font-size: 1.2em; padding: 20px;">ไม่มีช่วงเวลาให้เลือก โปรดติดต่อผู้ดูแลระบบ</div>';
            // ไม่ต้องสร้างปุ่มจองถ้าไม่มี slots
        } else {
            configData.timeSlots.forEach(slot => {
                const timeSlotDiv = document.createElement('div');
                timeSlotDiv.classList.add('time-slot');
                timeSlotDiv.textContent = slot;

                let isSlotBooked = false;
                // ตรวจสอบว่าช่องเวลานี้ถูกจองแล้วหรือไม่ (จำนวนคิว > 0)
                if (bookingData[dateString] && bookingData[dateString][slot] && bookingData[dateString][slot] > 0) {
                    isSlotBooked = true;
                }

                // ตรวจสอบว่าช่องเวลาผ่านมาแล้วหรือไม่ (สำหรับวันนี้เท่านั้น)
                let isPastTime = false;
                if (isToday) {
                    const [startHour, startMinute] = slot.split(' - ')[0].split(':').map(Number); // ใช้เวลาเริ่มต้นของ slot
                    const slotStartDateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, startMinute, 0);
                    if (now > slotStartDateTime) { // เปรียบเทียบกับเวลาปัจจุบัน
                        isPastTime = true;
                    }
                }

                if (isSlotBooked || isPastTime) {
                    timeSlotDiv.classList.add('unavailable-slot');
                    timeSlotDiv.title = isSlotBooked ? 'ช่วงเวลานี้ถูกจองแล้ว' : 'ช่วงเวลานี้ผ่านไปแล้ว';
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

    /**
     * เปิด Popup สำหรับกรอกข้อมูลการจอง  setTimeout
     * @param {Date} date - วันที่ที่เลือก
     * @param {string} slot - ช่วงเวลาที่เลือก
     */
    function openBookingPopup(date, slot) {
		console.log('openBookingPopup ถูกเรียกใช้งานสำหรับวันที่:', date, 'ช่วงเวลา:', slot); // <-- เพิ่มบรรทัดนี้
        selectedTimeSlot = slot;
        popupDate.textContent = formatDateThai(date);
        popupTimeSlot.textContent = slot;
        formMessage.textContent = ''; // ล้างข้อความแจ้งเตือนก่อนหน้า
        formMessage.className = 'form-message'; // รีเซ็ตคลาสข้อความ
        document.getElementById('fullName').value = ''; // ล้างค่าในฟอร์ม (แทน bookingForm.reset() ที่อาจมีปัญหา)
        document.getElementById('telNumber').value = ''; // ล้างค่าในฟอร์ม
        document.getElementById('bookingReason').value = ''; // ล้างค่าในฟอร์ม
        bookingPopup.classList.remove('hidden'); // ลบคลาส hidden เพื่อแสดง popup พร้อมอนิเมชั่น
		// ซ่อนส่วนเลือกช่วงเวลาไป
		timeSlotDetails.classList.add('hidden'); // <-- เพิ่มบรรทัดนี้เข้ามา
		
		setTimeout(() => { // ใช้ setTimeout เล็กน้อยเพื่อให้เบราว์เซอร์มีเวลาปรับการแสดงผล hidden ก่อน
        bookingPopup.classList.add('is-active'); 
    }, 10); // ดีเลย์เล็กน้อย (10ms)
    }

    /** * ส่งข้อมูลการจองไปยัง Google Apps Script
     * @param {Event} event - Event object จากการ submit ฟอร์ม 
     */
    async function submitBooking(event) {
        event.preventDefault(); // ป้องกันการ reload หน้าเว็บ

        const fullName = document.getElementById('fullName').value.trim();
        const telNumber = document.getElementById('telNumber').value.trim();
        const bookingReason = document.getElementById('bookingReason').value.trim();
        const bookingDate = formatDateForComparison(selectedDate); //YYYY-MM-DD

        // ตรวจสอบข้อมูลก่อนส่ง
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

        formMessage.textContent = ''; // Clear previous messages
        formMessage.className = 'form-message'; // Reset class
        bookingPopup.classList.add('hidden'); // Hide the booking form popup
        loadingSpinner.classList.remove('hidden'); // Show the loading spinner

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
            console.log('ผลลัพธ์จากเซิร์ฟเวอร์:', result); // สำหรับ debug

            if (result.includes('Booking successful!')) {
                loadingSpinner.classList.add('hidden'); // Hide spinner on success
                formMessage.textContent = 'ได้รับการจองคิวของท่านแล้ว กรุณานำบัตรประชาชน หรือเอกสารที่เกี่ยวข้องมาด้วย ขอบคุณครับ';
                formMessage.className = 'form-message success';
                bookingPopup.classList.remove('hidden'); // Show popup again to display success message
                bookingPopup.classList.add('is-active'); // Re-activate for styling

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
                    fetchData(); // โหลดข้อมูลใหม่
                }, 4000); // Give user time to read the success message
            } else {
                loadingSpinner.classList.add('hidden'); // Hide spinner on error
                formMessage.textContent = 'เกิดข้อผิดพลาดในการจอง: ' + result;
                formMessage.className = 'form-message error';
                bookingPopup.classList.remove('hidden'); // Show popup again to display error message
                bookingPopup.classList.add('is-active'); // Re-activate for styling
            }
        } catch (error) {
            loadingSpinner.classList.add('hidden'); // Hide spinner on connection error
            console.error('ข้อผิดพลาดในการส่งข้อมูลการจอง:', error);
            formMessage.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + error.message;
            formMessage.className = 'form-message error';
            bookingPopup.classList.remove('hidden'); // Show popup again to display error message
            bookingPopup.classList.add('is-active'); // Re-activate for styling
        }
    }


    /**
     * ฟังก์ชันแปลงดัชนีเดือนเป็นชื่อภาษาไทย
     * @param {number} monthIndex - ดัชนีเดือน (0-11)
     * @returns {string} ชื่อเดือนภาษาไทย
     */
    function getMonthName(monthIndex) {
        const monthNames = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        return monthNames[monthIndex];
    }

    /**
     * ฟังก์ชันจัดรูปแบบวันที่เป็นภาษาไทย (DD เดือนYYYY พ.ศ.)
     * @param {Date} date - วัตถุ Date
     * @returns {string} วันที่ในรูปแบบ DD เดือนYYYY พ.ศ.
     */
    function formatDateThai(date) {
        const day = date.getDate();
        const month = getMonthName(date.getMonth());
        const year = date.getFullYear() + 543; // พ.ศ.
        return `${day} ${month} ${year}`;
    }

    /** * ฟังก์ชันจัดรูปแบบวันที่เป็นYYYY-MM-DD สำหรับการเปรียบเทียบกับ Google Sheet
     * @param {Date} date - วัตถุ Date
     * @returns {string} วันที่ในรูปแบบYYYY-MM-DD
     */
    function formatDateForComparison(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Event Listeners
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
        renderCalendar(currentMonth, currentYear); // Render calendar again to ensure latest data
    });

    closePopupBtn.addEventListener('click', () => {
     bookingPopup.classList.remove('is-active'); // ลบคลาส active เพื่อเริ่ม animation ปิด
    setTimeout(() => {
        bookingPopup.classList.add('hidden'); // ซ่อน popup-overlay หลังจาก animation จบ
    }, 300); // ตั้งเวลาให้เท่ากับ transition duration ใน CSS (0.3s = 300ms)
});

    // This event listener was empty or incorrect: `bookingForm.addEventListener('', async (e) => {`
    // It has been removed as the `submitBooking` function is already correctly assigned.

    // เริ่มต้นดึงข้อมูลและแสดงปฏิทิน 
    fetchData();
});