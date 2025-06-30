const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function resetTestPasswords() {
  try {
    console.log('🔐 Resetting test user passwords...\n');

    const testPassword = 'password123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // Reset password for testuser1
    const user1 = await User.findOneAndUpdate(
      { email: 'testuser1@example.com' },
      { password: hashedPassword },
      { new: true }
    );

    if (user1) {
      console.log('✅ testuser1 password reset successfully');
    } else {
      console.log('❌ testuser1 not found');
    }

    // Reset password for testuser2
    const user2 = await User.findOneAndUpdate(
      { email: 'testuser2@example.com' },
      { password: hashedPassword },
      { new: true }
    );

    if (user2) {
      console.log('✅ testuser2 password reset successfully');
    } else {
      console.log('❌ testuser2 not found');
    }

    console.log('\n🔑 Test password: password123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

resetTestPasswords(); 