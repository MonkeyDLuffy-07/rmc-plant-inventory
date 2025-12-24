// Login Form Handler using authAPI from api.js

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("errorMessage");

  try {
    // Use the real authAPI from api.js
    const response = await authAPI.login(username, password);

    // Store token and user info (if backend returns them)
    if (response.access_token) {
      localStorage.setItem("token", response.access_token);
    }
    if (response.user) {
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    // Redirect to dashboard
    window.location.href = "dashboard.html";
  } catch (error) {
    errorMessage.textContent =
      error.message || "Login failed. Please try again.";
    errorMessage.style.display = "block";
  }
});
