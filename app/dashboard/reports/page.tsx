"use client";

import { useEffect, useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import ActionButton from "@/components/ActionButton";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Input = ({ label, ...props }: any) => (
  <div>
    <label className="block text-sm text-gray-600 mb-1">{label}</label>
    <input
      {...props}
      className="w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-black outline-none"
    />
  </div>
);

const Select = ({ label, options, ...props }: any) => (
  <div>
    <label className="block text-sm text-gray-600 mb-1">{label}</label>
    <select
      {...props}
      className="w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-black outline-none"
    >
      {options.map((o: string) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

const DateInput = ({ label, ...props }: any) => (
  <div>
    <label className="block text-sm text-gray-600 mb-1">{label}</label>
    <input
      type="datetime-local"
      {...props}
      className="w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-black outline-none"
    />
  </div>
);

export default function Reports() {
  const [reports, setReports] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const [imageOrientation, setImageOrientation] = useState("");
  const [rotation, setRotation] = useState(0);

  const [previewSource, setPreviewSource] = useState<"db" | "new">("new");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [zoom, setZoom] = useState(1);

  const formatDateTime = (value: string) => {
    if (!value) return "";

    const date = new Date(value);

    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const toDateTimeLocal = (value: string) => {
    if (!value) return "";

    const date = new Date(value);
    const offset = date.getTimezoneOffset();

    const local = new Date(date.getTime() - offset * 60000);

    return local.toISOString().slice(0, 16);
  };

  const [form, setForm] = useState({
    report_name: "",
    agency: "",
    mode_of_submission: "email",
    report_type: "monthly",
    date_started: "",
    date_completed: "",
    deadline: "",
    date_submitted: "",
    date_acknowledged: "",
    proof: null as File | null,
    proofPreview: "",
  });

  // FETCH
  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");

      let data;
      try {
        data = await res.json();
      } catch {
        console.log("Invalid JSON");
        setReports([]);
        return;
      }

      if (!res.ok) {
        console.log("Fetch error:", data);
        setReports([]);
        return;
      }

      setReports(data || []);
    } catch (err) {
      console.log("Fetch crash:", err);
      setReports([]);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  function getStatus(r: any) {
    const now = new Date();
    const deadline = new Date(r.deadline);

    if (r.date_completed) return "Completed";
    if (deadline < now) return "Delayed";
    return "Pending";
  }

  // STATUS COLOR
  const getStatusColor = (status: string) => {
    if (status === "Completed") return "text-green-600";
    if (status === "Delayed") return "text-red-600";
    return "text-yellow-600";
  };

  const filteredReports = reports
  .map((r) => ({ ...r, status: getStatus(r) }))
  .filter((r) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      r.report_name?.toLowerCase().includes(searchText) ||
      r.agency?.toLowerCase().includes(searchText) ||
      r.report_type?.toLowerCase().includes(searchText) ||
      formatDateTime(r.date_started)?.toLowerCase().includes(searchText) ||
      formatDateTime(r.deadline)?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "all" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // RESET FORM
  const resetForm = () => {
    setForm({
      report_name: "",
      agency: "",
      mode_of_submission: "email",
      report_type: "monthly",
      date_started: "",
      date_completed: "",
      deadline: "",
      date_submitted: "",
      date_acknowledged: "",
      proof: null,
      proofPreview: "",
    });
    setEditId(null);
    setStep(1); // ✅ important
  };

  // ADD / EDIT
  const saveReport = async (e: any) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "proof") {
          if (value) formData.append("proof_document", value);
        } else {
          formData.append(key, value as string);
        }
      });

      let res;

      if (editId) {
        res = await fetch(`/api/reports/${editId}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        res = await fetch("/api/reports", {
          method: "POST",
          body: formData,
        });
      }

      // ✅ DEBUG RESPONSE (VERY IMPORTANT)
      let data;
        try {
          data = await res.json();
        } catch (e) {
          console.log("INVALID JSON RESPONSE");
          alert("Server error (invalid response)");
          return;
        }
      console.log("SERVER RESPONSE:", data);

      if (!res.ok) {
        console.log("SERVER ERROR STATUS:", res.status);
        console.log("SERVER ERROR BODY:", data);
        alert(data?.error || "Failed to save report");
        return;
      }

      resetForm();
      setIsOpen(false);
      fetchReports();

    } catch (error) {
      console.log("FETCH ERROR:", error);
      alert("Something went wrong");
    }
  };

  // DELETE
  const deleteReport = async (id: number) => {
    const res = await fetch(`/api/reports/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.error || "Delete failed");
      return;
    }

    fetchReports();
  };

  // EDIT CLICK
  const handleEdit = (r: any) => {
    setForm({
      report_name: r.report_name || "",
      agency: r.agency || "",
      mode_of_submission: r.mode_of_submission || "email",
      report_type: r.report_type || "monthly",
      date_started: toDateTimeLocal(r.date_started),
      date_completed: toDateTimeLocal(r.date_completed),
      deadline: toDateTimeLocal(r.deadline),
      date_submitted: toDateTimeLocal(r.date_submitted),
      date_acknowledged: toDateTimeLocal(r.date_acknowledged),
      // 🚀 FIX FOR IMAGE EDIT PREVIEW
      proof: null,
      proofPreview: r.proof_document ? r.proof_document : "",
    });

    setEditId(r.id);
    setIsOpen(true);
    setStep(1);
    setPreviewSource("db"); // 👈 important
    setRotation(0);
  };

  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);


  // Export PDF
  const exportPDF = () => {
  const doc = new jsPDF();

  const now = new Date();
  const dateTime = now.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

    // TITLE
    doc.setFontSize(16);
    doc.text("Report List", 14, 15);

    // DATE & TIME (UNDER TITLE)
    doc.setFontSize(10);
    doc.text(`Generated: ${dateTime}`, 14, 22);

    // TABLE DATA
    const tableData = filteredReports.map((r) => [
      r.report_name,
      r.agency,
      r.report_type,
      formatDateTime(r.date_started),
      formatDateTime(r.deadline),
      getStatus(r),
    ]);

    autoTable(doc, {
      startY: 30, // pushes table below date/time
      head: [["Report", "Agency", "Type", "Started", "Deadline", "Status"]],
      body: tableData,
      
        styles: { fontSize: 9 },
        headStyles: { fillColor: [15, 23, 42] }, // dark theme
    });

    doc.save("reports.pdf");
  };

  return (
    
    <div className=" bg-gray-100 overflow-hidden">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">
            Manage and track all submitted reports
          </p>
        </div>

        
      </div>

      <div className="flex justify-between items-center mb-6 bg-white p-4 border-gray-200 rounded-2xl gap-4">

      {/* LEFT SIDE (SEARCH + FILTER) */}
      <div className="flex items-center gap-3 w-full max-w-xl">

        {/* SEARCH INPUT */}
        <input
          type="text"
          placeholder="Search report, agency, type, date..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-400 text-black rounded-lg text-sm focus:ring-2 focus:ring-black outline-none cursor-pointer"
        />

        {/* STATUS FILTER */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border rounded-lg text-sm focus:ring-2 bg-black focus:ring-black outline-none cursor-pointer"
        >
          <option value="all">All</option>
          <option value="Completed">Completed</option>
          <option value="Delayed">Delayed</option>
          <option value="Pending">Pending</option>
        </select>

      </div>

      {/* RIGHT SIDE BUTTON */}
      <div className="flex gap-3">
  
        {/* EXPORT PDF */}
        <button
          onClick={exportPDF}
          className="bg-red-800 text-white px-4 py-2 rounded-md hover:bg-red-700 transition cursor-pointer"
        >
          Export PDF
        </button>

        {/* MAKE REPORT */}
        <button
          onClick={() => {
            resetForm();
            setIsOpen(true);
          }}
          className="bg-black text-white px-4 py-2 rounded-md cursor-pointer hover:bg-gray-800 whitespace-nowrap"
        >
          + Make Report
        </button>

      </div>

    </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">

      <table className="w-full text-sm">

        {/* HEADER */}
        <thead className="bg-gray-200 text-black">
          <tr>
            <th className="px-5 py-4 text-left font-medium">Proof</th>
            <th className="px-5 py-4 text-left font-medium">Report</th>
            <th className="px-5 py-4 text-left font-medium">Agency</th>
            <th className="px-5 py-4 text-left font-medium">Type</th>
            <th className="px-5 py-4 text-left font-medium">Date Started</th>
            <th className="px-5 py-4 text-left font-medium">Deadline</th>
            <th className="px-5 py-4 text-left font-medium">Status</th>
            <th className="px-5 py-4 text-left font-medium">Actions</th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="divide-y divide-gray-100">

          {filteredReports.map((r: any) => (
            <tr
              key={r.id}
              className="hover:bg-gray-50 transition-colors"
            >
              {/* Proof Of Submission */}
              <td className="px-5 py-4">
                {r.proof_document ? (
                  <img
                    src={r.proof_document}
                    className="w-10 h-10 rounded-md object-cover border"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">No file</span>
                )}
              </td>

              {/* REPORT */}
              <td className="px-5 py-4 text-gray-900 font-medium max-w-[200px] truncate">
                {r.report_name}
              </td>

              {/* AGENCY */}
              <td className="px-5 py-4 text-gray-700">
                {r.agency}
              </td>

              {/* TYPE */}
              <td className="px-5 py-4 text-gray-700 capitalize">
                {r.report_type}
              </td>

              {/* DEADLINE */}
              <td className="px-5 py-4 text-gray-700">
                {formatDateTime(r.date_started)}
              </td>

              {/* DEADLINE */}
              <td className="px-5 py-4 text-gray-700">
                {formatDateTime(r.deadline)}
              </td>

              {/* STATUS */}
              <td className="px-5 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(getStatus(r))}`}>
                  {getStatus(r)}
                </span>
              </td>

              {/* ACTIONS */}
              <td className="px-5 py-4">

                <div className="flex items-center gap-2">

                  {/* VIEW */}
                  <button
                    onClick={() => setViewData(r)}
                    className="p-2 rounded-lg bg-blue-600 shadow-gray-300 shadow hover:bg-blue-500 transition cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
                      <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                      <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
                    </svg>
                  </button>

                  {/* EDIT */}
                  <button
                    onClick={() => handleEdit(r)}
                    className="p-2 rounded-lg bg-yellow-300 shadow-gray-300 shadow hover:bg-yellow-200 transition cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-pen" viewBox="0 0 16 16">
                      <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
                    </svg>
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => setDeleteId(r.id)}
                    className="p-2 rounded-lg bg-red-800 shadow-gray-300 shadow hover:bg-red-700 transition cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-trash3-fill" viewBox="0 0 16 16">
                      <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                    </svg>
                  </button>

                </div>

              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>

      {/* ADD / EDIT MODAL */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">

            <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

              {/* HEADER */}
              <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editId ? "Edit Report" : "Add Report"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {step === 1 ? "Fill in the details below" : "Preview attachment"}
                  </p>
                </div>

                <div className="flex items-center gap-4 mt-2 -ml-20">

                <label className="flex items-center gap-1 text-sm text-black cursor-pointer">
                  <input
                    type="radio"
                    checked={step === 1}
                    onChange={() => setStep(1)}
                  />
                  1
                </label>

                <label className="flex items-center gap-1 text-sm text-black cursor-pointer">
                  <input
                    type="radio"
                    checked={step === 2}
                    onChange={() => setStep(2)}
                  />
                  2
                </label>

              </div>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                    setStep(1); // reset step
                  }}
                  className="text-gray-400 hover:text-black text-xl cursor-pointer"
                >
                  ✕
                </button>

                
              </div>

              {/* BODY */}
              <form onSubmit={saveReport} className="overflow-y-auto px-6 py-5 space-y-6">

                {/* ================= PAGE 1 ================= */}
                {step === 1 && (
                  <>
                    {/* BASIC INFO */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Basic Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="Report Name *"
                          value={form.report_name}
                          onChange={(e: any) =>
                            setForm({ ...form, report_name: e.target.value })
                          }
                          required
                        />

                        <Input
                          label="Agency *"
                          value={form.agency}
                          onChange={(e: any) =>
                            setForm({ ...form, agency: e.target.value })
                          }
                          required
                        />

                        <Select
                          label="Mode of Submission *"
                          value={form.mode_of_submission}
                          onChange={(e: any) =>
                            setForm({ ...form, mode_of_submission: e.target.value })
                          }
                          options={["email", "website", "lbc"]}
                        />

                        <Select
                          label="Report Type *"
                          value={form.report_type}
                          onChange={(e: any) =>
                            setForm({ ...form, report_type: e.target.value })
                          }
                          options={["annual", "semi-annual", "quarterly", "monthly"]}
                        />
                      </div>
                    </div>

                    {/* TIMELINE */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Timeline
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DateInput
                          label="Started"
                          value={form.date_started}
                          onChange={(e: any) =>
                            setForm({ ...form, date_started: e.target.value })
                          }
                        />

                        <DateInput
                          label="Completed"
                          value={form.date_completed}
                          onChange={(e: any) =>
                            setForm({ ...form, date_completed: e.target.value })
                          }
                        />

                        <DateInput
                          label="Deadline *"
                          value={form.deadline}
                          onChange={(e: any) =>
                            setForm({ ...form, deadline: e.target.value })
                          }
                          required
                        />

                        <DateInput
                          label="Submitted"
                          value={form.date_submitted}
                          onChange={(e: any) =>
                            setForm({ ...form, date_submitted: e.target.value })
                          }
                        />

                        <DateInput
                          label="Acknowledged"
                          value={form.date_acknowledged}
                          onChange={(e: any) =>
                            setForm({ ...form, date_acknowledged: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    {/* FILE UPLOAD */}
                    <div>
                      <h3 className="text-sm font-semibold text-black mb-3">
                        Attachment
                      </h3>

                      <input
                        type="file"
                        accept="image/*"
                        className="w-full border border-dashed border-gray-400 rounded-xl p-4 cursor-pointer text-gray-700"
                        onChange={(e: any) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          const url = URL.createObjectURL(file);

                          const img = new Image();
                          img.onload = () => {
                            const { width, height } = img;

                            if (width > height) setImageOrientation("Landscape");
                            else if (height > width) setImageOrientation("Portrait");
                            else setImageOrientation("Square");
                          };

                          img.src = url;

                          setForm({
                            ...form,
                            proof: file,
                            proofPreview: url, // ✅ always overwrite preview
                          });

                          setPreviewSource("new"); // 👈 important

                          setRotation(0);
                          setStep(2);
                        }}
                      />
                    </div>
                    
                  </>
                )}

                {/* ================= PAGE 2 (PREVIEW) ================= */}
                  {step === 2 && (
                    <div className="relative flex flex-col items-center justify-center text-center">
                      

                      {/* TOP BAR (X + TITLE) */}
                      <div className="absolute top-3 left-0 right-0 flex justify-between px-4 z-50">

                        

                        {/* ROTATE BUTTONS */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setRotation((prev) => prev - 90)}
                            className="px-3 py-1 bg-amber-800 border rounded-lg shadow hover:bg-amber-600 cursor-pointer"
                          >
                            ↺
                          </button>

                          <button
                            type="button"
                            onClick={() => setRotation((prev) => prev + 90)}
                            className="px-3 py-1 bg-amber-800 border rounded-lg shadow hover:bg-amber-600 cursor-pointer"
                          >
                            ↻
                          </button>
                        </div>

                        
                        <div className="flex gap-2 mt-2">
  
                          <button
                            type="button"
                            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                            className="px-3 py-1 bg-gray-800 text-white rounded-lg hover:bg-gray-700 cursor-pointer"
                          >
                            -
                          </button>

                          <button
                            type="button"
                            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                            className="px-3 py-1 bg-gray-800 text-white rounded-lg hover:bg-gray-700 cursor-pointer"
                          >
                            +
                          </button>

                          <button
                            type="button"
                            onClick={() => setZoom(1)}
                            className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-500 cursor-pointer"
                          >
                            Reset
                          </button>

                        </div>

                        {/* X BUTTON */}
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-gray-600 bg-gray-200 rounded-full hover:bg-gray-300 hover:text-black text-xl px-3 py-1 cursor-pointer"
                        >
                          ✕
                        </button>

                      </div>

                      {/* FIXED IMAGE STAGE (THIS IS THE KEY FIX) */}
                      <div
                        className="mt-12 flex items-center justify-center w-full h-[65vh] overflow-hidden"
                        onWheel={(e) => {
                          e.preventDefault(); // optional but smoother
                          e.stopPropagation(); // helps avoid scroll conflict

                          if (e.deltaY < 0) {
                            setZoom((z) => Math.min(3, z + 0.1));
                          } else {
                            setZoom((z) => Math.max(0.5, z - 0.1));
                          }
                        }}
                      >

                        {form.proofPreview ? (
                          <img
                            src={form.proofPreview}
                            className="max-h-full max-w-full object-contain rounded-xl border shadow transition-transform duration-300"
                            style={{
                              transform: `rotate(${rotation}deg) scale(${zoom})`,
                            }}
                          />
                        ) : (
                          <p className="text-gray-400">No image selected</p>
                        )}

                      </div>

                      

                      {/* TYPE LABEL */}
                      {imageOrientation && (
                        <p className="text-sm text-gray-600 mt-2">
                          Type: <span className="font-semibold">{imageOrientation}</span>
                        </p>
                      )}

                    </div>
                  )}

                  
                {/* ================= FOOTER ================= */}
                <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition cursor-pointer"
                  >
                    {editId ? "Update Report" : "Save Report"}
                  </button>

                </div>

              </form>
            </div>
          </div>
        )}

      {/* VIEW MODAL */}
      {viewData && (
        <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4">

          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Report Details
              </h2>

              {/* X BUTTON */}
              <button
                onClick={() => setViewData(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-6 space-y-4 text-sm">

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <p className="text-gray-500">Report Name</p>
                  <p className="font-medium text-gray-900">{viewData.report_name}</p>
                </div>

                <div>
                  <p className="text-gray-500">Agency</p>
                  <p className="font-medium text-gray-900">{viewData.agency}</p>
                </div>

                <div>
                  <p className="text-gray-500">Mode of Submission</p>
                  <p className="font-medium text-gray-900">{viewData.mode_of_submission}</p>
                </div>

                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{viewData.report_type}</p>
                </div>

              </div>

              <hr />

              <div className="space-y-2">

                <div className="flex justify-between">
                  <span className="text-gray-500">Started</span>
                  <span className="text-gray-900">{formatDateTime(viewData.date_started)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Completed</span>
                  <span className="text-gray-900">{formatDateTime(viewData.date_completed)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Deadline</span>
                  <span className="text-red-600 font-medium">
                    {formatDateTime(viewData.deadline)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Submitted</span>
                  <span className="text-gray-900">{formatDateTime(viewData.date_submitted)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Acknowledged</span>
                  <span className="text-gray-900">{formatDateTime(viewData.date_acknowledged)}</span>
                </div>

              </div>

            </div>

            <hr />

            {/* 🖼️ PROOF IMAGE (ADD THIS HERE) */}
            {viewData?.proof_document && (
              <div className="p-5">
                <p className="text-gray-500 mb-1">Proof of Submission</p>

                <img
                  src={viewData.proof_document}
                  className="w-full h-50 object-cover rounded-lg border"
                />
              </div>
            )}

            {/* FOOTER */}
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => setViewData(null)}
                className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {tooltip && (
        <div
          className="fixed z-50 bg-black text-white text-xs px-2 py-1 rounded shadow-lg"
          style={{
            top: tooltip.y,
            left: tooltip.x,
          }}
        >
          {tooltip.text}
        </div>
      )}

      

      <ConfirmModal
        open={deleteId !== null}
        title="Delete Report"
        message="Are you sure you want to delete this report? This cannot be undone."
        confirmText="Yes, Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;

          const res = await fetch(`/api/reports/${deleteId}`, {
            method: "DELETE",
          });

          const data = await res.json();

          if (!res.ok) {
            alert(data?.error || "Delete failed");
            return;
          }

          setDeleteId(null);
          fetchReports();
        }}
      />
      

      <style jsx>{`
        .input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
      `}</style>

    </div>
    
  );
}