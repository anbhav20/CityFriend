import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
});

const SILENT_ROUTES = ["/auth/me", "/notifications", "/auth/refresh"];
const AUTH_ROUTES = ["/auth/login", "/auth/signup", "/auth/oauth"];

const clearLegacyTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((pending) => {
    if (error) pending.reject(error);
    else pending.resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    clearLegacyTokens();

    const isSilent = SILENT_ROUTES.some((route) => response.config.url?.includes(route));
    if (!isSilent && response.data?.message) {
      toast.success(response.data.message, { autoClose: 2000 });
    }

    return response;
  },

  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url ?? "";

    if (url.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (error.code === "ECONNABORTED") {
      toast.error("Request timed out. Please try again.", { toastId: "timeout" });
      return Promise.reject(error);
    }

    if (!error.response) {
      toast.error("Network error. Check your connection.", { toastId: "network" });
      return Promise.reject(error);
    }

    const status = error.response.status;
    const message = error.response?.data?.message || "Something went wrong.";
    const isAuthRoute = AUTH_ROUTES.some((route) => url.includes(route));

    if (status === 401 && !isAuthRoute && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        processQueue(null);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr);
        clearLegacyTokens();

        const authPages = ["/login", "/signup", "/"];
        if (!authPages.includes(window.location.pathname)) {
          toast.error("Session expired. Please log in again.", { toastId: "session" });
          window.location.href = "/login";
        }

        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 401) {
      if (isAuthRoute) toast.error(message);
    } else if (status === 403) {
      toast.error("You don't have permission to do that.");
    } else if (status === 404) {
      toast.error(isAuthRoute ? message : "Resource not found.");
    } else if (status >= 500) {
      toast.error("Server error. Please try again later.", { toastId: "server" });
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);
