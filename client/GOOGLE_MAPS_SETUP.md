# Google Maps Integration Setup Guide

This guide will help you set up Google Maps integration for the AI Safety Monitoring System with heat maps and real-time tourist tracking.

## 🗺️ **Features Included**

### **Safety Heat Map Component (`SafetyHeatMap.tsx`)**
- **Interactive Google Maps**: Integrated with Google Maps JavaScript API
- **Safety Zone Visualization**: Color-coded circles showing risk levels
  - 🟢 **Green**: Safe zones (tourist areas, secure locations)
  - 🟠 **Orange**: Moderate risk zones (busy commercial areas, traffic)
  - 🔴 **Red**: Dangerous zones (construction sites, industrial areas)
- **Heat Map Overlay**: Visual representation of risk intensity
- **Real-time Tourist Tracking**: Live markers showing tourist locations
- **Interactive Controls**: Toggle heat map, tourists, and safety zones
- **Zone Details**: Click zones for detailed risk information
- **Filtering Options**: Filter by risk level and zone type

### **AI Anomaly Detection (`AIAnomalyDetection.tsx`)**
- **Behavioral Analysis**: Real-time tourist behavior monitoring
- **Anomaly Detection Algorithms**: Route deviation, inactivity, speed anomalies
- **Alert Management**: Acknowledge, investigate, and resolve alerts
- **Confidence Scoring**: ML-based confidence levels for detections
- **Risk Assessment**: Continuous safety evaluation

### **Integrated Dashboard (`AIMonitoringDashboard.tsx`)**
- **Unified Interface**: Combined overview, heat map, and anomaly detection
- **Real-time Statistics**: Live tourist counts, safety metrics
- **Alert System**: Notifications for new anomalies
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 **Quick Setup**

### **1. Install Dependencies**
```bash
npm install @googlemaps/react-wrapper @googlemaps/js-api-loader
```

### **2. Get Google Maps API Key**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - **Maps JavaScript API** (Required)
   - **Maps Static API** (Optional)
   - **Places API** (Optional for future features)
   - **Geocoding API** (Optional for address lookups)

4. Create credentials (API Key)
5. Set up API restrictions for security

### **3. Configure Environment**
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Google Maps API key to `.env`:
   ```env
   REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. Make sure `.env` is in your `.gitignore`:
   ```gitignore
   .env
   .env.local
   ```

### **4. Import and Use Components**
```tsx
import { AIMonitoringDashboard } from './components/AIMonitoringDashboard';
import { SafetyHeatMap } from './components/SafetyHeatMap';
import { AIAnomalyDetection } from './components/AIAnomalyDetection';

// Use the integrated dashboard
function App() {
  return <AIMonitoringDashboard />;
}

// Or use individual components
function MapPage() {
  return <SafetyHeatMap />;
}

function AIPage() {
  return <AIAnomalyDetection />;
}
```

## 🔧 **Configuration Options**

### **Safety Zones Configuration**
The heat map includes predefined safety zones for Delhi/NCR:

```tsx
const safetyZones = [
  {
    name: 'Connaught Place',
    center: { lat: 28.6315, lng: 77.2167 },
    safetyLevel: 'safe',
    type: 'tourist',
    // ... more properties
  },
  // ... more zones
];
```

### **Customizing Zones**
You can modify zones in `SafetyHeatMap.tsx`:

1. **Add New Zone**:
   ```tsx
   {
     id: 'zone-new',
     name: 'New Tourist Area',
     center: { lat: your_lat, lng: your_lng },
     radius: 500, // meters
     safetyLevel: 'safe', // 'safe' | 'moderate' | 'dangerous'
     type: 'tourist', // 'tourist' | 'commercial' | 'construction' | 'industrial'
     description: 'Description of the area',
     riskFactors: ['Risk factor 1', 'Risk factor 2'],
     lastUpdated: new Date()
   }
   ```

2. **Change Map Center**:
   ```tsx
   <GoogleMapComponent
     center={{ lat: your_city_lat, lng: your_city_lng }}
     zoom={12}
   />
   ```

### **Heat Map Customization**
Modify heat map appearance in `SafetyHeatMap.tsx`:

```tsx
const newHeatmap = new google.maps.visualization.HeatmapLayer({
  data: heatmapData,
  map: map,
  dissipating: true,
  radius: 50, // Heat point radius
  gradient: [
    'rgba(0, 255, 0, 0)',    // Transparent
    'rgba(0, 255, 0, 0.6)',  // Green (safe)
    'rgba(255, 255, 0, 0.8)', // Yellow (moderate)
    'rgba(255, 165, 0, 0.9)', // Orange (high)
    'rgba(255, 0, 0, 1)'     // Red (dangerous)
  ]
});
```

## 🎨 **Visual Features**

### **Color Coding System**
- **🟢 Green (`#22c55e`)**: Safe zones, secure tourists
- **🟡 Yellow (`#f59e0b`)**: Moderate risk, warnings
- **🔴 Red (`#ef4444`)**: Dangerous zones, alerts
- **⚫ Gray (`#6b7280`)**: Offline/inactive status

### **Interactive Elements**
- **Zone Circles**: Click to view detailed information
- **Tourist Markers**: Hover/click for tourist details
- **Control Panel**: Toggle layers and filters
- **Sidebar Navigation**: Switch between views
- **Real-time Updates**: Live data refresh every 5 seconds

## 🔐 **Security Best Practices**

### **API Key Security**
1. **Environment Variables**: Never hardcode API keys
2. **Domain Restrictions**: Limit API key to your domains
3. **API Restrictions**: Enable only necessary APIs
4. **Regular Rotation**: Update API keys periodically

### **Example API Restrictions**
In Google Cloud Console → Credentials → API Key → Restrictions:

**HTTP referrers (websites)**:
```
http://localhost:3000/*
https://yourdomain.com/*
https://*.yourdomain.com/*
```

**API restrictions**:
- Maps JavaScript API
- Maps Static API (if used)

## 📊 **Data Integration**

### **Real-time Data Sources**
The components currently use mock data but can be easily connected to:

1. **GPS Tracking Systems**: Real tourist location data
2. **Government APIs**: Traffic, construction, safety alerts
3. **Weather APIs**: Environmental conditions
4. **Crime Databases**: Historical safety data
5. **Event Management**: Tourist itineraries and bookings

### **API Integration Example**
```tsx
// Replace mock data with real API calls
useEffect(() => {
  const fetchTouristData = async () => {
    try {
      const response = await fetch('/api/tourists/locations');
      const data = await response.json();
      setTourists(data);
    } catch (error) {
      console.error('Failed to fetch tourist data:', error);
    }
  };

  fetchTouristData();
  const interval = setInterval(fetchTouristData, 30000); // Update every 30 seconds
  return () => clearInterval(interval);
}, []);
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Loading Google Maps..." stuck**
   - Check your API key in `.env`
   - Verify Maps JavaScript API is enabled
   - Check browser console for errors

2. **"Error loading Google Maps"**
   - Confirm API key is valid
   - Check domain restrictions
   - Ensure billing is set up in Google Cloud

3. **Map appears gray/blank**
   - Verify lat/lng coordinates are valid
   - Check if API key has proper permissions
   - Look for JavaScript errors in console

4. **Heat map not showing**
   - Confirm visualization library is loaded
   - Check if `showHeatMap` state is true
   - Verify heat map data is properly formatted

### **Debug Mode**
Add this to your component for debugging:
```tsx
useEffect(() => {
  console.log('Google Maps API Key:', process.env.REACT_APP_GOOGLE_MAPS_API_KEY?.substring(0, 10) + '...');
  console.log('Safety zones:', safetyZones.length);
  console.log('Tourists:', mockTourists.length);
}, []);
```

## 📱 **Mobile Responsiveness**

The components are fully responsive and include:
- **Mobile Sidebar**: Collapsible navigation
- **Touch-friendly**: Large buttons and touch targets
- **Adaptive Layout**: Responsive grid systems
- **Mobile Maps**: Optimized map interactions

## 🔄 **Future Enhancements**

Planned improvements:
- **Machine Learning Integration**: Real ML models for anomaly detection
- **Push Notifications**: Real-time alerts to mobile devices
- **Historical Data**: Analytics and trends
- **Multi-language Support**: International tourist support
- **Offline Mode**: Cached maps and data
- **Advanced Filtering**: Custom alert criteria
- **Integration APIs**: Connect with existing tourism systems

## 📞 **Support**

If you encounter issues:
1. Check this documentation first
2. Review browser console for errors
3. Verify Google Cloud Console setup
4. Test with a fresh API key
5. Check component props and data flow

The system is designed to be modular and extensible, making it easy to customize for different cities, add new features, or integrate with existing tourism management systems.
