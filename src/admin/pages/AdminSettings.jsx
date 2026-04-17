import { useEffect, useState } from "react";
import { AdminProductAPI } from "../../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AdminSettings = () => {
  const [groups, setGroups] = useState([]);
  const [packages, setPackages] = useState([]);

  const [groupModal, setGroupModal] = useState(false);
  const [productModal, setProductModal] = useState(false);

  const [editGroup, setEditGroup] = useState(null);
  const [editProduct, setEditProduct] = useState(null);

  const [form, setForm] = useState({});
  const [productForm, setProductForm] = useState({});
const navigate = useNavigate();
  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const g = await AdminProductAPI.getGroups();
    const p = await AdminProductAPI.getWHMPackages();

    setGroups(g.data);
    setPackages(p.data);
  };

  /* ================= GROUP ================= */

  const openCreateGroup = () => {
    setForm({});
    setEditGroup(null);
    setGroupModal(true);
  };

  const openEditGroup = (g) => {
    setForm(g);
    setEditGroup(g);
    setGroupModal(true);
  };

  const saveGroup = async () => {
    if (!form.name) return toast.error("Group name required");

    if (editGroup) {
      await AdminProductAPI.updateGroup(editGroup.id, form);
    } else {
      await AdminProductAPI.createGroup(form);
    }

    toast.success("Saved");
    setGroupModal(false);
    load();
  };

  const deleteGroup = async (id) => {
    if (!confirm("Delete group?")) return;
    await AdminProductAPI.deleteGroup(id);
    load();
  };

  /* ================= PRODUCT ================= */

  const openCreateProduct = () => {
    setProductForm({});
    setEditProduct(null);
    setProductModal(true);
  };

  const openEditProduct = (p) => {
    setProductForm(p);
    setEditProduct(p);
    setProductModal(true);
  };

  const saveProduct = async () => {
    if (!productForm.name) return toast.error("Product name required");

    if (editProduct) {
      await AdminProductAPI.updateProduct(editProduct.id, productForm);
    } else {
      await AdminProductAPI.createProduct(productForm);
    }

    toast.success("Saved");
    setProductModal(false);
    load();
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete product?")) return;
    await AdminProductAPI.deleteProduct(id);
    load();
  };

  return (
    <div className="p-10 text-white bg-[#020617] min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Products / Services</h1>

        <div className="flex gap-3">
          <button onClick={openCreateGroup} className="bg-green-600 px-4 py-2 rounded">
            + Create Group
          </button>

          <button onClick={openCreateProduct} className="bg-blue-600 px-4 py-2 rounded">
            + Create Product
          </button>
        </div>
      </div>

      {/* GROUP LIST */}
      {groups.map((g) => (
        <div key={g.id} className="mb-6 bg-[#0f172a] p-4 rounded-xl">

          <div className="flex justify-between mb-3">
            <h2 className="text-xl">{g.name}</h2>

            <div className="flex gap-3">
              <button onClick={() => openEditGroup(g)}>Edit</button>
              <button onClick={() => deleteGroup(g.id)}>Delete</button>
            </div>
          </div>

          {g.Products?.map((p) => (
            <div key={p.id} className="flex justify-between border-b py-2">

              <span>{p.name}</span>

              <div className="flex gap-3">
                <button onClick={() => navigate(`/admin/product/${p.id}`)}>Edit</button>
                <button onClick={() => deleteProduct(p.id)}>Delete</button>
              </div>

            </div>
          ))}

        </div>
      ))}

      {/* CREATE / EDIT GROUP */}
      {groupModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center">

          <div className="bg-[#0f172a] p-6 rounded w-[500px]">

            <h2 className="text-xl mb-4">
              {editGroup ? "Edit Group" : "Create Group"}
            </h2>

            <input
              placeholder="Group Name"
              className="w-full p-2 bg-black mb-2"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Headline"
              className="w-full p-2 bg-black mb-2"
              value={form.headline || ""}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
            />

            <input
              placeholder="Tagline"
              className="w-full p-2 bg-black mb-2"
              value={form.tagline || ""}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            />

            <button onClick={saveGroup} className="bg-green-600 w-full p-2 mt-2">
              Save
            </button>

          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT */}
      {productModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center">

          <div className="bg-[#0f172a] p-6 rounded w-[600px]">

            <h2 className="text-xl mb-4">
              {editProduct ? "Edit Product" : "Create Product"}
            </h2>

            <input
              placeholder="Product Name"
              className="w-full p-2 bg-black mb-2"
              value={productForm.name || ""}
              onChange={(e) =>
                setProductForm({ ...productForm, name: e.target.value })
              }
            />

            {/* GROUP */}
            <select
              className="w-full p-2 bg-black mb-2"
              onChange={(e) =>
                setProductForm({ ...productForm, group_id: e.target.value })
              }
            >
              <option>Select Group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            {/* WHM PACKAGE */}
            <select
              className="w-full p-2 bg-black mb-2"
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  whm_package_name: e.target.value,
                })
              }
            >
              <option>Select WHM Package</option>
              {packages.map((p) => (
                <option key={p.id} value={p.whm_package_name}>
                  {p.name}
                </option>
              ))}
            </select>

            <textarea
              placeholder="Description"
              className="w-full p-2 bg-black mb-2"
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  description: e.target.value,
                })
              }
            />

            <button onClick={saveProduct} className="bg-blue-600 w-full p-2">
              Save Product
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminSettings;