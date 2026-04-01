import { useEffect, useState } from "react";
import API from "../../api/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    API.get("/api/admin/users").then((res) => {
      setUsers(res.data);
    });
  }, []);

  return (
    <div>
      <h1 className="text-3xl mb-6">All Users</h1>

      <table className="w-full bg-[#0f172a] rounded-lg">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="p-3">ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="text-center border-b border-gray-800">
              <td className="p-3">{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;