import { useState, useRef, useEffect } from "react";
import { TicketAPI } from "../api/api";
import toast from "react-hot-toast";

export default function Support() {
  const user = JSON.parse(localStorage.getItem("user"));
  const editorRef = useRef(null);

  const [form, setForm] = useState({
    subject: "",
    department: "General Enquiries",
    priority: "Medium",
  });

  const [activeFormats, setActiveFormats] = useState({
  bold: false,
  italic: false,
});

  const [files, setFiles] = useState([]);

  /* 🔥 LINK MODAL STATE */
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  /* ===============================
     FORMAT COMMANDS
  ============================== */
 const format = (command) => {
  document.execCommand(command);

  // update state after applying
  setActiveFormats((prev) => ({
    ...prev,
    [command]: document.queryCommandState(command),
  }));
};

useEffect(() => {
  const updateState = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
    });
  };

  document.addEventListener("selectionchange", updateState);

  return () => {
    document.removeEventListener("selectionchange", updateState);
  };
}, []);
  /* ===============================
     APPLY LINK
  ============================== */
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
      return toast.error("All fields required");
    }

    const data = new FormData();

    data.append("subject", form.subject);
    data.append("message", message);
    data.append("department", form.department);
    data.append("priority", form.priority);

    files.forEach((file) => {
      data.append("attachments", file);
    });

    await TicketAPI.create(data);
    toast.success("Ticket Submitted");

    editorRef.current.innerHTML = "";
  };

  return (
    <div className="p-6 bg-[#0f172a] text-white min-h-screen">

      <h1 className="text-2xl font-bold mb-6">Submit Ticket</h1>

      {/* Ticket Info */}
      <div className="bg-[#020617] p-4 rounded mb-6 border border-gray-700">
        <h2 className="mb-4 font-semibold">Ticket Information</h2>

        <div className="grid grid-cols-2 gap-4">
          <input value={user?.name} readOnly className="p-2 bg-gray-800 rounded" />
          <input value={user?.email} readOnly className="p-2 bg-gray-800 rounded" />

          <select
  value={form.department}
  onChange={(e) =>
    setForm({ ...form, department: e.target.value })
  }
  className="p-2 bg-gray-800 text-white border border-gray-600 rounded focus:outline-none"
>
  <option className="bg-gray-800 text-white" value="General Enquiries">
    General Enquiries
  </option>
  <option className="bg-gray-800 text-white" value="Technical Support">
    Technical Support
  </option>
  <option className="bg-gray-800 text-white" value="Billing">
    Billing
  </option>
</select>

          <select
  className="p-2 bg-gray-800 rounded"
  value={form.priority}
  onChange={(e) =>
    setForm({ ...form, priority: e.target.value })
  }
>
  <option value="Low">Low</option>
  <option value="Medium">Medium</option>
  <option value="High">High</option>
</select>
        </div>
      </div>

      {/* Message */}
      <div className="bg-[#020617] p-4 rounded border border-gray-700">

        <h2 className="mb-4 font-semibold">Message</h2>

        <input
          placeholder="Subject"
          className="w-full p-2 bg-gray-800 rounded mb-4"
          onChange={(e) =>
            setForm({ ...form, subject: e.target.value })
          }
        />

        {/* 🔥 TOOLBAR */}
       <div className="flex gap-2 mb-2">

  {/* BOLD */}
  <button
    onClick={() => format("bold")}
    className={`px-2 py-1 rounded ${
      activeFormats.bold
        ? "bg-purple-600 text-white"
        : "bg-gray-700"
    }`}
  >
    B
  </button>

  {/* ITALIC */}
  <button
    onClick={() => format("italic")}
    className={`px-2 py-1 rounded ${
      activeFormats.italic
        ? "bg-purple-600 text-white"
        : "bg-gray-700"
    }`}
  >
    I
  </button>

  {/* CODE */}
  <button
    onClick={() =>
      document.execCommand("insertHTML", false, "<code>code</code>")
    }
    className="px-2 py-1 bg-gray-700 rounded"
  >
    {"</>"}
  </button>

  {/* LINK */}
  <button
    onClick={() => setShowLinkModal(true)}
    className="px-2 py-1 bg-gray-700 rounded"
  >
    🔗
  </button>

</div>

        {/* EDITOR */}
        <div
          ref={editorRef}
          contentEditable
          className="w-full h-40 p-3 bg-gray-800 rounded mb-4 outline-none overflow-auto"
        ></div>

        {/* FILE */}
        <input
          type="file"
          multiple
          className="mb-4"
          onChange={(e) =>
            setFiles(Array.from(e.target.files))
          }
        />

        {/* CAPTCHA */}
        {/* <div className="bg-white text-black p-3 w-fit mb-4">
          ☐ I'm not a robot
        </div> */}

        {/* BUTTONS */}
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-600 rounded">
            Cancel
          </button>

          <button
            onClick={submit}
            className="px-6 py-2 bg-purple-600 rounded"
          >
            Submit
          </button>
        </div>
      </div>

      {/* 🔥 LINK MODAL */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">

          <div className="bg-[#020617] p-6 rounded-lg w-[400px]">

            <h2 className="text-lg mb-4">Insert Link</h2>

            <input
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 bg-gray-600 rounded"
              >
                Cancel
              </button>

              <button
                onClick={applyLink}
                className="px-4 py-2 bg-purple-600 rounded"
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