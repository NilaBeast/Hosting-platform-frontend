import { useCheckout } from "../context/CheckoutContext";
import { PaymentAPI } from "../api/api";

const CheckoutReview = () => {
  const { checkout } = useCheckout();

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

  /* ===============================
     🔥 PAYMENT
  ============================== */
  const pay = async () => {
  try {
    console.log("🔥 CHECKOUT DATA:", checkout);

    const res =
      checkout.type === "domain"
        ? await PaymentAPI.createDomainOrder({
            domain: checkout.domain,
            years,
          })
        : await PaymentAPI.createOrder({
            // ✅ FIX: support both product & plan
            planId: checkout.plan?.Plan?.id || checkout.plan?.id,
            productId: checkout.plan?.id,

            domain: checkout.domain,
            config: checkout.config,
          });

    const cashfree = window.Cashfree({ mode: "sandbox" });

    await cashfree.checkout({
      paymentSessionId: res.data.payment_session_id,
      redirectTarget: "_modal",
    });

    const verify = await PaymentAPI.verifyPayment({
      orderId: res.data.order_id,
    });

    if (verify.data.success) {
      window.location.href = "/checkout/success";
    } else {
      console.log("⚠️ Payment not completed yet");
    }

  } catch (err) {
    console.error("❌ PAYMENT FLOW ERROR:", err);
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
            onClick={pay}
            className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition shadow-lg"
          >
            Complete Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutReview;