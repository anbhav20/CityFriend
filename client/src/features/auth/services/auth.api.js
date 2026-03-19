import { api } from "../../api";
export const handleLogin = async (identifier, password) => {
  const res = await api.post("/auth/login", { identifier, password });
  return res.data;
};

export const handleRegister = async (username, email, password) => { // ✅ city removed
  const res = await api.post("/auth/signup", { username, email, password });
  return res.data;
};

export const handleLogout = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

export const handleMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};