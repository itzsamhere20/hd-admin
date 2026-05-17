import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#faf7f2]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={`
          flex-1 flex flex-col min-w-0
          transition-all duration-300 ml-[70px] lg:ml-0
          
        `}
      >
        <Navbar />

        <main className="p-6 ">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
