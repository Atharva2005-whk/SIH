# SafeSphere - Team Setup Guide

This guide will help team members set up and run the SafeSphere Tourist Safety Platform locally on their computers.

## 🚀 Quick Start

### Prerequisites
Before starting, make sure you have:
- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- A code editor like **VS Code** (recommended)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Atharva2005-whk/SIH.git
cd SIH
```

### Step 2: Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..

# Install shared dependencies
cd shared
npm install
cd ..
```

### Step 3: Environment Setup
Create environment files:

**For the client (.env in client folder):**
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

**For the backend (.env in backend folder):**
```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_session_secret_here
```

### Step 4: Run the Application

#### Option A: Run Everything at Once (Recommended)
```bash
# From the root SIH directory
npm run dev
```

#### Option B: Run Components Separately
```bash
# Terminal 1: Start the backend
cd backend
npm run dev

# Terminal 2: Start the frontend
cd client
npm run dev
```

### Step 5: Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 🌐 Application URLs and Features

### Main Access Points
- **Home Page**: http://localhost:5173/
- **Tourist Login**: http://localhost:5173/tourist-auth
- **Admin Portal**: http://localhost:5173/admin-portal

### Demo Accounts

#### Tourist Login
- **Indian Tourist**: Use email `indian.tourist@example.com` or click "Indian Tourist" demo button
- **Foreign Tourist**: Use email `foreign.tourist@example.com` or click "Foreign Tourist" demo button
- **Password**: `demo123` (or use demo buttons for auto-fill)

#### Admin Login
- **Email**: `admin@safesphere.gov`
- **Password**: `admin123`
- Or click "Use Demo Admin Account" button

## 🎯 Key Features to Test

### For Tourists (User Dashboard)
1. **Document Upload**: 
   - Indians: Upload Aadhar Card
   - Foreigners: Upload Passport and Visa
2. **Location Tracking**: Real-time GPS tracking
3. **Safety Map**: Interactive safety zones
4. **Emergency SOS**: Panic button functionality
5. **AI Assistant**: Get safety recommendations
6. **Rewards System**: Gamified safety features

### For Admins (Admin Dashboard)
1. **Tourist Management**: View and verify tourists
2. **Document Verification**: Approve/reject documents
3. **Location Monitoring**: Track tourist locations
4. **Incident Management**: Handle safety incidents
5. **System Settings**: Configure platform settings

## 🛠️ Development Scripts

```bash
# Start development servers
npm run dev

# Start only frontend
npm run client

# Start only backend
npm run server

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

## 📁 Project Structure

```
SIH/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── contexts/       # React contexts
│   └── package.json
├── backend/                # Node.js API server
│   ├── api.cjs            # Main API server
│   ├── auth-service.cjs   # Authentication logic
│   └── package.json
├── shared/                 # Common TypeScript types
├── blockchain/             # Smart contracts
├── contracts/              # Additional contracts
└── package.json           # Root package file
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use
```bash
# Kill processes on ports
npx kill-port 3000 5173
# Or use different ports in .env files
```

#### 2. Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. Git Issues
```bash
# Reset git if needed
git fetch origin
git reset --hard origin/master
```

#### 4. Permission Errors (Windows)
- Run terminal as Administrator
- Or use PowerShell with execution policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 🌍 Environment Variables Explained

### Client (.env)
- `VITE_API_BASE_URL`: Backend server URL
- `VITE_GOOGLE_MAPS_API_KEY`: For map functionality (optional for demo)

### Backend (.env)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `SESSION_SECRET`: For session encryption

## 📱 Mobile Testing
The application is responsive and works on mobile devices:
- Open http://localhost:5173 on your phone
- Make sure your phone and computer are on the same network
- Replace `localhost` with your computer's IP address

## 🚀 Production Deployment
For production deployment, see:
- `DEPLOYMENT.md` - Detailed deployment guide
- `docker-compose.yml` - Docker containerization
- `Makefile` - Build automation

## 📞 Support
If you encounter issues:
1. Check this guide first
2. Look at error messages in browser console
3. Check terminal outputs
4. Contact the team lead

## 🎨 Key Technologies Used
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, CommonJS
- **Database**: JSON files (development), MongoDB (production)
- **Maps**: Google Maps API (or fallback mock data)
- **Blockchain**: Hardhat, Solidity
- **Authentication**: Session-based auth

---

Happy coding! 🎉 The SafeSphere platform is now ready for collaborative development.
