import { createContext, useCallback, useContext, useState } from "react";
import { fetchChats, fetchMessages, sendMessage } from "./services/message.api";

export const MessageContext = createContext(null);

export const MessageProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const withLoading = useCallback(async (fn) => {
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  const getChats      = ()                    => withLoading(fetchChats);
  const getMessages   = (chatId)              => withLoading(() => fetchMessages(chatId));
  const postMessage   = (receiverId, text)    => withLoading(() => sendMessage(receiverId, text));

  return (
    <MessageContext.Provider value={{ loading, getChats, getMessages, postMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => useContext(MessageContext);