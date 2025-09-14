import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  MapPin, 
  FileText, 
  AlertTriangle, 
  Phone, 
  Heart, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  Camera,
  Map,
  Bell,
  Navigation,
  Compass,
  RefreshCw,
  Wifi,
  WifiOff,
  Settings,
  Zap,
  Volume2,
  Vibrate,
  Globe,
  Lock,
  Eye,
  Smartphone,
  HelpCircle,
  Info,
  LogOut,
  MessageCircle,
  Gift
} from 'lucide-react';
import { UserSafetyMap } from './UserSafetyMap';
import { AIAssistant } from './AIAssistant';
import { Rewards } from './Rewards';

interface UserDashboardProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    nationality?: string;
    isVerified: boolean;
  };
  onLogout: () => void;
}

export function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locationHistory, setLocationHistory] = useState<Array<{lat: number; lng: number; timestamp: Date; address?: string}>>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [safetyStatus, setSafetyStatus] = useState('safe');
  const [sosPressed, setSosPressed] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(0);
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      emergencyAlerts: true,
      locationUpdates: true,
      safetyReminders: true,
      soundEnabled: true,
      vibrationEnabled: true
    },
    privacy: {
      locationSharing: true,
      profileVisibility: 'authorities',
      dataCollection: true
    },
    emergency: {
      autoSendLocation: true,
      emergencyContacts: ['Family', 'Local Police'],
      sosCountdown: 5 // seconds
    },
    display: {
      theme: 'light',
      language: 'English',
      fontSize: 'medium'
    }
  });

  // Auto-start location fetching
  useEffect(() => {
    getCurrentLocation();
  }, []);
  
  // Document state with upload functionality
  const [documents, setDocuments] = useState(() => {
    // Determine user type
    const isIndian = user.nationality?.toLowerCase() === 'indian' || user.nationality?.toLowerCase() === 'india';
    
    if (isIndian) {
      // For Indian citizens, show only Aadhar Card
      return [
        { id: 1, type: 'Aadhar Card', status: 'pending', uploadedAt: null, requiredFor: 'indian', file: null }
      ];
    } else {
      // For foreign tourists, show Passport and Visa
      return [
        { id: 1, type: 'Passport', status: 'pending', uploadedAt: null, requiredFor: 'foreign', file: null },
        { id: 2, type: 'Visa', status: 'pending', uploadedAt: null, requiredFor: 'foreign', file: null }
      ];
    }
  });

  // Upload state
  const [uploadingDocId, setUploadingDocId] = useState<number | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>('');

  // Handle file upload
  const handleFileUpload = (docId: number, file: File) => {
    setUploadingDocId(docId);
    
    // Simulate upload process
    setTimeout(() => {
      setDocuments(prev => prev.map(doc => 
        doc.id === docId 
          ? { 
              ...doc, 
              status: 'pending', 
              uploadedAt: new Date().toLocaleDateString(), 
              file 
            } 
          : doc
      ));
      setUploadingDocId(null);
      setShowUploadModal(false);
      
      // Simulate verification after upload
      setTimeout(() => {
        setDocuments(prev => prev.map(doc => 
          doc.id === docId 
            ? { ...doc, status: 'verified' } 
            : doc
        ));
      }, 3000);
    }, 2000);
  };

  const openUploadModal = (docType: string) => {
    setSelectedDocType(docType);
    setShowUploadModal(true);
  };

  const [emergencyContacts] = useState([
    { id: 1, name: 'Emergency Contact', phone: '+91-9876543210', relation: 'Family' },
    { id: 2, name: 'Police Emergency', phone: '112', relation: 'Authority' },
    { id: 3, name: 'Medical Emergency', phone: '102', relation: 'Authority' },
    { id: 4, name: 'Fire Emergency', phone: '101', relation: 'Authority' }
  ]);

  const [recentActivities] = useState([
    { id: 1, type: 'location', message: 'Location updated: Tourist District', time: '2 hours ago' },
    { id: 2, type: 'document', message: 'Passport verified successfully', time: '1 day ago' },
    { id: 3, type: 'safety', message: 'Entered safe zone: Airport Area', time: '2 days ago' }
  ]);

  // Location fetching
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setLocationError(null);

    // Get current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date(),
          accuracy: position.coords.accuracy
        };
        
        setCurrentLocation({ lat: newLocation.lat, lng: newLocation.lng });
        setLocationAccuracy(position.coords.accuracy);
        setLastUpdated(newLocation.timestamp);
        
        // Add to location history
        setLocationHistory(prev => {
          const newHistory = [...prev, newLocation];
          // Keep only last 10 locations
          return newHistory.slice(-10);
        });
        
        // Reverse geocoding to get address (mock implementation)
        getAddressFromCoords(newLocation.lat, newLocation.lng).then(address => {
          if (address) {
            setLocationHistory(prev => 
              prev.map((loc, index) => 
                index === prev.length - 1 ? { ...loc, address } : loc
              )
            );
          }
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied by user.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred while retrieving location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1 minute
      }
    );

    // Start watching position for real-time updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date(),
          accuracy: position.coords.accuracy
        };
        
        setCurrentLocation({ lat: newLocation.lat, lng: newLocation.lng });
        setLocationAccuracy(position.coords.accuracy);
        setLastUpdated(newLocation.timestamp);
        
        // Add to location history (only if significantly different from last location)
        setLocationHistory(prev => {
          const lastLocation = prev[prev.length - 1];
          if (!lastLocation || 
              Math.abs(lastLocation.lat - newLocation.lat) > 0.001 || 
              Math.abs(lastLocation.lng - newLocation.lng) > 0.001) {
            const newHistory = [...prev, newLocation];
            return newHistory.slice(-10);
          }
          return prev;
        });
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 10000 // 10 seconds
      }
    );

    // Cleanup function
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  };


  // Mock reverse geocoding function
  const getAddressFromCoords = async (lat: number, lng: number): Promise<string | null> => {
    // In a real app, you would use a geocoding service like Google Maps API
    // For demo purposes, we'll return a mock address
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock addresses based on coordinates (you can replace this with actual API calls)
      const mockAddresses = [
        'Marine Drive, Mumbai, Maharashtra, India',
        'Gateway of India, Mumbai, Maharashtra, India',
        'Colaba Causeway, Mumbai, Maharashtra, India',
        'Bandra West, Mumbai, Maharashtra, India',
        'Andheri East, Mumbai, Maharashtra, India'
      ];
      
      return mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
  };

  // SOS Button functionality
  const handleSOS = () => {
    if (sosPressed) return; // Prevent multiple triggers
    
    setSosPressed(true);
    setSosCountdown(settings.emergency.sosCountdown);
    
    // Start countdown
    const countdownInterval = setInterval(() => {
      setSosCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          sendEmergencyAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Auto-cancel after countdown + 1 second
    setTimeout(() => {
      setSosPressed(false);
      setSosCountdown(0);
    }, (settings.emergency.sosCountdown + 1) * 1000);
  };
  
  const cancelSOS = () => {
    setSosPressed(false);
    setSosCountdown(0);
  };
  
  const sendEmergencyAlert = () => {
    // In a real implementation, this would:
    // 1. Send current location to authorities
    // 2. Send SMS to emergency contacts
    // 3. Call emergency services
    // 4. Log incident in backend
    
    console.log('🚨 EMERGENCY ALERT SENT!');
    console.log('📍 Location:', currentLocation);
    console.log('👤 User:', user.name);
    console.log('📞 Contacts notified:', settings.emergency.emergencyContacts);
    
    // Show confirmation
    alert(`🚨 EMERGENCY ALERT SENT!\n\n📍 Your location has been shared with authorities\n📞 Emergency contacts have been notified\n🕐 Sent at: ${new Date().toLocaleTimeString()}`);
    
    setSosPressed(false);
    setSosCountdown(0);
  };
  
  const updateSettings = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  // Auto-start location fetching on component mount
  useEffect(() => {
    const cleanup = getCurrentLocation();
    return cleanup;
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 rounded-2xl mr-3">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">SafeSphere Tourist</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-2xl">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700 font-medium">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="text-sm text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-2xl font-medium transition-all duration-200 hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h2>
          <p className="text-gray-600 mt-1">Stay safe and enjoy your journey</p>
        </div>

        {/* Safety Status Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 text-white mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-3">Current Safety Status</h3>
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-2xl mr-3">
                  <Shield className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold">SAFE ZONE</span>
              </div>
              <p className="mt-3 opacity-90 text-lg">You are currently in a monitored safe area</p>
            </div>
            <div className="text-right bg-white/10 p-4 rounded-2xl">
              <div className="text-sm opacity-75">Last Updated</div>
              <div className="font-semibold text-lg">{new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-3xl shadow-xl mb-8 overflow-hidden">
          <div className="border-b border-gray-100">
            <nav className="flex space-x-2 px-6 py-2 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'rewards', label: 'Rewards', icon: Gift },
                { id: 'assistant', label: 'AI Assistant', icon: MessageCircle },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'map', label: 'Safety Map', icon: Map },
                { id: 'emergency', label: 'Emergency', icon: Phone },
                { id: 'location', label: 'Location', icon: MapPin },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-3 px-4 rounded-2xl font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-purple-100 text-purple-700 shadow-md'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Profile Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center">
                      <div className="bg-blue-600 p-2 rounded-2xl mr-4">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">Profile Status</h4>
                        <p className={`text-sm font-medium ${user.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                          {user.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center">
                      <div className="bg-green-600 p-2 rounded-2xl mr-4">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">Documents</h4>
                        <p className="text-sm font-medium text-green-600">
                          {documents.filter(d => d.status === 'verified').length} of {documents.length} verified
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center">
                      <div className="bg-purple-600 p-2 rounded-2xl mr-4">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">Safety Score</h4>
                        <p className="text-sm font-medium text-purple-600">Excellent (95%)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h4>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="bg-purple-100 p-2 rounded-2xl mr-4">
                          <Bell className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="space-y-6">
                <Rewards userId={user.id} userName={user.name} />
              </div>
            )}

            {activeTab === 'assistant' && (
              <div className="space-y-6">
                <AIAssistant userName={user.name} />
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">My Documents</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {user.nationality?.toLowerCase() === 'indian' || user.nationality?.toLowerCase() === 'india' 
                        ? 'Upload your Aadhar Card for verification'
                        : 'Upload your Passport and Visa for verification'
                      }
                    </p>
                  </div>
                </div>

                {/* Required Documents */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Required Documents
                  </h5>
                  <div className="grid gap-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`p-3 rounded-2xl mr-4 ${
                              doc.status === 'verified' ? 'bg-green-100' :
                              doc.status === 'pending' && doc.file ? 'bg-yellow-100' :
                              'bg-gray-100'
                            }`}>
                              {doc.type === 'Aadhar Card' ? (
                                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-green-500 rounded flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">ID</span>
                                </div>
                              ) : doc.type === 'Passport' ? (
                                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">P</span>
                                </div>
                              ) : (
                                <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">V</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <h6 className="font-semibold text-gray-900 text-lg">{doc.type}</h6>
                              <p className="text-sm text-gray-500 mt-1">
                                {doc.uploadedAt ? `Uploaded on ${doc.uploadedAt}` : 'Not uploaded yet'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {/* Status Badge */}
                            <div className={`flex items-center px-4 py-2 rounded-2xl text-sm font-medium ${
                              doc.status === 'verified' ? 'bg-green-100 text-green-800' :
                              doc.status === 'pending' && doc.file ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {doc.status === 'verified' ? (
                                <><CheckCircle className="h-4 w-4 mr-2" />Verified</>
                              ) : doc.status === 'pending' && doc.file ? (
                                <>{ uploadingDocId === doc.id ? (
                                  <><div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full mr-2"></div>Uploading...</>
                                ) : (
                                  <><Clock className="h-4 w-4 mr-2" />Pending</>
                                )}</>
                              ) : (
                                <><XCircle className="h-4 w-4 mr-2" />Required</>
                              )}
                            </div>
                            
                            {/* Upload Button */}
                            {!doc.file && (
                              <label className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
                                <Upload className="h-5 w-5 mr-2" />
                                Upload {doc.type}
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleFileUpload(doc.id, file);
                                    }
                                  }}
                                  disabled={uploadingDocId !== null}
                                />
                              </label>
                            )}
                            
                            {/* Re-upload Button */}
                            {doc.file && doc.status !== 'verified' && (
                              <label className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-2xl hover:bg-gray-700 transition-all duration-200 cursor-pointer">
                                <Upload className="h-4 w-4 mr-2" />
                                Re-upload
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleFileUpload(doc.id, file);
                                    }
                                  }}
                                  disabled={uploadingDocId !== null}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                        
                        {/* File Info */}
                        {doc.file && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center text-sm text-gray-600">
                              <FileText className="h-4 w-4 mr-2" />
                              <span>{doc.file.name}</span>
                              <span className="mx-2">•</span>
                              <span>{(doc.file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload Instructions */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Upload Guidelines
                  </h5>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>• Supported formats: JPG, PNG, PDF</p>
                    <p>• Maximum file size: 10 MB</p>
                    <p>• Ensure document is clearly visible and not blurred</p>
                    <p>• All corners of the document should be visible</p>
                    {user.nationality?.toLowerCase() === 'indian' || user.nationality?.toLowerCase() === 'india' ? (
                      <p>• For Aadhar Card: Both front and back sides can be uploaded as separate files</p>
                    ) : (
                      <>
                        <p>• For Passport: Upload the main information page</p>
                        <p>• For Visa: Upload the page with your visa stamp/sticker</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'map' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Map className="h-6 w-6 text-blue-600 mr-2" />
                    Safety Map
                  </h4>
                  <div className="text-sm text-gray-600">
                    Your location and nearby safety zones
                  </div>
                </div>
                
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                  <UserSafetyMap 
                    userLocation={currentLocation}
                    userName={user.name}
                  />
                </div>
              </div>
            )}

            {activeTab === 'emergency' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-3xl p-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-red-600 p-3 rounded-2xl mr-4">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-red-900">Emergency Information</h4>
                  </div>
                  <p className="text-red-700 mb-6 text-lg">In case of emergency, immediately contact the numbers below or use the panic button.</p>
                  <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-2xl font-bold hover:from-red-700 hover:to-red-800 shadow-lg hover:scale-105 transition-all duration-200 text-lg">
                    🚨 PANIC BUTTON - SEND EMERGENCY ALERT
                  </button>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-6">Emergency Contacts</h4>
                  <div className="space-y-4">
                    {emergencyContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center">
                          <div className="bg-green-100 p-3 rounded-2xl mr-4">
                            <Phone className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900 text-lg">{contact.name}</h5>
                            <p className="text-sm text-gray-500 mt-1">{contact.relation}</p>
                          </div>
                        </div>
                        <a 
                          href={`tel:${contact.phone}`}
                          className="px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 font-medium shadow-lg hover:scale-105 transition-all duration-200"
                        >
                          Call {contact.phone}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="space-y-6">
                {/* Real-time Location Status */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-3 rounded-2xl mr-4 bg-blue-600">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-blue-900">Current Location</h4>
                        <p className="text-sm text-blue-700">
                          Your current position and nearby areas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <MapPin className="w-3 h-3 mr-2" />
                        LOCATION INFO
                      </div>
                    </div>
                  </div>

                  {locationError ? (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                        <p className="text-red-700 font-medium">Location Error</p>
                      </div>
                      <p className="text-red-600 text-sm mt-2">{locationError}</p>
                      <button 
                        onClick={getCurrentLocation}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 font-medium transition-all duration-200"
                      >
                        <RefreshCw className="h-4 w-4 inline mr-2" />
                        Retry
                      </button>
                    </div>
                  ) : currentLocation ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-2xl p-4 border border-gray-200">
                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                          Current Position
                        </h5>
                        <p className="text-blue-700 font-mono text-sm">
                          Lat: {currentLocation.lat.toFixed(6)}
                        </p>
                        <p className="text-blue-700 font-mono text-sm">
                          Lng: {currentLocation.lng.toFixed(6)}
                        </p>
                        {locationAccuracy && (
                          <p className="text-gray-600 text-xs mt-2">
                            Accuracy: ±{Math.round(locationAccuracy)}m
                          </p>
                        )}
                      </div>
                      
                      <div className="bg-white rounded-2xl p-4 border border-gray-200">
                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Clock className="h-5 w-5 text-green-600 mr-2" />
                          Last Updated
                        </h5>
                        {lastUpdated && (
                          <>
                            <p className="text-gray-700 text-sm">
                              {lastUpdated.toLocaleTimeString()}
                            </p>
                            <p className="text-gray-600 text-xs mt-1">
                              {lastUpdated.toLocaleDateString()}
                            </p>
                          </>
                        )}
                        <div className="text-xs text-gray-600 mt-2">
                          Location information
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Compass className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
                      <p className="text-gray-600">Getting your location...</p>
                    </div>
                  )}
                </div>

                {/* Location History */}
                {locationHistory.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-xl p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Map className="h-6 w-6 text-purple-600 mr-2" />
                      Location History
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {locationHistory.slice().reverse().map((location, index) => (
                        <div key={index} className="flex items-start p-3 bg-gray-50 rounded-2xl">
                          <div className="bg-purple-100 p-2 rounded-2xl mr-3 flex-shrink-0">
                            <MapPin className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                              </p>
                              <span className="text-xs text-gray-500">
                                {location.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            {location.address && (
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                {location.address}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safety Zones */}
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-6">Safety Zones</h4>
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-green-900 text-lg">Tourist District</h5>
                          <p className="text-sm text-green-700 mt-2">You are currently in a high-security tourist area</p>
                        </div>
                        <div className="bg-green-600 p-2 rounded-full">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-yellow-900 text-lg">Construction Zone (2km away)</h5>
                          <p className="text-sm text-yellow-700 mt-2">Exercise caution when approaching this area</p>
                        </div>
                        <div className="bg-yellow-600 p-2 rounded-full">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-blue-900 text-lg">Hospital Zone (1.5km away)</h5>
                          <p className="text-sm text-blue-700 mt-2">Medical facilities available nearby</p>
                        </div>
                        <div className="bg-blue-600 p-2 rounded-full">
                          <Heart className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6">Location Quick Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105">
                      <Map className="h-6 w-6 mx-auto mb-2" />
                      <span className="block font-medium">Open in Maps</span>
                      <span className="text-xs opacity-90">Navigate with Google Maps</span>
                    </button>
                    
                    <button className="p-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-200 hover:scale-105">
                      <Phone className="h-6 w-6 mx-auto mb-2" />
                      <span className="block font-medium">Share Location</span>
                      <span className="text-xs opacity-90">Send to emergency contact</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Profile Settings */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <User className="h-6 w-6 text-blue-600 mr-2" />
                    Profile Settings
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={user.name}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.display.language}
                        onChange={(e) => updateSettings('display', 'language', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">हिन्दी (Hindi)</option>
                        <option value="Spanish">Español</option>
                        <option value="French">Français</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <select
                        value={settings.display.theme}
                        onChange={(e) => updateSettings('display', 'theme', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                      >
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Bell className="h-6 w-6 text-yellow-600 mr-2" />
                    Notification Preferences
                  </h4>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'emergencyAlerts', label: 'Emergency Alerts', desc: 'Critical safety notifications', icon: AlertTriangle },
                      { key: 'locationUpdates', label: 'Location Updates', desc: 'Safety zone and location notifications', icon: MapPin },
                      { key: 'safetyReminders', label: 'Safety Reminders', desc: 'Periodic safety tips and reminders', icon: Shield },
                      { key: 'soundEnabled', label: 'Sound Notifications', desc: 'Play sounds for notifications', icon: Volume2 },
                      { key: 'vibrationEnabled', label: 'Vibration', desc: 'Vibrate for important alerts', icon: Vibrate }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center">
                          <div className="bg-gray-200 p-2 rounded-2xl mr-3">
                            <setting.icon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{setting.label}</p>
                            <p className="text-sm text-gray-600">{setting.desc}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications[setting.key]}
                            onChange={(e) => updateSettings('notifications', setting.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Lock className="h-6 w-6 text-green-600 mr-2" />
                    Privacy & Security
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center">
                        <div className="bg-gray-200 p-2 rounded-2xl mr-3">
                          <MapPin className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Location Sharing</p>
                          <p className="text-sm text-gray-600">Allow authorities to access your location</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.locationSharing}
                          onChange={(e) => updateSettings('privacy', 'locationSharing', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center mb-3">
                        <div className="bg-gray-200 p-2 rounded-2xl mr-3">
                          <Eye className="h-5 w-5 text-gray-600" />
                        </div>
                        <p className="font-medium text-gray-900">Profile Visibility</p>
                      </div>
                      <select
                        value={settings.privacy.profileVisibility}
                        onChange={(e) => updateSettings('privacy', 'profileVisibility', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                      >
                        <option value="authorities">Authorities Only</option>
                        <option value="emergency">Emergency Contacts Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Emergency Settings */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                    Emergency Settings
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-200">
                      <div className="flex items-center">
                        <div className="bg-red-200 p-2 rounded-2xl mr-3">
                          <MapPin className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-red-900">Auto-send Location</p>
                          <p className="text-sm text-red-700">Automatically share location during emergency</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.emergency.autoSendLocation}
                          onChange={(e) => updateSettings('emergency', 'autoSendLocation', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                    
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
                      <div className="flex items-center mb-3">
                        <div className="bg-red-200 p-2 rounded-2xl mr-3">
                          <Clock className="h-5 w-5 text-red-600" />
                        </div>
                        <p className="font-medium text-red-900">SOS Countdown Timer</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="3"
                          max="10"
                          value={settings.emergency.sosCountdown}
                          onChange={(e) => updateSettings('emergency', 'sosCountdown', parseInt(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-medium text-red-700 bg-red-200 px-3 py-1 rounded-2xl">
                          {settings.emergency.sosCountdown}s
                        </span>
                      </div>
                      <p className="text-xs text-red-600 mt-2">Time before emergency alert is sent after pressing SOS</p>
                    </div>
                  </div>
                </div>

                {/* About & Support */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <HelpCircle className="h-6 w-6 text-purple-600 mr-2" />
                    About & Support
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 text-left">
                      <div className="flex items-center">
                        <Info className="h-6 w-6 text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium text-blue-900">App Information</p>
                          <p className="text-sm text-blue-700">Version 1.0.0</p>
                        </div>
                      </div>
                    </button>
                    
                    <button className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200 hover:from-green-100 hover:to-green-200 transition-all duration-200 text-left">
                      <div className="flex items-center">
                        <HelpCircle className="h-6 w-6 text-green-600 mr-3" />
                        <div>
                          <p className="font-medium text-green-900">Help & Support</p>
                          <p className="text-sm text-green-700">Get assistance</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* SOS Button - Fixed at bottom of every tab */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 mt-8">
            {sosPressed ? (
              <div className="text-center">
                <div className="bg-red-600 text-white rounded-3xl p-6 mb-4 animate-pulse">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="h-8 w-8 mr-2" />
                    <span className="text-2xl font-bold">EMERGENCY ALERT</span>
                  </div>
                  <div className="text-6xl font-bold mb-2">{sosCountdown}</div>
                  <p className="text-lg opacity-90">Alert will be sent automatically</p>
                </div>
                <button
                  onClick={cancelSOS}
                  className="px-8 py-4 bg-gray-600 text-white rounded-2xl font-bold text-lg hover:bg-gray-700 transition-all duration-200"
                >
                  <XCircle className="h-6 w-6 inline mr-2" />
                  CANCEL
                </button>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={handleSOS}
                  className="w-full max-w-md mx-auto bg-gradient-to-r from-red-600 to-red-700 text-white rounded-3xl py-6 px-8 font-bold text-xl shadow-2xl hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                >
                  <div className="bg-white/20 p-3 rounded-full mr-4">
                    <Zap className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="text-2xl">🚨 SOS EMERGENCY</div>
                    <div className="text-sm opacity-90 mt-1">Press for immediate help</div>
                  </div>
                </button>
                <p className="text-xs text-gray-500 mt-3">
                  Emergency alert will be sent after {settings.emergency.sosCountdown} seconds
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
