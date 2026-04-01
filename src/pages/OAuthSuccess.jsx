import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const login = async () => {
      const params = new URLSearchParams(window.location.search);

      const token = params.get("token");
      const githubToken = params.get("github_token");

      if (token) {
        localStorage.setItem("token", token);
      }

      if (githubToken) {
        localStorage.setItem("github_token", githubToken);
      }

      try {
        // Fetch logged in user profile
        const res = await fetch("http://localhost:5000/api/user/profile", {
          headers: {
            Authorization: token,
          },
        });

        const user = await res.json();

        localStorage.setItem("user", JSON.stringify(user));

        // Clean URL
        window.history.replaceState({}, document.title, "/");

        // Redirect based on role
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } catch (err) {
        console.log("OAuth error:", err);
        navigate("/login");
      }
    };

    login();
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