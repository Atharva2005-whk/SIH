const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Authentication Service for Smart Tourist Safety Monitoring System
 * Handles user authentication, session management, and role-based access control
 */
class AuthService {
    constructor() {
        this.secretKey = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        this.tokenExpiry = '24h';
        this.refreshTokenExpiry = '7d';
        
        // In-memory storage for demo (use database in production)
        this.users = new Map();
        this.sessions = new Map();
        
        // Initialize with demo users
        this.initializeDemoUsers();
    }

    /**
     * Initialize demo users for testing
     */
    initializeDemoUsers() {
        // Demo tourists
        this.users.set('tourist_001', {
            id: 'tourist_001',
            role: 'tourist',
            identifier: 'P123456789',
            name: 'John Doe',
            nationality: 'US',
            password: this.hashPassword('tourist123'),
            isActive: true,
            createdAt: new Date().toISOString()
        });

        this.users.set('tourist_002', {
            id: 'tourist_002',
            role: 'tourist',
            identifier: 'P987654321',
            name: 'Maria Garcia',
            nationality: 'ES',
            password: this.hashPassword('tourist123'),
            isActive: true,
            createdAt: new Date().toISOString()
        });

        // Demo authorities
        this.users.set('auth_001', {
            id: 'auth_001',
            role: 'authority',
            email: 'officer@police.gov',
            department: 'police',
            badge: 'PD001',
            name: 'Officer Smith',
            password: this.hashPassword('authority123'),
            isActive: true,
            permissions: ['view_tourists', 'report_incidents', 'manage_alerts'],
            createdAt: new Date().toISOString()
        });

        this.users.set('auth_002', {
            id: 'auth_002',
            role: 'authority',
            email: 'medic@hospital.gov',
            department: 'medical',
            badge: 'MD001',
            name: 'Dr. Johnson',
            password: this.hashPassword('authority123'),
            isActive: true,
            permissions: ['view_tourists', 'report_incidents', 'manage_medical_alerts'],
            createdAt: new Date().toISOString()
        });
    }

    /**
     * Hash password using SHA-256
     * @param {string} password - Plain text password
     */
    hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    /**
     * Verify password
     * @param {string} password - Plain text password
     * @param {string} hashedPassword - Hashed password
     */
    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    /**
     * Generate JWT token
     * @param {Object} payload - Token payload
     * @param {string} expiry - Token expiry time
     */
    generateToken(payload, expiry = this.tokenExpiry) {
        return jwt.sign(payload, this.secretKey, { expiresIn: expiry });
    }

    /**
     * Verify JWT token
     * @param {string} token - JWT token
     */
    verifyToken(token) {
        try {
            return jwt.verify(token, this.secretKey);
        } catch (error) {
            return null;
        }
    }

    /**
     * Authenticate tourist
     * @param {Object} credentials - Login credentials
     */
    async authenticateTourist(credentials) {
        const { identifier, password, nationality } = credentials;

        if (!identifier || !password) {
            return {
                success: false,
                error: 'Missing required credentials'
            };
        }

        // Find user by identifier
        let user = null;
        for (const [userId, userData] of this.users) {
            if (userData.role === 'tourist' && 
                (userData.identifier === identifier || userId === identifier)) {
                user = userData;
                break;
            }
        }

        if (!user) {
            return {
                success: false,
                error: 'Invalid tourist identifier'
            };
        }

        if (!this.verifyPassword(password, user.password)) {
            return {
                success: false,
                error: 'Invalid password'
            };
        }

        if (!user.isActive) {
            return {
                success: false,
                error: 'Account is deactivated'
            };
        }

        // Generate tokens
        const tokenPayload = {
            userId: user.id,
            role: user.role,
            identifier: user.identifier,
            nationality: user.nationality
        };

        const accessToken = this.generateToken(tokenPayload);
        const refreshToken = this.generateToken(tokenPayload, this.refreshTokenExpiry);

        // Store session
        const sessionId = crypto.randomUUID();
        this.sessions.set(sessionId, {
            userId: user.id,
            role: user.role,
            accessToken,
            refreshToken,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        });

        return {
            success: true,
            user: {
                id: user.id,
                role: user.role,
                identifier: user.identifier,
                name: user.name,
                nationality: user.nationality
            },
            tokens: {
                accessToken,
                refreshToken,
                sessionId
            }
        };
    }

    /**
     * Authenticate authority
     * @param {Object} credentials - Login credentials
     */
    async authenticateAuthority(credentials) {
        const { email, password, department, badge } = credentials;

        if (!email || !password || !department) {
            return {
                success: false,
                error: 'Missing required credentials'
            };
        }

        // Find user by email
        let user = null;
        for (const [userId, userData] of this.users) {
            if (userData.role === 'authority' && userData.email === email) {
                user = userData;
                break;
            }
        }

        if (!user) {
            return {
                success: false,
                error: 'Invalid authority email'
            };
        }

        if (!this.verifyPassword(password, user.password)) {
            return {
                success: false,
                error: 'Invalid password'
            };
        }

        if (!user.isActive) {
            return {
                success: false,
                error: 'Account is deactivated'
            };
        }

        // Verify department if provided
        if (department && user.department !== department) {
            return {
                success: false,
                error: 'Department mismatch'
            };
        }

        // Generate tokens
        const tokenPayload = {
            userId: user.id,
            role: user.role,
            email: user.email,
            department: user.department,
            badge: user.badge,
            permissions: user.permissions || []
        };

        const accessToken = this.generateToken(tokenPayload);
        const refreshToken = this.generateToken(tokenPayload, this.refreshTokenExpiry);

        // Store session
        const sessionId = crypto.randomUUID();
        this.sessions.set(sessionId, {
            userId: user.id,
            role: user.role,
            accessToken,
            refreshToken,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        });

        return {
            success: true,
            user: {
                id: user.id,
                role: user.role,
                email: user.email,
                department: user.department,
                badge: user.badge,
                name: user.name,
                permissions: user.permissions || []
            },
            tokens: {
                accessToken,
                refreshToken,
                sessionId
            }
        };
    }

    /**
     * Verify session and get user info
     * @param {string} sessionId - Session ID
     */
    async verifySession(sessionId) {
        const session = this.sessions.get(sessionId);
        
        if (!session) {
            return {
                success: false,
                error: 'Invalid session'
            };
        }

        // Verify access token
        const tokenData = this.verifyToken(session.accessToken);
        if (!tokenData) {
            // Try to refresh token
            const refreshData = this.verifyToken(session.refreshToken);
            if (!refreshData) {
                this.sessions.delete(sessionId);
                return {
                    success: false,
                    error: 'Session expired'
                };
            }

            // Generate new access token
            const newAccessToken = this.generateToken({
                userId: refreshData.userId,
                role: refreshData.role,
                ...refreshData
            });

            session.accessToken = newAccessToken;
            session.lastActivity = new Date().toISOString();
        } else {
            session.lastActivity = new Date().toISOString();
        }

        return {
            success: true,
            user: tokenData || this.verifyToken(session.refreshToken),
            session
        };
    }

    /**
     * Logout user
     * @param {string} sessionId - Session ID
     */
    async logout(sessionId) {
        if (this.sessions.has(sessionId)) {
            this.sessions.delete(sessionId);
            return { success: true };
        }
        return { success: false, error: 'Session not found' };
    }

    /**
     * Register new tourist
     * @param {Object} touristData - Tourist registration data
     */
    async registerTourist(touristData) {
        const { name, passportNumber, nationality, emergencyContact, medicalInfo, password } = touristData;

        if (!name || !passportNumber || !nationality || !password) {
            return {
                success: false,
                error: 'Missing required fields'
            };
        }

        // Check if tourist already exists
        for (const [userId, userData] of this.users) {
            if (userData.role === 'tourist' && userData.identifier === passportNumber) {
                return {
                    success: false,
                    error: 'Tourist with this passport number already exists'
                };
            }
        }

        // Create new tourist
        const touristId = `tourist_${Date.now()}`;
        const newTourist = {
            id: touristId,
            role: 'tourist',
            identifier: passportNumber,
            name,
            nationality,
            emergencyContact,
            medicalInfo,
            password: this.hashPassword(password),
            isActive: true,
            createdAt: new Date().toISOString()
        };

        this.users.set(touristId, newTourist);

        return {
            success: true,
            user: {
                id: newTourist.id,
                role: newTourist.role,
                identifier: newTourist.identifier,
                name: newTourist.name,
                nationality: newTourist.nationality
            }
        };
    }

    /**
     * Register new authority
     * @param {Object} authorityData - Authority registration data
     */
    async registerAuthority(authorityData) {
        const { name, email, department, badge, password, permissions } = authorityData;

        if (!name || !email || !department || !password) {
            return {
                success: false,
                error: 'Missing required fields'
            };
        }

        // Check if authority already exists
        for (const [userId, userData] of this.users) {
            if (userData.role === 'authority' && userData.email === email) {
                return {
                    success: false,
                    error: 'Authority with this email already exists'
                };
            }
        }

        // Create new authority
        const authorityId = `auth_${Date.now()}`;
        const newAuthority = {
            id: authorityId,
            role: 'authority',
            email,
            department,
            badge,
            name,
            password: this.hashPassword(password),
            isActive: true,
            permissions: permissions || ['view_tourists', 'report_incidents'],
            createdAt: new Date().toISOString()
        };

        this.users.set(authorityId, newAuthority);

        return {
            success: true,
            user: {
                id: newAuthority.id,
                role: newAuthority.role,
                email: newAuthority.email,
                department: newAuthority.department,
                badge: newAuthority.badge,
                name: newAuthority.name,
                permissions: newAuthority.permissions
            }
        };
    }

    /**
     * Get user by ID
     * @param {string} userId - User ID
     */
    getUser(userId) {
        return this.users.get(userId);
    }

    /**
     * Get all users by role
     * @param {string} role - User role
     */
    getUsersByRole(role) {
        const users = [];
        for (const [userId, userData] of this.users) {
            if (userData.role === role) {
                users.push({
                    id: userData.id,
                    role: userData.role,
                    name: userData.name,
                    ...(userData.role === 'tourist' ? {
                        identifier: userData.identifier,
                        nationality: userData.nationality
                    } : {
                        email: userData.email,
                        department: userData.department,
                        badge: userData.badge
                    }),
                    isActive: userData.isActive,
                    createdAt: userData.createdAt
                });
            }
        }
        return users;
    }

    /**
     * Update user status
     * @param {string} userId - User ID
     * @param {boolean} isActive - Active status
     */
    updateUserStatus(userId, isActive) {
        const user = this.users.get(userId);
        if (user) {
            user.isActive = isActive;
            return { success: true };
        }
        return { success: false, error: 'User not found' };
    }

    /**
     * Clean up expired sessions
     */
    cleanupExpiredSessions() {
        const now = new Date();
        for (const [sessionId, session] of this.sessions) {
            const lastActivity = new Date(session.lastActivity);
            const hoursDiff = (now - lastActivity) / (1000 * 60 * 60);
            
            // Remove sessions inactive for more than 24 hours
            if (hoursDiff > 24) {
                this.sessions.delete(sessionId);
            }
        }
    }

    /**
     * Get session statistics
     */
    getSessionStats() {
        return {
            totalSessions: this.sessions.size,
            totalUsers: this.users.size,
            activeTourists: this.getUsersByRole('tourist').filter(u => u.isActive).length,
            activeAuthorities: this.getUsersByRole('authority').filter(u => u.isActive).length
        };
    }
}

module.exports = AuthService;
