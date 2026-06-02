import { signInWithPopup, signOut } from "firebase/auth";
import { api } from "../../api";
import { auth, googleProvider } from "../../../config/firebase";

export const handleLogin = async (identifier, password) => {
  const res = await api.post("/auth/login", { identifier, password });
  return res.data;
};

export const handleRegister = async (username, email, password) => {
  const res = await api.post("/auth/signup", { username, email, password });
  return res.data;
};

export const handleGoogleLogin = async () => {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    const idToken = await credential.user.getIdToken();
    const res = await api.post("/auth/oauth", { idToken });
    return res.data;
  } catch (err) {
    console.error("Google login error:", err.code, err.message);
    if (
      err.code === "auth/popup-blocked" ||
      err.code === "auth/cancelled-popup-request"
    ) {
      throw new Error("Popup blocked by browser. Please allow popups and try again.");
    }
    throw err;
  }
};

export const handleLogout = async () => {
  const res = await api.post("/auth/logout");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  await signOut(auth).catch(() => {});
  return res.data;
};

export const handleMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};