import Sidebar from "../components/Sidebar";
import BottomNav from "./BottomNav";
import RightSide from "./RightSide";

const MainLayout = ({ children, noShell = false, chatOpen = false }) => {
  if (noShell) {
    return (
      <>
        {/* ── Desktop ── */}
        <div className="hidden lg:flex" style={{ height: "100vh", overflow: "hidden" }}>
          <Sidebar />
          <div className="ml-64 flex-1 overflow-hidden">
            {children}
          </div>
        </div>

        {/* ── Mobile ──
            - chatOpen=false (/chats list): show BottomNav, add pb-14 so content clears it
            - chatOpen=true  (chat open):   hide BottomNav, no padding needed
        */}
        <div
          className="lg:hidden"
          style={{
            height: "100vh",
            overflow: "hidden",
            paddingBottom: chatOpen ? "0px" : "56px",
          }}
        >
          {children}
          {!chatOpen && <BottomNav />}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex min-h-screen">
        <Sidebar />
        <div className="ml-64 mr-60 flex-1 min-h-screen px-4 py-1">
          <div className="max-w-xl mx-auto">
            {children}
          </div>
        </div>
        <RightSide />
      </div>

      {/* Mobile */}
      <div className="lg:hidden min-h-screen w-full overflow-x-hidden">
        <div className="pb-20 w-full">
          {children}
        </div>
        <BottomNav />
      </div>
    </>
  );
};

export default MainLayout;