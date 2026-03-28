import axios from "axios";
import toast from "react-hot-toast";

/* ===============================
   AXIOS INSTANCE
================================ */
const API = axios.create({
  baseURL: "http://localhost:5000",
});

/* ===============================
   REQUEST INTERCEPTOR
================================ */
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  const githubToken = localStorage.getItem("github_token");

  if (token) req.headers.Authorization = token;
  if (githubToken) req.headers.github_token = githubToken;

  return req;
});

/* ===============================
   RESPONSE INTERCEPTOR
================================ */
API.interceptors.response.use(
  (res) => res,
  (err) => {
    toast.error(err.response?.data || "Something went wrong");
    return Promise.reject(err);
  }
);

/* ===============================
   AUTH APIs
================================ */
export const AuthAPI = {
  register: (data) => API.post("api/auth/register", data),
  login: (data) => API.post("api/auth/login", data),

  firebaseGoogle: (firebaseToken) =>
    API.post(
      "api/auth/firebase-google",
      {},
      { headers: { Authorization: firebaseToken } }
    ),

  githubLogin: () => {
    window.location.href = "http://localhost:5000/api/auth/github";
  },
};

/* ===============================
   USER APIs
================================ */
export const UserAPI = {
  getProfile: () => API.get("api/user/profile"),
  updateProfile: (data) => API.put("api/user/profile", data),
};

/* ===============================
   PLANS APIs
================================ */
export const PlanAPI = {
  getPlans: () => API.get("api/plans"),
  createPlan: (data) => API.post("api/plans", data),
  updatePlan: (id, data) => API.put(`api/plans/${id}`, data),
  deletePlan: (id) => API.delete(`api/plans/${id}`),
};

/* ===============================
   HOSTING APIs
================================ */
export const HostingAPI = {
  createHosting: (data) => API.post("api/hosting/create", data),
  getHostingAccounts: () => API.get("api/hosting"),
  suspendHosting: (id) => API.post(`api/hosting/suspend/${id}`),
  deleteHosting: (id) => API.delete(`api/hosting/${id}`),
};

/* ===============================
   DOMAIN APIs
================================ */
export const DomainAPI = {
  addDomain: (data) => API.post("api/domain/add", data),
  getDomains: () => API.get("api/domain"),
  deleteDomain: (id) => API.delete(`api/domain/${id}`),
};

/* ===============================
   DEPLOY APIs
================================ */
export const DeployAPI = {
  deployRepo: (data) => API.post("api/deploy", data),
  getDeployments: () => API.get("api/deploy"),
  getDeployLogs: (id) => API.get(`api/deploy/logs/${id}`),
};

/* ===============================
   GITHUB APIs
================================ */
export const GithubAPI = {
  getRepos: () => API.get("api/github/repos"),
  getStatus: () => API.get("api/github/status"),
};

/* ===============================
   SETTINGS APIs
================================ */
export const SettingsAPI = {
  changePassword: (data) => API.post("api/settings/change-password", data),
  updateSettings: (data) => API.put("api/settings", data),
};

export default API;