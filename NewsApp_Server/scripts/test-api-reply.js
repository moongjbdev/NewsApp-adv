const mongoose = require('mongoose');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const axios = require('axios');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function testAPIReply() {
  try {
    console.log('🧪 Testing API reply notification...\n');

    // Get test users
    const userA = await User.findOne({ email: 'testuser1@example.com' });
    const userB = await User.findOne({ email: 'testuser2@example.com' });

    if (!userA || !userB) {
      console.log('❌ Test users not found');
      return;
    }

    console.log('👥 Test users:');
    console.log('User A:', userA.username, '(will receive notification)');
    console.log('User B:', userB.username, '(will create reply)');

    // Login as userB
    console.log('\n🔐 Logging in as userB...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testuser2@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ UserB logged in successfully');

    // Create original comment via API
    console.log('\n💬 Creating original comment via API...');
    const originalCommentResponse = await axios.post('http://localhost:5000/api/comments', {
      article_id: 'test-article-api-reply',
      content: 'This is an original comment for API test'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const originalComment = originalCommentResponse.data.comment;
    console.log('✅ Original comment created:', originalComment._id);

    // Create reply via API
    console.log('\n💬 Creating reply via API...');
    const replyResponse = await axios.post('http://localhost:5000/api/comments', {
      article_id: 'test-article-api-reply',
      content: 'This is a reply via API',
      parent_id: originalComment._id
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const reply = replyResponse.data.comment;
    console.log('✅ Reply created:', reply._id);

    // Check notifications
    console.log('\n📊 Checking notifications...');
    const notifications = await Notification.find({
      user_id: userA._id,
      type: 'comment_reply'
    });

    console.log('Total reply notifications for userA:', notifications.length);
    notifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. ID: ${notif._id}`);
      console.log(`     Title: ${notif.title}`);
      console.log(`     Message: ${notif.message}`);
      console.log(`     Created: ${notif.createdAt.toLocaleTimeString()}`);
    });

    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await Comment.deleteMany({ 
      _id: { $in: [originalComment._id, reply._id] } 
    });
    await Notification.deleteMany({ 
      user_id: userA._id,
      type: 'comment_reply'
    });

    console.log('\n✅ Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testAPIReply(); 