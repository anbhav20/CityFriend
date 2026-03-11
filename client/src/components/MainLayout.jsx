import Sidebar from "../components/Sidebar";
import RightSide from "./RightSide";
import SocialIcons from "./SocialIcons";

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 min-h-screen ">
        {children}
      </div>
     <RightSide/>

    </div>
  );
};

export default MainLayout;
