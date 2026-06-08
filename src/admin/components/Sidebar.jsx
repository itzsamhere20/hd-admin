import { useEffect, useState } from "react";
import api from "../api/api";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Mail,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Orders", path: "/admin/orders", icon: ShoppingBag, key: "orders" },
  { name: "Products", path: "/admin/products", icon: Package },
  {
    name: "Customers",
    path: "/admin/customers",
    icon: Users,
    key: "customers",
  },
  { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { name: "Messages", path: "/admin/messages", icon: Mail, key: "messages" },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const [counts, setCounts] = useState({
    orders: 0,
    messages: 0,
    customers: 0,
  });

  // -------------- polling fetch ----------------
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [ordersRes, messagesRes, usersRes] = await Promise.all([
          api.get("/orders/all"),
          api.get("/messages/"),
          api.get("/user/all"),
        ]);

        const orders = ordersRes.data || [];
        const messages = messagesRes.data || [];
        const users = usersRes.data || [];

        setCounts({
          orders: orders.filter((o) => !o.isRead).length,
          messages: messages.filter((m) => m.status !== "read").length,
          customers: users.filter((u) => !u.isRead).length,
        });
      } catch (err) {
        console.log(err);
      }
    };

    fetchCounts(); // initial load

    const interval = setInterval(fetchCounts, 5000); // live update

    return () => clearInterval(interval);
  }, []);
  return (
    <div
      className={`
        fixed top-0 left-0
        h-screen
        bg-white border-r border-[#e7dcc7]
        transition-all duration-300
        ${collapsed ? "w-[70px]" : "w-[270px]"}
        flex flex-col z-[100]
        
      `}
    >
      {/* HEADER (NOT scrollable) */}
      <div className="relative p-4 lg:p-6 border-b border-[#f0ebe2]">
        {/* TOGGLE BUTTON (always visible on mobile) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
            absolute -right-3 top-20
            bg-white border border-[#e7dcc7]
            text-gray-600 hover:text-primary
            w-7 h-7 rounded-full
            flex items-center justify-center
            shadow-md
            z-[999]
            lg:hidden
          "
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* LOGO */}
        <h1
          className={`
            font-luxury text-primary tracking-wider
            ${collapsed ? "text-xl text-center" : "text-3xl"}
          `}
        >
          {collapsed ? "H" : "HAMDAM"}
        </h1>
      </div>

      {/* LINKS (ONLY scrollable area) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.name}
              to={link.path}
              end
              className={({ isActive }) => `
    flex items-center justify-between px-3 py-3 rounded-2xl
    transition-all duration-200

    ${
      isActive
        ? "bg-[#faf7f2] border border-[#e7dcc7] text-primary"
        : "text-gray-600 hover:bg-[#faf7f2]"
    }

    ${collapsed ? "justify-center" : ""}
  `}
            >
              <div className="relative flex items-center gap-3">
                <Icon size={20} />

                {/* 🔴 DOT when collapsed */}
                {collapsed && link.key && counts[link.key] > 0 && (
                  <span className="absolute -top-2 -right-2 w-2 h-2 rounded-full bg-primary" />
                )}

                {!collapsed && (
                  <span className="font-cormorant text-[18px] tracking-wide">
                    {link.name}
                  </span>
                )}
              </div>

              {!collapsed && link.key && counts[link.key] > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium whitespace-nowrap">
                  {counts[link.key]}{" "}
                  {link.key === "messages" ? "Unread" : "New"}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* FOOTER */}

      {!collapsed && (
        <div className="p-4 border-t border-[#f0ebe2]">
          <p className="text-[9px] text-gray-400 font-cormorant  tracking-[0.4em]">
            HAMDAM JEWELRY © {new Date().getFullYear()}
          </p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
