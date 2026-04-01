import { useState, useEffect } from "react";
import { DeployAPI, GithubAPI, HostingAPI, DomainAPI } from "../api/api";
import toast from "react-hot-toast";

const Deploy = () => {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [githubConnected, setGithubConnected] = useState(false);
  const [logs, setLogs] = useState([]);
  const [liveUrl, setLiveUrl] = useState("");
  const [deployments, setDeployments] = useState([]);
  const [deploying, setDeploying] = useState(false);

  const [hosting, setHosting] = useState(null);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");

  const [username, setUsername] = useState("");
  const [domain, setDomain] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    initPage();
  }, []);

  const initPage = async () => {
    try {
      const hostRes = await HostingAPI.getHostingAccounts();
      setHosting(hostRes.data);

      const domRes = await DomainAPI.getDomains();
      const domainList = domRes.data;
      setDomains(domainList);

      if (domainList.length > 0) {
        const selected = domainList.find(d => d.is_selected);
        if (selected) {
          setSelectedDomain(selected.domain);
        } else {
          setSelectedDomain(domainList[0].domain);
        }
      }

      const depRes = await DeployAPI.getDeployments();
      setDeployments(depRes.data);

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

  const createHosting = async () => {
    try {
      const res = await HostingAPI.createHosting({
        username,
        domain,
        password,
        email,
      });

      setHosting(res.data.account);
      toast.success("Hosting Account Created");
    } catch (err) {
      toast.error("Failed to create hosting");
    }
  };

  const openCpanel = async () => {
    try {
      const res = await HostingAPI.loginToCpanel();
      window.open(res.data.url, "_blank");
    } catch (err) {
      toast.error("Failed to open cPanel");
    }
  };

  const deploy = async () => {
    if (!selectedRepo) {
      return toast.error("Select repo first");
    }

    try {
      setDeploying(true);

      const res = await DeployAPI.deployRepo({
        repo: selectedRepo,
        domain: selectedDomain,
      });

      setLogs(res.data.logs);
      setLiveUrl(res.data.url);

      toast.success("Deployment Finished");

      const depRes = await DeployAPI.getDeployments();
      setDeployments(depRes.data);
    } catch (err) {
      toast.error("Deployment failed");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Hosting & Deployment</h1>

      {!hosting && (
        <div className="bg-gray-900 p-4 rounded">
          <h2 className="mb-3">Create Hosting Account</h2>

          <input className="bg-gray-800 p-2 mr-2 mb-2" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
          <input className="bg-gray-800 p-2 mr-2 mb-2" placeholder="Domain" onChange={(e) => setDomain(e.target.value)} />
          <input className="bg-gray-800 p-2 mr-2 mb-2" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <input className="bg-gray-800 p-2 mr-2 mb-2" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />

          <button onClick={createHosting} className="bg-purple-600 px-4 py-2 ml-2">
            Create Hosting
          </button>
        </div>
      )}

      {hosting && (
        <div className="bg-gray-900 p-4 rounded mb-4">
          <h2 className="mb-2">Hosting Account</h2>
          <div>Username: {hosting.cpanel_username}</div>
          <div>Domain: {hosting.domain}</div>

          <button onClick={openCpanel} className="bg-green-600 px-4 py-2 mt-3">
            Open cPanel
          </button>
        </div>
      )}

      {hosting && (
        <div className="mb-4">
          <select
            className="bg-gray-800 p-3"
            value={selectedDomain}
            onChange={async (e) => {
              const domainName = e.target.value;
              setSelectedDomain(domainName);

              const domainObj = domains.find(d => d.domain === domainName);
              if (domainObj) {
                await DomainAPI.selectDomain({ domainId: domainObj.id });
              }
            }}
          >
            {domains.map((d) => (
              <option key={d.id} value={d.domain}>
                {d.domain}
              </option>
            ))}
          </select>
        </div>
      )}

      {hosting && githubConnected && (
        <div className="mb-4">
          <select className="bg-gray-800 p-3" onChange={(e) => setSelectedRepo(e.target.value)}>
            <option>Select Repo</option>
            {repos.map((repo) => (
              <option key={repo.id} value={repo.clone_url}>
                {repo.name}
              </option>
            ))}
          </select>

          <button onClick={deploy} className="bg-purple-600 px-6 py-3 ml-3">
            {deploying ? "Deploying..." : "Deploy"}
          </button>
        </div>
      )}

      {logs.length > 0 && (
        <div className="bg-black p-4 rounded mt-4">
          <h2>Deployment Logs</h2>
          {logs.map((log, i) => (
            <div key={i} className="text-green-400 text-sm">
              {log}
            </div>
          ))}
        </div>
      )}

      {liveUrl && (
        <div className="mt-4">
          <h2>Live URL:</h2>
          <a href={liveUrl} target="_blank" rel="noreferrer">
            {liveUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default Deploy;