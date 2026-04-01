import { useEffect, useState } from "react";
import API from "../../api/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    API.get("/api/admin/dashboard").then((res) => {
      setStats(res.data);
    });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-green-500 p-6 rounded-lg">
          Pending Orders
          <div className="text-3xl">{stats.pendingOrders || 0}</div>
        </div>

        <div className="bg-pink-500 p-6 rounded-lg">
          Tickets Waiting
          <div className="text-3xl">{stats.ticketsWaiting || 0}</div>
        </div>

        <div className="bg-yellow-500 p-6 rounded-lg">
          Pending Cancellation
          <div className="text-3xl">{stats.pendingCancellation || 0}</div>
        </div>

        <div className="bg-cyan-500 p-6 rounded-lg">
          Pending Module Actions
          <div className="text-3xl">{stats.moduleActions || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;