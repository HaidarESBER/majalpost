# Issues Found in Codebase

## 🔴 Critical Issues

### 1. Missing `.env.example` File
**Location**: `backend/`
**Issue**: No template file for environment variables
**Impact**: Developers don't know what environment variables are required
**Recommendation**: Create `backend/.env.example` with all required variables and documentation

**Required variables**:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/majalpost
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
THUMBNAIL_DIR=./uploads/thumbnails
MAX_FILE_SIZE=10485760
```

### 2. Security: Weak Default JWT Secret
**Location**: `backend/src/config/env.ts:31`
**Issue**: Default JWT_SECRET is `'your-secret-key-change-in-production'` which is weak and well-known
**Impact**: Security vulnerability if used in production without changing
**Recommendation**: 
- Remove default value or make it required in production
- Add validation to prevent weak secrets
- Add warning in development mode

### 3. Security: Hardcoded URLs in CSP
**Location**: `backend/src/index.ts:17`
**Issue**: Hardcoded localhost URLs in Content Security Policy
```typescript
imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000", "http://localhost:3000"],
```
**Impact**: Will not work in production with different domains
**Recommendation**: Use `env.FRONTEND_URL` or make CSP configurable

## 🟡 Important Issues

### 4. Upload Directories Not Created on Startup
**Location**: `backend/src/middleware/upload.ts:23`
**Issue**: Multer expects `uploads/original/` directory to exist, but it's not created automatically
**Impact**: File uploads will fail if directories don't exist
**Current Workaround**: Thumbnail directory is created in `generateThumbnail()` function
**Recommendation**: Create upload directories on server startup in `backend/src/index.ts`

### 5. Missing Path Validation in env.ts
**Location**: `backend/src/config/env.ts:33-34`
**Issue**: UPLOAD_DIR and THUMBNAIL_DIR use relative paths (`./uploads`) without validation
**Impact**: Could cause issues with path resolution, especially in production
**Recommendation**: 
- Resolve to absolute paths
- Validate paths exist or create them
- Consider using `path.resolve()` for consistent paths

### 6. CORS Configuration Uses Single Origin
**Location**: `backend/src/index.ts:23-26`
**Issue**: CORS only allows one origin from `env.FRONTEND_URL`
**Impact**: Won't work if frontend is served from multiple domains (e.g., staging + production)
**Recommendation**: Support multiple origins or use environment-specific configuration

## 🟢 Minor Issues / Improvements

### 7. No Input Validation Library
**Issue**: Manual validation in routes (e.g., checking `!email || !password`)
**Recommendation**: Consider using a validation library like `zod` or `joi` for consistent validation

### 8. Error Messages Could Leak Information
**Location**: Various route files
**Issue**: Some error messages might expose internal details
**Recommendation**: Review error messages for information leakage in production

### 9. Missing Rate Limiting
**Issue**: No rate limiting on authentication endpoints
**Impact**: Vulnerable to brute force attacks
**Recommendation**: Add rate limiting middleware (e.g., `express-rate-limit`)

### 10. Missing Request Body Size Limit Configuration
**Location**: `backend/src/index.ts:29-30`
**Issue**: `express.json()` and `express.urlencoded()` don't specify size limits
**Impact**: Potential DoS via large request bodies
**Recommendation**: Add explicit size limits

### 11. MongoDB Connection Error Handling
**Location**: `backend/src/config/db.ts:20-24`
**Issue**: Connection errors are logged but server still starts
**Current Behavior**: Server will fail on first DB operation if connection fails
**Recommendation**: Consider graceful shutdown or retry logic

### 12. Missing Health Check for Database
**Location**: `backend/src/routes/index.ts:18-27`
**Issue**: Health check endpoint doesn't verify database connection
**Impact**: Health check might pass even if DB is down
**Recommendation**: Add database connection check to health endpoint

### 13. File Cleanup on Error
**Location**: `backend/src/routes/media.ts:32`
**Issue**: File cleanup on validation error, but no cleanup for other error scenarios
**Impact**: Orphaned files if upload fails after file is saved
**Recommendation**: Add comprehensive error cleanup

### 14. Missing Type Safety for JWT Payload
**Location**: `backend/src/middleware/auth.ts:35`
**Issue**: JWT payload is cast without validation
```typescript
const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string; role: string; };
```
**Recommendation**: Validate payload structure

### 15. Hardcoded Admin Credentials in Script
**Location**: `backend/src/scripts/createAdminUser.ts:21-22`
**Issue**: Default admin email and password in script
```typescript
const email = process.env.ADMIN_EMAIL || 'haidar@majalpost.com';
const password = process.env.ADMIN_PASSWORD || 'admin123';
```
**Impact**: Weak default credentials if env vars not set
**Recommendation**: Require environment variables or use stronger defaults

## 📝 Documentation Issues

### 16. Missing API Documentation
**Issue**: No API documentation (OpenAPI/Swagger)
**Recommendation**: Add API documentation for easier integration

### 17. Missing README for Setup
**Issue**: No clear setup instructions in main README
**Recommendation**: Add comprehensive setup guide

## 🔧 Code Quality

### 18. Inconsistent Error Handling Patterns
**Location**: Various route files
**Issue**: Some routes handle errors differently
**Recommendation**: Standardize error handling patterns

### 19. Missing Input Sanitization
**Issue**: No explicit input sanitization for user-generated content
**Recommendation**: Add sanitization for HTML content in articles/comments

### 20. Console.log in Production Code
**Location**: `backend/src/index.ts:33-34`, `backend/src/routes/index.ts:93`
**Issue**: Debug console.log statements in production code
**Recommendation**: Use proper logging library (e.g., `winston` or `pino`)

## Summary

- **Critical**: 3 issues
- **Important**: 3 issues  
- **Minor/Improvements**: 14 issues

**Priority Actions**:
1. Create `.env.example` file
2. Fix JWT secret security issue
3. Create upload directories on startup
4. Fix hardcoded CSP URLs
5. Add rate limiting
6. Add request body size limits

