import { useState } from "react";
import axios from "axios";

export default function DocumentUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

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
        onUploadSuccess(file.name);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to upload document.");
    } finally {
      setUploading(false);
      // Reset input value to allow uploading the same file again if needed
      e.target.value = null;
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">🛡️ TrustLayer</h1>
        <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded">Enterprise Core v1</span>
      </div>
      
      <div className="flex items-center gap-4">
        {error && <span className="text-red-500 text-sm">{error}</span>}
        <div className="relative">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          <button 
            type="button" 
            disabled={uploading}
            className={`px-4 py-2 bg-black text-white rounded-lg shadow font-medium text-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 ${uploading ? 'opacity-50 cursor-wait flex gap-2 items-center' : 'hover:bg-gray-800 hover:-translate-y-0.5'}`}
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </div>
    </div>
  );
}
