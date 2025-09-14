import React, { useState, useEffect } from 'react';
import {
  Brain,
  AlertTriangle,
  MapPin,
  Clock,
  Activity,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
  Eye,
  Navigation,
  Smartphone,
  Signal,
  Wifi,
  Battery,
  Heart,
  Route,
  Timer,
  Users,
  CheckCircle
} from 'lucide-react';

interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: Date;
  accuracy: number;
  speed?: number;
  heading?: number;
}

interface AnomalyAlert {
  id: string;
  type: 'route_deviation' | 'inactivity' | 'speed_anomaly' | 'zone_breach' | 'communication_loss' | 'panic_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  tourist: {
    id: number;
    name: string;
    nationality: string;
  };
  location: LocationPoint;
  description: string;
  confidence: number;
  detectedAt: Date;
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved';
}

interface TouristBehaviorProfile {
  id: number;
  baselineSpeed: number;
  preferredRoutes: string[];
  activityPattern: 'active' | 'moderate' | 'inactive';
  riskLevel: number;
  lastActivity: Date;
  communicationFrequency: number;
}

export function AIAnomalyDetection() {
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [touristProfiles, setTouristProfiles] = useState<TouristBehaviorProfile[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [aiStatus, setAiStatus] = useState<'online' | 'offline' | 'learning'>('online');
  const [processingStats, setProcessingStats] = useState({
    totalTourists: 0,
    activeMonitoring: 0,
    anomaliesDetected: 0,
    accuracyRate: 96.5
  });

  // Mock tourist data for demonstration
  const mockTourists = [
    { id: 1, name: 'John Smith', nationality: 'American' },
    { id: 2, name: 'Emma Johnson', nationality: 'British' },
    { id: 3, name: 'Carlos Rodriguez', nationality: 'Spanish' },
    { id: 4, name: 'Yuki Tanaka', nationality: 'Japanese' },
    { id: 5, name: 'Sophie Laurent', nationality: 'French' }
  ];

  // AI Anomaly Detection Algorithm
  const detectAnomalies = (locationData: LocationPoint[], profile: TouristBehaviorProfile) => {
    const newAnomalies: AnomalyAlert[] = [];
    
    if (locationData.length < 2) return newAnomalies;

    const latestLocation = locationData[locationData.length - 1];
    const previousLocation = locationData[locationData.length - 2];
    
    // 1. Route Deviation Detection
    const routeDeviation = calculateRouteDeviation(locationData, profile.preferredRoutes);
    if (routeDeviation.isDeviated) {
      newAnomalies.push({
        id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'route_deviation',
        severity: routeDeviation.severity,
        tourist: mockTourists.find(t => t.id === profile.id) || mockTourists[0],
        location: latestLocation,
        description: `Tourist deviated ${routeDeviation.distance}m from planned route`,
        confidence: routeDeviation.confidence,
        detectedAt: new Date(),
        status: 'new'
      });
    }

    // 2. Inactivity Detection
    const timeSinceLastActivity = Date.now() - profile.lastActivity.getTime();
    const inactivityThreshold = 2 * 60 * 60 * 1000; // 2 hours
    
    if (timeSinceLastActivity > inactivityThreshold) {
      newAnomalies.push({
        id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'inactivity',
        severity: timeSinceLastActivity > 4 * 60 * 60 * 1000 ? 'high' : 'medium',
        tourist: mockTourists.find(t => t.id === profile.id) || mockTourists[0],
        location: latestLocation,
        description: `No activity detected for ${Math.round(timeSinceLastActivity / (60 * 60 * 1000))} hours`,
        confidence: 0.9,
        detectedAt: new Date(),
        status: 'new'
      });
    }

    // 3. Speed Anomaly Detection
    if (latestLocation.speed && previousLocation.speed) {
      const speedDifference = Math.abs(latestLocation.speed - profile.baselineSpeed);
      const isSpeedAnomaly = speedDifference > profile.baselineSpeed * 0.5;
      
      if (isSpeedAnomaly) {
        newAnomalies.push({
          id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'speed_anomaly',
          severity: speedDifference > profile.baselineSpeed * 0.8 ? 'high' : 'medium',
          tourist: mockTourists.find(t => t.id === profile.id) || mockTourists[0],
          location: latestLocation,
          description: `Unusual speed detected: ${latestLocation.speed}km/h (normal: ${profile.baselineSpeed}km/h)`,
          confidence: 0.85,
          detectedAt: new Date(),
          status: 'new'
        });
      }
    }

    return newAnomalies;
  };

  // Calculate route deviation
  const calculateRouteDeviation = (locations: LocationPoint[], preferredRoutes: string[]) => {
    // Simplified route deviation calculation
    const randomDeviation = Math.random() * 1000; // 0-1000 meters
    const isDeviated = randomDeviation > 200; // Consider 200m+ as deviation
    
    return {
      isDeviated,
      distance: Math.round(randomDeviation),
      severity: randomDeviation > 500 ? 'high' : randomDeviation > 300 ? 'medium' : 'low',
      confidence: Math.random() * 0.3 + 0.7 // 0.7-1.0
    } as const;
  };

  // Generate mock behavioral profiles
  const generateMockProfiles = () => {
    return mockTourists.map(tourist => ({
      id: tourist.id,
      baselineSpeed: 15 + Math.random() * 20, // 15-35 km/h
      preferredRoutes: ['route_1', 'route_2', 'tourist_zone'],
      activityPattern: ['active', 'moderate', 'inactive'][Math.floor(Math.random() * 3)] as any,
      riskLevel: Math.random() * 100,
      lastActivity: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000), // Within last 6 hours
      communicationFrequency: Math.random() * 10 + 1 // 1-11 per hour
    }));
  };

  // Simulate real-time monitoring
  useEffect(() => {
    const profiles = generateMockProfiles();
    setTouristProfiles(profiles);
    
    const monitoringInterval = setInterval(() => {
      if (!isMonitoring) return;

      // Simulate location data for each tourist
      profiles.forEach(profile => {
        // Generate random location within Uttarakhand bounds
        const uttarakhandLocations = [
          { lat: 30.1089, lng: 78.2932 }, // Rishikesh
          { lat: 30.4598, lng: 78.0664 }, // Mussoorie
          { lat: 29.9457, lng: 78.1642 }, // Haridwar
          { lat: 29.3803, lng: 79.4636 }, // Nainital
          { lat: 30.0668, lng: 79.0193 }, // Central Uttarakhand
        ];
        const randomLocation = uttarakhandLocations[Math.floor(Math.random() * uttarakhandLocations.length)];
        
        const mockLocationData: LocationPoint[] = [
          {
            lat: randomLocation.lat + (Math.random() - 0.5) * 0.05,
            lng: randomLocation.lng + (Math.random() - 0.5) * 0.05,
            timestamp: new Date(Date.now() - 60000),
            accuracy: 10 + Math.random() * 20,
            speed: profile.baselineSpeed + (Math.random() - 0.5) * 10,
            heading: Math.random() * 360
          },
          {
            lat: randomLocation.lat + (Math.random() - 0.5) * 0.05,
            lng: randomLocation.lng + (Math.random() - 0.5) * 0.05,
            timestamp: new Date(),
            accuracy: 10 + Math.random() * 20,
            speed: profile.baselineSpeed + (Math.random() - 0.5) * 10,
            heading: Math.random() * 360
          }
        ];

        // Run anomaly detection
        const detectedAnomalies = detectAnomalies(mockLocationData, profile);
        
        if (detectedAnomalies.length > 0) {
          setAnomalies(prev => [...prev, ...detectedAnomalies].slice(-20)); // Keep last 20
          setProcessingStats(prev => ({
            ...prev,
            anomaliesDetected: prev.anomaliesDetected + detectedAnomalies.length
          }));
        }
      });

      // Update processing stats
      setProcessingStats(prev => ({
        ...prev,
        totalTourists: profiles.length,
        activeMonitoring: profiles.filter(p => Date.now() - p.lastActivity.getTime() < 4 * 60 * 60 * 1000).length,
        accuracyRate: 95 + Math.random() * 3 // 95-98%
      }));
    }, 5000); // Check every 5 seconds

    return () => clearInterval(monitoringInterval);
  }, [isMonitoring]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <Zap className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Eye className="h-4 w-4" />;
      case 'low': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getAnomalyTypeIcon = (type: string) => {
    switch (type) {
      case 'route_deviation': return <Route className="h-5 w-5" />;
      case 'inactivity': return <Timer className="h-5 w-5" />;
      case 'speed_anomaly': return <Navigation className="h-5 w-5" />;
      case 'zone_breach': return <Target className="h-5 w-5" />;
      case 'communication_loss': return <Wifi className="h-5 w-5" />;
      case 'panic_pattern': return <Heart className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const acknowledgeAnomaly = (anomalyId: string) => {
    setAnomalies(prev => 
      prev.map(anomaly => 
        anomaly.id === anomalyId 
          ? { ...anomaly, status: 'acknowledged' }
          : anomaly
      )
    );
  };

  const investigateAnomaly = (anomalyId: string) => {
    setAnomalies(prev => 
      prev.map(anomaly => 
        anomaly.id === anomalyId 
          ? { ...anomaly, status: 'investigating' }
          : anomaly
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl mb-4 shadow-2xl">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Anomaly Detection</h1>
          <p className="text-gray-600">Advanced behavioral analysis and predictive monitoring</p>
        </div>

        {/* AI Status & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Brain className="h-8 w-8 text-purple-600" />
              <div className={`px-3 py-1 rounded-2xl text-xs font-medium ${aiStatus === 'online' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {aiStatus.toUpperCase()}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI Engine</h3>
            <p className="text-sm text-gray-600 mt-1">
              {aiStatus === 'online' ? 'Real-time analysis active' : 'System offline'}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
            <Users className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">{processingStats.totalTourists}</h3>
            <p className="text-sm text-gray-600">Total Tourists</p>
            <p className="text-xs text-blue-600 mt-1">{processingStats.activeMonitoring} actively monitored</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
            <AlertTriangle className="h-8 w-8 text-orange-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">{processingStats.anomaliesDetected}</h3>
            <p className="text-sm text-gray-600">Anomalies Detected</p>
            <p className="text-xs text-orange-600 mt-1">Last 24 hours</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
            <Target className="h-8 w-8 text-green-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">{processingStats.accuracyRate.toFixed(1)}%</h3>
            <p className="text-sm text-gray-600">Accuracy Rate</p>
            <p className="text-xs text-green-600 mt-1">ML model performance</p>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="h-6 w-6 text-purple-600 mr-2" />
              Monitoring Control
            </h2>
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center ${
                isMonitoring
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isMonitoring ? (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Start Monitoring
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2">Detection Algorithms</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Route deviation analysis</li>
                <li>• Inactivity pattern detection</li>
                <li>• Speed anomaly identification</li>
                <li>• Geo-fence breach monitoring</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">ML Model Status</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Training data: 10K+ samples</li>
                <li>• Last updated: 2 hours ago</li>
                <li>• Model version: v2.1.3</li>
                <li>• Confidence threshold: 80%</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Real-time Processing</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Processing rate: 50 req/sec</li>
                <li>• Average latency: 120ms</li>
                <li>• Queue size: 0 pending</li>
                <li>• System load: 34%</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Anomalies */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-6 w-6 text-orange-600 mr-2" />
              Recent Anomalies
            </h2>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {isMonitoring ? 'Live monitoring' : 'Monitoring paused'}
              </span>
            </div>
          </div>

          {anomalies.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Anomalies Detected</h3>
              <p className="text-gray-600">All tourists are following normal behavior patterns</p>
            </div>
          ) : (
            <div className="space-y-4">
              {anomalies.slice().reverse().slice(0, 10).map((anomaly) => (
                <div key={anomaly.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-2xl mr-4 ${getSeverityColor(anomaly.severity)}`}>
                        {getAnomalyTypeIcon(anomaly.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{anomaly.tourist.name}</h4>
                        <p className="text-sm text-gray-600">{anomaly.tourist.nationality}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-2xl text-xs font-medium border ${getSeverityColor(anomaly.severity)}`}>
                        {getSeverityIcon(anomaly.severity)}
                        <span className="ml-1">{anomaly.severity.toUpperCase()}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(anomaly.confidence * 100)}% confidence
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-800 mb-2">{anomaly.description}</p>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {anomaly.location.lat.toFixed(4)}, {anomaly.location.lng.toFixed(4)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {anomaly.detectedAt.toLocaleTimeString()}
                      </div>
                      <div className="flex items-center">
                        <Signal className="h-4 w-4 mr-1" />
                        ±{anomaly.location.accuracy}m
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-2xl text-xs font-medium ${
                      anomaly.status === 'new' ? 'bg-gray-100 text-gray-700' :
                      anomaly.status === 'acknowledged' ? 'bg-blue-100 text-blue-700' :
                      anomaly.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {anomaly.status.toUpperCase()}
                    </div>
                    
                    <div className="flex space-x-2">
                      {anomaly.status === 'new' && (
                        <button
                          onClick={() => acknowledgeAnomaly(anomaly.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-2xl text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      {anomaly.status === 'acknowledged' && (
                        <button
                          onClick={() => investigateAnomaly(anomaly.id)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-2xl text-sm font-medium hover:bg-orange-700 transition-colors"
                        >
                          Investigate
                        </button>
                      )}
                      <button className="px-4 py-2 bg-gray-600 text-white rounded-2xl text-sm font-medium hover:bg-gray-700 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
