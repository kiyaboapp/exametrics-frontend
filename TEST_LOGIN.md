# Login Issue Debug Guide

## Issue
Login failing with error: "Login API error: Object" and "Error response: undefined"

## Root Cause Analysis

The error shows that:
1. API call is being attempted
2. Error object is being caught but response is undefined
3. This typically indicates a CORS issue or network connectivity problem

## Fixes Applied

### 1. Environment File Fixed ✅
- Renamed `env.local` → `.env.local` (Next.js requires the dot)
- Content: `NEXT_PUBLIC_API_URL=https://exametrics.kiyabo.com/api/v1`

### 2. CORS Configuration ✅
- Changed `withCredentials: false` in axios config
- Added 30-second timeout

### 3. Enhanced Logging ✅
- Added API URL logging on initialization
- Added comprehensive error logging in login function
- Added detailed error information in AuthContext

## Testing Steps

### Step 1: Check API URL is Loaded
1. Open browser console (F12)
2. Look for: `🔗 API Base URL: https://exametrics.kiyabo.com/api/v1`
3. If you see `http://localhost:8000/api/v1`, the env file isn't being read

### Step 2: Test API Directly
Navigate to: http://localhost:3000/api-test
- Click "Test API Login"
- This will show the exact API response or error

### Step 3: Check Console Logs
When you try to login, you should see:
```
Attempting login with: anon@kiyabo.com
API Base URL: https://exametrics.kiyabo.com/api/v1
Sending login request to: https://exametrics.kiyabo.com/api/v1/auth/login
```

Then either:
- Success: `Login response: {access_token: "...", user: {...}}`
- Error: Detailed error with message, response, request, config

## Common Issues & Solutions

### Issue 1: CORS Error
**Symptom**: Error in console about CORS policy
**Solution**: Backend needs to allow requests from `http://localhost:3000`

Backend should have:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 2: Network Error
**Symptom**: "Network Error" in console
**Solution**: 
- Check if backend is running
- Verify URL is correct: `https://exametrics.kiyabo.com/api/v1`
- Test with curl or Postman

### Issue 3: 401 Unauthorized
**Symptom**: Status 401 in error response
**Solution**: Credentials are incorrect

### Issue 4: Environment Variable Not Loading
**Symptom**: API URL shows localhost instead of exametrics.kiyabo.com
**Solution**:
1. Ensure file is named `.env.local` (with dot)
2. Restart dev server: `npm run dev`
3. Clear browser cache and reload

## Test Credentials
- Username: `anon@kiyabo.com`
- Password: `anon@kiyabo.com`

## Manual API Test (PowerShell)
```powershell
$body = "username=anon@kiyabo.com&password=anon@kiyabo.com"
Invoke-RestMethod -Uri "https://exametrics.kiyabo.com/api/v1/auth/login" -Method Post -ContentType "application/x-www-form-urlencoded" -Body $body
```

This should return:
```
access_token : eyJhbGci...
token_type   : bearer
user         : @{id=...; username=anon@kiyabo.com; ...}
```

## Next Steps

1. **Restart the dev server** to ensure .env.local is loaded
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Check browser console** for the API URL log
4. **Try login** and check detailed error logs
5. **Visit /api-test** page to test API directly

## If Still Failing

Check these in order:
1. ✅ Is `.env.local` file present with correct content?
2. ✅ Did you restart the dev server after creating .env.local?
3. ✅ Does browser console show correct API URL?
4. ✅ Does /api-test page work?
5. ❓ Is there a CORS error in console?
6. ❓ Is the backend accessible from browser?
7. ❓ Does manual curl/PowerShell test work?

## Backend CORS Configuration Needed

If you're getting CORS errors, the backend needs:

```python
# In your FastAPI main.py or app initialization
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://exametrics.kiyabo.com",
        # Add your production frontend URL
    ],
    allow_credentials=False,  # Set to False if not using cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```
