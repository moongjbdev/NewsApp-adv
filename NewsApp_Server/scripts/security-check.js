const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔒 Security Check for NewsApp Server\n');

let issues = [];
let warnings = [];
let passed = [];

// Check 1: Environment variables
console.log('1. Checking environment variables...');
try {
  require('dotenv').config();
  
  const requiredVars = ['JWT_SECRET', 'NEWSDATA_API_KEY', 'MONGODB_URI'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    issues.push(`Missing required environment variables: ${missingVars.join(', ')}`);
  } else {
    passed.push('All required environment variables are set');
  }
  
  // Check JWT secret strength
  if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      issues.push('JWT_SECRET is too short (minimum 32 characters)');
    } else if (process.env.JWT_SECRET.length >= 64) {
      passed.push('JWT_SECRET is strong');
    } else {
      warnings.push('JWT_SECRET could be stronger (recommend 64+ characters)');
    }
  }
  
} catch (error) {
  issues.push('Failed to load environment variables');
}

// Check 2: .env file security
console.log('2. Checking .env file security...');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const stats = fs.statSync(envPath);
  const permissions = stats.mode.toString(8).slice(-3);
  
  if (permissions !== '600') {
    warnings.push(`.env file permissions should be 600 (current: ${permissions})`);
  } else {
    passed.push('.env file has correct permissions');
  }
} else {
  issues.push('.env file not found');
}

// Check 3: Package.json security
console.log('3. Checking package.json...');
const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Check for known vulnerable packages
  const vulnerablePackages = [
    'express-rate-limit@<7.0.0',
    'mongoose@<7.0.0',
    'jsonwebtoken@<9.0.0'
  ];
  
  let hasVulnerabilities = false;
  vulnerablePackages.forEach(pkg => {
    const [name, version] = pkg.split('@');
    if (packageJson.dependencies[name]) {
      warnings.push(`Consider updating ${name} to latest version for security`);
      hasVulnerabilities = true;
    }
  });
  
  if (!hasVulnerabilities) {
    passed.push('No known vulnerable packages detected');
  }
}

// Check 4: Code security patterns
console.log('4. Checking code security patterns...');
const serverPath = path.join(__dirname, '..', 'server.js');
if (fs.existsSync(serverPath)) {
  const serverCode = fs.readFileSync(serverPath, 'utf8');
  
  // Check for hardcoded secrets
  const hardcodedPatterns = [
    /['"]pub_[a-zA-Z0-9]+['"]/, // API keys
    /['"]your_jwt_secret_key_here['"]/, // JWT secrets
    /['"]mongodb:\/\/[^'"]+['"]/ // Database URLs
  ];
  
  hardcodedPatterns.forEach(pattern => {
    if (pattern.test(serverCode)) {
      issues.push('Hardcoded secrets found in server.js');
    }
  });
  
  // Check for security headers
  if (serverCode.includes('helmet')) {
    passed.push('Security headers middleware detected');
  } else {
    warnings.push('Consider adding helmet.js for security headers');
  }
}

// Check 5: Database security
console.log('5. Checking database configuration...');
const dbPath = path.join(__dirname, '..', 'config', 'database.js');
if (fs.existsSync(dbPath)) {
  const dbCode = fs.readFileSync(dbPath, 'utf8');
  
  if (dbCode.includes('useNewUrlParser') && dbCode.includes('useUnifiedTopology')) {
    passed.push('Database connection uses secure options');
  } else {
    warnings.push('Database connection should use secure options');
  }
}

// Check 6: Rate limiting
console.log('6. Checking rate limiting...');
const rateLimitPath = path.join(__dirname, '..', 'middleware', 'rateLimit.js');
if (fs.existsSync(rateLimitPath)) {
  passed.push('Rate limiting middleware is configured');
} else {
  issues.push('Rate limiting middleware not found');
}

// Check 7: CORS configuration
console.log('7. Checking CORS configuration...');
if (process.env.CORS_ORIGIN) {
  if (process.env.CORS_ORIGIN.includes('*')) {
    warnings.push('CORS_ORIGIN contains wildcard (*) - consider specific origins');
  } else {
    passed.push('CORS is configured with specific origins');
  }
} else {
  warnings.push('CORS_ORIGIN not configured');
}

// Print results
console.log('\n📊 Security Check Results:\n');

if (passed.length > 0) {
  console.log('✅ PASSED:');
  passed.forEach(item => console.log(`   ✓ ${item}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  warnings.forEach(item => console.log(`   ⚠ ${item}`));
  console.log('');
}

if (issues.length > 0) {
  console.log('❌ ISSUES:');
  issues.forEach(item => console.log(`   ✗ ${item}`));
  console.log('');
}

// Summary
const totalChecks = passed.length + warnings.length + issues.length;
console.log(`📈 Summary: ${passed.length}/${totalChecks} passed, ${warnings.length} warnings, ${issues.length} issues`);

if (issues.length > 0) {
  console.log('\n🚨 CRITICAL: Please fix the issues above before deploying to production!');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('\n⚠️  WARNING: Consider addressing the warnings above for better security.');
} else {
  console.log('\n🎉 All security checks passed!');
} 