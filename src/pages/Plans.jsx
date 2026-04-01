import { useEffect, useState } from "react";
import { HostingAPI, PlanAPI } from "../api/api";
import toast from "react-hot-toast";

const Plans = () => {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const res = await PlanAPI.getPlans();
    setPlans(res.data);
  };

  const buyPlan = async (plan) => {
    await HostingAPI.createHosting({
      domain: "example.com",
      packageName: plan.whm_package_name,
    });

    toast.success("Hosting Created");
  };

  const showValue = (val) => {
    if (val === -1) return "Unlimited";
    if (val === 0 || val === null) return "0";
    return val;
  };

  const Feature = ({ label, value }) => {
  return (
    <div className="flex justify-between border-b border-gray-800 pb-1">
      <span>{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
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
            className="
              bg-gradient-to-b from-[#0f172a] to-[#020617]
              border border-gray-800
              rounded-2xl
              p-8
              transition
              duration-500
              hover:scale-105
              hover:border-blue-500
              hover:shadow-2xl
              hover:shadow-blue-500/20
              relative
              overflow-hidden
            "
          >
            {/* Glow effect */}
            <div className="absolute inset-0 opacity-0 hover:opacity-10 bg-blue-500 transition"></div>

            <h2 className="text-3xl font-bold mb-4">{plan.name}</h2>

            {/* Price */}
            <div className="text-4xl font-bold mb-6">
              ₹{plan.price}
              <span className="text-lg text-gray-400"> /month</span>
            </div>

            {/* Features */}
            <div className="space-y-2 text-gray-300 text-sm mb-6">
  <Feature label="Disk Space" value={`${showValue(plan.disk)} MB`} />
  <Feature label="Bandwidth" value={`${showValue(plan.bandwidth)} MB`} />
  <Feature label="Email Accounts" value={showValue(plan.max_email)} />
  <Feature label="FTP Accounts" value={showValue(plan.max_ftp)} />
  <Feature label="Databases" value={showValue(plan.max_db)} />
  <Feature label="Subdomains" value={showValue(plan.max_subdomain)} />
  <Feature label="Addon Domains" value={showValue(plan.max_addon_domain)} />
  <Feature label="Parked Domains" value={showValue(plan.max_parked_domain)} />
  <Feature label="Passenger Apps" value={showValue(plan.max_passenger_apps)} />
  <Feature label="Hourly Email" value={showValue(plan.hourly_email)} />
</div>

            {/* Buy Button */}
            <button
              onClick={() => buyPlan(plan)}
              className="
                w-full
                bg-blue-600
                hover:bg-blue-700
                transition
                p-3
                rounded-xl
                font-semibold
                shadow-lg
              "
            >
              Buy Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plans;