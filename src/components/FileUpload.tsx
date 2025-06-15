import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, File, X, Download, Trash2, AlertTriangle, Image, FileText, Music, Video, Archive, Code, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type?: string;
  uploadDate: string;
  filename: string;
  path: string;
}

interface FileUploadProps {
  isDark: boolean;
}

export default function FileUpload({ isDark }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

  const getFileIcon = useCallback((type?: string) => {
    if (!type) return File;
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('text') || type.includes('json') || type.includes('xml')) return FileText;
    if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return Archive;
    if (type.includes('javascript') || type.includes('html') || type.includes('css')) return Code;
    return File;
  }, []);

  const getFileIconColor = useCallback((type?: string) => {
    if (!type) return isDark ? 'text-gray-400' : 'text-gray-600';
    if (type.startsWith('image/')) return isDark ? 'text-green-400' : 'text-green-600';
    if (type.startsWith('video/')) return isDark ? 'text-red-400' : 'text-red-600';
    if (type.startsWith('audio/')) return isDark ? 'text-purple-400' : 'text-purple-600';
    if (type.includes('text') || type.includes('json') || type.includes('xml')) return isDark ? 'text-blue-400' : 'text-blue-600';
    if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return isDark ? 'text-yellow-400' : 'text-yellow-600';
    if (type.includes('javascript') || type.includes('html') || type.includes('css')) return isDark ? 'text-orange-400' : 'text-orange-600';
    return isDark ? 'text-gray-400' : 'text-gray-600';
  }, [isDark]);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const loadFiles = useCallback(async () => {
    try {
      const response = await fetch('/api/files');
      if (response.ok) {
        const serverFiles = await response.json();
        setFiles(serverFiles);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const uploadFiles = useCallback(async (fileList: FileList) => {
    setUploading(true);
    const formData = new FormData();
    
    Array.from(fileList).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadFiles(); // Reload files from server
          showNotification('success', `Successfully uploaded ${result.files.length} file(s)`);
        } else {
          showNotification('error', 'Upload failed: ' + result.error);
        }
      } else {
        showNotification('error', 'Upload failed: Server error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('error', 'Upload failed: Network error');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [loadFiles, showNotification]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files?.[0]) {
      uploadFiles(e.dataTransfer.files);
    }
  }, [uploadFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) {
      uploadFiles(e.target.files);
    }
  }, [uploadFiles]);

  const removeFile = useCallback(async (filename: string) => {
    try {
      const response = await fetch(`/api/files/${filename}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadFiles();
        showNotification('success', 'File deleted successfully');
      } else {
        showNotification('error', 'Failed to delete file');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('error', 'Failed to delete file');
    }
  }, [loadFiles, showNotification]);

  const downloadFile = useCallback((file: UploadedFile) => {
    const link = document.createElement('a');
    link.href = file.path;
    link.download = file.name;
    link.click();
  }, []);

  const clearAllFiles = useCallback(async () => {
    try {
      const deletePromises = files.map(file => 
        fetch(`/api/files/${file.filename}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      await loadFiles();
      setShowDeleteConfirm(false);
      showNotification('success', 'All files cleared successfully');
    } catch (error) {
      console.error('Clear all error:', error);
      showNotification('error', 'Failed to clear all files');
    }
  }, [files, loadFiles, showNotification]);

  const openPreview = useCallback((file: UploadedFile) => {
    setPreviewFile(file);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewFile(null);
  }, []);

  return (
    <div className={`rounded-lg border transition-colors duration-200 ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
          notification.type === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className={`p-4 border-b flex justify-between items-center ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h2 className={`text-lg font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          File Transfer
        </h2>
        {files.length > 0 && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
              isDark 
                ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400' 
                : 'bg-red-50 hover:bg-red-100 text-red-600'
            }`}
          >
            Clear All ({files.length})
          </button>
        )}
      </div>

      <div
        className={`p-6 text-center cursor-pointer border-2 border-dashed transition-all duration-200 ${
          dragActive 
            ? isDark 
              ? 'border-blue-400 bg-blue-900/20' 
              : 'border-blue-500 bg-blue-50'
            : isDark
              ? 'border-gray-600'
              : 'border-gray-300'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <Upload className={`mx-auto h-8 w-8 mb-3 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`} />
        <p className={`text-sm mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {uploading ? 'Uploading files...' : 'Drop files or click to upload'}
        </p>
        <p className={`text-xs mb-3 ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}>
          Maximum file size: 25GB per file
        </p>
        <button 
          disabled={uploading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
        >
          {uploading ? 'Uploading...' : 'Choose Files'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {files.length > 0 && (
        <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="p-4 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {files.map((file) => {
                const FileIcon = getFileIcon(file.type);
                const iconColor = getFileIconColor(file.type);
                
                return (
                  <div
                    key={file.id}
                    className={`p-3 rounded border transition-colors duration-200 ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-12 h-12 rounded flex items-center justify-center ${
                        isDark ? 'bg-gray-600' : 'bg-gray-200'
                      }`}>
                        <FileIcon className={`h-6 w-6 ${iconColor}`} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p 
                          className={`text-sm font-medium truncate cursor-pointer ${
                            isDark ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'
                          }`}
                          title={file.name}
                        >
                          {file.name}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {formatFileSize(file.size)}
                          </p>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => downloadFile(file)}
                              className={`p-1 rounded transition-colors duration-200 ${
                                isDark 
                                  ? 'hover:bg-gray-600 text-gray-400' 
                                  : 'hover:bg-gray-200 text-gray-500'
                              }`}
                              title="Download"
                            >
                              <Download className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => removeFile(file.filename)}
                              className={`p-1 rounded transition-colors duration-200 ${
                                isDark 
                                  ? 'hover:bg-red-900/50 text-red-400' 
                                  : 'hover:bg-red-50 text-red-500'
                              }`}
                              title="Delete"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg p-6 max-w-sm w-full ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Clear All Files
              </h3>
            </div>
            <p className={`text-sm mb-6 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Are you sure you want to remove all {files.length} files? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 px-4 py-2 rounded text-sm transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={clearAllFiles}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors duration-200"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}