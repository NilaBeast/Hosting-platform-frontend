import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Server,
  Globe,
  Upload,
  Settings,
  LogOut,
  LifeBuoy,
  Ticket,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/register";
  };

  /* ===============================
     ACTIVE LINK STYLE
  ============================== */
  const linkClass = (path) =>
    `flex items-center gap-2 p-2 rounded-xl transition ${
      location.pathname === path
        ? "bg-gradient-to-r from-violet-600/80 to-cyan-500/60 text-white shadow-[0_18px_50px_rgba(124,58,237,0.25)]"
        : "text-gray-300 hover:bg-white/5"
    }`;

  return (
    <div className="w-64 h-screen p-4 flex flex-col justify-between">
      <div className="glass h-full rounded-2xl p-4 flex flex-col justify-between">

      {/* TOP */}
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.3 }}
          className="text-2xl font-semibold mb-8 text-white tracking-tight"
        >
          Dashboard
        </motion.h2>

        <nav className="space-y-2">

          <Link to="/" className={linkClass("/")}>
            <Home className="h-4 w-4" /> Dashboard
          </Link>

          <Link to="/plans" className={linkClass("/plans")}>
            <Server className="h-4 w-4" /> Plans
          </Link>

          <Link to="/hosting" className={linkClass("/hosting")}>
            <Server className="h-4 w-4" /> Hosting
          </Link>

          <Link to="/domains" className={linkClass("/domains")}>
            <Globe className="h-4 w-4" /> Domains
          </Link>

          <Link to="/deploy" className={linkClass("/deploy")}>
            <Upload className="h-4 w-4" /> Deploy
          </Link>

          <Link to="/settings" className={linkClass("/settings")}>
            <Settings className="h-4 w-4" /> Settings
          </Link>

          {/* 🔥 SUPPORT SECTION */}
          <div className="mt-4 border-t border-gray-700 pt-4">

            <p className="text-xs text-gray-500 mb-2">SUPPORT</p>

            {/* Create Ticket */}
            <Link to="/support" className={linkClass("/support")}>
              <LifeBuoy className="h-4 w-4" /> Open Ticket
            </Link>

            {/* My Tickets */}
            <Link to="/tickets" className={linkClass("/tickets")}>
              <Ticket className="h-4 w-4" /> My Tickets
            </Link>

          </div>

        </nav>
      </div>

      {/* LOGOUT */}
      <button
        onClick={logout}
        className="flex items-center gap-2 mt-10 text-red-300 hover:text-red-200"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>

    </div>
    </div>
  );
};

export default Sidebar;
