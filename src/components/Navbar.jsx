import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="h-16 bg-[#020617] border-b border-gray-800 flex items-center px-6"
    >
      <h1 className="text-xl font-bold">Hosting Platform</h1>
    </motion.div>
  );
};

export default Navbar;