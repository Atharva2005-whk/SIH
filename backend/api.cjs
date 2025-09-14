const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const BlockchainService = require('./blockchain-service.cjs');
const AuthService = require('./auth-service.cjs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const blockchainService = new BlockchainService();
const authService = new AuthService();

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.'));
    }
  }
});

// Initialize blockchain service on startup
async function initializeBlockchain() {
  try {
    // Skip blockchain initialization if no valid private key provided
    if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      console.warn('Warning: Blockchain service skipped - no valid private key provided');
      console.log('API will run in mock mode without blockchain functionality');
      return;
    }

    const deploymentInfo = require('../deployment-info.json');
    
    await blockchainService.initialize(
      process.env.RPC_URL || 'http://127.0.0.1:8545',
      process.env.PRIVATE_KEY,
      deploymentInfo.contracts
    );
    
    console.log('Blockchain service initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize blockchain service:', error.message);
    console.log('API will run in mock mode without blockchain functionality');
  }
}

// ==================== AUTHENTICATION ENDPOINTS ====================

/**
 * Tourist login
 * POST /api/auth/tourist/login
 */
app.post('/api/auth/tourist/login', async (req, res) => {
  try {
    const { identifier, password, nationality } = req.body;
    
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: identifier, password'
      });
    }
    
    const result = await authService.authenticateTourist({
      identifier,
      password,
      nationality
    });
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Error in tourist login:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Authority login
 * POST /api/auth/authority/login
 */
app.post('/api/auth/authority/login', async (req, res) => {
  try {
    const { email, password, department, badge } = req.body;
    
    if (!email || !password || !department) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, department'
      });
    }
    
    const result = await authService.authenticateAuthority({
      email,
      password,
      department,
      badge
    });
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Error in authority login:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Verify session
 * GET /api/auth/verify
 */
app.get('/api/auth/verify', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: 'Session ID required'
      });
    }
    
    const result = await authService.verifySession(sessionId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Logout
 * POST /api/auth/logout
 */
app.post('/api/auth/logout', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID required'
      });
    }
    
    const result = await authService.logout(sessionId);
    res.json(result);
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Register new tourist
 * POST /api/auth/tourist/register
 */
app.post('/api/auth/tourist/register', async (req, res) => {
  try {
    const { 
      userType, 
      fullName, 
      email, 
      password, 
      phoneNumber, 
      emergencyContactName, 
      emergencyContactNumber, 
      nationality 
    } = req.body;
    
    if (!userType || !fullName || !email || !password || !phoneNumber || !emergencyContactName || !emergencyContactNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userType, fullName, email, password, phoneNumber, emergencyContactName, emergencyContactNumber'
      });
    }
    
    // Determine nationality based on userType if not provided
    const finalNationality = nationality || (userType === 'indian' ? 'Indian' : 'Foreign');
    
    const result = await authService.registerTourist({
      name: fullName,
      email: email,
      userType: userType,
      nationality: finalNationality,
      phoneNumber: phoneNumber,
      emergencyContact: `${emergencyContactName} - ${emergencyContactNumber}`,
      password: password
    });
    
    if (result.success) {
      res.status(201).json({
        ...result,
        message: 'Registration successful! Please upload your identity documents to complete verification.'
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in tourist registration:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Register new authority
 * POST /api/auth/authority/register
 */
app.post('/api/auth/authority/register', async (req, res) => {
  try {
    const { name, email, department, badge, password, permissions } = req.body;
    
    if (!name || !email || !department || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, department, password'
      });
    }
    
    const result = await authService.registerAuthority({
      name,
      email,
      department,
      badge,
      password,
      permissions
    });
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in authority registration:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get user profile
 * GET /api/auth/profile
 */
app.get('/api/auth/profile', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: 'Session ID required'
      });
    }
    
    const sessionResult = await authService.verifySession(sessionId);
    
    if (!sessionResult.success) {
      return res.status(401).json(sessionResult);
    }
    
    const user = authService.getUser(sessionResult.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        ...(user.role === 'tourist' ? {
          identifier: user.identifier,
          nationality: user.nationality,
          emergencyContact: user.emergencyContact,
          medicalInfo: user.medicalInfo
        } : {
          email: user.email,
          department: user.department,
          badge: user.badge,
          permissions: user.permissions
        }),
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ==================== TOURIST MANAGEMENT ENDPOINTS ====================

/**
 * Register a new tourist
 * POST /api/tourists
 */
app.post('/api/tourists', async (req, res) => {
  try {
    const { name, passportNumber, nationality, emergencyContact, medicalInfo } = req.body;
    
    if (!name || !passportNumber || !nationality) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, passportNumber, nationality'
      });
    }
    
    const result = await blockchainService.registerTourist({
      name,
      passportNumber,
      nationality,
      emergencyContact,
      medicalInfo
    });
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error registering tourist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get tourist profile
 * GET /api/tourists/:id
 */
app.get('/api/tourists/:id', async (req, res) => {
  try {
    const touristId = parseInt(req.params.id);
    
    if (isNaN(touristId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tourist ID'
      });
    }
    
    const result = await blockchainService.getTouristProfile(touristId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error getting tourist profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Verify tourist
 * PUT /api/tourists/:id/verify
 */
app.put('/api/tourists/:id/verify', async (req, res) => {
  try {
    const touristId = parseInt(req.params.id);
    const { isVerified } = req.body;
    
    if (isNaN(touristId) || typeof isVerified !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Invalid tourist ID or verification status'
      });
    }
    
    const result = await blockchainService.verifyTourist(touristId, isVerified);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error verifying tourist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ==================== INCIDENT REPORTING ENDPOINTS ====================

/**
 * Report an incident
 * POST /api/incidents
 */
app.post('/api/incidents', async (req, res) => {
  try {
    const { touristId, incidentType, description, location, severity, evidenceHashes } = req.body;
    
    if (!touristId || !incidentType || !description || !location || !severity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: touristId, incidentType, description, location, severity'
      });
    }
    
    const result = await blockchainService.reportIncident({
      touristId,
      incidentType,
      description,
      location,
      severity,
      evidenceHashes
    });
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error reporting incident:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Resolve an incident
 * PUT /api/incidents/:id/resolve
 */
app.put('/api/incidents/:id/resolve', async (req, res) => {
  try {
    const incidentId = parseInt(req.params.id);
    
    if (isNaN(incidentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid incident ID'
      });
    }
    
    const result = await blockchainService.resolveIncident(incidentId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error resolving incident:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ==================== GEO-FENCING ENDPOINTS ====================

/**
 * Create a geo-fence zone
 * POST /api/zones
 */
app.post('/api/zones', async (req, res) => {
  try {
    const { name, description, centerLatitude, centerLongitude, radius, zoneType } = req.body;
    
    if (!name || !centerLatitude || !centerLongitude || !radius || !zoneType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, centerLatitude, centerLongitude, radius, zoneType'
      });
    }
    
    const result = await blockchainService.createGeoFenceZone({
      name,
      description,
      centerLatitude,
      centerLongitude,
      radius,
      zoneType
    });
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error creating geo-fence zone:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Update tourist location
 * PUT /api/tourists/:id/location
 */
app.put('/api/tourists/:id/location', async (req, res) => {
  try {
    const touristId = parseInt(req.params.id);
    const { latitude, longitude } = req.body;
    
    if (isNaN(touristId) || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid tourist ID or coordinates'
      });
    }
    
    const result = await blockchainService.updateTouristLocation(touristId, latitude, longitude);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error updating tourist location:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ==================== SAFETY ALERTS ENDPOINTS ====================

/**
 * Trigger a safety alert
 * POST /api/alerts
 */
app.post('/api/alerts', async (req, res) => {
  try {
    const { touristId, alertType, message, location, severity } = req.body;
    
    if (!touristId || !alertType || !message || !location || !severity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: touristId, alertType, message, location, severity'
      });
    }
    
    const result = await blockchainService.triggerSafetyAlert({
      touristId,
      alertType,
      message,
      location,
      severity
    });
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error triggering safety alert:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Dispatch emergency response
 * POST /api/alerts/:id/response
 */
app.post('/api/alerts/:id/response', async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    const { responseType, responder, notes } = req.body;
    
    if (isNaN(alertId) || !responseType || !responder) {
      return res.status(400).json({
        success: false,
        error: 'Invalid alert ID or missing required fields'
      });
    }
    
    const result = await blockchainService.dispatchEmergencyResponse({
      alertId,
      responseType,
      responder,
      notes
    });
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error dispatching emergency response:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ==================== DOCUMENT MANAGEMENT ENDPOINTS ====================

/**
 * Upload a document
 * POST /api/documents/upload
 */
// Multi-document upload endpoint for registration
app.post('/api/documents/multi-upload', upload.fields([
  { name: 'aadhar', maxCount: 1 },
  { name: 'passport', maxCount: 1 },
  { name: 'visa', maxCount: 1 }
]), async (req, res) => {
  try {
    const { touristId, userType, nationality } = req.body;
    
    if (!touristId || !userType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: touristId, userType'
      });
    }

    const uploadedDocuments = [];
    const files = req.files;

    // Validate required documents based on user type
    if (userType === 'indian') {
      if (!files.aadhar) {
        return res.status(400).json({
          success: false,
          error: 'Aadhar card is required for Indian citizens'
        });
      }
    } else {
      if (!files.passport || !files.visa) {
        return res.status(400).json({
          success: false,
          error: 'Both passport and visa are required for foreign visitors'
        });
      }
    }

    // Process uploaded files
    for (const [fieldName, fileArray] of Object.entries(files)) {
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];
        const documentRecord = {
          id: Date.now().toString() + '-' + fieldName,
          touristId: parseInt(touristId),
          type: fieldName,
          userType: userType,
          nationality: nationality || 'DEFAULT',
          fileName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date().toISOString(),
          verificationStatus: 'pending',
          verifiedAt: null,
          verifiedBy: null,
          rejectionReason: null
        };
        uploadedDocuments.push(documentRecord);
      }
    }

    // Store document metadata
    const documentsFile = path.join(__dirname, 'documents-metadata.json');
    let documents = [];
    
    if (fs.existsSync(documentsFile)) {
      const data = fs.readFileSync(documentsFile, 'utf8');
      documents = JSON.parse(data);
    }
    
    // Remove any existing documents of the same types for this tourist
    const existingTypes = uploadedDocuments.map(doc => doc.type);
    documents = documents.filter(doc => !(doc.touristId === parseInt(touristId) && existingTypes.includes(doc.type)));
    documents.push(...uploadedDocuments);
    
    fs.writeFileSync(documentsFile, JSON.stringify(documents, null, 2));

    res.status(201).json({
      success: true,
      message: `${uploadedDocuments.length} document(s) uploaded successfully`,
      documents: uploadedDocuments.map(doc => ({
        id: doc.id,
        type: doc.type,
        fileName: doc.fileName,
        uploadedAt: doc.uploadedAt,
        verificationStatus: doc.verificationStatus
      }))
    });
  } catch (error) {
    console.error('Error uploading multiple documents:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB per file.'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

app.post('/api/documents/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No document file provided'
      });
    }

    const { touristId, documentType, nationality } = req.body;
    
    if (!touristId || !documentType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: touristId, documentType'
      });
    }

    // Create document record
    const documentRecord = {
      id: Date.now().toString(),
      touristId: parseInt(touristId),
      type: documentType,
      nationality: nationality || 'DEFAULT',
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      verificationStatus: 'pending',
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null
    };

    // Store document metadata (in production, this would go to a database)
    const documentsFile = path.join(__dirname, 'documents-metadata.json');
    let documents = [];
    
    if (fs.existsSync(documentsFile)) {
      const data = fs.readFileSync(documentsFile, 'utf8');
      documents = JSON.parse(data);
    }
    
    // Remove any existing document of the same type for this tourist
    documents = documents.filter(doc => !(doc.touristId === documentRecord.touristId && doc.type === documentRecord.type));
    documents.push(documentRecord);
    
    fs.writeFileSync(documentsFile, JSON.stringify(documents, null, 2));

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: documentRecord.id,
        type: documentRecord.type,
        fileName: documentRecord.fileName,
        uploadedAt: documentRecord.uploadedAt,
        verificationStatus: documentRecord.verificationStatus
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * Get tourist documents
 * GET /api/documents/tourist/:id
 */
app.get('/api/documents/tourist/:id', async (req, res) => {
  try {
    const touristId = parseInt(req.params.id);
    
    if (isNaN(touristId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tourist ID'
      });
    }

    const documentsFile = path.join(__dirname, 'documents-metadata.json');
    let documents = [];
    
    if (fs.existsSync(documentsFile)) {
      const data = fs.readFileSync(documentsFile, 'utf8');
      documents = JSON.parse(data);
    }
    
    const touristDocuments = documents
      .filter(doc => doc.touristId === touristId)
      .map(doc => ({
        id: doc.id,
        type: doc.type,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        uploadedAt: doc.uploadedAt,
        verificationStatus: doc.verificationStatus,
        verifiedAt: doc.verifiedAt,
        verifiedBy: doc.verifiedBy,
        rejectionReason: doc.rejectionReason
      }));

    res.json({
      success: true,
      documents: touristDocuments
    });
  } catch (error) {
    console.error('Error fetching tourist documents:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Download a document
 * GET /api/documents/:id/download
 */
app.get('/api/documents/:id/download', async (req, res) => {
  try {
    const documentId = req.params.id;
    
    const documentsFile = path.join(__dirname, 'documents-metadata.json');
    let documents = [];
    
    if (fs.existsSync(documentsFile)) {
      const data = fs.readFileSync(documentsFile, 'utf8');
      documents = JSON.parse(data);
    }
    
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Document file not found on server'
      });
    }

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    res.sendFile(path.resolve(document.filePath));
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Verify a document
 * PUT /api/documents/:id/verify
 */
app.put('/api/documents/:id/verify', async (req, res) => {
  try {
    const documentId = req.params.id;
    const { isVerified, verifiedBy, rejectionReason } = req.body;
    
    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification status'
      });
    }

    const documentsFile = path.join(__dirname, 'documents-metadata.json');
    let documents = [];
    
    if (fs.existsSync(documentsFile)) {
      const data = fs.readFileSync(documentsFile, 'utf8');
      documents = JSON.parse(data);
    }
    
    const documentIndex = documents.findIndex(doc => doc.id === documentId);
    
    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    documents[documentIndex].verificationStatus = isVerified ? 'verified' : 'rejected';
    documents[documentIndex].verifiedAt = new Date().toISOString();
    documents[documentIndex].verifiedBy = verifiedBy || 'System';
    
    if (!isVerified && rejectionReason) {
      documents[documentIndex].rejectionReason = rejectionReason;
    }
    
    fs.writeFileSync(documentsFile, JSON.stringify(documents, null, 2));

    res.json({
      success: true,
      message: `Document ${isVerified ? 'verified' : 'rejected'} successfully`,
      document: {
        id: documents[documentIndex].id,
        type: documents[documentIndex].type,
        verificationStatus: documents[documentIndex].verificationStatus,
        verifiedAt: documents[documentIndex].verifiedAt,
        verifiedBy: documents[documentIndex].verifiedBy,
        rejectionReason: documents[documentIndex].rejectionReason
      }
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Delete a document
 * DELETE /api/documents/:id
 */
app.delete('/api/documents/:id', async (req, res) => {
  try {
    const documentId = req.params.id;
    
    const documentsFile = path.join(__dirname, 'documents-metadata.json');
    let documents = [];
    
    if (fs.existsSync(documentsFile)) {
      const data = fs.readFileSync(documentsFile, 'utf8');
      documents = JSON.parse(data);
    }
    
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Remove file from disk
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    
    // Remove from metadata
    const filteredDocuments = documents.filter(doc => doc.id !== documentId);
    fs.writeFileSync(documentsFile, JSON.stringify(filteredDocuments, null, 2));

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ==================== SYSTEM ENDPOINTS ====================

/**
 * Get system status
 * GET /api/status
 */
app.get('/api/status', async (req, res) => {
  try {
    const networkInfo = await blockchainService.getNetworkInfo();
    const contractAddresses = blockchainService.getContractAddresses();
    const walletAddress = blockchainService.getWalletAddress();
    
    res.json({
      success: true,
      status: 'operational',
      network: networkInfo,
      contracts: contractAddresses,
      wallet: walletAddress,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting system status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Health check endpoint
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
async function startServer() {
  await initializeBlockchain();
  
  app.listen(port, () => {
    console.log(`Smart Tourist Safety API server running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/api/health`);
    console.log(`System status: http://localhost:${port}/api/status`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;

