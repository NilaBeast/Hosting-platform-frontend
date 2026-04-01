import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Plans from "./pages/Plans";
import Hosting from "./pages/Hosting";
import Domains from "./pages/Domains";
import Deploy from "./pages/Deploy";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import OAuthSuccess from "./pages/OAuthSuccess";
import AdminProfile from "./admin/pages/AdminProfile";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import AdminLayout from "./admin/components/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminUsers from "./admin/pages/AdminUsers";

import { Toaster } from "react-hot-toast";

/* ===============================
   AUTH CHECK
================================ */
function getUser() {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

function Protected() {
  const token = localStorage.getItem("token");
  return token ? <Outlet /> : <Navigate to="/login" />;
}

function AdminProtected() {
  const token = localStorage.getItem("token");
  const user = getUser();

  if (!token) return <Navigate to="/login" />;
  if (!user || user.role !== "admin") return <Navigate to="/" />;

  return <Outlet />;
}

function Public() {
  const token = localStorage.getItem("token");
  const user = getUser();

  if (token && user) {
    if (user.role === "admin") return <Navigate to="/admin" />;
    return <Navigate to="/" />;
  }

  return <Outlet />;
}

/* ===============================
   USER LAYOUT
================================ */
function Layout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
}

/* ===============================
   APP
================================ */
function App() {
  return (
    <BrowserRouter>
      <Toaster />

      <Routes>
        {/* Public */}
        <Route element={<Public />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="/oauth-success" element={<OAuthSuccess />} />

        {/* Admin Routes */}
        <Route element={<AdminProtected />}>
  <Route element={<AdminLayout />}>
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/users" element={<AdminUsers />} />
    <Route path="/admin/profile" element={<AdminProfile />} />
  </Route>
</Route>

        {/* User Routes */}
        <Route element={<Protected />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/hosting" element={<Hosting />} />
            <Route path="/domains" element={<Domains />} />
            <Route path="/deploy" element={<Deploy />} />
            <Route path="/settings" element={<Settings />} />
            
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;