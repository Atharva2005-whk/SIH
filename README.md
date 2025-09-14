# Smart Tourist Safety Monitoring & Incident Response System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.19.0-yellow)](https://hardhat.org/)

A comprehensive, **optimized monorepo** blockchain-based system for monitoring tourist safety, managing digital identities, and responding to incidents using AI, Geo-Fencing, and Blockchain technology.

## 🎯 **Recent Optimizations**

✅ **Monorepo Architecture** - Unified workspace with shared dependencies  
✅ **TypeScript Integration** - Full type safety across all components  
✅ **Optimized Dependencies** - Eliminated duplicates and updated versions  
✅ **Shared Service Layer** - Reusable blockchain service for frontend and backend  
✅ **Standardized Configuration** - Consistent ESLint, Prettier, and TypeScript configs  
✅ **Automated Scripts** - Cross-platform deployment and management scripts  
✅ **Docker Support** - Containerized development and production environments

## 🏗️ System Architecture

### Core Components

1. **TouristDigitalID Smart Contract** - Manages tourist digital identities and incident reporting
2. **GeoFencingSafety Smart Contract** - Handles geo-fencing, location tracking, and safety alerts
3. **Blockchain Service API** - RESTful API for blockchain interactions
4. **Real-time Monitoring** - Location tracking and safety zone management

### Key Features

- ✅ **Digital Identity Management** - Secure tourist registration and verification
- ✅ **Incident Reporting** - Blockchain-based incident tracking with evidence
- ✅ **Geo-Fencing** - Real-time location monitoring with safety zones
- ✅ **Emergency Response** - Automated alert system with response tracking
- ✅ **Safety Checkpoints** - Authority-managed safety verification points
- ✅ **Evidence Management** - IPFS-based evidence storage with blockchain verification

## 🚀 **Quick Start**

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Make** (optional) - For using Makefile commands

### 💫 **One-Command Setup** (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd smart-tourist-safety-system

# 🚀 Start everything with one command!
make start
# OR use npm directly: npm run dev
```

That's it! The system will:
- Install all dependencies
- Build shared modules
- Compile smart contracts
- Start local blockchain
- Deploy contracts
- Start backend API
- Start frontend development server

### 🔧 **Manual Setup** (Step by Step)

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd smart-tourist-safety-system
   cp .env.example .env  # Edit with your configuration
   ```

2. **Install dependencies**
   ```bash
   npm install  # Installs for all workspaces
   ```

3. **Build shared components**
   ```bash
   npm run build --workspace=shared
   ```

4. **Start development (choose one)**

   **Option A: Using Scripts (Recommended)**
   ```bash
   # Windows
   .\scripts\deploy-dev.ps1
   
   # Linux/Mac
   ./scripts/deploy-dev.sh
   ```

   **Option B: Using Makefile**
   ```bash
   make dev
   ```

   **Option C: Manual**
   ```bash
   # Terminal 1: Start blockchain
   npm run node
   
   # Terminal 2: Deploy contracts
   npm run deploy:local
   
   # Terminal 3: Start backend
   npm run dev --workspace=backend
   
   # Terminal 4: Start frontend
   npm run dev --workspace=client
   ```

## 📋 Smart Contracts

### TouristDigitalID Contract

**Purpose**: Manages tourist digital identities and incident reporting

**Key Functions**:
- `registerTourist()` - Register new tourists with identity information
- `verifyTourist()` - Verify tourist identity by authorized authorities
- `reportIncident()` - Report incidents with evidence and location data
- `resolveIncident()` - Mark incidents as resolved
- `addSafetyCheckpoint()` - Add safety verification checkpoints

**Events**:
- `TouristRegistered` - Emitted when a new tourist is registered
- `TouristVerified` - Emitted when tourist verification status changes
- `IncidentReported` - Emitted when an incident is reported
- `IncidentResolved` - Emitted when an incident is resolved

### GeoFencingSafety Contract

**Purpose**: Handles geo-fencing, location tracking, and safety alerts

**Key Functions**:
- `createGeoFenceZone()` - Create safety zones with different risk levels
- `updateTouristLocation()` - Update tourist location and check zone compliance
- `triggerSafetyAlert()` - Trigger safety alerts for various situations
- `dispatchEmergencyResponse()` - Dispatch emergency services
- `acknowledgeAlert()` - Acknowledge received alerts
- `resolveAlert()` - Mark alerts as resolved

**Events**:
- `GeoFenceZoneCreated` - Emitted when a new safety zone is created
- `LocationUpdated` - Emitted when tourist location is updated
- `SafetyAlertTriggered` - Emitted when a safety alert is triggered
- `EmergencyResponseDispatched` - Emitted when emergency response is dispatched

## 🔧 API Endpoints

### Tourist Management

- `POST /api/tourists` - Register a new tourist
- `GET /api/tourists/:id` - Get tourist profile
- `PUT /api/tourists/:id/verify` - Verify tourist identity
- `PUT /api/tourists/:id/location` - Update tourist location

### Incident Reporting

- `POST /api/incidents` - Report an incident
- `PUT /api/incidents/:id/resolve` - Resolve an incident

### Geo-Fencing

- `POST /api/zones` - Create a geo-fence zone

### Safety Alerts

- `POST /api/alerts` - Trigger a safety alert
- `POST /api/alerts/:id/response` - Dispatch emergency response

### System

- `GET /api/status` - Get system status
- `GET /api/health` - Health check

## 📊 Usage Examples

### Register a Tourist

```javascript
const response = await fetch('/api/tourists', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    passportNumber: 'P123456789',
    nationality: 'USA',
    emergencyContact: '+1-555-0123',
    medicalInfo: 'No known allergies'
  })
});

const result = await response.json();
console.log('Tourist ID:', result.touristId);
```

### Report an Incident

```javascript
const response = await fetch('/api/incidents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    touristId: 1,
    incidentType: 'theft',
    description: 'Wallet stolen at tourist site',
    location: 'Central Park, New York',
    severity: 'medium',
    evidenceHashes: ['QmHash1', 'QmHash2']
  })
});
```

### Create Safety Zone

```javascript
const response = await fetch('/api/zones', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Tourist Safe Zone',
    description: 'Main tourist area with high security',
    centerLatitude: 40.7589,
    centerLongitude: -73.9851,
    radius: 1000,
    zoneType: 'safe'
  })
});
```

### Trigger Safety Alert

```javascript
const response = await fetch('/api/alerts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    touristId: 1,
    alertType: 'emergency',
    message: 'Tourist needs immediate assistance',
    location: 'Central Park, New York',
    severity: 'high'
  })
});
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Files
```bash
npx hardhat test test/TouristDigitalID.test.js
npx hardhat test test/GeoFencingSafety.test.js
```

### Test Coverage
```bash
npx hardhat coverage
```

## 🚀 Deployment

### Local Development
```bash
# Start local blockchain
npm run node

# Deploy contracts
npm run deploy:local
```

### Testnet Deployment (Sepolia)
```bash
npm run deploy -- --network sepolia
```

### Mainnet Deployment
```bash
npm run deploy -- --network polygon
```

## 🔐 Security Features

- **Access Control**: Role-based permissions for authorities and responders
- **Data Integrity**: All data stored on blockchain with cryptographic verification
- **Evidence Management**: IPFS-based evidence storage with blockchain verification
- **Privacy Protection**: Sensitive data encryption and secure key management
- **Audit Trail**: Complete transaction history for compliance and investigation

## 🌐 Network Support

- **Local Development**: Hardhat Network
- **Testnets**: Sepolia, Mumbai
- **Mainnets**: Ethereum, Polygon

## 📈 Monitoring & Analytics

- Real-time location tracking
- Incident trend analysis
- Response time metrics
- Safety zone effectiveness
- Tourist flow patterns

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- AI-powered risk assessment
- Mobile app integration
- Real-time notifications
- Multi-language support
- Advanced analytics dashboard
- Integration with emergency services
- IoT device integration
- Machine learning for predictive safety

---

**Built with ❤️ for tourist safety and security**

