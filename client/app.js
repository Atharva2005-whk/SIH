/**
 * Smart Tourist Safety Monitoring System - Frontend Application
 * Main JavaScript file for handling all frontend interactions
 */

class TouristSafetyApp {
    constructor() {
        this.API_BASE = 'http://localhost:3000/api';
        this.currentTab = 'dashboard';
        this.refreshInterval = null;
        this.userSession = null;
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.loadDashboardData();
        this.startAutoRefresh();
        this.setupFormValidation();
        console.log('Tourist Safety App initialized');
    }

    /**
     * Check if user is authenticated
     */
    checkAuthentication() {
        const session = localStorage.getItem('userSession');
        if (session) {
            try {
                this.userSession = JSON.parse(session);
                this.updateUIForUser();
            } catch (error) {
                console.error('Invalid session data:', error);
                this.redirectToLogin();
            }
        } else {
            this.redirectToLogin();
        }
    }

    /**
     * Update UI based on user role
     */
    updateUIForUser() {
        if (!this.userSession) return;

        // Update header with user info
        const header = document.querySelector('.header h1');
        if (header && this.userSession.role) {
            const roleIcon = this.userSession.role === 'tourist' ? '👤' : '🏛️';
            const userName = this.userSession.name || this.userSession.identifier || this.userSession.email;
            header.innerHTML = `🛡️ Tourist Safety - ${roleIcon} ${userName}`;
        }

        // Show/hide features based on role
        this.updateFeatureVisibility();
    }

    /**
     * Update feature visibility based on user role
     */
    updateFeatureVisibility() {
        if (!this.userSession) return;

        const isTourist = this.userSession.role === 'tourist';
        const isAuthority = this.userSession.role === 'authority';

        // Hide certain tabs for tourists
        if (isTourist) {
            const authorityTabs = document.querySelectorAll('[data-tab="zones"], [data-tab="alerts"]');
            authorityTabs.forEach(tab => {
                tab.style.display = 'none';
            });
        }

        // Add logout button
        this.addLogoutButton();
    }

    /**
     * Add logout button to the interface
     */
    addLogoutButton() {
        const tabs = document.querySelector('.tabs');
        if (tabs && !document.getElementById('logoutBtn')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'logoutBtn';
            logoutBtn.className = 'tab';
            logoutBtn.innerHTML = '🚪 Logout';
            logoutBtn.style.marginLeft = 'auto';
            logoutBtn.style.background = '#e74c3c';
            logoutBtn.style.color = 'white';
            logoutBtn.onclick = () => this.logout();
            tabs.appendChild(logoutBtn);
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            const sessionId = localStorage.getItem('sessionId');
            if (sessionId) {
                await fetch(`${this.API_BASE}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-session-id': sessionId
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('userSession');
            localStorage.removeItem('sessionId');
            this.redirectToLogin();
        }
    }

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        window.location.href = 'login.html';
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.showTab(e.target.dataset.tab));
        });

        // Form submissions
        document.getElementById('touristForm').addEventListener('submit', (e) => this.handleTouristRegistration(e));
        document.getElementById('incidentForm').addEventListener('submit', (e) => this.handleIncidentReport(e));
        document.getElementById('zoneForm').addEventListener('submit', (e) => this.handleZoneCreation(e));
        document.getElementById('alertForm').addEventListener('submit', (e) => this.handleAlertTrigger(e));

        // Real-time location updates
        this.setupLocationTracking();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    /**
     * Show specific tab content
     * @param {string} tabName - Name of the tab to show
     */
    showTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Remove active class from all tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab content
        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // Add active class to clicked tab
        const clickedTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (clickedTab) {
            clickedTab.classList.add('active');
        }

        this.currentTab = tabName;

        // Load specific data for the tab
        this.loadTabData(tabName);
    }

    /**
     * Load data specific to the current tab
     * @param {string} tabName - Name of the tab
     */
    loadTabData(tabName) {
        switch (tabName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'tourists':
                this.loadTouristList();
                break;
            case 'incidents':
                this.loadIncidentList();
                break;
            case 'zones':
                this.loadZoneList();
                break;
            case 'alerts':
                this.loadAlertList();
                break;
        }
    }

    /**
     * Load dashboard data
     */
    async loadDashboardData() {
        try {
            this.showLoading('dashboard');
            
            const [statusResponse, statsResponse] = await Promise.all([
                fetch(`${this.API_BASE}/status`),
                this.getSystemStats()
            ]);

            const statusData = await statusResponse.json();
            
            if (statusData.success) {
                this.updateSystemStatus(statusData);
            }

            this.updateDashboardStats(statsResponse);
            this.loadRecentAlerts();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('dashboard', 'Failed to load dashboard data');
        }
    }

    /**
     * Get system statistics
     */
    async getSystemStats() {
        // This would typically come from the API
        // For now, we'll simulate the data
        return {
            totalTourists: 156,
            activeIncidents: 3,
            totalZones: 12,
            totalAlerts: 8
        };
    }

    /**
     * Update system status display
     * @param {Object} statusData - Status data from API
     */
    updateSystemStatus(statusData) {
        const statusElement = document.querySelector('.status-card p');
        if (statusElement) {
            statusElement.innerHTML = `
                All systems operational. 
                <br>Network: ${statusData.network?.name || 'Unknown'}
                <br>Block: ${statusData.network?.blockNumber || 'N/A'}
                <br>Last updated: ${new Date().toLocaleTimeString()}
            `;
        }
    }

    /**
     * Update dashboard statistics
     * @param {Object} stats - Statistics data
     */
    updateDashboardStats(stats) {
        const elements = {
            totalTourists: stats.totalTourists,
            activeIncidents: stats.activeIncidents,
            totalZones: stats.totalZones,
            totalAlerts: stats.totalAlerts
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                this.animateNumber(element, value);
            }
        });
    }

    /**
     * Animate number counting
     * @param {HTMLElement} element - Element to animate
     * @param {number} target - Target number
     */
    animateNumber(element, target) {
        const start = 0;
        const duration = 1000;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    /**
     * Load recent alerts
     */
    async loadRecentAlerts() {
        try {
            // This would typically come from the API
            const mockAlerts = [
                { id: 1, type: 'emergency', message: 'Tourist needs assistance', time: '2 min ago', severity: 'high' },
                { id: 2, type: 'zone_breach', message: 'Tourist entered restricted area', time: '5 min ago', severity: 'medium' },
                { id: 3, type: 'medical', message: 'Medical emergency reported', time: '10 min ago', severity: 'critical' }
            ];

            const alertsContainer = document.getElementById('recentAlerts');
            if (alertsContainer) {
                alertsContainer.innerHTML = mockAlerts.map(alert => `
                    <div class="alert-item" style="padding: 10px; border-left: 3px solid ${this.getSeverityColor(alert.severity)}; margin-bottom: 10px; background: #f8f9fa;">
                        <strong>${alert.type.toUpperCase()}</strong><br>
                        ${alert.message}<br>
                        <small style="color: #6c757d;">${alert.time}</small>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading recent alerts:', error);
        }
    }

    /**
     * Get color for severity level
     * @param {string} severity - Severity level
     */
    getSeverityColor(severity) {
        const colors = {
            low: '#28a745',
            medium: '#ffc107',
            high: '#fd7e14',
            critical: '#dc3545'
        };
        return colors[severity] || '#6c757d';
    }

    /**
     * Handle tourist registration
     * @param {Event} e - Form submit event
     */
    async handleTouristRegistration(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('touristName').value,
            passportNumber: document.getElementById('passportNumber').value,
            nationality: document.getElementById('nationality').value,
            emergencyContact: document.getElementById('emergencyContact').value,
            medicalInfo: document.getElementById('medicalInfo').value
        };

        try {
            this.showLoading('touristResult');
            
            const response = await fetch(`${this.API_BASE}/tourists`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            this.showResult('touristResult', result);
            
            if (result.success) {
                this.clearForm('touristForm');
                this.loadDashboardData(); // Refresh dashboard
            }
        } catch (error) {
            this.showResult('touristResult', { success: false, error: 'Network error' });
        }
    }

    /**
     * Handle incident reporting
     * @param {Event} e - Form submit event
     */
    async handleIncidentReport(e) {
        e.preventDefault();
        
        const formData = {
            touristId: parseInt(document.getElementById('incidentTouristId').value),
            incidentType: document.getElementById('incidentType').value,
            description: document.getElementById('incidentDescription').value,
            location: document.getElementById('incidentLocation').value,
            severity: document.getElementById('incidentSeverity').value
        };

        try {
            this.showLoading('incidentResult');
            
            const response = await fetch(`${this.API_BASE}/incidents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            this.showResult('incidentResult', result);
            
            if (result.success) {
                this.clearForm('incidentForm');
                this.loadDashboardData(); // Refresh dashboard
            }
        } catch (error) {
            this.showResult('incidentResult', { success: false, error: 'Network error' });
        }
    }

    /**
     * Handle safety zone creation
     * @param {Event} e - Form submit event
     */
    async handleZoneCreation(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('zoneName').value,
            description: document.getElementById('zoneDescription').value,
            centerLatitude: parseFloat(document.getElementById('centerLatitude').value),
            centerLongitude: parseFloat(document.getElementById('centerLongitude').value),
            radius: parseInt(document.getElementById('zoneRadius').value),
            zoneType: document.getElementById('zoneType').value
        };

        try {
            this.showLoading('zoneResult');
            
            const response = await fetch(`${this.API_BASE}/zones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            this.showResult('zoneResult', result);
            
            if (result.success) {
                this.clearForm('zoneForm');
                this.loadDashboardData(); // Refresh dashboard
            }
        } catch (error) {
            this.showResult('zoneResult', { success: false, error: 'Network error' });
        }
    }

    /**
     * Handle safety alert triggering
     * @param {Event} e - Form submit event
     */
    async handleAlertTrigger(e) {
        e.preventDefault();
        
        const formData = {
            touristId: parseInt(document.getElementById('alertTouristId').value),
            alertType: document.getElementById('alertType').value,
            message: document.getElementById('alertMessage').value,
            location: document.getElementById('alertLocation').value,
            severity: document.getElementById('alertSeverity').value
        };

        try {
            this.showLoading('alertResult');
            
            const response = await fetch(`${this.API_BASE}/alerts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            this.showResult('alertResult', result);
            
            if (result.success) {
                this.clearForm('alertForm');
                this.loadDashboardData(); // Refresh dashboard
            }
        } catch (error) {
            this.showResult('alertResult', { success: false, error: 'Network error' });
        }
    }

    /**
     * Show loading state
     * @param {string} elementId - ID of element to show loading in
     */
    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Processing request...</p>
                </div>
            `;
        }
    }

    /**
     * Show result message
     * @param {string} elementId - ID of element to show result in
     * @param {Object} result - Result object
     */
    showResult(elementId, result) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        if (result.success) {
            element.innerHTML = `
                <div class="alert alert-success">
                    <strong>✅ Success!</strong> ${result.message || 'Operation completed successfully.'}
                    ${result.touristId ? `<br><strong>Tourist ID:</strong> ${result.touristId}` : ''}
                    ${result.incidentId ? `<br><strong>Incident ID:</strong> ${result.incidentId}` : ''}
                    ${result.zoneId ? `<br><strong>Zone ID:</strong> ${result.zoneId}` : ''}
                    ${result.alertId ? `<br><strong>Alert ID:</strong> ${result.alertId}` : ''}
                    ${result.transactionHash ? `<br><strong>Transaction Hash:</strong> <code>${result.transactionHash}</code>` : ''}
                </div>
            `;
        } else {
            element.innerHTML = `
                <div class="alert alert-error">
                    <strong>❌ Error!</strong> ${result.error || 'Operation failed.'}
                </div>
            `;
        }
    }

    /**
     * Show error message
     * @param {string} elementId - ID of element to show error in
     * @param {string} message - Error message
     */
    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="alert alert-error">
                    <strong>❌ Error!</strong> ${message}
                </div>
            `;
        }
    }

    /**
     * Clear form fields
     * @param {string} formId - ID of form to clear
     */
    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    }

    /**
     * Setup form validation
     */
    setupFormValidation() {
        // Add real-time validation to forms
        document.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    /**
     * Validate individual field
     * @param {HTMLElement} field - Field to validate
     */
    validateField(field) {
        const value = field.value.trim();
        const isValid = value.length > 0;
        
        if (!isValid) {
            this.showFieldError(field, 'This field is required');
        } else {
            this.clearFieldError(field);
        }
        
        return isValid;
    }

    /**
     * Show field error
     * @param {HTMLElement} field - Field to show error for
     * @param {string} message - Error message
     */
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '0.9em';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
        field.style.borderColor = '#dc3545';
    }

    /**
     * Clear field error
     * @param {HTMLElement} field - Field to clear error for
     */
    clearFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        field.style.borderColor = '';
    }

    /**
     * Setup location tracking
     */
    setupLocationTracking() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('Current location:', position.coords);
                    // This would be sent to the API for real-time tracking
                },
                (error) => {
                    console.error('Geolocation error:', error);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
            );
        }
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.showTab('dashboard');
                    break;
                case '2':
                    e.preventDefault();
                    this.showTab('tourists');
                    break;
                case '3':
                    e.preventDefault();
                    this.showTab('incidents');
                    break;
                case '4':
                    e.preventDefault();
                    this.showTab('zones');
                    break;
                case '5':
                    e.preventDefault();
                    this.showTab('alerts');
                    break;
            }
        }
    }

    /**
     * Start auto-refresh for dashboard
     */
    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            if (this.currentTab === 'dashboard') {
                this.loadDashboardData();
            }
        }, 30000); // Refresh every 30 seconds
    }

    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Load tourist list (placeholder)
     */
    loadTouristList() {
        // This would load a list of registered tourists
        console.log('Loading tourist list...');
    }

    /**
     * Load incident list (placeholder)
     */
    loadIncidentList() {
        // This would load a list of incidents
        console.log('Loading incident list...');
    }

    /**
     * Load zone list (placeholder)
     */
    loadZoneList() {
        // This would load a list of safety zones
        console.log('Loading zone list...');
    }

    /**
     * Load alert list (placeholder)
     */
    loadAlertList() {
        // This would load a list of alerts
        console.log('Loading alert list...');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.touristSafetyApp = new TouristSafetyApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        window.touristSafetyApp?.stopAutoRefresh();
    } else {
        window.touristSafetyApp?.startAutoRefresh();
    }
});

// Handle window beforeunload
window.addEventListener('beforeunload', () => {
    window.touristSafetyApp?.stopAutoRefresh();
});
