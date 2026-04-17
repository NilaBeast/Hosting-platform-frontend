import { useEffect, useState } from "react";
import { AdminDomainAPI } from "../../api/api";
import toast from "react-hot-toast";

const years = Array.from({ length: 10 }, (_, i) => i + 1);
const currencies = ["INR", "USD"];

const AdminDomain = () => {
  const [domains, setDomains] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [pricing, setPricing] = useState({});

  const [editedMargins, setEditedMargins] = useState({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await AdminDomainAPI.getPricing();
    setDomains(res.data);
  };

  /* ===============================
     HANDLE INPUT CHANGE
  ============================== */
  const handleMarginChange = (id, field, value) => {
    setEditedMargins((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: Number(value || 0),
      },
    }));
  };

  /* ===============================
     SAVE
  ============================== */
  const saveMargins = async (id) => {
    try {
      const data = editedMargins[id];
      if (!data) return toast.error("No changes");

      await AdminDomainAPI.updateMargins({
        id,
        ...data,
      });

      toast.success("Saved");
      setEditedMargins((prev) => ({ ...prev, [id]: {} }));
      load();
    } catch {
      toast.error("Failed");
    }
  };

  /* ===============================
     TAG
  ============================== */
  const updateTag = async (id, tag) => {
    await AdminDomainAPI.updateTag({ id, tag });
    toast.success("Tag updated");
    load();
  };

  /* ===============================
     SPOTLIGHT
  ============================== */
  const toggleSpotlight = async (id) => {
    try {
      await AdminDomainAPI.toggleSpotlight({ id });
      load();
    } catch (err) {
      toast.error(err.response?.data || "Max 10 spotlight allowed");
    }
  };

  /* ===============================
     FINAL PRICE
  ============================== */
  const final = (base, margin) => {
    return Number(base || 0) + Number(margin || 0);
  };

  /* ===============================
     MODAL
  ============================== */
  const openModal = (domain) => {
    setSelectedDomain(domain);
    setPricing(domain.pricing_json || {});
    setModalOpen(true);
  };

  const toggleCurrency = (year, currency, enabled) => {
    setPricing((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        [currency]: {
          ...prev[year]?.[currency],
          enabled,
        },
      },
    }));
  };

  const updateField = (year, currency, field, value) => {
    setPricing((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        [currency]: {
          ...prev[year]?.[currency],
          [field]: value,
        },
      },
    }));
  };

  const saveAdvanced = async () => {
    await AdminDomainAPI.updateAdvancedPricing({
      id: selectedDomain.id,
      pricing,
    });

    toast.success("Advanced pricing saved");
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] text-white p-10">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Domain Pricing</h1>
        <p className="text-gray-400 text-sm">
          WBeen base price + your margin = final selling price
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white/5 border border-gray-700 rounded-2xl overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-14 px-6 py-4 bg-white/10 text-sm font-semibold">
          <div>TLD</div>

          <div>Base Reg</div>
          <div>Margin</div>
          <div>Final</div>

          <div>Base Ren</div>
          <div>Margin</div>
          <div>Final</div>

          <div>Base Tr</div>
          <div>Margin</div>
          <div>Final</div>

          <div>Tag</div>
          <div>Spot</div>
          <div>Pricing</div>
          <div>Save</div>
        </div>

        {/* ROWS */}
        {domains.map((d) => {
          const edited = editedMargins[d.id] || {};

          const regMargin = edited.register_margin ?? d.register_margin ?? 0;
          const renMargin = edited.renew_margin ?? d.renew_margin ?? 0;
          const trMargin = edited.transfer_margin ?? d.transfer_margin ?? 0;

          return (
            <div
              key={d.id}
              className="grid grid-cols-14 items-center px-6 py-4 border-t border-gray-800"
            >
              <div className="font-bold">{d.tld}</div>

              {/* REGISTER */}
              <div>₹{d.register_price}</div>

              <input
                type="number"
                value={regMargin}
                onChange={(e) =>
                  handleMarginChange(d.id, "register_margin", e.target.value)
                }
                className="input"
              />

              <div className="text-green-400 font-semibold">
                ₹{final(d.register_price, regMargin)}
              </div>

              {/* RENEW */}
              <div>₹{d.renew_price}</div>

              <input
                type="number"
                value={renMargin}
                onChange={(e) =>
                  handleMarginChange(d.id, "renew_margin", e.target.value)
                }
                className="input"
              />

              <div className="text-blue-400 font-semibold">
                ₹{final(d.renew_price, renMargin)}
              </div>

              {/* TRANSFER */}
              <div>₹{d.transfer_price}</div>

              <input
                type="number"
                value={trMargin}
                onChange={(e) =>
                  handleMarginChange(d.id, "transfer_margin", e.target.value)
                }
                className="input"
              />

              <div className="text-purple-400 font-semibold">
                ₹{final(d.transfer_price, trMargin)}
              </div>

              {/* TAG */}
              <select
                value={d.tag || ""}
                onChange={(e) => updateTag(d.id, e.target.value)}
                className="input"
              >
                <option value="">None</option>
                <option value="sale">SALE</option>
                <option value="hot">HOT</option>
                <option value="new">NEW</option>
              </select>

              {/* SPOTLIGHT */}
              <input
                type="checkbox"
                checked={d.is_spotlight}
                onChange={() => toggleSpotlight(d.id)}
              />

              {/* PRICING */}
              <button
                onClick={() => openModal(d)}
                className="bg-blue-600 px-3 py-1 rounded"
              >
                Pricing
              </button>

              {/* SAVE */}
              <button
                onClick={() => saveMargins(d.id)}
                className="bg-green-600 px-3 py-1 rounded"
              >
                Save
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL (UNCHANGED UI) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center">
          <div className="bg-[#020617] p-6 rounded-xl w-[800px] max-h-[90vh] overflow-y-auto">

            <h2 className="text-xl mb-4">
              Pricing - {selectedDomain?.tld}
            </h2>

            {years.map((year) => (
              <div key={year} className="mb-4 border-b pb-3">
                <h3>{year} Year</h3>

                {currencies.map((cur) => (
                  <div key={cur}>
                    <input
                      type="checkbox"
                      checked={pricing[year]?.[cur]?.enabled || false}
                      onChange={(e) =>
                        toggleCurrency(year, cur, e.target.checked)
                      }
                    />
                    {cur}

                    {pricing[year]?.[cur]?.enabled && (
                      <div className="flex gap-2 mt-2">
                        <input placeholder="Register" className="input" />
                        <input placeholder="Transfer" className="input" />
                        <input placeholder="Renew" className="input" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}

            <button onClick={saveAdvanced} className="bg-green-600 px-4 py-2">
              Save Pricing
            </button>

            <button
              onClick={() => setModalOpen(false)}
              className="bg-gray-600 px-4 py-2 ml-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          .input {
            background: rgba(0,0,0,0.4);
            border: 1px solid #374151;
            padding: 6px;
            border-radius: 6px;
            width: 80px;
          }
        `}
      </style>
    </div>
  );
};

export default AdminDomain;