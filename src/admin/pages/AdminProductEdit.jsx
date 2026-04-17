import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AdminProductAPI, AdminDomainAPI } from "../../api/api";
import toast from "react-hot-toast";

/* ================= CONFIG ================= */

const tabs = ["details", "pricing", "upgrades", "free-domain"];

const cycles = [
  "monthly",
  "quarterly",
  "semiannually",
  "annually",
  "biennially",
  "triennially",
];

const currencies = ["INR", "USD"];

/* ================= HELPER ================= */

const slugify = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

/* ================= COMPONENT ================= */

const AdminProductEdit = () => {
  const { id } = useParams();

  const [tab, setTab] = useState("details");
  const [product, setProduct] = useState({});
  const [pricing, setPricing] = useState({});
  const [domains, setDomains] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    load();
  }, []);

  /* ================= LOAD ================= */

  const load = async () => {
    const res = await AdminProductAPI.getGroups();

    let found;
    let products = [];

    setGroups(res.data);

    res.data.forEach((g) => {
      g.Products?.forEach((p) => {
        const productWithGroup = {
          ...p,
          group_name: g.name,
          group_slug: slugify(g.name),
        };

        products.push(productWithGroup);

        if (String(p.id) === String(id)) {
          found = productWithGroup;
        }
      });
    });

    setAllProducts(products);

    if (found) {
      setProduct(found);
      setPricing(found.pricing_json || {});
    }

    const d = await AdminDomainAPI.getPricing();
    setDomains(d.data);
  };

  /* ================= PRICING ================= */

  const toggleEnable = (currency, cycle, value) => {
    setPricing((prev) => ({
      ...prev,
      [currency]: {
        ...prev[currency],
        [cycle]: {
          ...prev[currency]?.[cycle],
          enabled: value,
        },
      },
    }));
  };

  const updateField = (currency, cycle, field, value) => {
    setPricing((prev) => ({
      ...prev,
      [currency]: {
        ...prev[currency],
        [cycle]: {
          ...prev[currency]?.[cycle],
          [field]: Number(value),
        },
      },
    }));
  };

  /* ================= SAVE ================= */

  const save = async () => {
    await AdminProductAPI.updateProduct(id, {
      ...product,
      pricing_json: pricing,
    });

    toast.success("Saved");
  };

  /* ================= URL ================= */

  const productSlug = slugify(product.name);
  const groupSlug = slugify(product.group_name || "");

  const productURL = `http://localhost:5173/store/${groupSlug}/${productSlug}`;

  /* ================= UI ================= */

  return (
    <div className="p-10 text-white bg-[#020617] min-h-screen">

      <h1 className="text-2xl mb-6 font-bold">Edit Product</h1>

      {/* TABS */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded ${
              tab === t ? "bg-blue-600" : "bg-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ================= DETAILS ================= */}
      {tab === "details" && (
        <div className="bg-[#0f172a] p-6 rounded space-y-4">

          {/* PRODUCT NAME */}
          <input
            className="w-full p-2 bg-black text-white"
            placeholder="Product Name"
            value={product.name || ""}
            onChange={(e) =>
              setProduct({ ...product, name: e.target.value })
            }
          />

          {/* SHORT DESCRIPTION */}
          <input
            className="w-full p-2 bg-black text-white"
            placeholder="Short Description"
            value={product.short_description || ""}
            onChange={(e) =>
              setProduct({
                ...product,
                short_description: e.target.value,
              })
            }
          />

          {/* FULL DESCRIPTION */}
          <textarea
            className="w-full p-2 bg-black text-white"
            placeholder="Description"
            value={product.description || ""}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
          />

          {/* GROUP SELECT */}
          <div>
            <label className="text-sm text-gray-400">Product Group</label>

            <select
              value={product.group_id || ""}
              onChange={(e) => {
                const selectedGroup = groups.find(
                  (g) => String(g.id) === e.target.value
                );

                setProduct({
                  ...product,
                  group_id: e.target.value,
                  group_name: selectedGroup?.name,
                });
              }}
              className="w-full p-2 bg-black text-white mt-1"
            >
              <option value="">Select Group</option>

              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* AUTO URL */}
          <div className="bg-black p-3 rounded border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">
              Auto Generated URL
            </p>

            <p className="text-green-400 break-all">
              {productURL}
            </p>
          </div>

          {/* 🔥 GROUP URL */}
<div className="bg-black p-3 rounded border border-gray-700 mt-3">
  <p className="text-sm text-gray-400 mb-1">
    Group URL
  </p>

  <p className="text-blue-400 break-all">
    http://localhost:5173/store/{groupSlug}
  </p>
</div>

        </div>
      )}

      {/* ================= PRICING ================= */}
      {tab === "pricing" && (
        <div className="bg-[#0f172a] p-6 rounded">

          {currencies.map((cur) => (
            <div key={cur} className="mb-6">
              <h3 className="mb-2">{cur}</h3>

              {cycles.map((cycle) => (
                <div key={cycle} className="flex gap-3 mb-2 items-center">

                  <input
                    type="checkbox"
                    checked={pricing[cur]?.[cycle]?.enabled || false}
                    onChange={(e) =>
                      toggleEnable(cur, cycle, e.target.checked)
                    }
                  />

                  <span className="w-32">{cycle}</span>

                  <input
                    placeholder="Setup"
                    className="bg-black text-white p-1"
                    value={pricing[cur]?.[cycle]?.setup_fee || ""}
                    onChange={(e) =>
                      updateField(cur, cycle, "setup_fee", e.target.value)
                    }
                  />

                  <input
                    placeholder="Price"
                    className="bg-black text-white p-1"
                    value={pricing[cur]?.[cycle]?.price || ""}
                    onChange={(e) =>
                      updateField(cur, cycle, "price", e.target.value)
                    }
                  />

                </div>
              ))}
            </div>
          ))}

        </div>
      )}

      {/* ================= UPGRADES ================= */}
      {tab === "upgrades" && (
        <div className="bg-[#0f172a] p-6 rounded">

          <p className="mb-3 text-lg font-semibold">Package Upgrades</p>

          <select
            multiple
            value={(product.upgrades || []).map(String)}
            onChange={(e) => {
              const values = Array.from(
                e.target.selectedOptions,
                (opt) => Number(opt.value)
              );

              setProduct({ ...product, upgrades: values });
            }}
            className="w-full p-2 h-[220px] rounded bg-black text-white border border-gray-700"
          >
            {allProducts
              .filter((p) => p.id !== product.id)
              .map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.group_name} - {p.name}
                </option>
              ))}
          </select>

          <p className="text-sm text-gray-400 mt-2">
            Use Ctrl + Click to select multiple packages
          </p>

          <label className="block mt-4 text-sm">
            <input
              type="checkbox"
              checked={product.allow_upgrade || false}
              onChange={(e) =>
                setProduct({
                  ...product,
                  allow_upgrade: e.target.checked,
                })
              }
            />{" "}
            Allow upgrading/downgrading
          </label>

        </div>
      )}

      {/* ================= FREE DOMAIN ================= */}
      {tab === "free-domain" && (
        <div className="bg-[#0f172a] p-6 rounded">

          <label className="block">
            <input
              type="radio"
              checked={product.free_domain_type === "none"}
              onChange={() =>
                setProduct({ ...product, free_domain_type: "none" })
              }
            />{" "}
            None
          </label>

          <label className="block mt-2">
            <input
              type="radio"
              checked={product.free_domain_type === "free"}
              onChange={() =>
                setProduct({ ...product, free_domain_type: "free" })
              }
            />{" "}
            Offer Free Domain
          </label>

          <div className="mt-4">
            <p>Select TLDs</p>

            <select
              multiple
              className="w-full bg-black text-white p-2 h-[200px] border border-gray-700 rounded"
              value={product.free_domain_tlds || []}
              onChange={(e) => {
                const values = Array.from(
                  e.target.selectedOptions,
                  (opt) => opt.value
                );

                setProduct({
                  ...product,
                  free_domain_tlds: values,
                });
              }}
            >
              {domains.map((d) => (
                <option key={d.tld} value={d.tld}>
                  {d.tld}
                </option>
              ))}
            </select>
          </div>

        </div>
      )}

      {/* SAVE */}
      <button
        onClick={save}
        className="bg-green-600 px-6 py-2 mt-6 rounded"
      >
        Save Changes
      </button>

    </div>
  );
};

export default AdminProductEdit;