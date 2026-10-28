
import axios from "axios";

const api = axios.create({
  baseURL: (
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8080"
  ).replace(/\/$/, ""),

  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },

  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("mindtraceUser");

      window.dispatchEvent(
        new Event("mindtrace:unauthorized")
      );
    }

    return Promise.reject(error);
  }
);

export default api;
