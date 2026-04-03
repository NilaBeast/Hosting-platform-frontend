import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../../api/api";

const AdminBilling = () => {
  const location = useLocation();

  const isTransactions =
    location.pathname === "/admin/billing";

  const isInvoices =
    location.pathname === "/admin/invoices";

  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const loadTransactions = async () => {
    const res = await API.get("api/admin/billing/transactions");
    setTransactions(res.data);
  };

  const loadInvoices = async () => {
    const res = await API.get("api/invoices");
    setInvoices(res.data);
  };

  useEffect(() => {
    if (isTransactions) {
      loadTransactions();
    }

    if (isInvoices) {
      loadInvoices();
    }
  }, [location.pathname]);

  return (
    <div className="text-white">
      <h1 className="text-3xl mb-6">
        {isTransactions ? "All Transactions" : "Invoices"}
      </h1>

      {/* ================= TRANSACTIONS ================= */}
      {isTransactions && (
        <table className="w-full bg-[#0f172a] rounded-lg">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-3">User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Payment ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((t) => (
              <tr
                key={t.id}
                className="text-center border-b border-gray-800"
              >
                <td>{t.User?.id}</td>
                <td>{t.User?.name}</td>
                <td>{t.User?.email}</td>
                <td>{t.Plan?.name}</td>
                <td>{t.payment_id}</td>
                <td>₹{t.payment_amount}</td>
                <td>
                  <span
                    className={
                      t.payment_status === "success"
                        ? "text-green-400"
                        : t.payment_status === "failed"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }
                  >
                    {t.payment_status || "pending"}
                  </span>
                </td>
                <td>
                  {new Date(t.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ================= INVOICES ================= */}
      {isInvoices && (
        <table className="w-full bg-[#0f172a] rounded-lg">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-3">Invoice #</th>
              <th>User</th>
              <th>Email</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Download</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                className="text-center border-b border-gray-800"
              >
                <td>{inv.invoice_number}</td>
                <td>{inv.User?.name}</td>
                <td>{inv.email}</td>
                <td>₹{inv.amount}</td>
                <td className="text-green-400">{inv.status}</td>
                <td>
                  {new Date(inv.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <a
                    href={`http://localhost:5000/${inv.pdf_path}`}
                    target="_blank"
                    className="bg-blue-600 px-3 py-1 rounded"
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminBilling;