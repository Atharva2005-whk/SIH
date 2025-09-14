const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Test authentication endpoints
app.post('/api/auth/tourist/login', async (req, res) => {
  try {
    const { identifier, password, nationality } = req.body;
    
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: identifier, password'
      });
    }
    
    // Mock successful login
    const mockResponse = {
      success: true,
      data: {
        user: {
          id: 1,
          name: 'Test Tourist',
          role: 'tourist',
          email: identifier,
          isVerified: true
        },
        session: {
          id: 'test-session-' + Date.now(),
          userId: 1,
          userRole: 'tourist',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          createdAt: new Date(),
          lastActivityAt: new Date()
        }
      },
      message: 'Login successful',
      timestamp: new Date()
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('Error in tourist login:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.post('/api/auth/authority/login', async (req, res) => {
  try {
    const { email, password, department, badge } = req.body;
    
    if (!email || !password || !department) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, department'
      });
    }
    
    // Mock successful admin login
    const mockResponse = {
      success: true,
      data: {
        user: {
          id: 2,
          name: 'Test Admin',
          role: 'authority',
          email: email,
          department: department,
          badge: badge,
          isVerified: true,
          permissions: ['manage_tourists', 'view_reports']
        },
        session: {
          id: 'admin-session-' + Date.now(),
          userId: 2,
          userRole: 'authority',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          createdAt: new Date(),
          lastActivityAt: new Date()
        }
      },
      message: 'Admin login successful',
      timestamp: new Date()
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('Error in authority login:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.get('/api/auth/verify', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  
  if (!sessionId) {
    return res.status(401).json({
      success: false,
      error: 'Session ID required'
    });
  }
  
  // Mock session verification - in real app, validate against database
  res.json({
    success: true,
    data: {
      user: {
        id: 1,
        name: 'Test User',
        role: 'tourist',
        email: 'test@example.com',
        isVerified: true
      },
      session: {
        id: sessionId,
        userId: 1,
        userRole: 'tourist',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        lastActivityAt: new Date()
      }
    },
    message: 'Session valid',
    timestamp: new Date()
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
    timestamp: new Date()
  });
});

// Tourist registration endpoint
app.post('/api/tourists/register', (req, res) => {
  try {
    console.log('Tourist registration request received');
    console.log('Body:', req.body);
    
    // Mock successful registration
    res.json({
      success: true,
      data: {
        tourist: {
          id: Date.now(),
          name: 'Test Tourist',
          nationality: 'Test',
          passportNumber: 'TEST123',
          isVerified: false
        },
        touristId: Date.now()
      },
      message: 'Registration successful',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error in tourist registration:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed: ' + error.message
    });
  }
});

// Document upload endpoint  
app.post('/api/documents/upload', (req, res) => {
  try {
    console.log('Document upload request received');
    
    // Mock successful upload
    res.json({
      success: true,
      data: {
        documentId: 'doc-' + Date.now(),
        ipfsHash: 'QmTest' + Date.now()
      },
      message: 'Document uploaded successfully',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error in document upload:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed: ' + error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date()
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Test API server running on port ${port}`);
  console.log(`🌐 Health check: http://localhost:${port}/api/health`);
  console.log(`🔒 Auth endpoints available`);
  console.log(`📝 Registration endpoints available`);
  console.log('🚀 Server ready for connections');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
