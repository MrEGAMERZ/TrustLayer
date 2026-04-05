import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function DocumentUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [progress, setProgress]   = useState(0);

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    try {
      const resp = await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      if (resp.data.status === "success") {
        toast.success(`✅ ${file.name} securely ingested!`);
        onUploadSuccess(file.name);
      } else {
        toast.error("Parse error: " + resp.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error — backend unreachable");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFileChange = (e) => {
    uploadFile(e.target.files[0]);
    e.target.value = null;
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) uploadFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-xl transition-all duration-200 border ${
        isDragOver
          ? "border-cyan-500/60 bg-cyan-500/12 scale-105 shadow-[0_0_16px_rgba(34,211,238,0.25)]"
          : uploading
            ? "border-cyan-500/30 bg-cyan-500/6"
            : "border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.07]"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      title="Drop PDF or click to upload"
    >
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        data-testid="file-input"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
      />

      {uploading ? (
        /* Circular progress */
        <div className="relative w-5 h-5">
          <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
            <circle
              cx="10" cy="10" r="8" fill="none"
              stroke="#22d3ee" strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 8}`}
              strokeDashoffset={`${2 * Math.PI * 8 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-200"
              style={{ filter: 'drop-shadow(0 0 4px rgba(34,211,238,0.6))' }}
            />
          </svg>
        </div>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-4 h-4 transition-colors ${isDragOver ? "text-cyan-400" : "text-gray-500"}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      )}
    </div>
  );
}
