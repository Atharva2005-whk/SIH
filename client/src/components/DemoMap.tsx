import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Shield,
  AlertTriangle,
  AlertCircle,
  Users,
  Eye,
  Settings,
  Layers,
  Filter,
  Info,
  Zap,
  Construction,
  Car,
  Building,
  Navigation
} from 'lucide-react';

interface SafetyZone {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  radius: number;
  safetyLevel: 'safe' | 'moderate' | 'dangerous';
  type: 'residential' | 'commercial' | 'tourist' | 'construction' | 'traffic' | 'industrial';
  description: string;
  riskFactors: string[];
  lastUpdated: Date;
}

interface TouristLocation {
  id: number;
  name: string;
  nationality: string;
  position: { lat: number; lng: number };
  lastSeen: Date;
  status: 'safe' | 'warning' | 'danger' | 'offline';
  currentZone?: string;
}

export function DemoMap() {
  const [selectedZone, setSelectedZone] = useState<SafetyZone | null>(null);
  const [showHeatMap, setShowHeatMap] = useState(true);
  const [showTourists, setShowTourists] = useState(true);
  const [filterLevel, setFilterLevel] = useState<'all' | 'safe' | 'moderate' | 'dangerous'>('all');

  // Mock data for Uttarakhand tourist destinations
  const safetyZones: SafetyZone[] = [
    {
      id: 'zone-1',
      name: 'Rishikesh - Laxman Jhula Area',
      center: { lat: 30.1089, lng: 78.2932 },
      radius: 800,
      safetyLevel: 'safe',
      type: 'tourist',
      description: 'Popular spiritual tourism hub with good infrastructure',
      riskFactors: ['River currents', 'Crowded during festivals', 'Spiritual scams'],
      lastUpdated: new Date()
    },
    {
      id: 'zone-2',
      name: 'Mussoorie - Mall Road',
      center: { lat: 30.4598, lng: 78.0664 },
      radius: 600,
      safetyLevel: 'safe',
      type: 'tourist',
      description: 'Hill station shopping area with police presence',
      riskFactors: ['Steep terrain', 'Weather changes', 'Tourist overcharging'],
      lastUpdated: new Date()
    },
    {
      id: 'zone-3',
      name: 'Haridwar - Har Ki Pauri',
      center: { lat: 29.9457, lng: 78.1642 },
      radius: 700,
      safetyLevel: 'moderate',
      type: 'tourist',
      description: 'Religious site with massive crowd gatherings',
      riskFactors: ['Extreme crowds', 'Stampede risk', 'Pickpocketing', 'River danger'],
      lastUpdated: new Date()
    },
    {
      id: 'zone-4',
      name: 'Valley of Flowers - Govindghat',
      center: { lat: 30.7268, lng: 79.6093 },
      radius: 1200,
      safetyLevel: 'dangerous',
      type: 'tourist',
      description: 'Remote trekking area with challenging terrain and weather',
      riskFactors: ['Altitude sickness', 'Harsh weather', 'Limited rescue access', 'Wildlife encounters'],
      lastUpdated: new Date()
    },
    {
      id: 'zone-5',
      name: 'Kedarnath - Base Camp Area',
      center: { lat: 30.7346, lng: 79.0669 },
      radius: 800,
      safetyLevel: 'dangerous',
      type: 'tourist',
      description: 'High-altitude pilgrimage with extreme weather conditions',
      riskFactors: ['Flash floods', 'Extreme cold', 'Altitude sickness', 'Helicopter crashes'],
      lastUpdated: new Date()
    }
  ];

  const mockTourists: TouristLocation[] = [
    {
      id: 1,
      name: 'John Smith',
      nationality: 'American',
      position: { lat: 30.1089, lng: 78.2932 },
      lastSeen: new Date(Date.now() - 300000),
      status: 'safe',
      currentZone: 'zone-1'
    },
    {
      id: 2,
      name: 'Emma Johnson',
      nationality: 'British',
      position: { lat: 30.4598, lng: 78.0664 },
      lastSeen: new Date(Date.now() - 600000),
      status: 'safe',
      currentZone: 'zone-2'
    },
    {
      id: 3,
      name: 'Carlos Rodriguez',
      nationality: 'Spanish',
      position: { lat: 29.9457, lng: 78.1642 },
      lastSeen: new Date(Date.now() - 900000),
      status: 'warning',
      currentZone: 'zone-3'
    },
    {
      id: 4,
      name: 'Yuki Tanaka',
      nationality: 'Japanese',
      position: { lat: 30.7268, lng: 79.6093 },
      lastSeen: new Date(Date.now() - 1800000),
      status: 'danger',
      currentZone: 'zone-4'
    }
  ];

  const filteredZones = safetyZones.filter(zone => 
    filterLevel === 'all' || zone.safetyLevel === filterLevel
  );

  const getSafetyStats = () => {
    const safe = safetyZones.filter(z => z.safetyLevel === 'safe').length;
    const moderate = safetyZones.filter(z => z.safetyLevel === 'moderate').length;
    const dangerous = safetyZones.filter(z => z.safetyLevel === 'dangerous').length;
    return { safe, moderate, dangerous };
  };

  const stats = getSafetyStats();

  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'safe': return '#22c55e';
      case 'moderate': return '#f59e0b';
      case 'dangerous': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTouristStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return '#22c55e';
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      case 'offline': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl mb-4 shadow-2xl">
            <MapPin className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Safety Zone Map - Uttarakhand</h1>
          <p className="text-gray-600">Tourist safety monitoring across major destinations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Shield className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{stats.safe}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Safe Zones</h3>
            <p className="text-sm text-gray-600 mt-1">Low risk areas</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">{stats.moderate}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Moderate Zones</h3>
            <p className="text-sm text-gray-600 mt-1">Medium risk areas</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{stats.dangerous}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Dangerous Zones</h3>
            <p className="text-sm text-gray-600 mt-1">High risk areas</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{mockTourists.length}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Active Tourists</h3>
            <p className="text-sm text-gray-600 mt-1">Currently monitored</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Map Controls
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={showHeatMap}
                      onChange={(e) => setShowHeatMap(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm"
                    />
                    <span className="text-sm font-medium text-gray-900">Show Heat Map</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={showTourists}
                      onChange={(e) => setShowTourists(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm"
                    />
                    <span className="text-sm font-medium text-gray-900">Show Tourists</span>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  <Filter className="h-4 w-4 inline mr-1" />
                  Filter by Risk Level
                </label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value as any)}
                  className="w-full rounded-2xl border-gray-300 shadow-sm"
                >
                  <option value="all">All Zones</option>
                  <option value="safe">Safe Only</option>
                  <option value="moderate">Moderate Only</option>
                  <option value="dangerous">Dangerous Only</option>
                </select>
              </div>
            </div>

            {/* Zone Information */}
            {selectedZone && (
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Zone Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedZone.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Safety Level:</span>
                    <span className={`text-sm font-medium ${
                      selectedZone.safetyLevel === 'safe' ? 'text-green-600' :
                      selectedZone.safetyLevel === 'moderate' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {selectedZone.safetyLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600 block mb-2">Description:</span>
                    <p className="text-sm text-gray-800">{selectedZone.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Demo Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                <h2 className="text-xl font-semibold">Uttarakhand Safety Zones</h2>
                <p className="text-blue-100 mt-1">Demo visualization of tourist safety monitoring</p>
              </div>
              
              <div className="h-96 lg:h-[600px] relative bg-gradient-to-br from-green-100 to-blue-100 overflow-hidden">
                {/* Demo Map Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                                     radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                                     radial-gradient(circle at 40% 70%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
                                     radial-gradient(circle at 90% 80%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)`
                  }}></div>
                </div>

                {/* Safety Zones */}
                {filteredZones.map((zone, index) => (
                  <div
                    key={zone.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110`}
                    style={{
                      left: `${20 + (index * 18) % 60}%`,
                      top: `${30 + (index * 15) % 40}%`,
                    }}
                    onClick={() => setSelectedZone(zone)}
                  >
                    <div
                      className={`w-16 h-16 rounded-full border-4 border-white shadow-lg flex items-center justify-center`}
                      style={{ backgroundColor: getSafetyColor(zone.safetyLevel) }}
                    >
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div className="mt-2 text-center">
                      <div className="bg-white px-2 py-1 rounded text-xs font-medium shadow-md max-w-24 truncate">
                        {zone.name.split(' - ')[0]}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Tourist Markers */}
                {showTourists && mockTourists.map((tourist, index) => (
                  <div
                    key={tourist.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${25 + (index * 20) % 50}%`,
                      top: `${25 + (index * 18) % 50}%`,
                    }}
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center`}
                      style={{ backgroundColor: getTouristStatusColor(tourist.status) }}
                    >
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
                      <div className="bg-white px-2 py-1 rounded text-xs font-medium shadow-md whitespace-nowrap">
                        {tourist.name}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Demo Overlay */}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <p className="text-xs text-gray-600 font-medium">Demo Mode - Interactive Visualization</p>
                  <p className="text-xs text-gray-500">Click on zones for details</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Layers className="h-5 w-5 mr-2" />
            Map Legend
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Safety Zones</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
                  <span className="text-sm text-gray-700">Safe Zone</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-orange-500 mr-3"></div>
                  <span className="text-sm text-gray-700">Moderate Risk</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-3"></div>
                  <span className="text-sm text-gray-700">Dangerous Zone</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Tourist Status</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white mr-3"></div>
                  <span className="text-sm text-gray-700">Safe</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white mr-3"></div>
                  <span className="text-sm text-gray-700">Warning</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white mr-3"></div>
                  <span className="text-sm text-gray-700">Danger</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Location Types</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div>• Rishikesh - Spiritual Hub</div>
                <div>• Mussoorie - Hill Station</div>
                <div>• Haridwar - Religious Site</div>
                <div>• Valley of Flowers - Trekking</div>
                <div>• Kedarnath - Pilgrimage</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Demo Features</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div>• Interactive zone selection</div>
                <div>• Real-time tourist tracking</div>
                <div>• Safety level filtering</div>
                <div>• Risk factor analysis</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
