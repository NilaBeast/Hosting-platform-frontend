import { useEffect, useState, useRef } from "react";
import { TicketAPI, AdminAPI } from "../../api/api";
import toast from "react-hot-toast";

export default function AdminOpenTicket() {
  const [users, setUsers] = useState([]);
  const editorRef = useRef(null);

  const [form, setForm] = useState({
    user_id: "",
    client_name: "",
    client_email: "",
    cc_recipients: "",
    subject: "",
    department: "General Enquiries",
    priority: "Medium",
  });

  const [files, setFiles] = useState([]);

  /* 🔥 LINK MODAL */
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const res = await AdminAPI.getUsers();
    setUsers(res.data);
  };

  /* ===============================
     SELECT CLIENT
  ============================== */
  const handleUserChange = (id) => {
    const user = users.find((u) => u.id == id);

    setForm({
      ...form,
      user_id: id,
      client_name: user?.name || "",
      client_email: user?.email || "",
    });
  };

  /* ===============================
     FORMAT COMMANDS
  ============================== */
  const format = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const applyLink = () => {
    if (!linkUrl) return;
    document.execCommand("createLink", false, linkUrl);
    setShowLinkModal(false);
    setLinkUrl("");
  };

  /* ===============================
     SUBMIT
  ============================== */
  const submit = async () => {
    const message = editorRef.current.innerHTML;

    if (!form.subject || !message) {
      return toast.error("Subject & message required");
    }

    const data = new FormData();

    Object.keys(form).forEach((key) => {
      data.append(key, form[key]);
    });

    data.append("message", message);

    files.forEach((file) => {
      data.append("attachments", file);
    });

    await TicketAPI.create(data);
    toast.success("Ticket created");

    editorRef.current.innerHTML = "";
    setFiles([]);
  };

  return (
    <div className="p-6 bg-white text-black rounded-lg">

      <h1 className="text-xl font-bold mb-6">Open New Ticket</h1>

      {/* CLIENT SECTION */}
      <div className="grid grid-cols-2 gap-4 mb-4">

        <select
          className="border p-2"
          onChange={(e) => handleUserChange(e.target.value)}
        >
          <option>Select Client</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>

        <input
          placeholder="Name"
          value={form.client_name}
          className="border p-2"
          readOnly
        />

        <input
          placeholder="Email Address"
          value={form.client_email}
          className="border p-2"
          readOnly
        />

        <input
          placeholder="CC Recipients"
          className="border p-2"
          onChange={(e) =>
            setForm({ ...form, cc_recipients: e.target.value })
          }
        />
      </div>

      {/* SUBJECT */}
      <input
        placeholder="Subject"
        className="border p-2 w-full mb-4"
        onChange={(e) =>
          setForm({ ...form, subject: e.target.value })
        }
      />

      {/* DEPARTMENT + PRIORITY */}
      <div className="flex gap-4 mb-4">
        <select
          className="border p-2"
          onChange={(e) =>
            setForm({ ...form, department: e.target.value })
          }
        >
          <option>General Enquiries</option>
          <option>Technical Support</option>
          <option>Billing</option>
        </select>

        <select
          className="border p-2"
          onChange={(e) =>
            setForm({ ...form, priority: e.target.value })
          }
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>

      {/* 🔥 TOOLBAR */}
      <div className="flex gap-2 mb-2">
        <button onClick={() => format("bold")} className="px-2 py-1 bg-gray-300 rounded">B</button>
        <button onClick={() => format("italic")} className="px-2 py-1 bg-gray-300 rounded">I</button>
        <button
          onClick={() =>
            document.execCommand("insertHTML", false, "<code>code</code>")
          }
          className="px-2 py-1 bg-gray-300 rounded"
        >
          {"</>"}
        </button>
        <button
          onClick={() => setShowLinkModal(true)}
          className="px-2 py-1 bg-gray-300 rounded"
        >
          🔗
        </button>
      </div>

      {/* 🔥 EDITOR */}
      <div
        ref={editorRef}
        contentEditable
        className="border p-3 w-full h-40 mb-4 outline-none overflow-auto"
      ></div>

      {/* ATTACHMENTS */}
      <input
        type="file"
        multiple
        className="mb-4"
        onChange={(e) =>
          setFiles(Array.from(e.target.files))
        }
      />

      {/* BUTTON */}
      <button
        onClick={submit}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        + Open Ticket
      </button>

      {/* 🔥 LINK MODAL */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">

          <div className="bg-white p-6 rounded w-[400px]">
            <h2 className="text-lg mb-4">Insert Link</h2>

            <input
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="border p-2 w-full mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 bg-gray-400 rounded"
              >
                Cancel
              </button>

              <button
                onClick={applyLink}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Insert
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}