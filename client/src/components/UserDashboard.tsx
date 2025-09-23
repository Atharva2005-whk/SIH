import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  MapPin, 
  AlertTriangle, 
  Phone, 
  Heart, 
  Map,
  Bell,
  Navigation,
  Compass,
  RefreshCw,
  Settings,
  Zap,
  MessageCircle,
  Gift,
  XCircle,
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';
import { UserSafetyMap } from './UserSafetyMap';
import { AIAssistant } from './AIAssistant';
import { Rewards } from './Rewards';
import { SettingsPage } from './SettingsPage';
import { useLanguage, LANGUAGES, type SupportedLanguage, useTheme } from './SettingsPage';

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
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { theme, setTheme, resolvedTheme, isDark } = useTheme();
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
    }
  });

  // Auto-start location fetching
  useEffect(() => {
    getCurrentLocation();
  }, []);


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
  
  const updateSettings = (category: keyof typeof settings, key: string, value: any) => {
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
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-gray-50 to-gray-100'
    }`}>
      {/* Header */}
      <div className={`shadow-lg border-b transition-colors duration-200 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className={`p-2 rounded-2xl mr-3 ${
                isDark ? 'bg-purple-900/50' : 'bg-purple-100'
              }`}>
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h1 className={`text-xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {t('dashboard.title')}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <User className={`h-5 w-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={`text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>{user.name}</span>
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
          <h2 className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {t('dashboard.welcomeBack', { name: user.name })}
          </h2>
          <p className={`mt-1 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {t('dashboard.staySafe')}
          </p>
        </div>

        {/* Safety Status Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 text-white mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-3">{t('dashboard.currentSafetyStatus')}</h3>
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-2xl mr-3">
                  <Shield className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold">{t('dashboard.safeZone')}</span>
              </div>
              <p className="mt-3 opacity-90 text-lg">{t('dashboard.safeZoneDescription')}</p>
            </div>
            <div className="text-right bg-white/10 p-4 rounded-2xl">
              <div className="text-sm opacity-75">{t('dashboard.lastUpdated')}</div>
              <div className="font-semibold text-lg">{new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`rounded-3xl shadow-xl mb-8 overflow-hidden transition-colors duration-200 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`border-b transition-colors duration-200 ${
            isDark ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <nav className="flex space-x-2 px-6 py-2 overflow-x-auto">
              {[
                { id: 'overview', label: t('navigation.overview'), icon: User },
                { id: 'rewards', label: t('navigation.rewards'), icon: Gift },
                { id: 'assistant', label: t('navigation.assistant'), icon: MessageCircle },
                { id: 'map', label: t('navigation.map'), icon: Map },
                { id: 'emergency', label: t('navigation.emergency'), icon: Phone },
                { id: 'location', label: t('navigation.location'), icon: MapPin },
                { id: 'settings', label: t('navigation.settings'), icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-3 px-4 rounded-2xl font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? `${isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'} shadow-md`
                      : `${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`
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
                  <div className={`rounded-2xl p-6 border transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/30' 
                      : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
                  }`}>
                    <div className="flex items-center">
                      <div className="bg-blue-600 p-2 rounded-2xl mr-4">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className={`font-semibold text-lg ${
                          isDark ? 'text-gray-100' : 'text-gray-900'
                        }`}>{t('dashboard.profileStatus')}</h4>
                        <p className={`text-sm font-medium ${user.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                          {user.isVerified ? t('dashboard.verified') : t('dashboard.pendingVerification')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-2xl p-6 border transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/30' 
                      : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                  }`}>
                    <div className="flex items-center">
                      <div className="bg-green-600 p-2 rounded-2xl mr-4">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className={`font-semibold text-lg ${
                          isDark ? 'text-gray-100' : 'text-gray-900'
                        }`}>{t('dashboard.locationTracking')}</h4>
                        <p className="text-sm font-medium text-green-600">
                          {currentLocation ? t('dashboard.active') : t('dashboard.inactive')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-2xl p-6 border transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/30' 
                      : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
                  }`}>
                    <div className="flex items-center">
                      <div className="bg-purple-600 p-2 rounded-2xl mr-4">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className={`font-semibold text-lg ${
                          isDark ? 'text-gray-100' : 'text-gray-900'
                        }`}>{t('dashboard.safetyScore')}</h4>
                        <p className="text-sm font-medium text-purple-600">{t('dashboard.excellent')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className={`text-xl font-semibold mb-6 ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}>{t('dashboard.recentActivity')}</h4>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className={`flex items-center p-4 rounded-2xl shadow-sm border transition-colors duration-200 ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-white border-gray-100'
                      }`}>
                        <div className={`p-2 rounded-2xl mr-4 ${
                          isDark ? 'bg-purple-900/50' : 'bg-purple-100'
                        }`}>
                          <Bell className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            isDark ? 'text-gray-200' : 'text-gray-900'
                          }`}>{activity.message}</p>
                          <p className={`text-xs mt-1 ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>{activity.time}</p>
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


            {activeTab === 'map' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className={`text-xl font-semibold flex items-center ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    <Map className="h-6 w-6 text-blue-600 mr-2" />
                    {t('navigation.map')}
                  </h4>
                  <div className={`text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {t('map.safetyMapDesc')}
                  </div>
                </div>
                
                <div className={`rounded-3xl shadow-xl overflow-hidden transition-colors duration-200 ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <UserSafetyMap 
                    userLocation={currentLocation || undefined}
                    userName={user.name}
                  />
                </div>
              </div>
            )}

            {activeTab === 'emergency' && (
              <div className="space-y-6">
                <div className={`border-2 rounded-3xl p-8 transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-700/50' 
                    : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                }`}>
                  <div className="flex items-center mb-4">
                    <div className="bg-red-600 p-3 rounded-2xl mr-4">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <h4 className={`text-xl font-semibold ${
                      isDark ? 'text-red-200' : 'text-red-900'
                    }`}>{t('emergency.emergencyInformation')}</h4>
                  </div>
                  <p className={`mb-6 text-lg ${
                    isDark ? 'text-red-300' : 'text-red-700'
                  }`}>{t('emergency.emergencyDesc')}</p>
                  <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-2xl font-bold hover:from-red-700 hover:to-red-800 shadow-lg hover:scale-105 transition-all duration-200 text-lg">
                    {t('emergency.panicButton')}
                  </button>
                </div>

                <div>
                  <h4 className={`text-xl font-semibold mb-6 ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}>{t('emergency.emergencyContacts')}</h4>
                  <div className="space-y-4">
                    {emergencyContacts.map((contact) => (
                      <div key={contact.id} className={`flex items-center justify-between p-6 border rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-white border-gray-100'
                      }`}>
                        <div className="flex items-center">
                          <div className={`p-3 rounded-2xl mr-4 ${
                            isDark ? 'bg-green-900/50' : 'bg-green-100'
                          }`}>
                            <Phone className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h5 className={`font-semibold text-lg ${
                              isDark ? 'text-gray-200' : 'text-gray-900'
                            }`}>{contact.name}</h5>
                            <p className={`text-sm mt-1 ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>{contact.relation}</p>
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
                <div className={`border-2 rounded-3xl p-8 transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/30' 
                    : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-3 rounded-2xl mr-4 bg-blue-600">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-xl font-semibold ${
                          isDark ? 'text-blue-200' : 'text-blue-900'
                        }`}>{t('location.currentLocation')}</h4>
                        <p className={`text-sm ${
                          isDark ? 'text-blue-300' : 'text-blue-700'
                        }`}>
                          {t('location.locationInfo')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
                      }`}>
                        <MapPin className="w-3 h-3 mr-2" />
                        LOCATION INFO
                      </div>
                    </div>
                  </div>

                  {locationError ? (
                    <div className={`border rounded-2xl p-4 transition-colors duration-200 ${
                      isDark 
                        ? 'bg-red-900/20 border-red-700/50' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                        <p className={`font-medium ${
                          isDark ? 'text-red-300' : 'text-red-700'
                        }`}>{t('location.locationError')}</p>
                      </div>
                      <p className={`text-sm mt-2 ${
                        isDark ? 'text-red-400' : 'text-red-600'
                      }`}>{locationError}</p>
                      <button 
                        onClick={getCurrentLocation}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 font-medium transition-all duration-200"
                      >
                        <RefreshCw className="h-4 w-4 inline mr-2" />
                        {t('location.retry')}
                      </button>
                    </div>
                  ) : currentLocation ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`rounded-2xl p-4 border transition-colors duration-200 ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-white border-gray-200'
                      }`}>
                        <h5 className={`font-semibold mb-2 flex items-center ${
                          isDark ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                          {t('location.currentPosition')}
                        </h5>
                        <p className="text-blue-700 font-mono text-sm">
                          Lat: {currentLocation.lat.toFixed(6)}
                        </p>
                        <p className="text-blue-700 font-mono text-sm">
                          Lng: {currentLocation.lng.toFixed(6)}
                        </p>
                        {locationAccuracy && (
                          <p className={`text-xs mt-2 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {t('location.accuracy', { meters: Math.round(locationAccuracy) })}
                          </p>
                        )}
                      </div>
                      
                      <div className={`rounded-2xl p-4 border transition-colors duration-200 ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-white border-gray-200'
                      }`}>
                        <h5 className={`font-semibold mb-2 flex items-center ${
                          isDark ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          <Clock className="h-5 w-5 text-green-600 mr-2" />
                          {t('dashboard.lastUpdated')}
                        </h5>
                        {lastUpdated && (
                          <>
                            <p className={`text-sm ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {lastUpdated.toLocaleTimeString()}
                            </p>
                            <p className={`text-xs mt-1 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {lastUpdated.toLocaleDateString()}
                            </p>
                          </>
                        )}
                        <div className={`text-xs mt-2 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Location information
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Compass className={`h-12 w-12 mx-auto mb-4 animate-spin ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <p className={`${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>{t('location.gettingLocation')}</p>
                    </div>
                  )}
                </div>

                {/* Location History */}
                {locationHistory.length > 0 && (
                  <div className={`rounded-3xl shadow-xl p-6 transition-colors duration-200 ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <h4 className={`text-xl font-semibold mb-4 flex items-center ${
                      isDark ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      <Map className="h-6 w-6 text-purple-600 mr-2" />
                      {t('location.locationHistory')}
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
                  <h4 className={`text-xl font-semibold mb-6 ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}>{t('location.safetyZones')}</h4>
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
                <SettingsPage
                  userSettings={{
                    theme,
                    notificationPreferences: [
                      { type: 'emergency', enabled: settings.notifications.emergencyAlerts, methods: ['push', 'sms'] },
                      { type: 'location', enabled: settings.notifications.locationUpdates, methods: ['push'] },
                      { type: 'safety', enabled: settings.notifications.safetyReminders, methods: ['push'] },
                    ],
                    privacySettings: {
                      shareLocationWithAuthorities: settings.privacy.locationSharing,
                      shareLocationWithEmergencyServices: true,
                      allowLocationTracking: true,
                      shareProfileWithOtherTourists: settings.privacy.profileVisibility !== 'private',
                      allowDataAnalytics: settings.privacy.dataCollection,
                      allowMarketingCommunications: false,
                    },
                    accessibilitySettings: {
                      fontSize: 'medium' as const,
                      highContrast: false,
                      reduceMotion: false,
                      screenReader: false,
                      keyboardNavigation: false,
                    },
                    emergencyContacts: [],
                  }}
                  onSaveSettings={async (newSettings) => {
                    // Update local settings state
                    console.log('Saving settings:', newSettings);
                    // Here you would typically save to backend
                  }}
/>
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
