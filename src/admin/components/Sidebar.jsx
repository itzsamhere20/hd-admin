import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { NavLink } from "react-router-dom";
const links = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Customers", path: "/admin/customers", icon: Users },
  { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  return (
    <div
      className={`
        fixed lg:static top-0 left-0
        min-h-screen h-auto bg-white border-r border-[#e7dcc7]
        transition-all duration-300
        ${collapsed ? "w-[70px]" : "w-[270px]"}
        p-3 lg:p-6
        flex flex-col  z-[100]
      `}
    >
      {/* Floating Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="
          absolute -right-3 top-10
          bg-primary text-white
          w-6 h-6 rounded-full
          flex items-center justify-center
          shadow-md lg:hidden
        "
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo */}
      <h1
        className={`font-luxury text-2xl lg:text-4xl text-primary mb-10 ${collapsed ? "justify-center" : "justify-start"} px-3 flex items-center gap-21`}
      >
        {collapsed ? "H" : "Hamdam"}
      </h1>

      {/* Links */}
      <div className="space-y-4 w-full">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-2xl transition
                 ${!collapsed && " lg:justify-start"}
                ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-[#faf7f2]"
                }`
              }
              end
            >
              <Icon size={22} />

              {!collapsed && (
                <span className="font-cormorant text-xl">{link.name}</span>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
