// Common App Functions

export function checkAuth() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    window.location.href = "index.html";
    return null;
  }

  return JSON.parse(user);
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

export function setupUserDisplay() {
  const user = checkAuth();
  if (user) {
    const userDisplay = document.getElementById("userDisplay");
    if (userDisplay) {
      userDisplay.textContent = `${user.username} (${user.role})`;
    }
  }
}

export function setupMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });
  }
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

export function formatCurrency(amount) {
  return (
    "₹" +
    amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

// Initialize common features on all pages except login
if (
  window.location.pathname !== "/index.html" &&
  !window.location.pathname.endsWith("/")
) {
  setupUserDisplay();
  setupMobileMenu();
}
