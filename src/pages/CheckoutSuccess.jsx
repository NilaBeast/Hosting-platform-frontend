import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PaymentAPI } from "../api/api";

const CheckoutSuccess = () => {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | failed
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const gateway = String(params.get("gateway") || "").toLowerCase();

    if (gateway === "payu") {
      const s = String(params.get("status") || "").toLowerCase();
      if (s === "success") setStatus("success");
      else {
        setStatus("failed");
        setDetails("Payment failed");
      }
      return;
    }

    setStatus("success");
  }, [params]);

  return (
    <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <div className="text-6xl mb-4">🚀</div>
        {status === "loading" ? (
          <>
            <h1 className="text-3xl font-bold">Verifying Payment...</h1>
            <p className="text-gray-400 mt-2">Please wait</p>
          </>
        ) : status === "success" ? (
          <>
            <h1 className="text-3xl font-bold">Order Successful!</h1>
            <p className="text-gray-400 mt-2">Your service is ready</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold">Payment Failed</h1>
            <p className="text-gray-400 mt-2">
              {details || "Please try again"}
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;
