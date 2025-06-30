const mongoose = require('mongoose');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function testReplyNotification() {
  try {
    console.log('🧪 Testing reply notification...\n');

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

    // Create a comment from userA
    const originalComment = new Comment({
      user: userA._id,
      article_id: 'test-article-reply',
      content: 'This is a test comment that will receive a reply',
      parent_id: null
    });
    await originalComment.save();
    console.log('💬 Original comment created:', originalComment._id);

    // Create a reply from userB
    const reply = new Comment({
      user: userB._id,
      article_id: 'test-article-reply',
      content: 'This is a reply to test notification',
      parent_id: originalComment._id
    });
    await reply.save();
    console.log('💬 Reply created:', reply._id);

    // Check if notification was created automatically
    console.log('\n📊 Checking for automatic notification...');
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
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testReplyNotification(); 