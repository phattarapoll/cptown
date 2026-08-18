document.addEventListener('DOMContentLoaded', function() {
    const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbxvbVlZq0HKnR6RhMvMPnIO-YkgeOrymcoudQKif7EcWsWEoPC3PyPsDykXcZQgc9tEKw/exec';

    // Elements
    const loginContainer = document.getElementById('login-container');
    const mainAppContainer = document.getElementById('main-app-container');
    const officerListContainer = document.getElementById('officer-list-container');
    const loginModal = document.getElementById('login-modal');
    const passwordDisplay = document.getElementById('password-display');
    const keypadContainer = document.getElementById('keypad-container');
    const leaveHistoryTableBody = document.querySelector('#leave-history-table tbody');

    let currentPassword = '';
    let selectedOfficerId = '';
    let currentUser = null;
    let allLeaveHistory = [];

    // --- Helper Functions ---
    function formatDate(d) {
        if (!d) return '-';
        const date = new Date(d);
        return isNaN(date.getTime()) ? d : `${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getFullYear()+543}`;
    }

    function calculateWorkDuration(start, end) {
        if (!start) return '-';
        const s = new Date(start), e = new Date(end);
        let y = e.getFullYear() - s.getFullYear(), m = e.getMonth() - s.getMonth(), d = e.getDate() - s.getDate();
        if (d < 0) { m--; d += new Date(e.getFullYear(), e.getMonth(), 0).getDate(); }
        if (m < 0) { y--; m += 12; }
        return `${y} ปี ${m} เดือน ${d} วัน`;
    }

    // ปรับปรุงการคำนวณวันทำการตามระเบียบราชการ (ไม่นับวันเสาร์-อาทิตย์)
    // หมายเหตุ: หากต้องการตัดวันหยุดนักขัตฤกษ์ด้วย สามารถเพิ่มอาเรย์วันหยุด,ตรวจสอบในลูปได้
    function calculateWorkingDays(start, end, leaveType) {
        let count = 0, cur = new Date(start), fin = new Date(end);
        
        // ตรวจสอบความถูกต้องของช่วงวันที่
        if (cur > fin) return 0;

        while (cur <= fin) {
            const dayOfWeek = cur.getDay();
            // ลาป่วย: ตามระเบียบนับวันหยุดที่อยู่ระหว่างการลาป่วยรวมด้วย (ยกเว้นวันหยุดราชการประจำปีตามประกาศ)
            // ลากิจ / ลาพักผ่อน: นับเฉพาะวันทำการ (ไม่นับ เสาร์-อาทิตย์)
            if (leaveType === 'ลาป่วย') {
                count++; // ลาป่วยนับรวมวันหยุดเสาร์-อาทิตย์ที่อยู่ระหว่างการลาตามระเบียบ
            } else {
                if (dayOfWeek !== 0 && dayOfWeek !== 6) { // ไม่ใช่วันอาทิตย์ (0) และวันเสาร์ (6)
                    count++;
                }
            }
            cur.setDate(cur.getDate() + 1);
        }
        return count;
    }

    // --- Login & Keypad & Keyboard Support ---
    async function fetchOfficerList() {
        const res = await fetch(appsScriptUrl, { method: 'POST', body: 'action=getOfficerList', headers: {'Content-Type': 'application/x-www-form-urlencoded'} });
        const data = await res.json();
        if (data.success) {
            officerListContainer.innerHTML = '';
            data.officers.forEach(off => {
                const card = document.createElement('div');
                card.className = 'officer-card';
                card.innerHTML = `<i class="fa-solid fa-user-doctor"></i><h4>${off.name}</h4>`;
                card.onclick = () => {
                    selectedOfficerId = off.id;
                    document.getElementById('login-officer-name').textContent = off.name;
                    currentPassword = ''; passwordDisplay.textContent = '';
                    loginModal.style.display = 'flex';
                };
                officerListContainer.appendChild(card);
            });
        }
    }

    function createKeypad() {
        keypadContainer.innerHTML = '';
        for (let i = 1; i <= 9; i++) {
            const btn = document.createElement('button'); btn.className = 'keypad-btn'; btn.textContent = i;
            btn.onclick = () => handleInput(i.toString()); keypadContainer.appendChild(btn);
        }
        const clearBtn = document.createElement('button'); clearBtn.className = 'keypad-btn keypad-btn-clear'; clearBtn.textContent = 'C';
        clearBtn.onclick = () => { currentPassword = ''; passwordDisplay.textContent = ''; }; keypadContainer.appendChild(clearBtn);

        const zeroBtn = document.createElement('button'); zeroBtn.className = 'keypad-btn'; zeroBtn.textContent = '0';
        zeroBtn.onclick = () => handleInput('0'); keypadContainer.appendChild(zeroBtn);

        const delBtn = document.createElement('button'); delBtn.className = 'keypad-btn keypad-btn-delete'; delBtn.innerHTML = '<i class="fa-solid fa-delete-left"></i>';
        delBtn.onclick = () => { currentPassword = currentPassword.slice(0, -1); passwordDisplay.textContent = '*'.repeat(currentPassword.length); };
        keypadContainer.appendChild(delBtn);
    }

    document.addEventListener('keydown', (e) => {
        if (loginModal.style.display === 'flex') {
            if (e.key >= '0' && e.key <= '9') handleInput(e.key);
            else if (e.key === 'Backspace') {
                currentPassword = currentPassword.slice(0, -1);
                passwordDisplay.textContent = '*'.repeat(currentPassword.length);
            }
            else if (e.key === 'Escape') loginModal.style.display = 'none';
        }
    });

    async function handleInput(num) {
        if (currentPassword.length < 4) {
            currentPassword += num;
            passwordDisplay.textContent = '*'.repeat(currentPassword.length);
            if (currentPassword.length === 4) {
                passwordDisplay.textContent = 'ตรวจสอบ...';
                const res = await fetch(appsScriptUrl, { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: `action=login&id=${selectedOfficerId}&password=${currentPassword}` });
                const data = await res.json();
                if (data.success) {
                    loginModal.style.display = 'none'; loginContainer.classList.add('hidden');
                    mainAppContainer.classList.remove('hidden'); document.getElementById('floating-history-button').classList.remove('hidden');
                    fetchUserData(selectedOfficerId);
                } else { alert('รหัสผ่านไม่ถูกต้อง'); currentPassword = ''; passwordDisplay.textContent = ''; }
            }
        }
    }

    async function fetchUserData(id) {
        const res = await fetch(appsScriptUrl, { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: `action=getUserData&id=${id}` });
        const data = await res.json();
        if (data.success) {
            currentUser = data.user;
            allLeaveHistory = data.leaveHistory;
            renderDashboard(data.user, data.leaveHistory);
        }
    }

function renderDashboard(user, history) {
    // 1. แสดงข้อมูลผู้ใช้งานทั่วไป
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('nav-user-name').textContent = user.name;
    document.getElementById('user-position').textContent = user.position;
    document.getElementById('user-organization').textContent = user.organization;
    document.getElementById('user-phone').textContent = user.phone;
    document.getElementById('user-address').textContent = user.address || '-';
    
    document.getElementById('work-start-date').textContent = formatDate(user.workStartDate);
    document.getElementById('old-work-duration').textContent = calculateWorkDuration(user.workStartDate, user.workTransferDate);
    document.getElementById('new-work-duration').textContent = calculateWorkDuration(user.workTransferDate, new Date());
    document.getElementById('total-work-duration').textContent = calculateWorkDuration(user.workStartDate, new Date());

    // 2. ดึงค่าจำนวนวันที่ใช้ไปแล้วจากฐานข้อมูลโดยตรง (คอลัมน์ M, N, O ที่ส่งมาผ่าน object user)
    const vacationUsed = parseFloat(user.currentAnnualLeave) || 0;   // คอลัมน์ M (index 12)
    const sickUsed = parseFloat(user.currentSickLeave) || 0;           // คอลัมน์ N (index 13)
    const personalUsed = parseFloat(user.currentPersonalLeave) || 0;   // คอลัมน์ O (index 14)

    // 3. แสดงผล "วันที่ใช้ไป" ลงในหน้าเว็บ
    document.getElementById('vacation-leave-used').textContent = vacationUsed;
    document.getElementById('sick-leave-used').textContent = sickUsed;
    document.getElementById('personal-leave-used').textContent = personalUsed;

    // 4. คำนวณวันลาคงเหลือ
    // - ลาพักผ่อนคงเหลือ = (สิทธิ์ประจำปี + วันสะสม) - วันที่ใช้ไป
    const totalVacationRights = (parseFloat(user.annualLeave) || 0) + (parseFloat(user.accumulatedLeave) || 0);
    document.getElementById('vacation-leave-remaining').textContent = totalVacationRights - vacationUsed;

    // - ลาป่วยคงเหลือ = สมมติสิทธิ์ลาป่วย 30 วัน - ที่ใช้ไป (หรือปรับเปลี่ยนตามโควต้าจริงของคุณ)
    document.getElementById('sick-leave-remaining').textContent = 30 - sickUsed;

    // 5. แสดงตารางประวัติการลาทั้งหมด
    renderHistory(history);
}


    function renderHistory(history) {
        leaveHistoryTableBody.innerHTML = history.length > 0 ? history.map(l => `
            <tr>
                <td>${l.leaveType}</td>
                <td style="font-size: 0.85rem">${formatDate(l.startDate)}</td>
                <td style="text-align: center">${l.duration}</td>
                <td><span class="status-badge ${l.status === 'อนุมัติแล้ว' ? 'success' : 'pending'}">${l.status}</span></td>
                <td><button class="btn-cancel" onclick="handleCancel('${l.leaveId}')"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `).join('') : '<tr><td colspan="5" style="text-align:center; padding: 20px;">ไม่พบข้อมูล</td></tr>';
    }

    // --- กรองประวัติการลา ---
    document.getElementById('btn-filter-history').onclick = () => {
        const startY = parseInt(document.getElementById('history-start-year').value);
        const endY = parseInt(document.getElementById('history-end-year').value);
        
        if (!startY || !endY) { alert('กรุณาระบุปี พ.ศ. ให้ครบถ้วน'); return; }

        const filtered = allLeaveHistory.filter(l => {
            const leaveYear = new Date(l.startDate).getFullYear() + 543;
            return leaveYear >= startY && leaveYear <= endY;
        });
        renderHistory(filtered);
    };

    // --- Events ---
    document.getElementById('leave-form').onsubmit = async (e) => {
        e.preventDefault();
        const leaveTypeVal = document.getElementById('leave-type').value;
        const startDateVal = document.getElementById('leave-start-date').value;
        const endDateVal = document.getElementById('leave-end-date').value;

        // คำนวณวันตามประเภทการลาที่ถูกต้องตามระเบียบ
        const duration = calculateWorkingDays(startDateVal, endDateVal, leaveTypeVal);

        const body = new URLSearchParams({
            action: 'submitLeave', id: currentUser.id, leaveType: leaveTypeVal,
            startDate: startDateVal, endDate: endDateVal,
            phone: document.getElementById('leave-phone').value, reason: document.getElementById('leave-reason').value, duration: duration
        });
        const res = await fetch(appsScriptUrl, { method: 'POST', body });
        const result = await res.json();
        if (result.success) { alert('ส่งใบลาสำเร็จ'); location.reload(); }
    };

    document.getElementById('floating-history-button').onclick = () => document.getElementById('floating-history-panel').classList.add('visible');
    document.getElementById('close-history-panel').onclick = () => document.getElementById('floating-history-panel').classList.remove('visible');
    document.getElementById('close-login-modal').onclick = () => loginModal.style.display = 'none';

    createKeypad();
    fetchOfficerList();
});

function handleCancel(id) { if(confirm('ต้องการยกเลิกใบลา?')) alert('ส่งคำขอยกเลิกแล้ว (ฟังก์ชันนี้ต้องเชื่อมต่อกับ API ยกเลิก)'); }