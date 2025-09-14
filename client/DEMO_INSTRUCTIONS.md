# SafeGuard Tourist System - Demo Instructions

## How to Test the System

### 1. Start the Application
```bash
cd client
npm run dev
```
The app will be available at `http://localhost:5173`

### 2. Test Tourist Login
1. Click on "Login" or go to `/login`
2. Enter any email address (e.g., `demo@tourist.com`)
3. Password can be anything or leave empty
4. Select any nationality
5. Click "Login as Tourist"
6. Should redirect to `/user-dashboard`

### 3. Test Admin Login
1. Click on "Admin Portal" or go to `/admin-login`
2. Enter any email address (e.g., `admin@safeguard.gov`)
3. Password can be anything or leave empty
4. Select "Security" as department
5. Badge can be anything (e.g., `SF001`)
6. Click "Login as Authority"
7. Should redirect to `/admin-dashboard`

### 4. Test Registration
1. Click on "Register" or go to `/register`
2. Fill out the registration form
3. Upload sample documents
4. Submit registration
5. Should redirect to login page

### 5. Direct Dashboard Access
You can also test dashboards directly:
- User Dashboard: `http://localhost:5173/user-dashboard`
- Admin Dashboard: `http://localhost:5173/admin-dashboard`

## Features

### User Dashboard
- Profile overview with verification status
- Document management and upload
- Emergency contacts and panic button
- Location tracking and safety zones
- Recent activity feed

### Admin Dashboard
- System overview with statistics
- Tourist management and verification
- Document review and approval
- Incident management
- Real-time monitoring

## Troubleshooting

If dashboards don't load:
1. Check browser console for errors
2. Make sure you're logged in properly
3. Try refreshing the page
4. Clear localStorage and try again

## Offline Mode
The system works without a backend by using mock data and responses. All login attempts will succeed and redirect to appropriate dashboards.
