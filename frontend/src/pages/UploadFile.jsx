import React, { useEffect, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../utils/API.js";

const CHUNK_SIZE = 2 * 1024 * 1024;

const UploadFile = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const uploadIdRef = useRef(null);
  const pendingResumeRef = useRef(false);
  const totalChunksRef = useRef(0);
  const uploadedChunksRef = useRef(new Set());
  const isInitializedRef = useRef(false);
  const cancelUploadRef = useRef(false);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    if (!category.trim() && !documentType) {
      toast.error("Please provide required fields");
      return;
    }

    if (!category.trim()) {
      toast.error("Plz provide category");
      return;
    }
    if (!documentType) {
      toast.error("Plz provide document Type");
      return;
    }

    if (uploading && !pendingResumeRef.current) {
      return;
    }

    pendingResumeRef.current = false;
    cancelUploadRef.current = false;
    setUploading(true);

    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      totalChunksRef.current = totalChunks;

      if (!uploadIdRef.current || !isInitializedRef.current) {
        setStatusMessage("Initializing upload session...");

        const initResponse = await API.post("/file/upload/init", {
          fileName: file.name,
          totalChunks,
          category: category.trim(),
          documentType,
        });

        if (!initResponse.data.success) {
          throw new Error(initResponse.data.message || "Failed to initialize upload");
        }

        uploadIdRef.current = initResponse.data.uploadId;
        isInitializedRef.current = true;

        setStatusMessage("Upload session initialized");
      }

      let uploadedIndexes = new Set();

      if (uploadIdRef.current) {
        setStatusMessage("Checking existing chunks...");

        try {
          const statusResponse = await API.get(`/file/upload/${uploadIdRef.current}/status`);

          if (statusResponse.data.success) {
            uploadedIndexes = new Set(statusResponse.data.uploadedChunks || []);
            uploadedChunksRef.current = uploadedIndexes;

            const currentProgress = Math.round((uploadedIndexes.size / totalChunks) * 100) || 0;
            setProgress(currentProgress);

            if (uploadedIndexes.size > 0) {
              setStatusMessage(`Resuming: ${uploadedIndexes.size}/${totalChunks} chunks already uploaded`);
            }
          }
        } catch (statusError) {
          console.warn("Status check failed, continuing with fresh upload:", statusError.message);
          uploadedIndexes = new Set();
        }
      }

      for (let i = 0; i < totalChunks; i++) {
        if (cancelUploadRef.current) {
          uploadIdRef.current = null;
          pendingResumeRef.current = false;
          uploadedChunksRef.current = new Set();
          totalChunksRef.current = 0;
          isInitializedRef.current = false;
          setUploading(false);
          setProgress(0);
          setStatusMessage("");
          setFile(null);
          setCategory("");
          setDocumentType("");
          return;
        }

        if (uploadedIndexes.has(i)) {
          setStatusMessage(`Chunk ${i + 1}/${totalChunks} already uploaded ✓`);
          continue;
        }

        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("file", chunk);
        formData.append("uploadId", uploadIdRef.current);
        formData.append("chunkIndex", i);
        formData.append("totalChunks", totalChunks);

        setStatusMessage(`Uploading chunk ${i + 1}/${totalChunks}...`);

        const chunkResponse = await API.post("/file/upload/chunk", formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }, {
          timeout: 30000,
          onUploadProgress: (event) => {
            const percentage = Math.min(
              100,
              Math.round(((i + event.loaded / chunk.size) / totalChunks) * 100)
            );
            setProgress((currentProgress) => Math.max(currentProgress, percentage));
          },
        });

        if (chunkResponse.data.success && chunkResponse.data.uploadedChunks) {
          uploadedIndexes = new Set(chunkResponse.data.uploadedChunks);
        } else {
          uploadedIndexes.add(i);
        }
        uploadedChunksRef.current = uploadedIndexes;
        setProgress(Math.round((uploadedIndexes.size / totalChunks) * 100) || 0);
      }

      setStatusMessage("Finalizing upload...");
      const completeResponse = await API.post("/file/upload/complete", {
        uploadId: uploadIdRef.current,
        mimeType: file.type,
      });

      if (!completeResponse.data.success) {
        throw new Error(completeResponse.data.message || "Failed to complete upload");
      }

      setProgress(100);
      setStatusMessage("Upload complete! ✅");
      toast.success("File uploaded successfully!");

      uploadIdRef.current = null;
      isInitializedRef.current = false;
      uploadedChunksRef.current = new Set();
      totalChunksRef.current = 0;

      setTimeout(() => {
        setFile(null);
        setProgress(0);
        setStatusMessage("");
        setCategory(""),
          setDocumentType("")
      }, 3000);

    } catch (error) {
      console.error("Upload error:", error);

      if (error.message === "Upload cancelled") {
        toast.success("Upload Cancelled");
        uploadIdRef.current = null;
        pendingResumeRef.current = false;
        uploadedChunksRef.current = new Set();
        totalChunksRef.current = 0;
        isInitializedRef.current = false;
        setUploading(false);
        setProgress(0);
        setStatusMessage("");
        setFile(null);
        setCategory("");
        setDocumentType("");
        return;
      }

      if (error.response?.status === 401) {
        setStatusMessage("Session expired. Please login again.");
        toast.error("Session expired. Please try again.");
        uploadIdRef.current = null;
        isInitializedRef.current = false;
      } else if (error.response?.status === 403) {
        setStatusMessage("You don't have permission to upload files.");
        toast.error("Permission denied.");
        uploadIdRef.current = null;
        isInitializedRef.current = false;
      } else if (error.response?.status === 409) {
        pendingResumeRef.current = true;
        setStatusMessage("Upload incomplete. Click 'Resume Upload' to continue.");
        toast.error("Upload interrupted. Resume when ready.");
      } else if (error.code === 'ERR_NETWORK' || error.message.includes('network')) {
        pendingResumeRef.current = true;
        setStatusMessage("Network error. Will auto-resume when connected.");
        toast.error("Network error. Auto-resume when online.");
      } else {
        pendingResumeRef.current = true;
        setStatusMessage(`Upload paused`);
        toast.error("Upload interrupted.");
      }
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      if (pendingResumeRef.current && uploadIdRef.current && file && !uploading) {
        toast.success("Network restored! Resuming upload...");
        handleUpload();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [file, category, uploading]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    // Reset all state for new file
    setFile(selectedFile);
    setProgress(0);
    setStatusMessage("");
    uploadIdRef.current = null;
    pendingResumeRef.current = false;
    uploadedChunksRef.current = new Set();
    totalChunksRef.current = 0;
    isInitializedRef.current = false;
  };

  const handleCancelUpload = async () => {
    if (!uploadIdRef.current) return;

    cancelUploadRef.current = true;
    try {
      await API.delete(`/file/upload/${uploadIdRef.current}/cancel`);

      toast.success("Upload cancelled");

      // Reset all upload state
      uploadIdRef.current = null;
      pendingResumeRef.current = false;
      uploadedChunksRef.current = new Set();
      totalChunksRef.current = 0;
      isInitializedRef.current = false;

      setUploading(false);
      setProgress(0);
      setStatusMessage("");
      setFile(null);
      setCategory("");
      setDocumentType("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to cancel upload"
      );
    }
  };
  return (
    <div className="min-h-screen bg-[#003F3A] flex items-center justify-center p-4">
      <div className="bg-[#042f2b] rounded-lg w-full max-w-lg px-8 py-10 text-white shadow-xl">
        <div className="flex justify-center mb-4">
          <UploadCloud size={42} className="text-[#05fce8]" />
        </div>

        <h1 className="text-2xl font-semibold text-center">
          Upload File
        </h1>

        <p className="text-gray-400 text-center mt-2 mb-8">
          Upload your document securely
        </p>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">
            Document Type <span className="text-red-400">*</span>
          </label>

          <input
            type="text"
            placeholder="Enter document type"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            disabled={uploading}
            className="w-full p-3 rounded-md bg-[#003F3A] border border-[#05fce8]/40 focus:outline-none focus:border-[#05fce8] placeholder:text-gray-500"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">
            Category <span className="text-red-400">*</span>
          </label>

          <input
            type="text"
            placeholder="Enter category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={uploading}
            className="w-full p-3 rounded-md bg-[#003F3A] border border-[#05fce8]/40 focus:outline-none focus:border-[#05fce8] placeholder:text-gray-500"
            required
          />
        </div>
        <label className="block w-full">
          <input
            type="file"
            className="hidden"
            disabled={uploading}
            onChange={handleFileChange}
          />

          <div className="cursor-pointer bg-[#003F3A] border-2 border-dashed border-[#05fce8]/40 rounded-md p-8 flex flex-col items-center hover:border-[#05fce8] transition">
            <UploadCloud
              size={36}
              className="text-[#05fce8] mb-3"
            />

            <p className="text-gray-300">
              {file ? file.name : "Click to choose a file"}
            </p>
            {file && (
              <p className="text-sm text-gray-500 mt-2">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>
        </label>

        {file && (
          <div className="mt-8">
            <div className="flex justify-between text-sm mb-2">
              <span>
                {uploading ? "Uploading..." :
                  pendingResumeRef.current ? "Ready to resume" :
                    "Ready to upload"}
              </span>
              <span>{progress}%</span>
            </div>

            <div className="w-full h-3 bg-[#003F3A] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#08cdbd] transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            {statusMessage && (
              <p className="mt-3 text-sm text-[#05fce8]">{statusMessage}</p>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-8">

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 bg-[#08cdbd] p-3 rounded-md text-black font-semibold"
          >
            {uploading
              ? "Uploading..."
              : pendingResumeRef.current
                ? "Resume Upload"
                : "Upload"}
          </button>

          {uploading && (
            <button
              onClick={handleCancelUpload}
              className="px-5 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700"
            >
              Cancel
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default UploadFile;