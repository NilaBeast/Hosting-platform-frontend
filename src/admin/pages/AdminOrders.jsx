import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { OrderAPI, AdminAPI, PlanAPI, PaymentAPI } from "../../api/api";
import toast from "react-hot-toast";

const AdminOrders = () => {
  const location = useLocation();
  const isNewOrder = location.pathname === "/admin/new-order";

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);

  const [userId, setUserId] = useState("");
  const [planId, setPlanId] = useState("");
  const [domain, setDomain] = useState("");

  const loadOrders = () => {
    OrderAPI.getOrders().then((res) => setOrders(res.data));
  };

  const loadFormData = () => {
    AdminAPI.getUsers().then((res) => setUsers(res.data));
    PlanAPI.getPlans().then((res) => setPlans(res.data));
  };

  useEffect(() => {
    if (isNewOrder) {
      loadFormData();
    } else {
      loadOrders();
    }
  }, [location.pathname]);

  const createOrder = async () => {
    try {
      if (!userId || !planId || !domain) {
        return toast.error("All fields required");
      }

      const res = await OrderAPI.createOrder({
        user_id: userId,
        plan_id: planId,
        domain,
      });

      const sessionId = res.data.payment_session_id;
      const orderId = res.data.order_id;

      const cashfree = window.Cashfree({
        mode: "sandbox",
      });

      cashfree
        .checkout({
          paymentSessionId: sessionId,
          redirectTarget: "_modal",
        })
        .then(async () => {
          let attempts = 0;
          let success = false;

          while (attempts < 5 && !success) {
            const verify = await PaymentAPI.verifyPayment({ orderId });

            if (verify.data.success) {
              toast.success("Payment Successful");

              setTimeout(() => {
                toast.success("Account Created Successfully");
              }, 1500);

              loadOrders();
              success = true;
              break;
            }

            attempts++;
            await new Promise((r) => setTimeout(r, 2000));
          }

          if (!success) {
            toast.error("Payment Verification Failed");
          }
        });
    } catch {
      toast.error("Order creation failed");
    }
  };

  return (
    <div className="text-white">
      <h1 className="text-3xl mb-6">
        {isNewOrder ? "Create New Order" : "All Orders"}
      </h1>

      {isNewOrder && (
        <div className="bg-[#0f172a] p-6 rounded-xl w-96">
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

      {!isNewOrder && (
        <table className="w-full bg-[#0f172a] rounded-lg">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-3">User</th>
              <th>Plan</th>
              <th>Domain</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="text-center border-b border-gray-800">
                <td>{o.User?.email}</td>
                <td>{o.Plan?.name}</td>
                <td>{o.domain}</td>
                <td>{o.price}</td>
                <td>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrders;