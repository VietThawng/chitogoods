//------------------------------------------------------ Home Image Gallery ----------------------------------------------------------
const STORAGE_KEY_HOME = "home_items";
let homeItems = [];

function loadHomeData() {
    const raw = localStorage.getItem(STORAGE_KEY_HOME);
    if (raw) homeItems = JSON.parse(raw);
    renderHomeList();
}

function saveHomeData() {
    localStorage.setItem(STORAGE_KEY_HOME, JSON.stringify(homeItems));
}

function renderHomeList() {
    const list = document.getElementById("homeList");
    list.innerHTML = "";
    if (homeItems.length === 0) {
        list.innerHTML = "<p style='text-align:center;color:#666'>Chưa có sản phẩm nào</p>";
        return;
    }
    homeItems.forEach(item => {
        const div = document.createElement("div");
        div.className = "home-card";
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="home-card-info">
                <strong>${item.name}</strong>
                <div class="home-card-actions">
                    <button onclick="editHomeItem('${item.id}')">Sửa</button>
                    <button onclick="deleteHomeItem('${item.id}')">Xóa</button>
                    <button onclick="sellHomeItem('${item.id}')">Bán</button>
                </div>
            </div>
        `;
        list.appendChild(div);
    });
}


function openHomeForm() {
    document.getElementById("homeForm").reset();
    document.getElementById("homeItemId").value = "";
    document.getElementById("homeFormTitle").innerText = "Thêm sản phẩm";
    document.getElementById("homeFormPopup").style.display = "flex";
}

function closeHomeForm() {
    document.getElementById("homeFormPopup").style.display = "none";
}

function saveHomeItem(e) {
    e.preventDefault();
    const id = document.getElementById("homeItemId").value;
    const name = document.getElementById("homeItemName").value.trim();
    const fileInput = document.getElementById("homeItemImage");
    if (!name) { alert("Vui lòng nhập tên sản phẩm"); return; }

    const handleSave = (imageData) => {
        const data = { id: id || uid(), name, image: imageData || (id ? homeItems.find(i => i.id === id).image : "") };
        if (id) {
            homeItems = homeItems.map(i => i.id === id ? data : i);
        } else {
            homeItems.unshift(data);
        }
        saveHomeData();
        renderHomeList();
        closeHomeForm();
    };

    if (fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = evt => handleSave(evt.target.result);
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        handleSave();
    }
}

function sellHomeItem(name) {
    if (!name) { alert("Sản phẩm không tồn tại"); 
        return; 
    }

    // Tìm sản phẩm tương ứng trong inventory
    const itemIndex = inventory.findIndex(i => i.itemName.toLowerCase() === name.toLowerCase());

    if (itemIndex === -1) {
        alert(`Không tìm thấy "${name}" trong danh sách hàng hóa. Vui lòng thêm sản phẩm này trong mục Hàng hóa trước.`);
        return;
    }

    const qty = Number(prompt(`Nhập số lượng bán cho "${name}"`, 1));
    if (isNaN(qty) || qty <= 0) return;
    if (item.remain < qty) {
        alert(`Không đủ hàng. Hiện chỉ còn ${item.remain} cái.`);
        return;
    }
    item.sold += qty;
    item.remain -= qty;
    item.profit = (item.sell - item.cost) * item.sold;

    inventory[itemIndex] = item;
    saveInventoryData();
    renderInventoryTable();

    alert(`✅ Đã bán 1 "${name}" — Còn lại ${item.remain}`);
}

function editHomeItem(id) {
    const item = homeItems.find(i => i.id === id);
    if (!item) return;
    document.getElementById("homeFormTitle").innerText = "Chỉnh sửa sản phẩm";
    document.getElementById("homeItemId").value = item.id;
    document.getElementById("homeItemName").value = item.name;
    document.getElementById("homeFormPopup").style.display = "flex";
}

function deleteHomeItem(id) {
    if (!confirm("Xóa sản phẩm này?")) return;
    homeItems = homeItems.filter(i => i.id !== id);
    saveHomeData();
    renderHomeList();
}


//------------------------------------------------------ Deadline functionality ----------------------------------------------------------
const STORAGE_KEY = "deadlines_data";
let deadlines = [];

function loadDeadlineData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) deadlines = JSON.parse(raw);
    renderDeadlineTable();
}

function saveDeadlineData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deadlines));
}

function renderDeadlineTable() {
    const tbody = document.querySelector("#deadlineTable tbody");
    tbody.innerHTML = "";
    deadlines.forEach((d, idx) => {
        const tr = document.createElement("tr");
        if (d.status === "done") tr.classList.add("done");
        tr.innerHTML = `
      <td data-label="STT">${idx + 1}</td>
      <td data-label="Tiêu đề">${d.title}<br/><small>${d.notes || ""}</small></td>
      <td data-label="Giá in">${d.client || ""}</td>
      <td data-label="Số lượng">${d.qty || ""}</td>
      <td data-label="Ngày hạn">${d.dueDate || ""}</td>
      <td data-label="Trạng thái">${d.status === "done" ? "Hoàn thành" : "Chưa xong"}</td>
      <td data-label="Ghi chú">${d.notes || ""}</td>
      <td data-label="Hành động">
        <button onclick="editDeadline('${d.id}')">Sửa</button>
        <button onclick="deleteDeadline('${d.id}')">Xóa</button>
        <button onclick="toggleDeadlineStatus('${d.id}')">Chuyển trạng thái</button>
      </td>
    `;
        tbody.appendChild(tr);
    });
    if (deadlines.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#666">Không có deadline</td></tr>';
    }
}

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function openForm() {
    document.getElementById("deadlineForm").reset();
    document.getElementById("deadlineId").value = "";
    document.getElementById("formTitle").innerText = "Thêm deadline";
    document.getElementById("formPopup").style.display = "flex";
}

function closeForm() {
    document.getElementById("formPopup").style.display = "none";
}

function saveDeadline(e) {
    e.preventDefault();
    const id = document.getElementById("deadlineId").value;
    const data = {
        id: id || uid(),
        title: document.getElementById("title").value.trim(),
        client: document.getElementById("client").value.trim(),
        qty: document.getElementById("qty").value.trim(),
        dueDate: document.getElementById("dueDate").value,
        notes: document.getElementById("notes").value.trim(),
        status: document.getElementById("status").value
    };
    if (!data.title || !data.dueDate) { alert("Thiếu tiêu đề hoặc ngày hạn!"); return; }
    if (id) {
        deadlines = deadlines.map(d => d.id === id ? data : d);
    } else {
        deadlines.unshift(data);
    }
    saveDeadlineData();
    renderDeadlineTable();
    closeForm();
}

function editDeadline(id) {
    const d = deadlines.find(x => x.id === id);
    if (!d) return;
    document.getElementById("formTitle").innerText = "Chỉnh sửa deadline";
    document.getElementById("deadlineId").value = d.id;
    document.getElementById("title").value = d.title;
    document.getElementById("client").value = d.client;
    document.getElementById("qty").value = d.qty;
    document.getElementById("dueDate").value = d.dueDate;
    document.getElementById("notes").value = d.notes;
    document.getElementById("status").value = d.status;
    document.getElementById("formPopup").style.display = "flex";
}

function deleteDeadline(id) {
    if (!confirm("Xóa mục này?")) return;
    deadlines = deadlines.filter(d => d.id !== id);
    saveDeadlineData();
    renderDeadlineTable();
}

function toggleDeadlineStatus(id) {
    deadlines = deadlines.map(d => d.id === id ? { ...d, status: d.status === "done" ? "pending" : "done" } : d);
    saveDeadlineData();
    renderDeadlineTable();
}

function clearAllDeadlines() {
    if (!confirm("Xóa toàn bộ dữ liệu?")) return;
    deadlines = [];
    saveDeadlineData();
    renderDeadlineTable();
}

function exportData() {
    const blob = new Blob([JSON.stringify(deadlines, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "Deadlines + Số.json"; a.click();
    URL.revokeObjectURL(url);
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
        try {
            const arr = JSON.parse(evt.target.result);
            if (Array.isArray(arr)) {
                deadlines = arr;
                saveDeadlineData();
                renderDeadlineTable();
                alert("Import thành công");
            } else alert("File không hợp lệ");
        } catch (err) { alert("Lỗi: " + err.message); }
    };
    reader.readAsText(file);
}

//------------------------------------------------------ Inventory functionality ----------------------------------------------------------
const STORAGE_KEY_INVENTORY = "inventory_data";
let inventory = [];

function loadInventoryData() {
    const raw = localStorage.getItem(STORAGE_KEY_INVENTORY);
    if (raw) inventory = JSON.parse(raw);
    renderInventoryTable();
}

function saveInventoryData() {
    localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(inventory));
}

function renderInventoryTable() {
    const tbody = document.querySelector("#inventoryTable tbody");
    tbody.innerHTML = "";
    inventory.forEach((d) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td data-label="Tên hàng hóa">${d.itemName}</td>
      <td data-label="Số lượng">${d.totalQty}</td>
      <td data-label="Số lượng đã bán">${d.sold}</td>
      <td data-label="Số lượng còn lại">${d.remain}</td>
      <td data-label="Giá gốc (VNĐ)">${formatVND(d.cost)}</td>
      <td data-label="Giá bán (VNĐ)">${formatVND(d.sell)}</td>
      <td data-label="Lợi nhuận (VNĐ)">${formatVND(d.profit)}</td>
      <td data-label="Hành động">
        <button onclick="editInventory('${d.inventoryId}')">Sửa</button>
        <button onclick="deleteInventory('${d.inventoryId}')">Xóa</button>
      </td>
    `;
        tbody.appendChild(tr);
    });
    if (inventory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#666">Không có hàng hóa</td></tr>';
    }
}

function openInventoryForm() {
    document.getElementById("inventoryForm").reset();
    document.getElementById("inventoryId").value = "";
    document.getElementById("inventoryFormTitle").innerText = "Thêm hàng hóa";
    document.getElementById("inventoryFormPopup").style.display = "flex";
}

function closeInventoryForm() {
    document.getElementById("inventoryFormPopup").style.display = "none";
}

function saveInventory(e) {
    e.preventDefault();
    const id = document.getElementById("inventoryId").value;
    const data = {
        inventoryId: id || uid(),
        itemName: document.getElementById("itemName").value.trim(),
        totalQty: Number(document.getElementById("totalQty").value),
        sold: Number(document.getElementById("sold").value),
        remain: Number(document.getElementById("totalQty").value) - Number(document.getElementById("sold").value),
        cost: Number(document.getElementById("cost").value),
        sell: Number(document.getElementById("sell").value),
        profit: (Number(document.getElementById("sell").value) - Number(document.getElementById("cost").value)) * Number(document.getElementById("sold").value),
    };
    if (!data.itemName) { alert("Thiếu tên hàng hóa!"); return; }
    if (id) {
        inventory = inventory.map(d => d.inventoryId === id ? data : d);
    } else {
        inventory.unshift(data);
    }
    saveInventoryData();
    renderInventoryTable();
    closeInventoryForm();
}

function editInventory(id) {
    const d = inventory.find(x => x.inventoryId === id);
    if (!d) return;
    document.getElementById("inventoryFormTitle").innerText = "Chỉnh sửa hàng hóa";
    document.getElementById("inventoryId").value = d.inventoryId;
    document.getElementById("itemName").value = d.itemName;
    document.getElementById("totalQty").value = d.totalQty;
    document.getElementById("sold").value = d.sold;
    document.getElementById("remain").value = d.remain;
    document.getElementById("cost").value = d.cost;
    document.getElementById("sell").value = d.sell;
    document.getElementById("profit").value = d.profit;
    document.getElementById("notes").value = d.notes;
    document.getElementById("inventoryFormPopup").style.display = "flex";
}

function deleteInventory(id) {
    if (!confirm("Xóa hàng hóa này?")) return;
    inventory = inventory.filter(d => d.inventoryId !== id);
    saveInventoryData();
    renderInventoryTable();
}

function clearAllInventory() {
    if (!confirm("Xóa toàn bộ hàng hóa?")) return;
    inventory = [];
    saveInventoryData();
    renderInventoryTable();
}

function exportInventoryData() {
    const blob = new Blob([JSON.stringify(inventory, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "inventory.json"; a.click();
    URL.revokeObjectURL(url);
}

function importInventoryData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
        try {
            const arr = JSON.parse(evt.target.result);
            if (Array.isArray(arr)) {
                inventory = arr;
                saveInventoryData();
                renderInventoryTable();
                alert("Import thành công");
            } else alert("File không hợp lệ");
        } catch (err) { alert("Lỗi: " + err.message); }
    };
    reader.readAsText(file);
}

function formatVND(n) {
    return n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

// -------------------- Tab Menu --------------------
function showTab(tabId) { // Ẩn tất cả tab
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active')); // Bỏ active ở menu
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active')); // Hiện tab được chọn
    document.querySelectorAll('.tab-home').forEach(btn => btn.classList.remove('active')); // Bỏ active ở nút home
    document.getElementById(tabId).classList.add('active'); // Active nút menu tương ứng
    event.target.classList.add('active');
}



//----------------- Dark Mode -----------------
const darkModeToggle = document.getElementById("darkModeToggle");

// Load trạng thái dark mode từ localStorage
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    darkModeToggle.textContent = "☀️";

    // ✅ FIX: render lại bảng để tránh mất dữ liệu hiển thị khi mobile refresh layout
    renderDeadlineTable();
    renderInventoryTable();
}

darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
        darkModeToggle.textContent = "☀️";
    } else {
        localStorage.setItem("darkMode", "disabled");
        darkModeToggle.textContent = "🌙";
    }

    // ✅ FIX: luôn render lại để dữ liệu không bị mất khi đổi mode
    renderDeadlineTable();
    renderInventoryTable();
});

//------------------------------------------------------ Init ----------------------------------------------------------
loadDeadlineData();
loadInventoryData();
loadHomeData();