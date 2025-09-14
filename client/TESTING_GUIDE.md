# SafeGuard Tourist System - Testing Guide

## 🚀 Quick Start

1. **Start the application:**
   ```bash
   npm run dev
   ```
   
2. **Open in browser:** http://localhost:5173

## 🧪 Testing Steps

### ✅ Test Tourist Dashboard
1. Click "Login" button on homepage
2. Enter **any email** (e.g., `john@tourist.com`)
3. Leave password empty or enter anything
4. Select any nationality (e.g., "American")
5. Click "Login as Tourist"
6. **Expected:** Should redirect to `/user-dashboard` with tourist features

### ✅ Test Admin Dashboard  
1. Click "Admin Portal" button on homepage
2. Enter **any email** (e.g., `admin@safeguard.gov`) 
3. Leave password empty or enter anything
4. Select "Security" as department
5. Enter any badge number (e.g., `SF001`)
6. Click "Login as Authority"
7. **Expected:** Should redirect to `/admin-dashboard` with admin features

### ✅ Test Registration
1. Click "Register" button on homepage
2. Fill out the form:
   - **Name:** Any name (e.g., "Test User")
   - **Nationality:** Select any (e.g., "Indian")  
   - **Passport/Aadhaar:** Enter any number
   - **Emergency Contact:** Enter any contact
3. Upload sample documents (any image files)
4. Click through the steps and submit
5. **Expected:** Should show success message and redirect to login

## 🔍 Debugging

### Check Browser Console
- Open Developer Tools (F12)
- Look for console logs with emojis:
  - 🚀 Login attempts
  - ✅ Successful operations  
  - ❌ Errors
  - 🎯 Navigation events

### Common Issues & Fixes

**Issue:** Login redirects to wrong dashboard
- **Check:** Browser console for user role logs
- **Fix:** Clear localStorage: `localStorage.clear()`

**Issue:** Registration doesn't work  
- **Check:** Console logs for registration API calls
- **Expected:** Should see "Registration successful" message

**Issue:** Blank screen
- **Check:** Console for JavaScript errors
- **Fix:** Refresh page or clear browser cache

## 📱 Features to Test

### User Dashboard Features:
- ✅ Profile overview with verification status
- ✅ Document management tab
- ✅ Emergency contacts and panic button
- ✅ Location tracking (asks for permission)
- ✅ Safety zone information
- ✅ Recent activity feed

### Admin Dashboard Features:
- ✅ System overview with statistics
- ✅ Tourist management (view, verify)
- ✅ Document verification (approve/reject)
- ✅ Incident management
- ✅ Real-time monitoring stats

### Navigation Features:
- ✅ Role-based redirects
- ✅ Protected routes
- ✅ Logout functionality
- ✅ Proper session management

## 🎯 Expected Behavior

1. **Offline Mode:** System works without backend
2. **Mock Data:** All API calls return realistic mock data
3. **Instant Login:** Any credentials work (demo mode)
4. **Role Routing:** Tourist → User Dashboard, Admin → Admin Dashboard
5. **Responsive:** Works on desktop and mobile

## 🐛 If Something Breaks

1. **Clear browser storage:**
   ```js
   localStorage.clear()
   sessionStorage.clear()
   ```

2. **Hard refresh:** Ctrl+Shift+R

3. **Check network tab:** Should see failed API calls (expected)

4. **Restart dev server:** Ctrl+C then `npm run dev`

## 🏆 Success Criteria

- ✅ Tourist login → User Dashboard
- ✅ Admin login → Admin Dashboard  
- ✅ Registration → Success message → Login redirect
- ✅ All dashboard features load and display data
- ✅ Navigation between sections works
- ✅ Logout returns to homepage
- ✅ No JavaScript errors in console
