// custom.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. ADMIN Login
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const ADMIN_PASSWORD = '3946'; // Hardcoded ADMIN password

    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', () => {
            const password = prompt('กรุณาใส่รหัสผ่าน ADMIN:');
            if (password === ADMIN_PASSWORD) {
                alert('เข้าสู่ระบบ ADMIN สำเร็จ!');
                window.location.href = 'https://phattarapoll.github.io/cptown/ADM.html'; 
            } else {
                alert('รหัสผ่านไม่ถูกต้อง!');
            }
        });
    }

    // --- ส่วนแสดงคิว (Queue) ถูกลบออกตามคำขอ เพื่อไม่ให้กระทบส่วนอื่น ---

    // 2. Service Open/Closed Toggle
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

    // 3. Scrolling Text for Patient Satisfaction Comments
    const scrollingCommentDisplay = document.getElementById('scrollingCommentDisplay');
    const sheetData = [
        { colA: "28/9/2020, 13:27:58", colK: "หมอน่ารัก นัดทำฟันที่บ้านก็ได้ ขอบคุณค่ะ" },
    ];

    function populateAndAnimateComments() {
        if (!scrollingCommentDisplay || sheetData.length === 0) return;

        scrollingCommentDisplay.innerHTML = ''; 
        const commentsToAppend = [];
        sheetData.forEach(item => commentsToAppend.push(item));
        for(let i = 0; i < 5; i++) { 
            sheetData.forEach(item => commentsToAppend.push(item));
        }

        commentsToAppend.forEach(item => {
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('scrolling-comment-item');
            const datePart = item.colA.split(',')[0];
            commentDiv.innerHTML = `<span class="font-semibold text-gray-600 text-sm">${datePart}:</span> ${item.colK}`;
            scrollingCommentDisplay.appendChild(commentDiv);
        });

        setTimeout(() => {
            const totalContentHeight = scrollingCommentDisplay.scrollHeight;
            const singleCycleHeight = totalContentHeight / (commentsToAppend.length / sheetData.length);
            const scrollSpeedPxPerSec = 20; 
            const animationDurationSeconds = singleCycleHeight / scrollSpeedPxPerSec;

            scrollingCommentDisplay.style.setProperty('--scroll-height', `-${singleCycleHeight}px`);
            scrollingCommentDisplay.style.animationDuration = `${animationDurationSeconds}s`;
            scrollingCommentDisplay.style.animationPlayState = 'running';
        }, 100);
    }
    populateAndAnimateComments();

    // 4. Fetch News from Google Sheet (กระดานข่าว) - คงไว้ตามเดิม
    const newsBoard = document.getElementById('newsBoard');
    const newsLoading = document.getElementById('newsLoading');
    const newsError = document.getElementById('newsError');
    const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbzHy1NyAVT3fOQzQpgeKf0L4duDNr94evxd-h-AUkYPKJYhfkQMN7T_iFwjJVtlQlLN/exec';

    async function fetchNewsFromGoogleSheet() {
        if (!newsBoard) return;
        newsLoading.classList.remove('hidden');
        if (newsError) newsError.classList.add('hidden');
        newsBoard.innerHTML = ''; 

        try {
            const response = await fetch(GOOGLE_SHEET_API_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            if (newsLoading) newsLoading.classList.add('hidden');

            if (data.length === 0) {
                newsBoard.innerHTML = '<p class="text-center text-gray-600">ไม่มีข่าวสารในขณะนี้</p>';
                return;
            }

            data.forEach(newsItem => {
                const newsDiv = document.createElement('div');
                newsDiv.classList.add('bg-gray-50', 'p-4', 'rounded-lg', 'shadow-sm', 'border', 'border-gray-200');
                const date = new Date(newsItem.date).toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });

                let linkHtml = '';
                if (newsItem.link && newsItem.link !== '') {
                    linkHtml = `<a href="${newsItem.link}" target="_blank" class="text-blue-600 hover:underline text-sm mt-2 block">เข้าสู่ระบบ หรือ อ่านเพิ่มเติม <i class="fas fa-external-link-alt ml-1"></i></a>`;
                }

                newsDiv.innerHTML = `
                    <p class="font-semibold text-lg text-blue-700">${newsItem.title}</p>
                    <p class="text-sm text-gray-500">วันที่: ${date}</p>
                    ${linkHtml}
                `;
                newsBoard.appendChild(newsDiv);
            });
        } catch (error) {
            console.error('Error fetching news:', error);
            if (newsLoading) newsLoading.classList.add('hidden');
            if (newsError) newsError.classList.remove('hidden');
        }
    }
    fetchNewsFromGoogleSheet();
	
    // 5. Staff Login Logic
    const staffDropdownBtn = document.getElementById('staffDropdownBtn');
    const staffDropdownContent = document.getElementById('staffDropdownContent');
    const passwordField = document.getElementById('passwordField');
    const passwordForm = document.getElementById('passwordForm');
    const staffLinks = document.getElementById('staffLinks');
    const keypadBtns = staffDropdownContent ? staffDropdownContent.querySelectorAll('.keypad-btn') : [];
    const loginButton = document.getElementById('loginButton');
    const cancelButton = document.getElementById('cancelButton');
    const correctPassword = '3946';

    if (staffDropdownBtn && staffDropdownContent && passwordField) {
        staffDropdownBtn.addEventListener('click', (event) => {
            staffDropdownContent.classList.toggle('active');
            passwordField.value = '';
            if (passwordForm) passwordForm.classList.remove('hidden');
            if (staffLinks) staffLinks.classList.add('hidden');
            event.stopPropagation();
        });

        function attemptLogin() {
            if (passwordField.value === correctPassword) {
                if (passwordForm) passwordForm.classList.add('hidden');
                if (staffLinks) staffLinks.classList.remove('hidden');
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
                } else {
                    passwordField.value += value;
                }
            });
        });

        if (loginButton) {
            loginButton.addEventListener('click', (e) => {
                e.preventDefault();
                attemptLogin();
            });
        }

        if (cancelButton) {
            cancelButton.addEventListener('click', (e) => {
                e.preventDefault();
                passwordField.value = '';
                staffDropdownContent.classList.remove('active');
            });
        }

        staffDropdownContent.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }
});