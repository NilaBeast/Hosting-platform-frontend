import { useEffect, useState } from "react";
import { PlanAPI, PaymentAPI } from "../api/api";
import toast from "react-hot-toast";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [orders, setOrders] = useState({});
  const [paymentModal, setPaymentModal] = useState(null);
  const [domainModal, setDomainModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [domain, setDomain] = useState("");

  useEffect(() => {
    loadPlans();
    loadMyOrders();
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

  /* CHECK PAYMENT RETURN */
  const checkReturnPayment = async () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");

    if (!orderId) return;

    let attempts = 0;
    let success = false;

    while (attempts < 5 && !success) {
      const res = await PaymentAPI.verifyPayment({ orderId });

      if (res.data.success) {
        toast.success("Payment Successful");
        setPaymentModal("success");
        loadMyOrders();
        success = true;
        break;
      }

      attempts++;
      await new Promise((r) => setTimeout(r, 2000));
    }

    if (!success) {
      toast.error("Payment Verification Failed");
      setPaymentModal("failed");
    }

    window.history.replaceState({}, document.title, "/plans");
  };

  /* OPEN DOMAIN MODAL */
  const openDomainModal = (plan) => {
    setSelectedPlan(plan);
    setDomainModal(true);
  };

  /* CONFIRM PAYMENT */
  const confirmPayment = async () => {
    if (!domain) return alert("Enter domain");

    const res = await PaymentAPI.createOrder({
      planId: selectedPlan.id,
      domain,
    });

    const sessionId = res.data.payment_session_id;
    const orderId = res.data.order_id;

    const cashfree = window.Cashfree({
      mode: "sandbox",
    });

    setDomainModal(false);

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
            setPaymentModal("success");
            loadMyOrders();
            success = true;
            break;
          }

          attempts++;
          await new Promise((r) => setTimeout(r, 2000));
        }

        if (!success) {
          toast.error("Payment Failed");
          setPaymentModal("failed");
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#0f172a] p-8 rounded-xl w-96">
            <h2 className="text-2xl mb-4">Enter Domain Name</h2>

            <input
              className="w-full p-2 bg-[#020617] mb-4"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />

            <button
              onClick={confirmPayment}
              className="bg-blue-600 w-full p-2 rounded"
            >
              Continue to Payment
            </button>

            <button
              onClick={() => setDomainModal(false)}
              className="mt-3 w-full bg-gray-700 p-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT RESULT MODAL */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#0f172a] p-8 rounded-xl text-center">
            {paymentModal === "success" && (
              <>
                <h2 className="text-2xl text-green-500">
                  Payment Successful
                </h2>
                <p>Hosting account activated.</p>
              </>
            )}

            {paymentModal === "failed" && (
              <>
                <h2 className="text-2xl text-red-500">
                  Payment Failed
                </h2>
              </>
            )}

            <button
              onClick={() => setPaymentModal(null)}
              className="mt-4 bg-blue-600 px-4 py-2 rounded"
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