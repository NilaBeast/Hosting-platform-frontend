import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AdminAPI } from "../../api/api";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const location = useLocation();
  const isAddUser = location.pathname === "/admin/add-user";

  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const loadUsers = () => {
    AdminAPI.getUsers()
      .then((res) => setUsers(res.data))
      .catch(() => toast.error("Failed to load users"));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* ===============================
     ADD USER
  ================================ */
  const addUser = async () => {
    try {
      if (!name || !email || !password) {
        return toast.error("All fields are required");
      }

      await AdminAPI.addUser({ name, email, password, role });

      toast.success("User added successfully");

      setName("");
      setEmail("");
      setPassword("");
      setRole("user");

      loadUsers();
    } catch (err) {
      toast.error(err.response?.data || "Failed to add user");
    }
  };

  /* ===============================
     DELETE USER
  ================================ */
  const deleteUser = async (id) => {
    try {
      await AdminAPI.deleteUser(id);
      toast.success("User deleted");
      loadUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  /* ===============================
     START EDIT
  ================================ */
  const startEdit = (user) => {
    setEditingUser(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPassword("");
  };

  /* ===============================
     UPDATE USER
  ================================ */
  const updateUser = async () => {
    try {
      await AdminAPI.updateUser(editingUser, {
        name,
        email,
        password,
        role,
      });

      toast.success("User updated");

      setEditingUser(null);
      setName("");
      setEmail("");
      setPassword("");
      setRole("user");

      loadUsers();
    } catch {
      toast.error("Failed to update user");
    }
  };

  return (
    <div className="text-white">
      <h1 className="text-3xl mb-6">
        {isAddUser ? "Add User" : "All Users"}
      </h1>

      {/* ================= ADD USER FORM ================= */}
      {isAddUser && (
        <div className="bg-[#0f172a] p-6 rounded-xl w-96">
          <input
            className="w-full p-2 mb-3 bg-[#020617]"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full p-2 mb-3 bg-[#020617]"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full p-2 mb-3 bg-[#020617]"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <select
            className="w-full p-2 mb-3 bg-[#020617]"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={addUser}
            className="bg-blue-600 px-4 py-2 rounded w-full"
          >
            Add User
          </button>
        </div>
      )}

      {/* ================= USERS TABLE ================= */}
      {!isAddUser && (
        <table className="w-full bg-[#0f172a] rounded-lg">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-3">ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="text-center border-b border-gray-800"
              >
                <td className="p-3">{u.id}</td>

                {/* NAME */}
                <td>
                  {editingUser === u.id ? (
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-[#020617] p-1"
                    />
                  ) : (
                    u.name
                  )}
                </td>

                {/* EMAIL */}
                <td>
                  {editingUser === u.id ? (
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#020617] p-1"
                    />
                  ) : (
                    u.email
                  )}
                </td>

                {/* ROLE */}
                <td>
                  {editingUser === u.id ? (
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="bg-[#020617] p-1"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    u.role
                  )}
                </td>

                {/* ACTION */}
                <td className="space-x-2">
                  {editingUser === u.id ? (
                    <button
                      onClick={updateUser}
                      className="bg-green-600 px-3 py-1 rounded"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(u)}
                      className="bg-yellow-600 px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => deleteUser(u.id)}
                    className="bg-red-600 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsers;