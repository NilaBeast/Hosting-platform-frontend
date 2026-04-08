import { useState, useEffect } from "react";
import { DomainAPI, DomainSearchAPI } from "../api/api";
import toast from "react-hot-toast";

const Domains = () => {
  const [domain, setDomain] = useState("");
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");

  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    const res = await DomainAPI.getDomains();
    setDomains(res.data);

    const selected = res.data.find((d) => d.is_selected);
    if (selected) setSelectedDomain(selected.domain);
  };

  /* ===============================
     1. USE EXISTING DOMAIN
  ================================= */
  const selectDomain = async (domainObj) => {
    setSelectedDomain(domainObj.domain);

    await DomainAPI.selectDomain({
      domainId: domainObj.id,
    });

    toast.success("Domain Selected");
  };

  /* ===============================
     2. ADD OWN DOMAIN (cpanel)
  ================================= */
  const addDomain = async () => {
    if (!domain) return toast.error("Enter domain");

    await DomainAPI.addDomain({ domain });

    toast.success("Domain Added");
    setDomain("");
    loadDomains();
  };

  /* ===============================
     3. CHECK DOMAIN AVAILABILITY
  ================================= */
  const checkDomain = async () => {
    if (!domain) return toast.error("Enter domain");

    setLoading(true);
    try {
      const res = await DomainSearchAPI.checkDomain(domain);
      setSearchResult(res.data);
    } catch (err) {
      toast.error("Check failed");
    }
    setLoading(false);
  };

  /* ===============================
     BUY DOMAIN → REDIRECT
  ================================= */
  

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl mb-6">Domain Management</h1>

      {/* ===============================
          DOMAIN INPUT
      ============================== */}
      <div className="flex gap-3 mb-6">
        <input
          className="bg-gray-800 p-3 rounded w-80"
          placeholder="example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />

        <button
          onClick={addDomain}
          className="bg-green-600 px-4 py-2 rounded"
        >
          Use Domain
        </button>

        <button
          onClick={checkDomain}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Check Availability
        </button>
      </div>

      {/* ===============================
          SEARCH RESULT
      ============================== */}
      {loading && <p>Checking...</p>}

      {searchResult && (
        <div className="bg-gray-800 p-4 rounded mb-6">
          <h3 className="text-lg">{searchResult.domain}</h3>

          {searchResult.available ? (
  <>
    <p className="text-green-400">
      ✅ Available - ₹{searchResult.price}
    </p>
    <p className="text-sm text-gray-400">
      You can buy this during hosting checkout
    </p>
  </>
) : (
  <p className="text-red-400">❌ Not Available</p>
)}
        </div>
      )}

      {/* ===============================
          EXISTING DOMAINS
      ============================== */}
      <div>
        <h2 className="text-xl mb-3">My Domains</h2>

        {domains.map((d) => (
          <div
            key={d.id}
            className="bg-gray-800 p-3 mt-2 rounded flex items-center"
          >
            <input
              type="radio"
              name="domain"
              checked={selectedDomain === d.domain}
              onChange={() => selectDomain(d)}
            />
            <span className="ml-2">{d.domain}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Domains;