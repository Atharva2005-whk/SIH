/**
 * Simple Static File Server for Smart Tourist Safety Frontend
 * Serves the frontend files and provides basic routing
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.FRONTEND_PORT || 8080;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-enhanced.html'));
});

// Serve the basic version
app.get('/basic', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API proxy (if needed for CORS issues)
app.use('/api', (req, res) => {
    const apiUrl = `http://localhost:3000/api${req.path}`;
    console.log(`Proxying request to: ${apiUrl}`);
    res.redirect(apiUrl);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Smart Tourist Safety Frontend',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index-enhanced.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🛡️ Smart Tourist Safety Frontend Server`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 Basic version: http://localhost:${PORT}/basic`);
    console.log(`❤️ Health check: http://localhost:${PORT}/health`);
    console.log(`\n🚀 Ready to serve the Smart Tourist Safety Monitoring System!`);
});

module.exports = app;
