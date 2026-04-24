import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AdminAPI } from "../../api/api";

const AdminUserDetails = () => {
  const { id } = useParams();
  const userId = Number(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");

  const [serverData, setServerData] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [contacts, setContacts] = useState([]);

  const tabs = useMemo(
    () => [
      { key: "summary", label: "Summary" },
      { key: "profile", label: "Profile" },
      { key: "users", label: "Users" },
      { key: "contacts", label: "Contacts" },
      { key: "services", label: "Products/Services" },
      { key: "domains", label: "Domains" },
      { key: "billable", label: "Billable Items" },
      { key: "invoices", label: "Invoices" },
      { key: "transactions", label: "Transactions" },
      { key: "tickets", label: "Tickets" },
      { key: "emails", label: "Emails" },
    ],
    []
  );

  const load = async () => {
    try {
      setLoading(true);
      const res = await AdminAPI.getUserDetails(userId);
      setServerData(res.data);
      setUser({ ...res.data.user, password: "" });
      setProfile(res.data.profile || {});
      setContacts(Array.isArray(res.data.contacts) ? res.data.contacts : []);
    } catch (err) {
      toast.error(err.response?.data || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    load();
  }, [userId]);

  const save = async () => {
    try {
      const userPayload = { ...(user || {}) };
      if (!userPayload.password) delete userPayload.password;

      await AdminAPI.updateUserDetails(userId, {
        user: userPayload,
        profile,
        contacts,
      });
      toast.success("Saved");
      await load();
    } catch (err) {
      toast.error(err.response?.data || "Save failed");
    }
  };

  const setUserField = (key, value) =>
    setUser((prev) => ({ ...(prev || {}), [key]: value }));

  const setProfileField = (key, value) =>
    setProfile((prev) => ({ ...(prev || {}), [key]: value }));

  const addContact = () => {
    setContacts((prev) => [
      ...(prev || []),
      {
        firstName: "",
        lastName: "",
        companyName: "",
        email: "",
        phone: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        postcode: "",
        country: "",
      },
    ]);
  };

  const updateContact = (index, key, value) => {
    setContacts((prev) =>
      (prev || []).map((c, i) => (i === index ? { ...c, [key]: value } : c))
    );
  };

  const removeContact = (index) => {
    setContacts((prev) => (prev || []).filter((_, i) => i !== index));
  };

  const addBillableItem = () => {
    const createdAt = new Date().toISOString();
    setProfileField("billableItems", [
      ...(Array.isArray(profile?.billableItems) ? profile.billableItems : []),
      { createdAt, description: "", amount: 0 },
    ]);
  };

  const updateBillableItem = (index, key, value) => {
    const list = Array.isArray(profile?.billableItems) ? profile.billableItems : [];
    setProfileField(
      "billableItems",
      list.map((it, i) => (i === index ? { ...it, [key]: value } : it))
    );
  };

  const removeBillableItem = (index) => {
    const list = Array.isArray(profile?.billableItems) ? profile.billableItems : [];
    setProfileField(
      "billableItems",
      list.filter((_, i) => i !== index)
    );
  };

  const addManualTransaction = () => {
    const createdAt = new Date().toISOString();
    setProfileField("transactions", [
      ...(Array.isArray(profile?.transactions) ? profile.transactions : []),
      {
        createdAt,
        paymentMethod: "",
        description: "",
        amountIn: 0,
        fees: 0,
        amountOut: 0,
      },
    ]);
  };

  const updateManualTransaction = (index, key, value) => {
    const list = Array.isArray(profile?.transactions) ? profile.transactions : [];
    setProfileField(
      "transactions",
      list.map((it, i) => (i === index ? { ...it, [key]: value } : it))
    );
  };

  const removeManualTransaction = (index) => {
    const list = Array.isArray(profile?.transactions) ? profile.transactions : [];
    setProfileField(
      "transactions",
      list.filter((_, i) => i !== index)
    );
  };

  const summary = serverData?.summary || {};
  const domains = serverData?.domains || [];
  const hostingAccounts = serverData?.hostingAccounts || [];
  const orders = serverData?.orders || [];
  const invoices = serverData?.invoices || [];
  const tickets = serverData?.tickets || [];
  const emailLogs = serverData?.emailLogs || [];

  const ordersForDisplay = useMemo(() => {
    if (Array.isArray(orders) && orders.length > 0) return orders;

    const fromServices = (Array.isArray(hostingAccounts) ? hostingAccounts : []).map((h) => ({
      id: `SVC-${h?.id ?? ""}`,
      domain: h?.domain ?? null,
      total_price:
        typeof h?.amount === "number"
          ? h.amount
          : Number(h?.amount || h?.price || h?.recurring_amount || 0) || null,
      status: h?.status ?? null,
      createdAt: h?.createdAt ?? h?.created_at ?? null,
    }));

    const fromDomains = (Array.isArray(domains) ? domains : []).map((d) => ({
      id: `DOM-${d?.id ?? ""}`,
      domain: d?.domain ?? null,
      total_price:
        typeof d?.recurring_amount === "number"
          ? d.recurring_amount
          : Number(d?.recurring_amount || 0) || null,
      status: d?.status ?? null,
      createdAt: d?.createdAt ?? d?.created_at ?? null,
    }));

    return [...fromServices, ...fromDomains];
  }, [domains, hostingAccounts, orders]);

  const ordersCount = ordersForDisplay.length;

  const billableItems = Array.isArray(profile?.billableItems)
    ? profile.billableItems
    : [];
  const manualTransactions = Array.isArray(profile?.transactions)
    ? profile.transactions
    : [];

  const formatINR = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(n);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    if (typeof value === "string" && (value === "0000-00-00" || value === "0000-00-00 00:00:00")) {
      return "-";
    }
    const d = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(d.getTime())) return String(value);
    return d.toLocaleDateString();
  };

  if (!userId) {
    return (
      <div className="text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">User</h1>
          <button
            className="bg-gray-700 px-4 py-2 rounded"
            onClick={() => navigate("/admin/users")}
          >
            Back
          </button>
        </div>
        <div className="mt-4 bg-[#0f172a] p-4 rounded">Invalid user id</div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            #{user?.id} - {user?.name || "User"}
          </h1>
          <div className="text-sm text-gray-300">{user?.email}</div>
        </div>

        <div className="flex gap-2">
          <button
            className="bg-gray-700 px-4 py-2 rounded"
            onClick={() => navigate("/admin/users")}
          >
            Back
          </button>
          <button
            className="bg-blue-600 px-4 py-2 rounded disabled:opacity-50"
            onClick={save}
            disabled={loading}
          >
            Save
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-b border-gray-800 pb-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1 rounded ${
              activeTab === t.key
                ? "bg-blue-600"
                : "bg-[#0f172a] hover:bg-[#111c33]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-4 bg-[#0f172a] p-4 rounded">Loading...</div>
      )}

      {!loading && activeTab === "summary" && (
        <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="bg-[#0f172a] rounded p-4">
            <div className="font-semibold mb-3">Clients Information</div>
            <div className="text-sm text-gray-200 space-y-2">
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Name</span>
                <span className="text-right">{user?.name || "-"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Email</span>
                <span className="text-right">{user?.email || "-"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Phone</span>
                <span className="text-right">{user?.phone || "-"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Company</span>
                <span className="text-right">{profile?.companyName || "-"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Address</span>
                <span className="text-right">
                  {user?.address1 || user?.address2
                    ? [user?.address1, user?.address2].filter(Boolean).join(", ")
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">City</span>
                <span className="text-right">{user?.city || "-"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">State</span>
                <span className="text-right">{user?.state || "-"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Postcode</span>
                <span className="text-right">{user?.postcode || "-"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Country</span>
                <span className="text-right">{user?.country || "-"}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] rounded p-4">
            <div className="font-semibold mb-3">Invoices/Billing</div>
            <div className="text-sm text-gray-200 space-y-2">
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Invoices</span>
                <span className="text-right">{summary.totalInvoices ?? 0}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Orders</span>
                <span className="text-right">{ordersCount}</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs text-gray-400 mb-2">Recent Invoices</div>
              <div className="space-y-2">
                {invoices.slice(0, 5).map((inv) => (
                  <div
                    key={inv.id}
                    className="flex justify-between bg-[#020617] p-2 rounded text-sm"
                  >
                    <span>{inv.invoice_number || `#${inv.id}`}</span>
                    <span className="text-gray-300">{inv.status || "-"}</span>
                  </div>
                ))}
                {invoices.length === 0 && (
                  <div className="text-sm text-gray-400">No invoices</div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] rounded p-4">
            <div className="font-semibold mb-3">Products/Services</div>
            <div className="text-sm text-gray-200 space-y-2">
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Hosting Accounts</span>
                <span className="text-right">
                  {summary.totalHostingAccounts ?? 0}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Domains</span>
                <span className="text-right">{summary.totalDomains ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === "profile" && (
        <div className="mt-4 bg-[#0f172a] rounded p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="font-semibold">Client Details</div>
              <input
                className="w-full p-2 bg-[#020617] rounded"
                placeholder="Name"
                value={user?.name || ""}
                onChange={(e) => setUserField("name", e.target.value)}
              />
              <input
                className="w-full p-2 bg-[#020617] rounded"
                placeholder="Email"
                value={user?.email || ""}
                onChange={(e) => setUserField("email", e.target.value)}
              />
              <input
                className="w-full p-2 bg-[#020617] rounded"
                placeholder="Company Name"
                value={profile?.companyName || ""}
                onChange={(e) => setProfileField("companyName", e.target.value)}
              />
              <input
                className="w-full p-2 bg-[#020617] rounded"
                placeholder="Tax ID"
                value={profile?.taxId || ""}
                onChange={(e) => setProfileField("taxId", e.target.value)}
              />
              <select
                className="w-full p-2 bg-[#020617] rounded"
                value={profile?.status || "Active"}
                onChange={(e) => setProfileField("status", e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="font-semibold">Address</div>
              <input
                className="w-full p-2 bg-[#020617] rounded"
                placeholder="Phone"
                value={user?.phone || ""}
                onChange={(e) => setUserField("phone", e.target.value)}
              />
              <input
                className="w-full p-2 bg-[#020617] rounded"
                placeholder="Address 1"
                value={user?.address1 || ""}
                onChange={(e) => setUserField("address1", e.target.value)}
              />
              <input
                className="w-full p-2 bg-[#020617] rounded"
                placeholder="Address 2"
                value={user?.address2 || ""}
                onChange={(e) => setUserField("address2", e.target.value)}
              />
              <input
                className="w-full p-2 bg-[#020617] rounded"
                placeholder="City"
                value={user?.city || ""}
                onChange={(e) => setUserField("city", e.target.value)}
              />
              <input
                className="w-full p-2 bg-[#020617] rounded"
                placeholder="State/Region"
                value={user?.state || ""}
                onChange={(e) => setUserField("state", e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  className="w-full p-2 bg-[#020617] rounded"
                  placeholder="Postcode"
                  value={user?.postcode || ""}
                  onChange={(e) => setUserField("postcode", e.target.value)}
                />
                <input
                  className="w-full p-2 bg-[#020617] rounded"
                  placeholder="Country"
                  value={user?.country || ""}
                  onChange={(e) => setUserField("country", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === "users" && (
        <div className="mt-4 bg-[#0f172a] rounded p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="font-semibold">Account</div>
              <div className="text-sm text-gray-300">
                Created:{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleString()
                  : "-"}
              </div>
              <div className="text-sm text-gray-300">
                Updated:{" "}
                {user?.updatedAt
                  ? new Date(user.updatedAt).toLocaleString()
                  : "-"}
              </div>
            </div>

            <div className="space-y-3">
              <div className="font-semibold">Permissions</div>
              <select
                className="w-full p-2 bg-[#020617] rounded"
                value={user?.role || "user"}
                onChange={(e) => setUserField("role", e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <input
                className="w-full p-2 bg-[#020617] rounded"
                placeholder="Set New Password (optional)"
                type="password"
                value={user?.password || ""}
                onChange={(e) => setUserField("password", e.target.value)}
              />
              <div className="text-xs text-gray-400">
                Leaving password blank keeps the current password.
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === "contacts" && (
        <div className="mt-4 bg-[#0f172a] rounded p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold">Contacts</div>
            <button
              className="bg-blue-600 px-3 py-2 rounded"
              onClick={addContact}
            >
              Add Contact
            </button>
          </div>

          {contacts.length === 0 && (
            <div className="text-gray-400 text-sm">No contacts</div>
          )}

          <div className="space-y-4">
            {contacts.map((c, idx) => (
              <div key={idx} className="bg-[#020617] rounded p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-sm">
                    {c.firstName || c.lastName
                      ? `${c.firstName || ""} ${c.lastName || ""}`.trim()
                      : `Contact ${idx + 1}`}
                  </div>
                  <button
                    className="bg-red-600 px-3 py-1 rounded text-sm"
                    onClick={() => removeContact(idx)}
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <input
                    className="w-full p-2 bg-[#0f172a] rounded"
                    placeholder="First Name"
                    value={c.firstName || ""}
                    onChange={(e) =>
                      updateContact(idx, "firstName", e.target.value)
                    }
                  />
                  <input
                    className="w-full p-2 bg-[#0f172a] rounded"
                    placeholder="Last Name"
                    value={c.lastName || ""}
                    onChange={(e) =>
                      updateContact(idx, "lastName", e.target.value)
                    }
                  />
                  <input
                    className="w-full p-2 bg-[#0f172a] rounded"
                    placeholder="Company Name"
                    value={c.companyName || ""}
                    onChange={(e) =>
                      updateContact(idx, "companyName", e.target.value)
                    }
                  />
                  <input
                    className="w-full p-2 bg-[#0f172a] rounded"
                    placeholder="Email"
                    value={c.email || ""}
                    onChange={(e) => updateContact(idx, "email", e.target.value)}
                  />
                  <input
                    className="w-full p-2 bg-[#0f172a] rounded"
                    placeholder="Phone"
                    value={c.phone || ""}
                    onChange={(e) => updateContact(idx, "phone", e.target.value)}
                  />
                  <input
                    className="w-full p-2 bg-[#0f172a] rounded"
                    placeholder="Address 1"
                    value={c.address1 || ""}
                    onChange={(e) =>
                      updateContact(idx, "address1", e.target.value)
                    }
                  />
                  <input
                    className="w-full p-2 bg-[#0f172a] rounded"
                    placeholder="Address 2"
                    value={c.address2 || ""}
                    onChange={(e) =>
                      updateContact(idx, "address2", e.target.value)
                    }
                  />
                  <input
                    className="w-full p-2 bg-[#0f172a] rounded"
                    placeholder="City"
                    value={c.city || ""}
                    onChange={(e) => updateContact(idx, "city", e.target.value)}
                  />
                  <input
                    className="w-full p-2 bg-[#0f172a] rounded"
                    placeholder="State/Region"
                    value={c.state || ""}
                    onChange={(e) => updateContact(idx, "state", e.target.value)}
                  />
                  <input
                    className="w-full p-2 bg-[#0f172a] rounded"
                    placeholder="Postcode"
                    value={c.postcode || ""}
                    onChange={(e) =>
                      updateContact(idx, "postcode", e.target.value)
                    }
                  />
                  <input
                    className="w-full p-2 bg-[#0f172a] rounded"
                    placeholder="Country"
                    value={c.country || ""}
                    onChange={(e) =>
                      updateContact(idx, "country", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && activeTab === "services" && (
        <div className="mt-4 space-y-4">
          <div className="bg-[#0f172a] rounded p-4">
            <div className="font-semibold mb-3">Hosting Accounts</div>
            {hostingAccounts.length === 0 ? (
              <div className="text-sm text-gray-400">No hosting accounts</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left">
                      <th className="py-2 pr-4">cPanel</th>
                      <th className="py-2 pr-4">Domain</th>
                      <th className="py-2 pr-4">Billing</th>
                      <th className="py-2 pr-4">Next Due</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hostingAccounts.map((h) => (
                      <tr key={h.id} className="border-b border-gray-900">
                        <td className="py-2 pr-4">{h.cpanel_username || "-"}</td>
                        <td className="py-2 pr-4">{h.domain || "-"}</td>
                        <td className="py-2 pr-4">{h.billing_cycle || "-"}</td>
                        <td className="py-2 pr-4">
                          {h.next_due_date
                            ? new Date(h.next_due_date).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-2 pr-4">{h.status || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-[#0f172a] rounded p-4">
            <div className="font-semibold mb-3">Domains</div>
            {domains.length === 0 ? (
              <div className="text-sm text-gray-400">No domains</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left">
                      <th className="py-2 pr-4">Domain</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Expiry</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domains.map((d) => (
                      <tr key={d.id} className="border-b border-gray-900">
                        <td className="py-2 pr-4">{d.domain || "-"}</td>
                        <td className="py-2 pr-4">{d.type || "-"}</td>
                        <td className="py-2 pr-4">
                          {d.expiry_date
                            ? new Date(d.expiry_date).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-2 pr-4">{d.status || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-[#0f172a] rounded p-4">
            <div className="font-semibold mb-3">Orders</div>
            {ordersForDisplay.length === 0 ? (
              <div className="text-sm text-gray-400">No orders</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left">
                      <th className="py-2 pr-4">ID</th>
                      <th className="py-2 pr-4">Domain</th>
                      <th className="py-2 pr-4">Total</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersForDisplay.map((o) => (
                      <tr key={o.id} className="border-b border-gray-900">
                        <td className="py-2 pr-4">#{o.id}</td>
                        <td className="py-2 pr-4">{o.domain || "-"}</td>
                        <td className="py-2 pr-4">
                          {typeof o.total_price === "number"
                            ? o.total_price
                            : "-"}
                        </td>
                        <td className="py-2 pr-4">{o.status || "-"}</td>
                        <td className="py-2 pr-4">
                          {o.createdAt
                            ? new Date(o.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && activeTab === "domains" && (
        <div className="mt-4 bg-[#0f172a] rounded p-4">
          {domains.length === 0 ? (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-6 rounded text-center">
              No domains found for this user.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="py-2 pr-4">Domain</th>
                    <th className="py-2 pr-4">Registrar</th>
                    <th className="py-2 pr-4">Registration Date</th>
                    <th className="py-2 pr-4">Next Due Date</th>
                    <th className="py-2 pr-4">Expiry Date</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {domains.map((d) => (
                    <tr key={d.id} className="border-b border-gray-900">
                      <td className="py-2 pr-4">{d.domain || "-"}</td>
                      <td className="py-2 pr-4">-</td>
                      <td className="py-2 pr-4">
                        {formatDate(d.registration_date)}
                      </td>
                      <td className="py-2 pr-4">
                        {formatDate(d.next_due_date)}
                      </td>
                      <td className="py-2 pr-4">
                        {formatDate(d.expiry_date)}
                      </td>
                      <td className="py-2 pr-4">{d.status || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === "billable" && (
        <div className="mt-4 bg-[#0f172a] rounded p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold">Billable Items</div>
            <button
              className="bg-blue-600 px-3 py-2 rounded"
              onClick={addBillableItem}
            >
              Add Billable Item
            </button>
          </div>

          {billableItems.length === 0 ? (
            <div className="text-gray-400 text-sm">No billable items</div>
          ) : (
            <div className="space-y-3">
              {billableItems.map((it, idx) => (
                <div key={idx} className="bg-[#020617] rounded p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-300">
                      {it.createdAt
                        ? new Date(it.createdAt).toLocaleString()
                        : "-"}
                    </div>
                    <button
                      className="bg-red-600 px-3 py-1 rounded text-sm"
                      onClick={() => removeBillableItem(idx)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <input
                      className="w-full p-2 bg-[#0f172a] rounded"
                      placeholder="Description"
                      value={it.description || ""}
                      onChange={(e) =>
                        updateBillableItem(idx, "description", e.target.value)
                      }
                    />
                    <input
                      className="w-full p-2 bg-[#0f172a] rounded"
                      placeholder="Amount"
                      type="number"
                      value={it.amount ?? 0}
                      onChange={(e) =>
                        updateBillableItem(idx, "amount", Number(e.target.value))
                      }
                    />
                    <div className="flex items-center text-sm text-gray-300">
                      {formatINR(it.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === "invoices" && (
        <div className="mt-4 bg-[#0f172a] rounded p-4">
          <div className="font-semibold mb-3">Invoices</div>
          {invoices.length === 0 ? (
            <div className="text-gray-400 text-sm">No invoices</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="py-2 pr-4">Invoice</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-900">
                      <td className="py-2 pr-4">
                        {inv.invoice_number || `#${inv.id}`}
                      </td>
                      <td className="py-2 pr-4">{formatINR(inv.amount)}</td>
                      <td className="py-2 pr-4">{inv.status || "-"}</td>
                      <td className="py-2 pr-4">
                        {inv.createdAt
                          ? new Date(inv.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === "transactions" && (() => {
        const systemTransactions = (orders || [])
          .filter((o) => Number.isFinite(Number(o.payment_amount || o.total_price)))
          .map((o) => ({
            source: "system",
            createdAt: o.createdAt,
            paymentMethod: o.payment_method || o.paymentMethod || "-",
            description: `Order #${o.id}${o.domain ? ` - ${o.domain}` : ""}`,
            amountIn: Number(o.payment_amount || o.total_price || 0),
            fees: 0,
            amountOut: 0,
          }));

        const manual = (manualTransactions || []).map((t) => ({
          ...t,
          source: t?.source || "manual",
        }));

        const all = [...systemTransactions, ...manual].sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });

        const totalIn = all.reduce((sum, t) => sum + (Number(t.amountIn) || 0), 0);
        const totalOut = all.reduce((sum, t) => sum + (Number(t.amountOut) || 0), 0);
        const totalFees = all.reduce((sum, t) => sum + (Number(t.fees) || 0), 0);
        const balance = totalIn - totalOut - totalFees;

        return (
          <div className="mt-4 space-y-4">
            <div className="flex justify-end">
              <button
                className="bg-blue-600 px-3 py-2 rounded"
                onClick={addManualTransaction}
              >
                + Add New Transaction
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-[#0f172a] rounded p-4">
                <div className="text-gray-400 text-xs">TOTAL IN</div>
                <div className="text-xl font-semibold">{formatINR(totalIn)}</div>
              </div>
              <div className="bg-[#0f172a] rounded p-4">
                <div className="text-gray-400 text-xs">TOTAL FEES</div>
                <div className="text-xl font-semibold">{formatINR(totalFees)}</div>
              </div>
              <div className="bg-[#0f172a] rounded p-4">
                <div className="text-gray-400 text-xs">TOTAL OUT</div>
                <div className="text-xl font-semibold">{formatINR(totalOut)}</div>
              </div>
              <div className="bg-[#0f172a] rounded p-4">
                <div className="text-gray-400 text-xs">BALANCE</div>
                <div className="text-xl font-semibold">{formatINR(balance)}</div>
              </div>
            </div>

            <div className="bg-[#0f172a] rounded p-4">
              {all.length === 0 ? (
                <div className="text-gray-400 text-sm">No transactions</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-left">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Payment Method</th>
                        <th className="py-2 pr-4">Description</th>
                        <th className="py-2 pr-4">Amount In</th>
                        <th className="py-2 pr-4">Fees</th>
                        <th className="py-2 pr-4">Amount Out</th>
                        <th className="py-2 pr-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {all.map((t, idx) => {
                        const manualIndex =
                          t.source === "manual"
                            ? manual.findIndex(
                                (m) =>
                                  m.createdAt === t.createdAt &&
                                  m.description === t.description &&
                                  Number(m.amountIn) === Number(t.amountIn) &&
                                  Number(m.amountOut) === Number(t.amountOut) &&
                                  Number(m.fees) === Number(t.fees)
                              )
                            : -1;

                        return (
                          <tr
                            key={`${t.source}-${idx}`}
                            className="border-b border-gray-900"
                          >
                            <td className="py-2 pr-4">
                              {t.createdAt
                                ? new Date(t.createdAt).toLocaleString()
                                : "-"}
                            </td>
                            <td className="py-2 pr-4">
                              {t.source === "manual" ? (
                                <input
                                  className="bg-[#020617] p-1 rounded w-56"
                                  value={t.paymentMethod || ""}
                                  onChange={(e) =>
                                    updateManualTransaction(
                                      manualIndex,
                                      "paymentMethod",
                                      e.target.value
                                    )
                                  }
                                />
                              ) : (
                                t.paymentMethod || "-"
                              )}
                            </td>
                            <td className="py-2 pr-4">
                              {t.source === "manual" ? (
                                <input
                                  className="bg-[#020617] p-1 rounded w-96"
                                  value={t.description || ""}
                                  onChange={(e) =>
                                    updateManualTransaction(
                                      manualIndex,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                />
                              ) : (
                                t.description || "-"
                              )}
                            </td>
                            <td className="py-2 pr-4">
                              {t.source === "manual" ? (
                                <input
                                  className="bg-[#020617] p-1 rounded w-28"
                                  type="number"
                                  value={t.amountIn ?? 0}
                                  onChange={(e) =>
                                    updateManualTransaction(
                                      manualIndex,
                                      "amountIn",
                                      Number(e.target.value)
                                    )
                                  }
                                />
                              ) : (
                                formatINR(t.amountIn)
                              )}
                            </td>
                            <td className="py-2 pr-4">
                              {t.source === "manual" ? (
                                <input
                                  className="bg-[#020617] p-1 rounded w-24"
                                  type="number"
                                  value={t.fees ?? 0}
                                  onChange={(e) =>
                                    updateManualTransaction(
                                      manualIndex,
                                      "fees",
                                      Number(e.target.value)
                                    )
                                  }
                                />
                              ) : (
                                formatINR(t.fees)
                              )}
                            </td>
                            <td className="py-2 pr-4">
                              {t.source === "manual" ? (
                                <input
                                  className="bg-[#020617] p-1 rounded w-28"
                                  type="number"
                                  value={t.amountOut ?? 0}
                                  onChange={(e) =>
                                    updateManualTransaction(
                                      manualIndex,
                                      "amountOut",
                                      Number(e.target.value)
                                    )
                                  }
                                />
                              ) : (
                                formatINR(t.amountOut)
                              )}
                            </td>
                            <td className="py-2 pr-4">
                              {t.source === "manual" ? (
                                <button
                                  className="bg-red-600 px-3 py-1 rounded"
                                  onClick={() => removeManualTransaction(manualIndex)}
                                >
                                  Delete
                                </button>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {!loading && activeTab === "tickets" && (() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
        const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);

        const openedThisMonth = tickets.filter((t) => {
          const dt = t.createdAt ? new Date(t.createdAt) : null;
          return dt && dt >= startOfMonth;
        }).length;

        const openedLastMonth = tickets.filter((t) => {
          const dt = t.createdAt ? new Date(t.createdAt) : null;
          return dt && dt >= startOfLastMonth && dt <= endOfLastMonth;
        }).length;

        const openedThisYear = tickets.filter((t) => {
          const dt = t.createdAt ? new Date(t.createdAt) : null;
          return dt && dt >= startOfYear;
        }).length;

        const openedLastYear = tickets.filter((t) => {
          const dt = t.createdAt ? new Date(t.createdAt) : null;
          return dt && dt >= startOfLastYear && dt <= endOfLastYear;
        }).length;

        return (
          <div className="mt-4 space-y-4">
            <div className="flex justify-end gap-2">
              <button
                className="bg-blue-600 px-3 py-2 rounded"
                onClick={() => navigate("/admin/open-ticket")}
              >
                + Open New Ticket
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-[#0f172a] rounded p-4">
                <div className="text-gray-400 text-xs">OPENED THIS MONTH</div>
                <div className="text-xl font-semibold">{openedThisMonth}</div>
              </div>
              <div className="bg-[#0f172a] rounded p-4">
                <div className="text-gray-400 text-xs">OPENED LAST MONTH</div>
                <div className="text-xl font-semibold">{openedLastMonth}</div>
              </div>
              <div className="bg-[#0f172a] rounded p-4">
                <div className="text-gray-400 text-xs">OPENED THIS YEAR</div>
                <div className="text-xl font-semibold">{openedThisYear}</div>
              </div>
              <div className="bg-[#0f172a] rounded p-4">
                <div className="text-gray-400 text-xs">OPENED LAST YEAR</div>
                <div className="text-xl font-semibold">{openedLastYear}</div>
              </div>
            </div>

            <div className="bg-[#0f172a] rounded p-4">
              {tickets.length === 0 ? (
                <div className="text-gray-400 text-sm">No tickets</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-left">
                        <th className="py-2 pr-4">Date Opened</th>
                        <th className="py-2 pr-4">Department</th>
                        <th className="py-2 pr-4">Subject</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Last Reply</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((t) => (
                        <tr key={t.id} className="border-b border-gray-900">
                          <td className="py-2 pr-4">
                            {t.createdAt
                              ? new Date(t.createdAt).toLocaleString()
                              : "-"}
                          </td>
                          <td className="py-2 pr-4">{t.department || "-"}</td>
                          <td className="py-2 pr-4">{t.subject || "-"}</td>
                          <td className="py-2 pr-4">{t.status || "-"}</td>
                          <td className="py-2 pr-4">
                            {t.lastReplyAt
                              ? new Date(t.lastReplyAt).toLocaleString()
                              : t.updatedAt
                                ? new Date(t.updatedAt).toLocaleString()
                                : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {!loading && activeTab === "emails" && (
        <div className="mt-4 bg-[#0f172a] rounded p-4">
          <div className="mb-4">
            <div className="font-semibold">Emails</div>
            <div className="text-sm text-gray-400">
              Shows emails sent by the platform to this client (order/payment/ticket/invoice, etc.).
            </div>
          </div>

          {Array.isArray(emailLogs) && emailLogs.length > 0 ? (
            <div className="space-y-3">
              {emailLogs.map((m) => (
                <div key={m.id} className="bg-[#020617] rounded p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div className="text-sm text-gray-300">
                      {m.createdAt ? new Date(m.createdAt).toLocaleString() : "-"}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`px-2 py-1 rounded ${
                          (m.status || "").toLowerCase() === "sent"
                            ? "bg-emerald-600"
                            : "bg-red-600"
                        }`}
                      >
                        {m.status || "unknown"}
                      </div>
                      <div className="px-2 py-1 rounded bg-[#0f172a] text-gray-300">
                        {m.source || "unknown"}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-300">
                    <span className="text-gray-400">To:</span> {m.to_email || "-"}
                  </div>
                  <div className="mt-2 font-semibold">{m.subject || "(No subject)"}</div>

                  {(m.body_text || m.body_html || m.error_message) && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-blue-400">
                        View details
                      </summary>
                      {m.error_message && (
                        <div className="mt-2 text-sm text-red-300 whitespace-pre-wrap">
                          {m.error_message}
                        </div>
                      )}
                      <div className="mt-2 text-sm text-gray-200 whitespace-pre-wrap">
                        {m.body_text || m.body_html || ""}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">No emails found for this user.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUserDetails;
