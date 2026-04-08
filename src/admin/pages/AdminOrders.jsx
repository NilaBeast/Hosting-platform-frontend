import { useEffect, useState } from "react";
import { AdminAPI, PlanAPI, AdminOrderAPI, PaymentAPI } from "../../api/api";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

const AdminOrders = () => {
  const location = useLocation();

  // 🔥 Detect route
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

      const sessionId = res.data.payment_session_id;
      const orderId = res.data.order_id;

      const cashfree = window.Cashfree({ mode: "sandbox" });

      cashfree
        .checkout({
          paymentSessionId: sessionId,
          redirectTarget: "_modal",
        })
        .then(async () => {
          const verify = await PaymentAPI.verifyPayment({ orderId });

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
     REGISTER DOMAIN
  ================================= */
  const registerDomain = async (id) => {
  try {
    const res = await AdminOrderAPI.registerDomain(id);

    toast.success(res.data?.message || "Domain Registered");

    // 🔥 FORCE REFRESH STATE PROPERLY
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, domain_status: "registered" }
          : o
      )
    );

  } catch (err) {
    console.log(err);
  }
};

  /* ===============================
     FILTER LOGIC (IMPORTANT FIX)
  ================================= */

  // ✅ Only pending → New Orders page
  const newOrders = orders.filter((o) => o.status === "pending");

  // ✅ Only completed → All Orders page
  const allOrders = orders.filter((o) => o.status === "active");

  const displayOrders = isNewOrderPage ? newOrders : allOrders;

  return (
    <div className="text-white p-6">
      <h1 className="text-3xl mb-6">
        {isNewOrderPage ? "New Orders" : "All Orders"}
      </h1>

      {/* ===============================
          CREATE ORDER (ONLY NEW PAGE)
      ============================== */}
      {isNewOrderPage && (
        <div className="bg-[#0f172a] p-6 rounded-xl w-96 mb-8">
          <select
            className="w-full p-2 mb-3 bg-[#020617]"
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
            className="w-full p-2 mb-3 bg-[#020617]"
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
            className="w-full p-2 mb-3 bg-[#020617]"
            placeholder="Domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />

          <button
            onClick={createOrder}
            className="bg-blue-600 px-4 py-2 rounded w-full"
          >
            Create Order & Pay
          </button>
        </div>
      )}

      {/* ===============================
          ORDERS TABLE
      ============================== */}
      <table className="w-full bg-[#0f172a] rounded-lg">
        <thead>
          <tr className="border-b border-gray-700">
            <th>User</th>
            <th>Plan</th>
            <th>Domain</th>
            <th>Total</th>
            <th>Status</th>
            <th>Domain</th>
          </tr>
        </thead>

        <tbody>
          {displayOrders.map((o) => (
            <tr key={o.id} className="text-center border-b border-gray-800">
              <td>{o.User?.email}</td>
              <td>{o.Plan?.name}</td>
              <td>{o.domain}</td>
              <td>₹{o.total_price}</td>

              {/* STATUS */}
              <td>
                {o.status === "active" ? (
                  <span className="text-green-400">Active</span>
                ) : (
                  <span className="text-yellow-400">Pending</span>
                )}
              </td>

              {/* DOMAIN STATUS FIX */}
              <td>
                {o.domain_status === "registered" ? (
                  <span className="text-green-400 font-semibold">
                    Successful
                  </span>
                ) : (
                  <button
                    onClick={() => registerDomain(o.id)}
                    className="bg-yellow-500 px-2 py-1 rounded"
                  >
                    Transfer
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrders;