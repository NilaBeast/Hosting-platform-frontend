import { useEffect, useState } from "react";
import { AdminAPI, PlanAPI, AdminOrderAPI, PaymentAPI } from "../../api/api";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

const AdminOrders = () => {
  const location = useLocation();
  const isNewOrderPage = location.pathname === "/admin/new-order";

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);

  const [userId, setUserId] = useState("");
  const [planId, setPlanId] = useState("");
  const [domain, setDomain] = useState("");

  const loadOrders = () => {
    AdminOrderAPI.getOrders().then((res) => setOrders(res.data));
  };

  const loadFormData = () => {
    AdminAPI.getUsers().then((res) => setUsers(res.data));
    PlanAPI.getPlans().then((res) => setPlans(res.data));
  };

  useEffect(() => {
    loadOrders();
    if (isNewOrderPage) loadFormData();
  }, [location.pathname]);

  /* ===============================
     CREATE ORDER
  ================================= */
  const createOrder = async () => {
    try {
      if (!userId || !planId || !domain) {
        return toast.error("All fields required");
      }

      const res = await AdminOrderAPI.createOrder({
        user_id: userId,
        plan_id: planId,
        domain,
      });

      const cashfree = window.Cashfree({ mode: "sandbox" });

      cashfree.checkout({
        paymentSessionId: res.data.payment_session_id,
        redirectTarget: "_modal",
      }).then(async () => {
        const verify = await PaymentAPI.verifyPayment({
          orderId: res.data.order_id,
        });

        if (verify.data.success) {
          toast.success("Payment Successful");
          loadOrders();
        } else {
          toast.error("Payment Failed");
        }
      });
    } catch {
      toast.error("Order creation failed");
    }
  };

  /* ===============================
     REGISTER / TRANSFER DOMAIN
  ================================= */
  const registerDomain = async (id, domain) => {
    try {
      const res = await AdminOrderAPI.registerDomain(id, domain);
      toast.success(res.data?.message || "Done");

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, domain_status: "registered" } : o
        )
      );
    } catch {
      toast.error("Failed");
    }
  };

  const newOrders = orders.filter((o) => o.status === "pending");
  const allOrders = orders.filter((o) => o.status === "active");

  const displayOrders = isNewOrderPage ? newOrders : allOrders;

  const hostingOrders = displayOrders.filter((o) => o.type === "hosting");
  const domainOrders = displayOrders.filter((o) => o.type === "domain");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] text-white p-8">
      {/* HEADER */}
      <h1 className="text-4xl font-bold mb-8 tracking-tight">
        {isNewOrderPage ? "New Orders" : "All Orders"}
      </h1>

      {/* ===============================
          CREATE ORDER (MODERN CARD)
      ============================== */}
      {isNewOrderPage && (
        <div className="bg-white/5 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 mb-10 w-full max-w-md shadow-lg">
          <h2 className="text-xl mb-4 font-semibold">Create Order</h2>

          <div className="space-y-3">
            <select
              className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setUserId(e.target.value)}
            >
              <option>Select User</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email}
                </option>
              ))}
            </select>

            <select
              className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setPlanId(e.target.value)}
            >
              <option>Select Plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <input
              className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />

            <button
              onClick={createOrder}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition p-3 rounded-lg font-medium shadow-lg"
            >
              Create Order & Pay
            </button>
          </div>
        </div>
      )}

      {/* ===============================
          HOSTING ORDERS
      ============================== */}
      <h2 className="text-2xl font-semibold mb-4">Hosting Orders</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {hostingOrders.map((o) => (
          <div
            key={o.id}
            className="bg-white/5 border border-gray-700 rounded-2xl p-5 backdrop-blur-xl hover:scale-[1.02] transition duration-300 shadow-md"
          >
            <div className="mb-3">
              <p className="text-sm text-gray-400">Domain</p>
              <p className="text-lg font-semibold">{o.domain}</p>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-400">Plan</p>
              <p>{o.Plan?.name}</p>
            </div>

            <div className="flex justify-between items-center">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  o.status === "active"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {o.status}
              </span>

              {o.domain_status !== "registered" && (
                <button
                  onClick={() => registerDomain(o.id, o.domain)}
                  className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-lg text-sm transition"
                >
                  Register
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ===============================
          DOMAIN ORDERS
      ============================== */}
      <h2 className="text-2xl font-semibold mt-12 mb-4">Domain Orders</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {domainOrders.map((o) => (
          <div
            key={o.id}
            className="bg-white/5 border border-gray-700 rounded-2xl p-5 backdrop-blur-xl hover:scale-[1.02] transition duration-300 shadow-md"
          >
            <div className="mb-3">
              <p className="text-sm text-gray-400">Domain</p>
              <p className="text-lg font-semibold">{o.domain}</p>
            </div>

            <div className="flex justify-between items-center">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  o.status === "active"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {o.status}
              </span>

              {o.domain_status !== "registered" && (
                <button
                  onClick={() => registerDomain(o.id, o.domain)}
                  className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-lg text-sm transition"
                >
                  Transfer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;