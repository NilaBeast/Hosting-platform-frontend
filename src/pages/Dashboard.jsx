import Card from "../components/Card";
import { motion } from "framer-motion";
import { Globe, Server, Upload } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.35 }}
        className="glass rounded-2xl p-6 mb-6"
      >
        <div className="text-sm text-slate-300">Overview</div>
        <div className="mt-1 text-3xl font-semibold tracking-tight">
          Welcome back, <span className="text-gradient">Dashboard</span>
        </div>
        <div className="mt-2 text-slate-300 text-sm max-w-2xl">
          Manage hosting, domains, deployments, and support from one place.
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Websites" value="2" icon={Globe} />
        <Card title="Active Hosting" value="1" icon={Server} accent="from-cyan-500/25 via-violet-500/10 to-emerald-500/10" />
        <Card title="Deployments" value="3" icon={Upload} accent="from-emerald-500/20 via-cyan-500/10 to-violet-500/15" />
      </div>
    </div>
  );
};

export default Dashboard;
