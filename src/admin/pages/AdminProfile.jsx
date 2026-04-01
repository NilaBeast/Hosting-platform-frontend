import { useEffect, useState } from "react";
import API from "../../api/api";

const AdminProfile = () => {
  const [user, setUser] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    API.get("api/profile").then((res) => {
      setUser(res.data);
      setName(res.data.name);
      setEmail(res.data.email);
    });
  }, []);

  const updateProfile = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    if (avatar) formData.append("avatar", avatar);

    const res = await API.put("api/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setUser(res.data);
    alert("Profile updated");
  };

  return (
    <div className="text-white">
      <h1 className="text-3xl mb-6">Admin Profile</h1>

      <div className="bg-[#0f172a] p-6 rounded-xl w-96">
        <img
          src={user.avatar}
          className="w-32 h-32 rounded-full mb-4"
        />

        <input
          type="file"
          onChange={(e) => setAvatar(e.target.files[0])}
          className="mb-4"
        />

        <input
          className="w-full p-2 mb-3 bg-[#020617]"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full p-2 mb-3 bg-[#020617]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={updateProfile}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Update Profile
        </button>
      </div>
    </div>
  );
};

export default AdminProfile;