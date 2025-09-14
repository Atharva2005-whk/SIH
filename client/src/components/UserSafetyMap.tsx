import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Shield,
  AlertTriangle,
  AlertCircle,
  Users,
  Navigation,
  Eye,
  Heart,
  Phone,
  Car,
  Building,
  Compass,
  Target,
  Home
} from 'lucide-react';

interface SafetyZone {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  safetyLevel: 'safe' | 'moderate' | 'dangerous';
  type: 'tourist' | 'medical' | 'police' | 'commercial';
  description: string;
  distance?: string;
}

interface UserSafetyMapProps {
  userLocation?: { lat: number; lng: number };
  userName: string;
}

export function UserSafetyMap({ userLocation, userName }: UserSafetyMapProps) {
  const [selectedZone, setSelectedZone] = useState<SafetyZone | null>(null);
  const [currentUserLocation] = useState<{ lat: number; lng: number }>({
    lat: userLocation?.lat || 30.1089,
    lng: userLocation?.lng || 78.2932
  });

  // Safety zones focused on user experience
  const safetyZones: SafetyZone[] = [
    {
      id: 'zone-1',
      name: 'Tourist Information Center',
      center: { lat: 30.1100, lng: 78.2950 },
      safetyLevel: 'safe',
      type: 'tourist',
      description: '24/7 help desk, maps, and tourist assistance available',
      distance: '200m'
    },
    {
      id: 'zone-2',
      name: 'Police Station',
      center: { lat: 30.1050, lng: 78.2900 },
      safetyLevel: 'safe',
      type: 'police',
      description: 'Local police station with tourist helpdesk',
      distance: '350m'
    },
    {
      id: 'zone-3',
      name: 'District Hospital',
      center: { lat: 30.1120, lng: 78.2980 },
      safetyLevel: 'safe',
      type: 'medical',
      description: 'Government hospital with emergency services',
      distance: '450m'
    },
    {
      id: 'zone-4',
      name: 'Crowded Market Area',
      center: { lat: 30.1070, lng: 78.2920 },
      safetyLevel: 'moderate',
      type: 'commercial',
      description: 'Busy market area - keep belongings secure',
      distance: '300m'
    },
    {
      id: 'zone-5',
      name: 'Construction Zone',
      center: { lat: 30.1150, lng: 78.2850 },
      safetyLevel: 'dangerous',
      type: 'commercial',
      description: 'Active construction - avoid this area',
      distance: '800m'
    }
  ];

  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'safe': return '#22c55e';
      case 'moderate': return '#f59e0b';
      case 'dangerous': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getZoneIcon = (type: string) => {
    switch (type) {
      case 'tourist': return <Eye className="h-4 w-4 text-white" />;
      case 'police': return <Shield className="h-4 w-4 text-white" />;
      case 'medical': return <Heart className="h-4 w-4 text-white" />;
      case 'commercial': return <Building className="h-4 w-4 text-white" />;
      default: return <MapPin className="h-4 w-4 text-white" />;
    }
  };

  const getZoneTypeLabel = (type: string) => {
    switch (type) {
      case 'tourist': return 'Tourist Help';
      case 'police': return 'Police Station';
      case 'medical': return 'Hospital';
      case 'commercial': return 'Commercial';
      default: return 'Location';
    }
  };

  return (
    <div className="space-y-6">
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Your Safety Map</h3>
          <p className="text-gray-600 mt-1">Nearby safety zones and important locations</p>
        </div>
        <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-2xl">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">You are in a Safe Zone</span>
        </div>
      </div>

      {/* Current Location */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-6">
        <div className="flex items-center mb-4">
          <div className="bg-blue-600 p-3 rounded-2xl mr-4">
            <Navigation className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-blue-900">Your Current Location</h4>
            <p className="text-blue-700">Rishikesh - Laxman Jhula Area</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-600 font-medium">Coordinates:</span>
            <p className="font-mono text-blue-800">{currentUserLocation.lat.toFixed(4)}, {currentUserLocation.lng.toFixed(4)}</p>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Last Updated:</span>
            <p className="text-blue-800">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
          <h4 className="text-lg font-semibold">Interactive Safety Map</h4>
          <p className="text-green-100 mt-1">Click on markers to see details</p>
        </div>
        
        <div className="h-96 relative bg-gradient-to-br from-green-100 to-blue-100 overflow-hidden">
          {/* Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 30% 40%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                               radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                               radial-gradient(circle at 50% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)`
            }}></div>
          </div>

          {/* Your Location (Center) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-12 h-12 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div className="absolute top-14 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-md whitespace-nowrap">
                  You are here
                </div>
              </div>
              {/* Pulsing ring around user location */}
              <div className="absolute -top-2 -left-2 w-16 h-16 border-2 border-blue-400 rounded-full animate-ping opacity-30"></div>
            </div>
          </div>

          {/* Safety Zones */}
          {safetyZones.map((zone, index) => {
            const positions = [
              { top: '25%', left: '30%' }, // Tourist Info
              { top: '60%', left: '25%' }, // Police
              { top: '20%', left: '70%' }, // Hospital
              { top: '70%', left: '65%' }, // Market
              { top: '15%', left: '15%' }, // Construction
            ];
            
            return (
              <div
                key={zone.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110"
                style={{
                  top: positions[index]?.top || '50%',
                  left: positions[index]?.left || '50%',
                }}
                onClick={() => setSelectedZone(zone)}
              >
                <div
                  className="w-10 h-10 rounded-full border-3 border-white shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: getSafetyColor(zone.safetyLevel) }}
                >
                  {getZoneIcon(zone.type)}
                </div>
                <div className="mt-2 text-center">
                  <div className="bg-white px-2 py-1 rounded text-xs font-medium shadow-md max-w-20 truncate">
                    {getZoneTypeLabel(zone.type)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{zone.distance}</div>
                </div>
              </div>
            );
          })}

          {/* Demo Overlay */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <p className="text-xs text-gray-600 font-medium">Live Safety Map</p>
            <p className="text-xs text-gray-500">Updated in real-time</p>
          </div>
        </div>
      </div>

      {/* Zone Information Panel */}
      {selectedZone ? (
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-gray-900 flex items-center">
              <div 
                className="w-8 h-8 rounded-full mr-3 flex items-center justify-center"
                style={{ backgroundColor: getSafetyColor(selectedZone.safetyLevel) }}
              >
                {getZoneIcon(selectedZone.type)}
              </div>
              {selectedZone.name}
            </h4>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-2xl text-xs font-medium ${
                selectedZone.safetyLevel === 'safe' ? 'bg-green-100 text-green-800' :
                selectedZone.safetyLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedZone.safetyLevel.toUpperCase()}
              </span>
              <span className="text-sm text-gray-600">{selectedZone.distance} away</span>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">{selectedZone.description}</p>
          
          <div className="flex space-x-3">
            <button className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </button>
            <button className="flex-1 bg-green-600 text-white py-3 rounded-2xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center">
              <Phone className="h-4 w-4 mr-2" />
              Call Now
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 text-center border-2 border-gray-200">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">Select a Location</h4>
          <p className="text-gray-500">Click on any marker on the map to see details and get directions</p>
        </div>
      )}

      {/* Quick Safety Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6">
          <div className="flex items-center mb-3">
            <Shield className="h-6 w-6 text-green-600 mr-2" />
            <h5 className="font-semibold text-green-900">Safety Tips</h5>
          </div>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Stay in well-lit, populated areas</li>
            <li>• Keep emergency contacts handy</li>
            <li>• Share your location with trusted contacts</li>
            <li>• Trust your instincts</li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6">
          <div className="flex items-center mb-3">
            <Phone className="h-6 w-6 text-blue-600 mr-2" />
            <h5 className="font-semibold text-blue-900">Emergency Numbers</h5>
          </div>
          <div className="text-sm text-blue-800 space-y-1">
            <div>🚨 Police: <span className="font-bold">112</span></div>
            <div>🏥 Medical: <span className="font-bold">102</span></div>
            <div>🔥 Fire: <span className="font-bold">101</span></div>
            <div>🆘 Tourist Helpline: <span className="font-bold">1363</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
