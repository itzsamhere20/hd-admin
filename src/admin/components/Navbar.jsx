import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, KeyRound } from "lucide-react";
import api from "../api/api";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // FETCH USER FROM BACKEND
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me"); // backend route
        setUser(res.data);
      } catch (err) {
        console.log("User fetch failed");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleChangePassword = () => {
    navigate("/admin/settings/security"); // or custom modal later
  };

  return (
    <div className="h-[70px] bg-white border-b border-[#e7dcc7] flex items-center justify-between px-4 lg:px-8 ">
      {/* Title */}
      <h2 className="font-luxury text-xl lg:text-3xl text-gray-800">
        Admin Dashboard
      </h2>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3"
        >
          <div className="text-right hidden sm:block"></div>

          <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
        </button>

        {/* DROPDOWN */}
        {open && (
          <div className="absolute right-0 mt-0 lg:mt-3 w-56 bg-white border border-[#e7dcc7] rounded-2xl shadow-md overflow-hidden z-50">
            {/* USER INFO */}
            <div className="p-4 border-b">
              <p className="font-cormorant text-sm">
                {user?.email || "admin@hamdam.com"}
              </p>
              <p className="text-sm text-primary/80">{user?.name || "Admin"}</p>
            </div>

            {/* CHANGE PASSWORD */}
            <button
              onClick={handleChangePassword}
              className="flex items-center gap-2 w-full px-4 py-3 hover:bg-[#faf7f2] text-sm lg:text-base"
            >
              <KeyRound size={16} />
              Change Password
            </button>

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-3 text-red-500 hover:bg-red-50 text-sm lg:text-base"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
