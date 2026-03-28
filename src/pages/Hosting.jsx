import { useState } from "react";
import API from "../api/api";
import toast from "react-hot-toast";

const Hosting = () => {
  const [domain, setDomain] = useState("");

  const createHosting = async () => {
    await API.post("/hosting/create", { domain, packageName: "starter" });
    toast.success("Hosting Created");
  };

  return (
    <div className="p-8">
      <input
        className="bg-gray-800 p-3 rounded mr-3"
        placeholder="domain.com"
        onChange={(e) => setDomain(e.target.value)}
      />
      <button onClick={createHosting} className="bg-blue-600 px-6 py-3 rounded">
        Create Hosting
      </button>
    </div>
  );
};

export default Hosting;