import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.4 }}
      className="glass h-16 border-b border-white/5 flex items-center px-6 sticky top-0 z-40"
    >
      <h1 className="text-xl font-semibold tracking-tight">
        <span className="text-gradient">Hosting</span> Platform
      </h1>
    </motion.div>
  );
};

export default Navbar;
