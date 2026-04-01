import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    API.get("api/profile").then((res) => {
      setUser(res.data);
    });
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("github_token");
    navigate("/login");
  };

  return (
    <div className="bg-[#020617] border-b border-gray-800 p-4 flex justify-end items-center gap-6">
      {/* Settings */}
      <button
        onClick={() => navigate("/admin/settings")}
        className="hover:text-blue-400"
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
              user.avatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            className="w-9 h-9 rounded-full"
          />
          <span>{user.name}</span>
        </div>

        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-[#0f172a] border border-gray-700 rounded-lg shadow-lg">
            <button
              onClick={() => navigate("/admin/profile")}
              className="block w-full text-left px-4 py-2 hover:bg-[#1e293b]"
            >
              Profile
            </button>

            <button
              onClick={() => navigate("/admin/settings")}
              className="block w-full text-left px-4 py-2 hover:bg-[#1e293b]"
            >
              Settings
            </button>

            <button
              onClick={logout}
              className="block w-full text-left px-4 py-2 hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNavbar;