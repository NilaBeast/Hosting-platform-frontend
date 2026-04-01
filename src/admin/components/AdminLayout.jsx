import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-[#020617] text-white">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminNavbar />
        <div className="p-6 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;