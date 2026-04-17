import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { TicketAPI } from "../api/api";
import toast from "react-hot-toast";

export default function UserTicketDetails() {
  const { id } = useParams();
  const editorRef = useRef(null);

  const [ticket, setTicket] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await TicketAPI.getById(id);
    setTicket(res.data);
  };

  const format = (cmd) => document.execCommand(cmd);

  const reply = async () => {
    const message = editorRef.current.innerHTML;

    if (!message || message === "<br>") {
      return toast.error("Message required");
    }

    const data = new FormData();
    data.append("message", message);

    files.forEach((f) => data.append("attachments", f));

    await TicketAPI.reply(id, data);

    toast.success("Reply sent");

    editorRef.current.innerHTML = "";
    setFiles([]);
    load();
  };

  if (!ticket) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="p-6 bg-[#020617] min-h-screen text-white">

      {/* HEADER */}
      <div className="bg-[#0f172a] p-5 rounded-xl mb-6 border border-gray-700">
        <h1 className="text-xl font-bold mb-2">
          #{ticket.ticket_id} - {ticket.subject}
        </h1>

        <div className="flex gap-3 text-sm">
          <span className="bg-blue-900 px-3 py-1 rounded">
            {ticket.department}
          </span>
          <span className="bg-yellow-600 px-3 py-1 rounded">
            {ticket.priority}
          </span>
          <span className="bg-green-600 px-3 py-1 rounded">
            {ticket.status}
          </span>
        </div>
      </div>

      {/* THREAD */}
      <div className="space-y-4 mb-6">

        {ticket.TicketReplies.map((r) => (
          <div
            key={r.id}
            className={`flex ${
              r.sender_type === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-4 rounded-xl ${
                r.sender_type === "user"
                  ? "bg-green-600"
                  : "bg-gray-800"
              }`}
            >
              <div
                dangerouslySetInnerHTML={{ __html: r.message }}
              />

              {/* ATTACHMENTS */}
              {r.attachments &&
                JSON.parse(r.attachments).map((file, i) => (
                  <a
                    key={i}
                    href={`http://localhost:5000/${file}`}
                    target="_blank"
                    className="block text-xs mt-2 underline"
                  >
                    📎 {file}
                  </a>
                ))}

              <div className="text-xs mt-2 opacity-60">
                {new Date(r.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}

      </div>

      {/* REPLY */}
      <div className="bg-[#0f172a] p-5 rounded-xl border border-gray-700">

        <div className="flex gap-2 mb-3">
          <button onClick={() => format("bold")} className="px-2 py-1 bg-gray-700 rounded">B</button>
          <button onClick={() => format("italic")} className="px-2 py-1 bg-gray-700 rounded">I</button>
        </div>

        <div
          ref={editorRef}
          contentEditable
          className="bg-gray-900 p-3 h-32 rounded mb-3 outline-none"
        ></div>

        <input
          type="file"
          multiple
          className="mb-3"
          onChange={(e) =>
            setFiles(Array.from(e.target.files))
          }
        />

        <button
          onClick={reply}
          className="bg-green-600 px-6 py-2 rounded"
        >
          Send Reply
        </button>
      </div>

    </div>
  );
}