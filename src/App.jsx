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
import { CheckoutProvider } from "./context/CheckoutContext";
import CheckoutConfig from "./pages/CheckoutConfig";
import CheckoutReview from "./pages/CheckoutReview";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import ProductPage from "./pages/ProductPage";

import Support from "./pages/Support";
import UserTickets from "./pages/UserTickets";
import UserTicketDetails from "./pages/UserTicketDetails";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import AdminLayout from "./admin/components/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminBilling from "./admin/pages/AdminBilling";
import AdminDomain from "./admin/pages/AdminDomain";
import { Toaster } from "react-hot-toast";
import AdminSettings from "./admin/pages/AdminSettings";
import AdminProductEdit from "./admin/pages/AdminProductEdit";
import AdminTickets from "./admin/pages/AdminTickets";
import AdminOpenTicket from "./admin/pages/AdminOpenTicket";
import AdminTicketDetails from "./admin/pages/AdminTicketDetails";
import AdminAccounts from "./admin/pages/AdminAccounts";
import AdminUserDetails from "./admin/pages/AdminUserDetails";
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
    <CheckoutProvider>
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
    <Route path="/admin/add-user" element={<AdminUsers />} />
    <Route path="/admin/users/:id" element={<AdminUserDetails />} />
    <Route path="/admin/profile" element={<AdminProfile />} />
    <Route path="/admin/orders" element={<AdminOrders />} />
    <Route path="/admin/new-order" element={<AdminOrders />} />
    <Route path="/admin/billing" element={<AdminBilling />} />
    <Route path="/admin/invoices" element={<AdminBilling />} />
    <Route path="/admin/settings" element={<AdminSettings />} />
    <Route path="/admin/product/:id" element={<AdminProductEdit />} />
    <Route path="/admin/tickets" element={<AdminTickets />} />
    <Route path="/admin/open-ticket" element={<AdminOpenTicket />} />
    <Route path="/admin/tickets/:id" element={<AdminTicketDetails />} />
    <Route path="/admin/accounts" element={<AdminAccounts />} />

    {/* 🔥 NEW ROUTE */}
    <Route path="/admin/domain-pricing" element={<AdminDomain />} />
  </Route>
</Route>

        {/* User Routes */}
        <Route element={<Protected />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/store/:groupSlug" element={<Plans />} />
            <Route
  path="/store/:groupSlug/:productSlug"
  element={<Plans />}
/>
            <Route path="/hosting" element={<Hosting />} />
            <Route path="/domains" element={<Domains />} />
            <Route path="/deploy" element={<Deploy />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/checkout/config" element={<CheckoutConfig />} />
          <Route path="/checkout/review" element={<CheckoutReview />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/support" element={<Support />} />
          <Route path="/tickets" element={<UserTickets />} />
<Route path="/tickets/:id" element={<UserTicketDetails />} />
          </Route>
        </Route>
      </Routes>
      </CheckoutProvider>
    </BrowserRouter>
  );
}

export default App;
