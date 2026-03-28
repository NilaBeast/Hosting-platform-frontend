import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Plans from "./pages/Plans";
import Hosting from "./pages/Hosting";
import Domains from "./pages/Domains";
import Deploy from "./pages/Deploy";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import OAuthSuccess from "./pages/OAuthSuccess";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";

function Protected({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/register" />;
}

function Public({ children }) {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/" /> : children;
}

function Layout({ children }) {
  const location = useLocation();

  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className="flex">
      {!hideLayout && <Sidebar />}
      <div className="flex-1">
        {!hideLayout && <Navbar />}
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Layout>
        <Routes>
          <Route
            path="/login"
            element={
              <Public>
                <Login />
              </Public>
            }
          />

          <Route
            path="/register"
            element={
              <Public>
                <Register />
              </Public>
            }
          />

          <Route path="/oauth-success" element={<OAuthSuccess />} />

          <Route
            path="/"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />

          <Route
            path="/plans"
            element={
              <Protected>
                <Plans />
              </Protected>
            }
          />

          <Route
            path="/hosting"
            element={
              <Protected>
                <Hosting />
              </Protected>
            }
          />

          <Route
            path="/domains"
            element={
              <Protected>
                <Domains />
              </Protected>
            }
          />

          <Route
            path="/deploy"
            element={
              <Protected>
                <Deploy />
              </Protected>
            }
          />

          <Route
            path="/settings"
            element={
              <Protected>
                <Settings />
              </Protected>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;