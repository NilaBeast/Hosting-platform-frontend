import { Link } from "react-router-dom";

const AdminSidebar = () => {
  return (
    <div className="w-64 bg-[#020617] p-6 border-r border-gray-800">
      <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>

      <div className="space-y-6 text-gray-300">

        <div>
          <p className="text-gray-500 mb-2">Clients</p>
          <Link to="/admin/users" className="block hover:text-white">All Users</Link>
          <Link to="/admin/add-user" className="block hover:text-white">Add Users</Link>
        </div>

        <div>
          <p className="text-gray-500 mb-2">Orders</p>
          <Link to="/admin/orders" className="block hover:text-white">All Orders</Link>
          <Link to="/admin/new-order" className="block hover:text-white">New Orders</Link>
        </div>

        <div>
          <p className="text-gray-500 mb-2">Billing</p>
          <Link to="/admin/billing" className="block hover:text-white">All Transactions</Link>
          <Link to="/admin/invoices" className="block hover:text-white">Invoices</Link>
        </div>

        <div>
          <p className="text-gray-500 mb-2">Support</p>
          <Link to="/admin/tickets" className="block hover:text-white">All Tickets</Link>
          <Link to="/admin/open-ticket" className="block hover:text-white">Open Ticket</Link>
        </div>

      </div>
    </div>
  );
};

export default AdminSidebar;