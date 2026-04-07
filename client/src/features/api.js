import axios from "axios";
import { toast } from "react-toastify";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

const SILENT_ROUTES = ["/auth/me", "/notifications", "/auth/refresh"];
const AUTH_ROUTES   = ["/auth/login", "/auth/signup"];

// ─── helpers ──────────────────────────────────────────────
const getAccessToken  = () => localStorage.getItem("token");
const getRefreshToken = () => localStorage.getItem("refreshToken");
const saveTokens = (token, refreshToken) => {
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
};
const clearTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

// ─── request interceptor ──────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── silent refresh logic ─────────────────────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

// ─── response interceptor ─────────────────────────────────
api.interceptors.response.use(
  (response) => {
    // save tokens on login/signup
    if (response.data?.token) {
      saveTokens(response.data.token, response.data.refreshToken);
    }

    const isSilent = SILENT_ROUTES.some((r) => response.config.url?.includes(r));
    if (!isSilent && response.data?.message) {
      toast.success(response.data.message, { autoClose: 2000 });
    }
    return response;
  },

  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url ?? "";

    if (SILENT_ROUTES.some((r) => url.includes(r))) return Promise.reject(error);

    if (error.code === "ECONNABORTED") {
      toast.error("Request timed out. Please try again.", { toastId: "timeout" });
      return Promise.reject(error);
    }
    if (!error.response) {
      toast.error("Network error. Check your connection.", { toastId: "network" });
      return Promise.reject(error);
    }

    const status      = error.response.status;
    const message     = error.response?.data?.message || "Something went wrong.";
    const isAuthRoute = AUTH_ROUTES.some((r) => url.includes(r));

    // ── 401 handling with silent refresh ──
    if (status === 401 && !isAuthRoute && !originalRequest._retry) {
      if (isRefreshing) {
        // queue this request — will retry once refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/refresh`,
          { refreshToken }
        );

        saveTokens(data.token, data.refreshToken);
        processQueue(null, data.token);

        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest); // retry original request

      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearTokens();
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

    // ── other error toasts (unchanged logic) ──
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