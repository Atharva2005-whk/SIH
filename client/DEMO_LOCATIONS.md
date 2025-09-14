# 🗺️ Demo Locations - Uttarakhand Tourist Safety System

## 📍 **Safety Zones Overview**

### 🟢 **SAFE ZONES** (7 locations)
1. **Rishikesh - Laxman Jhula Area** `(30.1089, 78.2932)`
   - Popular spiritual tourism hub with good infrastructure
   - Risks: River currents, festival crowds, spiritual scams

2. **Mussoorie - Mall Road** `(30.4598, 78.0664)`
   - Hill station shopping area with police presence
   - Risks: Steep terrain, weather changes, overcharging

3. **Nainital - Naini Lake** `(29.3803, 79.4636)`
   - Beautiful lake town with established tourism infrastructure
   - Risks: Monsoon landslides, drowning, traffic congestion

4. **Almora - Market Area** `(29.5971, 79.6590)`
   - Hill town market with local administration
   - Risks: Narrow mountain roads, limited medical facilities

5. **Lansdowne - Cantonment Area** `(29.8370, 78.6827)`
   - Military cantonment town with good security
   - Risks: Restricted military areas, limited nightlife

6. **Chakrata - Hill Station** `(30.7043, 77.8696)`
   - Quiet hill station with military presence
   - Risks: Limited medical facilities, seasonal closures

### 🟡 **MODERATE RISK ZONES** (4 locations)
7. **Haridwar - Har Ki Pauri** `(29.9457, 78.1642)`
   - Religious site with massive crowd gatherings
   - Risks: Extreme crowds, stampede risk, pickpocketing

8. **Jim Corbett National Park - Dhikala** `(29.5312, 78.7688)`
   - Wildlife sanctuary with controlled access
   - Risks: Wild animals, dense forest, limited communication

9. **Auli - Ski Resort Area** `(30.5206, 79.5590)`
   - Winter sports destination with ski facilities
   - Risks: Avalanche zones, ski accidents, extreme weather

10. **Badrinath - Temple Complex** `(30.7433, 79.4938)`
    - High-altitude pilgrimage site with seasonal access
    - Risks: Extreme altitude, weather closure, landslides

11. **Industrial Zone - Pantnagar** `(29.0330, 79.4737)`
    - Agricultural university and industrial area
    - Risks: Heavy machinery, chemical exposure

### 🔴 **DANGEROUS ZONES** (4 locations)
12. **Valley of Flowers - Govindghat** `(30.7268, 79.6093)`
    - Remote trekking area with challenging terrain
    - Risks: Altitude sickness, harsh weather, limited rescue

13. **Kedarnath - Base Camp Area** `(30.7346, 79.0669)`
    - High-altitude pilgrimage with extreme conditions
    - Risks: Flash floods, extreme cold, helicopter crashes

14. **Gangotri - Glacier Area** `(30.9991, 78.9410)`
    - Glacier source of Ganges with treacherous conditions
    - Risks: Glacier crevasses, extreme cold, rockfalls

15. **Construction Site - New Tehri Dam** `(30.3753, 78.4804)`
    - Large hydroelectric project construction zone
    - Risks: Heavy machinery, blasting, restricted access

## 👥 **Demo Tourists Distribution**

### Current Tourist Locations:
1. **John Smith** (American) → Rishikesh - **SAFE** ✅
2. **Emma Johnson** (British) → Mussoorie - **SAFE** ✅
3. **Carlos Rodriguez** (Spanish) → Haridwar - **WARNING** ⚠️
4. **Yuki Tanaka** (Japanese) → Valley of Flowers - **DANGER** 🚨
5. **Sophie Laurent** (French) → Nainital - **SAFE** ✅
6. **Raj Patel** (Indian) → Jim Corbett Park - **WARNING** ⚠️
7. **Anna Kowalski** (Polish) → Auli Ski Resort - **SAFE** ✅
8. **Michael Thompson** (Canadian) → Kedarnath - **DANGER** 🚨
9. **Lisa Chen** (Singaporean) → Lansdowne - **SAFE** ✅
10. **Ahmed Al-Rashid** (UAE) → Tehri Dam Construction - **OFFLINE** 📴

## 🎯 **Map Configuration**
- **Center Point**: `(30.0668, 79.0193)` - Central Uttarakhand
- **Zoom Level**: 8 (State-wide view)
- **Total Coverage**: Entire Uttarakhand state
- **Real Locations**: All coordinates are actual places in Uttarakhand

## 🚨 **Demo Scenarios**

### **Active Alerts:**
- **High Priority**: Tourist in Valley of Flowers (extreme altitude)
- **High Priority**: Tourist at Kedarnath (weather conditions)
- **Medium Priority**: Crowding at Haridwar religious site
- **Medium Priority**: Wildlife area at Jim Corbett
- **Critical**: Tourist offline at construction site

### **AI Detection Features:**
- Route deviation detection
- Inactivity pattern analysis
- Speed anomaly identification
- Geo-fence breach monitoring
- Communication loss alerts
- Environmental risk assessment

## 🗺️ **Usage Instructions**

1. **View Heat Map**: Navigate to `/safety-heatmap`
2. **AI Dashboard**: Navigate to `/ai-dashboard`
3. **Map Test**: Navigate to `/map-test`

### **Interactive Features:**
- Click on colored circles to see zone details
- Click on tourist markers for status information
- Toggle heat map, tourists, and safety zones
- Filter zones by risk level
- Real-time updates every 5 seconds

### **Color Coding:**
- 🟢 **Green**: Safe zones (low risk)
- 🟡 **Orange**: Moderate risk zones
- 🔴 **Red**: Dangerous zones (high risk)
- 🔵 **Tourist Markers**: Status-based coloring

## 🔧 **Technical Details**

- **Framework**: React + TypeScript
- **Maps**: Google Maps JavaScript API
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Real-time**: Mock data with 5-second intervals
- **Responsive**: Works on desktop and mobile

All locations are real places in Uttarakhand with realistic risk assessments for tourism safety monitoring!
