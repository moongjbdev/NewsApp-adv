const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 Setting up environment variables...\n');

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('Please backup your current .env file and run this script again.');
  process.exit(1);
}

// Read env.example
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ env.example file not found!');
  process.exit(1);
}

const envExample = fs.readFileSync(envExamplePath, 'utf8');

// Generate secure JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

// Replace placeholders with secure values
let envContent = envExample
  .replace('your_super_secret_jwt_key_here_change_this_in_production_make_it_long_and_random', jwtSecret)
  .replace('your_newsdata_api_key_here', 'YOUR_NEWSDATA_API_KEY_HERE');

// Write .env file
fs.writeFileSync(envPath, envContent);

console.log('✅ .env file created successfully!');
console.log('📝 Generated secure JWT secret');
console.log('\n🔑 Next steps:');
console.log('1. Edit .env file and add your NewsData.io API key');
console.log('2. Update CORS_ORIGIN if needed');
console.log('3. Update MONGODB_URI if using different database');
console.log('\n⚠️  Security notes:');
console.log('- Keep your .env file secure and never commit it to version control');
console.log('- Use different JWT secrets for different environments');
console.log('- Regularly rotate your API keys'); 