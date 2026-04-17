import { useEffect, useState } from "react";
import { TicketAPI } from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await TicketAPI.getAll();
    setTickets(res.data);
  };

  /* ===============================
     PRIORITY COLOR
  ============================== */
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Low":
        return "bg-green-600";
      case "Medium":
        return "bg-yellow-500";
      case "High":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  /* ===============================
     STATUS COLOR
  ============================== */
  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-green-600";
      case "Answered":
        return "bg-blue-600";
      case "Closed":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-6 bg-[#020617] min-h-screen text-white">

      <h1 className="text-2xl font-bold mb-6">Support Tickets</h1>

      <div className="bg-[#0f172a] rounded-xl overflow-hidden border border-gray-700">

        <table className="w-full">

          {/* HEADER */}
          <thead className="bg-[#1e293b] text-gray-300">
            <tr>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Priority</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {tickets.map((t) => (
              <tr
                key={t.id}
                className="border-t border-gray-700 hover:bg-[#1e293b] cursor-pointer"
              >

                <td className="p-3">{t.department}</td>

                {/* CLICKABLE SUBJECT */}
                <td
                  className="p-3 text-blue-400 hover:underline"
                  onClick={() => navigate(`/admin/tickets/${t.id}`)}
                >
                  #{t.ticket_id} - {t.subject}
                </td>

                <td className="p-3">{t.User?.name || t.client_name}</td>

                {/* 🔥 PRIORITY BADGE */}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded text-white ${getPriorityColor(
                      t.priority
                    )}`}
                  >
                    {t.priority}
                  </span>
                </td>

                {/* 🔥 STATUS BADGE */}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded text-white ${getStatusColor(
                      t.status
                    )}`}
                  >
                    {t.status}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>
    </div>
  );
}