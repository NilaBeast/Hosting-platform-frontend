import { useEffect, useState } from "react";
import { AdminAccountsAPI } from "../../api/api";

const AdminAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState([]);

  const load = async () => {
    const res = await AdminAccountsAPI.getAccounts();
    setAccounts(res.data);
  };

  useEffect(() => {
    load();
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
          onClick={load}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          🔄 Sync WHM
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