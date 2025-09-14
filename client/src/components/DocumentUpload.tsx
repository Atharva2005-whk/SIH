import React, { useState, useCallback, useRef } from 'react';
import { Upload, File, X, Check, AlertCircle, Eye, Trash2 } from 'lucide-react';

// Local type definitions
type DocumentType = 'visa' | 'passport' | 'aadhar';

interface DocumentUploadRequest {
  type: DocumentType;
  file: File;
  expiryDate?: Date;
}

// Constants
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'application/pdf'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const DOCUMENT_REQUIREMENTS = {
  DEFAULT: { requiredDocuments: [] },
  Indian: { requiredDocuments: ['aadhar'] },
  American: { requiredDocuments: ['passport', 'visa'] },
  British: { requiredDocuments: ['passport', 'visa'] },
  // Add more nationalities as needed
};

interface DocumentUploadProps {
  documentType: DocumentType;
  nationality?: string;
  onUpload: (document: DocumentUploadRequest) => Promise<void>;
  onRemove?: () => void;
  existingDocument?: {
    fileName: string;
    uploadedAt: Date;
    verificationStatus: string;
  };
  required?: boolean;
  disabled?: boolean;
}

export function DocumentUpload({
  documentType,
  nationality = 'DEFAULT',
  onUpload,
  onRemove,
  existingDocument,
  required = false,
  disabled = false,
}: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requirements = DOCUMENT_REQUIREMENTS[nationality] || DOCUMENT_REQUIREMENTS.DEFAULT;
  const isRequired = required || requirements.requiredDocuments.includes(documentType);

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload JPEG, PNG, WebP, or PDF files only.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`;
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      handleFileSelect(selectedFiles[0]);
    }
  };

  // Upload document
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      await onUpload({
        type: documentType,
        file,
        expiryDate: undefined, // Could be added based on document type
      });
      
      // Reset form on successful upload
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get document type display name
  const getDocumentTypeName = (type: DocumentType): string => {
    const names: Record<DocumentType, string> = {
      visa: 'Visa',
      passport: 'Passport',
      aadhar: 'Aadhaar Card',
    };
    return names[type] || type;
  };

  // Get verification status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'rejected': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'under_review': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {getDocumentTypeName(documentType)}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isRequired ? 'Required document' : 'Optional document'}
          </p>
        </div>
      </div>

      {/* Existing Document */}
      {existingDocument && (
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {existingDocument.fileName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Uploaded {existingDocument.uploadedAt.toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(existingDocument.verificationStatus)}`}>
                {existingDocument.verificationStatus.replace('_', ' ')}
              </span>
              {onRemove && (
                <button
                  onClick={onRemove}
                  className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!existingDocument && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            file
              ? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/10'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {file ? (
            /* Selected File Preview */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <File className="h-12 w-12 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {preview && (
                    <button
                      onClick={() => setShowPreview(true)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={handleRemoveFile}
                    className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={uploading || disabled}
                className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                  uploading || disabled
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {getDocumentTypeName(documentType)}
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Upload Prompt */
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <div className="mt-4">
                <label htmlFor={`file-${documentType}`} className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Drop your {getDocumentTypeName(documentType)} here, or{' '}
                    <span className="text-blue-600 dark:text-blue-400 hover:text-blue-500">browse</span>
                  </span>
                </label>
                <input
                  ref={fileInputRef}
                  id={`file-${documentType}`}
                  type="file"
                  className="hidden"
                  accept={ALLOWED_FILE_TYPES.join(',')}
                  onChange={handleFileInputChange}
                  disabled={disabled}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  JPEG, PNG, WebP, PDF up to {formatFileSize(MAX_FILE_SIZE)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && preview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Document Preview
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={preview}
                alt="Document preview"
                className="max-w-full h-auto rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
