import { useEffect, useState } from "react";
import API from "../api/api";

const Settings = () => {
  const [githubConnected, setGithubConnected] = useState(false);

  useEffect(() => {
    const checkGithub = async () => {
      const res = await API.get("api/github/status");
      setGithubConnected(res.data.connected);
    };

    checkGithub();
  }, []);

  const connectGithub = () => {
    window.location.href = "http://localhost:5000/api/auth/github";
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-6">Settings</h1>

      <div className="bg-gray-900 p-6 rounded w-96">
        <h2 className="mb-4">GitHub Integration</h2>

        {githubConnected ? (
          <div className="text-green-400">GitHub Connected</div>
        ) : (
          <button
            onClick={connectGithub}
            className="bg-gray-800 px-6 py-2 rounded"
          >
            Connect GitHub
          </button>
        )}
      </div>
    </div>
  );
};

export default Settings;