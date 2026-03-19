import axios from "axios";
import { toast } from "react-toastify";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 8000,
});

// ✅ these routes never show toasts or trigger redirects
const SILENT_ROUTES = ["/auth/me"];

// ✅ these routes show error toasts but never redirect to /login
const AUTH_ROUTES = ["/auth/login", "/auth/signup"];

api.interceptors.response.use(
  (response) => {
    const isSilent = SILENT_ROUTES.some((route) =>
      response.config.url?.includes(route)
    );
    if (!isSilent && response.data?.message) {
      toast.success(response.data.message, { autoClose: 2500 });
    }
    return response;
  },
  (error) => {
    const url = error.config?.url ?? "";

    // ✅ completely silent — no toast, no redirect
    if (SILENT_ROUTES.some((route) => url.includes(route))) {
      return Promise.reject(error);
    }

    if (error.code === "ECONNABORTED") {
      toast.error("Request timed out. Please try again.");
      return Promise.reject(error);
    }

    if (!error.response) {
      toast.error("Network error. Check your connection.");
      return Promise.reject(error);
    }

    const status  = error.response.status;
    const message = error.response?.data?.message || "Something went wrong.";
    const isAuthRoute = AUTH_ROUTES.some((route) => url.includes(route));

    if (status === 401) {
      if (isAuthRoute) {
        // ✅ login/signup 401 — show the error message but DO NOT redirect
        toast.error(message);
      } else {
        // ✅ other 401s — redirect only if not already on auth pages
        const authPages = ["/login", "/signup", "/"];
        if (!authPages.includes(window.location.pathname)) {
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
        }
      }
    } else if (status === 403) {
      toast.error("You don't have permission to do that.");
    } else if (status === 404) {
      // ✅ don't toast 404 on auth routes — "user not found" is shown via message
      if (!isAuthRoute) toast.error("Resource not found.");
      else toast.error(message);
    } else if (status >= 500) {
      toast.error("Server error. Please try again later.");
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);