document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://script.google.com/macros/s/AKfycbwiDfG7KDZafQGUfJzygS8qhDeG4SSd_5TORcJclqDBERhsutX_y2Cstbvc9d0LyW5_/exec'; 

    const dataTable = document.getElementById('dataTable');
    const tableBody = dataTable.querySelector('tbody');
    const loadingDiv = document.getElementById('loading');
    const errorMessageDiv = document.getElementById('error-message');
    const currentYearSpan = document.getElementById('current-year');
    const printButton = document.getElementById('printButton');
    const toggleCompletedBtn = document.getElementById('toggleCompletedBtn');

    let isHidden = false;

    // ฟังก์ชันสำหรับแปลงวันที่
    function formatDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString; 
        }

        const options = {
            weekday: 'long', 
            day: 'numeric',
            month: 'long',   
            year: 'numeric'
        };

        const formatter = new Intl.DateTimeFormat('th-TH', options);
        return formatter.format(date);
    }

    // ฟังก์ชันตรวจสอบสถานะเทียบกับวันปัจจุบัน
    function getStatusBadge(dateString) {
        const eventDate = new Date(dateString);
        if (isNaN(eventDate.getTime())) {
            return { badge: null, status: 'unknown' };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);

        const badge = document.createElement('span');
        // ปรับ Margin ให้เว้นระยะห่างด้านขวาแทน เพื่อให้ป้ายอยู่หน้าข้อความวันที่
        badge.style.marginRight = '10px';
        badge.style.padding = '3px 8px';
        badge.style.borderRadius = '4px';
        badge.style.fontSize = '0.85em';
        badge.style.fontWeight = '500';
        badge.style.display = 'inline-block';

        if (eventDate < today) {
            // ผ่านมาแล้ว (Complete)
            badge.textContent = '✔️';
            badge.style.backgroundColor = '#d4edda';
            badge.style.color = '#155724';
            badge.style.border = '1px solid #c3e6cb';
            return { badge: badge, status: 'completed' };
        } else if (eventDate.getTime() === today.getTime()) {
            // ถึงกำหนดวันนี้
            badge.textContent = '📌 วันนี้';
            badge.style.backgroundColor = '#cce5ff';
            badge.style.color = '#004085';
            badge.style.border = '1px solid #b8daff';
            return { badge: badge, status: 'today' };
        } else {
            // ยังไม่ถึง (รอเวลา)
            badge.textContent = '⏳';
            badge.style.backgroundColor = '#fff3cd';
            badge.style.color = '#856404';
            badge.style.border = '1px solid #ffeeba';
            return { badge: badge, status: 'pending' };
        }
    }

    function showLoading() {
        loadingDiv.style.display = 'block';
        dataTable.style.display = 'none';
        errorMessageDiv.style.display = 'none';
    }

    function hideLoading() {
        loadingDiv.style.display = 'none';
    }

    function showTable() {
        dataTable.style.display = 'table';
    }

    function showErrorMessage() {
        errorMessageDiv.style.display = 'block';
        hideLoading();
    }

    const now = new Date();
    const currentBuddhistYear = now.getFullYear() + 543;
    if (currentYearSpan) {
        currentYearSpan.textContent = currentBuddhistYear;
    }

    if (printButton) {
        printButton.addEventListener('click', function() {
            window.print();
        });
    }

    if (toggleCompletedBtn) {
        toggleCompletedBtn.addEventListener('click', function() {
            isHidden = !isHidden;
            const completedRows = tableBody.querySelectorAll('tr.is-completed');

            completedRows.forEach(row => {
                if (isHidden) {
                    row.classList.add('hidden-row');
                } else {
                    row.classList.remove('hidden-row');
                }
            });

            if (isHidden) {
                toggleCompletedBtn.textContent = '📂 แสดงรายการที่เสร็จสิ้นแล้ว';
            } else {
                toggleCompletedBtn.textContent = '📂 ซ่อนรายการที่เสร็จสิ้นแล้ว';
            }
        });
    }

    showLoading();

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            hideLoading();
            if (data && Array.isArray(data) && data.length > 0) {
                data.forEach(row => {
                    const tr = document.createElement('tr');
                    if (Array.isArray(row) && row.length === 5) {
                        const rawDate = row[0];
                        const school = row[1];
                        const time = row[2];
                        const grade = row[3];
                        const note = row[4];

                        const displayDate = formatDate(rawDate);
                        
                        const tdDate = document.createElement('td');
                        
                        // ดึง Badge และ Status
                        const { badge, status } = getStatusBadge(rawDate);
                        
                        if (status === 'completed') {
                            tr.classList.add('is-completed');
                        }

                        // เปลี่ยนลำดับการ Append: เอา badge (เครื่องหมายถูก/นาฬิกาทราย) ไว้ก่อนข้อความวันที่
                        if (badge) {
                            tdDate.appendChild(badge);
                        }

                        // สร้าง Span สำหรับข้อความวันที่ เพื่อความเป็นระเบียบ
                        const dateSpan = document.createElement('span');
                        dateSpan.textContent = displayDate;
                        tdDate.appendChild(dateSpan);

                        tr.appendChild(tdDate);

                        const tdSchool = document.createElement('td');
                        tdSchool.textContent = school;
                        tr.appendChild(tdSchool);

                        const tdTime = document.createElement('td');
                        tdTime.textContent = time; 
                        tr.appendChild(tdTime);

                        const tdGrade = document.createElement('td');
                        tdGrade.textContent = grade;
                        tr.appendChild(tdGrade);

                        const tdNote = document.createElement('td');
                        tdNote.textContent = note;
                        tr.appendChild(tdNote);

                        tableBody.appendChild(tr);
                    } else {
                        console.warn('Skipping malformed row:', row);
                    }
                });
                showTable();
            } else {
                loadingDiv.textContent = 'ไม่พบข้อมูลแผนการปฏิบัติงาน';
                loadingDiv.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            showErrorMessage();
        });
});