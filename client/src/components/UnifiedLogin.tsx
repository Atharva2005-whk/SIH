import React, { useState, useRef } from 'react';
import { 
  Shield, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus,
  LogIn,
  Phone,
  MapPin,
  Badge,
  Building,
  Upload,
  FileText,
  CheckCircle,
  X
} from 'lucide-react';

interface UnifiedLoginProps {
  onTouristLogin: (credentials: any) => Promise<void>;
  onAuthorityLogin: (credentials: any) => Promise<void>;
}

export function UnifiedLogin({ onTouristLogin, onAuthorityLogin }: UnifiedLoginProps) {
  const [selectedRole, setSelectedRole] = useState<'tourist' | 'authority'>('tourist');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // true for login, false for register
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    
    // Tourist fields
    fullName: '',
    phoneNumber: '',
    nationality: '',
    passportNumber: '',
    emergencyContact: '',
    
    // Authority fields
    department: '',
    badge: '',
    organizationId: ''
  });

  // Document upload state
  const [documents, setDocuments] = useState<{
    aadhaar?: File;
    visa?: File;
    passport?: File;
  }>({});
  const [uploadedDocs, setUploadedDocs] = useState<{
    aadhaar?: string;
    visa?: string;
    passport?: string;
  }>({});
  
  const aadhaarRef = useRef<HTMLInputElement>(null);
  const visaRef = useRef<HTMLInputElement>(null);
  const passportRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear documents when nationality changes to avoid confusion
    if (field === 'nationality' && value) {
      setDocuments({});
      setUploadedDocs({});
      if (aadhaarRef.current) aadhaarRef.current.value = '';
      if (visaRef.current) visaRef.current.value = '';
      if (passportRef.current) passportRef.current.value = '';
    }
  };

  const handleDocumentUpload = (docType: 'aadhaar' | 'visa' | 'passport', file: File) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload only JPEG, PNG, or PDF files.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB.');
        return;
      }
      
      setDocuments(prev => ({ ...prev, [docType]: file }));
      setUploadedDocs(prev => ({ ...prev, [docType]: file.name }));
    }
  };

  const removeDocument = (docType: 'aadhaar' | 'visa' | 'passport') => {
    setDocuments(prev => {
      const newDocs = { ...prev };
      delete newDocs[docType];
      return newDocs;
    });
    setUploadedDocs(prev => {
      const newDocs = { ...prev };
      delete newDocs[docType];
      return newDocs;
    });
    
    // Reset file input
    if (docType === 'aadhaar' && aadhaarRef.current) aadhaarRef.current.value = '';
    if (docType === 'visa' && visaRef.current) visaRef.current.value = '';
    if (docType === 'passport' && passportRef.current) passportRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (selectedRole === 'tourist') {
        // Validate required documents based on nationality
        if (!isLogin) {
          if (formData.nationality === 'Indian') {
            // Indian citizens need only Aadhaar Card
            if (!documents.aadhaar) {
              alert('Please upload your Aadhaar Card to continue registration.');
              setLoading(false);
              return;
            }
          } else {
            // Foreign citizens need Visa and Passport
            if (!documents.visa || !documents.passport) {
              alert('Please upload both your Visa and Passport to continue registration.');
              setLoading(false);
              return;
            }
          }
        }
        
        const credentials = {
          identifier: formData.email,
          password: formData.password,
          nationality: formData.nationality,
          userType: 'tourist',
          documents: documents, // Include uploaded documents
          ...(isLogin ? {} : {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            passportNumber: formData.passportNumber,
            emergencyContact: formData.emergencyContact
          })
        };
        await onTouristLogin(credentials);
      } else {
        const credentials = {
          email: formData.email,
          password: formData.password,
          department: formData.department,
          badge: formData.badge,
          userType: 'authority',
          ...(isLogin ? {} : {
            fullName: formData.fullName,
            organizationId: formData.organizationId
          })
        };
        await onAuthorityLogin(credentials);
      }
    } catch (error) {
      console.error('Login/Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-6 shadow-2xl">
            <Shield className="h-10 w-10 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            SafeGuard Tourist
          </h1>
          <p className="text-purple-100">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Login/Register Toggle */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                isLogin
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <LogIn className="h-4 w-4 inline mr-2" />
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                !isLogin
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <UserPlus className="h-4 w-4 inline mr-2" />
              Register
            </button>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('tourist')}
                className={`p-4 border-2 rounded-2xl transition-all duration-200 ${
                  selectedRole === 'tourist'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <User className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Tourist</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('authority')}
                className={`p-4 border-2 rounded-2xl transition-all duration-200 ${
                  selectedRole === 'authority'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <Shield className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Authority</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Full Name - Registration only */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Tourist-specific fields */}
            {selectedRole === 'tourist' && (
              <>
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={formData.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                      required
                    >
                      <option value="">Select nationality</option>
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
                </div>

                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Passport/ID Number
                      </label>
                      <input
                        type="text"
                        value={formData.passportNumber}
                        onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                        className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter passport or ID number"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Emergency contact name and number"
                        required
                      />
                    </div>

                    {/* Document Upload Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-dashed border-blue-300">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="h-5 w-5 text-blue-600 mr-2" />
                        Document Upload (Required)
                      </h4>
                      
                      {/* Document requirements based on nationality */}
                      {formData.nationality === 'Indian' ? (
                        // For Indian Citizens - Only Aadhaar Card required
                        <div className="space-y-4">
                          <div className="bg-white rounded-2xl p-4 border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Aadhaar Card *
                            </label>
                            {!uploadedDocs.aadhaar ? (
                              <div className="relative">
                                <input
                                  ref={aadhaarRef}
                                  type="file"
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleDocumentUpload('aadhaar', file);
                                  }}
                                  className="hidden"
                                />
                                <button
                                  type="button"
                                  onClick={() => aadhaarRef.current?.click()}
                                  className="w-full flex items-center justify-center px-4 py-4 border-2 border-dashed border-blue-300 rounded-2xl text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                >
                                  <Upload className="h-5 w-5 mr-2" />
                                  Upload Aadhaar Card
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between bg-green-50 p-3 rounded-2xl">
                                <div className="flex items-center">
                                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                  <span className="text-sm text-green-700 truncate">
                                    {uploadedDocs.aadhaar}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeDocument('aadhaar')}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                            <p className="text-sm text-blue-700 flex items-center">
                              <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                              As an Indian citizen, you only need to provide your Aadhaar Card for verification.
                            </p>
                          </div>
                        </div>
                      ) : (
                        // For Foreign Citizens - Visa and Passport required, no Aadhaar
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Visa Upload */}
                            <div className="bg-white rounded-2xl p-4 border border-gray-200">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Visa *
                              </label>
                              {!uploadedDocs.visa ? (
                                <div className="relative">
                                  <input
                                    ref={visaRef}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleDocumentUpload('visa', file);
                                    }}
                                    className="hidden"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => visaRef.current?.click()}
                                    className="w-full flex items-center justify-center px-4 py-4 border-2 border-dashed border-purple-300 rounded-2xl text-purple-600 hover:bg-purple-50 transition-all duration-200"
                                  >
                                    <Upload className="h-5 w-5 mr-2" />
                                    Upload Visa
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between bg-green-50 p-3 rounded-2xl">
                                  <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                    <span className="text-sm text-green-700 truncate">
                                      {uploadedDocs.visa}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeDocument('visa')}
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Passport Upload */}
                            <div className="bg-white rounded-2xl p-4 border border-gray-200">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Passport *
                              </label>
                              {!uploadedDocs.passport ? (
                                <div className="relative">
                                  <input
                                    ref={passportRef}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleDocumentUpload('passport', file);
                                    }}
                                    className="hidden"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => passportRef.current?.click()}
                                    className="w-full flex items-center justify-center px-4 py-4 border-2 border-dashed border-green-300 rounded-2xl text-green-600 hover:bg-green-50 transition-all duration-200"
                                  >
                                    <Upload className="h-5 w-5 mr-2" />
                                    Upload Passport
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between bg-green-50 p-3 rounded-2xl">
                                  <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                    <span className="text-sm text-green-700 truncate">
                                      {uploadedDocs.passport}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeDocument('passport')}
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                            <p className="text-sm text-purple-700 flex items-center">
                              <CheckCircle className="h-4 w-4 mr-2 text-purple-600" />
                              As a foreign visitor, you need to provide both your Visa and Passport for verification.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-600 mt-4">
                        <span className="text-red-500">*</span> Required documents. 
                        Supported formats: JPEG, PNG, PDF (max 5MB each)
                      </p>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Authority-specific fields */}
            {selectedRole === 'authority' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                      required
                    >
                      <option value="">Select department</option>
                      <option value="police">Police</option>
                      <option value="fire">Fire Department</option>
                      <option value="medical">Medical Services</option>
                      <option value="tourism">Tourism Board</option>
                      <option value="security">Security</option>
                      <option value="customs">Customs</option>
                      <option value="immigration">Immigration</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Badge/ID Number
                  </label>
                  <div className="relative">
                    <Badge className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => handleInputChange('badge', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Enter badge or ID number"
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization ID
                    </label>
                    <input
                      type="text"
                      value={formData.organizationId}
                      onChange={(e) => handleInputChange('organizationId', e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Enter organization ID"
                      required
                    />
                  </div>
                )}
              </>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password - Registration only */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-2xl shadow-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </div>
              ) : (
                <>
                  {isLogin ? (
                    <>
                      <LogIn className="h-5 w-5 inline mr-2" />
                      {selectedRole === 'tourist' ? 'Login as Tourist' : 'Login as Authority'}
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 inline mr-2" />
                      {selectedRole === 'tourist' ? 'Register as Tourist' : 'Register as Authority'}
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              {selectedRole === 'tourist' ? (
                <>
                  Tourist safety is our priority. Your data is protected and secure.
                </>
              ) : (
                <>
                  Authorized personnel only. All activities are monitored and logged.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
