const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up NewsApp Backend...\n');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env file from env.example...');
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envExample);
    console.log('✅ .env file created successfully!');
    console.log('⚠️  Please edit .env file with your configuration before starting the server.\n');
  } else {
    console.log('❌ env.example file not found!');
    console.log('Please create a .env file manually with the following variables:');
    console.log('- MONGODB_URI');
    console.log('- JWT_SECRET');
    console.log('- PORT');
    console.log('- NODE_ENV\n');
  }
} else {
  console.log('✅ .env file already exists!\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  console.log('Run: npm install\n');
} else {
  console.log('✅ Dependencies already installed!\n');
}

console.log('🎉 Setup completed!');
console.log('\nNext steps:');
console.log('1. Edit .env file with your configuration');
console.log('2. Start MongoDB service');
console.log('3. Run: npm run dev (for development)');
console.log('4. Run: npm start (for production)');
console.log('\nHappy coding! 🚀'); 