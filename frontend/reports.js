// Reports Page

import { checkAuth, formatCurrency, formatDate } from "./app.js";
import { materialsAPI, transactionsAPI, suppliersAPI } from "./api.js";

let materials = [];
let transactions = [];
let suppliers = [];

async function loadReportData() {
  checkAuth();

  try {
    [materials, transactions, suppliers] = await Promise.all([
      materialsAPI.getAll(),
      transactionsAPI.getAll(),
      suppliersAPI.getAll(),
    ]);
    generateReport();
  } catch (error) {
    console.error("Error loading report data:", error);
    const errorEl = document.getElementById("reportsError");
    if (errorEl)
      errorEl.textContent = error.message || "Failed to load reports.";
  }
}

document
  .getElementById("reportTypeSelect")
  ?.addEventListener("change", generateReport);

function generateReport() {
  const select = document.getElementById("reportTypeSelect");
  const content = document.getElementById("reportContent");
  if (!select || !content) return;

  const reportType = select.value;

  switch (reportType) {
    case "overview":
      content.innerHTML = generateOverviewReport();
      break;
    case "materialwise":
      content.innerHTML = generateMaterialwiseReport();
      break;
    case "supplierwise":
      content.innerHTML = generateSupplierwiseReport();
      break;
    case "recent":
      content.innerHTML = generateRecentMovementsReport();
      break;
    default:
      content.innerHTML = generateOverviewReport();
  }
}

function generateOverviewReport() {
  const totalValue = materials.reduce(
    (sum, m) => sum + m.quantity * m.unitprice,
    0
  );
  const lowStock = materials.filter((m) => m.quantity <= m.minstock).length;

  const rows = materials
    .map((m) => {
      const value = m.quantity * m.unitprice;
      const status = m.quantity <= m.minstock ? "Low Stock" : "OK";

      return `|${m.name}|${m.category}|${m.quantity} ${m.unit}|${formatCurrency(
        m.unitprice
      )}|${formatCurrency(value)}|${status}|`;
    })
    .join("\n");

  return `
### Inventory Overview

|Material|Category|Quantity|Unit Price|Total Value|Status|
|--|--|--|--|--|--|
${rows}

**Total Inventory Value:** ${formatCurrency(totalValue)}  
**Total Materials:** ${materials.length}  
**Low Stock Items:** ${lowStock}
`;
}

function generateMaterialwiseReport() {
  const materialStats = materials.map((material) => {
    const trans = transactions.filter((t) => t.material_id === material.id);
    const stockIn = trans
      .filter((t) => t.type === "in")
      .reduce((sum, t) => sum + t.quantity, 0);
    const stockOut = trans
      .filter((t) => t.type === "out")
      .reduce((sum, t) => sum + t.quantity, 0);
    return { ...material, stockIn, stockOut, transactions: trans.length };
  });

  const rows = materialStats
    .map(
      (m) =>
        `|${m.name}|${m.category}|${m.stockIn} ${m.unit}|${m.stockOut} ${m.unit}|${m.quantity} ${m.unit}|${m.transactions}|`
    )
    .join("\n");

  return `
### Material-wise Movements

|Material|Category|Stock In|Stock Out|Current Stock|Total Transactions|
|--|--|--|--|--|--|
${rows}
`;
}

function generateSupplierwiseReport() {
  const supplierStats = suppliers.map((s) => {
    const supplierMaterials = materials.filter(
      (m) => m.supplier === s.name
    ).length;
    const supplierTransactions = transactions.filter(
      (t) => t.supplier === s.name
    ).length;
    return {
      ...s,
      materialsCount: supplierMaterials,
      transactions: supplierTransactions,
    };
  });

  const rows = supplierStats
    .map(
      (s) =>
        `|${s.name}|${s.contact_person} ${s.phone}|★ ${s.rating?.toFixed(1)}|${(
          s.materials || []
        ).join(", ")}|${s.transactions}|${s.is_active ? "Active" : "Inactive"}|`
    )
    .join("\n");

  return `
### Supplier Performance

|Supplier|Contact|Rating|Materials|Total Transactions|Status|
|--|--|--|--|--|--|
${rows}
`;
}

function generateRecentMovementsReport() {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
  const recent = sorted.slice(0, 20);

  if (!recent.length) return "No recent movements.";

  const rows = recent
    .map(
      (t) =>
        `|${formatDate(t.timestamp)}|${t.reference || "-"}|${
          t.material_name || "-"
        }|${t.type === "in" ? "Stock In" : "Stock Out"}|${t.quantity} ${
          t.unit
        }|${t.supplier || "-"}|${t.recorded_by || "-"}|`
    )
    .join("\n");

  return `
### Recent Stock Movements

|Date|Reference|Material|Type|Quantity|Supplier|Recorded By|
|--|--|--|--|--|--|--|
${rows}
`;
}

document.addEventListener("DOMContentLoaded", loadReportData);
