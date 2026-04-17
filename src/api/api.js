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

  if (token) req.headers.Authorization = `Bearer ${token}`;
  if (githubToken) req.headers.github_token = githubToken;

  return req;
});

/* ===============================
   RESPONSE INTERCEPTOR (🔥 FIXED)
================================ */
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      typeof err.response?.data === "string"
        ? err.response.data
        : err.response?.data?.error ||
          err.response?.data?.message ||
          "Something went wrong";

    toast.error(msg);
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
   ADMIN APIs
================================ */
export const AdminAPI = {
  getDashboard: () => API.get("api/admin/dashboard"),

  getUsers: () => API.get("api/admin/users"),
  addUser: (data) => API.post("api/admin/users", data),
  deleteUser: (id) => API.delete(`api/admin/users/${id}`),
  updateUser: (id, data) => API.put(`api/admin/users/${id}`, data),

  getTransactions: () => API.get("api/admin/transactions"),
  getInvoices: () => API.get("api/admin/invoices"),

  getTickets: () => API.get("api/admin/tickets"),
  createTicket: (data) => API.post("api/admin/tickets", data),

  getServerStats: () => API.get("api/admin/server-stats"),
};

export const TicketAPI = {
  create: (data) =>
  API.post("api/tickets", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  getMy: () => API.get("api/tickets/my"),
  getAll: () => API.get("api/tickets/admin"),
  getById: (id) => API.get(`api/tickets/${id}`),
  reply: (id, data) => API.post(`api/tickets/${id}/reply`, data),
  close: (id) => API.post(`api/tickets/${id}/close`),
};

export const AdminProductAPI = {
  getGroups: () => API.get("/api/admin/products/groups"),

  createGroup: (data) => API.post("/api/admin/products/group", data),
  updateGroup: (id, data) =>
    API.put(`/api/admin/products/group/${id}`, data),
  deleteGroup: (id) =>
    API.delete(`/api/admin/products/group/${id}`),

  createProduct: (data) =>
    API.post("/api/admin/products/product", data),
  updateProduct: (id, data) =>
    API.put(`/api/admin/products/product/${id}`, data),
  deleteProduct: (id) =>
    API.delete(`/api/admin/products/product/${id}`),

  getWHMPackages: () => API.get("/api/plans"),
 
};

export const ProductAPI = {
  getBySlug: (group, product) =>
    API.get(`/api/admin/products/store/${group}/${product}`),
};

/* ===============================
   ORDER APIs
================================ */
export const OrderAPI = {
  createOrder: (data) => API.post("api/orders", data),
  getOrders: () => API.get("api/orders"),
};

/* ===============================
   PAYMENT APIs (🔥 UPDATED)
================================ */
export const PaymentAPI = {
  /* HOSTING + DOMAIN */
  createOrder: (data) => API.post("api/payment/create-order", data),

  /* DOMAIN ONLY */
  createDomainOrder: (data) =>
    API.post("api/payment/create-domain-order", data),

  verifyPayment: (data) => API.post("api/payment/verify", data),

  getMyOrders: () => API.get("api/payment/my-orders"),
};

/* ===============================
   PLANS APIs
================================ */
export const PlanAPI = {
  getPlans: () => API.get("api/plans"),
  syncWHM: () => API.post("api/plans/sync-whm"),
};

/* ===============================
   HOSTING APIs
================================ */
export const HostingAPI = {
  createHosting: (data) => API.post("api/hosting/create", data),
  getHostingAccounts: () => API.get("api/hosting"),
  suspendHosting: (id) => API.post(`api/hosting/suspend/${id}`),
  deleteHosting: (id) => API.delete(`api/hosting/${id}`),
  loginToCpanel: () => API.get("api/hosting/login"),
};

/* ===============================
   DOMAIN APIs (UPDATED)
================================ */
export const DomainAPI = {
  addDomain: (data) => API.post("api/domain/add", data),
  getDomains: () => API.get("api/domain"),
  deleteDomain: (id) => API.delete(`api/domain/${id}`),
  selectDomain: (data) => API.post("api/domain/select", data),

  // ✅ NEW
  addToCpanel: (data) => API.post("api/domain/add-to-cpanel", data),
  getList: () => API.get("api/domain/list"),
};

/* ===============================
   DOMAIN SEARCH APIs (UPDATED)
================================ */
export const DomainSearchAPI = {
  checkDomain: (domain) =>
    API.get(`api/domain-search/check?domain=${domain}`),

  // ✅ NEW
  transferDomain: (data) =>
    API.post("api/domain-search/transfer", data),
};

/* ===============================
   ADMIN ORDER APIs (🔥 UPDATED)
================================ */
export const AdminOrderAPI = {
  createOrder: (data) => API.post("api/admin/orders/create", data),

  getOrders: () => API.get("api/admin/orders"),

  /* 🔥 SUPPORT DOMAIN SWITCH */
  registerDomain: (orderId, domain) =>
    API.post("api/admin/orders/register-domain", {
      orderId,
      domain,
    }),
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

/* ===============================
   PROFILE APIs
================================ */
export const ProfileAPI = {
  getProfile: () => API.get("api/profile"),
  updateProfile: (data) =>
    API.put("api/profile", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const AdminDomainAPI = {
  getPricing: () => API.get("api/admin/domain-pricing"),

  updateMargins: (data) =>
    API.post("api/admin/domain-pricing/margins", data),

  updateTag: (data) =>
    API.post("api/admin/domain-pricing/tag", data),

  toggleSpotlight: (data) =>
    API.post("api/admin/domain-pricing/spotlight", data),

  updateAdvancedPricing: (data) =>
    API.post("api/admin/domain-pricing/advanced-pricing", data),
};

export const AdminSettingsAPI = {
  getPackagePricing: () =>
    API.get("api/admin/settings/package-pricing"),

  updatePackagePricing: (data) =>
    API.post("api/admin/settings/package-pricing", data),
};
export default API;