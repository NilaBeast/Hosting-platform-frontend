import { useEffect, useState } from "react";
import API from "../../api/api";
import Card from "../../components/Card";
import { motion } from "framer-motion";
import { Activity, Clock, CreditCard, Users } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    API.get("/api/admin/dashboard").then((res) => {
      setStats(res.data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.35 }}
        className="glass rounded-2xl p-6"
      >
        <div className="text-sm text-slate-300">Admin</div>
        <div className="mt-1 text-3xl font-semibold tracking-tight">
          <span className="text-gradient">Dashboard</span>
        </div>
        <div className="mt-2 text-slate-300 text-sm">
          Live snapshot of platform activity.
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card
          title="Pending Orders"
          value={stats.pendingOrders || 0}
          icon={CreditCard}
          accent="from-emerald-500/20 via-cyan-500/10 to-violet-500/15"
        />
        <Card
          title="Tickets Waiting"
          value={stats.ticketsWaiting || 0}
          icon={Activity}
          accent="from-violet-500/25 via-cyan-500/10 to-emerald-500/10"
        />
        <Card
          title="Pending Cancellation"
          value={stats.pendingCancellation || 0}
          icon={Clock}
          accent="from-amber-500/20 via-violet-500/10 to-cyan-500/10"
        />
        <Card
          title="Users"
          value={stats.users || 0}
          icon={Users}
          accent="from-cyan-500/25 via-emerald-500/10 to-violet-500/15"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
