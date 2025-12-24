// Alerts Page

import { checkAuth } from "./app.js";
import { alertsAPI } from "./api.js";

async function loadAlerts() {
  checkAuth();

  try {
    const alerts = await alertsAPI.getLowStock();
    renderAlerts(alerts);
  } catch (error) {
    console.error("Error loading alerts:", error);
    const errorEl = document.getElementById("alertsError");
    if (errorEl)
      errorEl.textContent = error.message || "Failed to load alerts.";
  }
}

function renderAlerts(alerts) {
  const container = document.getElementById("alertsContainer");
  if (!container) return;

  if (!alerts.length) {
    container.innerHTML =
      "<p>No stock alerts at this time. All materials are adequately stocked.</p>";
    return;
  }

  container.innerHTML = alerts
    .map((alert) => {
      const levelClass = alert.level === "Critical" ? "critical" : "warning";
      const percentage =
        alert.min_stock > 0
          ? (alert.current_stock / alert.min_stock) * 100
          : 100;

      return `
        <div class="alert-card ${levelClass}">
          <h3>${alert.material_name}</h3>
          <p><strong>Category:</strong> ${alert.category}</p>
          <p><strong>Current Stock:</strong> ${alert.current_stock} ${
        alert.unit
      }</p>
          <p><strong>Minimum Required:</strong> ${alert.min_stock} ${
        alert.unit
      }</p>
          <p><strong>Stock Level:</strong> ${percentage.toFixed(
            1
          )}% of minimum requirement</p>
          <p><strong>Recommended Action:</strong> ${
            alert.level === "Critical"
              ? "Immediate reorder required to prevent stockout"
              : "Schedule reorder soon to maintain adequate stock levels"
          }</p>
          ${
            alert.level === "Critical"
              ? `<p><strong>Supplier:</strong> ${
                  alert.supplier || "-"
                }</p><p class="urgent">URGENT: This material is critically low and requires immediate attention!</p>`
              : ""
          }
        </div>
      `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", loadAlerts);
