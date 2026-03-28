import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const githubToken = params.get("github_token");

    if (token) {
      localStorage.setItem("token", token);
    }

    if (githubToken) {
      localStorage.setItem("github_token", githubToken);
    }

    // Clean URL
    window.history.replaceState({}, document.title, "/");

    // Redirect to dashboard
    navigate("/");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
      <div className="animate-pulse text-xl">
        Logging you in...
      </div>
    </div>
  );
};

export default OAuthSuccess;