import React, { useState } from 'react';
import { 
  CreditCard, 
  Globe,
  Shield,
  MapPin,
  Users,
  Phone,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  CheckCircle
} from 'lucide-react';

interface TouristAuthContainerProps {
  onAuthentication: (user: any) => Promise<void>;
}

interface TouristLoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface TouristRegisterCredentials {
  userType: 'indian' | 'foreign';
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  nationality: string;
  passportNumber: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  agreeToTerms: boolean;
  documents: {
    aadhar?: File;
    passport?: File;
    visa?: File;
  };
}

export function TouristAuthContainer({ onAuthentication }: TouristAuthContainerProps) {
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');
  const [loginData, setLoginData] = useState<TouristLoginCredentials>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [registerData, setRegisterData] = useState<TouristRegisterCredentials>({
    userType: 'indian',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    nationality: 'Indian', // Default to Indian since userType defaults to 'indian'
    passportNumber: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    agreeToTerms: false,
    documents: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!loginData.email.trim()) {
        throw new Error('Please enter your email address');
      }
      if (!loginData.password.trim()) {
        throw new Error('Please enter your password');
      }
      if (!/\S+@\S+\.\S+/.test(loginData.email)) {
        throw new Error('Please enter a valid email address');
      }

      console.log('🚀 Tourist login attempt:', loginData);
      
      const loginRequestData = {
        identifier: loginData.email,
        password: loginData.password,
        nationality: loginData.email.includes('indian') ? 'Indian' : 'Foreign'
      };
      
      // Import the API client to call login directly
      const { apiClient } = await import('../services/api');
      
      const response = await apiClient.touristLogin(loginRequestData);
      
      if (response.success && response.data) {
        console.log('✅ Login successful!');
        
        // Create the user object for onAuthentication
        const userForAuth = {
          userType: loginData.email.includes('indian') ? 'indian' : 'foreign',
          fullName: response.data.user.name,
          email: response.data.user.email,
          password: loginData.password,
          phoneNumber: '+91-9876543210',
          emergencyContactName: 'Emergency Contact',
          emergencyContactNumber: '+91-9876543211',
          isLoggedIn: true // Flag to indicate this is login, not registration
        };
        
        await onAuthentication(userForAuth);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!registerData.fullName.trim()) {
        throw new Error('Please enter your full name');
      }
      if (!registerData.email.trim()) {
        throw new Error('Please enter your email address');
      }
      if (!/\S+@\S+\.\S+/.test(registerData.email)) {
        throw new Error('Please enter a valid email address');
      }
      if (!registerData.password.trim()) {
        throw new Error('Please enter a password');
      }
      if (registerData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      if (registerData.password !== registerData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (!registerData.phoneNumber.trim()) {
        throw new Error('Please enter your phone number');
      }
      // Auto-set nationality for Indian users, validate for foreign users
      if (registerData.userType === 'foreign' && !registerData.nationality.trim()) {
        throw new Error('Please select your nationality');
      }
      if (!registerData.passportNumber.trim()) {
        throw new Error('Please enter your passport/ID number');
      }
      if (!registerData.emergencyContactName.trim()) {
        throw new Error('Please enter emergency contact name');
      }
      if (!registerData.emergencyContactNumber.trim()) {
        throw new Error('Please enter emergency contact number');
      }
      if (!registerData.agreeToTerms) {
        throw new Error('Please agree to the Terms of Service and Privacy Policy');
      }

      // Document validation
      if (registerData.userType === 'indian') {
        if (!registerData.documents.aadhar) {
          throw new Error('Please upload your Aadhar Card');
        }
      } else {
        if (!registerData.documents.passport) {
          throw new Error('Please upload your Passport');
        }
        if (!registerData.documents.visa) {
          throw new Error('Please upload your Visa');
        }
      }

      // Prepare tourist data for registration
      const touristData = {
        name: registerData.fullName,
        email: registerData.email,
        phoneNumber: registerData.phoneNumber,
        nationality: registerData.userType === 'indian' ? 'Indian' : registerData.nationality,
        passportNumber: registerData.passportNumber,
        emergencyContact: registerData.emergencyContactName,
        isVerified: false,
        verificationLevel: 'none' as const
      };

      // Prepare document uploads
      const documentUploads = [];
      if (registerData.documents.aadhar) {
        documentUploads.push({
          type: 'aadhar' as const,
          file: registerData.documents.aadhar
        });
      }
      if (registerData.documents.passport) {
        documentUploads.push({
          type: 'passport' as const,
          file: registerData.documents.passport
        });
      }
      if (registerData.documents.visa) {
        documentUploads.push({
          type: 'visa' as const,
          file: registerData.documents.visa
        });
      }

      console.log('🚀 Registering tourist:', touristData);
      console.log('📎 Documents:', documentUploads);

      // Import the API client to call registration directly
      const { apiClient } = await import('../services/api');
      
      const response = await apiClient.registerTourist(touristData, documentUploads);
      
      if (response.success) {
        console.log('✅ Registration successful!');
        alert(`Registration successful! Welcome ${touristData.name}! Please login to access your dashboard.`);
        // Switch to login view
        setCurrentView('login');
        setLoginData({
          email: registerData.email,
          password: registerData.password,
          rememberMe: false
        });
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const updateLoginField = (field: keyof TouristLoginCredentials, value: any) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const updateRegisterField = (field: keyof TouristRegisterCredentials, value: any) => {
    setRegisterData(prev => ({ 
      ...prev, 
      [field]: value,
      // Clear documents when changing user type and set nationality
      ...(field === 'userType' && { 
        documents: {},
        nationality: value === 'indian' ? 'Indian' : ''
      })
    }));
    setError('');
  };

  const handleDocumentUpload = (docType: 'aadhar' | 'passport' | 'visa', file: File | undefined) => {
    setRegisterData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: file
      }
    }));
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            SafeSphere Tourist
          </h1>
          <p className="text-purple-100">
            {currentView === 'login' ? 'Welcome back! Sign in to continue' : 'Join our AI-powered safety monitoring platform'}
          </p>
        </div>

        {/* Main Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            <button
              onClick={() => setCurrentView('login')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
                currentView === 'login'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <User className="h-4 w-4 mr-2" />
              Login
            </button>
            <button
              onClick={() => setCurrentView('register')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
                currentView === 'register'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Register
            </button>
          </div>

          {currentView === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                <p className="text-gray-600 mt-2">Access your safety dashboard</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => updateLoginField('email', e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => updateLoginField('password', e.target.value)}
                    className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={loginData.rememberMe}
                    onChange={(e) => updateLoginField('rememberMe', e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Demo Login */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or try demo</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLoginData({ email: 'indian.tourist@example.com', password: 'demo123', rememberMe: false })}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="w-6 h-4 bg-gradient-to-r from-orange-500 to-white to-green-500 rounded-sm mr-2"></div>
                  Indian Tourist
                </button>
                <button
                  type="button"
                  onClick={() => setLoginData({ email: 'foreign.tourist@example.com', password: 'demo123', rememberMe: false })}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  <Globe className="w-4 h-4 text-blue-600 mr-2" />
                  Foreign Tourist
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 border border-transparent rounded-2xl shadow-lg text-base font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-purple-500/25'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                <p className="text-gray-600 mt-2">Join thousands of safe travelers</p>
              </div>

              {/* Identity Type Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Identity Type
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => updateRegisterField('userType', 'indian')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center space-y-3 ${
                      registerData.userType === 'indian'
                        ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="p-3 rounded-full bg-orange-100">
                      <CreditCard className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm">Indian Citizen</div>
                      <div className="text-xs text-gray-500 mt-1">Aadhar Card</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateRegisterField('userType', 'foreign')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center space-y-3 ${
                      registerData.userType === 'foreign'
                        ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="p-3 rounded-full bg-blue-100">
                      <Globe className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm">Foreign Visitor</div>
                      <div className="text-xs text-gray-500 mt-1">Passport/Visa</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={registerData.fullName}
                      onChange={(e) => updateRegisterField('fullName', e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => updateRegisterField('email', e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={(e) => updateRegisterField('password', e.target.value)}
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                      placeholder="Create password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerData.confirmPassword}
                      onChange={(e) => updateRegisterField('confirmPassword', e.target.value)}
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                      placeholder="Confirm password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Phone and Nationality */}
              <div className={`grid gap-4 ${
                registerData.userType === 'indian' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
              }`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={registerData.phoneNumber}
                      onChange={(e) => updateRegisterField('phoneNumber', e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                      placeholder={registerData.userType === 'indian' ? 'Enter phone number (e.g., +91-9876543210)' : 'Enter phone number'}
                      required
                    />
                  </div>
                </div>

                {/* Only show nationality for foreign visitors */}
                {registerData.userType === 'foreign' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nationality
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={registerData.nationality}
                        onChange={(e) => updateRegisterField('nationality', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200 appearance-none"
                        required
                      >
                        <option value="">Select nationality</option>
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
                )}
              </div>

              {/* Passport/ID Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport/ID Number
                </label>
                <input
                  type="text"
                  value={registerData.passportNumber}
                  onChange={(e) => updateRegisterField('passportNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                  placeholder="Enter passport or ID number"
                  required
                />
              </div>

              {/* Document Upload Section */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-gray-100 mr-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">
                    Identity Verification 
                    <span className="text-xs text-gray-500 ml-2">
                      ({registerData.userType === 'indian' ? 'Indian' : 'Foreign'} Citizen)
                    </span>
                  </h4>
                </div>
                
                {registerData.userType === 'indian' ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6">
                    <div className="text-center">
                      <div className="p-4 bg-orange-100 rounded-full w-fit mx-auto mb-4">
                        <CreditCard className="h-8 w-8 text-orange-600" />
                      </div>
                      <h5 className="font-semibold text-gray-900 mb-2">Upload Aadhar Card</h5>
                      <p className="text-sm text-gray-600 mb-4">Upload a clear photo of your Aadhar card (both sides accepted)</p>
                      
                      {registerData.documents.aadhar ? (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                          <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                          <p className="text-green-800 font-medium">{registerData.documents.aadhar.name}</p>
                          <p className="text-green-600 text-sm">{(registerData.documents.aadhar.size / 1024 / 1024).toFixed(2)} MB</p>
                          <button
                            type="button"
                            onClick={() => handleDocumentUpload('aadhar', undefined)}
                            className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div>
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
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-2xl shadow-sm text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 cursor-pointer transition-all duration-200 transform hover:scale-105"
                          >
                            <Upload className="h-5 w-5 mr-2" />
                            Upload Aadhar Card
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Passport Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6">
                      <div className="text-center">
                        <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                          <Globe className="h-8 w-8 text-blue-600" />
                        </div>
                        <h5 className="font-semibold text-gray-900 mb-2">Upload Passport</h5>
                        <p className="text-sm text-gray-600 mb-4">Upload the main information page</p>
                        
                        {registerData.documents.passport ? (
                          <div className="bg-green-50 border border-green-200 rounded-2xl p-3 mb-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                            <p className="text-green-800 font-medium text-sm">{registerData.documents.passport.name}</p>
                            <button
                              type="button"
                              onClick={() => handleDocumentUpload('passport', undefined)}
                              className="mt-1 text-red-600 hover:text-red-700 text-xs font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
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
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-2xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 cursor-pointer transition-all duration-200"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Visa Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6">
                      <div className="text-center">
                        <div className="p-4 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                          <FileText className="h-8 w-8 text-purple-600" />
                        </div>
                        <h5 className="font-semibold text-gray-900 mb-2">Upload Visa</h5>
                        <p className="text-sm text-gray-600 mb-4">Upload your valid visa page</p>
                        
                        {registerData.documents.visa ? (
                          <div className="bg-green-50 border border-green-200 rounded-2xl p-3 mb-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                            <p className="text-green-800 font-medium text-sm">{registerData.documents.visa.name}</p>
                            <button
                              type="button"
                              onClick={() => handleDocumentUpload('visa', undefined)}
                              className="mt-1 text-red-600 hover:text-red-700 text-xs font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
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
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-2xl shadow-sm text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 cursor-pointer transition-all duration-200"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Upload Guidelines */}
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <h6 className="font-semibold text-blue-900 mb-2">Upload Guidelines</h6>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Supported formats: JPG, PNG, PDF</li>
                    <li>• Maximum file size: 10 MB</li>
                    <li>• Ensure document is clear and all corners are visible</li>
                    {registerData.userType === 'indian' ? (
                      <li>• For Aadhar: Both front and back can be uploaded as one file</li>
                    ) : (
                      <>
                        <li>• Passport: Upload the main information page</li>
                        <li>• Visa: Upload the page with your visa stamp</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-gray-100 mr-3">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Emergency Contact</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={registerData.emergencyContactName}
                    onChange={(e) => updateRegisterField('emergencyContactName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                    placeholder="Emergency contact name"
                    required
                  />
                  
                  <input
                    type="tel"
                    value={registerData.emergencyContactNumber}
                    onChange={(e) => updateRegisterField('emergencyContactNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                    placeholder="Emergency contact number"
                    required
                  />
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={registerData.agreeToTerms}
                    onChange={(e) => updateRegisterField('agreeToTerms', e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="ml-3">
                  <label className="text-sm text-gray-700">
                    I agree to the{' '}
                    <button type="button" className="text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors">
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button type="button" className="text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors">
                      Privacy Policy
                    </button>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 border border-transparent rounded-2xl shadow-lg text-base font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-purple-500/25'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating Account...
                  </div>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create Account
                  </>
                )}
              </button>
            </form>
          )}

          {/* Terms */}
          <p className="text-xs text-center text-gray-500 leading-relaxed mt-6">
            By {currentView === 'login' ? 'signing in' : 'registering'}, you agree to our{' '}
            <button type="button" className="text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors">
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" className="text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors">
              Privacy Policy
            </button>
          </p>
        </div>

        {/* Bottom Features */}
        <div className="mt-8 grid grid-cols-3 gap-6 text-center">
          <div className="text-white">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-90" />
            <p className="text-sm font-medium">AI Safety</p>
          </div>
          <div className="text-white">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-90" />
            <p className="text-sm font-medium">Geo-fencing</p>
          </div>
          <div className="text-white">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-90" />
            <p className="text-sm font-medium">Emergency</p>
          </div>
        </div>
      </div>
    </div>
  );
}
