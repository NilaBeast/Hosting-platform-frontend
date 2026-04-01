import { useState } from "react";
import { motion } from "framer-motion";
import { AuthAPI } from "../api/api";
import toast from "react-hot-toast";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const res = await AuthAPI.register(form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Account created");

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const googleRegister = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      const res = await AuthAPI.firebaseGoogle(token);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Registered with Google");

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error("Google login failed");
    }
  };

  const githubRegister = () => {
    window.location.href = "http://localhost:5000/api/auth/github";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] to-[#0f172a]">
      <div className="absolute w-96 h-96 bg-blue-500 opacity-20 blur-3xl rounded-full top-10 left-10"></div>
      <div className="absolute w-96 h-96 bg-purple-500 opacity-20 blur-3xl rounded-full bottom-10 right-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-2xl shadow-2xl w-[420px]"
      >
        <h1 className="text-3xl font-bold mb-2 text-center">
          Create Account
        </h1>

        <p className="text-gray-400 text-center mb-6">
          Start hosting your websites today
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 rounded-lg bg-[#020617] border border-gray-700"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 rounded-lg bg-[#020617] border border-gray-700"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-[#020617] border border-gray-700"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <motion.button className="w-full bg-blue-600 py-3 rounded-lg">
            {loading ? "Creating Account..." : "Register"}
          </motion.button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-[1px] bg-gray-700"></div>
          <span className="text-gray-400 text-sm">OR</span>
          <div className="flex-1 h-[1px] bg-gray-700"></div>
        </div>

        <motion.button
          onClick={googleRegister}
          className="w-full bg-red-500 py-3 rounded-lg mb-3"
        >
          Continue with Google
        </motion.button>

        <motion.button
          onClick={githubRegister}
          className="w-full bg-gray-800 py-3 rounded-lg"
        >
          Continue with GitHub
        </motion.button>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400">
            Login
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;