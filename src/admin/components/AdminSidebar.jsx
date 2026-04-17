import { Link, useLocation } from "react-router-dom";

const AdminSidebar = () => {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `block px-3 py-2 rounded-lg transition ${
      pathname === path
        ? "bg-purple-600 text-white"
        : "hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <div className="w-64 min-h-screen bg-gradient-to-b from-[#020617] to-[#0f172a] p-6 border-r border-gray-800">
      <h1 className="text-2xl font-bold mb-10 text-white">
        Admin Panel
      </h1>

      <div className="space-y-8 text-gray-300 text-sm">

        {/* CLIENTS */}
        <div>
          <p className="text-gray-500 mb-2 uppercase text-xs tracking-wide">
            Clients
          </p>
          <Link to="/admin/users" className={linkClass("/admin/users")}>
            All Users
          </Link>
          <Link to="/admin/add-user" className={linkClass("/admin/add-user")}>
            Add Users
          </Link>
        </div>

        {/* ORDERS */}
        <div>
          <p className="text-gray-500 mb-2 uppercase text-xs tracking-wide">
            Orders
          </p>
          <Link to="/admin/orders" className={linkClass("/admin/orders")}>
            All Orders
          </Link>
          <Link to="/admin/new-order" className={linkClass("/admin/new-order")}>
            New Orders
          </Link>
        </div>

        {/* DOMAIN (🔥 NEW) */}
        <div>
          <p className="text-gray-500 mb-2 uppercase text-xs tracking-wide">
            Domains
          </p>
          <Link
            to="/admin/domain-pricing"
            className={linkClass("/admin/domain-pricing")}
          >
            Domain Pricing
          </Link>
        </div>

        {/* BILLING */}
        <div>
          <p className="text-gray-500 mb-2 uppercase text-xs tracking-wide">
            Billing
          </p>
          <Link to="/admin/billing" className={linkClass("/admin/billing")}>
            Transactions
          </Link>
          <Link to="/admin/invoices" className={linkClass("/admin/invoices")}>
            Invoices
          </Link>
        </div>

        {/* SUPPORT */}
        <div>
          <p className="text-gray-500 mb-2 uppercase text-xs tracking-wide">
            Support
          </p>
          <Link to="/admin/tickets" className={linkClass("/admin/tickets")}>
            Tickets
          </Link>
          <Link to="/admin/open-ticket" className={linkClass("/admin/open-ticket")}>
            Open Ticket
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AdminSidebar;