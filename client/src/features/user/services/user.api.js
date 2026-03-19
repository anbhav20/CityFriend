import { api } from "../../api"; // ✅ shared instance — no local axios.create

export const getAllUsers        = () => api.get("/users").then(r => r.data);
export const getUserSameCity   = () => api.get("/users/city").then(r => r.data);
export const getUserProfile    = (username) => api.get(`/${username}`).then(r => r.data);
export const followUser        = (id) => api.post(`/${id}/follow`).then(r => r.data);
export const unfollowUser      = (id) => api.delete(`/${id}/unfollow`).then(r => r.data);
export const getFollowers      = (id) => api.get(`/${id}/followers`).then(r => r.data);
export const getFollowings     = (id) => api.get(`/${id}/followings`).then(r => r.data);
export const editUserProfile   = (formData) =>
  api.patch("/users/edit-profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data);