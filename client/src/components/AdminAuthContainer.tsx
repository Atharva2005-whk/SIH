import React, { useState } from 'react';
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, Building, Badge, UserPlus } from 'lucide-react';

interface AdminAuthContainerProps {
  onAuthentication: (user: any) => Promise<void>;
}

interface AdminLoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface AdminRegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  badge: string;
  organizationId: string;
  agreeToTerms: boolean;
}

export function AdminAuthContainer({ onAuthentication }: AdminAuthContainerProps) {
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');
  const [loginData, setLoginData] = useState<AdminLoginCredentials>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [registerData, setRegisterData] = useState<AdminRegisterCredentials>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    badge: '',
    organizationId: '',
    agreeToTerms: false
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

      // Transform to match expected format
      const transformedCredentials = {
        email: loginData.email,
        password: loginData.password,
        department: 'security', // Default for demo
        badge: 'ADMIN001', // Default for demo
        userType: 'authority'
      };

      await onAuthentication(transformedCredentials);
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
      if (!registerData.department) {
        throw new Error('Please select your department');
      }
      if (!registerData.badge.trim()) {
        throw new Error('Please enter your badge/ID number');
      }
      if (!registerData.organizationId.trim()) {
        throw new Error('Please enter your organization ID');
      }
      if (!registerData.agreeToTerms) {
        throw new Error('Please agree to the Terms of Service and Privacy Policy');
      }

      // Transform to match expected format
      const transformedCredentials = {
        email: registerData.email,
        password: registerData.password,
        fullName: registerData.fullName,
        department: registerData.department,
        badge: registerData.badge,
        organizationId: registerData.organizationId,
        userType: 'authority'
      };

      await onAuthentication(transformedCredentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const updateLoginField = (field: keyof AdminLoginCredentials, value: any) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const updateRegisterField = (field: keyof AdminRegisterCredentials, value: any) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-red-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            SafeSphere Admin Portal
          </h1>
          <p className="text-red-100">
            {currentView === 'login' ? 'Sign in to your authority account' : 'Create your authority account'}
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
                  ? 'bg-white text-red-600 shadow-md'
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
                  ? 'bg-white text-red-600 shadow-md'
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
                <h2 className="text-2xl font-bold text-gray-900">Authority Sign In</h2>
                <p className="text-gray-600 mt-2">Access your administrative dashboard</p>
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
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all duration-200"
                    placeholder="Enter your official email"
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
                    className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all duration-200"
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
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-red-600 hover:text-red-700 hover:underline font-medium transition-colors"
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
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-sm text-red-700 mb-3">Demo Admin Credentials:</p>
                <button
                  type="button"
                  onClick={() => setLoginData({ email: 'admin@safesphere.gov', password: 'admin123', rememberMe: false })}
                  className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  Use Demo Admin Account
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 border border-transparent rounded-2xl shadow-lg text-base font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-red-500/25'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    Sign In to Admin Portal
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Authority Account</h2>
                <p className="text-gray-600 mt-2">Register as an authorized personnel</p>
              </div>

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
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all duration-200"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Official Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => updateRegisterField('email', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all duration-200"
                    placeholder="Enter your official email"
                    required
                  />
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
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all duration-200"
                      placeholder="Create password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all duration-200"
                      placeholder="Confirm password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={registerData.department}
                    onChange={(e) => updateRegisterField('department', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all duration-200 appearance-none"
                    required
                  >
                    <option value="">Select your department</option>
                    <option value="police">Police Department</option>
                    <option value="fire">Fire Department</option>
                    <option value="medical">Medical Services</option>
                    <option value="tourism">Tourism Board</option>
                    <option value="security">Security</option>
                    <option value="customs">Customs</option>
                    <option value="immigration">Immigration</option>
                  </select>
                </div>
              </div>

              {/* Badge/ID and Organization ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Badge/ID Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Badge className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={registerData.badge}
                      onChange={(e) => updateRegisterField('badge', e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all duration-200"
                      placeholder="Enter badge/ID number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization ID
                  </label>
                  <input
                    type="text"
                    value={registerData.organizationId}
                    onChange={(e) => updateRegisterField('organizationId', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all duration-200"
                    placeholder="Enter organization ID"
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
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="ml-3">
                  <label className="text-sm text-gray-700">
                    I agree to the{' '}
                    <button type="button" className="text-red-600 hover:text-red-700 hover:underline font-medium transition-colors">
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button type="button" className="text-red-600 hover:text-red-700 hover:underline font-medium transition-colors">
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
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-red-500/25'
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
                    Create Authority Account
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-xs text-red-700 text-center">
              <Shield className="h-4 w-4 inline mr-1" />
              This portal is for authorized personnel only. All activities are monitored and logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
