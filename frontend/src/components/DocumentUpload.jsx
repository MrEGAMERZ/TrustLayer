import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function DocumentUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    try {
      const resp = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      if (resp.data.status === "success") {
        toast.success(`✅ ${file.name} securely ingested!`);
        onUploadSuccess(file.name);
      } else {
        toast.error("Failed to parse file: " + resp.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network Error: Could not connect to TrustLayer backend");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    uploadFile(e.target.files[0]);
    e.target.value = null;
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`relative rounded-xl border hover:border-dashed transition-all flex items-center justify-center flex-shrink-0 min-h-[56px] w-[56px] ml-1 mb-1 ${isDragOver ? "border-cyan-500 bg-cyan-500/10 scale-105" : "border-white/10 bg-black/40 hover:border-cyan-500/40"}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      title="Drag & Drop PDF here or Click to Upload"
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
        <div className="w-5 h-5 border-2 border-t-cyan-500 border-white/20 rounded-full animate-spin"></div>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 transition-colors ${isDragOver ? 'text-cyan-400' : 'text-gray-500'}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      )}
    </div>
  );
}
