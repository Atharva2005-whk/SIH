import React, { useRef, useEffect, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { MapPin, AlertCircle, CheckCircle } from 'lucide-react';

const render = (status: Status) => {
  console.log('Google Maps Status:', status);
  
  if (status === Status.LOADING) {
    return (
      <div className="flex items-center justify-center h-96 bg-blue-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700 font-medium">Loading Google Maps...</p>
          <p className="text-blue-600 text-sm mt-2">Please wait while we initialize the map</p>
        </div>
      </div>
    );
  }
  
  if (status === Status.FAILURE) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border border-red-200">
        <div className="text-center p-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Google Maps Failed to Load</h3>
          <div className="text-red-600 text-sm space-y-2">
            <p>Possible issues:</p>
            <ul className="list-disc list-inside text-left space-y-1">
              <li>Invalid or missing Google Maps API key</li>
              <li>Maps JavaScript API not enabled in Google Cloud Console</li>
              <li>Domain restrictions on the API key</li>
              <li>Billing not set up in Google Cloud Console</li>
              <li>Network connectivity issues</li>
            </ul>
            <div className="mt-4 p-3 bg-red-100 rounded">
              <p className="font-medium">Current API Key Status:</p>
              <p className="font-mono text-xs">
                {import.meta.env.VITE_GOOGLE_MAPS_API_KEY 
                  ? `${import.meta.env.VITE_GOOGLE_MAPS_API_KEY.substring(0, 10)}...` 
                  : 'NOT SET'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
};

interface SimpleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ center, zoom }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  useEffect(() => {
    if (mapRef.current && !map) {
      console.log('Initializing Google Map with center:', center);
      
      const newMap = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ saturation: -10 }]
          }
        ]
      });

      setMap(newMap);
      console.log('Google Map initialized successfully');

      // Add a marker at the center
      const newMarker = new google.maps.Marker({
        position: center,
        map: newMap,
        title: 'DIT University, Dehradun',
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 8px 0; color: #4285F4;">DIT University</h3>
            <p style="margin: 0; font-size: 14px;">Dehradun, Uttarakhand</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">
              Lat: ${center.lat.toFixed(4)}, Lng: ${center.lng.toFixed(4)}
            </p>
          </div>
        `
      });

      newMarker.addListener('click', () => {
        infoWindow.open(newMap, newMarker);
      });

      setMarker(newMarker);
    }
  }, [mapRef, map, center, zoom]);

  return <div ref={mapRef} className="w-full h-full rounded-lg" />;
};

export function MapTest() {
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');
  
  useEffect(() => {
    // Check if API key is set
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      setApiKeyStatus('valid');
    } else {
      setApiKeyStatus('invalid');
    }
  }, []);

  const ditUniversityCoords = { lat: 30.2827, lng: 78.0289 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl mb-4 shadow-2xl">
            <MapPin className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Google Maps Test</h1>
          <p className="text-gray-600">Testing Google Maps integration for DIT University, Dehradun</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              {apiKeyStatus === 'valid' ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-600" />
              )}
              <div className={`px-3 py-1 rounded-2xl text-xs font-medium ${
                apiKeyStatus === 'valid' 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {apiKeyStatus === 'valid' ? 'VALID' : 'INVALID'}
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">API Key Status</h3>
            <p className="text-sm text-gray-600 mt-1">
              {apiKeyStatus === 'valid' 
                ? 'Google Maps API key is configured' 
                : 'Please set your Google Maps API key'}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
            <MapPin className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="font-semibold text-gray-900">Location</h3>
            <p className="text-sm text-gray-600 mt-1">DIT University, Dehradun</p>
            <p className="text-xs text-blue-600 mt-1">
              {ditUniversityCoords.lat.toFixed(4)}, {ditUniversityCoords.lng.toFixed(4)}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg mb-4"></div>
            <h3 className="font-semibold text-gray-900">Map Type</h3>
            <p className="text-sm text-gray-600 mt-1">Google Maps JavaScript API</p>
            <p className="text-xs text-indigo-600 mt-1">Interactive map with markers</p>
          </div>
        </div>

        {/* Instructions */}
        {apiKeyStatus === 'invalid' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6 mb-8">
            <div className="flex">
              <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Setup Required</h3>
                <div className="text-yellow-700 space-y-2">
                  <p>To see the map, please:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Get a Google Maps API key from <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
                    <li>Enable the "Maps JavaScript API"</li>
                    <li>Copy your API key to the <code className="bg-yellow-200 px-1 rounded">.env</code> file:</li>
                  </ol>
                  <div className="bg-yellow-100 p-3 rounded-lg mt-3">
                    <code className="text-sm">VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</code>
                  </div>
                  <p className="text-sm">Then restart your development server.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
            <h2 className="text-xl font-semibold">Interactive Map - DIT University</h2>
            <p className="text-blue-100 mt-1">Click the marker for more information</p>
          </div>
          
          <div className="h-96 lg:h-[500px]">
            <Wrapper
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'test'}
              render={render}
              libraries={['visualization']}
            >
              <SimpleMap
                center={ditUniversityCoords}
                zoom={15}
              />
            </Wrapper>
          </div>
        </div>

        {/* Debugging Info */}
        <div className="mt-8 bg-gray-50 rounded-3xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Environment:</p>
              <p className="text-gray-600">React Development Server</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">API Key Present:</p>
              <p className="text-gray-600">
                {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Map Center:</p>
              <p className="text-gray-600 font-mono">
                {ditUniversityCoords.lat}, {ditUniversityCoords.lng}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Browser:</p>
              <p className="text-gray-600">{navigator.userAgent.split(' ')[0]}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
