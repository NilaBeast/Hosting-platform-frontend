import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const getStoredUser = () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const user = getStoredUser();

    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("github_token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Admin Panel</h1>

        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* Admin Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-[#0f172a] p-6 rounded-xl">Users</div>
        <div className="bg-[#0f172a] p-6 rounded-xl">Hosting Accounts</div>
        <div className="bg-[#0f172a] p-6 rounded-xl">Domains</div>
        <div className="bg-[#0f172a] p-6 rounded-xl">Deployments</div>
        <div className="bg-[#0f172a] p-6 rounded-xl">WHM Packages</div>
        <div className="bg-[#0f172a] p-6 rounded-xl">Billing</div>
        <div className="bg-[#0f172a] p-6 rounded-xl">Server Stats</div>
        <div className="bg-[#0f172a] p-6 rounded-xl">Settings</div>
      </div>
    </div>
  );
};

export default AdminDashboard;