import { api } from "../../api"; // ✅ shared instance — no local axios.create

export const handleFeed         = () => api.get("/posts/feed").then(r => r.data);
export const handleUsersAllPosts = () => api.get("/posts/").then(r => r.data);

export const handleUpload = (formData) =>
  api.post("/posts/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data);