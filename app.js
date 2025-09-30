// ------------------------------------------------------------Deadline functionality---------------------------------------------------------
const STORAGE_KEY = "deadlines_data";
 let deadlines = [];

function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) deadlines = JSON.parse(raw);
    renderTable();
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deadlines));
}

function renderTable() {
    const tbody = document.querySelector("#deadlineTable tbody");
    tbody.innerHTML = "";
    deadlines.forEach((d, idx) => {
        const tr = document.createElement("tr");
        if (d.status === "done") tr.classList.add("done");
        tr.innerHTML = `
<td>${idx + 1}</td>
<td>${d.title}<br/><small>${d.notes || ""}</small></td>
<td>${d.client || ""}</td>
<td>${d.qty || ""}</td>
<td>${d.dueDate || ""}</td>
<td>${d.status === "done" ? "Hoàn thành" : "Chưa xong"}</td>
<td class="actions">
<button onclick="editDeadline('${d.id}')">Sửa</button>
<button onclick="deleteDeadline('${d.id}')">Xóa</button>
<button onclick="toggleStatus('${d.id}')">Chuyển trạng thái</button>
</td>
`;
        tbody.appendChild(tr);
    });
    if (deadlines.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#666">Không có deadline nào.</td></tr>';
    }
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }

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
    saveData();
    renderTable();
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
    saveData();
    renderTable();
}

function toggleStatus(id) {
    deadlines = deadlines.map(d => d.id === id ? { ...d, status: d.status === "done" ? "pending" : "done" } : d);
    saveData();
    renderTable();
}

function clearAll() {
    if (!confirm("Xóa toàn bộ dữ liệu?")) return;
    deadlines = [];
    saveData();
    renderTable();
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
                saveData();
                renderTable();
                alert("Import thành công");
            } else alert("File không hợp lệ");
        } catch (err) { alert("Lỗi: " + err.message); }
    };
    reader.readAsText(file);
}

//------------------------------------------------------inventory functionality----------------------------------------------------------
const STORAGE_KEY_INVENTORY = "inventory_data";
 let inventory = [];

function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY_INVENTORY);
    if (raw) inventory = JSON.parse(raw);
    renderTable();
}

function saveData() {
    localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(inventory));
}

function renderTable() {
    const tbody = document.querySelector("#inventoryTable tbody");
    tbody.innerHTML = "";
    inventory.forEach((d, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
<td>${d.itemName}</td>
<td>${d.sold}</td>
<td>${d.remain}</td>
<td>${d.cost}</td>
<td>${d.sell}</td>
<td>${d.profit}</td>
<td>${d.notes || ""}</td>
<td class="actions">
<button onclick="editInventory('${d.inventoryId}')">Sửa</button>
<button onclick="deleteInventory('${d.inventoryId}')">Xóa</button>
</td>
`;
        tbody.appendChild(tr);
    }
    );
    if (inventory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#666">Không có hàng hóa nào.</td></tr>';
    }
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }

function openInventoryForm() {
    document.getElementById("inventoryForm").reset();
    document.getElementById("InventoryId").value = "";
    document.getElementById("formTitle").innerText = "Thêm Hàng Hóa";
    document.getElementById("inventoryformPopup").style.display = "flex";
}

function closeInventoryForm() {
    document.getElementById("inventoryformPopup").style.display = "none";
}

function saveInventory(e) {
    e.preventDefault();
    const id = document.getElementById("InventoryId").value;
    const data = {
        inventoryId: id || uid(),
        itemName: document.getElementById("itemName").value.trim(),
        sold: document.getElementById("sold").value.trim(),
        remain: document.getElementById("remain").value.trim(),
        cost: document.getElementById("cost").value.trim(),
        sell: document.getElementById("sell").value.trim(),
        profit: document.getElementById("profit").value.trim(),
        notes: document.getElementById("notes").value.trim(),
    };
    if (!data.itemName || !data.remain) { alert("Thiếu tên hàng hoặc số lượng còn lại!"); return; }
    if (id) {
        deadlines = deadlines.map(d => d.inventoryId === id ? data : d);
    } else {
        deadlines.unshift(data);
    }
    saveData();
    renderTable();
    closeForm();
}

function editInventory(id) {
    const d = deadlines.find(x => x.id === id);
    if (!d) return;
    document.getElementById("formTitle").innerText = "Chỉnh sửa Hàng Hóa";
    document.getElementById("InventoryId").value = d.id;
    document.getElementById("itemName").value = d.itemName;
    document.getElementById("sold").value = d.sold;
    document.getElementById("remain").value = d.remain;
    document.getElementById("cost").value = d.cost;
    document.getElementById("sell").value = d.sell;
    document.getElementById("profit").value = d.profit;
    document.getElementById("notes").value = d.notes;
    document.getElementById("inventoryformPopup").style.display = "flex";
    
}

function deleteInventory(id) {
    if (!confirm("Xóa mục này?")) return;
    inventory = inventory.filter(d => d.inventoryId !== id);
    saveData();
    renderTable();
}


function clearAll() {
    if (!confirm("Xóa toàn bộ dữ liệu?")) return;
    inventory = [];
    saveData();
    renderTable();
}

function exportData() {
    const blob = new Blob([JSON.stringify(inventory, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "inventory.json"; a.click();
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
                saveData();
                renderTable();
                alert("Import thành công");
            } else alert("File không hợp lệ");
        } catch (err) { alert("Lỗi: " + err.message); }
    };
    reader.readAsText(file);
}

loadData();