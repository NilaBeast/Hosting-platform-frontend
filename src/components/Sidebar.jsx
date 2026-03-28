import { Link } from "react-router-dom";
import { Home, Server, Globe, Upload, Settings, LogOut } from "lucide-react";

const Sidebar = () => {

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/register";
  };

  return (
    <div className="w-64 bg-[#020617] h-screen p-6 flex flex-col justify-between">
      
      <div>
        <h2 className="text-2xl font-bold mb-8">Dashboard</h2>

        <nav className="space-y-4">
          <Link to="/" className="flex items-center gap-2"> <Home /> Dashboard</Link>
          <Link to="/plans" className="flex items-center gap-2"> <Server /> Plans</Link>
          <Link to="/hosting" className="flex items-center gap-2"> <Server /> Hosting</Link>
          <Link to="/domains" className="flex items-center gap-2"> <Globe /> Domains</Link>
          <Link to="/deploy" className="flex items-center gap-2"> <Upload /> Deploy</Link>
          <Link to="/settings" className="flex items-center gap-2"> <Settings /> Settings</Link>
        </nav>
      </div>

      {/* Logout Button */}
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