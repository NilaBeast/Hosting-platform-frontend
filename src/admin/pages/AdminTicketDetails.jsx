import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { TicketAPI } from "../../api/api";
import toast from "react-hot-toast";

export default function AdminTicketDetails() {
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

  const closeTicket = async () => {
    await TicketAPI.close(id);
    toast.success("Ticket closed");
    load();
  };

  if (!ticket) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="p-6 bg-[#020617] min-h-screen text-white">

      {/* 🔥 HEADER */}
      <div className="bg-[#0f172a] p-5 rounded-xl shadow mb-6 border border-gray-700">

        <h1 className="text-xl font-bold mb-2">
          #{ticket.ticket_id} - {ticket.subject}
        </h1>

        <div className="flex flex-wrap gap-3 text-sm">

          <span className="bg-gray-800 px-3 py-1 rounded">
            👤 {ticket.client_name}
          </span>

          <span className="bg-gray-800 px-3 py-1 rounded">
            📧 {ticket.client_email}
          </span>

          <span className="bg-blue-900 px-3 py-1 rounded">
            {ticket.department}
          </span>

          <span className="bg-yellow-600 px-3 py-1 rounded">
            {ticket.priority}
          </span>

          <span className={`px-3 py-1 rounded ${
            ticket.status === "Closed"
              ? "bg-red-600"
              : "bg-green-600"
          }`}>
            {ticket.status}
          </span>
        </div>
      </div>

      {/* 🔥 THREAD */}
      <div className="space-y-4 mb-6">

        {ticket.TicketReplies.map((r) => (
          <div
            key={r.id}
            className={`flex ${
              r.sender_type === "admin"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-4 rounded-xl ${
                r.sender_type === "admin"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800"
              }`}
            >

              {/* MESSAGE */}
              <div
                dangerouslySetInnerHTML={{
                  __html: r.message || "<i>No message</i>",
                }}
              />

              {/* ATTACHMENTS */}
              {r.attachments &&
  JSON.parse(r.attachments).map((file, i) => {
    const isPDF = file.endsWith(".pdf");

    return (
      <div key={i} className="flex items-center gap-2 mt-2">

        <span className="text-xs">
          {isPDF ? "📄 PDF" : "🖼 Image"}
        </span>

        <a
          href={`http://localhost:5000/${file}`}
          target="_blank"
          className="underline text-sm"
        >
          {file.split("/").pop()}
        </a>

        <a
          href={`http://localhost:5000/${file}`}
          download
          className="text-xs bg-gray-700 px-2 py-1 rounded"
        >
          Download
        </a>

      </div>
    );
  })}

              <div className="text-xs mt-2 opacity-60">
                {new Date(r.createdAt).toLocaleString()}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* 🔥 REPLY BOX */}
      <div className="bg-[#0f172a] p-5 rounded-xl border border-gray-700">

        {/* TOOLBAR */}
        <div className="flex gap-2 mb-3">
          <button onClick={() => format("bold")} className="px-2 py-1 bg-gray-700 rounded">B</button>
          <button onClick={() => format("italic")} className="px-2 py-1 bg-gray-700 rounded">I</button>
        </div>

        {/* EDITOR */}
        <div
          ref={editorRef}
          contentEditable
          className="bg-gray-900 border border-gray-700 rounded p-3 h-32 mb-3 outline-none"
        ></div>

        {/* FILE */}
        <input
          type="file"
          multiple
          className="mb-3"
          onChange={(e) =>
            setFiles(Array.from(e.target.files))
          }
        />

        {/* ACTIONS */}
        <div className="flex justify-between">

          <button
            onClick={closeTicket}
            className="bg-red-600 px-4 py-2 rounded"
          >
            Close Ticket
          </button>

          <button
            onClick={reply}
            className="bg-blue-600 px-6 py-2 rounded"
          >
            Send Reply
          </button>

        </div>
      </div>
    </div>
  );
}