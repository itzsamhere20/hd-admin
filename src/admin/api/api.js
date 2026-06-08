import axios from "axios";

const api = axios.create({
  baseURL: "https://hd-backend-odir.onrender.com/api",
});

// attach token globally (IMPORTANT)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
