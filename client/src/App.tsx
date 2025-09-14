import React, { useCallback, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { UserPlus, LogIn, Shield, FileText, Map } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { TouristRegistration } from './components/TouristRegistration';
import { LoginPage } from './components/LoginPage';
import { AdminLogin } from './components/AdminLogin';
import { UnifiedLoginIntegration } from './components/UnifiedLoginIntegration';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { MapTest } from './components/MapTest';
import { AIMonitoringDashboard } from './components/AIMonitoringDashboard';
import { SafetyHeatMap } from './components/SafetyHeatMap';
import { DemoMap } from './components/DemoMap';
import { AdminAuthContainer } from './components/AdminAuthContainer';
import { TouristAuthContainer } from './components/TouristAuthContainer';
import { apiClient } from './services/api';

// Local type definition
interface DocumentUploadRequest {
  type: 'visa' | 'passport' | 'aadhar';
  file: File;
  expiryDate?: Date;
}

// Dashboard Component with SafeGuard Tourist theme
function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            SafeSphere Tourist
          </h1>
          <p className="text-purple-100 text-lg">
            AI-Powered Safety Monitoring System
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 text-center">
            <Shield className="h-12 w-12 text-white mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              AI Safety
            </h3>
            <p className="text-purple-100 text-sm">
              Real-time monitoring and predictive safety alerts
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 text-center">
            <Map className="h-12 w-12 text-white mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Geo-fencing
            </h3>
            <p className="text-purple-100 text-sm">
              Smart location tracking and safety zone monitoring
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 text-center">
            <FileText className="h-12 w-12 text-white mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Emergency
            </h3>
            <p className="text-purple-100 text-sm">
              Instant incident reporting and emergency response
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Get Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Link 
              to="/tourist-auth"
              className="flex items-center p-6 border-2 border-green-200 rounded-2xl hover:bg-green-50 hover:border-green-300 transition-all duration-200 transform hover:scale-[1.02]"
            >
              <LogIn className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Tourist Login
                </h3>
                <p className="text-sm text-gray-600">
                  Access your safety profile
                </p>
              </div>
            </Link>

            <Link 
              to="/tourist-auth"
              className="flex items-center p-6 border-2 border-blue-200 rounded-2xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 transform hover:scale-[1.02]"
            >
              <UserPlus className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Register
                </h3>
                <p className="text-sm text-gray-600">
                  Create your account
                </p>
              </div>
            </Link>

            <Link 
              to="/admin-portal"
              className="flex items-center p-6 border-2 border-purple-200 rounded-2xl hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 transform hover:scale-[1.02]"
            >
              <Shield className="h-8 w-8 text-purple-600 mr-4" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Admin Portal
                </h3>
                <p className="text-sm text-gray-600">
                  Authority access
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


function AppContent() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Only try to verify session if there's a session ID in localStorage
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
          const response = await apiClient.verifySession();
          if (response.success && response.data) {
            setIsAuthenticated(true);
            setUser(response.data.user);
            apiClient.setSessionId(response.data.session.id);
          }
        }
      } catch (error) {
        console.log('No valid session found or backend unavailable');
        apiClient.clearSession();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Debug authentication state changes
  useEffect(() => {
    console.log('🔐 Authentication state changed:');
    console.log('  - isAuthenticated:', isAuthenticated);
    console.log('  - user:', user);
    console.log('  - user role:', user?.role);
  }, [isAuthenticated, user]);

  // Real API handlers
  const handleTouristRegistration = useCallback(async (tourist: any, documents: DocumentUploadRequest[]) => {
    try {
      console.log('🚀 Registering tourist:', tourist);
      console.log('📎 Documents:', documents);
      
      const response = await apiClient.registerTourist(tourist, documents);
      
      console.log('📡 Registration API Response:', response);
      
      if (response.success) {
        console.log(`✅ Registration successful for ${tourist.name}!`);
        alert(`Registration successful! Welcome ${tourist.name}! Please login to access your dashboard.`);
        // Redirect to login page
        navigate('/login');
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      alert(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }, [navigate]);

  const handleDocumentUpload = useCallback(async (document: DocumentUploadRequest) => {
    try {
      console.log('Uploading document:', document.type);
      
      const response = await apiClient.uploadDocument(document);
      
      if (response.success) {
        console.log(`${document.type} uploaded successfully! ID: ${response.data?.documentId}`);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  }, []);

  const handleLogin = useCallback(async (credentials: any) => {
    try {
      console.log('🚀 Tourist login attempt:', credentials);
      
      const loginData = {
        identifier: credentials.phoneNumber || credentials.email || credentials.passportNumber,
        password: credentials.password || 'demo123', // Fallback for demo
        nationality: credentials.nationality
      };
      
      console.log('📝 Login data being sent:', loginData);
      
      const response = await apiClient.touristLogin(loginData);
      
      console.log('📡 API Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Setting authentication state...');
        console.log('👤 User data:', response.data.user);
        console.log('🎯 User role:', response.data.user.role);
        
        setIsAuthenticated(true);
        setUser(response.data.user);
        apiClient.setSessionId(response.data.session.id);
        
        const targetDashboard = response.data.user.role === 'tourist' ? '/user-dashboard' : '/admin-dashboard';
        console.log('🗃 Navigating to:', targetDashboard);
        
        // Redirect to appropriate dashboard with slight delay to ensure state is set
        setTimeout(() => {
          console.log('🚀 Actually navigating to:', targetDashboard);
          navigate(targetDashboard);
        }, 100);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      alert(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }, [navigate]);

  const handleAdminLogin = useCallback(async (credentials: any) => {
    try {
      console.log('🚀 Admin login attempt:', credentials);
      
      const loginData = {
        email: credentials.email,
        password: credentials.password || 'admin123', // Fallback for demo
        department: credentials.department || 'security',
        badge: credentials.badge
      };
      
      console.log('📝 Admin login data being sent:', loginData);
      
      const response = await apiClient.authorityLogin(loginData);
      
      console.log('📡 Admin API Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Setting admin authentication state...');
        console.log('👤 Admin user data:', response.data.user);
        console.log('🎯 Admin user role:', response.data.user.role);
        
        setIsAuthenticated(true);
        setUser(response.data.user);
        apiClient.setSessionId(response.data.session.id);
        
        console.log('🗃 Navigating to admin dashboard...');
        // Redirect to admin dashboard with slight delay to ensure state is set
        setTimeout(() => {
          console.log('🚀 Actually navigating to admin dashboard');
          navigate('/admin-dashboard');
        }, 100);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Admin login error:', error);
      alert(`Admin login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }, [navigate]);

  const handleUnifiedAuthentication = useCallback(async (authenticatedUser: any) => {
    console.log('✅ Setting unified authentication state...');
    console.log('👤 User data:', authenticatedUser);
    console.log('🎯 User type:', authenticatedUser.userType);
    
    try {
      let userData;
      let sessionData;
      
      // Determine if this is a tourist or authority based on userType
      if (authenticatedUser.userType === 'authority') {
        console.log('🔐 Processing admin authentication...');
        
        // Call the admin login API
        const loginData = {
          email: authenticatedUser.email,
          password: authenticatedUser.password || 'demo123',
          department: authenticatedUser.department || 'security',
          badge: authenticatedUser.badge || 'ADMIN001'
        };
        
        const response = await apiClient.authorityLogin(loginData);
        
        if (response.success && response.data) {
          userData = response.data.user;
          sessionData = response.data.session;
          apiClient.setSessionId(sessionData.id);
          
          setIsAuthenticated(true);
          setUser(userData);
          
          console.log('🚀 Navigating to admin dashboard...');
          setTimeout(() => {
            navigate('/admin-dashboard');
          }, 100);
        }
      } else {
        console.log('🔐 Processing tourist authentication...');
        
        // Call the tourist login API
        const loginData = {
          identifier: authenticatedUser.email || 'tourist@demo.com',
          password: 'demo123',
          nationality: authenticatedUser.userType === 'indian' ? 'Indian' : 'Foreign'
        };
        
        const response = await apiClient.touristLogin(loginData);
        
        if (response.success && response.data) {
          userData = response.data.user;
          sessionData = response.data.session;
          apiClient.setSessionId(sessionData.id);
          
          setIsAuthenticated(true);
          setUser(userData);
          
          console.log('🚀 Navigating to user dashboard...');
          setTimeout(() => {
            navigate('/user-dashboard');
          }, 100);
        }
      }
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
      // Fallback: create mock user and set authentication
      const mockUser = {
        id: Date.now(),
        name: authenticatedUser.fullName || 'Demo User',
        email: authenticatedUser.email || 'demo@example.com',
        role: authenticatedUser.userType === 'authority' ? 'authority' : 'tourist',
        department: authenticatedUser.department,
        badge: authenticatedUser.badge,
        isVerified: true
      };
      
      setIsAuthenticated(true);
      setUser(mockUser);
      
      const targetDashboard = mockUser.role === 'authority' ? '/admin-dashboard' : '/user-dashboard';
      console.log('🚀 Fallback navigation to:', targetDashboard);
      setTimeout(() => {
        navigate(targetDashboard);
      }, 100);
    }
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await apiClient.logout();
      setIsAuthenticated(false);
      setUser(null);
      navigate('/');
      console.log('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      apiClient.clearSession();
      setIsAuthenticated(false);
      setUser(null);
      navigate('/');
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        
        {/* Tourist Authentication Route */}
        <Route 
          path="/tourist-auth" 
          element={
            isAuthenticated && user?.role === 'tourist' ? 
              <Navigate to="/user-dashboard" replace /> :
              <TouristAuthContainer onAuthentication={handleUnifiedAuthentication} />
          } 
        />
        
        {/* Admin Portal Route */}
        <Route 
          path="/admin-portal" 
          element={
            isAuthenticated && user?.role === 'authority' ? 
              <Navigate to="/admin-dashboard" replace /> :
              <AdminAuthContainer onAuthentication={handleUnifiedAuthentication} />
          } 
        />
        
        {/* Redirect old routes */}
        <Route 
          path="/unified-login" 
          element={<Navigate to="/tourist-auth" replace />}
        />
        <Route 
          path="/login" 
          element={<Navigate to="/tourist-auth" replace />}
        />
        <Route 
          path="/admin-login" 
          element={<Navigate to="/admin-portal" replace />}
        />
        <Route 
          path="/register" 
          element={<Navigate to="/tourist-auth" replace />}
        />
        <Route 
          path="/user-dashboard" 
          element={
            (() => {
              console.log('🗃 User dashboard route check:');
              console.log('  - isAuthenticated:', isAuthenticated);
              console.log('  - user:', user);
              console.log('  - user role:', user?.role);
              
              if (isAuthenticated && user) {
                console.log('✅ Rendering UserDashboard');
                return <UserDashboard user={user} onLogout={handleLogout} />;
              } else {
                console.log('❌ Redirecting to login - not authenticated or no user');
                return <Navigate to="/login" replace />;
              }
            })()
          } 
        />
        <Route 
          path="/admin-dashboard" 
          element={
            (() => {
              console.log('🗃 Admin dashboard route check:');
              console.log('  - isAuthenticated:', isAuthenticated);
              console.log('  - user:', user);
              console.log('  - user role:', user?.role);
              
              if (isAuthenticated && user) {
                console.log('✅ Rendering AdminDashboard');
                return <AdminDashboard user={user} onLogout={handleLogout} />;
              } else {
                console.log('❌ Redirecting to admin-login - not authenticated or no user');
                return <Navigate to="/admin-login" replace />;
              }
            })()
          } 
        />
        {/* Map Testing Routes */}
        <Route path="/demo-map" element={<DemoMap />} />
        <Route path="/map-test" element={<MapTest />} />
        <Route path="/ai-dashboard" element={<AIMonitoringDashboard />} />
        <Route path="/safety-heatmap" element={<SafetyHeatMap />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
