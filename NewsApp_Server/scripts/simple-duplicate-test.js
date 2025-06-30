const mongoose = require('mongoose');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const NotificationGenerator = require('../services/notificationGenerator');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function simpleDuplicateTest() {
  try {
    console.log('🧪 Simple duplicate prevention test...\n');

    // Get test users
    const userA = await User.findOne({ email: 'testuser1@example.com' });
    const userB = await User.findOne({ email: 'testuser2@example.com' });

    // Create test comment and reply
    const testComment = new Comment({
      user: userA._id,
      article_id: 'simple-test-article',
      content: 'Simple test comment',
      parent_id: null
    });
    await testComment.save();

    const testReply = new Comment({
      user: userB._id,
      article_id: 'simple-test-article',
      content: 'Simple test reply',
      parent_id: testComment._id
    });
    await testReply.save();

    console.log('📝 Test setup:');
    console.log('Comment ID:', testComment._id.toString());
    console.log('Reply ID:', testReply._id.toString());

    // Test 1: Create first notification
    console.log('\n🔔 Test 1: Creating first notification...');
    const result1 = await NotificationGenerator.generateCommentReplyNotification(
      testComment._id,
      testReply._id
    );
    console.log('Result:', result1 ? 'SUCCESS' : 'FAILED');

    // Check database
    const count1 = await Notification.countDocuments({
      user_id: userA._id,
      type: 'comment_reply'
    });
    console.log('Notifications in DB:', count1);

    // Test 2: Try to create duplicate
    console.log('\n🔄 Test 2: Trying to create duplicate...');
    const result2 = await NotificationGenerator.generateCommentReplyNotification(
      testComment._id,
      testReply._id
    );
    console.log('Result:', result2 ? 'CREATED (BUG)' : 'PREVENTED (GOOD)');

    // Check database again
    const count2 = await Notification.countDocuments({
      user_id: userA._id,
      type: 'comment_reply'
    });
    console.log('Notifications in DB:', count2);

    // Show all notifications
    const notifications = await Notification.find({
      user_id: userA._id,
      type: 'comment_reply'
    });

    console.log('\n📋 All notifications:');
    notifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. ID: ${notif._id}`);
      console.log(`     Data:`, notif.data);
    });

    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await Comment.deleteMany({ _id: { $in: [testComment._id, testReply._id] } });
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

simpleDuplicateTest(); 