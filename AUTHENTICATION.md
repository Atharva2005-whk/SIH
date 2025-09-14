# Authentication System - Smart Tourist Safety Monitoring

This document describes the comprehensive authentication system for the Smart Tourist Safety Monitoring & Incident Response System, designed to handle both international tourists and local authorities.

## 🔐 Authentication Overview

The system provides role-based authentication with two main user types:
- **Tourists** - International visitors who need access to safety features
- **Authorities** - Local officials, police, medical staff, and emergency responders

## 🌍 Multi-Language Support

The login system supports multiple languages to accommodate international tourists:
- English, Spanish, French, German, Italian, Portuguese
- Russian, Chinese, Japanese, Korean, Arabic, Hindi

## 👥 User Roles & Permissions

### Tourist Users
- **Access**: Personal safety profile, incident reporting, location tracking
- **Authentication**: Passport number or tourist ID + password
- **Features**: 
  - View personal safety information
  - Report incidents
  - Access emergency contacts
  - View safety zones (read-only)

### Authority Users
- **Access**: Administrative dashboard, tourist management, incident response
- **Authentication**: Official email + password + department verification
- **Features**:
  - Manage tourist registrations
  - Create and manage safety zones
  - Respond to incidents and alerts
  - Access all system features

## 🚀 Getting Started

### 1. Access the Login System

Navigate to the login page:
```
http://localhost:8080/login.html
```

### 2. Demo Credentials

#### Tourist Accounts
```
Passport Number: P123456789
Password: tourist123
Nationality: United States

Passport Number: P987654321
Password: tourist123
Nationality: Spain
```

#### Authority Accounts
```
Email: officer@police.gov
Password: authority123
Department: Police Department
Badge: PD001

Email: medic@hospital.gov
Password: authority123
Department: Medical Services
Badge: MD001
```

### 3. Registration

New users can register at:
```
http://localhost:8080/register.html
```

## 🔧 API Endpoints

### Authentication Endpoints

#### Tourist Login
```http
POST /api/auth/tourist/login
Content-Type: application/json

{
  "identifier": "P123456789",
  "password": "tourist123",
  "nationality": "US"
}
```

#### Authority Login
```http
POST /api/auth/authority/login
Content-Type: application/json

{
  "email": "officer@police.gov",
  "password": "authority123",
  "department": "police",
  "badge": "PD001"
}
```

#### Session Verification
```http
GET /api/auth/verify
Headers: x-session-id: <session-id>
```

#### Logout
```http
POST /api/auth/logout
Headers: x-session-id: <session-id>
```

### Registration Endpoints

#### Tourist Registration
```http
POST /api/auth/tourist/register
Content-Type: application/json

{
  "name": "John Doe",
  "passportNumber": "P123456789",
  "nationality": "US",
  "emergencyContact": "+1-555-0123",
  "medicalInfo": "No known allergies",
  "password": "securepassword"
}
```

#### Authority Registration
```http
POST /api/auth/authority/register
Content-Type: application/json

{
  "name": "Officer Smith",
  "email": "officer@police.gov",
  "department": "police",
  "badge": "PD001",
  "password": "securepassword"
}
```

## 🛡️ Security Features

### Password Security
- Passwords are hashed using SHA-256
- Minimum 6 character requirement
- Password confirmation validation

### Session Management
- JWT-based authentication
- Session expiration (24 hours)
- Refresh token support (7 days)
- Automatic session cleanup

### Role-Based Access Control
- Different permissions for tourists vs authorities
- Department-based authority verification
- Feature visibility based on user role

### Data Protection
- Secure credential storage
- Encrypted session data
- Input validation and sanitization

## 🌐 International Support

### Language Selection
Users can select their preferred language from the dropdown menu:
- Real-time language switching
- Persistent language preference
- Localized error messages

### Nationality Support
Comprehensive nationality list including:
- Major countries and territories
- Common tourist destinations
- Support for "Other" option

### Cultural Considerations
- Respectful terminology
- Appropriate icons and symbols
- Clear, simple language

## 📱 User Experience Features

### Responsive Design
- Mobile-friendly interface
- Touch-optimized controls
- Adaptive layout

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

### User Feedback
- Real-time form validation
- Clear error messages
- Success confirmations
- Loading indicators

## 🔄 Session Management

### Login Flow
1. User selects role (Tourist/Authority)
2. User enters credentials
3. System validates credentials
4. JWT tokens are generated
5. Session is stored
6. User is redirected to main application

### Session Persistence
- Sessions stored in localStorage
- Automatic session verification
- Graceful session expiration handling

### Logout Process
1. User clicks logout button
2. Session is invalidated on server
3. Local storage is cleared
4. User is redirected to login page

## 🚨 Error Handling

### Common Error Scenarios
- Invalid credentials
- Network connectivity issues
- Session expiration
- Server errors

### Error Messages
- User-friendly error descriptions
- Multilingual error support
- Actionable error guidance

## 🔧 Configuration

### Environment Variables
```env
JWT_SECRET=your-secret-key-here
TOKEN_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=7d
```

### Security Settings
- Change JWT secret in production
- Use HTTPS in production
- Implement rate limiting
- Add CAPTCHA for registration

## 📊 Monitoring & Analytics

### Session Statistics
- Total active sessions
- User registration counts
- Login success/failure rates
- Session duration metrics

### Security Monitoring
- Failed login attempts
- Suspicious activity detection
- Session anomaly detection

## 🚀 Deployment Considerations

### Production Setup
1. Use strong JWT secrets
2. Enable HTTPS
3. Implement rate limiting
4. Set up monitoring
5. Configure backup systems

### Database Integration
For production, replace in-memory storage with:
- PostgreSQL for user data
- Redis for session management
- Proper database indexing

### Security Hardening
- Input validation
- SQL injection prevention
- XSS protection
- CSRF tokens

## 🆘 Troubleshooting

### Common Issues

#### Login Failures
- Check credentials
- Verify network connection
- Check server status

#### Session Issues
- Clear browser storage
- Check session expiration
- Verify JWT secret

#### Registration Problems
- Validate required fields
- Check password requirements
- Verify email format

### Support
For technical support:
- Check server logs
- Verify API endpoints
- Test with demo credentials

---

**Built with security and international accessibility in mind** 🛡️🌍
