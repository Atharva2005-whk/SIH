# 🔧 Debug Testing Instructions

## 🚀 Start Testing

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Open browser console:** Press F12 → Console tab

3. **Clear console:** Click the clear button to start fresh

## 🧪 Test Steps with Debugging

### ✅ Test Tourist Login

1. **Go to:** http://localhost:5173/login
2. **Fill form:** 
   - Email: `tourist@demo.com`
   - Password: (leave empty or any text)
   - Nationality: Select "American"
3. **Click:** "Login as Tourist"

**Expected Console Logs:**
```
🚀 Tourist login attempt: {userType: ...}
📝 Login data being sent: {identifier: "tourist@demo.com", ...}
🔓 Tourist Login - Credentials: {identifier: "tourist@demo.com", ...}
✅ Mock Tourist User Created: {role: "tourist", ...}
📡 API Response: {success: true, data: {user: {role: "tourist"}}}
🔐 Authentication state changed: isAuthenticated: true, user: {role: "tourist"}
🗃 Navigating to: /user-dashboard
🚀 Actually navigating to: /user-dashboard
🗃 User dashboard route check: isAuthenticated: true, user: {...}
✅ Rendering UserDashboard
```

### ✅ Test Admin Login

1. **Go to:** http://localhost:5173/admin-login
2. **Fill form:**
   - Email: `admin@demo.com`
   - Password: (leave empty or any text)
   - Department: Select "Security"
   - Badge: `SF001`
3. **Click:** "Login as Authority"

**Expected Console Logs:**
```
🚀 Admin login attempt: {email: "admin@demo.com", ...}
📝 Admin login data being sent: {...}
🔓 Authority Login - Credentials: {...}
✅ Mock Admin User Created: {role: "authority", ...}
📡 Admin API Response: {success: true, data: {user: {role: "authority"}}}
🔐 Authentication state changed: isAuthenticated: true, user: {role: "authority"}
🗃 Navigating to admin dashboard...
🚀 Actually navigating to admin dashboard
🗃 Admin dashboard route check: isAuthenticated: true, user: {...}
✅ Rendering AdminDashboard
```

## 🔍 Troubleshooting

### Issue: Still redirecting to wrong page

**Check console for:**
1. **User role:** Look for `🎯 User role: "tourist"` or `"authority"`
2. **Authentication state:** Look for `🔐 Authentication state changed`
3. **Navigation logs:** Look for `🚀 Actually navigating to`
4. **Route checks:** Look for `🗃 [Dashboard] route check`

### Issue: Not navigating at all

**Possible causes:**
1. **API error:** Look for `❌` error logs
2. **State not set:** Check if `isAuthenticated: true` appears
3. **Navigation blocked:** Look for redirect logs

### Issue: Getting blank screen

**Steps:**
1. **Check console errors:** Red error messages
2. **Check network tab:** Should see failed API calls (normal for offline mode)
3. **Try direct URLs:**
   - http://localhost:5173/user-dashboard
   - http://localhost:5173/admin-dashboard

## 🛠 Quick Fixes

### Clear Everything:
```js
// In browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Force Navigation Test:
```js
// In browser console after login:
console.log('Current state:', {
  isAuthenticated: true, // should be true
  user: {...} // should have user object
});
```

### Direct Dashboard Test:
- Go directly to: http://localhost:5173/user-dashboard
- Go directly to: http://localhost:5173/admin-dashboard

## 📊 Expected Results

- ✅ Tourist login → User Dashboard loads
- ✅ Admin login → Admin Dashboard loads  
- ✅ Console shows all debug logs
- ✅ No redirect loops or errors
- ✅ Navigation works properly

## 🆘 If Still Not Working

1. **Copy all console logs** from a failed attempt
2. **Note exact steps** you took
3. **Try the direct URL test:** Go to dashboard URLs directly
4. **Check browser network tab** for any errors
