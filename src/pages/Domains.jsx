import { useState, useEffect } from "react";
import { DomainAPI } from "../api/api";
import toast from "react-hot-toast";

const Domains = () => {
  const [domain, setDomain] = useState("");
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    const res = await DomainAPI.getDomains();
    setDomains(res.data);

    const selected = res.data.find(d => d.is_selected);
    if (selected) {
      setSelectedDomain(selected.domain);
    } else {
      const primary = res.data.find(d => d.is_primary);
      if (primary) setSelectedDomain(primary.domain);
    }
  };

  const addDomain = async () => {
    await DomainAPI.addDomain({ domain });
    toast.success("Domain Added");
    loadDomains();
  };

  const selectDomain = async (domainObj) => {
    setSelectedDomain(domainObj.domain);
    await DomainAPI.selectDomain({
      domainId: domainObj.id,
    });
    toast.success("Domain Selected");
  };

  return (
    <div className="p-8">
      <h1 className="text-xl mb-4">Domains</h1>

      <input
        className="bg-gray-800 p-3 rounded mr-3"
        placeholder="domain.com"
        onChange={(e) => setDomain(e.target.value)}
      />
      <button
        onClick={addDomain}
        className="bg-green-600 px-6 py-3 rounded"
      >
        Add Domain
      </button>

      <div className="mt-6">
        <h2>My Domains</h2>
        {domains.map((d) => (
          <div key={d.id} className="bg-gray-800 p-3 mt-2 rounded">
            <input
              type="radio"
              name="domain"
              value={d.domain}
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