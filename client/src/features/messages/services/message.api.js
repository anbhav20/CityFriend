import { api } from "../../api";

export const fetchChats    = ()         => api.get("/message/chats").then(r => r.data);
export const fetchMessages = (chatId)   => api.get(`/message/${chatId}`).then(r => r.data);
export const sendMessage   = (receiverId, text) =>
  api.post(`/message/send/${receiverId}`, { text }).then(r => r.data);