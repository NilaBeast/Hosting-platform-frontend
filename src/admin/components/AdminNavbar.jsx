import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import { motion } from "framer-motion";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    API.get("api/profile")
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        navigate("/login");
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("github_token");
    navigate("/login");
  };

  return (
    <motion.div
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.35 }}
      className="glass border-b border-white/5 p-4 flex justify-end items-center gap-6 sticky top-0 z-40"
    >
      <button
        onClick={() => navigate("/admin/settings")}
        className="hover:text-cyan-200 transition"
      >
        Settings
      </button>

      {/* Profile Dropdown */}
      <div className="relative">
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img
            src={
              user?.avatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            className="w-9 h-9 rounded-full"
          />
          <span>{user?.name || "Admin"}</span>
        </div>

        {open && (
          <div className="absolute right-0 mt-2 w-44 glass rounded-xl overflow-hidden">
            <button
              onClick={() => navigate("/admin/profile")}
              className="block w-full text-left px-4 py-2 hover:bg-white/5 transition"
            >
              Profile
            </button>

            <button
              onClick={() => navigate("/admin/settings")}
              className="block w-full text-left px-4 py-2 hover:bg-white/5 transition"
            >
              Settings
            </button>

            <button
              onClick={logout}
              className="block w-full text-left px-4 py-2 hover:bg-red-500/70 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminNavbar;
