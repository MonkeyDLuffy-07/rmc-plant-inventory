// Dashboard Page

import { checkAuth, formatCurrency } from "./app.js";
import { materialsAPI, transactionsAPI, alertsAPI } from "./api.js";

async function loadDashboardData() {
  checkAuth();

  try {
    const [materials, transactions, alerts] = await Promise.all([
      materialsAPI.getAll(),
      transactionsAPI.getAll(),
      alertsAPI.getLowStock(),
    ]);

    const totalMaterials = materials.length;
    const lowStockCount = alerts.length;

    // NOTE: backend uses `unitprice` (no underscore) to match other files
    const totalValue = materials.reduce(
      (sum, m) => sum + m.quantity * m.unitprice,
      0
    );

    const recentTransactionsCount = transactions.filter((t) => {
      const date = new Date(t.timestamp);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }).length;

    // Stats cards
    const statsGrid = document.getElementById("statsGrid");
    if (statsGrid) {
      statsGrid.innerHTML = `
        <div class="stat-card">
          <h3>Active inventory items</h3>
          <p>${totalMaterials}</p>
        </div>
        <div class="stat-card">
          <h3>Requires attention</h3>
          <p>${lowStockCount}</p>
        </div>
        <div class="stat-card">
          <h3>Current stock value</h3>
          <p>${formatCurrency(totalValue)}</p>
        </div>
        <div class="stat-card">
          <h3>Stock movements today</h3>
          <p>${recentTransactionsCount}</p>
        </div>
      `;
    }

    // Low stock list
    const lowStockList = document.getElementById("lowStockList");
    if (lowStockList) {
      if (!alerts.length) {
        lowStockList.innerHTML = `<p>No low stock alerts</p>`;
      } else {
        lowStockList.innerHTML = alerts
          .slice(0, 5)
          .map(
            (alert) => `
              <li>
                <strong>${alert.name}</strong><br />
                ${alert.current_stock} ${alert.unit} (Min: ${alert.min_stock})
              </li>
            `
          )
          .join("");
      }
    }

    // Recent transactions list
    const recentTransactions = document.getElementById("recentTransactions");
    if (recentTransactions) {
      const recent = [...transactions]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 5);

      if (!recent.length) {
        recentTransactions.innerHTML = `<p>No recent transactions</p>`;
      } else {
        recentTransactions.innerHTML = recent
          .map(
            (t) => `
              <li>
                <strong>${t.type === "in" ? "Stock In" : "Stock Out"}</strong>
                - ${t.quantity} ${t.unit} (${t.material_name || "-"})<br />
                <small>${new Date(t.timestamp).toLocaleString()}</small>
              </li>
            `
          )
          .join("");
      }
    }
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
    const errorEl = document.getElementById("dashboardError");
    if (errorEl) {
      errorEl.textContent = error.message || "Failed to load dashboard data.";
    }
  }
}

document.addEventListener("DOMContentLoaded", loadDashboardData);
