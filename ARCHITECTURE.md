# Smart Tourist Safety System - Architecture Overview

## 🏗️ Architecture Overview

This project follows a **monorepo architecture** with clear separation between frontend, backend, blockchain components, and shared utilities.

```
SIH/
├── 📁 backend/          # Express.js API Server
├── 📁 client/           # React Frontend Application  
├── 📁 blockchain/       # Blockchain development tools
├── 📁 contracts/        # Solidity Smart Contracts
├── 📁 shared/           # Shared Types & Utilities
├── 📁 scripts/          # Deployment & Utility Scripts
├── 📄 package.json      # Monorepo Configuration
└── 📄 hardhat.config.js # Blockchain Configuration
```

## 🔄 Service Communication

### Development Ports
- **Frontend (Vite Dev Server)**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`
- **Blockchain Node**: `http://localhost:8545`

### Communication Flow
```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐    Web3/RPC     ┌──────────────────┐
│   React Client  │ ──────────────► │   Express API   │ ───────────────► │  Blockchain Node │
│   (Port 5173)   │                 │   (Port 3000)   │                  │   (Port 8545)    │
└─────────────────┘                 └─────────────────┘                  └──────────────────┘
```

## 📁 Component Responsibilities

### 🎨 Frontend (`/client`)
**Technology**: React 18 + TypeScript + Vite
- **User Interface**: Tourist dashboard, safety alerts, incident reporting
- **State Management**: TanStack Query for server state
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS + Radix UI components
- **API Integration**: Axios calls to backend REST API
- **Blockchain**: Direct Web3 interactions through ethers.js

**Key Features**:
- 📱 Responsive design for mobile tourists
- 🗺️ Google Maps integration for geofencing
- 🔔 Real-time safety notifications
- 📊 Analytics dashboard
- 🔐 Digital ID management

### ⚙️ Backend (`/backend`)
**Technology**: Express.js + TypeScript + Node.js
- **API Endpoints**: RESTful services for frontend consumption
- **Authentication**: JWT-based user authentication
- **File Handling**: Multer for incident photo/document uploads
- **Blockchain Integration**: Smart contract interactions via ethers.js
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Morgan for request logging

**Key Features**:
- 🔒 User authentication & authorization
- 📸 File upload handling (incidents, documents)
- 🔗 Smart contract deployment & interaction
- 📡 Real-time incident broadcasting
- 📊 Data aggregation for analytics

### ⛓️ Blockchain (`/blockchain` + `/contracts`)
**Technology**: Hardhat + Solidity + OpenZeppelin
- **Smart Contracts**: Tourist Digital ID, Geofencing Safety
- **Network Support**: Polygon, Ethereum, Local development
- **Security**: OpenZeppelin standard contracts
- **Testing**: Comprehensive contract testing

**Key Features**:
- 🆔 Immutable digital tourist identities
- 🛡️ Decentralized incident reporting
- 🌍 Cross-border identity verification
- 📜 Smart contract-based safety protocols

### 🔧 Shared (`/shared`)
**Technology**: TypeScript
- **Type Definitions**: Shared interfaces and types
- **Utilities**: Common functions used by both frontend and backend
- **Constants**: Application-wide constants

## 🚀 Development Workflow

### Starting All Services
```bash
# Start all services concurrently
npm run dev

# This runs:
# ├── Blockchain node (hardhat node)
# ├── Backend API (Express server)  
# └── Frontend app (Vite dev server)
```

### Individual Services
```bash
# Backend only
npm run dev:backend

# Frontend only  
npm run dev:client

# Blockchain only
npm run dev:blockchain
```

### Production Build
```bash
# Build all components
npm run build

# Individual builds
npm run build:backend
npm run build:client
```

## 🔧 Environment Configuration

### Backend Environment (`.env`)
```env
PORT=3000
NODE_ENV=development
RPC_URL=http://127.0.0.1:8545
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-secret-here
```

### Frontend Environment (`.env`)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_MAPS_API_KEY=your-key-here
VITE_ENABLE_BLOCKCHAIN=true
```

## 🔗 API Integration

### Frontend to Backend Communication
```typescript
// Frontend API service
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Example API calls
await apiClient.post('/api/auth/login', credentials);
await apiClient.get('/api/incidents');
await apiClient.post('/api/incidents', incidentData);
```

### Backend to Blockchain Communication
```javascript
// Smart contract interaction
const contract = new ethers.Contract(address, abi, provider);
const tx = await contract.createDigitalID(userData);
await tx.wait();
```

## 🛡️ Security Measures

### Frontend Security
- Environment variables for sensitive data
- HTTPS enforcement in production
- Input validation and sanitization
- XSS protection through React

### Backend Security
- Helmet.js for HTTP security headers
- CORS configured for specific origins
- JWT authentication
- Rate limiting
- File upload restrictions

### Blockchain Security
- OpenZeppelin audited contracts
- Multi-signature wallet support
- Gas optimization
- Reentrancy protection

## 📈 Deployment Strategy

### Development
- Local blockchain node
- Hot reload for frontend and backend
- Concurrent service management

### Production
- Frontend: Static hosting (Netlify, Vercel)
- Backend: Cloud hosting (AWS, Google Cloud)
- Blockchain: Polygon mainnet
- Database: PostgreSQL/MongoDB
- CDN: CloudFront/Cloudflare

## 🧪 Testing Strategy

### Frontend Testing
```bash
npm run test --workspace=client
```
- Component testing with Vitest
- Integration testing
- E2E testing with Playwright

### Backend Testing
```bash
npm run test --workspace=backend
```
- API endpoint testing with Jest
- Smart contract integration tests
- Database testing

### Smart Contract Testing
```bash
npm run test:contracts
```
- Hardhat testing framework
- Gas optimization tests
- Security vulnerability tests

## 📚 Key Benefits of This Architecture

1. **🔄 Clear Separation of Concerns**
   - Frontend handles UI/UX
   - Backend manages business logic and API
   - Blockchain ensures data integrity

2. **🧩 Independent Development**
   - Teams can work on different components simultaneously
   - Individual testing and deployment

3. **📈 Scalability**
   - Each component can scale independently
   - Microservices-ready architecture

4. **🔧 Maintainability**
   - Shared types prevent interface mismatches
   - Consistent development patterns

5. **🚀 Modern Tech Stack**
   - Latest React and TypeScript features
   - Fast development with Vite
   - Production-ready Express.js backend

## 🤝 Contributing

When contributing to this project:
1. Keep frontend and backend changes in separate commits
2. Update shared types when changing interfaces
3. Test all components before submitting PRs
4. Follow the existing code style and patterns
