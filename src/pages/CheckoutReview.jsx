import { useCheckout } from "../context/CheckoutContext";
import { PaymentAPI } from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";

const CheckoutReview = () => {
  const { checkout } = useCheckout();
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [gateway, setGateway] = useState("razorpay");
  const [paying, setPaying] = useState(false);

  /* ===============================
     🔥 SAFE VALUES
  ============================== */
  const years = Number(checkout.config?.years || 1);

  /* ===============================
     🔥 DOMAIN PRICE (ULTIMATE FIX)
  ============================== */
  let domainPrice = 0;

  if (checkout.domain) {
    // ✅ 1. Use config value (best source)
    if (checkout.config?.domainPrice) {
      domainPrice = Number(checkout.config.domainPrice);
    }

    // ✅ 2. Fallback → advanced pricing
    else if (checkout.domainPricingJson) {
      const yearData = checkout.domainPricingJson?.[years];

      domainPrice =
        yearData?.INR?.register ||
        yearData?.USD?.register ||
        0;
    }

    // ✅ 3. Fallback → API price × years
    else if (checkout.price) {
      domainPrice =
        Number(checkout.price) * Number(years);
    }
  }

  /* ===============================
     🔥 PLAN PRICE
  ============================== */
  const planPrice = checkout.plan
    ? Number(checkout.config?.price || 0)
    : 0;

  /* ===============================
     🔥 FINAL TOTAL
  ============================== */
  const total = domainPrice + planPrice;

  const gateways = useMemo(
    () => [
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
    ],
    []
  );

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

  /* ===============================
     🔥 PAYMENT
  ============================== */
  const pay = async (selectedGateway) => {
    if (paying) return;
    setPaying(true);
    try {
      const res =
        checkout.type === "domain"
          ? await PaymentAPI.createDomainOrder({
              domain: checkout.domain,
              years,
              gateway: selectedGateway,
            })
          : await PaymentAPI.createOrder({
              planId: checkout.plan?.Plan?.id || checkout.plan?.id,
              productId: checkout.plan?.id,
              domain: checkout.domain,
              config: checkout.config,
              gateway: selectedGateway,
            });

      if (res.data?.gateway === "payu") {
        submitPayU(res.data.actionUrl, res.data.fields);
        return;
      }

      const key = res.data.razorpay_key_id;
      const orderId = res.data.razorpay_order_id;

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      const rzp = new window.Razorpay({
        key,
        order_id: orderId,
        amount: res.data.amount,
        currency: res.data.currency || "INR",
        name: "Techzuno Hosting",
        description:
          checkout.type === "domain"
            ? `Domain purchase (${checkout.domain})`
            : `Hosting purchase (${checkout.domain || "Hosting"})`,
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
      console.error("PAYMENT FLOW ERROR:", err);
    } finally {
      setPaying(false);
      setGatewayOpen(false);
    }
  };

  return (
    <div className="p-10 text-white bg-gradient-to-br from-[#020617] to-[#0f172a] min-h-screen">

      <h1 className="text-3xl font-bold mb-8">
        Review & Checkout
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        {/* ================= LEFT ================= */}
        <div className="bg-white/5 backdrop-blur-xl border border-gray-700 p-6 rounded-2xl shadow-lg">

          <h2 className="text-xl font-semibold mb-4">
            Order Details
          </h2>

          <p className="mb-2">
            <span className="text-gray-400">Domain:</span>{" "}
            {checkout.domain || "—"}
          </p>

          {checkout.domain && (
            <p className="mb-2">
              <span className="text-gray-400">Duration:</span>{" "}
              {years} Year{years > 1 ? "s" : ""}
            </p>
          )}

          {checkout.plan && (
            <>
              <p className="mb-2">
                <span className="text-gray-400">Plan:</span>{" "}
                {checkout.plan.name}
              </p>

              <p className="mb-2">
                <span className="text-gray-400">Billing:</span>{" "}
                {checkout.config?.cycle}
              </p>

              <p className="mb-2">
                <span className="text-gray-400">Currency:</span>{" "}
                {checkout.config?.currency}
              </p>
            </>
          )}
        </div>

        {/* ================= RIGHT ================= */}
        <div className="bg-white/5 backdrop-blur-xl border border-gray-700 p-6 rounded-2xl shadow-lg">

          <h2 className="text-xl font-semibold mb-4">
            Order Summary
          </h2>

          {/* DOMAIN */}
          {checkout.domain && (
            <div className="flex justify-between mb-3 text-sm">
              <span>
                Domain ({years} year{years > 1 ? "s" : ""})
              </span>

              <span className="text-green-400 font-semibold">
                ₹{domainPrice || 0}
              </span>
            </div>
          )}

          {/* PLAN */}
          {checkout.plan && (
            <div className="flex justify-between mb-3 text-sm">
              <span>
                Plan ({checkout.config?.cycle})
              </span>

              <span className="text-green-400 font-semibold">
                {checkout.config?.currency === "INR" ? "₹" : "$"}
                {planPrice}
              </span>
            </div>
          )}

          {/* NO EXTRA */}
          <div className="text-xs text-gray-400 mb-3">
            No additional charges
          </div>

          <hr className="my-4 border-gray-700" />

          {/* TOTAL */}
          <div className="flex justify-between text-lg font-bold">
            <span>Total Payable</span>

            <span className="text-green-400 text-2xl">
              ₹{total}
            </span>
          </div>

          {/* CTA */}
          <button
            onClick={() => setGatewayOpen(true)}
            className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition shadow-lg"
          >
            Pay Now
          </button>
        </div>
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
                    Pay ₹{total}
                  </div>
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
                  onClick={() => pay(gateway)}
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

export default CheckoutReview;
