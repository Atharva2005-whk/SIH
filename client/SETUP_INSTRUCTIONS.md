# 🗺️ Google Maps Setup Instructions for DIT University, Dehradun

## 🚀 Step 1: Get Google Maps API Key

### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### 1.2 Create or Select a Project
1. Click the project dropdown at the top
2. Either select an existing project or click "New Project"
3. If creating new: Enter project name (e.g., "SIH Tourist Safety App")
4. Click "Create"

### 1.3 Enable Required APIs
1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for and enable these APIs:
   - **Maps JavaScript API** (Required)
   - **Maps Static API** (Optional)
   - **Places API** (Optional for future features)

### 1.4 Create API Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. **Important:** Click "Restrict Key" for security

### 1.5 Configure API Key Restrictions (Recommended)
1. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add these URLs:
     ```
     http://localhost:3000/*
     http://localhost:5173/*
     https://yourdomain.com/*
     ```

2. Under "API restrictions":
   - Select "Restrict key"
   - Choose only the APIs you enabled above

## 🔧 Step 2: Configure Your Project

### 2.1 Update Environment Variables
1. Open your `.env` file in the project root
2. Replace the placeholder with your actual API key:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```
   
   **Example:**
   ```env
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyBdVl-cTICSwYKrZ95SuvNw7dbMuDt1KG0
   ```

### 2.2 Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## 🧪 Step 3: Test the Integration

### 3.1 Test with Simple Map Component
1. In your browser, navigate to the test page (you'll need to add routing)
2. Or temporarily replace your main component with the test:

```tsx
// In your main App.tsx or wherever you want to test
import { MapTest } from './components/MapTest';

function App() {
  return <MapTest />;
}
```

### 3.2 What to Expect
- ✅ **Success**: You should see an interactive Google Map centered on DIT University
- ❌ **Failure**: You'll see error messages with troubleshooting info

## 🏛️ Step 4: View Your Location (DIT University)

The map is now configured for:
- **Location**: DIT University, Dehradun
- **Coordinates**: 30.2827°N, 78.0289°E
- **Zoom Level**: 13 (good for campus view)

### Safety Zones Around DIT University:
1. **🟢 DIT University Campus** - Safe Zone
2. **🟢 Forest Research Institute** - Tourist Attraction  
3. **🟢 Dehradun City Center** - Safe Commercial Area
4. **🟢 Rajpur Road Tourist Area** - Hotel/Restaurant Zone
5. **🟡 Paltan Bazaar** - Moderate Risk Market
6. **🟡 Railway Station Area** - Moderate Risk Transit
7. **🟡 SIDCUL Industrial Area** - Industrial Zone
8. **🟡 Mussoorie Road Hills** - Moderate Risk (Weather)
9. **🔴 Construction Zone - Bypass Road** - Dangerous (Active Construction)

## 🔍 Step 5: Troubleshooting

### Common Issues & Solutions:

#### Issue: "Loading Google Maps..." stuck forever
**Solutions:**
1. Check if API key is correctly set in `.env`
2. Verify "Maps JavaScript API" is enabled in Google Cloud Console
3. Check browser console for errors
4. Ensure you restarted the dev server after updating `.env`

#### Issue: "Google Maps Failed to Load" error
**Solutions:**
1. Verify API key is valid (copy-paste carefully)
2. Check if billing is enabled in Google Cloud Console
3. Remove domain restrictions temporarily for testing
4. Ensure no extra spaces in the API key

#### Issue: Map shows but is gray/blank
**Solutions:**
1. Check if coordinates are valid (30.2827, 78.0289)
2. Verify API key has Maps JavaScript API enabled
3. Check browser console for JavaScript errors

#### Issue: "RefError: google is not defined"
**Solutions:**
1. Ensure Google Maps script is loaded before component renders
2. Check network connection
3. Verify API key is not blocked by domain restrictions

### Debug Information:
Open browser Developer Tools (F12) and check:
1. **Console tab**: Look for error messages
2. **Network tab**: Check if Google Maps API requests are successful
3. **Application tab**: Verify environment variables are loaded

## 🎯 Step 6: Use the Full Components

Once the basic map test works, you can use the full components:

### 6.1 Safety Heat Map
```tsx
import { SafetyHeatMap } from './components/SafetyHeatMap';

function App() {
  return <SafetyHeatMap />;
}
```

### 6.2 AI Monitoring Dashboard
```tsx
import { AIMonitoringDashboard } from './components/AIMonitoringDashboard';

function App() {
  return <AIMonitoringDashboard />;
}
```

## 💰 Billing Information

- Google Maps provides **$200 free credits per month**
- Most development and small-scale usage is free
- Monitor usage in Google Cloud Console
- Set up billing alerts to avoid unexpected charges

## 🔐 Security Best Practices

1. **Never commit API keys to version control**
2. **Always use environment variables**
3. **Set up API key restrictions**
4. **Monitor API usage regularly**
5. **Regenerate keys periodically**

## 📞 Need Help?

If you're still having issues:
1. Check the browser console for specific error messages
2. Verify all steps above are completed
3. Try creating a fresh API key
4. Test with a minimal example first
5. Ensure your `.env` file is not committed to git

## 🎉 Success Indicators

You'll know everything is working when you see:
1. Interactive map centered on DIT University
2. Colored safety zones around Dehradun
3. Tourist markers on the map
4. Clickable zones with detailed information
5. No errors in the browser console

**Coordinates for DIT University:** 30.2827°N, 78.0289°E
**Map will show:** Dehradun city with safety zones for tourist monitoring
