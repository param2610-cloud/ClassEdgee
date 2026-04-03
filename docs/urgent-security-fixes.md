# Urgent Security & Architecture Fixes

## Status: Draft
## Date: 2026-04-04

---

## Executive Summary

Audit of the Node.js backend revealed that **140 out of 141 route handlers have no authentication middleware**. Combined with a 2-day access token TTL and tokens stored in localStorage, the entire API is effectively public. These issues must be fixed before any new feature work.

---

## P0 — Fix Immediately

### 1. No Auth Middleware on 140/141 Routes

**Severity**: Critical
**Impact**: Anyone who knows the API URL can create/read/update/delete students, faculty, attendance records, rooms, quizzes, schedules, departments — everything.

**Current State**:
- `validateToken` middleware is defined in `src/Router/general.router.js`
- It is applied to exactly ONE endpoint: `GET /api/v1/general/validate-token`
- All other 140 route handlers across 32 router files have zero authentication
- The frontend sends `Authorization: Bearer <token>` headers, but the backend never checks them

**Evidence**:
```
Files with auth middleware:  1  (general.router.js)
Files without auth:         31 (attendance, student, faculty, department,
                                section, room, equipment, schedule, quiz,
                                resource, query, curriculum, emergency,
                                timeslot, institution, classes, sessions,
                                activities, feedback, analogistics, etc.)
Total unprotected routes:   140
```

**Fix**:
1. Extract `validateToken` into `src/middlewares/auth.js` as a shared middleware
2. Create role-based middleware: `requireRole('faculty')`, `requireRole('coordinator')`, etc.
3. Apply `validateToken` to ALL routers in `server.js` except:
   - `POST /api/v1/student/login`
   - `POST /api/v1/faculty/login`
   - `POST /api/v1/coordinator/login`
   - `POST /api/v1/supreme/login`
   - `POST /api/v1/supreme/register`
   - `GET /health`
4. Apply role-based middleware to sensitive routes:
   - Coordinator-only: student CRUD, faculty CRUD, room/building management
   - Faculty-only: mark attendance, create quiz, manage resources
   - Student-only: submit quiz, submit feedback

**Estimated effort**: 1-2 hours

---

### 2. Access Token TTL = 2 Days

**Severity**: Critical
**Impact**: A stolen access token (via XSS, network sniffing, shared computer) remains valid for 48 hours. Attacker has full API access for 2 days.

**Current State** (`src/utils/generate.js`):
```javascript
generateTokens(email, "2d", "7d")
//                     ^^^ access token: 2 days (DANGEROUS)
//                          ^^^ refresh token: 7 days (acceptable)
```

**Industry Standard**:
- Access token: 15 minutes
- Refresh token: 7 days (current value is fine)

**Fix**:
1. Change access token expiry from `"2d"` to `"15m"` in all login controllers
2. Ensure the frontend refresh flow works correctly (it already calls `/refresh-token` on 401)
3. Test: login → wait 15 min → verify auto-refresh kicks in

**Estimated effort**: 5 minutes code change + 30 minutes testing

---

## P1 — Fix Before Demo/Review

### 3. No Rate Limiting on Login Endpoints

**Severity**: High
**Impact**: Brute-force password attacks are trivial. An attacker can try thousands of password combinations per minute with no throttling.

**Current State**: Zero rate limiting on any endpoint. No `express-rate-limit` or equivalent configured.

**Affected Endpoints**:
```
POST /api/v1/student/login
POST /api/v1/faculty/login
POST /api/v1/coordinator/login
POST /api/v1/supreme/login
POST /api/v1/supreme/register
```

**Fix**:
```javascript
// src/middlewares/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 10,                    // 10 attempts per window
    message: { error: "Too many login attempts. Try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,   // 1 minute
    max: 100,                   // 100 requests per minute
});
```

Apply `loginLimiter` to auth routes, `apiLimiter` globally.

**Estimated effort**: 15 minutes

---

### 4. Tokens Stored in localStorage (XSS Vector)

**Severity**: High
**Impact**: Any Cross-Site Scripting (XSS) vulnerability allows an attacker to steal both access and refresh tokens, gaining full persistent access to the victim's account.

**Current State**:
- Frontend stores `accessToken` and `refreshToken` in `localStorage`
- `localStorage` is accessible to any JavaScript running on the page
- A single XSS bug (e.g., unsanitized user input rendered as HTML) = full account takeover

**Fix**:
1. **Refresh token** → httpOnly, Secure, SameSite=Strict cookie (set by Node backend on login)
   - JavaScript cannot read httpOnly cookies → immune to XSS
   - Browser auto-sends on every request to the same origin
2. **Access token** → in-memory only (Redux store or module-scoped variable)
   - Lost on page refresh, but immediately refreshed via the httpOnly cookie
   - Never persisted to localStorage or sessionStorage
3. Update Node login/refresh endpoints to set the cookie:
   ```javascript
   res.cookie('refreshToken', refreshToken, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'strict',
       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
       path: '/api/v1/general/refresh-token',
   });
   ```
4. Update frontend `AuthContext` to:
   - Store access token in memory (not localStorage)
   - On page load: call `/refresh-token` (cookie auto-sent) → get new access token
   - Remove all `localStorage.setItem('accessToken', ...)` calls

**Estimated effort**: 2-3 hours

---

## P2 — Fix Before Showing to Recruiters

### 5. Cloudinary API Key Exposed in Frontend Bundle

**Severity**: Medium
**Impact**: `VITE_CLOUDINARY_API_KEY` is compiled into the frontend JavaScript bundle. Anyone can inspect the browser's network tab or source maps to extract it. Combined with other Cloudinary credentials, this could allow unauthorized uploads or API abuse.

**Current State**:
```
VITE_CLOUDINARY_CLOUD_NAME   → in frontend bundle (OK — public by design)
VITE_CLOUDINARY_UPLOAD_PRESET → in frontend bundle (OK — unsigned preset)
VITE_CLOUDINARY_API_KEY       → in frontend bundle (BAD — should be server-side only)
```

**Fix**:
1. Remove `VITE_CLOUDINARY_API_KEY` from frontend `.env`
2. Frontend uploads using **unsigned upload preset only** (already works this way in `Cloudinary.tsx`)
3. If signed uploads are ever needed, proxy through Node backend
4. Keep `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in Node backend `.env` only

**Estimated effort**: 30 minutes

---

## Implementation Order

```
Week 1 (before any feature work):
  Day 1: Fix #1 (auth middleware on all routes) + Fix #2 (token TTL 15m)
  Day 2: Fix #3 (rate limiting) + Fix #5 (remove API key from frontend)
  Day 3-4: Fix #4 (httpOnly cookies for refresh token)
  Day 5: End-to-end testing of all auth flows

Week 2+: Begin face attendance redesign (see face-attendance-architecture.md)
```

---

## Verification Checklist

After fixes are applied, verify:

- [ ] Unauthenticated `GET /api/v1/student/list-of-student` returns 401
- [ ] Unauthenticated `POST /api/v1/attendance/mark-attendance` returns 401
- [ ] Student token cannot access `POST /api/v1/faculty/createfaculty` (role check)
- [ ] Access token expires after 15 minutes (not 2 days)
- [ ] Auto-refresh works: token expires → 401 → refresh → retry succeeds
- [ ] 11th login attempt within 15 minutes returns 429 Too Many Requests
- [ ] `localStorage` contains no tokens (check browser DevTools → Application → Local Storage)
- [ ] Refresh token visible only in browser cookies (httpOnly flag set)
- [ ] Browser source/bundle does not contain `CLOUDINARY_API_KEY`
- [ ] All existing features still work after auth changes
