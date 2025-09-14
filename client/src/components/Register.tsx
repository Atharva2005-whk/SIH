import React, { useState, useCallback } from 'react';
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
  ArrowLeft
} from 'lucide-react';

interface RegisterProps {
  onRegister: (credentials: RegisterCredentials) => Promise<void>;
  onSwitchToLogin: () => void;
}

interface RegisterCredentials {
  userType: 'indian' | 'foreign';
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  agreeToTerms: boolean;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [formData, setFormData] = useState<RegisterCredentials>({
    userType: 'indian',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUserTypeChange = useCallback((type: 'indian' | 'foreign') => {
    setFormData(prev => ({ ...prev, userType: type }));
    setError('');
  }, []);

  const handleInputChange = useCallback((field: keyof typeof formData) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setFormData(prev => ({ ...prev, [field]: value }));
      setError('');
    };
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Comprehensive validation
      if (!formData.fullName.trim()) {
        throw new Error('Please enter your full name');
      }
      if (!formData.email.trim()) {
        throw new Error('Please enter your email address');
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }
      if (!formData.password.trim()) {
        throw new Error('Please enter a password');
      }
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (!formData.phoneNumber.trim()) {
        throw new Error('Please enter your phone number');
      }
      if (!formData.emergencyContactName.trim()) {
        throw new Error('Please enter emergency contact name');
      }
      if (!formData.emergencyContactNumber.trim()) {
        throw new Error('Please enter emergency contact number');
      }
      if (!formData.agreeToTerms) {
        throw new Error('Please agree to the Terms of Service and Privacy Policy');
      }

      await onRegister(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }, [formData, onRegister]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

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
            Join our AI-powered safety monitoring platform
          </p>
        </div>

        {/* Main Registration Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center mb-6">
            <button
              onClick={onSwitchToLogin}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors mr-4"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Create Account
              </h2>
              <p className="text-gray-600">
                Join thousands of safe travelers
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identity Type Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Identity Type
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleUserTypeChange('indian')}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center space-y-3 ${
                    formData.userType === 'indian'
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
                  onClick={() => handleUserTypeChange('foreign')}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center space-y-3 ${
                    formData.userType === 'foreign'
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
                    value={formData.fullName}
                    onChange={handleInputChange('fullName')}
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
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                    placeholder="Create password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
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
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Phone Number */}
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
                  value={formData.phoneNumber}
                  onChange={handleInputChange('phoneNumber')}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                  placeholder="Enter phone number"
                  required
                />
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
                  value={formData.emergencyContactName}
                  onChange={handleInputChange('emergencyContactName')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                  placeholder="Emergency contact name"
                  required
                />
                
                <input
                  type="tel"
                  value={formData.emergencyContactNumber}
                  onChange={handleInputChange('emergencyContactNumber')}
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
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange('agreeToTerms')}
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

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Already have an account?
              </p>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="w-full py-4 px-6 border-2 border-gray-300 rounded-2xl shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Sign In Instead
              </button>
            </div>
          </form>
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
