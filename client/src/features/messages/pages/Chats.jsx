import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import {
  FiSend, FiEdit, FiSearch, FiArrowLeft, FiMoreHorizontal
} from "react-icons/fi";
import { useAuth } from "../../auth/hooks/useAuth";
import { useMessage } from "../MessageContext";
import { useUser } from "../../user/hooks/useUser";
import MainLayout from "../../../components/MainLayout";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const TYPING_DELAY = 1000;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPeer(chat, myId) {
  return chat.participants?.find((p) => (p._id ?? p) !== myId);
}

function formatPreviewTime(iso) {
  if (!iso) return "";
  const d   = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays < 7)  return `${diffDays}d`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function groupMessagesByDate(messages) {
  const groups = [];
  let lastDate  = null;
  for (const msg of messages) {
    const dateStr = new Date(msg.createdAt).toDateString();
    if (dateStr !== lastDate) {
      groups.push({ type: "divider", label: formatDivider(msg.createdAt), id: `div-${msg._id}` });
      lastDate = dateStr;
    }
    groups.push({ type: "message", ...msg });
  }
  return groups;
}

function formatDivider(iso) {
  const d   = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) +
    " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatBubbleTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ user, size = 40, online = false, className = "" }) {
  const initials = user?.username?.[0]?.toUpperCase() ?? "?";
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      {user?.profilePic ? (
        <img src={user.profilePic} alt={user.username}
          className="rounded-full object-cover w-full h-full" />
      ) : (
        <div className="rounded-full w-full h-full flex items-center justify-center
          font-semibold text-white bg-linear-to-br from-blue-400 to-blue-600 select-none"
          style={{ fontSize: size * 0.38 }}>
          {initials}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400
          border-2 border-white" />
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ChatRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  );
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingBubble() {
  return (
    <div className="flex items-end gap-2 px-4">
      <div className="flex gap-1 px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-sm">
        {[0,1,2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full inline-block"
            style={{ animation: `typingBounce 1.2s ${i*0.2}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const Chats = () => {
  const [searchParams] = useSearchParams();
  const userIdFromURL   = searchParams.get("userId");
  const usernameFromURL = searchParams.get("username");

  const { user: me } = useAuth();
  const { getChats, getMessages, postMessage } = useMessage();
  const { userProfile } = useUser();

  const [chats,        setChats]        = useState([]);
  const [activeChat,   setActiveChat]   = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [text,         setText]         = useState("");
  const [onlineUsers,  setOnlineUsers]  = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [peerTyping,   setPeerTyping]   = useState(false);
  const [search,       setSearch]       = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMsgs,  setLoadingMsgs]  = useState(false);
  const [sending,      setSending]      = useState(false);
  const [mobileView,   setMobileView]   = useState("list"); // "list" | "chat"

  const navigate = useNavigate();

  const [pendingUser, setPendingUser] = useState(null);

  const socketRef     = useRef(null);
  const bottomRef     = useRef(null);
  const inputRef      = useRef(null);
  const typingTimer   = useRef(null);
  const activeChatRef = useRef(activeChat);
  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  // ── Socket setup ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!me) return;
    const socket = io(SOCKET_URL, { auth: { token: localStorage.getItem("token") } });
    socketRef.current = socket;

    socket.on("connect",      () => socket.emit("join", me._id));
    socket.on("online_users", setOnlineUsers);

    socket.on("receive_message", (msg) => {
      if (msg.chatId === activeChatRef.current?._id) {
        setMessages((prev) => [...prev, msg]);
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.chatId]: (prev[msg.chatId] || 0) + 1,
        }));
      }
      setChats((prev) =>
        prev.map((c) => c._id === msg.chatId ? { ...c, lastMessage: msg } : c)
      );
    });

    socket.on("typing",      ({ chatId }) => {
      if (chatId === activeChatRef.current?._id) setPeerTyping(true);
    });
    socket.on("stop_typing", ({ chatId }) => {
      if (chatId === activeChatRef.current?._id) setPeerTyping(false);
    });

    return () => socket.disconnect();
  }, [me]);

  // ── Load chats ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!me) return;
    setLoadingChats(true);
    getChats()
      .then(setChats).catch(() => {})
      .finally(() => setLoadingChats(false));
  }, [me]);

  // ── Handle ?userId= param ───────────────────────────────────────────────
  useEffect(() => {
    if (!userIdFromURL || !me) return;
    if (loadingChats) return;

    const existingChat = chats.find((c) =>
      c.participants?.some((p) => (p._id ?? p) === userIdFromURL)
    );

    if (existingChat) {
      setActiveChat(existingChat);
      setPendingUser(null);
      setMobileView("chat");
    } else {
      setActiveChat(null);
      if (!usernameFromURL) return;
      userProfile(usernameFromURL)
        .then((data) => {
          const user = data?.user ?? data;
          if (user?._id) {
            setPendingUser(user);
            setMobileView("chat");
          }
        })
        .catch(() => setPendingUser(null));
    }
  }, [userIdFromURL, chats, loadingChats, me]);

  // ── Load messages ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeChat) return;
    setPeerTyping(false);
    setLoadingMsgs(true);
    getMessages(activeChat._id)
      .then(setMessages).catch(() => {})
      .finally(() => setLoadingMsgs(false));
  }, [activeChat?._id]);

  // ── Scroll to bottom ────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, peerTyping]);

  // ── Typing ──────────────────────────────────────────────────────────────
  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socketRef.current) return;

    const receiverId = activeChat
      ? getPeer(activeChat, me._id)?._id
      : pendingUser?._id;

    if (!receiverId) return;

    socketRef.current.emit("typing", {
      receiverId,
      chatId: activeChat?._id ?? null,
    });

    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", {
        receiverId,
        chatId: activeChat?._id ?? null,
      });
    }, TYPING_DELAY);
  };

  // ── Send ────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!text.trim() || sending) return;

    const receiverId = activeChat
      ? getPeer(activeChat, me._id)?._id
      : pendingUser?._id;

    if (!receiverId) return;

    setSending(true);
    try {
      const msg = await postMessage(receiverId, text.trim());

      const updatedChats = await getChats();
      setChats(updatedChats);

      const targetChat = updatedChats.find((c) =>
        c.participants?.some((p) => (p._id ?? p) === receiverId)
      );

      if (targetChat) {
        setActiveChat(targetChat);
        setMobileView("chat");
        setMessages((prev) => [...prev, msg]);
      }

      socketRef.current?.emit("send_message", { ...msg, receiverId });

      setPendingUser(null);
      setText("");
      inputRef.current?.focus();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }, [text, activeChat, pendingUser, me, sending]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const openChat = (chat) => {
    const peer = getPeer(chat, me._id);
    setActiveChat(chat);
    setPendingUser(null);
    setMobileView("chat");
    navigate(`/chats?userId=${peer._id}&username=${peer.username}`);
    setUnreadCounts((prev) => ({ ...prev, [chat._id]: 0 }));
  };

  const filteredChats = chats.filter((c) => {
    const peer = getPeer(c, me?._id);
    return peer?.username?.toLowerCase().includes(search.toLowerCase().trim());
  });

  const activePeer   = activeChat ? getPeer(activeChat, me._id) : pendingUser ?? null;
  const isPeerOnline = activePeer && onlineUsers.includes(activePeer._id);
  const grouped      = groupMessagesByDate(messages);

  // chatOpen drives BottomNav visibility in MainLayout (mobile only)
  const chatOpen = mobileView === "chat";

  return (
    <>
      <style>{`
        @keyframes typingBounce {
          0%,60%,100% { transform: translateY(0); }
          30%          { transform: translateY(-4px); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; }
      `}</style>

      {/* Pass chatOpen so MainLayout can hide/show BottomNav on mobile */}
      <MainLayout noShell chatOpen={chatOpen}>
        <div className="flex bg-white" style={{ height: "100%", overflow: "hidden" }}>

          {/* ══ LEFT PANEL ════════════════════════════════════════════════ */}
          <aside className={`
            flex flex-col border-r border-gray-200
            w-full md:w-90 shrink-0
            ${mobileView === "chat" ? "hidden md:flex" : "flex"}
          `} style={{ height: "100%", overflow: "hidden" }}>
            <div className="px-2 pt-5 pb-3">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-gray-900 tracking-tight">
                  {me?.username}
                </span>
              </div>
              <div className="relative">
                <FiSearch size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="search"
                  placeholder="Search"
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-gray-100
                    placeholder-gray-500 text-gray-800 border-none
                    focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-2">
              <span className="text-sm font-semibold text-gray-900">Messages</span>
            </div>

            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {loadingChats ? (
                Array.from({ length: 6 }, (_, i) => <ChatRowSkeleton key={i} />)
              ) : filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <p className="text-3xl mb-3">✉️</p>
                  <p className="text-sm font-semibold text-gray-800">No messages yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {search ? `No results for "${search}"` : "Start a conversation with someone you follow"}
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const peer     = getPeer(chat, me._id);
                  const isActive = activeChat?._id === chat._id;
                  const isOnline = peer && onlineUsers.includes(peer._id ?? peer);
                  const preview  = chat.lastMessage?.text;
                  const time     = formatPreviewTime(chat.lastMessage?.createdAt ?? chat.updatedAt);

                  return (
                    <button
                      key={chat._id}
                      onClick={() => openChat(chat)}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition text-left
                        ${isActive ? "bg-gray-100" : "hover:bg-gray-50"}`}
                    >
                      <Avatar user={peer} size={56} online={isOnline} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm truncate ${unreadCounts[chat._id] > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-900"}`}>
                            {peer?.username ?? "Unknown"}
                          </span>
                          <div className="flex items-center gap-1.5 ml-2 shrink-0">
                            {unreadCounts[chat._id] > 0 ? (
                              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500
                                text-white text-[10px] font-bold flex items-center justify-center">
                                {unreadCounts[chat._id] > 99 ? "99+" : unreadCounts[chat._id]}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">{time}</span>
                            )}
                          </div>
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${unreadCounts[chat._id] > 0 ? "text-gray-800 font-medium" : "text-gray-500"}`}>
                          {preview ?? "Tap to start chatting"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* ══ RIGHT PANEL ═══════════════════════════════════════════════ */}
          {/*
            FIX: overflow-hidden on <main> is essential — without it the entire
            panel scrolls on mobile, which causes the header to scroll away.
            The inner flex-col with min-h-0 + flex-1 on the messages area then
            correctly constrains scrolling to only the messages div.
          */}
          <main className={`
            flex-1 flex flex-col bg-white overflow-hidden
            ${mobileView === "list" ? "hidden md:flex" : "flex"}
          `} style={{ height: "100%" }}>

            {!activeChat && !pendingUser ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 select-none">
                <div className="w-20 h-20 rounded-full border-2 border-gray-900 flex items-center justify-center">
                  <FiSend size={32} className="text-gray-900 -rotate-12" />
                </div>
                <p className="text-xl font-semibold text-gray-900">Your messages</p>
                <p className="text-sm text-gray-400">Send a message to start a chat.</p>
              </div>
            ) : (
              /* This flex-col must fill the full height and clip overflow so only
                 the messages div scrolls — not the whole panel. min-h-0 is required
                 on flex children that need to shrink below their natural height. */
              <div className="flex flex-col h-full min-h-0">

                {/* ── Chat header — shrink-0 prevents it from scrolling away ── */}
                <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 shrink-0 bg-white z-10">
                  <button
                    onClick={() => {
                      setMobileView("list");
                      setActiveChat(null);
                      setPendingUser(null);
                      navigate("/chats");
                    }}
                    className="md:hidden p-1.5 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                  >
                    <FiArrowLeft size={20} />
                  </button>

                  <Avatar user={activePeer} size={44} online={isPeerOnline} />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-tight">
                      {activePeer?.username ?? "Unknown"}
                    </p>
                    <p className={`text-xs leading-tight ${isPeerOnline ? "text-green-500" : "text-gray-400"}`}>
                      {isPeerOnline ? "Active now" : "Offline"}
                    </p>
                  </div>

                  <button className="p-2 rounded-full hover:bg-gray-100 transition text-gray-700">
                    <FiMoreHorizontal size={20} />
                  </button>
                </header>

                {/* ── Messages area — flex-1 + min-h-0 lets this shrink and scroll ── */}
                <div
                  className="flex-1 overflow-y-auto py-4 space-y-0.5"
                  style={{ scrollbarWidth: "none", minHeight: 0 }}
                >
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex gap-1.5">
                        {[0,1,2].map((i) => (
                          <span key={i} className="w-2 h-2 bg-gray-300 rounded-full inline-block"
                            style={{ animation: `typingBounce 1.2s ${i*0.2}s infinite` }} />
                        ))}
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <Avatar user={activePeer} size={80} />
                      <p className="font-semibold text-gray-900">{activePeer?.username}</p>
                      <p className="text-xs text-gray-400">No messages yet. Say hi! 👋</p>
                    </div>
                  ) : (
                    grouped.map((item) => {
                      if (item.type === "divider") {
                        return (
                          <div key={item.id} className="flex items-center justify-center py-3">
                            <span className="text-xs text-gray-400 font-medium">{item.label}</span>
                          </div>
                        );
                      }

                      const isMine = (item.senderId?._id ?? item.senderId) === me._id;
                      return (
                        <div key={item._id}
                          className={`flex items-end gap-2 px-4 py-0.5
                            ${isMine ? "justify-end" : "justify-start"}`}>
                          {!isMine && (
                            <Avatar user={activePeer} size={28} className="mb-1" />
                          )}
                          <div className={`flex flex-col gap-0.5 max-w-[60%]
                            ${isMine ? "items-end" : "items-start"}`}>
                            <div className={`
                              px-4 py-2.5 rounded-3xl text-sm leading-relaxed wrap-break-words
                              ${isMine
                                ? "bg-blue-500 text-white rounded-br-md"
                                : "bg-gray-100 text-gray-900 rounded-bl-md"}
                            `}>
                              {item.text}
                            </div>
                            <span className="text-[10px] text-gray-400 px-1">
                              {formatBubbleTime(item.createdAt)}
                              {isMine && <span className="ml-1">{item.seen ? "✓✓" : "✓"}</span>}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {peerTyping && <TypingBubble />}
                  <div ref={bottomRef} />
                </div>

                {/* ── Input bar — shrink-0 keeps it pinned at bottom ── */}
                <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-200 shrink-0 bg-white">
                  <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2 gap-2">
                    <textarea
                      ref={inputRef}
                      value={text}
                      onChange={handleTyping}
                      onKeyDown={handleKeyDown}
                      placeholder="Message…"
                      rows={1}
                      className="flex-1 bg-transparent resize-none text-sm text-gray-800
                        placeholder-gray-500 focus:outline-none max-h-24 overflow-y-auto leading-relaxed"
                    />
                  </div>

                  {text.trim() ? (
                    <button
                      onClick={handleSend}
                      disabled={sending}
                      className="text-blue-500 font-semibold text-sm hover:text-blue-600
                        transition disabled:opacity-40 shrink-0"
                    >
                      Send
                    </button>
                  ) : (
                    <button className="text-blue-500 hover:text-blue-600 transition shrink-0">
                      <FiSend size={22} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </MainLayout>
    </>
  );
};

export default Chats;