const API_BASE_URL = "http://localhost:8000";

// API Helper Functions
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorDetail = "API request failed";
      try {
        const error = await response.json();
        errorDetail = error.detail || errorDetail;
      } catch {
        // ignore JSON parse error
      }
      throw new Error(errorDetail);
    }

    // Some endpoints may return no body (204)
    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Auth API
export const authAPI = {
  login: (username, password) =>
    apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  getCurrentUser: () => apiCall("/auth/me"),
};

// Materials API
export const materialsAPI = {
  getAll: () => apiCall("/materials"),
  getById: (id) => apiCall(`/materials/${id}`),
  create: (data) =>
    apiCall("/materials", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/materials/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/materials/${id}`, {
      method: "DELETE",
    }),
};

// Transactions API
export const transactionsAPI = {
  getAll: () => apiCall("/transactions"),
  create: (data) =>
    apiCall("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Suppliers API
export const suppliersAPI = {
  getAll: () => apiCall("/suppliers"),
  create: (data) =>
    apiCall("/suppliers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/suppliers/${id}`, {
      method: "DELETE",
    }),
};

// Alerts API
export const alertsAPI = {
  getLowStock: () => apiCall("/alerts/low-stock"),
};
