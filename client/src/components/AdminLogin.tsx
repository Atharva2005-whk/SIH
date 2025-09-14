import React, { useState, useCallback } from 'react';
import { 
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserCheck,
  Building
} from 'lucide-react';

interface AdminLoginProps {
  onLogin: (credentials: AdminLoginCredentials) => Promise<void>;
}

interface AdminLoginCredentials {
  userType: 'police' | 'medical' | 'fire' | 'admin';
  email: string;
  password: string;
  department?: string;
  badgeNumber?: string;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  // State with specific keys to prevent re-renders
  const [formData, setFormData] = useState({
    userType: 'admin' as 'police' | 'medical' | 'fire' | 'admin',
    email: '',
    password: '',
    department: '',
    badgeNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Memoized handlers to prevent re-renders
  const handleUserTypeChange = useCallback((type: 'police' | 'medical' | 'fire' | 'admin') => {
    setFormData(prev => ({ ...prev, userType: type }));
    setError('');
  }, []);

  const handleInputChange = useCallback((field: keyof typeof formData) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData(prev => ({ ...prev, [field]: value }));
      setError('');
    };
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.email.trim()) {
        throw new Error('Please enter your email');
      }
      if (!formData.password.trim()) {
        throw new Error('Please enter your password');
      }
      if (formData.userType !== 'admin' && !formData.department.trim()) {
        throw new Error('Please enter your department');
      }
      if (formData.userType !== 'admin' && !formData.badgeNumber.trim()) {
        throw new Error('Please enter your badge number');
      }

      await onLogin(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [formData, onLogin]);

  const userTypes = [
    { value: 'admin', label: 'System Admin', icon: Shield, color: 'bg-purple-100 text-purple-600' },
    { value: 'police', label: 'Police Officer', icon: Shield, color: 'bg-blue-100 text-blue-600' },
    { value: 'medical', label: 'Medical Team', icon: UserCheck, color: 'bg-green-100 text-green-600' },
    { value: 'fire', label: 'Fire Department', icon: Building, color: 'bg-red-100 text-red-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            SafeGuard Admin
          </h1>
          <p className="text-purple-100">
            Authority Access Portal
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Authority Type Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Authority Type
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {userTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleUserTypeChange(type.value as any)}
                      className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                        formData.userType === type.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${type.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-xs">{type.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                className="w-full px-4 py-4 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                placeholder="Enter your official email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Department (for non-admin users) */}
            {formData.userType !== 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={handleInputChange('department')}
                  className="w-full px-4 py-4 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                  placeholder="Enter your department"
                  required
                />
              </div>
            )}

            {/* Badge Number (for non-admin users) */}
            {formData.userType !== 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Badge/ID Number
                </label>
                <input
                  type="text"
                  value={formData.badgeNumber}
                  onChange={handleInputChange('badgeNumber')}
                  className="w-full px-4 py-4 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200"
                  placeholder="Enter your badge/ID number"
                  required
                />
              </div>
            )}

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
              className={`w-full py-4 px-6 border border-transparent rounded-2xl shadow-lg text-base font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-purple-500/25'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In to Dashboard
                </div>
              )}
            </button>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Need access? Contact system administrator
              </p>
              <button
                type="button"
                className="w-full py-4 px-6 border-2 border-gray-300 rounded-2xl shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Request Access
              </button>
            </div>

            {/* Terms */}
            <p className="text-xs text-center text-gray-500 leading-relaxed">
              By signing in, you agree to our{' '}
              <button type="button" className="text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors">
                Privacy Policy
              </button>
            </p>
          </form>
        </div>

        {/* Bottom Features */}
        <div className="mt-8 text-center">
          <p className="text-sm text-purple-100">
            Secure access for authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
}
