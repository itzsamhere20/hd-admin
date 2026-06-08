import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  KeyRound,
  Bell,
  Trash2,
  ShoppingBag,
  MessageCircle,
  Users,
  X,
} from "lucide-react";
import api from "../api/api";

/* ── icon + color per notification type ── */
const NOTIF_CONFIG = {
  order: {
    icon: ShoppingBag,
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-100",
    dot: "bg-purple-400",
    label: "New Order",
  },
  message: {
    icon: MessageCircle,
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
    dot: "bg-blue-400",
    label: "New Message",
  },
  user: {
    icon: Users,
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
    dot: "bg-emerald-400",
    label: "New Customer",
  },
};

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [clearing, setClearing] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const prevCount = useRef(0);

  const navigate = useNavigate();

  /* ── OUTSIDE CLICK ── */
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── USER ── */
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))

      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      setUser(e.detail);
    };

    window.addEventListener("admin-updated", handler);

    return () => {
      window.removeEventListener("admin-updated", handler);
    };
  }, []);

  /* ── FETCH NOTIFICATIONS ── */
  const fetchNotifications = async () => {
    try {
      const [ordersRes, messagesRes, usersRes] = await Promise.all([
        api.get("/orders/notifications"),
        api.get("/messages/notifications"),
        api.get("/user/notifications"),
      ]);

      const format = (items, type) =>
        items.map((item) => ({
          id: item._id,
          type,
          createdAt: item.createdAt || Date.now(),
        }));

      const merged = [
        ...format(ordersRes.data, "order"),
        ...format(messagesRes.data, "message"),
        ...format(usersRes.data, "user"),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // newest first

      setNotifications(merged);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  /* ── CLICK SINGLE NOTIFICATION ── */
  const handleNotifClick = async (notif) => {
    // optimistic remove
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    navigate(notif.path || getPath(notif.type));
    setNotifOpen(false);
    try {
      if (notif.type === "order") await api.put(`/orders/${notif.id}/seen`);
      if (notif.type === "message") await api.put(`/messages/${notif.id}/seen`);
      if (notif.type === "user") await api.put(`/user/${notif.id}/seen`);
    } catch (err) {
      console.log(err);
    }
  };

  const getPath = (type) => {
    if (type === "order") return "/admin/orders";
    if (type === "message") return "/admin/messages";
    return "/admin/customers";
  };

  /* ── CLEAR ALL — optimistic (instant UI) ── */
  const clearAllNotifications = async () => {
    const snapshot = [...notifications];
    setNotifications([]); // instant clear
    setClearing(true);
    try {
      await Promise.all([
        api.put("/orders/notifications/mark-all"),
        api.put("/messages/notifications/mark-all"),
        api.put("/user/notifications/mark-all"),
      ]);
    } catch (err) {
      console.log(err);
      setNotifications(snapshot); // restore on failure
    } finally {
      setClearing(false);
    }
  };

  /* ── LOGOUT ── */
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const count = notifications.length;

  return (
    <div className="h-[70px] bg-white border-b border-[#e7dcc7] flex items-center justify-between px-4 lg:px-8">
      {/* TITLE */}
      <h2 className="font-luxury text-xl lg:text-3xl text-gray-800">
        Admin Dashboard
      </h2>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* ════════════════════════════════
            NOTIFICATIONS
        ════════════════════════════════ */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((p) => !p)}
            className="relative w-10 h-10 rounded-2xl border border-[#e7dcc7] flex items-center justify-center hover:bg-[#faf7f2] transition-colors"
          >
            {/* BELL with vibrate animation — key remount forces re-trigger */}
            <Bell
              size={18}
              className={`text-gray-600 ${
                notifications.length > 0 ? "bell-ring" : ""
              }`}
            />

            {/* COUNT BADGE */}
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-1 leading-none">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>

          {/* DROPDOWN */}
          {notifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-[#e7dcc7] rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] z-50 overflow-hidden">
              {/* HEADER */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0ebe2]">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800">
                    Notifications
                  </p>
                  {count > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {count} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {count > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      disabled={clearing}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 px-2.5 py-1 rounded-xl transition-colors disabled:opacity-40"
                    >
                      <Trash2 size={11} />
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="w-7 h-7 rounded-xl border border-[#e7dcc7] flex items-center justify-center hover:bg-[#faf7f2] transition"
                  >
                    <X size={13} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* BODY */}
              <div className="max-h-[340px] overflow-y-auto">
                {count === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#faf7f2] border border-[#e7dcc7] flex items-center justify-center mb-3">
                      <Bell size={20} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                      All caught up!
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      No new notifications
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {notifications.map((n, idx) => {
                      const cfg = NOTIF_CONFIG[n.type] || NOTIF_CONFIG.order;
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={n.id}
                          onClick={() => handleNotifClick(n)}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#faf7f2] transition-colors text-left ${idx < notifications.length - 1 ? "border-b border-[#f9f6f1]" : ""}`}
                        >
                          {/* TYPE ICON */}
                          <div
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.border}`}
                          >
                            <Icon size={15} className={cfg.text} />
                          </div>

                          {/* TEXT */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">
                              {cfg.label}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 capitalize">
                              {n.type}
                            </p>
                          </div>

                          {/* UNREAD DOT */}
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ════════════════════════════════
            PROFILE
        ════════════════════════════════ */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((p) => !p)}
            className="flex items-center gap-2.5 border border-[#e7dcc7] rounded-2xl px-3 py-2 hover:bg-[#faf7f2] transition-colors"
          >
            <div className="w-7 h-7 bg-primary text-white rounded-xl flex items-center justify-center text-xs font-semibold">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-tight">
                {user?.name || "Admin"}
              </p>
              <p className="text-[10px] text-gray-400 leading-tight truncate max-w-[120px]">
                {user?.email}
              </p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-[#e7dcc7] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
              {/* INFO */}
              <div className="px-4 py-3.5 border-b border-[#f0ebe2]">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {user?.email}
                </p>
              </div>

              <button
                onClick={() => {
                  navigate("/admin/settings/profile");
                  setProfileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-[#faf7f2] transition-colors"
              >
                <KeyRound size={15} className="text-gray-400" /> Change Password
              </button>

              <div className="border-t border-[#f0ebe2]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BELL RING KEYFRAME */}
      <style>{`
        @keyframes ring {
          0%   { transform: rotate(0deg); }
          15%  { transform: rotate(18deg); }
          30%  { transform: rotate(-16deg); }
          45%  { transform: rotate(12deg); }
          60%  { transform: rotate(-10deg); }
          75%  { transform: rotate(6deg); }
          90%  { transform: rotate(-4deg); }
          100% { transform: rotate(0deg); }
        }
      .bell-ring {
  animation: ringPause 6s infinite;
  transform-origin: top center;
}

@keyframes ringPause {
  0% { transform: rotate(0deg); }
  2% { transform: rotate(18deg); }
  4% { transform: rotate(-16deg); }
  6% { transform: rotate(12deg); }
  8% { transform: rotate(-10deg); }
  10% { transform: rotate(6deg); }
  12% { transform: rotate(-4deg); }
  14% { transform: rotate(0deg); }

  100% { transform: rotate(0deg); }
}
      `}</style>
    </div>
  );
};

export default Navbar;
