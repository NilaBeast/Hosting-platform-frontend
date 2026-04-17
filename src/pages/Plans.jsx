import { useEffect, useState } from "react";
import {
  PaymentAPI,
  DomainSearchAPI,
  DomainAPI,
  AdminProductAPI,
} from "../api/api";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useCheckout } from "../context/CheckoutContext";

const Plans = () => {
  const { groupSlug, productSlug } = useParams();

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [orders, setOrders] = useState({});
  const [domainModal, setDomainModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [domain, setDomain] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setCheckout } = useCheckout();

  const [tab, setTab] = useState("register");
  const [authCode, setAuthCode] = useState("");
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");

  /* ================= LOAD ================= */
  useEffect(() => {
    load();
    loadMyOrders();
    loadDomains();
  }, []);

  const load = async () => {
  const res = await AdminProductAPI.getGroups();
  setGroups(res.data);

  /* ===============================
     🔥 AUTO SELECT GROUP (NEW)
  ============================== */
  if (groupSlug) {
    const foundGroup = res.data.find(
      (g) => g.slug === groupSlug
    );

    if (foundGroup) {
      setSelectedGroup(foundGroup);
    }
  }

  /* ===============================
     🔥 AUTO PRODUCT FLOW (EXISTING)
  ============================== */
  if (groupSlug && productSlug) {
    let found = null;

    res.data.forEach((g) => {
      if (g.slug === groupSlug) {
        g.Products?.forEach((p) => {
          if (p.slug === productSlug) {
            found = p;
          }
        });
      }
    });

    if (found) {
      setSelectedPlan(found);

      setTimeout(() => {
        setDomainModal(true);
      }, 100);
    }
  }
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

  /* ================= DOMAIN ================= */

  const openDomainModal = (plan) => {
    setSelectedPlan(plan);
    setDomainModal(true);

    setTab("register");
    setDomain("");
    setSearchResult(null);
    setAuthCode("");
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
    let finalDomain = "";
    let domainPrice = 0;
    let pricingJson = null;
    let years = [1];

    if (tab === "existing") {
      finalDomain = selectedDomain;
    } else {
      finalDomain = domain;
    }

    if (!finalDomain) return toast.error("Select domain");

    if (tab === "register") {
      if (!searchResult) return toast.error("Check domain first");
      if (!searchResult.available)
        return toast.error("Domain not available");

      domainPrice = Number(searchResult.price || 0);
      pricingJson = searchResult.pricing_json || null;
      years = searchResult.years || [1];
    }

    if (tab === "transfer" && !authCode) {
      return toast.error("Auth code required");
    }

    setCheckout((prev) => ({
      ...prev,
      type: "hosting",
      plan: selectedPlan,
      domain: finalDomain,
      domainType: tab,
      authCode,
      price: domainPrice,
      domainPricingJson: pricingJson,
      years,
    }));

    setDomainModal(false);
    navigate("/checkout/config");
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#020617] text-white p-12">

      {/* GROUP + PRODUCT UI */}
      <>
  {/* TITLE */}
  {!groupSlug && (
    <h1 className="text-5xl font-bold mb-10 text-center">
      Hosting Plans
    </h1>
  )}

  {/* GROUPS (only when no group selected) */}
  {!groupSlug && (
    <div className="grid grid-cols-3 gap-6 mb-10">
      {groups.map((g) => (
        <div
          key={g.id}
          onClick={() => setSelectedGroup(g)}
          className="bg-[#0f172a] p-6 rounded-xl cursor-pointer hover:bg-blue-600 transition"
        >
          <h2 className="text-xl font-bold">{g.name}</h2>
        </div>
      ))}
    </div>
  )}

  {/* 🔥 SHOW SELECTED GROUP TITLE */}
  {selectedGroup && (
    <h2 className="text-3xl font-bold text-center mb-8">
      {selectedGroup.name}
    </h2>
  )}

  {/* PRODUCTS */}
  {selectedGroup && (
    <div className="grid grid-cols-3 gap-6">
      {selectedGroup.Products?.map((p) => (
        <div key={p.id} className="bg-[#0f172a] p-6 rounded-xl">
          <h3 className="text-lg font-bold">{p.name}</h3>

          <button
            onClick={() => openDomainModal(p)}
            className="bg-blue-600 w-full mt-4 p-2 rounded"
          >
            Select
          </button>
        </div>
      ))}
    </div>
  )}
</>

      {/* 🔥 FULL DOMAIN MODAL RESTORED */}
      {domainModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
          <div className="bg-[#0f172a] p-6 rounded-xl w-[550px]">

            <h2 className="text-xl mb-4">Choose Domain</h2>

            {/* TABS */}
            <div className="flex gap-3 mb-4">
              {["register", "transfer", "existing"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1 rounded ${
                    tab === t ? "bg-purple-600" : "bg-gray-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* REGISTER */}
            {tab === "register" && (
              <>
                <input
                  className="w-full p-2 bg-black mb-2"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />

                <button
                  onClick={checkDomain}
                  className="bg-blue-600 px-3 py-1 mb-2"
                >
                  Check
                </button>

                {searchResult && (
                  <p
                    className={
                      searchResult.available
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {searchResult.available
                      ? "Available"
                      : "Not Available"}
                  </p>
                )}
              </>
            )}

            {/* TRANSFER */}
            {tab === "transfer" && (
              <>
                <input
                  placeholder="Domain"
                  className="w-full p-2 bg-black mb-2"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />

                <input
                  placeholder="Auth Code"
                  className="w-full p-2 bg-black mb-2"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                />
              </>
            )}

            {/* EXISTING */}
            {tab === "existing" && (
              <>
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
              </>
            )}

            {/* ACTIONS */}
            <button
              onClick={confirmPayment}
              className="bg-green-600 w-full mt-4 p-2 rounded"
            >
              Continue
            </button>

            <button
              onClick={() => setDomainModal(false)}
              className="bg-gray-600 w-full mt-2 p-2 rounded"
            >
              Cancel
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;