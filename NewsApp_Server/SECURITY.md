# 🔒 Security Guide - NewsApp Server

## Overview
This document outlines security best practices and configuration for the NewsApp Server.

## 🚨 Critical Security Requirements

### 1. Environment Variables
**ALWAYS** use environment variables for sensitive data. Never hardcode:
- API keys
- JWT secrets
- Database URLs
- Passwords

### 2. Required Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/newsapp

# Security
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production_make_it_long_and_random
BCRYPT_ROUNDS=12

# API Keys
NEWSDATA_API_KEY=your_newsdata_api_key_here

# Server
PORT=5000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
```

## 🔧 Setup Instructions

### 1. Initial Setup
```bash
# Generate secure .env file
npm run setup-env

# Edit .env file with your actual values
nano .env

# Run security check
npm run security-check
```

### 2. JWT Secret Requirements
- Minimum 32 characters
- Recommended 64+ characters
- Use random generation
- Different secrets for different environments

### 3. API Key Security
- Store NewsData.io API key securely
- Rotate keys regularly
- Monitor API usage
- Use environment-specific keys

## 🛡️ Security Features

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (admin, editor, user)
- Password hashing with bcrypt
- Token expiration (7 days)

### 2. Rate Limiting
- Global rate limiting: 100 requests per 15 minutes
- External API rate limiting protection
- Stale cache fallback on rate limit

### 3. Input Validation
- Request body validation
- SQL injection prevention (MongoDB)
- XSS protection
- CORS configuration

### 4. Error Handling
- Generic error messages in production
- Detailed logging in development
- Graceful error handling
- No sensitive data in error responses

## 🔍 Security Monitoring

### 1. Logging
- Authentication attempts
- API rate limit violations
- Error tracking
- Performance monitoring

### 2. Health Checks
```bash
GET /health
```
Returns server status without sensitive information.

### 3. Security Headers
- CORS configuration
- Content-Type validation
- Request size limits

## 🚨 Security Checklist

### Before Deployment
- [ ] All environment variables set
- [ ] JWT secret is strong (64+ characters)
- [ ] API keys are valid and secure
- [ ] CORS origins are specific (no wildcards)
- [ ] Database connection is secure
- [ ] Rate limiting is enabled
- [ ] Error handling is production-ready
- [ ] No hardcoded secrets in code
- [ ] Security check passes: `npm run security-check`

### Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Rotate API keys quarterly
- [ ] Review access logs weekly
- [ ] Monitor rate limit violations
- [ ] Backup database regularly
- [ ] Test security features

## 🐛 Common Security Issues

### 1. Missing Environment Variables
```bash
❌ Missing required environment variables: JWT_SECRET, NEWSDATA_API_KEY
```
**Solution**: Run `npm run setup-env` and configure all variables.

### 2. Weak JWT Secret
```bash
❌ JWT_SECRET is too short (minimum 32 characters)
```
**Solution**: Generate a longer secret using the setup script.

### 3. Hardcoded Secrets
```bash
❌ Hardcoded secrets found in server.js
```
**Solution**: Remove hardcoded values and use environment variables.

### 4. CORS Wildcards
```bash
⚠️ CORS_ORIGIN contains wildcard (*) - consider specific origins
```
**Solution**: Specify exact origins instead of wildcards.

## 🔧 Security Scripts

### Setup Environment
```bash
npm run setup-env
```
Generates secure .env file with random JWT secret.

### Security Check
```bash
npm run security-check
```
Validates security configuration and reports issues.

## 📞 Security Contact

For security issues or questions:
1. Review this document
2. Run security check script
3. Check server logs
4. Contact development team

## 📚 Additional Resources

- [OWASP Security Guidelines](https://owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practices-security.html)
- [MongoDB Security](https://docs.mongodb.com/manual/security/) 