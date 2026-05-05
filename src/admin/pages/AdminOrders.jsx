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
import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, ShieldCheck } from "lucide-react";

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
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [gateway, setGateway] = useState("razorpay");
  const [paying, setPaying] = useState(false);

  const gateways = [
    {
      id: "razorpay",
      title: "Razorpay",
      subtitle: "UPI / Cards / Netbanking",
      Icon: ShieldCheck,
    },
    {
      id: "payu",
      title: "PayU",
      subtitle: "Cards / UPI / Wallets",
      Icon: CreditCard,
    },
  ];

  const formatPaymentMethod = (value) => {
    const raw = value == null ? "" : String(value);
    const v = raw.trim();
    if (!v) return "-";
    if (v.toLowerCase() === "cashfree") return "RAZORPAY";
    return v.toUpperCase();
  };

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
  const submitPayU = (actionUrl, fields) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = actionUrl;
    form.style.display = "none";
    for (const [k, v] of Object.entries(fields || {})) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = v == null ? "" : String(v);
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  };

  const validateForm = () => {
    if (!userId || !productId || !domain || !billingCycle) {
      toast.error("All fields required");
      return false;
    }
    if (domainStatus !== "available") {
      toast.error("Check domain availability first");
      return false;
    }
    if (!productPrice) {
      toast.error("Select billing cycle");
      return false;
    }
    return true;
  };

  const createOrderAndPay = async (selectedGateway) => {
    if (paying) return;
    if (!validateForm()) return;
    setPaying(true);
    try {
      const res = await PaymentAPI.createOrder({
        productId: productId,
        domain,
        userId: userId,
        gateway: selectedGateway,
        config: {
          currency: "INR",
          price: productPrice,
          cycle: billingCycle,
        },
      });

      if (res.data?.gateway === "payu") {
        submitPayU(res.data.actionUrl, res.data.fields);
        return;
      }

      const key = res.data.razorpay_key_id;
      const orderId = res.data.razorpay_order_id;
      if (!window.Razorpay) throw new Error("Razorpay SDK not loaded");

      const rzp = new window.Razorpay({
        key,
        order_id: orderId,
        amount: res.data.amount,
        currency: res.data.currency || "INR",
        name: "Techzuno Hosting",
        description: `Hosting purchase (${domain || "Hosting"})`,
        handler: async (response) => {
          const verify = await PaymentAPI.verifyPayment({
            gateway: "razorpay",
            ...response,
          });
          if (verify.data.success) {
            window.location.href = "/checkout/success";
          }
        },
        theme: { color: "#16a34a" },
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Payment order failed");
    } finally {
      setPaying(false);
      setGatewayOpen(false);
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

  const newOrders = orders.filter(
    (o) =>
      String(o.status || "").toLowerCase() === "pending" ||
      String(o.payment_status || "").toLowerCase() === "pending"
  );

  const displayOrders = isNewOrderPage ? newOrders : orders;

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
              onClick={() => {
                if (!validateForm()) return;
                setGatewayOpen(true);
              }}
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
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold">{o.domain || "-"}</div>
              <div className="text-xs text-slate-300">
                {formatPaymentMethod(o.payment_method || o.payment_gateway)}
              </div>
            </div>
            <div className="mt-2 text-sm text-slate-300">
              {o.User?.email || "-"}
            </div>
            <div className="mt-1 text-sm">
              {o.Plan?.name || "Hosting"}
            </div>
            <div className="mt-2 text-xs text-slate-300">
              Status: {o.payment_status || o.status || "-"}
            </div>
          </div>
        ))}
      </div>

      {/* ===============================
          DOMAIN ORDERS (UNCHANGED)
      ============================== */}
      <h2 className="text-2xl font-semibold mb-4 mt-10">Domain Orders</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {domainOrders.map((o) => (
          <div
            key={o.id}
            className="bg-white/5 border border-gray-700 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold">{o.domain || "-"}</div>
              <div className="text-xs text-slate-300">
                {formatPaymentMethod(o.payment_method || o.payment_gateway)}
              </div>
            </div>
            <div className="mt-2 text-sm text-slate-300">
              {o.User?.email || "-"}
            </div>
            <div className="mt-1 text-sm">
              Total: ₹{Number(o.total_price || 0).toFixed(2)}
            </div>
            <div className="mt-2 text-xs text-slate-300">
              Status: {o.payment_status || o.status || "-"}
            </div>
            <div className="mt-1 text-xs text-slate-300">
              Domain Status: {o.domain_status || "-"}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {gatewayOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => (paying ? null : setGatewayOpen(false))}
            />

            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24, mass: 0.35 }}
              className="relative w-full max-w-xl glass rounded-2xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-slate-300">Select Payment Gateway</div>
                  <div className="mt-1 text-2xl font-semibold tracking-tight">
                    Pay ₹{Number(productPrice || 0).toFixed(2)}
                  </div>
                  <div className="mt-1 text-sm text-slate-300">{domain || "-"}</div>
                </div>
                <button
                  className="text-slate-300 hover:text-white transition"
                  onClick={() => (paying ? null : setGatewayOpen(false))}
                >
                  Close
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gateways.map(({ id, title, subtitle, Icon }) => {
                  const active = gateway === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setGateway(id)}
                      className={`text-left rounded-2xl p-4 transition ring-soft ${
                        active
                          ? "bg-gradient-to-br from-violet-600/40 to-cyan-500/20"
                          : "bg-white/5 hover:bg-white/7"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-lg font-semibold">{title}</div>
                          <div className="text-sm text-slate-300">{subtitle}</div>
                        </div>
                        <div className="glass-soft rounded-xl p-3">
                          <Icon className="h-5 w-5 text-slate-100" />
                        </div>
                      </div>
                      {active ? (
                        <div className="mt-3 text-xs text-emerald-200">Selected</div>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  disabled={paying}
                  onClick={() => createOrderAndPay(gateway)}
                  className="flex-1 btn-glow bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                  {paying ? "Processing..." : "Proceed"}
                </button>
                <button
                  disabled={paying}
                  onClick={() => setGatewayOpen(false)}
                  className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
