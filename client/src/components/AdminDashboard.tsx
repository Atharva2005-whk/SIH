import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  UserCheck,
  UserX,
  MapPin,
  Bell,
  Search,
  Filter,
  Settings,
  User,
  Lock,
  Volume2,
  Smartphone,
  Globe,
  Database,
  Activity,
  Zap,
  HelpCircle,
  Info,
  RefreshCw
} from 'lucide-react';

interface AdminDashboardProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    department?: string;
    badge?: string;
  };
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Admin settings state
  const [adminSettings, setAdminSettings] = useState({
    system: {
      autoAlerts: true,
      realTimeTracking: true,
      emergencyResponse: true,
      dataBackup: true,
      maintenanceMode: false
    },
    notifications: {
      emergencyAlerts: true,
      systemAlerts: true,
      reportAlerts: true,
      soundEnabled: true
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30, // minutes
      auditLogging: true,
      ipWhitelist: false
    },
    display: {
      refreshInterval: 30, // seconds
      maxRecords: 100,
      theme: 'light',
      timezone: 'Asia/Kolkata'
    }
  });

  // Mock data
  const [stats] = useState({
    totalTourists: 247,
    activeTourists: 189,
    pendingVerifications: 12,
    totalIncidents: 8,
    resolvedIncidents: 6,
    activeAlerts: 2
  });

  const [recentTourists] = useState([
    { id: 1, name: 'John Doe', nationality: 'American', status: 'verified', registeredAt: '2024-01-15' },
    { id: 2, name: 'Maria Garcia', nationality: 'Spanish', status: 'pending', registeredAt: '2024-01-16' },
    { id: 3, name: 'Raj Patel', nationality: 'Indian', status: 'verified', registeredAt: '2024-01-14' }
  ]);

  const [pendingDocuments] = useState([
    { id: 1, touristName: 'Alice Johnson', documentType: 'Passport', submittedAt: '2024-01-16' },
    { id: 2, touristName: 'Bob Smith', documentType: 'Visa', submittedAt: '2024-01-15' },
    { id: 3, touristName: 'Chen Wei', documentType: 'Passport', submittedAt: '2024-01-16' }
  ]);

  const [recentIncidents] = useState([
    { id: 1, type: 'Medical Emergency', location: 'Tourist District', severity: 'high', status: 'resolved', reportedAt: '2024-01-15' },
    { id: 2, type: 'Lost Tourist', location: 'Airport Area', severity: 'medium', status: 'investigating', reportedAt: '2024-01-16' },
    { id: 3, type: 'Suspicious Activity', location: 'Hotel Zone', severity: 'low', status: 'monitoring', reportedAt: '2024-01-16' }
  ]);

  const [touristLocations] = useState([
    {
      id: 1,
      name: 'John Smith',
      nationality: 'American',
      position: { lat: 30.1089, lng: 78.2932 },
      location: 'Rishikesh - Laxman Jhula Area',
      lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
      status: 'safe',
      batteryLevel: 85,
      signalStrength: 'strong'
    },
    {
      id: 2,
      name: 'Emma Johnson',
      nationality: 'British',
      position: { lat: 30.4598, lng: 78.0664 },
      location: 'Mussoorie - Mall Road',
      lastSeen: new Date(Date.now() - 600000), // 10 minutes ago
      status: 'safe',
      batteryLevel: 45,
      signalStrength: 'medium'
    },
    {
      id: 3,
      name: 'Carlos Rodriguez',
      nationality: 'Spanish',
      position: { lat: 29.9457, lng: 78.1642 },
      location: 'Haridwar - Har Ki Pauri',
      lastSeen: new Date(Date.now() - 900000), // 15 minutes ago
      status: 'warning',
      batteryLevel: 15,
      signalStrength: 'weak'
    },
    {
      id: 4,
      name: 'Yuki Tanaka',
      nationality: 'Japanese',
      position: { lat: 30.7268, lng: 79.6093 },
      location: 'Valley of Flowers - Govindghat',
      lastSeen: new Date(Date.now() - 1800000), // 30 minutes ago
      status: 'danger',
      batteryLevel: 5,
      signalStrength: 'none'
    },
    {
      id: 5,
      name: 'Sophie Laurent',
      nationality: 'French',
      position: { lat: 29.3803, lng: 79.4636 },
      location: 'Nainital - Naini Lake',
      lastSeen: new Date(Date.now() - 180000), // 3 minutes ago
      status: 'safe',
      batteryLevel: 92,
      signalStrength: 'strong'
    },
    {
      id: 6,
      name: 'Raj Patel',
      nationality: 'Indian',
      position: { lat: 29.5312, lng: 78.7688 },
      location: 'Jim Corbett National Park - Dhikala',
      lastSeen: new Date(Date.now() - 1200000), // 20 minutes ago
      status: 'warning',
      batteryLevel: 30,
      signalStrength: 'weak'
    },
    {
      id: 7,
      name: 'Anna Kowalski',
      nationality: 'Polish',
      position: { lat: 30.5206, lng: 79.5590 },
      location: 'Auli - Ski Resort Area',
      lastSeen: new Date(Date.now() - 450000), // 7.5 minutes ago
      status: 'safe',
      batteryLevel: 78,
      signalStrength: 'medium'
    },
    {
      id: 8,
      name: 'Ahmed Al-Rashid',
      nationality: 'UAE',
      position: { lat: 30.3753, lng: 78.4804 },
      location: 'New Tehri Dam Construction',
      lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
      status: 'offline',
      batteryLevel: 0,
      signalStrength: 'none'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'pending':
      case 'investigating': return 'text-yellow-600 bg-yellow-50';
      case 'rejected':
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'monitoring': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleVerifyDocument = (docId: number, action: 'approve' | 'reject') => {
    alert(`Document ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
  };

  const handleVerifyTourist = (touristId: number, action: 'verify' | 'reject') => {
    alert(`Tourist ${action === 'verify' ? 'verified' : 'rejected'} successfully!`);
  };

  const updateAdminSettings = (category: string, key: string, value: any) => {
    setAdminSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleEmergencyResponse = (incidentId: number) => {
    console.log(`🚨 Emergency response initiated for incident ${incidentId}`);
    alert(`Emergency response team dispatched for incident #${incidentId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-red-100 p-2 rounded-2xl mr-3">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SafeGuard Admin Portal</h1>
                <p className="text-xs text-gray-600">{user.department?.toUpperCase()} • Badge #{user.badge}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  2
                </span>
              </button>
              
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-2xl">
                <Shield className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700 font-medium">{user.name}</span>
              </div>
              
              <button
                onClick={onLogout}
                className="text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-2xl font-medium transition-all duration-200 hover:scale-105"
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
          <h2 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h2>
          <p className="text-gray-600 mt-1">Monitor and manage tourist safety across the region</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Tourists</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalTourists}</p>
              </div>
              <div className="bg-blue-600 p-2 rounded-2xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active Now</p>
                <p className="text-2xl font-bold text-green-900">{stats.activeTourists}</p>
              </div>
              <div className="bg-green-600 p-2 rounded-2xl">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Pending Docs</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pendingVerifications}</p>
              </div>
              <div className="bg-yellow-600 p-2 rounded-2xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Active Incidents</p>
                <p className="text-2xl font-bold text-red-900">{stats.totalIncidents - stats.resolvedIncidents}</p>
              </div>
              <div className="bg-red-600 p-2 rounded-2xl">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-3xl shadow-xl mb-8 overflow-hidden">
          <div className="border-b border-gray-100">
            <nav className="flex space-x-2 px-6 py-2">
              {[
                { id: 'overview', label: 'Overview', icon: Shield },
                { id: 'tourists', label: 'Tourists', icon: Users },
                { id: 'locations', label: 'Locations', icon: MapPin },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-3 px-4 rounded-2xl font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-red-100 text-red-700 shadow-md'
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
                {/* System Status */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-3xl p-6">
                  <div className="flex items-center">
                    <div className="bg-green-600 p-2 rounded-2xl mr-3">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-green-900">System Status: All Good</h3>
                  </div>
                  <p className="text-green-700 mt-3 text-lg">All monitoring systems are operational. No critical alerts.</p>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-6">Recent Tourist Registrations</h4>
                    <div className="space-y-4">
                      {recentTourists.slice(0, 3).map((tourist) => (
                        <div key={tourist.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-2xl mr-3">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{tourist.name}</p>
                              <p className="text-sm text-gray-600">{tourist.nationality}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-2xl text-xs font-medium border ${getStatusColor(tourist.status)}`}>
                            {tourist.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-6">Recent Incidents</h4>
                    <div className="space-y-4">
                      {recentIncidents.slice(0, 3).map((incident) => (
                        <div key={incident.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                          <div className="flex items-center">
                            <div className="bg-red-100 p-2 rounded-2xl mr-3">
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{incident.type}</p>
                              <p className="text-sm text-gray-600">{incident.location}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-2xl text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                            {incident.severity.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tourists' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-semibold text-gray-900">Tourist Management</h4>
                  <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-200">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </button>
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-200">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {recentTourists.map((tourist) => (
                    <div key={tourist.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-3 rounded-2xl">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{tourist.name}</p>
                            <p className="text-sm text-gray-600">{tourist.nationality} • Registered {tourist.registeredAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-2xl text-sm font-medium border ${getStatusColor(tourist.status)}`}>
                            {tourist.status.toUpperCase()}
                          </span>
                          <button 
                            onClick={() => handleVerifyTourist(tourist.id, 'verify')}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all duration-200 hover:scale-105"
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Verify
                          </button>
                          <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-2xl hover:bg-gray-700 transition-all duration-200 hover:scale-105">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'locations' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-semibold text-gray-900">Tourist Location Tracking</h4>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-2xl text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      {touristLocations.filter(t => t.status !== 'offline').length} Live
                    </div>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-200">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {touristLocations.map((tourist) => {
                    const getLocationStatusColor = (status: string) => {
                      switch (status) {
                        case 'safe': return 'bg-green-50 border-green-200 text-green-900';
                        case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
                        case 'danger': return 'bg-red-50 border-red-200 text-red-900';
                        case 'offline': return 'bg-gray-50 border-gray-200 text-gray-900';
                        default: return 'bg-gray-50 border-gray-200 text-gray-900';
                      }
                    };

                    const getSignalIcon = (strength: string) => {
                      switch (strength) {
                        case 'strong': return <div className="flex space-x-1"><div className="w-1 h-3 bg-green-500 rounded"></div><div className="w-1 h-3 bg-green-500 rounded"></div><div className="w-1 h-3 bg-green-500 rounded"></div></div>;
                        case 'medium': return <div className="flex space-x-1"><div className="w-1 h-3 bg-yellow-500 rounded"></div><div className="w-1 h-3 bg-yellow-500 rounded"></div><div className="w-1 h-2 bg-gray-300 rounded"></div></div>;
                        case 'weak': return <div className="flex space-x-1"><div className="w-1 h-3 bg-red-500 rounded"></div><div className="w-1 h-2 bg-gray-300 rounded"></div><div className="w-1 h-2 bg-gray-300 rounded"></div></div>;
                        case 'none': return <div className="flex space-x-1"><div className="w-1 h-2 bg-gray-300 rounded"></div><div className="w-1 h-2 bg-gray-300 rounded"></div><div className="w-1 h-2 bg-gray-300 rounded"></div></div>;
                        default: return null;
                      }
                    };

                    const getBatteryColor = (level: number) => {
                      if (level > 50) return 'bg-green-500';
                      if (level > 20) return 'bg-yellow-500';
                      return 'bg-red-500';
                    };

                    return (
                      <div key={tourist.id} className={`bg-white border-2 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ${getLocationStatusColor(tourist.status)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-2xl ${
                              tourist.status === 'safe' ? 'bg-green-100' :
                              tourist.status === 'warning' ? 'bg-yellow-100' :
                              tourist.status === 'danger' ? 'bg-red-100' :
                              'bg-gray-100'
                            }`}>
                              <MapPin className={`h-6 w-6 ${
                                tourist.status === 'safe' ? 'text-green-600' :
                                tourist.status === 'warning' ? 'text-yellow-600' :
                                tourist.status === 'danger' ? 'text-red-600' :
                                'text-gray-600'
                              }`} />
                            </div>
                            <div>
                              <div className="flex items-center space-x-3 mb-1">
                                <h5 className="font-semibold text-lg">{tourist.name}</h5>
                                <span className={`px-2 py-1 rounded-xl text-xs font-medium ${
                                  tourist.status === 'safe' ? 'bg-green-200 text-green-800' :
                                  tourist.status === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                                  tourist.status === 'danger' ? 'bg-red-200 text-red-800' :
                                  'bg-gray-200 text-gray-800'
                                }`}>
                                  {tourist.status.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{tourist.nationality}</p>
                              <p className="text-sm font-medium text-gray-800">{tourist.location}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Last seen: {tourist.lastSeen.toLocaleTimeString()} • {tourist.lastSeen.toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end space-y-3">
                            {/* Coordinates */}
                            <div className="text-right">
                              <p className="text-xs text-gray-600 font-mono">
                                {tourist.position.lat.toFixed(4)}, {tourist.position.lng.toFixed(4)}
                              </p>
                            </div>

                            {/* Device Status */}
                            <div className="flex items-center space-x-4">
                              {/* Signal Strength */}
                              <div className="flex items-center space-x-1">
                                <Smartphone className="h-3 w-3 text-gray-500" />
                                {getSignalIcon(tourist.signalStrength)}
                              </div>

                              {/* Battery Level */}
                              <div className="flex items-center space-x-1">
                                <div className="relative">
                                  <div className="w-6 h-3 border border-gray-400 rounded-sm">
                                    <div 
                                      className={`h-full rounded-sm ${getBatteryColor(tourist.batteryLevel)}`}
                                      style={{ width: `${tourist.batteryLevel}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-600 ml-1">{tourist.batteryLevel}%</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                              <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors">
                                Track
                              </button>
                              <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 transition-colors">
                                Contact
                              </button>
                              {(tourist.status === 'danger' || tourist.status === 'warning') && (
                                <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition-colors">
                                  Alert
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Location Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Location Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{touristLocations.filter(t => t.status === 'safe').length}</div>
                      <div className="text-sm text-gray-600">Safe Locations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{touristLocations.filter(t => t.status === 'warning').length}</div>
                      <div className="text-sm text-gray-600">Warning Zones</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{touristLocations.filter(t => t.status === 'danger').length}</div>
                      <div className="text-sm text-gray-600">Danger Alerts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">{touristLocations.filter(t => t.status === 'offline').length}</div>
                      <div className="text-sm text-gray-600">Offline</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-semibold text-gray-900">Document Verification</h4>
                  <span className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 rounded-2xl text-sm font-medium border border-yellow-300">
                    {pendingDocuments.length} pending reviews
                  </span>
                </div>

                <div className="space-y-4">
                  {pendingDocuments.map((doc) => (
                    <div key={doc.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-yellow-100 p-3 rounded-2xl">
                            <FileText className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{doc.touristName}</p>
                            <p className="text-sm text-gray-600">{doc.documentType} • Submitted {doc.submittedAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => handleVerifyDocument(doc.id, 'approve')}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all duration-200 hover:scale-105"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </button>
                          <button 
                            onClick={() => handleVerifyDocument(doc.id, 'reject')}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all duration-200 hover:scale-105"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </button>
                          <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-2xl hover:bg-gray-700 transition-all duration-200 hover:scale-105">
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'incidents' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-semibold text-gray-900">Incident Management</h4>
                  <span className="px-4 py-2 bg-gradient-to-r from-red-100 to-red-200 text-red-800 rounded-2xl text-sm font-medium border border-red-300">
                    {stats.totalIncidents - stats.resolvedIncidents} active incidents
                  </span>
                </div>

                <div className="space-y-4">
                  {recentIncidents.map((incident) => (
                    <div key={incident.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-2xl ${incident.severity === 'high' ? 'bg-red-100' : incident.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                            <AlertTriangle className={`h-6 w-6 ${incident.severity === 'high' ? 'text-red-600' : incident.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{incident.type}</p>
                            <p className="text-sm text-gray-600">{incident.location} • {incident.reportedAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-2xl text-sm font-medium border ${getSeverityColor(incident.severity)}`}>
                            {incident.severity.toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 rounded-2xl text-sm font-medium border ${getStatusColor(incident.status)}`}>
                            {incident.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-200 hover:scale-105 font-medium">
                          View Details
                        </button>
                        <button className="px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all duration-200 hover:scale-105 font-medium">
                          Update Status
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* System Settings */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Settings className="h-6 w-6 text-blue-600 mr-2" />
                    System Configuration
                  </h4>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'autoAlerts', label: 'Automatic Alerts', desc: 'Auto-generate alerts for emergencies', icon: Bell },
                      { key: 'realTimeTracking', label: 'Real-time Tracking', desc: 'Enable live location monitoring', icon: MapPin },
                      { key: 'emergencyResponse', label: 'Emergency Response', desc: 'Automated emergency response system', icon: AlertTriangle },
                      { key: 'dataBackup', label: 'Auto Data Backup', desc: 'Automatic system data backup', icon: Database },
                      { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Enable system maintenance mode', icon: Settings }
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
                            checked={adminSettings.system[setting.key]}
                            onChange={(e) => updateAdminSettings('system', setting.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Bell className="h-6 w-6 text-yellow-600 mr-2" />
                    Notification Management
                  </h4>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'emergencyAlerts', label: 'Emergency Alerts', desc: 'Critical emergency notifications', icon: AlertTriangle },
                      { key: 'systemAlerts', label: 'System Alerts', desc: 'System status and maintenance alerts', icon: Activity },
                      { key: 'reportAlerts', label: 'Report Alerts', desc: 'New reports and document notifications', icon: FileText },
                      { key: 'soundEnabled', label: 'Sound Notifications', desc: 'Audio alerts for critical events', icon: Volume2 }
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
                            checked={adminSettings.notifications[setting.key]}
                            onChange={(e) => updateAdminSettings('notifications', setting.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Lock className="h-6 w-6 text-green-600 mr-2" />
                    Security Configuration
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center">
                        <div className="bg-gray-200 p-2 rounded-2xl mr-3">
                          <Lock className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-600">Enhanced security for admin accounts</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={adminSettings.security.twoFactorAuth}
                          onChange={(e) => updateAdminSettings('security', 'twoFactorAuth', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center mb-3">
                        <div className="bg-gray-200 p-2 rounded-2xl mr-3">
                          <Clock className="h-5 w-5 text-gray-600" />
                        </div>
                        <p className="font-medium text-gray-900">Session Timeout</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="15"
                          max="120"
                          step="15"
                          value={adminSettings.security.sessionTimeout}
                          onChange={(e) => updateAdminSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700 bg-gray-200 px-3 py-1 rounded-2xl">
                          {adminSettings.security.sessionTimeout} min
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center">
                        <div className="bg-gray-200 p-2 rounded-2xl mr-3">
                          <Activity className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Audit Logging</p>
                          <p className="text-sm text-gray-600">Log all administrative actions</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={adminSettings.security.auditLogging}
                          onChange={(e) => updateAdminSettings('security', 'auditLogging', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Display Settings */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Smartphone className="h-6 w-6 text-purple-600 mr-2" />
                    Display & Performance
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auto-refresh Interval
                      </label>
                      <select
                        value={adminSettings.display.refreshInterval}
                        onChange={(e) => updateAdminSettings('display', 'refreshInterval', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                      >
                        <option value={10}>10 seconds</option>
                        <option value={30}>30 seconds</option>
                        <option value={60}>1 minute</option>
                        <option value={300}>5 minutes</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Records per Page
                      </label>
                      <select
                        value={adminSettings.display.maxRecords}
                        onChange={(e) => updateAdminSettings('display', 'maxRecords', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                      >
                        <option value={50}>50 records</option>
                        <option value={100}>100 records</option>
                        <option value={200}>200 records</option>
                        <option value={500}>500 records</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <select
                        value={adminSettings.display.theme}
                        onChange={(e) => updateAdminSettings('display', 'theme', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                      >
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={adminSettings.display.timezone}
                        onChange={(e) => updateAdminSettings('display', 'timezone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Emergency Response Center */}
                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-3xl p-6 border-2 border-red-200">
                  <h4 className="text-xl font-semibold text-red-900 mb-6 flex items-center">
                    <Zap className="h-6 w-6 text-red-600 mr-2" />
                    Emergency Response Center
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      onClick={() => handleEmergencyResponse(999)}
                      className="p-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all duration-200 hover:scale-105"
                    >
                      <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                      <span className="block font-medium">Dispatch Emergency</span>
                      <span className="text-xs opacity-90">Send immediate response</span>
                    </button>
                    
                    <button className="p-4 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-all duration-200 hover:scale-105">
                      <Bell className="h-6 w-6 mx-auto mb-2" />
                      <span className="block font-medium">Broadcast Alert</span>
                      <span className="text-xs opacity-90">Send area-wide alert</span>
                    </button>
                    
                    <button className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-200 hover:scale-105">
                      <RefreshCw className="h-6 w-6 mx-auto mb-2" />
                      <span className="block font-medium">System Refresh</span>
                      <span className="text-xs opacity-90">Refresh all data</span>
                    </button>
                  </div>
                </div>

                {/* System Information */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Info className="h-6 w-6 text-blue-600 mr-2" />
                    System Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                      <div className="flex items-center mb-2">
                        <Database className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-900">System Status</span>
                      </div>
                      <p className="text-sm text-blue-700">All systems operational</p>
                      <p className="text-xs text-blue-600 mt-1">Last checked: {new Date().toLocaleTimeString()}</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                      <div className="flex items-center mb-2">
                        <Activity className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-900">Active Users</span>
                      </div>
                      <p className="text-sm text-green-700">892 tourists, 45 authorities</p>
                      <p className="text-xs text-green-600 mt-1">Real-time count</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Admin Emergency Controls - Fixed at bottom */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 mt-8">
            <div className="flex items-center justify-center space-x-4">
              <button 
                onClick={() => handleEmergencyResponse(0)}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl py-4 px-8 font-bold text-lg shadow-xl hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 flex items-center"
              >
                <div className="bg-white/20 p-2 rounded-full mr-3">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xl">🚨 EMERGENCY DISPATCH</div>
                  <div className="text-sm opacity-90">Deploy immediate response</div>
                </div>
              </button>
              
              <button className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-2xl py-4 px-8 font-bold text-lg shadow-xl hover:from-orange-700 hover:to-orange-800 transform hover:scale-105 transition-all duration-200 flex items-center">
                <div className="bg-white/20 p-2 rounded-full mr-3">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xl">📢 BROADCAST ALERT</div>
                  <div className="text-sm opacity-90">Send area-wide notification</div>
                </div>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Emergency controls available 24/7 • All actions are logged and monitored
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
