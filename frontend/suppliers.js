// Suppliers Page

import { checkAuth } from "./app.js";
import { suppliersAPI } from "./api.js";

let suppliers = [];

async function loadSuppliers() {
  checkAuth();

  try {
    suppliers = await suppliersAPI.getAll();
    renderSuppliers();
  } catch (error) {
    console.error("Error loading suppliers:", error);
    const errorEl = document.getElementById("suppliersError");
    if (errorEl) {
      errorEl.textContent = error.message || "Failed to load suppliers.";
    }
  }
}

function renderSuppliers() {
  const grid = document.getElementById("suppliersGrid");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!grid) return;

  if (!suppliers.length) {
    grid.innerHTML = `<p>No suppliers found</p>`;
    return;
  }

  grid.innerHTML = suppliers
    .map((supplier) => {
      return `
        <div class="card">
          <h3>${supplier.name}</h3>
          <p><strong>Contact:</strong> ${supplier.contact_person || "-"}</p>
          <p><strong>Email:</strong> ${supplier.email || "-"}</p>
          <p><strong>Phone:</strong> ${supplier.phone || "-"}</p>
          <p><strong>Address:</strong> ${supplier.address || "-"}</p>
          <p><strong>Materials:</strong> ${
            supplier.materials && supplier.materials.length
              ? supplier.materials.join(", ")
              : "-"
          }</p>
          <p><strong>Rating:</strong> ${supplier.rating ?? "-"}</p>
          ${
            user && user.role === "admin"
              ? `
                <p><strong>Status:</strong> ${
                  supplier.is_active ? "Active" : "Inactive"
                }</p>
              `
              : ""
          }
        </div>
      `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", loadSuppliers);
