# 🔒 JKPLUS_ Security Guidelines

## Overview

This document outlines security best practices for the JKPLUS_ construction workforce matching platform. As this system handles sensitive personal information (PII) and financial data, security is paramount.

---

## ⚠️ Critical Security Issues & Solutions

### 1. **Client-Side Storage of PII (FIXED)**

**Problem (Before):**
```javascript
// ❌ DANGEROUS: Storing sensitive data in localStorage
localStorage.setItem('userProfiles', JSON.stringify({
    rrn: '900101-1234567',           // Social Security Number
    accountNumber: '111-222-333444', // Bank Account
    signatureDataUrl: '...',         // Personal signature
}));
```

**Solution (After):**
```javascript
// ✅ SAFE: Store only non-sensitive identifiers
localStorage.setItem('userProfiles', JSON.stringify({
    phone: '01011112222',
    name: '김테스트',
    registrationDate: '2024-07-20T09:00:00.000Z',
    // Sensitive data NOT stored on client
}));
```

**Implementation:**
- PII (RRN, Bank Account, Signatures) **MUST** be stored on the server
- Client stores only: `phone`, `name`, `registration date`
- Sensitive data accessed via **authenticated API calls only**
- Server-side encryption required for all sensitive data

---

### 2. **API Keys Management (CRITICAL)**

**Problem (Before):**
```javascript
// ❌ DANGEROUS: Hardcoding API keys in code
const GEMINI_API_KEY = 'sk-...'; // Exposed in source!
```

**Solution (After):**
```javascript
// ✅ SAFE: Environment variables + Server-side API calls
// Client: Request to your backend
const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    body: JSON.stringify(data)
});

// Server: Use environment variable
const apiKey = process.env.GEMINI_API_KEY; // Not exposed
const result = await callGeminiAPI(data, apiKey);
```

**Requirements:**
- ❌ Never expose API keys to client-side code
- ✅ Store keys in `.env` files (server-side only)
- ✅ Use `.env.example` as template (never commit `.env`)
- ✅ Rotate keys immediately if exposed
- ✅ Use short-lived API tokens when possible

---

### 3. **Environment Variables**

**Configuration:**
```
.env              ← NEVER commit (contains secrets)
.env.example      ← Safe template (commit this)
.env.local        ← Local development (add to .gitignore)
```

**Verification:**
```bash
# Check that .env is in .gitignore
grep "\.env" .gitignore

# List what Git will ignore
git check-ignore .env
git check-ignore .env.local
```

---

## 🛡️ Implementation Checklist

### Development Phase

- [ ] Separate test data from production data
- [ ] Test data only in `NODE_ENV === 'development'`
- [ ] Use environment variables for all configuration
- [ ] Never commit `.env`, `.env.local` files
- [ ] Add security comments to sensitive code sections

### Before Deployment

- [ ] Audit all `localStorage` usage (remove PII)
- [ ] Check for hardcoded API keys in code
- [ ] Verify `.env.example` is committed (template)
- [ ] Verify `.env` is in `.gitignore`
- [ ] Review all network requests use HTTPS
- [ ] Enable Content Security Policy (CSP) headers
- [ ] Test XSS protection mechanisms

### After Deployment

- [ ] Monitor access logs for suspicious activity
- [ ] Implement rate limiting on sensitive endpoints
- [ ] Set up audit logging for PII access
- [ ] Enable CORS only for trusted domains
- [ ] Implement 2FA for admin accounts
- [ ] Regular security audits (monthly)
- [ ] Incident response plan in place

---

## 📋 Data Classification

### ✅ Safe to Store Locally

```typescript
interface SafeLocalData {
    userId: string;        // Phone number or ID
    userName: string;      // Display name only
    registrationDate: string;
    preferredAreas: string[];
    authToken?: string;    // HttpOnly cookie preferred
}
```

### ❌ NEVER Store Locally

```typescript
interface SensitiveData {
    rrn: string;                // 주민등록번호
    accountNumber: string;      // 계좌번호
    accountHolder: string;      // 예금주명
    signatureDataUrl: string;   // 서명 이미지
    bankAccountFile: string;    // 통장 이미지
    idCardFile: string;         // 신분증 사본
}
// These must ONLY be stored on encrypted server
```

---

## 🔐 Authentication & Authorization

### Session Management

```javascript
// ✅ RECOMMENDED: HttpOnly, Secure Cookies
Set-Cookie: authToken=...; HttpOnly; Secure; SameSite=Strict

// ❌ AVOID: localStorage for sensitive tokens
localStorage.setItem('token', '...'); // Vulnerable to XSS
```

### Multi-Factor Authentication

```typescript
// Required for:
interface ProtectedRoles {
    admin: true;           // Always 2FA
    employer: boolean;     // Recommended 2FA
    user: boolean;         // Optional 2FA
}
```

---

## 🚨 Incident Response

### If API Key is Exposed

1. **Immediate:**
   - [ ] Deactivate exposed key in provider dashboard
   - [ ] Generate new key
   - [ ] Update `.env` on server

2. **Short-term:**
   - [ ] Check logs for unauthorized usage
   - [ ] Monitor for suspicious activity
   - [ ] Notify team members

3. **Long-term:**
   - [ ] Audit how key was exposed
   - [ ] Implement additional safeguards
   - [ ] Update security guidelines

### If localStorage is Compromised (XSS)

1. **Immediate:**
   - [ ] Invalidate affected user sessions
   - [ ] Clear compromised browser caches
   - [ ] Notify affected users

2. **Short-term:**
   - [ ] Identify XSS vulnerability
   - [ ] Apply input validation fix
   - [ ] Test thoroughly

3. **Long-term:**
   - [ ] Implement CSP headers
   - [ ] Add SIEM/monitoring
   - [ ] Security training

---

## 📚 Security Headers (Backend Implementation)

When you build the backend, add these headers:

```javascript
// Express.js example
app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    
    // Prevent MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
    
    // HSTS (after HTTPS is confirmed)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    next();
});
```

---

## 🔗 Related Documentation

- See `README.md` for environment variable setup
- See individual app README files for specific security notes
- See backend documentation for server-side security

---

## 📞 Security Contact

If you discover a security vulnerability, please report it privately to the team rather than creating a public issue.

---

## 📅 Last Updated

- **Date:** 2024-06-29
- **Version:** 1.0
- **Status:** Active
