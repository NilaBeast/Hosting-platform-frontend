import { useEffect, useState } from "react";
import {
  AdminAPI,
  AdminOrderAPI,
  PaymentAPI,
  DomainSearchAPI,
  AdminProductAPI,
} from "../../api/api";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

const AdminOrders = () => {
  const location = useLocation();
  const isNewOrderPage = location.pathname === "/admin/new-order";

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  const [groups, setGroups] = useState([]);
  const [products, setProducts] = useState([]);

  const [groupId, setGroupId] = useState("");
  const [productId, setProductId] = useState("");

  const [userId, setUserId] = useState("");
  const [domain, setDomain] = useState("");

  const [domainStatus, setDomainStatus] = useState(null);
  const [checking, setChecking] = useState(false);

  const [billingCycle, setBillingCycle] = useState("");
const [selectedProduct, setSelectedProduct] = useState(null);
const [productPrice, setProductPrice] = useState(0);

  /* ===============================
     LOAD ORDERS
  ============================== */
  const loadOrders = async () => {
    try {
      const res = await AdminOrderAPI.getOrders();
      setOrders(res.data);
    } catch {
      toast.error("Failed to load orders");
    }
  };

  /* ===============================
     LOAD FORM DATA
  ============================== */
  const loadFormData = async () => {
    try {
      const [u, g] = await Promise.all([
        AdminAPI.getUsers(),
        AdminProductAPI.getGroups(),
      ]);

      setUsers(u.data || []);
      setGroups(g.data || []);
    } catch {
      toast.error("Failed to load form data");
    }
  };

  useEffect(() => {
    loadOrders();
    if (isNewOrderPage) loadFormData();
  }, [location.pathname]);

  /* ===============================
     GROUP CHANGE
  ============================== */
  const handleGroupChange = async (id) => {
    setGroupId(id);
    setProductId("");
    setProducts([]);

    if (!id) return;

    try {
      const res = await AdminProductAPI.getProductsByGroup(id);
      setProducts(res.data || []);
    } catch {
      toast.error("Failed to load products");
    }
  };

  /* ===============================
     DOMAIN CHECK
  ============================== */
  const checkDomain = async () => {
    if (!domain) return toast.error("Enter domain");

    try {
      setChecking(true);

      const res = await DomainSearchAPI.checkDomain(domain);

      if (res.data.available) {
        setDomainStatus("available");
        toast.success("Domain is available");
      } else {
        setDomainStatus("unavailable");
        toast.error("Domain already taken");
      }
    } catch {
      toast.error("Check failed");
    } finally {
      setChecking(false);
    }
  };

  /* ===============================
     CREATE ORDER (🔥 FIXED)
  ============================== */
  const createOrder = async () => {
    try {
      if (!userId || !productId || !domain || !billingCycle) {
  return toast.error("All fields required");
}

      if (domainStatus !== "available") {
        return toast.error("Check domain availability first");
      }

      const res = await AdminOrderAPI.createOrder({
  user_id: userId,
  product_id: productId,
  domain,
  billing_cycle: billingCycle, // ✅ NEW
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
     REGISTER DOMAIN
  ============================== */
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
      
      <h1 className="text-4xl font-bold mb-8 tracking-tight">
        {isNewOrderPage ? "New Orders" : "All Orders"}
      </h1>

      {isNewOrderPage && (
        <div className="bg-white/5 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 mb-10 w-full max-w-md shadow-lg">

          <h2 className="text-xl mb-4 font-semibold">Create Order</h2>

          <div className="space-y-3">

            {/* USER */}
            <select
              className="w-full p-3 rounded-lg bg-black/40 border border-gray-700"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              <option value="">Select User</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email}
                </option>
              ))}
            </select>

            {/* GROUP */}
            <div className="space-y-5">

  {/* ================= GROUP ================= */}
  <div>
    <label className="text-sm text-gray-400 mb-1 block">Product Group</label>
    <select
      className="w-full p-3 rounded-xl bg-black/40 border border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none transition"
      value={groupId}
      onChange={(e) => handleGroupChange(e.target.value)}
    >
      <option value="">Select Group</option>
      {groups.map((g) => (
        <option key={g.id} value={g.id}>
          {g.name}
        </option>
      ))}
    </select>
  </div>

  {/* ================= PRODUCT ================= */}
  <div>
    <label className="text-sm text-gray-400 mb-1 block">Product</label>

    <select
      className="w-full p-3 rounded-xl bg-black/40 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
      value={productId}
      onChange={(e) => {
        const id = e.target.value;
        setProductId(id);

        const p = products.find((x) => x.id == id);

        let parsedPricing = {};
        try {
          parsedPricing =
            typeof p?.pricing_json === "string"
              ? JSON.parse(p.pricing_json)
              : p?.pricing_json || {};
        } catch {
          parsedPricing = {};
        }

        setSelectedProduct({
          ...p,
          pricing_json: parsedPricing,
        });

        setBillingCycle("");
        setProductPrice(0);
      }}
      disabled={!groupId}
    >
      <option value="">Select Product</option>
      {products.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  </div>

  {/* ================= BILLING ================= */}
  {selectedProduct &&
    selectedProduct.pricing_json?.INR && (
      <div>
        <label className="text-sm text-gray-400 mb-2 block">
          Billing Cycle
        </label>

        <div className="grid grid-cols-2 gap-3">

          {Object.keys(selectedProduct.pricing_json.INR).map((key) => {
            const data = selectedProduct.pricing_json.INR[key];
            if (!data?.enabled) return null;

            const isActive = billingCycle === key;

            return (
              <div
                key={key}
                onClick={() => {
                  setBillingCycle(key);
                  setProductPrice(Number(data.price) || 0);
                }}
                className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 
                ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 border-transparent shadow-lg scale-[1.02]"
                    : "bg-black/40 border-gray-700 hover:border-purple-500"
                }`}
              >
                <p className="text-sm text-gray-300 capitalize">{key}</p>
                <p className="text-xl font-bold mt-1">
                  ₹{Number(data.price) || 0}
                </p>

                {isActive && (
                  <p className="text-xs text-green-300 mt-1">
                    ✔ Selected
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    )}

  {/* ================= PRICE DISPLAY ================= */}
  {productPrice > 0 && (
    <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl">
      <p className="text-sm text-gray-400">Selected Plan Price</p>
      <p className="text-2xl font-bold text-green-400">
        ₹{productPrice}
      </p>
    </div>
  )}

</div>

            {/* DOMAIN */}
            <div className="flex gap-2">
              <input
                className="w-full p-3 rounded-lg bg-black/40 border border-gray-700"
                placeholder="example.com"
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  setDomainStatus(null);
                }}
              />

              <button
                onClick={checkDomain}
                className="bg-blue-600 px-4 rounded-lg"
              >
                {checking ? "..." : "Check"}
              </button>
            </div>

            {domainStatus === "available" && (
              <p className="text-green-400 text-sm">✔ Available</p>
            )}
            {domainStatus === "unavailable" && (
              <p className="text-red-400 text-sm">✖ Not Available</p>
            )}

            <button
              onClick={createOrder}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg"
            >
              Create Order & Pay
            </button>

          </div>
        </div>
      )}

      {/* ===============================
          HOSTING ORDERS (UNCHANGED)
      ============================== */}
      <h2 className="text-2xl font-semibold mb-4">Hosting Orders</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {hostingOrders.map((o) => (
          <div key={o.id} className="bg-white/5 border border-gray-700 rounded-2xl p-5">
            <p>{o.domain}</p>
            <p>{o.Product?.name}</p>
          </div>
        ))}
      </div>

      {/* ===============================
          DOMAIN ORDERS (UNCHANGED)
      ============================== */}
    </div>
  );
};

export default AdminOrders;