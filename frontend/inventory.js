// Inventory Page

import { checkAuth, formatCurrency } from "./app.js";
import { materialsAPI } from "./api.js";

let materials = [];
let filteredMaterials = [];

async function loadMaterials() {
  checkAuth();

  try {
    materials = await materialsAPI.getAll();
    filteredMaterials = materials;
    renderMaterials();
  } catch (error) {
    console.error("Error loading materials:", error);
    const errorEl = document.getElementById("materialsError");
    if (errorEl)
      errorEl.textContent = error.message || "Failed to load materials.";
  }
}

function renderMaterials() {
  const grid = document.getElementById("materialsGrid");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!grid) return;

  if (!filteredMaterials.length) {
    grid.innerHTML = "<p>No materials found</p>";
    return;
  }

  grid.innerHTML = filteredMaterials
    .map((material) => {
      const percentage = material.minstock
        ? (material.quantity / material.minstock) * 100
        : 100;
      const status =
        percentage <= 50 ? "low" : percentage <= 100 ? "medium" : "high";
      const stockStatus =
        material.quantity < material.minstock ? "Low Stock" : "In Stock";

      return `
        <div class="material-card ${status}">
          <h3>${material.name}</h3>
          <p class="category">${material.category}</p>
          <p><strong>Quantity:</strong> ${material.quantity} ${
        material.unit
      }</p>
          <p><strong>Range:</strong> ${material.minstock} - ${
        material.maxstock
      } ${material.unit}</p>
          <p><strong>Price:</strong> ${formatCurrency(material.unitprice)}/${
        material.unit
      }</p>
          <p><strong>Supplier:</strong> ${material.supplier || "-"}</p>
          <p><strong>Location:</strong> ${material.location || "-"}</p>
          <p><strong>Status:</strong> ${stockStatus}</p>
          ${
            user && user.role === "admin"
              ? `
          <div class="actions">
            <button class="btn btn-sm" onclick="editMaterial('${material.id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteMaterial('${material.id}')">Delete</button>
          </div>`
              : ""
          }
        </div>
      `;
    })
    .join("");
}

// Example handlers (wire your modal/form here)
window.editMaterial = function (id) {
  const material = materials.find((m) => m.id === id);
  if (!material) return;
  // open edit form and populate with `material`
};

window.deleteMaterial = async function (id) {
  if (!confirm("Delete this material?")) return;
  try {
    await materialsAPI.delete(id);
    materials = materials.filter((m) => m.id !== id);
    filteredMaterials = materials;
    renderMaterials();
  } catch (error) {
    console.error("Failed to delete material:", error);
    alert(error.message || "Failed to delete material.");
  }
};

document.addEventListener("DOMContentLoaded", loadMaterials);
