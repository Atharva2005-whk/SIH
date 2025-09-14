const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP, and PDF files are allowed.`), false);
    }
  }
});

// Mock database
let tourists = [];
let sessions = new Map();
let documents = [];
let incidents = [];

// Demo data
const demoUsers = {
  'demo@tourist.com': {
    id: 1,
    name: 'Demo Tourist',
    email: 'demo@tourist.com',
    role: 'tourist',
    nationality: 'Indian',
    passportNumber: 'A1234567',
    phone: '+91-9876543210',
    isVerified: true,
    emergencyContact: 'John Doe (+91-9876543211)'
  },
  'admin@safeguard.gov': {
    id: 2,
    name: 'Safety Officer',
    email: 'admin@safeguard.gov',
    role: 'authority',
    department: 'security',
    badge: 'SF001',
    isVerified: true,
    permissions: ['manage_tourists', 'verify_documents', 'handle_incidents']
  }
};

// Utility functions
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function createApiResponse(success, data = null, message = '', error = null) {
  return {
    success,
    data,
    message,
    error,
    timestamp: new Date().toISOString()
  };
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
  if (Object.keys(req.body).length > 0) {
    console.log('📝 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// ==================== HEALTH & INFO ENDPOINTS ====================

app.get('/', (req, res) => {
  res.json(createApiResponse(true, {
    name: 'SafeGuard Tourist API',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'GET /api/health - Health check',
      'POST /api/auth/tourist/login - Tourist login',
      'POST /api/auth/authority/login - Authority login',
      'GET /api/auth/verify - Verify session',
      'POST /api/auth/logout - Logout',
      'POST /api/tourists/register - Register tourist',
      'POST /api/documents/upload - Upload documents',
      'POST /api/incidents/report - Report incident'
    ]
  }, 'SafeGuard Tourist API is running'));
});

app.get('/api/health', (req, res) => {
  res.json(createApiResponse(true, {
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  }, 'API is healthy'));
});

// ==================== AUTHENTICATION ENDPOINTS ====================

app.post('/api/auth/tourist/login', async (req, res) => {
  try {
    const { identifier, password, nationality } = req.body;
    
    console.log('🔐 Tourist login attempt:', { identifier, nationality });
    
    if (!identifier) {
      return res.status(400).json(createApiResponse(false, null, '', 'Email or passport number required'));
    }
    
    // Check demo users or use identifier as demo
    let user = demoUsers[identifier] || demoUsers['demo@tourist.com'];
    
    if (!user || user.role !== 'tourist') {
      // Create demo user on the fly
      user = {
        id: Date.now(),
        name: identifier.includes('@') ? identifier.split('@')[0] : 'Tourist User',
        email: identifier.includes('@') ? identifier : `${identifier}@demo.com`,
        role: 'tourist',
        nationality: nationality || 'International',
        passportNumber: identifier.includes('@') ? `P${Date.now()}` : identifier,
        phone: '+91-9876543210',
        isVerified: true,
        emergencyContact: 'Emergency Contact (+91-9876543211)'
      };
    }
    
    // Generate session
    const sessionId = generateSessionId();
    const sessionData = {
      id: sessionId,
      userId: user.id,
      userRole: user.role,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      lastActivityAt: new Date()
    };
    
    sessions.set(sessionId, sessionData);
    
    const response = createApiResponse(true, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        nationality: user.nationality,
        isVerified: user.isVerified
      },
      session: sessionData
    }, 'Login successful');
    
    console.log('✅ Tourist login successful:', user.name);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Tourist login error:', error);
    res.status(500).json(createApiResponse(false, null, '', 'Login failed: ' + error.message));
  }
});

app.post('/api/auth/authority/login', async (req, res) => {
  try {
    const { email, password, department, badge } = req.body;
    
    console.log('🔐 Authority login attempt:', { email, department });
    
    if (!email || !department) {
      return res.status(400).json(createApiResponse(false, null, '', 'Email and department required'));
    }
    
    // Check demo users or create demo authority
    let user = demoUsers[email] || demoUsers['admin@safeguard.gov'];
    
    if (!user || user.role !== 'authority') {
      // Create demo authority on the fly
      user = {
        id: Date.now(),
        name: email.split('@')[0] || 'Authority User',
        email: email,
        role: 'authority',
        department: department,
        badge: badge || `BADGE${Date.now()}`,
        isVerified: true,
        permissions: ['manage_tourists', 'verify_documents', 'handle_incidents']
      };
    }
    
    // Generate session
    const sessionId = generateSessionId();
    const sessionData = {
      id: sessionId,
      userId: user.id,
      userRole: user.role,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      lastActivityAt: new Date()
    };
    
    sessions.set(sessionId, sessionData);
    
    const response = createApiResponse(true, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        badge: user.badge,
        isVerified: user.isVerified,
        permissions: user.permissions
      },
      session: sessionData
    }, 'Authority login successful');
    
    console.log('✅ Authority login successful:', user.name);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Authority login error:', error);
    res.status(500).json(createApiResponse(false, null, '', 'Login failed: ' + error.message));
  }
});

app.get('/api/auth/verify', (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(401).json(createApiResponse(false, null, '', 'Session ID required'));
    }
    
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(401).json(createApiResponse(false, null, '', 'Invalid session'));
    }
    
    if (new Date() > session.expiresAt) {
      sessions.delete(sessionId);
      return res.status(401).json(createApiResponse(false, null, '', 'Session expired'));
    }
    
    // Update last activity
    session.lastActivityAt = new Date();
    sessions.set(sessionId, session);
    
    // Find user data (mock)
    const user = session.userRole === 'tourist' ? demoUsers['demo@tourist.com'] : demoUsers['admin@safeguard.gov'];
    
    res.json(createApiResponse(true, {
      user: {
        id: session.userId,
        name: user?.name || 'Demo User',
        email: user?.email || 'demo@example.com',
        role: session.userRole,
        isVerified: true
      },
      session: session
    }, 'Session valid'));
    
  } catch (error) {
    console.error('❌ Session verification error:', error);
    res.status(500).json(createApiResponse(false, null, '', 'Session verification failed'));
  }
});

app.post('/api/auth/logout', (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (sessionId && sessions.has(sessionId)) {
      sessions.delete(sessionId);
      console.log('✅ Logout successful');
    }
    
    res.json(createApiResponse(true, null, 'Logged out successfully'));
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json(createApiResponse(false, null, '', 'Logout failed'));
  }
});

// ==================== TOURIST MANAGEMENT ====================

app.post('/api/tourists/register', upload.any(), async (req, res) => {
  try {
    console.log('👤 Tourist registration request');
    console.log('Body:', req.body);
    console.log('Files:', req.files?.map(f => ({ fieldname: f.fieldname, originalname: f.originalname, size: f.size })));
    
    let touristData;
    try {
      touristData = typeof req.body.tourist === 'string' ? JSON.parse(req.body.tourist) : req.body;
    } catch (e) {
      touristData = req.body;
    }
    
    if (!touristData.name || !touristData.nationality) {
      return res.status(400).json(createApiResponse(false, null, '', 'Name and nationality are required'));
    }
    
    // Create tourist record
    const tourist = {
      id: Date.now(),
      name: touristData.name,
      nationality: touristData.nationality,
      passportNumber: touristData.passportNumber || `P${Date.now()}`,
      emergencyContact: touristData.emergencyContact || '',
      medicalInfo: touristData.medicalInfo || '',
      isVerified: false,
      registrationDate: new Date(),
      documents: []
    };
    
    // Process uploaded documents
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const document = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          touristId: tourist.id,
          type: file.fieldname.includes('aadhar') ? 'aadhar' : 
                file.fieldname.includes('visa') ? 'visa' : 
                file.fieldname.includes('passport') ? 'passport' : 'other',
          originalName: file.originalname,
          fileName: file.filename,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date(),
          status: 'pending'
        };
        
        documents.push(document);
        tourist.documents.push(document.id);
      });
    }
    
    tourists.push(tourist);
    
    console.log('✅ Tourist registered successfully:', tourist.name);
    
    res.json(createApiResponse(true, {
      tourist: tourist,
      touristId: tourist.id
    }, 'Registration successful'));
    
  } catch (error) {
    console.error('❌ Tourist registration error:', error);
    res.status(500).json(createApiResponse(false, null, '', 'Registration failed: ' + error.message));
  }
});

// ==================== DOCUMENT MANAGEMENT ====================

app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('📄 Document upload request');
    console.log('Body:', req.body);
    console.log('File:', req.file ? { originalname: req.file.originalname, size: req.file.size } : 'No file');
    
    if (!req.file) {
      return res.status(400).json(createApiResponse(false, null, '', 'No file uploaded'));
    }
    
    const document = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: req.body.type || 'other',
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
      status: 'pending',
      ipfsHash: `QmTest${Date.now()}` // Mock IPFS hash
    };
    
    documents.push(document);
    
    console.log('✅ Document uploaded successfully:', document.originalName);
    
    res.json(createApiResponse(true, {
      documentId: document.id,
      ipfsHash: document.ipfsHash
    }, 'Document uploaded successfully'));
    
  } catch (error) {
    console.error('❌ Document upload error:', error);
    res.status(500).json(createApiResponse(false, null, '', 'Document upload failed: ' + error.message));
  }
});

app.get('/api/documents/:documentId/status', (req, res) => {
  try {
    const { documentId } = req.params;
    const document = documents.find(d => d.id === documentId);
    
    if (!document) {
      return res.status(404).json(createApiResponse(false, null, '', 'Document not found'));
    }
    
    res.json(createApiResponse(true, {
      id: document.id,
      type: document.type,
      status: document.status,
      uploadedAt: document.uploadedAt,
      verifiedAt: document.verifiedAt || null,
      rejectionReason: document.rejectionReason || null
    }, 'Document status retrieved'));
    
  } catch (error) {
    console.error('❌ Document status error:', error);
    res.status(500).json(createApiResponse(false, null, '', 'Failed to get document status'));
  }
});

// ==================== INCIDENT REPORTING ====================

app.post('/api/incidents/report', upload.array('evidence', 5), async (req, res) => {
  try {
    console.log('🚨 Incident report request');
    console.log('Body:', req.body);
    
    const incident = {
      id: `incident_${Date.now()}`,
      type: req.body.type || 'general',
      description: req.body.description || '',
      location: JSON.parse(req.body.location || '{"latitude": 0, "longitude": 0}'),
      severity: req.body.severity || 'medium',
      reportedAt: new Date(),
      status: 'reported',
      evidence: []
    };
    
    // Process evidence files
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        incident.evidence.push({
          id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          originalName: file.originalname,
          fileName: file.filename,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype
        });
      });
    }
    
    incidents.push(incident);
    
    console.log('✅ Incident reported successfully:', incident.id);
    
    res.json(createApiResponse(true, {
      incidentId: incident.id
    }, 'Incident reported successfully'));
    
  } catch (error) {
    console.error('❌ Incident report error:', error);
    res.status(500).json(createApiResponse(false, null, '', 'Incident report failed: ' + error.message));
  }
});

app.get('/api/incidents/nearby', (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    
    // Mock nearby incidents
    const nearbyIncidents = incidents.slice(-5).map(incident => ({
      id: incident.id,
      type: incident.type,
      description: incident.description,
      location: incident.location,
      severity: incident.severity,
      reportedAt: incident.reportedAt,
      status: incident.status
    }));
    
    res.json(createApiResponse(true, nearbyIncidents, 'Nearby incidents retrieved'));
    
  } catch (error) {
    console.error('❌ Nearby incidents error:', error);
    res.status(500).json(createApiResponse(false, null, '', 'Failed to get nearby incidents'));
  }
});

// ==================== GEOFENCING & SAFETY ====================

app.get('/api/geofencing/zones', (req, res) => {
  try {
    const safetyZones = [
      {
        id: 'zone_1',
        name: 'Tourist District',
        center: { latitude: 28.6139, longitude: 77.2090 },
        radius: 2000,
        type: 'safe',
        description: 'Main tourist area with high security'
      },
      {
        id: 'zone_2',
        name: 'Airport Zone',
        center: { latitude: 28.5562, longitude: 77.1000 },
        radius: 5000,
        type: 'safe',
        description: 'Airport and surrounding secure area'
      },
      {
        id: 'zone_3',
        name: 'Construction Area',
        center: { latitude: 28.7041, longitude: 77.1025 },
        radius: 1000,
        type: 'warning',
        description: 'Construction zone - exercise caution'
      }
    ];
    
    res.json(createApiResponse(true, safetyZones, 'Safety zones retrieved'));
    
  } catch (error) {
    console.error('❌ Safety zones error:', error);
    res.status(500).json(createApiResponse(false, null, '', 'Failed to get safety zones'));
  }
});

app.get('/api/geofencing/check', (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    // Mock safety check
    const safetyCheck = {
      inZone: true,
      zone: {
        id: 'zone_1',
        name: 'Tourist District',
        type: 'safe',
        description: 'You are in a safe tourist area'
      },
      alerts: [
        {
          type: 'info',
          message: 'Welcome to the tourist district! Enjoy your stay.',
          severity: 'info'
        }
      ]
    };
    
    res.json(createApiResponse(true, safetyCheck, 'Location safety check completed'));
    
  } catch (error) {
    console.error('❌ Location safety check error:', error);
    res.status(500).json(createApiResponse(false, null, '', 'Failed to check location safety'));
  }
});

// ==================== ADMIN/DEBUG ENDPOINTS ====================

app.get('/api/debug/data', (req, res) => {
  res.json(createApiResponse(true, {
    tourists: tourists.length,
    documents: documents.length,
    incidents: incidents.length,
    activeSessions: sessions.size,
    recentTourists: tourists.slice(-3),
    recentDocuments: documents.slice(-3),
    recentIncidents: incidents.slice(-3)
  }, 'Debug data retrieved'));
});

// ==================== ERROR HANDLING ====================

// File upload error handling
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('❌ Multer error:', error.message);
    return res.status(400).json(createApiResponse(false, null, '', `File upload error: ${error.message}`));
  }
  
  if (error.message.includes('Invalid file type')) {
    console.error('❌ File type error:', error.message);
    return res.status(400).json(createApiResponse(false, null, '', error.message));
  }
  
  console.error('❌ Unhandled error:', error);
  res.status(500).json(createApiResponse(false, null, '', 'Internal server error'));
});

// 404 handler
app.use((req, res) => {
  console.log('❓ 404 - Endpoint not found:', req.method, req.path);
  res.status(404).json(createApiResponse(false, null, '', `Endpoint not found: ${req.method} ${req.path}`));
});

// ==================== SERVER STARTUP ====================

const server = app.listen(port, () => {
  console.log('');
  console.log('🚀 ===================================');
  console.log('🛡️  SafeGuard Tourist API Server');
  console.log('🚀 ===================================');
  console.log('');
  console.log(`✅ Server running on: http://localhost:${port}`);
  console.log(`🌐 Health check: http://localhost:${port}/api/health`);
  console.log(`📖 API Info: http://localhost:${port}/`);
  console.log('');
  console.log('📡 Available endpoints:');
  console.log('   🔐 POST /api/auth/tourist/login');
  console.log('   🔐 POST /api/auth/authority/login');
  console.log('   ✅ GET  /api/auth/verify');
  console.log('   👋 POST /api/auth/logout');
  console.log('   👤 POST /api/tourists/register');
  console.log('   📄 POST /api/documents/upload');
  console.log('   🚨 POST /api/incidents/report');
  console.log('   🗺️  GET  /api/geofencing/zones');
  console.log('   🔍 GET  /api/geofencing/check');
  console.log('');
  console.log('🎯 Demo credentials:');
  console.log('   Tourist: demo@tourist.com');
  console.log('   Admin: admin@safeguard.gov');
  console.log('');
  console.log('🚀 Ready for hackathon demo!');
  console.log('🚀 ===================================');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;
