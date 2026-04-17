import { useEffect, useState } from "react";
import { TicketAPI } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function UserTickets() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await TicketAPI.getMy();
    setTickets(res.data);
  };

  return (
    <div className="p-6 bg-[#020617] min-h-screen text-white">

      <h1 className="text-2xl font-bold mb-6">My Tickets</h1>

      <div className="bg-[#0f172a] rounded-xl overflow-hidden border border-gray-700">

        <table className="w-full">
          <thead className="bg-[#1e293b] text-gray-300">
            <tr>
              <th className="p-3">Subject</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((t) => (
              <tr
                key={t.id}
                className="border-t border-gray-700 hover:bg-[#1e293b] cursor-pointer"
                onClick={() => navigate(`/tickets/${t.id}`)}
              >
                <td className="p-3">
                  #{t.ticket_id} - {t.subject}
                </td>
                <td className="p-3">{t.priority}</td>
                <td className="p-3">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}