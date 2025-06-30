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

async function testMultipleReplies() {
  try {
    console.log('🧪 Testing multiple replies...\n');

    // Get test users
    const userA = await User.findOne({ email: 'testuser1@example.com' });
    const userB = await User.findOne({ email: 'testuser2@example.com' });

    if (!userA || !userB) {
      console.log('❌ Test users not found');
      return;
    }

    console.log('👥 Test users:');
    console.log('User A:', userA.username, '(will receive notifications)');
    console.log('User B:', userB.username, '(will create replies)');

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
      article_id: 'test-article-multiple-replies',
      content: 'This is an original comment for multiple replies test'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const originalComment = originalCommentResponse.data.comment;
    console.log('✅ Original comment created:', originalComment._id);

    // Create multiple replies via API
    const replies = [];
    for (let i = 1; i <= 3; i++) {
      console.log(`\n💬 Creating reply ${i} via API...`);
      const replyResponse = await axios.post('http://localhost:5000/api/comments', {
        article_id: 'test-article-multiple-replies',
        content: `This is reply number ${i} via API`,
        parent_id: originalComment._id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const reply = replyResponse.data.comment;
      replies.push(reply);
      console.log(`✅ Reply ${i} created:`, reply._id);
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Check all replies in database
    console.log('\n📊 Checking all replies in database...');
    const allReplies = await Comment.find({
      parent_id: originalComment._id
    }).sort({ createdAt: 1 });

    console.log('Total replies in database:', allReplies.length);
    allReplies.forEach((reply, index) => {
      console.log(`  ${index + 1}. ID: ${reply._id}`);
      console.log(`     Content: ${reply.content}`);
      console.log(`     Created: ${reply.createdAt.toLocaleTimeString()}`);
    });

    // Check notifications
    console.log('\n📊 Checking notifications...');
    const notifications = await Notification.find({
      user_id: userA._id,
      type: 'comment_reply'
    }).sort({ createdAt: 1 });

    console.log('Total reply notifications for userA:', notifications.length);
    notifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. ID: ${notif._id}`);
      console.log(`     Title: ${notif.title}`);
      console.log(`     Message: ${notif.message}`);
      console.log(`     Reply ID: ${notif.data.reply_id}`);
      console.log(`     Created: ${notif.createdAt.toLocaleTimeString()}`);
    });

    // Test API to get replies
    console.log('\n🌐 Testing API to get replies...');
    const repliesResponse = await axios.get(`http://localhost:5000/api/comments/${originalComment._id}/replies`);
    const apiReplies = repliesResponse.data.replies;
    
    console.log('Replies from API:', apiReplies.length);
    apiReplies.forEach((reply, index) => {
      console.log(`  ${index + 1}. ID: ${reply._id}`);
      console.log(`     Content: ${reply.content}`);
    });

    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await Comment.deleteMany({ 
      _id: { $in: [originalComment._id, ...replies.map(r => r._id)] } 
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

testMultipleReplies(); 