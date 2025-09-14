import React, { useState, useEffect } from 'react';
import { User, FileText, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Upload, Camera } from 'lucide-react';

// Local type definitions
interface Tourist {
  id?: number;
  name: string;
  nationality: string;
  passportNumber: string;
  emergencyContact: string;
  medicalInfo?: string;
  isVerified?: boolean;
}

type DocumentType = 'visa' | 'passport' | 'aadhar';

interface DocumentUploadRequest {
  type: DocumentType;
  file: File;
  expiryDate?: Date;
}

const DOCUMENT_REQUIREMENTS = {
  Indian: { requiredDocuments: ['aadhar'] },
  American: { requiredDocuments: ['passport', 'visa'] },
  British: { requiredDocuments: ['passport', 'visa'] },
  // Add more nationalities as needed
};

interface TouristRegistrationProps {
  onRegister: (tourist: Omit<Tourist, 'id' | 'isVerified'>, documents: DocumentUploadRequest[]) => Promise<void>;
  onDocumentUpload: (document: DocumentUploadRequest) => Promise<void>;
}

interface RegistrationStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

export function TouristRegistration({
  onRegister,
  onDocumentUpload,
}: TouristRegistrationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Simple form state
  const [formData, setFormData] = useState({
    nationality: '',
    name: '',
    passportNumber: '',
    emergencyContact: '',
    medicalInfo: '',
  });
  
  // Document uploads
  const [uploadedDocuments, setUploadedDocuments] = useState<{aadhar?: File, visa?: File, passport?: File}>({});
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([]);

  // Update required documents when nationality changes
  useEffect(() => {
    if (formData.nationality === 'Indian') {
      setRequiredDocuments(['aadhar']);
    } else if (formData.nationality) {
      setRequiredDocuments(['visa', 'passport']);
    } else {
      setRequiredDocuments([]);
    }
  }, [formData.nationality]);

  // Simple input change handler
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    
    // Clear uploaded documents when nationality changes to avoid confusion
    if (field === 'nationality' && value) {
      setUploadedDocuments({});
    }
  };

  // Handle document upload
  const handleDocumentUpload = (type: 'aadhar' | 'visa' | 'passport', file: File) => {
    setUploadedDocuments(prev => ({ ...prev, [type]: file }));
    setError('');
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0: // Personal Info
        return !!(formData.name && formData.nationality && formData.passportNumber);
      case 1: // Contact Info
        return !!formData.emergencyContact;
      case 2: // Document Upload
        return requiredDocuments.every(docType => uploadedDocuments[docType as keyof typeof uploadedDocuments]);
      default:
        return true;
    }
  };

  // Navigation functions
  const nextStep = () => {
    if (validateCurrentStep() && currentStep < 2) {
      setCurrentStep(currentStep + 1);
      setError('');
    } else if (!validateCurrentStep()) {
      setError('Please fill in all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  // Submit registration
  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      setError('Please complete all required fields and upload all required documents.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert documents to the expected format
      const documentRequests: DocumentUploadRequest[] = [];
      
        Object.entries(uploadedDocuments).forEach(([type, file]) => {
        if (file) {
          documentRequests.push({
            type: type as DocumentType,
            file
          });
        }
      });

      await onRegister(formData as any, documentRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  // Render current step content
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Personal Information
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Please provide your basic information for tourist registration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                >
                  <option value="">Select your nationality</option>
                  <option value="Indian">Indian</option>
                  <option value="American">American</option>
                  <option value="British">British</option>
                  <option value="German">German</option>
                  <option value="French">French</option>
                  <option value="Canadian">Canadian</option>
                  <option value="Australian">Australian</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.nationality === 'Indian' ? 'Aadhaar Number' : 'Passport Number'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.passportNumber}
                  onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                  placeholder={formData.nationality === 'Indian' ? 'Enter your Aadhaar number' : 'Enter your passport number'}
                />
              </div>
            </div>

            {/* Document Requirements Info */}
            {formData.nationality && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Required Documents for {formData.nationality} Citizens:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {requiredDocuments.map(docType => (
                    <li key={docType} className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {docType === 'aadhar' ? 'Aadhaar Card' : docType === 'visa' ? 'Valid Visa' : 'Passport'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Contact & Emergency Information
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Provide contact details for emergency situations.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                  placeholder="Emergency contact number"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include country code (e.g., +1 555-123-4567)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Information (Optional)
                </label>
                <textarea
                  value={formData.medicalInfo}
                  onChange={(e) => handleInputChange('medicalInfo', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-4 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200 resize-none"
                  placeholder="Any medical conditions, allergies, or medications that emergency responders should know about..."
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Document Verification
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Upload the required documents to complete your registration.
              </p>
            </div>

            <div className="space-y-6">
              {/* Document requirement information */}
              {formData.nationality === 'Indian' ? (
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                  <p className="text-sm text-blue-700 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                    As an Indian citizen, you only need to provide your Aadhaar Card for verification.
                  </p>
                </div>
              ) : formData.nationality ? (
                <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                  <p className="text-sm text-purple-700 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-purple-600" />
                    As a foreign visitor, you need to provide both your Visa and Passport for verification.
                  </p>
                </div>
              ) : null}

              {formData.nationality === 'Indian' && (
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Aadhaar Card</h4>
                  <p className="text-sm text-gray-600 mb-4">Upload a clear photo of your Aadhaar card</p>
                  
                  {uploadedDocuments.aadhar ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <CheckCircle className="h-5 w-5 text-green-600 inline mr-2" />
                      <span className="text-green-800 font-medium">{uploadedDocuments.aadhar.name}</span>
                      <button
                        onClick={() => setUploadedDocuments(prev => ({ ...prev, aadhar: undefined }))}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="file"
                        id="aadhar-upload"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleDocumentUpload('aadhar', file);
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="aadhar-upload"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-2xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 cursor-pointer transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        Upload Aadhaar Card
                      </label>
                    </div>
                  )}
                </div>
              )}

              {formData.nationality && formData.nationality !== 'Indian' && (
                <>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Passport</h4>
                    <p className="text-sm text-gray-600 mb-4">Upload a clear photo of your passport</p>
                    
                    {uploadedDocuments.passport ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <CheckCircle className="h-5 w-5 text-green-600 inline mr-2" />
                        <span className="text-green-800 font-medium">{uploadedDocuments.passport.name}</span>
                        <button
                          onClick={() => setUploadedDocuments(prev => ({ ...prev, passport: undefined }))}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="file"
                          id="passport-upload"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDocumentUpload('passport', file);
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="passport-upload"
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-2xl shadow-sm text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 cursor-pointer transition-all duration-200 transform hover:scale-[1.02]"
                        >
                          <Upload className="h-5 w-5 mr-2" />
                          Upload Passport
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Visa</h4>
                    <p className="text-sm text-gray-600 mb-4">Upload a clear photo of your valid visa</p>
                    
                    {uploadedDocuments.visa ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <CheckCircle className="h-5 w-5 text-green-600 inline mr-2" />
                        <span className="text-green-800 font-medium">{uploadedDocuments.visa.name}</span>
                        <button
                          onClick={() => setUploadedDocuments(prev => ({ ...prev, visa: undefined }))}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="file"
                          id="visa-upload"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDocumentUpload('visa', file);
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="visa-upload"
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-2xl shadow-sm text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 cursor-pointer transition-all duration-200 transform hover:scale-[1.02]"
                        >
                          <Upload className="h-5 w-5 mr-2" />
                          Upload Visa
                        </label>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Upload Progress */}
              {requiredDocuments.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Document Upload Progress
                    </span>
                    <span className="text-sm text-gray-500">
                      {Object.values(uploadedDocuments).filter(Boolean).length} of {requiredDocuments.length} completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(Object.values(uploadedDocuments).filter(Boolean).length / requiredDocuments.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Steps configuration
  const steps = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Basic details and nationality',
    },
    {
      id: 'contact',
      title: 'Contact Information',
      description: 'Emergency contacts and medical info',
    },
    {
      id: 'documents',
      title: 'Document Upload',
      description: 'Required identity verification',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <User className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            SafeGuard Tourist
          </h1>
          <p className="text-purple-100">
            Complete Registration Process
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  index <= currentStep 
                    ? 'border-purple-500 bg-purple-500 text-white shadow-lg' 
                    : 'border-gray-300 text-gray-400 bg-white'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-2 mx-4 rounded-full ${
                    index < currentStep 
                      ? 'bg-purple-500' 
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 text-center">
                <p className={`text-sm font-semibold ${
                  index <= currentStep ? 'text-purple-700' : 'text-gray-600'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          {renderCurrentStep()}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center px-6 py-4 border-2 border-gray-300 rounded-2xl shadow-sm text-sm font-semibold transition-all duration-200 transform hover:scale-[1.02] ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center px-6 py-4 border border-transparent rounded-2xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-[1.02] shadow-purple-500/25"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !validateCurrentStep()}
              className={`flex items-center px-6 py-4 border border-transparent rounded-2xl shadow-lg text-sm font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] ${
                loading || !validateCurrentStep()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-green-500/25'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Registering...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Registration
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
