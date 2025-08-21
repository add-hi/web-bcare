"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Image,
  File,
  Download,
  Eye,
  X,
  Search,
  Filter,
  Calendar,
  User,
  FileImage,
  FileType,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import httpClient from "@/lib/httpClient";
import { useAuthStore } from "@/store/userStore";

const Attachment = ({ ticketId, ticketNumber, ticket }) => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);
  const { accessToken } = useAuthStore();

  // Debug logging
  console.log('🔍 Attachment component props:', {
    ticketId,
    ticketNumber,
    ticket: ticket ? 'provided' : 'not provided'
  });

  // Load attachments for specific ticket
  const loadDocuments = async () => {
    if (!ticketId) {
      console.warn("No ticketId provided");
      return;
    }

    console.log('🔍 Loading attachments for ticketId:', ticketId);

    try {
      // First try to get ticket details to see if attachments are included
      const response = await httpClient.get(`/tickets/${ticketId}`, {
        headers: { Authorization: accessToken },
      });

      console.log('🔍 Ticket API response:', response.data);

      if (response.data.success) {
        const ticketData = response.data.data;
        console.log('🔍 Ticket data:', ticketData);
        console.log('🔍 Attachments in response:', ticketData.attachments);

        // Check if attachments exist in ticket response
        if (
          ticketData.attachments &&
          Array.isArray(ticketData.attachments) &&
          ticketData.attachments.length > 0
        ) {
          console.log('🔍 Found', ticketData.attachments.length, 'attachments');
          const formattedDocs = ticketData.attachments.map((attachment) => ({
            id: attachment.attachment_id,
            name: attachment.file_name,
            type: getFileType(attachment.file_name),
            size: formatFileSize(attachment.file_size),
            uploadDate: new Date(attachment.upload_time)
              .toISOString()
              .split("T")[0],
            uploadedBy: "User",
            category: attachment.file_type,
            url: null,
            description: `${attachment.file_type} file`,
            attachmentId: attachment.attachment_id,
            gcsPath: attachment.gcs_path,
          }));
          setDocuments(formattedDocs);
        } else {
          console.log('🔍 No attachments found in ticket response');
          setDocuments([]);
        }
      } else {
        console.error('🔍 Ticket API failed:', response.data.message);
        showNotification(
          response.data.message || "Failed to load ticket",
          "error"
        );
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error loading attachments:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load attachments";
      showNotification(errorMessage, "error");
      setDocuments([]);
    }
  };

  // Utility functions
  const getFileType = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
      return "image";
    } else if (extension === "pdf") {
      return "pdf";
    } else if (["doc", "docx"].includes(extension)) {
      return "document";
    }
    return "file";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Load documents when component mounts or ticketId changes
  useEffect(() => {
    if (ticketId) {
      loadDocuments();
    }
  }, [ticketId, accessToken]);

  const getFileIcon = (type) => {
    switch (type) {
      case "image":
        return <Image className="text-green-600" size={16} />;
      case "pdf":
        return <FileText className="text-red-600" size={16} />;
      case "document":
        return <FileType className="text-blue-600" size={16} />;
      default:
        return <File className="text-gray-500" size={16} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "image":
        return "bg-green-50 text-green-700";
      case "pdf":
        return "bg-red-50 text-red-700";
      case "document":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || doc.type === filterType;

    return matchesSearch && matchesType;
  });

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;
    if (!ticketId) {
      showNotification("No ticket selected", "error");
      return;
    }
    if (files.length > 5) {
      showNotification("Maximum 5 files allowed", "error");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          throw new Error(`File ${file.name} exceeds 10MB limit`);
        }
        formData.append("files", file);
      });

      // Set progress
      files.forEach((file) => {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
      });

      const response = await httpClient.post(
        `/tickets/${ticketId}/attachments`,
        formData,
        {
          headers: {
            Authorization: accessToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        // Update progress
        files.forEach((file) => {
          setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
        });

        // Add new attachments to documents
        const newDocs = response.data.data.attachments.map((attachment) => ({
          id: attachment.attachment_id,
          name: attachment.file_name,
          type: getFileType(attachment.file_name),
          size: formatFileSize(attachment.file_size),
          uploadDate: new Date(attachment.upload_time)
            .toISOString()
            .split("T")[0],
          uploadedBy: "You",
          category: attachment.file_type,
          url: null,
          description: `${attachment.file_type} file`,
          attachmentId: attachment.attachment_id,
          gcsPath: attachment.gcs_path,
        }));

        setDocuments((prev) => [...newDocs, ...prev]);
        showNotification(`Successfully uploaded ${files.length} file(s)!`);
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Upload failed";
      showNotification(errorMessage, "error");

      // Set error state for all files
      files.forEach((file) => {
        setUploadProgress((prev) => ({ ...prev, [file.name]: -1 }));
      });
    }

    setUploading(false);
    setTimeout(() => setUploadProgress({}), 2000);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (doc) => {
    try {
      // Get attachment with download URL
      const response = await httpClient.get(
        `/attachments/${doc.attachmentId}`,
        {
          headers: { Authorization: accessToken },
        }
      );

      if (response.data.success && response.data.data.download_url) {
        // Create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = response.data.data.download_url;
        link.download = doc.name;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification(`File ${doc.name} download started!`);
      } else {
        throw new Error("Could not get download URL");
      }
    } catch (error) {
      console.error("Download error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Download failed";
      showNotification(
        `Failed to download ${doc.name}: ${errorMessage}`,
        "error"
      );
    }
  };

  const openPreview = async (doc) => {
    try {
      // For images, get the download URL for preview
      if (doc.type === "image") {
        const response = await httpClient.get(
          `/attachments/${doc.attachmentId}`,
          {
            headers: { Authorization: accessToken },
          }
        );

        if (response.data.success && response.data.data.download_url) {
          const docWithUrl = { ...doc, url: response.data.data.download_url };
          setSelectedDocument(docWithUrl);
        } else {
          setSelectedDocument(doc);
        }
      } else {
        setSelectedDocument(doc);
      }
      setZoom(100);
      setRotation(0);
    } catch (error) {
      console.error("Error getting preview URL:", error);
      setSelectedDocument(doc);
      setZoom(100);
      setRotation(0);
    }
  };

  const closePreview = () => {
    setSelectedDocument(null);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const renderPreview = (doc) => {
    if (doc.type === "image" && doc.url) {
      return (
        <div className="flex justify-center items-center h-full overflow-auto bg-gray-50">
          <img
            src={doc.url}
            alt={doc.name}
            className="max-w-full max-h-full object-contain transition-transform duration-200 shadow-lg rounded"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            }}
          />
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50">
          <FileType size={80} className="mb-4 text-blue-400" />
          <p className="text-lg font-medium mb-2">Preview tidak tersedia</p>
          <p className="text-sm mb-1">{doc.name}</p>
          <p className="text-sm mb-4">{doc.size}</p>
          <button
            onClick={() => handleDownload(doc)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Download to view
          </button>
        </div>
      );
    }
  };

  // Show message if no ticketId provided
  if (!ticketId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 rounded-lg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12 bg-white rounded-lg">
            <File className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Ticket Selected
            </h3>
            <p className="text-gray-500">
              Please select a ticket to view its attachments
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 rounded-lg">
      <div className="max-w-6xl mx-auto">
        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
              notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {notification.type === "error" ? (
              <AlertCircle size={20} />
            ) : (
              <CheckCircle size={20} />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Documents</h1>
          <p className="text-gray-600 text-sm">Manage dan preview dokumen</p>
        </div>

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <h3 className="font-medium mb-3">Upload Progress</h3>
            {Object.entries(uploadProgress).map(([filename, progress]) => (
              <div key={filename} className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>{filename}</span>
                  <span>{progress === -1 ? "Error" : `${progress}%`}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      progress === -1 ? "bg-red-500" : "bg-blue-500"
                    }`}
                    style={{ width: progress === -1 ? "100%" : `${progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 items-center">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="pdf">PDF</option>
                <option value="document">Documents</option>
              </select>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Upload size={16} />
              )}
              <span>{uploading ? "Uploading..." : "Upload"}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Document Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    File
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    Size
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    Uploaded By
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(doc.type)}
                        <div>
                          <p
                            className="text-sm font-medium text-gray-900 truncate max-w-[200px]"
                            title={doc.name}
                          >
                            {doc.name}
                          </p>
                          <p
                            className="text-xs text-gray-500 truncate max-w-[200px]"
                            title={doc.description}
                          >
                            {doc.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                          doc.type
                        )}`}
                      >
                        {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {doc.size}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {doc.uploadedBy}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {doc.uploadDate}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openPreview(doc)}
                          className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                          title="Preview"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Preview Modal - Same as before but with download functionality */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-5xl max-h-[90vh] w-full flex flex-col shadow-2xl m-4">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 rounded-t-xl">
                <div className="flex items-center space-x-3">
                  {getFileIcon(selectedDocument.type)}
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {selectedDocument.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedDocument.category} • {selectedDocument.size} •{" "}
                      {selectedDocument.uploadedBy}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-1">
                  {selectedDocument.type === "image" &&
                    selectedDocument.url && (
                      <>
                        <button
                          onClick={handleZoomOut}
                          className="p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                          title="Zoom Out"
                        >
                          <ZoomOut size={16} />
                        </button>
                        <span className="text-sm px-3 py-2 bg-white border rounded-lg min-w-[60px] text-center">
                          {zoom}%
                        </span>
                        <button
                          onClick={handleZoomIn}
                          className="p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                          title="Zoom In"
                        >
                          <ZoomIn size={16} />
                        </button>
                        <button
                          onClick={handleRotate}
                          className="p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                          title="Rotate"
                        >
                          <RotateCw size={16} />
                        </button>
                        <div className="w-px h-8 bg-gray-200 mx-2"></div>
                      </>
                    )}
                  <button
                    onClick={() => handleDownload(selectedDocument)}
                    className="p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={closePreview}
                    className="p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-hidden">
                {renderPreview(selectedDocument)}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t bg-gray-50 rounded-b-xl">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    <strong>Description:</strong> {selectedDocument.description}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(selectedDocument)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Download File
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredDocuments.length === 0 && !uploading && (
          <div className="text-center py-12 bg-white rounded-lg">
            <File className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No documents found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search criteria"
                : "Upload your first document to get started"}
            </p>
            {!searchTerm && filterType === "all" && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2 mx-auto"
              >
                <Upload size={16} />
                <span>Upload Document</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Attachment;
