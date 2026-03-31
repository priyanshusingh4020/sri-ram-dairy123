# Login Debug - Step-by-Step Fix

## Current Status: 2/4 Steps Complete

**Issue**: Login shows '❌ Login failed. Please try again.'

**Root Cause**:
- Backend server not running (port 3000 empty)
- AuthService URL mismatch (localhost:3000 vs proxy /api)

**Execution Plan**:
- [x] Step 1: Start backend server (`cd server; node server-fixed.js`)
- [x] Step 2: Fix AuthService to use proxy URL (`/api/auth`)
- [ ] Step 3: Test login with demo@example.com/demo123
- [ ] Step 4: Verify dashboard loads data

**Commands to run**:
```
# Backend (keep running)
cd server && npm start

# Frontend
ng serve
```

