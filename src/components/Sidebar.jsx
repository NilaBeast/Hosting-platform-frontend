import { Link, useLocation } from "react-router-dom";
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
    `flex items-center gap-2 p-2 rounded transition ${
      location.pathname === path
        ? "bg-purple-600 text-white"
        : "text-gray-300 hover:bg-gray-800"
    }`;

  return (
    <div className="w-64 bg-[#020617] h-screen p-6 flex flex-col justify-between">

      {/* TOP */}
      <div>
        <h2 className="text-2xl font-bold mb-8 text-white">Dashboard</h2>

        <nav className="space-y-2">

          <Link to="/" className={linkClass("/")}>
            <Home /> Dashboard
          </Link>

          <Link to="/plans" className={linkClass("/plans")}>
            <Server /> Plans
          </Link>

          <Link to="/hosting" className={linkClass("/hosting")}>
            <Server /> Hosting
          </Link>

          <Link to="/domains" className={linkClass("/domains")}>
            <Globe /> Domains
          </Link>

          <Link to="/deploy" className={linkClass("/deploy")}>
            <Upload /> Deploy
          </Link>

          <Link to="/settings" className={linkClass("/settings")}>
            <Settings /> Settings
          </Link>

          {/* 🔥 SUPPORT SECTION */}
          <div className="mt-4 border-t border-gray-700 pt-4">

            <p className="text-xs text-gray-500 mb-2">SUPPORT</p>

            {/* Create Ticket */}
            <Link to="/support" className={linkClass("/support")}>
              <LifeBuoy /> Open Ticket
            </Link>

            {/* My Tickets */}
            <Link to="/tickets" className={linkClass("/tickets")}>
              <Ticket /> My Tickets
            </Link>

          </div>

        </nav>
      </div>

      {/* LOGOUT */}
      <button
        onClick={logout}
        className="flex items-center gap-2 mt-10 text-red-400 hover:text-red-500"
      >
        <LogOut /> Logout
      </button>

    </div>
  );
};

export default Sidebar;