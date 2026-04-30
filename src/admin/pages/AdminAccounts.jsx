import { useEffect, useState } from "react";
import { AdminAccountsAPI } from "../../api/api";
import toast from "react-hot-toast";

const AdminAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [syncing, setSyncing] = useState(false);

  const load = async (silent = false) => {
    try {
      setSyncing(true);
      const res = await AdminAccountsAPI.getAccounts();
      const payload = res.data;
      const list = Array.isArray(payload) ? payload : payload?.accounts;
      setAccounts(Array.isArray(list) ? list : []);
      if (!silent) {
        if (payload?.whmError) {
          toast.error(payload.whmError);
        } else if (payload?.whmCached && payload?.whmFetchedAt) {
          toast.error(
            `WHM unreachable, showing cached data (${payload.whmFetchedAt})`
          );
        }
      }
    } catch {
      if (!silent) toast.error("Failed to sync WHM accounts");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    load(true);
  }, []);

  /* SELECT */
  const toggleSelect = (acc) => {
    if (selected.find((a) => a.domain === acc.domain)) {
      setSelected(selected.filter((a) => a.domain !== acc.domain));
    } else {
      setSelected([...selected, acc]);
    }
  };

  /* IMPORT */
  const importAccounts = async () => {
    await AdminAccountsAPI.importAccounts({
      accounts: selected,
    });

    setSelected([]);
    load();
  };

  return (
    <div className="p-10 text-white bg-[#020617] min-h-screen">

      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Accounts</h1>

        <button
          onClick={() => load(false)}
          className="bg-blue-600 px-4 py-2 rounded disabled:opacity-60"
          disabled={syncing}
        >
          {syncing ? "Syncing..." : "🔄 Sync WHM"}
        </button>
      </div>

      <div className="bg-white/5 border border-gray-700 rounded-xl">

        {/* HEADER */}
        <div className="grid grid-cols-8 px-6 py-4 bg-white/10 text-sm">
          <div>Status</div>
          <div>Domain</div>
          <div>IP</div>
          <div>Username</div>
          <div>Plan</div>
          <div>Created</div>
          <div>Select</div>
        </div>

        {/* ROWS */}
        {accounts.map((acc, i) => (
          <div
            key={i}
            className={`grid grid-cols-8 px-6 py-3 border-t border-gray-800 ${
              acc.existsInDB ? "bg-green-900/30" : "bg-red-900/20"
            }`}
          >
            {/* STATUS */}
            <div className="text-xl">
              {acc.existsInDB ? "✅" : "❌"}
            </div>

            <div>{acc.domain}</div>
            <div>{acc.ip}</div>
            <div>{acc.username}</div>
            <div>{acc.plan}</div>
            <div>{acc.created}</div>

            {/* SELECT */}
            <div>
              {!acc.existsInDB && (
                <input
                  type="checkbox"
                  checked={selected.find(
                    (a) => a.domain === acc.domain
                  )}
                  onChange={() => toggleSelect(acc)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* IMPORT BUTTON */}
      {selected.length > 0 && (
        <div className="mt-6">
          <button
            onClick={importAccounts}
            className="bg-green-600 px-6 py-3 rounded"
          >
            Import Selected ({selected.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminAccounts;
