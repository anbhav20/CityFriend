import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ── Route guards ──
import { ProtectedRoute }  from "./routes/ProtectedRoute";
import { PublicOnlyRoute } from "./routes/PublicOnlyRoute";

import { usePushNotification } from "./features/notifications/hooks/usePushNotification";

// ── Auth pages ──a
import Login  from "./features/auth/pages/Login";
import Signup from "./features/auth/pages/Signup";

// ── Protected pages ──
import Home          from "./features/post/pages/Home";
import Profile       from "./features/user/pages/Profile";
import Search        from "./features/user/pages/Explore";
import EditProfile   from "./features/user/pages/EditProfile";
import Notifications from "./features/notifications/pages/NotificatonsPage";
import Chats         from "./features/messages/pages/Chats";
import Settings      from "./pages/Settings";

// ── Open public pages ──
import Landing       from "./pages/Landing";
import About         from "./components/About";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Terms         from "./components/Terms";
import NotFound      from "./pages/NotFound";

const App = () => {
  usePushNotification(); 
  return (
    <>
     <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover={false}
        draggable={false}
        theme="light"
        toastClassName="!text-sm !min-h-0 !py-2 !px-3 !rounded-lg !w-fit !max-w-[280px] !mx-auto"
      />
      <BrowserRouter>
        <Routes>

          {/* ── Open — anyone can visit ── */}
          <Route path="/"               element={<Landing />} />
          <Route path="/about"          element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms"          element={<Terms />} />

          {/* ── Auth only — logged-in users bounce to /home ── */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login"  element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* ── Protected — guests bounce to /login ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home"          element={<Home />} />
            <Route path="/search"        element={<Search />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/chats"         element={<Chats />} />
            <Route path="/settings"      element={<Settings />} />
            <Route path="/edit-profile"  element={<EditProfile />} />
            {/* ✅ /:username must be last — wildcard swallows everything above it */}
            <Route path="/:username"     element={<Profile />} />
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;