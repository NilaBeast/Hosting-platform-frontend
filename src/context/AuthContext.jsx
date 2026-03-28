import { createContext, useState, useEffect } from "react";
import API from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const res = await API.get("api/user/profile");
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem("token");
        }
      }

      setLoading(false);
    };

    init();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/register";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};