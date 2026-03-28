import { useState } from "react";
import API from "../api/api";
import toast from "react-hot-toast";

const Domains = () => {
  const [domain, setDomain] = useState("");

  const addDomain = async () => {
    await API.post("/domain/add", { domain });
    toast.success("Domain Added");
  };

  return (
    <div className="p-8">
      <input
        className="bg-gray-800 p-3 rounded mr-3"
        placeholder="domain.com"
        onChange={(e) => setDomain(e.target.value)}
      />
      <button onClick={addDomain} className="bg-green-600 px-6 py-3 rounded">
        Add Domain
      </button>
    </div>
  );
};

export default Domains;