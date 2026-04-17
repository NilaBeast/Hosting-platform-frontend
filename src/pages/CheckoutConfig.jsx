import { useCheckout } from "../context/CheckoutContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const CheckoutConfig = () => {
  const { checkout, setCheckout } = useCheckout();
  const navigate = useNavigate();

  const [dns, setDns] = useState(true);
  const [privacy, setPrivacy] = useState(true);
  const [cycle, setCycle] = useState("monthly");

  const [currency, setCurrency] = useState("INR");
  const [price, setPrice] = useState(0);

  const [years, setYears] = useState(1);
  const [domainPrice, setDomainPrice] = useState(0);

  /* ===============================
     🔥 SYNC YEARS FROM ADMIN
  ============================== */
  useEffect(() => {
    if (checkout.years && checkout.years.length > 0) {
      setYears(checkout.years[0]); // default first available year
    }
  }, [checkout.years]);

  /* ===============================
     🔥 DOMAIN PRICE (ULTRA FIXED)
  ============================== */
  useEffect(() => {
    if (!checkout.domain) return;

    let calculated = 0;

    const selectedYear = Number(years);

    /* ✅ PRIORITY 1: ADVANCED PRICING */
    if (checkout.domainPricingJson) {
      const yearData =
        checkout.domainPricingJson?.[selectedYear] ||
        checkout.domainPricingJson?.[String(selectedYear)];

      if (yearData) {
        calculated =
          Number(yearData?.INR?.register) ||
          Number(yearData?.USD?.register) ||
          0;
      }
    }

    /* ✅ PRIORITY 2: NORMAL PRICE (WITH MARGIN) */
    if (!calculated && checkout.price) {
      calculated =
        Number(checkout.price) * Number(selectedYear || 1);
    }

    /* ✅ FINAL SAFETY */
    if (!calculated) {
      console.warn("⚠️ Domain price fallback triggered");
      calculated = 0;
    }

    setDomainPrice(calculated);
  }, [years, checkout]);

  /* ===============================
     🔥 PLAN PRICE
  ============================== */
  useEffect(() => {
    if (!checkout.plan?.pricing_json) return;

    const selected =
      checkout.plan.pricing_json?.[currency]?.[cycle];

    if (selected?.enabled) {
      setPrice(Number(selected.price || 0));
    } else {
      setPrice(0);
    }
  }, [cycle, currency, checkout.plan]);

  /* ===============================
     🔥 TOTAL
  ============================== */
  const total =
    (checkout.plan ? price : 0) +
    (checkout.domain ? domainPrice : 0);

  return (
    <div className="p-10 text-white bg-gradient-to-br from-[#020617] to-[#0f172a] min-h-screen">

      <h1 className="text-3xl font-bold mb-8">
        Domain Configuration
      </h1>

      {/* DOMAIN CARD */}
      <div className="bg-white/5 border border-gray-700 p-6 rounded-2xl mb-6 shadow-xl">
        <h2 className="text-xl font-semibold">
          {checkout.domain}
        </h2>

        {/* YEARS */}
        <div className="mt-4">
          <p className="text-sm text-gray-400 mb-2">
            Registration Period
          </p>

          <select
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="bg-black/40 p-2 rounded w-full"
          >
            {(checkout.years || [1]).map((y) => (
              <option key={y} value={y}>
                {y} Year{y > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* ADDONS */}
        <div className="flex gap-6 mt-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={dns}
              onChange={() => setDns(!dns)}
            />
            DNS Management
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={privacy}
              onChange={() => setPrivacy(!privacy)}
            />
            ID Protection
          </label>
        </div>

        {/* DOMAIN PRICE DISPLAY */}
        <div className="mt-4 text-green-400 font-semibold text-lg">
          Domain Price: ₹{domainPrice}
        </div>
      </div>

      {/* PLAN */}
      {checkout.plan && (
        <div className="bg-white/5 border border-gray-700 p-6 rounded-2xl mb-6 shadow-xl">

          <h3 className="mb-3 text-lg font-semibold">
            Billing Cycle
          </h3>

          {/* CURRENCY */}
          <div className="flex gap-3 mb-3">
            {["INR", "USD"].map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`px-3 py-1 rounded ${
                  currency === cur
                    ? "bg-green-600"
                    : "bg-gray-700"
                }`}
              >
                {cur}
              </button>
            ))}
          </div>

          {/* CYCLES */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(
              checkout.plan.pricing_json?.[currency] || {}
            ).map(([c, val]) => {
              if (!val?.enabled) return null;

              return (
                <div
                  key={c}
                  onClick={() => setCycle(c)}
                  className={`p-3 rounded cursor-pointer ${
                    cycle === c
                      ? "bg-purple-600"
                      : "bg-gray-800"
                  }`}
                >
                  <p className="capitalize">{c}</p>
                  <p className="text-green-400 font-bold">
                    {currency === "INR" ? "₹" : "$"}
                    {val.price}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TOTAL */}
      <div className="bg-white/5 border border-gray-700 p-6 rounded-2xl mb-6 shadow-xl">
        <h3>Total</h3>

        <p className="text-3xl text-green-400 font-bold">
          ₹{total}
        </p>
      </div>

      {/* CONTINUE */}
      <button
        onClick={() => {
          setCheckout({
            ...checkout,
            config: {
              dns,
              privacy,
              cycle,
              currency,
              price,
              years,
              domainPrice, // ✅ FINAL FIX
            },
          });

          navigate("/checkout/review");
        }}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:opacity-90"
      >
        Continue
      </button>
    </div>
  );
};

export default CheckoutConfig;