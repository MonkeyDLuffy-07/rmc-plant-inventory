// Transactions Page

import { checkAuth, formatDate } from "./app.js";
import { transactionsAPI, materialsAPI } from "./api.js";

let transactions = [];
let materials = [];

async function loadTransactions() {
  checkAuth();

  try {
    [transactions, materials] = await Promise.all([
      transactionsAPI.getAll(),
      materialsAPI.getAll(),
    ]);
    renderTransactions();
    populateMaterialSelect();
  } catch (error) {
    console.error("Error loading transactions:", error);
    const errorEl = document.getElementById("transactionsError");
    if (errorEl)
      errorEl.textContent = error.message || "Failed to load transactions.";
  }
}

function renderTransactions() {
  const tbody = document.getElementById("transactionsBody");
  if (!tbody) return;

  if (!transactions.length) {
    tbody.innerHTML = "<tr><td colspan='6'>No transactions found</td></tr>";
    return;
  }

  tbody.innerHTML = transactions
    .map((t) => {
      const material = materials.find((m) => m.id === t.material_id);
      return `
        <tr>
          <td>${formatDate(t.timestamp)}</td>
          <td>${material ? material.name : t.material_name || "-"}</td>
          <td>${t.type === "in" ? "Stock In" : "Stock Out"}</td>
          <td>${t.quantity}</td>
          <td>${t.reference || "-"}</td>
          <td>${t.recorded_by || "-"}</td>
        </tr>
      `;
    })
    .join("");
}

function populateMaterialSelect() {
  const select = document.getElementById("materialSelect");
  if (!select) return;

  select.innerHTML = materials
    .map((m) => `<option value="${m.id}">${m.name}</option>`)
    .join("");
}

async function handleTransactionSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const materialId = form.materialId.value;
  const type = form.type.value;
  const quantity = Number(form.quantity.value);
  const reference = form.reference.value || "";

  if (!materialId || !type || !quantity) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    const newTx = await transactionsAPI.create({
      material_id: materialId,
      type,
      quantity,
      reference,
    });
    transactions.unshift(newTx);
    renderTransactions();
    form.reset();
  } catch (error) {
    console.error("Failed to create transaction:", error);
    alert(error.message || "Failed to create transaction.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadTransactions();
  const form = document.getElementById("transactionForm");
  if (form) {
    form.addEventListener("submit", handleTransactionSubmit);
  }
});
