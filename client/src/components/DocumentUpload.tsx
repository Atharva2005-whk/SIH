import React, { useState, useCallback, useRef } from 'react';
import { Upload, File, X, Check, AlertCircle, Eye, Trash2, CreditCard, Globe, FileText } from 'lucide-react';

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

// Multi-document upload interface for registration form
export interface MultiDocumentUploadProps {
  userType: 'indian' | 'foreign';
  uploadedDocuments: {
    aadhar?: File;
    passport?: File;
    visa?: File;
  };
  onDocumentUpload: (type: 'aadhar' | 'passport' | 'visa', file: File) => void;
  onDocumentRemove: (type: 'aadhar' | 'passport' | 'visa') => void;
  errors?: {
    aadhar?: string;
    passport?: string;
    visa?: string;
  };
  isUploading?: boolean;
  className?: string;
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

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case 'aadhar':
        return <CreditCard className="h-6 w-6 text-orange-600" />;
      case 'passport':
        return <Globe className="h-6 w-6 text-blue-600" />;
      case 'visa':
        return <FileText className="h-6 w-6 text-purple-600" />;
      default:
        return <File className="h-6 w-6 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-2xl bg-gray-100">
            {getDocumentIcon(documentType)}
          </div>
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

// Multi-document upload component for registration forms
export function MultiDocumentUpload({
  userType,
  uploadedDocuments,
  onDocumentUpload,
  onDocumentRemove,
  errors = {},
  isUploading = false,
  className = ''
}: MultiDocumentUploadProps) {
  const [draggedOver, setDraggedOver] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent, docType: string) => {
    e.preventDefault();
    setDraggedOver(docType);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDraggedOver(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, docType: 'aadhar' | 'passport' | 'visa') => {
    e.preventDefault();
    setDraggedOver(null);
    
    const file = e.dataTransfer.files[0];
    if (file && validateMultiFile(file)) {
      onDocumentUpload(docType, file);
    }
  }, [onDocumentUpload]);

  const validateMultiFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 10MB.');
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please select JPG, PNG, or PDF files.');
      return false;
    }
    
    return true;
  };

  const getDocumentColors = (docType: string) => {
    switch (docType) {
      case 'aadhar':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          iconBg: 'bg-orange-100',
          icon: 'text-orange-600',
          button: 'from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800',
          text: 'text-orange-900'
        };
      case 'passport':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          iconBg: 'bg-blue-100',
          icon: 'text-blue-600',
          button: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
          text: 'text-blue-900'
        };
      case 'visa':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          iconBg: 'bg-purple-100',
          icon: 'text-purple-600',
          button: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
          text: 'text-purple-900'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          iconBg: 'bg-gray-100',
          icon: 'text-gray-600',
          button: 'from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800',
          text: 'text-gray-900'
        };
    }
  };

  const DocumentUploadBox = ({ docType, title, description, icon }: {
    docType: 'aadhar' | 'passport' | 'visa';
    title: string;
    description: string;
    icon: React.ReactNode;
  }) => {
    const colors = getDocumentColors(docType);
    const file = uploadedDocuments[docType];
    const error = errors[docType];
    const isDraggedOver = draggedOver === docType;

    return (
      <div
        className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-200 ${
          isDraggedOver
            ? 'border-purple-400 bg-purple-50'
            : error
            ? 'border-red-300 bg-red-50'
            : file
            ? 'border-green-300 bg-green-50'
            : `${colors.border} ${colors.bg}`
        }`}
        onDragOver={(e) => handleDragOver(e, docType)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, docType)}
      >
        <div className="text-center">
          <div className={`p-4 rounded-full w-fit mx-auto mb-4 ${
            file ? 'bg-green-100' : colors.iconBg
          }`}>
            {file ? (
              <Check className="h-8 w-8 text-green-600" />
            ) : (
              icon
            )}
          </div>
          
          <h5 className={`font-semibold text-lg mb-2 ${
            file ? 'text-green-900' : colors.text
          }`}>
            {title}
          </h5>
          
          <p className={`text-sm mb-4 ${
            file ? 'text-green-700' : 'text-gray-600'
          }`}>
            {file ? `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)` : description}
          </p>

          {file ? (
            <div className="space-y-3">
              <div className="bg-green-100 border border-green-200 rounded-2xl p-3">
                <Check className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-green-800 font-medium text-sm">Document uploaded successfully</p>
              </div>
              
              <div className="flex space-x-2">
                <label className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-2xl shadow-sm text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 cursor-pointer transition-all duration-200">
                  <Upload className="h-4 w-4 mr-2" />
                  Replace
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile && validateMultiFile(selectedFile)) {
                        onDocumentUpload(docType, selectedFile);
                      }
                    }}
                    disabled={isUploading}
                  />
                </label>
                
                <button
                  type="button"
                  onClick={() => onDocumentRemove(docType)}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-2xl hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-2xl shadow-sm text-white bg-gradient-to-r ${colors.button} cursor-pointer transition-all duration-200 transform hover:scale-105 disabled:opacity-50`}>
                {isUploading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload {title}
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile && validateMultiFile(selectedFile)) {
                      onDocumentUpload(docType, selectedFile);
                    }
                  }}
                  disabled={isUploading}
                />
              </label>
              
              <p className="text-xs text-gray-500">
                Or drag and drop your file here
              </p>
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-2xl">
              <div className="flex items-center text-sm text-red-800">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const requiredDocuments = userType === 'indian' ? 1 : 2;
  const uploadedCount = Object.values(uploadedDocuments).filter(Boolean).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* User Type Info */}
      <div className={`p-4 rounded-2xl border-2 ${
        userType === 'indian' 
          ? 'bg-orange-50 border-orange-200' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center">
          <div className={`p-3 rounded-2xl mr-4 ${
            userType === 'indian' ? 'bg-orange-100' : 'bg-blue-100'
          }`}>
            {userType === 'indian' ? (
              <CreditCard className="h-6 w-6 text-orange-600" />
            ) : (
              <Globe className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${
              userType === 'indian' ? 'text-orange-900' : 'text-blue-900'
            }`}>
              {userType === 'indian' ? 'Indian Citizen' : 'Foreign Visitor'}
            </h3>
            <p className={`text-sm ${
              userType === 'indian' ? 'text-orange-700' : 'text-blue-700'
            }`}>
              {userType === 'indian' 
                ? 'Please upload your Aadhar Card for identity verification'
                : 'Please upload your Passport and Visa for identity verification'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Document Upload Areas */}
      {userType === 'indian' ? (
        <DocumentUploadBox 
          docType="aadhar"
          title="Aadhar Card"
          description="Upload a clear photo of your Aadhar card (both sides accepted)"
          icon={<CreditCard className="h-8 w-8 text-orange-600" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DocumentUploadBox 
            docType="passport"
            title="Passport"
            description="Upload the main information page of your passport"
            icon={<Globe className="h-8 w-8 text-blue-600" />}
          />
          <DocumentUploadBox 
            docType="visa"
            title="Visa"
            description="Upload the page with your valid visa stamp/sticker"
            icon={<FileText className="h-8 w-8 text-purple-600" />}
          />
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Upload Guidelines
        </h4>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-center">
            <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
            Supported formats: JPG, PNG, PDF
          </li>
          <li className="flex items-center">
            <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
            Maximum file size: 10 MB
          </li>
          <li className="flex items-center">
            <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
            Ensure document is clear and all corners are visible
          </li>
          <li className="flex items-center">
            <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
            Document should not be blurred or damaged
          </li>
          {userType === 'indian' ? (
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
              For Aadhar: Both front and back can be uploaded as one file
            </li>
          ) : (
            <>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                Passport: Upload the main information page
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                Visa: Upload the page with your visa stamp/sticker
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">
            Upload Progress
          </span>
          <span className="text-sm text-gray-500">
            {uploadedCount} of {requiredDocuments} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-purple-700 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(uploadedCount / requiredDocuments) * 100}%` 
            }}
          ></div>
        </div>
        {uploadedCount === requiredDocuments && (
          <div className="mt-3 flex items-center text-green-600 text-sm font-medium">
            <Check className="h-4 w-4 mr-2" />
            All required documents uploaded!
          </div>
        )}
      </div>
    </div>
  );
}
