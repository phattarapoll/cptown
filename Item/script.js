// --- IMPORTANT: Replace with your actual deployed Google Apps Script Web App URL ---
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxsOSSES3u7M1PvmJecVJYgYP7QwKhs17PBfiaytHi5RnDJtBMs4_KbPSCTKObLxM0/exec'; 
// ตัวอย่าง: https://script.google.com/macros/s/AKfycbz_XXXXXXXXXXXX_YYYYYY/exec

// Global state
let allMaterials = [];
let cart = [];
let currentActiveSection = 'request-materials-section';
let loadingProgress = 0;
let monthlyChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  updateLoadingProgress(10, "กำลังเตรียม UI...");
  setupEventListeners();
  loadMaterials(); // Load materials on initial page load
  // updateLoadingProgress(100, "ระบบพร้อมใช้งาน!"); // จะถูกเรียกหลังโหลดข้อมูลเสร็จสิ้น
}

function updateLoadingProgress(progress, text) {
  loadingProgress = progress;
  document.getElementById('loading-bar').style.width = loadingProgress + '%';
  document.getElementById('loading-text').textContent = text;
  if (progress >= 100) {
    setTimeout(() => {
      document.getElementById('loading-overlay').style.opacity = '0';
      setTimeout(() => document.getElementById('loading-overlay').style.display = 'none', 500);
    }, 500); // Hide loading overlay after a short delay
  }
}

function setupEventListeners() {
  // Menu navigation
  document.getElementById('menu-request').addEventListener('click', () => switchSection('request-materials-section', 'menu-request'));
  document.getElementById('menu-history').addEventListener('click', () => switchSection('past-requests-section', 'menu-history'));
  document.getElementById('menu-statistics').addEventListener('click', () => switchSection('statistics-section', 'menu-statistics'));

  // Material search
  document.getElementById('material-search').addEventListener('keyup', filterMaterials);

  // Cart and Save Request
  document.getElementById('save-request-btn').addEventListener('click', showPincodeModal);
  document.getElementById('pincode-confirm').addEventListener('click', handlePincodeConfirmation);
  document.getElementById('pincode-cancel').addEventListener('click', hidePincodeModal);
  document.getElementById('pincode-modal').addEventListener('click', (e) => {
    if (e.target.id === 'pincode-modal') hidePincodeModal();
  });

  // Request Detail Modal
  document.getElementById('close-detail-modal').addEventListener('click', () => document.getElementById('request-detail-modal').style.display = 'none');
  document.getElementById('request-detail-modal').addEventListener('click', (e) => {
    if (e.target.id === 'request-detail-modal') document.getElementById('request-detail-modal').style.display = 'none';
  });
  // Note: confirm-receive-btn handler is set dynamically in showRequestDetailModal

  // Print Modal
  document.getElementById('close-print-modal').addEventListener('click', () => document.getElementById('print-modal').style.display = 'none');
  document.getElementById('print-modal').addEventListener('click', (e) => {
    if (e.target.id === 'print-modal') document.getElementById('print-modal').style.display = 'none';
  });

  // History Search
  document.getElementById('history-search-btn').addEventListener('click', loadPastRequests);

  // Set default date for request form
  document.getElementById('request-date').valueAsDate = new Date();
}

// --- NEW: Universal function to call Google Apps Script Web App ---
async function callGAS(functionName, data = {}) {
  updateLoadingProgress(loadingProgress < 100 ? loadingProgress : 10, `กำลังเชื่อมต่อ ${functionName}...`); // Reset if already 100
  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        function: functionName,
        data: data
      })
    });

    if (!response.ok) {
      const errorText = await response.text(); // Get raw error response
      throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error(`Error calling GAS function ${functionName}:`, error);
    showError(error);
    throw error; // Re-throw to propagate the error
  } finally {
    // Progress update handled by individual functions that call this
  }
}

function switchSection(sectionId, menuButtonId) {
  // Hide all sections
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active-section');
  });

  // Deactivate all menu buttons
  document.querySelectorAll('.menu-item').forEach(button => {
    button.classList.remove('active');
  });

  // Show the selected section
  document.getElementById(sectionId).classList.add('active-section');
  document.getElementById(menuButtonId).classList.add('active');

  currentActiveSection = sectionId;

  // Load data for the selected section if necessary
  if (sectionId === 'past-requests-section') {
    loadPastRequests();
  } else if (sectionId === 'statistics-section') {
    loadStatistics();
  }
}

// --- Material Section Logic ---

async function loadMaterials() {
  updateLoadingProgress(30, "กำลังโหลดข้อมูลวัสดุ...");
  try {
    const materials = await callGAS('getMaterials');
    displayMaterials(materials);
    updateLoadingProgress(100, "ระบบพร้อมใช้งาน!");
  } catch (error) {
    // Error already handled by callGAS
    updateLoadingProgress(0, "เกิดข้อผิดพลาดในการโหลดวัสดุ!");
  }
}

function displayMaterials(materials) {
  updateLoadingProgress(60, "แสดงรายการวัสดุ...");
  allMaterials = materials; // Store for filtering
  const materialListDiv = document.getElementById('material-list');
  materialListDiv.innerHTML = ''; // Clear existing list

  if (materials.length === 0) {
    materialListDiv.innerHTML = '<p style="text-align: center; color: #666;">ไม่พบข้อมูลวัสดุ</p>';
    return;
  }

  materials.forEach(material => {
    const materialItem = document.createElement('div');
    materialItem.className = 'material-item';
    materialItem.innerHTML = `
      <div class="material-info">
        <h3>${material.ชื่อ} (${material.รหัส})</h3>
        <p>คงเหลือ: <strong>${material.คงเหลือ} ${material.หน่วย}</strong></p>
        <p>เบิกปีนี้: <span>${material.เบิกปีนี้ || 0} ${material.หน่วย}</span></p>
      </div>
      <div class="material-actions">
        <button onclick="addToCart('${material.รหัส}', '${material.ชื่อ}', '${material.หน่วย}')">
          <i class="fas fa-cart-plus"></i> เพิ่มตะกร้า
        </button>
      </div>
    `;
    materialListDiv.appendChild(materialItem);
  });
}

function filterMaterials() {
  const searchTerm = document.getElementById('material-search').value.toLowerCase();
  const filtered = allMaterials.filter(material =>
    material.ชื่อ.toLowerCase().includes(searchTerm) ||
    material.รหัส.toLowerCase().includes(searchTerm)
  );
  displayMaterials(filtered); // Re-render with filtered list
}

function addToCart(materialId, materialName, materialUnit) {
  // Check if item already in cart
  const existingItem = cart.find(item => item.id === materialId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: materialId, name: materialName, unit: materialUnit, quantity: 1 });
  }
  renderCart();
}

function removeFromCart(materialId) {
  cart = cart.filter(item => item.id !== materialId);
  renderCart();
}

function renderCart() {
  const cartItemsDiv = document.getElementById('cart-items');
  cartItemsDiv.innerHTML = ''; // Clear existing items

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p style="text-align: center; color: #666;">ไม่มีรายการในตะกร้า</p>';
    return;
  }

  cart.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-qty">${item.quantity} ${item.unit}</span>
      </div>
      <button class="delete-button" onclick="removeFromCart('${item.id}')">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;
    cartItemsDiv.appendChild(cartItem);
  });
}

function showPincodeModal() {
  if (cart.length === 0) {
    alert('กรุณาเพิ่มวัสดุลงในตะกร้าก่อนบันทึก!');
    return;
  }
  document.getElementById('pincode-modal').style.display = 'flex';
  document.getElementById('pincode-input').value = '';
  document.getElementById('pincode-input').focus();
}

function hidePincodeModal() {
  document.getElementById('pincode-modal').style.display = 'none';
}

async function handlePincodeConfirmation() {
  const pincode = document.getElementById('pincode-input').value;
  if (!pincode) {
    alert('กรุณาใส่ PIN Code');
    return;
  }
  await saveRequest(pincode); // Call async function
}

async function saveRequest(pinCode) {
  const requestDate = document.getElementById('request-date').value;
  const requester = document.getElementById('requester-name').value;
  const payer = document.getElementById('payer-name').value;

  if (!requestDate || !requester || !payer || payer === '........................') {
      alert('กรุณากรอกข้อมูลวันที่เบิก, ผู้เบิก, และผู้จ่ายให้ครบถ้วน');
      return;
  }

  const itemsToSave = cart.map(item => ({
    รหัส: item.id,
    ชื่อ: item.name,
    จำนวน: item.quantity,
    หน่วย: item.unit
  }));

  const requestData = {
    items: itemsToSave,
    requestDate: requestDate,
    requester: requester,
    payer: payer,
    pinCode: pinCode 
  };

  updateLoadingProgress(70, "กำลังบันทึกใบเบิก...");
  try {
    const response = await callGAS('saveRequest', requestData);
    hidePincodeModal();
    if (response.success) {
      alert(response.message + '\nเลขที่ใบเบิก: ' + response.requestNo);
      cart = []; // Clear cart after successful save
      renderCart();
      await loadMaterials(); // Reload materials to update stock
    } else {
      alert('เกิดข้อผิดพลาด: ' + response.message);
    }
  } catch (error) {
    // Error already handled by callGAS
  } finally {
    updateLoadingProgress(100, "การบันทึกเสร็จสิ้น");
  }
}

// --- Past Requests Section Logic ---

async function loadPastRequests() {
  updateLoadingProgress(30, "กำลังโหลดใบเบิกย้อนหลัง...");
  const searchReqNo = document.getElementById('history-search-req-no').value.toLowerCase();
  const searchDate = document.getElementById('history-search-date').value; //YYYY-MM-DD

  try {
    const requests = await callGAS('getPastRequests');
    displayPastRequests(requests, searchReqNo, searchDate);
    updateLoadingProgress(100, "โหลดใบเบิกย้อนหลังเสร็จสิ้น");
  } catch (error) {
    // Error already handled by callGAS
    updateLoadingProgress(0, "เกิดข้อผิดพลาดในการโหลดใบเบิกย้อนหลัง!");
  }
}

function displayPastRequests(requests, searchReqNo, searchDate) {
  const tableBody = document.getElementById('history-table-body');
  tableBody.innerHTML = '';

  const filteredRequests = requests.filter(req => {
    const matchReqNo = searchReqNo ? String(req['เลขที่ใบเบิก']).toLowerCase().includes(searchReqNo) : true;
    let matchDate = true;
    if (searchDate && req['วันที่เบิก']) {
        const reqDateObj = new Date(req['วันที่เบิก']);
        // Format to YYYY-MM-DD for comparison
        const reqDateFormatted = reqDateObj.getFullYear() + '-' +
                                String(reqDateObj.getMonth() + 1).padStart(2, '0') + '-' +
                                String(reqDateObj.getDate()).padStart(2, '0');
        matchDate = reqDateFormatted === searchDate;
    }
    return matchReqNo && matchDate;
  });

  if (filteredRequests.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666;">ไม่พบข้อมูลใบเบิกย้อนหลัง</td></tr>';
    return;
  }

  filteredRequests.forEach(req => {
    const row = tableBody.insertRow();
    row.insertCell().textContent = req['เลขที่ใบเบิก'];
    row.insertCell().textContent = formatDate(req['วันที่เบิก']);
    const statusCell = row.insertCell();
    statusCell.innerHTML = `<span class="status-badge ${req['สถานะ'] === 'รอดำเนินการ' ? 'status-pending' : 'status-completed'}">${req['สถานะ']}</span>`;

    const detailCell = row.insertCell();
    detailCell.className = 'table-actions';
    const detailButton = document.createElement('button');
    detailButton.innerHTML = '<i class="fas fa-eye detail-icon"></i>';
    detailButton.title = 'ดูรายละเอียด';
    detailButton.onclick = () => showRequestDetailModal(req);
    detailCell.appendChild(detailButton);

    const printCell = row.insertCell();
    printCell.className = 'table-actions';
    const printButton = document.createElement('button');
    printButton.innerHTML = '<i class="fas fa-print print-icon"></i>';
    printButton.title = 'พิมพ์ใบเบิก';
    printButton.onclick = () => showPrintModal(req);
    printCell.appendChild(printButton);
  });
}

function showRequestDetailModal(request) {
  document.getElementById('detail-req-no').textContent = request['เลขที่ใบเบิก'];
  document.getElementById('detail-req-date').textContent = formatDate(request['วันที่เบิก']);
  document.getElementById('detail-requester').textContent = request['ผู้เบิก'];
  document.getElementById('detail-payer').textContent = request['ผู้จ่าย'];
  document.getElementById('detail-status').textContent = request['สถานะ'];

  const detailItemsBody = document.getElementById('detail-items-body');
  detailItemsBody.innerHTML = '';

  request['รายการวัสดุ'].forEach(item => {
    const row = detailItemsBody.insertRow();
    row.insertCell().textContent = item.รหัส;
    row.insertCell().textContent = item.ชื่อ;
    row.insertCell().textContent = item.จำนวน; // Requested quantity

    // Editable quantity for received amount
    const receivedQtyCell = row.insertCell();
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.min = '0';
    qtyInput.value = item.จำนวน; // Default to requested quantity
    qtyInput.dataset.materialId = item.รหัส;
    qtyInput.dataset.originalQty = item.จำนวน; // Store original requested quantity
    receivedQtyCell.appendChild(qtyInput);

    row.insertCell().textContent = item.หน่วย;
  });

  // Set receive date if already confirmed
  const receiveDateInput = document.getElementById('receive-date');
  if (request['วันรับวัสดุ'] && request['วันรับวัสดุ'] !== '') {
    const dateObj = new Date(request['วันรับวัสดุ']);
    receiveDateInput.value = dateObj.toISOString().split('T')[0];
    receiveDateInput.readOnly = true; // Disable if already received
    document.getElementById('confirm-receive-btn').style.display = 'none'; // Hide button
  } else {
    receiveDateInput.valueAsDate = new Date(); // Default to today
    receiveDateInput.readOnly = false;
    document.getElementById('confirm-receive-btn').style.display = 'block';
  }

  // Pass the request object to the confirm button's click handler
  document.getElementById('confirm-receive-btn').onclick = () => confirmReceiveRequest(request['เลขที่ใบเบิก']);

  document.getElementById('request-detail-modal').style.display = 'flex';
}

async function confirmReceiveRequest(requestNo) {
  const receiveDate = document.getElementById('receive-date').value;
  if (!receiveDate) {
    alert('กรุณาระบุวันที่รับวัสดุ');
    return;
  }

  const receivedItems = [];
  document.querySelectorAll('#detail-items-body input[type="number"]').forEach(input => {
    const materialId = input.dataset.materialId;
    const actualQuantity = parseInt(input.value);
    if (isNaN(actualQuantity) || actualQuantity < 0) {
      alert('กรุณากรอกจำนวนที่รับจริงให้ถูกต้อง');
      // Exit function if validation fails
      throw new Error('Invalid quantity for material: ' + materialId);
    }
    // Find the material name and unit from allMaterials (or the original request if not found in allMaterials)
    const originalItem = allMaterials.find(m => m.รหัส === materialId);
    if (originalItem) {
      receivedItems.push({
        รหัส: materialId,
        ชื่อ: originalItem.ชื่อ,
        จำนวน: actualQuantity,
        หน่วย: originalItem.หน่วย
      });
    } else {
        console.warn(`Material with ID ${materialId} not found in allMaterials.`);
        const cartItem = cart.find(c => c.id === materialId);
        if (cartItem) {
             receivedItems.push({
                รหัส: materialId,
                ชื่อ: cartItem.name,
                จำนวน: actualQuantity,
                หน่วย: cartItem.unit
            });
        }
    }
  });

  if (receivedItems.length === 0) {
    alert('ไม่พบรายการวัสดุที่รับจริง');
    return;
  }

  const updateData = {
    requestNo: requestNo,
    receiveDate: receiveDate,
    receivedItems: receivedItems
  };

  updateLoadingProgress(70, "กำลังยืนยันการรับวัสดุ...");
  try {
    const response = await callGAS('confirmReceive', updateData);
    if (response.success) {
      alert(response.message);
      document.getElementById('request-detail-modal').style.display = 'none';
      await loadPastRequests(); // Reload history to update status
      await loadMaterials(); // Reload materials to update stock if needed (though stock is reduced on initial save)
    } else {
      alert('เกิดข้อผิดพลาด: ' + response.message);
    }
  } catch (error) {
    // Error already handled by callGAS
  } finally {
    updateLoadingProgress(100, "การยืนยันเสร็จสิ้น");
  }
}

function showPrintModal(request) {
  document.getElementById('print-date').textContent = formatDate(new Date());
  document.getElementById('print-req-no').textContent = request['เลขที่ใบเบิก'];
  document.getElementById('print-req-date').textContent = formatDate(request['วันที่เบิก']);
  document.getElementById('print-requester').textContent = request['ผู้เบิก'];
  document.getElementById('print-receive-date').textContent = request['วันรับวัสดุ'] ? formatDate(request['วันรับวัสดุ']) : 'ยังไม่ระบุ';

  const printItemsBody = document.getElementById('print-items-body');
  printItemsBody.innerHTML = '';

  request['รายการวัสดุ'].forEach(item => {
    const row = printItemsBody.insertRow();
    row.insertCell().textContent = item.รหัส;
    row.insertCell().textContent = item.ชื่อ;
    row.insertCell().textContent = item.จำนวน;
    row.insertCell().textContent = item.หน่วย;
    row.insertCell().textContent = ''; // หมายเหตุ
  });

  document.getElementById('print-modal').style.display = 'flex';
}

// --- Statistics Section Logic ---
async function loadStatistics() {
  updateLoadingProgress(30, "กำลังโหลดข้อมูลสถิติ...");
  try {
    const stats = await callGAS('getStatistics');
    displayStatistics(stats);
    updateLoadingProgress(100, "แสดงสถิติเสร็จสิ้น");
  } catch (error) {
    // Error already handled by callGAS
    updateLoadingProgress(0, "เกิดข้อผิดพลาดในการโหลดสถิติ!");
  }
}

function displayStatistics(stats) {
  updateLoadingProgress(60, "แสดงผลสถิติ...");
  const topMaterialsList = document.getElementById('top-materials-list');
  topMaterialsList.innerHTML = '';
  if (stats.topMaterials && stats.topMaterials.length > 0) {
    stats.topMaterials.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${item.name} (${item.id})</span><span>${item.quantity}</span>`;
      topMaterialsList.appendChild(li);
    });
  } else {
    topMaterialsList.innerHTML = '<li>ไม่มีข้อมูล</li>';
  }

  // Render Monthly Requests Chart
  const monthlyRequestsCanvas = document.getElementById('monthlyRequestsChart');
  if (monthlyChartInstance) {
    monthlyChartInstance.destroy(); // Destroy previous chart instance
  }

  const labels = stats.monthlyRequests.map(data => data.month);
  const dataValues = stats.monthlyRequests.map(data => data.quantity);

  monthlyChartInstance = new Chart(monthlyRequestsCanvas, {
    type: 'bar', // Can be 'line', 'bar', etc.
    data: {
      labels: labels,
      datasets: [{
        label: 'จำนวนวัสดุที่เบิก',
        data: dataValues,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'จำนวน'
          }
        },
        x: {
          title: {
            display: true,
            text: 'เดือน-ปี'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      }
    }
  });
}

// --- Utility Functions ---

function formatDate(dateInput) {
  if (!dateInput) return '';
  let date;
  if (dateInput instanceof Date && !isNaN(dateInput)) {
    date = dateInput;
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) {
    console.error("Invalid date input:", dateInput);
    return dateInput; 
  }

  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function showError(error) {
  alert('เกิดข้อผิดพลาด: ' + (error.message || error));
  console.error(error);
  updateLoadingProgress(0, "เกิดข้อผิดพลาด!"); 
}