import { useState, useEffect } from "react";
import {
  DomainAPI,
  DomainSearchAPI,
  PaymentAPI,
} from "../api/api";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCheckout } from "../context/CheckoutContext";
const Domains = () => {
  const [tab, setTab] = useState("register");

  const [domain, setDomain] = useState("");
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");

  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);

  const [authCode, setAuthCode] = useState("");

  const navigate = useNavigate();
const { setCheckout } = useCheckout();

  /* 🔥 NEW STATE */
  const [marketDomains, setMarketDomains] = useState([]);

  useEffect(() => {
    loadDomains();
    loadMarketplace();
  }, []);

  const loadDomains = async () => {
    const res = await DomainAPI.getDomains();
    setDomains(res.data);

    const selected = res.data.find((d) => d.is_selected);
    if (selected) setSelectedDomain(selected.domain);
  };

  /* ===============================
     🔥 LOAD MARKETPLACE DOMAINS
  ============================== */
  const loadMarketplace = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/domain/list"
      );
      setMarketDomains(res.data);
    } catch {
      toast.error("Failed to load marketplace");
    }
  };

  const selectDomain = async (domainObj) => {
    setSelectedDomain(domainObj.domain);
    await DomainAPI.selectDomain({ domainId: domainObj.id });
    toast.success("Domain Selected");
  };

  const addDomain = async () => {
    if (!domain) return toast.error("Enter domain");
    await DomainAPI.addDomain({ domain });
    toast.success("Domain Added");
    setDomain("");
    loadDomains();
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

  const buyDomain = async (customDomain = null) => {
  const domainToBuy = customDomain || domain;

  if (!domainToBuy) return toast.error("Enter domain");

  if (!customDomain && !searchResult?.available) {
    return toast.error("Domain not available");
  }

  let finalPrice = 0;
  let pricingJson = null;
  let years = [1];

  /* ===============================
     ✅ MARKETPLACE DOMAIN
  ============================== */
  if (customDomain) {
    const found = marketDomains.find(
      (d) => "mydomain" + d.tld === customDomain
    );

    finalPrice = Number(found?.final_price || 0);

    console.log("🔥 Marketplace Price:", finalPrice);
  }

  /* ===============================
     ✅ SEARCH DOMAIN (🔥 MAIN FIX)
  ============================== */
  else {
    finalPrice = Number(searchResult?.price || 0);
    pricingJson = searchResult?.pricing_json || null;
    years = searchResult?.years || [1];

    console.log("🔥 Search API Price:", finalPrice);
    console.log("🔥 Full Search Result:", searchResult);
  }

  /* 🚨 FINAL FIX */
  setCheckout({
  type: "domain",
  domain: domainToBuy,
  domainType: "register",
  price: finalPrice,
  domainPricingJson: pricingJson,
  years: years,
});

/* 🔥 FORCE DELAY (IMPORTANT) */
setTimeout(() => {
  navigate("/checkout/config");
}, 0);
  }

  const transferDomain = async () => {
    if (!domain || !authCode)
      return toast.error("Domain & Auth code required");

    await DomainSearchAPI.transferDomain({ domain, authCode });
    toast.success("Transfer Initiated");
  };

  const addToCpanel = async (id) => {
    await DomainAPI.addToCpanel({ domainId: id });
    toast.success("Added to cPanel");
    loadDomains();
  };

  /* ===============================
     TAG UI
  ============================== */
  const Tag = ({ tag }) => {
    if (!tag) return null;

    const styles = {
      sale: "bg-green-600",
      hot: "bg-red-600",
      new: "bg-blue-600",
    };

    return (
      <span className={`text-xs px-2 py-1 rounded ${styles[tag]}`}>
        {tag.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] text-white p-10">
      <h1 className="text-4xl font-bold mb-8">Domains</h1>

      {/* 🔥 MARKETPLACE */}
      <div className="mb-12">
        <h2 className="text-2xl mb-4">Popular Domains</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketDomains.map((d) => (
            <div
              key={d.id}
              className={`p-4 rounded-xl border ${
                d.is_spotlight
                  ? "border-yellow-500 bg-yellow-500/10"
                  : "border-gray-700 bg-white/5"
              }`}
            >
              <div className="flex justify-between mb-2">
                <h3 className="text-xl font-bold">{d.tld}</h3>
                <Tag tag={d.tag} />
              </div>

              <p className="text-green-400 text-xl mb-3">
                ₹{d.final_price}
              </p>

              <button
                onClick={() => {
  setCheckout({
    type: "domain",
    domain: "mydomain" + d.tld,
    domainType: "register",

    price: d.final_price,     // 🔥 IMPORTANT
    years: d.years || [1],    // optional if available
  });

  navigate("/checkout/config");
}}
                className="w-full bg-blue-600 py-2 rounded"
              >
                Register
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-8">
        {["register", "transfer", "existing"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full ${
              tab === t
                ? "bg-purple-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {t === "register"
              ? "Register"
              : t === "transfer"
              ? "Transfer"
              : "Use Existing"}
          </button>
        ))}
      </div>

      {/* EXISTING UI REMAINS SAME */}
      {/* REGISTER */}
      {tab === "register" && (
        <div className="mb-6">
          <input
            className="w-full p-3 bg-black/40 rounded"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />

          <button
            onClick={checkDomain}
            className="bg-blue-600 px-4 py-2 mt-3"
          >
            Check
          </button>

          {searchResult && (
            <div className="mt-3">
              {searchResult.available ? (
                <>
                  <p className="text-green-400">
                    ₹{searchResult.price}
                  </p>

                  <button
                    onClick={() => buyDomain()}
                    className="bg-green-600 px-4 py-2 mt-2"
                  >
                    Buy
                  </button>
                </>
              ) : (
                <p className="text-red-400">Not Available</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* TRANSFER */}
      {tab === "transfer" && (
        <>
          <input
            placeholder="Domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <input
            placeholder="Auth Code"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
          />

          <button onClick={transferDomain}>Transfer</button>
        </>
      )}

      {/* EXISTING */}
      {tab === "existing" && (
        <>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <button onClick={addDomain}>Add</button>
        </>
      )}

      {/* MY DOMAINS */}
      <h2 className="text-2xl mt-10 mb-4">My Domains</h2>

      {domains.map((d) => (
        <div key={d.id} className="flex justify-between p-3">
          <div>
            <input
              type="radio"
              checked={selectedDomain === d.domain}
              onChange={() => selectDomain(d)}
            />
            {d.domain}
          </div>

          {!d.is_added_to_cpanel ? (
            <button onClick={() => addToCpanel(d.id)}>
              Add to cPanel
            </button>
          ) : (
            <span>Added</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Domains;