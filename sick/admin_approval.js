document.addEventListener('DOMContentLoaded', function() {
    const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbyHl1Bny2wB--upeU0PBwafooNrmddwVrzLZz70r3sRUn6ep9CfCyVSJidtw-f_kEZsUw/exec';
    const pendingLeaveTableBody = document.querySelector('#pending-leave-table tbody');
    const modal = document.getElementById('approval-modal');
    const modalContent = document.getElementById('modal-content');

    // ฟังก์ชันสำหรับจัดรูปแบบวันที่
    function formatDateForDisplay(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${day}/${month}/${year}`;
    }

    // ฟังก์ชันสำหรับดึงข้อมูล
    window.fetchPendingRequests = async function() {
        if (!pendingLeaveTableBody) return;
        pendingLeaveTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">กำลังโหลดข้อมูล...</td></tr>';
        
        try {
            const response = await fetch(appsScriptUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `action=getPendingLeaveRequests`
            });
            const result = await response.json();

            if (result.success) {
                renderPendingRequests(result.requests);
            } else {
                pendingLeaveTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">ไม่สามารถดึงข้อมูลได้: ${result.message}</td></tr>`;
            }
        } catch (error) {
            console.error('Error:', error);
            pendingLeaveTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">เกิดข้อผิดพลาดในการเชื่อมต่อ</td></tr>';
        }
    }

    // ฟังก์ชันแสดงรายการลงในตาราง
    function renderPendingRequests(requests) {
        pendingLeaveTableBody.innerHTML = '';
        if (!requests || requests.length === 0) {
            pendingLeaveTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">ไม่มีคำขอลาที่รออนุมัติ</td></tr>';
            return;
        }

        requests.forEach(request => {
            const row = pendingLeaveTableBody.insertRow();
            let statusBadge = '';
            let btnText = 'อนุมัติ';
            let btnClass = 'btn-approve'; // ใช้คลาสตาม CSS ใน HTML

            if (request.status === 'รออนุมัติยกเลิก') {
                statusBadge = '<br><small style="color:#ef4444;">(ขออนุมัติยกเลิก)</small>';
                btnText = 'อนุมัติยกเลิก';
            }

            // จัดการวันที่เริ่ม-สิ้นสุดให้สวยงาม
            const dateRange = `${formatDateForDisplay(request.startDate)} - ${formatDateForDisplay(request.endDate)}`;

            row.innerHTML = `
                <td><strong>${request.name}</strong></td>
                <td>${request.leaveType}${statusBadge}</td>
                <td style="text-align:center;">${request.duration}</td>
                <td>${dateRange}</td>
                <td>${request.reason || '-'}</td>
                <td>
                    <button class="${btnClass}" data-leave-id="${request.leaveId}" data-status="${request.status}">${btnText}</button>
                    <button class="btn-reject" data-leave-id="${request.leaveId}" data-status="${request.status}">ไม่อนุมัติ</button>
                </td>
            `;
        });

        // ผูกเหตุการณ์คลิก
        document.querySelectorAll('.btn-approve').forEach(btn => btn.addEventListener('click', handleApproveRequest));
        document.querySelectorAll('.btn-reject').forEach(btn => btn.addEventListener('click', handleRejectRequest));
    }

    function handleApproveRequest(event) {
        const btn = event.target;
        const row = btn.closest('tr');
        const requestData = {
            leaveId: btn.dataset.leaveId,
            currentStatus: btn.dataset.status,
            name: row.cells[0].textContent,
            leaveType: row.cells[1].textContent.replace('(ขออนุมัติยกเลิก)', '').trim(),
            duration: row.cells[2].textContent,
            dateRange: row.cells[3].textContent,
            reason: row.cells[4].textContent
        };
        showApprovalModal(requestData);
    }

    function showApprovalModal(data) {
        let title = data.currentStatus === 'รออนุมัติยกเลิก' ? 'ยืนยันการอนุมัติยกเลิก' : 'อนุมัติคำขอลา';
        let confirmBtnText = data.currentStatus === 'รออนุมัติยกเลิก' ? 'ยืนยันการยกเลิก' : 'อนุมัติการลา';

        modalContent.innerHTML = `
            <h2 style="color: #1e293b; margin-top:0;">${title}</h2>
            <div style="text-align: left; margin: 20px 0; color: #475569; line-height: 1.6;">
                <p><strong>ชื่อ:</strong> ${data.name}</p>
                <p><strong>ประเภท:</strong> ${data.leaveType}</p>
                <p><strong>วันที่:</strong> ${data.dateRange}</p>
                <p><strong>จำนวน:</strong> ${data.duration} วัน</p>
                <p><strong>เหตุผล:</strong> ${data.reason}</p>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="confirm-approve-button" class="btn-approve" style="padding: 10px 30px;">${confirmBtnText}</button>
                <button id="close-modal-button" class="btn-reject" style="padding: 10px 30px; background:#94a3b8;">ปิด</button>
            </div>
        `;
        modal.style.display = 'flex';

        document.getElementById('confirm-approve-button').onclick = () => {
            // ดึง adminId จาก window.loggedInAdminId (ต้องถูก set จาก login_popup.js)
            const adminId = window.loggedInAdminId || 'unknown';
            sendApproval(data.leaveId, adminId);
        };

        document.getElementById('close-modal-button').onclick = () => modal.style.display = 'none';
    }

    async function sendApproval(leaveId, approverId) {
        modal.style.display = 'none';
        try {
            const response = await fetch(appsScriptUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `action=approveLeave&leaveId=${leaveId}&approverId=${approverId}`
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) window.fetchPendingRequests();
        } catch (e) {
            alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
        }
    }

    async function handleRejectRequest(event) {
        const { leaveId, status } = event.target.dataset;
        let msg = status === 'รออนุมัติยกเลิก' ? 'ยืนยันการไม่อนุมัติการยกเลิก?' : 'ยืนยันการไม่อนุมัติคำขอลา?';
        
        if (!confirm(msg)) return;

        try {
            const response = await fetch(appsScriptUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `action=rejectLeave&leaveId=${leaveId}`
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) window.fetchPendingRequests();
        } catch (e) {
            alert('เกิดข้อผิดพลาด');
        }
    }

    // ปิด Modal เมื่อคลิกพื้นหลัง
    window.onclick = function(event) {
        if (event.target == modal) modal.style.display = "none";
    }
});