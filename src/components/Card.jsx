import { motion } from "framer-motion";

const Card = ({ title, value }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-[#020617] p-6 rounded-xl shadow"
    >
      <h2>{title}</h2>
      <p className="text-3xl mt-2">{value}</p>
    </motion.div>
  );
};

export default Card;