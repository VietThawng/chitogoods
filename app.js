// ================= Import Firebase Firestore =================
import {
    db
} from "./firebase.js"; // file firebase.js chứa đoạn initializeApp + export db
import {
    collection,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

//------------------------------------------------------ Deadline functionality ----------------------------------------------------------
let deadlines = [];
const deadlinesCol = collection(db, "deadlines");

// Load realtime
function loadDeadlineData() {
    onSnapshot(deadlinesCol, (snapshot) => {
        deadlines = [];
        snapshot.forEach(docSnap => deadlines.push(docSnap.data()));
        renderDeadlineTable();
    });
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
        tbody.innerHTML =
            '<tr><td colspan="8" style="text-align:center;color:#666">Không có deadline nào.</td></tr>';
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

async function saveDeadline(e) {
    e.preventDefault();
    const id = document.getElementById("deadlineId").value || uid();
    const data = {
        id,
        title: document.getElementById("title").value.trim(),
        client: document.getElementById("client").value.trim(),
        qty: document.getElementById("qty").value.trim(),
        dueDate: document.getElementById("dueDate").value,
        notes: document.getElementById("notes").value.trim(),
        status: document.getElementById("status").value
    };
    if (!data.title || !data.dueDate) {
        alert("Thiếu tiêu đề hoặc ngày hạn!");
        return;
    }
    await setDoc(doc(db, "deadlines", id), data);
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

async function deleteDeadline(id) {
    if (!confirm("Xóa mục này?")) return;
    await deleteDoc(doc(db, "deadlines", id));
}

async function toggleDeadlineStatus(id) {
    const d = deadlines.find(x => x.id === id);
    if (!d) return;
    const newStatus = d.status === "done" ? "pending" : "done";
    await updateDoc(doc(db, "deadlines", id), { status: newStatus });
}

async function clearAllDeadlines() {
    if (!confirm("Xóa toàn bộ dữ liệu?")) return;
    const snapshot = await getDocs(deadlinesCol);
    snapshot.forEach(async docSnap => {
        await deleteDoc(doc(db, "deadlines", docSnap.id));
    });
}

//------------------------------------------------------ Inventory functionality ----------------------------------------------------------
let inventory = [];
const inventoryCol = collection(db, "inventory");

function loadInventoryData() {
    onSnapshot(inventoryCol, (snapshot) => {
        inventory = [];
        snapshot.forEach(docSnap => inventory.push(docSnap.data()));
        renderInventoryTable();
    });
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
        tbody.innerHTML =
            '<tr><td colspan="8" style="text-align:center;color:#666">Không có hàng hóa.</td></tr>';
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

async function saveInventory(e) {
    e.preventDefault();
    const id = document.getElementById("inventoryId").value || uid();
    const data = {
        inventoryId: id,
        itemName: document.getElementById("itemName").value.trim(),
        totalQty: Number(document.getElementById("totalQty").value),
        sold: Number(document.getElementById("sold").value),
        remain: Number(document.getElementById("totalQty").value) - Number(document.getElementById("sold").value),
        cost: Number(document.getElementById("cost").value),
        sell: Number(document.getElementById("sell").value),
        profit: (Number(document.getElementById("sell").value) - Number(document.getElementById("cost").value)) * Number(document.getElementById("sold").value),
        notes: document.getElementById("notes").value.trim(),
    };
    if (!data.itemName) {
        alert("Thiếu tên hàng hóa!");
        return;
    }
    await setDoc(doc(db, "inventory", id), data);
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

async function deleteInventory(id) {
    if (!confirm("Xóa hàng hóa này?")) return;
    await deleteDoc(doc(db, "inventory", id));
}

async function clearAllInventory() {
    if (!confirm("Xóa toàn bộ hàng hóa?")) return;
    const snapshot = await getDocs(inventoryCol);
    snapshot.forEach(async docSnap => {
        await deleteDoc(doc(db, "inventory", docSnap.id));
    });
}

function formatVND(n) {
    return n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

//----------------- Dark Mode -----------------
const darkModeToggle = document.getElementById("darkModeToggle");

// Load trạng thái dark mode từ localStorage
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    darkModeToggle.textContent = "☀️";
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
});

//------------------------------------------------------ Init ----------------------------------------------------------
loadDeadlineData();
loadInventoryData();

// Gắn hàm vào window để nút onclick trong HTML gọi được
window.openForm = openForm;
window.closeForm = closeForm;
window.saveDeadline = saveDeadline;
window.editDeadline = editDeadline;
window.deleteDeadline = deleteDeadline;
window.toggleDeadlineStatus = toggleDeadlineStatus;
window.clearAllDeadlines = clearAllDeadlines;

window.openInventoryForm = openInventoryForm;
window.closeInventoryForm = closeInventoryForm;
window.saveInventory = saveInventory;
window.editInventory = editInventory;
window.deleteInventory = deleteInventory;
window.clearAllInventory = clearAllInventory;
