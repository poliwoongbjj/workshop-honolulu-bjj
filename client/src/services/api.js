import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    // Handle membership required errors
    if (
      error.response?.status === 403 &&
      error.response?.data?.requiresMembership
    ) {
      window.location.href = "/pricing";
    }

    return Promise.reject(error);
  }
);

// Helper methods
const apiService = {
  setToken: (token) => {
    localStorage.setItem("token", token);
  },

  removeToken: () => {
    localStorage.removeItem("token");
  },

  // Auth endpoints
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getCurrentUser: () => api.get("/auth/me"),

  // Technique endpoints
  getTechniques: (params) => api.get("/techniques", { params }),
  getTechniqueById: (id) => api.get(`/techniques/${id}`),
  getFavorites: (params) => api.get("/techniques/favorites", { params }),
  toggleFavorite: (id) => api.post(`/techniques/${id}/favorite`),
  updateProgress: (id, progressData) =>
    api.post(`/techniques/${id}/progress`, progressData),
  getRelatedTechniques: (id, params) =>
    api.get(`/techniques/${id}/related`, { params }),
  getFilterOptions: () => api.get("/techniques/filter-options"),

  // User endpoints
  updateProfile: (userData) => api.put("/users/profile", userData),
  changePassword: (passwordData) => api.put("/users/password", passwordData),
  getUserProgress: (params) => api.get("/users/progress", { params }),

  // Admin endpoints
  getDashboardStats: () => api.get("/admin/dashboard"),
  getUsers: (params) => api.get("/admin/users", { params }),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  updateMembership: (userId, membershipData) =>
    api.put(`/admin/users/${userId}/membership`, membershipData),
  getCategories: () => api.get("/admin/categories"),
  createCategory: (categoryData) => api.post("/admin/categories", categoryData),
  updateCategory: (id, categoryData) =>
    api.put(`/admin/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getAdminTechniques: (params) => api.get("/admin/techniques", { params }),
  createTechnique: (techniqueData) =>
    api.post("/admin/techniques", techniqueData),
  updateTechnique: (id, techniqueData) =>
    api.put(`/admin/techniques/${id}`, techniqueData),
  deleteTechnique: (id) => api.delete(`/admin/techniques/${id}`),
  uploadVideo: (formData) =>
    api.post("/admin/upload/video", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  uploadThumbnail: (formData) =>
    api.post("/admin/upload/thumbnail", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Generic methods
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
};

export default apiService;
