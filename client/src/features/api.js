import axios from "axios";
import { toast } from "react-toastify";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000, //  increased from 10s to 15s
});

// Silent routes — no toast, no redirect ever
const SILENT_ROUTES = ["/auth/me", "/notifications"]; //  added /notifications

// Auth routes — show error toast but never redirect
const AUTH_ROUTES = ["/auth/login", "/auth/signup"];

//  Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Save token to localStorage on login/signup
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }

    const isSilent = SILENT_ROUTES.some((route) =>
      response.config.url?.includes(route)
    );
    if (!isSilent && response.data?.message) {
      toast.success(response.data.message, { autoClose: 2000 });
    }
    return response;
  },
  (error) => {
    const url = error.config?.url ?? "";

    // Completely silent routes — no toast, no redirect
    if (SILENT_ROUTES.some((route) => url.includes(route))) {
      return Promise.reject(error);
    }

    //  Timeout — single clean message, no spam
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
    const isAuthRoute = AUTH_ROUTES.some((route) => url.includes(route));

    if (status === 401) {
      if (isAuthRoute) {
        toast.error(message);
      } else {
        const authPages = ["/login", "/signup", "/"];
        if (!authPages.includes(window.location.pathname)) {
          localStorage.removeItem("token");
          toast.error("Session expired. Please log in again.", { toastId: "session" });
          window.location.href = "/login";
        }
      }
    } else if (status === 403) {
      toast.error("You don't have permission to do that.");
    } else if (status === 404) {
      if (!isAuthRoute) {
        toast.error("Resource not found.");
      } else {
        toast.error(message);
      }
    } else if (status >= 500) {
      toast.error("Server error. Please try again later.", { toastId: "server" });
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);