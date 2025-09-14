import React, { useState, useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import {
  MapPin,
  Shield,
  AlertTriangle,
  AlertCircle,
  Navigation,
  Users,
  Eye,
  Settings,
  Layers,
  Filter,
  RefreshCw,
  Info,
  Zap,
  Construction,
  Car,
  Building
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

interface HeatMapPoint {
  location: google.maps.LatLng;
  weight: number;
}

const render = (status: Status) => {
  if (status === Status.LOADING) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Google Maps...</span>
      </div>
    );
  }
  if (status === Status.FAILURE) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
        <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
        <span className="text-red-700">Error loading Google Maps. Please check your API key.</span>
      </div>
    );
  }
  return null;
};

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  safetyZones: SafetyZone[];
  tourists: TouristLocation[];
  showHeatMap: boolean;
  showTourists: boolean;
  onZoneClick: (zone: SafetyZone) => void;
}

const GoogleMapComponent: React.FC<GoogleMapProps> = ({
  center,
  zoom,
  safetyZones,
  tourists,
  showHeatMap,
  showTourists,
  onZoneClick
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [heatmap, setHeatmap] = useState<google.maps.visualization.HeatmapLayer | null>(null);
  const [circles, setCircles] = useState<google.maps.Circle[]>([]);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
      setMap(newMap);
    }
  }, [mapRef, map, center, zoom]);

  // Create safety zone circles
  useEffect(() => {
    if (!map) return;

    // Clear existing circles
    circles.forEach(circle => circle.setMap(null));

    const newCircles: google.maps.Circle[] = [];

    safetyZones.forEach(zone => {
      const color = getSafetyColor(zone.safetyLevel);
      
      const circle = new google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.2,
        map: map,
        center: zone.center,
        radius: zone.radius,
        clickable: true
      });

      // Add click listener
      circle.addListener('click', () => {
        onZoneClick(zone);
      });

      newCircles.push(circle);

      // Add zone label
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h4 style="margin: 0 0 8px 0; color: ${color};">${zone.name}</h4>
            <p style="margin: 0; font-size: 12px;">${zone.description}</p>
            <p style="margin: 4px 0 0 0; font-size: 10px; color: #666;">
              Safety Level: ${zone.safetyLevel.toUpperCase()}
            </p>
          </div>
        `,
        position: zone.center
      });

      // Show info window on circle click
      circle.addListener('click', () => {
        infoWindow.open(map);
      });
    });

    setCircles(newCircles);

    return () => {
      newCircles.forEach(circle => circle.setMap(null));
    };
  }, [map, safetyZones, onZoneClick]);

  // Create heat map
  useEffect(() => {
    if (!map || !showHeatMap) {
      if (heatmap) {
        heatmap.setMap(null);
        setHeatmap(null);
      }
      return;
    }

    // Create heat map data
    const heatmapData: HeatMapPoint[] = [];

    safetyZones.forEach(zone => {
      const weight = zone.safetyLevel === 'dangerous' ? 100 : 
                    zone.safetyLevel === 'moderate' ? 50 : 20;
      
      // Add multiple points around the zone for better visualization
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * 2 * Math.PI;
        const distance = zone.radius * Math.random() * 0.8;
        const lat = zone.center.lat + (distance / 111320) * Math.cos(angle);
        const lng = zone.center.lng + (distance / (111320 * Math.cos(zone.center.lat * Math.PI / 180))) * Math.sin(angle);
        
        heatmapData.push({
          location: new google.maps.LatLng(lat, lng),
          weight: weight
        });
      }
    });

    const newHeatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: map,
      dissipating: true,
      radius: 50,
      gradient: [
        'rgba(0, 255, 0, 0)',    // Transparent green
        'rgba(0, 255, 0, 0.6)',  // Green (safe)
        'rgba(255, 255, 0, 0.8)', // Yellow (moderate)
        'rgba(255, 165, 0, 0.9)', // Orange (moderate-high)
        'rgba(255, 0, 0, 1)'     // Red (dangerous)
      ]
    });

    setHeatmap(newHeatmap);

    return () => {
      if (newHeatmap) {
        newHeatmap.setMap(null);
      }
    };
  }, [map, showHeatMap, safetyZones]);

  // Create tourist markers
  useEffect(() => {
    if (!map || !showTourists) {
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);
      return;
    }

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];

    tourists.forEach(tourist => {
      const markerColor = getTouristStatusColor(tourist.status);
      
      const marker = new google.maps.Marker({
        position: tourist.position,
        map: map,
        title: `${tourist.name} (${tourist.nationality})`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h4 style="margin: 0 0 8px 0;">${tourist.name}</h4>
            <p style="margin: 0; font-size: 12px;">Nationality: ${tourist.nationality}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px;">Status: 
              <span style="color: ${markerColor}; font-weight: bold;">
                ${tourist.status.toUpperCase()}
              </span>
            </p>
            <p style="margin: 4px 0 0 0; font-size: 10px; color: #666;">
              Last seen: ${tourist.lastSeen.toLocaleString()}
            </p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [map, showTourists, tourists]);

  const getSafetyColor = (level: string): string => {
    switch (level) {
      case 'safe': return '#22c55e';      // Green
      case 'moderate': return '#f59e0b';  // Orange
      case 'dangerous': return '#ef4444'; // Red
      default: return '#6b7280';          // Gray
    }
  };

  const getTouristStatusColor = (status: string): string => {
    switch (status) {
      case 'safe': return '#22c55e';      // Green
      case 'warning': return '#f59e0b';   // Orange
      case 'danger': return '#ef4444';    // Red
      case 'offline': return '#6b7280';   // Gray
      default: return '#6b7280';          // Gray
    }
  };

  return <div ref={mapRef} className="w-full h-full" />;
};

export function SafetyHeatMap() {
  const [selectedZone, setSelectedZone] = useState<SafetyZone | null>(null);
  const [showHeatMap, setShowHeatMap] = useState(true);
  const [showTourists, setShowTourists] = useState(true);
  const [showSafeZones, setShowSafeZones] = useState(true);
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
      name: 'Nainital - Naini Lake',
      center: { lat: 29.3803, lng: 79.4636 },
      radius: 900,
      safetyLevel: 'safe',
      type: 'tourist',
      description: 'Beautiful lake town with established tourism infrastructure',
      riskFactors: ['Landslides during monsoon', 'Lake drowning risk', 'Traffic congestion'],
      lastUpdated: new Date()
    },
    {
      id: 'zone-5',
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
      id: 'zone-6',
      name: 'Almora - Market Area',
      center: { lat: 29.5971, lng: 79.6590 },
      radius: 500,
      safetyLevel: 'safe',
      type: 'commercial',
      description: 'Hill town market with local administration',
      riskFactors: ['Narrow mountain roads', 'Limited medical facilities'],
      lastUpdated: new Date()
    },
    {
      id: 'zone-7',
      name: 'Badrinath - Temple Complex',
      center: { lat: 30.7433, lng: 79.4938 },
      radius: 600,
      safetyLevel: 'moderate',
      type: 'tourist',
      description: 'High-altitude pilgrimage site with seasonal access',
      riskFactors: ['Extreme altitude', 'Weather closure', 'Limited oxygen', 'Landslides'],
      lastUpdated: new Date()
    },
    {
      id: 'zone-8',
      name: 'Jim Corbett National Park - Dhikala',
      center: { lat: 29.5312, lng: 78.7688 },
      radius: 2000,
      safetyLevel: 'moderate',
      type: 'tourist',
      description: 'Wildlife sanctuary with controlled access and guides',
      riskFactors: ['Wild animal encounters', 'Dense forest', 'Limited communication'],
      lastUpdated: new Date()
    },
    {
      id: 'zone-9',
      name: 'Kedarnath - Base Camp Area',
      center: { lat: 30.7346, lng: 79.0669 },
      radius: 800,
      safetyLevel: 'dangerous',
      type: 'tourist',
      description: 'High-altitude pilgrimage with extreme weather conditions',
      riskFactors: ['Flash floods', 'Extreme cold', 'Altitude sickness', 'Helicopter crashes'],
      lastUpdated: new Date()
    },
    {
      id: 'zone-10',
      name: 'Auli - Ski Resort Area',
      center: { lat: 30.5206, lng: 79.5590 },
      radius: 1000,
      safetyLevel: 'moderate',
      type: 'tourist',
      description: 'Winter sports destination with ski facilities',
      riskFactors: ['Avalanche zones', 'Ski accidents', 'Extreme weather', 'Isolated location'],
      lastUpdated: new Date()
    },
    {
      id: 'zone-11',
      name: 'Lansdowne - Cantonment Area',
      center: { lat: 29.8370, lng: 78.6827 },
      radius: 700,
      safetyLevel: 'safe',
      type: 'tourist',
      description: 'Military cantonment town with good security',
      riskFactors: ['Restricted military areas', 'Limited nightlife'],
      lastUpdated: new Date()
    },
    {
      id: 'zone-12',
      name: 'Gangotri - Glacier Area',
      center: { lat: 30.9991, lng: 78.9410 },
      radius: 900,
      safetyLevel: 'dangerous',
      type: 'tourist',
      description: 'Glacier source of Ganges with treacherous conditions',
      riskFactors: ['Glacier crevasses', 'Extreme cold', 'Rockfalls', 'Thin air'],
      lastUpdated: new Date()
    },
    {
      id: 'zone-13',
      name: 'Chakrata - Hill Station',
      center: { lat: 30.7043, lng: 77.8696 },
      radius: 600,
      safetyLevel: 'safe',
      type: 'tourist',
      description: 'Quiet hill station with military presence',
      riskFactors: ['Limited medical facilities', 'Seasonal road closures'],
      lastUpdated: new Date()
    },
    {
      id: 'zone-14',
      name: 'Industrial Zone - Pantnagar',
      center: { lat: 29.0330, lng: 79.4737 },
      radius: 800,
      safetyLevel: 'moderate',
      type: 'industrial',
      description: 'Agricultural university and industrial area',
      riskFactors: ['Heavy machinery', 'Chemical exposure', 'Limited emergency services'],
      lastUpdated: new Date()
    },
    {
      id: 'zone-15',
      name: 'Construction Site - New Tehri Dam',
      center: { lat: 30.3753, lng: 78.4804 },
      radius: 1200,
      safetyLevel: 'dangerous',
      type: 'construction',
      description: 'Large hydroelectric project construction zone',
      riskFactors: ['Heavy machinery', 'Blasting operations', 'Restricted access', 'Dam safety'],
      lastUpdated: new Date()
    }
  ];

  const mockTourists: TouristLocation[] = [
    {
      id: 1,
      name: 'John Smith',
      nationality: 'American',
      position: { lat: 30.1089, lng: 78.2932 }, // Rishikesh - Laxman Jhula Area
      lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
      status: 'safe',
      currentZone: 'zone-1'
    },
    {
      id: 2,
      name: 'Emma Johnson',
      nationality: 'British',
      position: { lat: 30.4598, lng: 78.0664 }, // Mussoorie - Mall Road
      lastSeen: new Date(Date.now() - 600000), // 10 minutes ago
      status: 'safe',
      currentZone: 'zone-2'
    },
    {
      id: 3,
      name: 'Carlos Rodriguez',
      nationality: 'Spanish',
      position: { lat: 29.9457, lng: 78.1642 }, // Haridwar - Har Ki Pauri
      lastSeen: new Date(Date.now() - 900000), // 15 minutes ago
      status: 'warning',
      currentZone: 'zone-3'
    },
    {
      id: 4,
      name: 'Yuki Tanaka',
      nationality: 'Japanese',
      position: { lat: 30.7268, lng: 79.6093 }, // Valley of Flowers - Govindghat (Dangerous)
      lastSeen: new Date(Date.now() - 1800000), // 30 minutes ago
      status: 'danger',
      currentZone: 'zone-5'
    },
    {
      id: 5,
      name: 'Sophie Laurent',
      nationality: 'French',
      position: { lat: 29.3803, lng: 79.4636 }, // Nainital - Naini Lake
      lastSeen: new Date(Date.now() - 180000), // 3 minutes ago
      status: 'safe',
      currentZone: 'zone-4'
    },
    {
      id: 6,
      name: 'Raj Patel',
      nationality: 'Indian',
      position: { lat: 29.5312, lng: 78.7688 }, // Jim Corbett National Park
      lastSeen: new Date(Date.now() - 1200000), // 20 minutes ago
      status: 'warning',
      currentZone: 'zone-8'
    },
    {
      id: 7,
      name: 'Anna Kowalski',
      nationality: 'Polish',
      position: { lat: 30.5206, lng: 79.5590 }, // Auli - Ski Resort Area
      lastSeen: new Date(Date.now() - 450000), // 7.5 minutes ago
      status: 'safe',
      currentZone: 'zone-10'
    },
    {
      id: 8,
      name: 'Michael Thompson',
      nationality: 'Canadian',
      position: { lat: 30.7346, lng: 79.0669 }, // Kedarnath - Dangerous zone
      lastSeen: new Date(Date.now() - 2400000), // 40 minutes ago
      status: 'danger',
      currentZone: 'zone-9'
    },
    {
      id: 9,
      name: 'Lisa Chen',
      nationality: 'Singaporean',
      position: { lat: 29.8370, lng: 78.6827 }, // Lansdowne - Safe zone
      lastSeen: new Date(Date.now() - 120000), // 2 minutes ago
      status: 'safe',
      currentZone: 'zone-11'
    },
    {
      id: 10,
      name: 'Ahmed Al-Rashid',
      nationality: 'UAE',
      position: { lat: 30.3753, lng: 78.4804 }, // New Tehri Dam Construction - Dangerous
      lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
      status: 'offline',
      currentZone: 'zone-15'
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

  const getZoneIcon = (type: string) => {
    switch (type) {
      case 'tourist': return <MapPin className="h-4 w-4" />;
      case 'commercial': return <Building className="h-4 w-4" />;
      case 'construction': return <Construction className="h-4 w-4" />;
      case 'industrial': return <Zap className="h-4 w-4" />;
      case 'traffic': return <Car className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getSafetyIcon = (level: string) => {
    switch (level) {
      case 'safe': return <Shield className="h-4 w-4 text-green-600" />;
      case 'moderate': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'dangerous': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Eye className="h-4 w-4 text-gray-600" />;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Safety Heat Map</h1>
          <p className="text-gray-600">Real-time safety monitoring with Google Maps integration</p>
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
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="text-sm font-medium text-gray-900">Show Tourists</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={showSafeZones}
                      onChange={(e) => setShowSafeZones(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="text-sm font-medium text-gray-900">Show Safety Zones</span>
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
                  className="w-full rounded-2xl border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
                    <span className="text-sm text-gray-600">Type:</span>
                    <div className="flex items-center">
                      {getZoneIcon(selectedZone.type)}
                      <span className="text-sm font-medium text-gray-900 ml-1">
                        {selectedZone.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Safety Level:</span>
                    <div className="flex items-center">
                      {getSafetyIcon(selectedZone.safetyLevel)}
                      <span className={`text-sm font-medium ml-1 ${
                        selectedZone.safetyLevel === 'safe' ? 'text-green-600' :
                        selectedZone.safetyLevel === 'moderate' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {selectedZone.safetyLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600 block mb-2">Description:</span>
                    <p className="text-sm text-gray-800">{selectedZone.description}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600 block mb-2">Risk Factors:</span>
                    <div className="space-y-1">
                      {selectedZone.riskFactors.map((factor, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700">
                          <AlertTriangle className="h-3 w-3 text-orange-500 mr-2" />
                          {factor}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="h-96 lg:h-[600px]">
                <Wrapper
                  apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE'}
                  render={render}
                  libraries={['visualization']}
                >
                  <GoogleMapComponent
                    center={{ lat: 30.0668, lng: 79.0193 }} // Central Uttarakhand view
                    zoom={8}
                    safetyZones={filteredZones}
                    tourists={mockTourists}
                    showHeatMap={showHeatMap}
                    showTourists={showTourists}
                    onZoneClick={setSelectedZone}
                  />
                </Wrapper>
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
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-white mr-3"></div>
                  <span className="text-sm text-gray-700">Offline</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Zone Types</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-blue-600 mr-3" />
                  <span className="text-sm text-gray-700">Tourist Areas</span>
                </div>
                <div className="flex items-center">
                  <Building className="h-4 w-4 text-purple-600 mr-3" />
                  <span className="text-sm text-gray-700">Commercial</span>
                </div>
                <div className="flex items-center">
                  <Construction className="h-4 w-4 text-yellow-600 mr-3" />
                  <span className="text-sm text-gray-700">Construction</span>
                </div>
                <div className="flex items-center">
                  <Zap className="h-4 w-4 text-orange-600 mr-3" />
                  <span className="text-sm text-gray-700">Industrial</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Heat Map</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded mr-3" style={{ background: 'linear-gradient(to right, rgba(0,255,0,0.6), rgba(255,255,0,0.8), rgba(255,0,0,1))' }}></div>
                  <span className="text-sm text-gray-700">Risk Intensity</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Green: Low risk, Yellow: Medium risk, Red: High risk
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
