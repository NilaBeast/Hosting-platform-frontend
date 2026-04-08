import { useEffect, useState } from "react";
import {
  PlanAPI,
  PaymentAPI,
  DomainAPI,
  DomainSearchAPI,
} from "../api/api";
import toast from "react-hot-toast";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [orders, setOrders] = useState({});
  const [paymentModal, setPaymentModal] = useState(null);

  const [domainModal, setDomainModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [domain, setDomain] = useState("");
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");

  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlans();
    loadMyOrders();
    loadDomains();
    checkReturnPayment();
  }, []);

  const loadPlans = async () => {
    const res = await PlanAPI.getPlans();
    setPlans(res.data);
  };

  const loadMyOrders = async () => {
    const res = await PaymentAPI.getMyOrders();
    const map = {};
    res.data.forEach((o) => {
      map[o.plan_id] = o.status;
    });
    setOrders(map);
  };

  const loadDomains = async () => {
    const res = await DomainAPI.getDomains();
    setDomains(res.data);

    const selected = res.data.find((d) => d.is_selected);
    if (selected) setSelectedDomain(selected.domain);
  };

  const checkReturnPayment = async () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");

    if (!orderId) return;

    const res = await PaymentAPI.verifyPayment({ orderId });

    if (res.data.success) {
      toast.success("Payment Successful");
      setPaymentModal("success");
      loadMyOrders();
    } else {
      toast.error("Payment Failed");
      setPaymentModal("failed");
    }

    window.history.replaceState({}, document.title, "/plans");
  };

  const openDomainModal = (plan) => {
    setSelectedPlan(plan);
    setDomainModal(true);
  };

  const checkDomain = async () => {
    if (!domain) return toast.error("Enter domain");

    setLoading(true);
    try {
      const res = await DomainSearchAPI.checkDomain(domain);
      setSearchResult(res.data);
    } catch {
      toast.error("Check failed");
    }
    setLoading(false);
  };

  

  const confirmPayment = async () => {
  const finalDomain = selectedDomain || domain;

  if (!finalDomain) return toast.error("Select domain");

  const res = await PaymentAPI.createOrder({
    planId: selectedPlan.id,
    domain: finalDomain,
  });

  const sessionId = res.data.payment_session_id;
  const orderId = res.data.order_id;

  const cashfree = window.Cashfree({ mode: "sandbox" });

  setDomainModal(false);

  cashfree.checkout({
    paymentSessionId: sessionId,
    redirectTarget: "_modal",
  }).then(async () => {
    const verify = await PaymentAPI.verifyPayment({ orderId });

    if (verify.data.success) {
      toast.success("Payment Successful");
      loadMyOrders();
    } else {
      toast.error("Payment Failed");
    }
  });
};

  const showValue = (val) => {
    if (val === -1) return "Unlimited";
    if (val === 0 || val === null) return "0";
    return val;
  };

  const Feature = ({ label, value }) => (
    <div className="flex justify-between border-b border-gray-800 pb-1">
      <span>{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );

  const renderButton = (plan) => {
    const status = orders[plan.id];

    if (status === "active") {
      return (
        <button className="w-full bg-green-600 p-3 rounded-xl">
          Activated
        </button>
      );
    }

    if (status === "pending") {
      return (
        <button className="w-full bg-yellow-600 p-3 rounded-xl">
          Pending
        </button>
      );
    }

    if (status === "failed") {
      return (
        <button
          onClick={() => openDomainModal(plan)}
          className="w-full bg-red-600 p-3 rounded-xl"
        >
          Retry Payment
        </button>
      );
    }

    return (
      <button
        onClick={() => openDomainModal(plan)}
        className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl"
      >
        Buy Plan
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-12">
      <h1 className="text-5xl font-bold mb-14 text-center">
        Hosting Plans
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-gradient-to-b from-[#0f172a] to-[#020617] border border-gray-800 rounded-2xl p-8"
          >
            <h2 className="text-3xl font-bold mb-4">{plan.name}</h2>

            <div className="text-4xl font-bold mb-6">
              ₹{plan.price}
              <span className="text-lg text-gray-400"> /month</span>
            </div>

            <div className="space-y-2 text-gray-300 text-sm mb-6">
              <Feature label="Disk Space" value={`${showValue(plan.disk)} MB`} />
              <Feature label="Bandwidth" value={`${showValue(plan.bandwidth)} MB`} />
              <Feature label="Email Accounts" value={showValue(plan.max_email)} />
              <Feature label="FTP Accounts" value={showValue(plan.max_ftp)} />
              <Feature label="Databases" value={showValue(plan.max_db)} />
            </div>

            {renderButton(plan)}
          </div>
        ))}
      </div>

      {/* DOMAIN MODAL */}
      {domainModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
          <div className="bg-[#0f172a] p-6 rounded-xl w-[500px]">
            <h2 className="text-xl mb-4">Choose Domain</h2>

            {/* EXISTING DOMAINS */}
            <div className="mb-4">
              <h3 className="mb-2">Use Existing Domain</h3>
              {domains.map((d) => (
                <div key={d.id}>
                  <input
                    type="radio"
                    checked={selectedDomain === d.domain}
                    onChange={() => setSelectedDomain(d.domain)}
                  />
                  <span className="ml-2">{d.domain}</span>
                </div>
              ))}
            </div>

            {/* NEW DOMAIN */}
            <input
              className="w-full p-2 bg-black mb-2"
              placeholder="Enter new domain"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setSearchResult(null);
              }}
            />

            <button
              onClick={checkDomain}
              className="bg-blue-600 px-3 py-1 mb-3"
            >
              Check Availability
            </button>

            {loading && <p>Checking...</p>}

            {searchResult && (
              <div>
                {searchResult.available ? (
  <>
    <p className="text-green-400">
      Available - ₹{searchResult.price}
    </p>
  </>
) : (
  <p className="text-red-400">Not Available</p>
)}
              </div>
            )}

            <button
              onClick={confirmPayment}
              className="bg-green-600 w-full mt-4 p-2"
            >
              Continue with Selected Domain
            </button>

            <button
              onClick={() => setDomainModal(false)}
              className="bg-gray-600 w-full mt-2 p-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT RESULT */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
          <div className="bg-[#0f172a] p-6 rounded text-center">
            <h2>
              {paymentModal === "success"
                ? "Payment Successful"
                : "Payment Failed"}
            </h2>

            <button
              onClick={() => setPaymentModal(null)}
              className="mt-4 bg-blue-600 px-4 py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;