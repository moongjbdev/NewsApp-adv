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

async function testDuplicatePrevention() {
  try {
    console.log('🧪 Testing duplicate prevention...\n');

    // Get or create test users
    let userA = await User.findOne({ email: 'testuser1@example.com' });
    let userB = await User.findOne({ email: 'testuser2@example.com' });

    if (!userA) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      userA = new User({
        username: 'testuser1',
        email: 'testuser1@example.com',
        password: hashedPassword,
        fullName: 'Test User 1'
      });
      await userA.save();
    }

    if (!userB) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      userB = new User({
        username: 'testuser2',
        email: 'testuser2@example.com',
        password: hashedPassword,
        fullName: 'Test User 2'
      });
      await userB.save();
    }

    // Create test comment
    const testComment = new Comment({
      user: userA._id,
      article_id: 'test-article-duplicate',
      content: 'Test comment for duplicate prevention',
      parent_id: null
    });
    await testComment.save();

    // Create test reply
    const testReply = new Comment({
      user: userB._id,
      article_id: 'test-article-duplicate',
      content: 'Test reply for duplicate prevention',
      parent_id: testComment._id
    });
    await testReply.save();

    console.log('📝 Test setup completed');
    console.log('Comment ID:', testComment._id);
    console.log('Reply ID:', testReply._id);

    // Test 1: Create first notification
    console.log('\n🔔 Test 1: Creating first notification...');
    const notification1 = await NotificationGenerator.generateCommentReplyNotification(
      testComment._id,
      testReply._id
    );
    console.log('First notification created:', notification1 ? 'SUCCESS' : 'FAILED');

    // Test 2: Try to create duplicate immediately
    console.log('\n🔄 Test 2: Trying to create duplicate immediately...');
    const notification2 = await NotificationGenerator.generateCommentReplyNotification(
      testComment._id,
      testReply._id
    );
    console.log('Duplicate notification result:', notification2 ? 'CREATED (BUG)' : 'PREVENTED (GOOD)');

    // Test 3: Check database
    console.log('\n📊 Test 3: Checking database...');
    const notifications = await Notification.find({
      user_id: userA._id,
      type: 'comment_reply',
      'data.comment_id': testComment._id.toString()
    });

    console.log('Total notifications in database:', notifications.length);
    notifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. Created at: ${notif.createdAt.toLocaleTimeString()}`);
    });

    // Test 4: Test like notifications
    console.log('\n👍 Test 4: Testing like notifications...');
    const like1 = await NotificationGenerator.generateCommentLikeNotification(
      testComment._id,
      userB._id
    );
    console.log('First like notification:', like1 ? 'SUCCESS' : 'FAILED');

    const like2 = await NotificationGenerator.generateCommentLikeNotification(
      testComment._id,
      userB._id
    );
    console.log('Duplicate like notification:', like2 ? 'CREATED (BUG)' : 'PREVENTED (GOOD)');

    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await Comment.deleteMany({ _id: { $in: [testComment._id, testReply._id] } });
    await Notification.deleteMany({ 
      user_id: userA._id,
      $or: [
        { 'data.comment_id': testComment._id.toString() },
        { 'data.comment_id': testComment._id }
      ]
    });

    console.log('\n✅ Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testDuplicatePrevention(); 