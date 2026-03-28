import { useState, useEffect } from "react";
import { DeployAPI, GithubAPI } from "../api/api";
import toast from "react-hot-toast";

const Deploy = () => {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [githubConnected, setGithubConnected] = useState(false);
  const [logs, setLogs] = useState([]);
  const [liveUrl, setLiveUrl] = useState("");
  const [deployments, setDeployments] = useState([]);
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    fetchRepos();
    fetchDeployments();
  }, []);

  const fetchRepos = async () => {
    try {
      const status = await GithubAPI.getStatus();

      if (status.data.connected) {
        setGithubConnected(true);

        const repoRes = await GithubAPI.getRepos();
        setRepos(repoRes.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchDeployments = async () => {
    try {
      const res = await DeployAPI.getDeployments();
      setDeployments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const deploy = async () => {
    if (!selectedRepo) {
      return toast.error("Select repo first");
    }

    try {
      setDeploying(true);
      setLogs([]);
      setLiveUrl("");

      const res = await DeployAPI.deployRepo({
        repo: selectedRepo,
      });

      setLogs(res.data.logs);
      setLiveUrl(res.data.url);

      toast.success("Deployment Finished");
      fetchDeployments();
    } catch (err) {
      console.log(err);
    } finally {
      setDeploying(false);
    }
  };

  if (!githubConnected) {
    return (
      <div className="p-8">
        <h1>Connect GitHub first from Settings</h1>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Deploy Project</h1>

      <select
        className="bg-gray-800 p-3 rounded mr-3"
        onChange={(e) => setSelectedRepo(e.target.value)}
      >
        <option>Select Repo</option>
        {repos.map((repo) => (
          <option key={repo.id} value={repo.clone_url}>
            {repo.name}
          </option>
        ))}
      </select>

      <button
        onClick={deploy}
        className="bg-purple-600 px-6 py-3 rounded"
      >
        {deploying ? "Deploying..." : "Deploy"}
      </button>

      {/* Logs */}
      {logs.length > 0 && (
        <div className="mt-6 bg-black p-4 rounded">
          <h2 className="mb-2">Deployment Logs</h2>
          {logs.map((log, index) => (
            <div key={index} className="text-green-400 text-sm">
              {log}
            </div>
          ))}
        </div>
      )}

      {/* Live URL */}
      {liveUrl && (
        <div className="mt-4">
          <h2>Live URL:</h2>
          <a
            href={liveUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400"
          >
            {liveUrl}
          </a>
        </div>
      )}

      {/* Deployment History */}
      <div className="mt-8">
        <h2 className="text-xl mb-3">Deployment History</h2>

        {deployments.map((d) => (
          <div
            key={d.id}
            className="bg-gray-800 p-4 rounded mb-2"
          >
            <div>Repo: {d.repo_url}</div>
            <div>Status: {d.status}</div>
            <a
              href={d.url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400"
            >
              {d.url}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Deploy;