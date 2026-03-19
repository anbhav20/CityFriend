import Sidebar from "../components/Sidebar";
import BottomNav from "./BottomNav";
import RightSide from "./RightSide";

/**
 * Layout structure:
 *
 * Desktop (lg+):
 *   [Sidebar fixed 64px] [main content scrollable, mx-auto capped] [RightSide fixed 240px]
 *   The main content has left/right padding to stay clear of both fixed panels.
 *
 * Mobile (< lg):
 *   Full-width content with padding-bottom so it never hides behind the fixed BottomNav.
 */
const MainLayout = ({ children }) => {
  return (
    <>
      {/* ── Desktop ── */}
      <div className="hidden lg:block min-h-screen bg-gray-50">
        {/* Fixed left sidebar */}
        <Sidebar />

        {/* Fixed right panel */}
        <RightSide />

        {/* Scrollable centre column — clear of both fixed panels */}
        <div className="ml-64 mr-60 min-h-screen">
          {children}
        </div>
      </div>

      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-gray-50">
        {/* pb-20 keeps content above the fixed BottomNav (h ~56px + safe area) */}
        <div className="pb-20">
          {children}
        </div>
        <BottomNav />
      </div>
    </>
  );
};

export default MainLayout;