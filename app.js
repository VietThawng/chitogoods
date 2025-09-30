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
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#666">Không có deadline nào.</td></tr>';
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
    a.href = url; a.download = "deadlines.json"; a.click();
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
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#666">Không có hàng hóa.</td></tr>';
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
        notes: document.getElementById("notes").value.trim(),
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

//------------------------------------------------------ Init ----------------------------------------------------------
loadDeadlineData();
loadInventoryData();
