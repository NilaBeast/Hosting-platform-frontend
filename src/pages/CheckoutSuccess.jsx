import { motion } from "framer-motion";

const CheckoutSuccess = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <div className="text-6xl mb-4">🚀</div>
        <h1 className="text-3xl font-bold">Order Successful!</h1>
        <p className="text-gray-400 mt-2">
          Your service is ready
        </p>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;