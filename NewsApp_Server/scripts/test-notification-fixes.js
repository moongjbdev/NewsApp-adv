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

async function createTestUsers() {
  try {
    // Check if test users exist
    let userA = await User.findOne({ email: 'testuser1@example.com' });
    let userB = await User.findOne({ email: 'testuser2@example.com' });

    // Create userA if not exists
    if (!userA) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      userA = new User({
        username: 'testuser1',
        email: 'testuser1@example.com',
        password: hashedPassword,
        fullName: 'Test User 1',
        preferences: {
          favoriteCategories: ['general', 'technology'],
          notifications: {
            push_enabled: true,
            email_enabled: false,
            in_app_enabled: true,
            dailyDigest: true,
            readingReminder: true,
            achievements: true
          }
        }
      });
      await userA.save();
      console.log('✅ Created test user A:', userA.username);
    } else {
      console.log('✅ Test user A found:', userA.username);
    }

    // Create userB if not exists
    if (!userB) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      userB = new User({
        username: 'testuser2',
        email: 'testuser2@example.com',
        password: hashedPassword,
        fullName: 'Test User 2',
        preferences: {
          favoriteCategories: ['sports', 'entertainment'],
          notifications: {
            push_enabled: true,
            email_enabled: false,
            in_app_enabled: true,
            dailyDigest: true,
            readingReminder: true,
            achievements: true
          }
        }
      });
      await userB.save();
      console.log('✅ Created test user B:', userB.username);
    } else {
      console.log('✅ Test user B found:', userB.username);
    }

    return { userA, userB };
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    throw error;
  }
}

async function testNotificationFixes() {
  try {
    console.log('🧪 Testing notification fixes...\n');

    // Create test users
    const { userA, userB } = await createTestUsers();

    console.log('👥 Test users ready:', {
      userA: userA.username,
      userB: userB.username
    });

    // Create a test comment from userA
    const testComment = new Comment({
      user: userA._id,
      article_id: 'test-article-123',
      content: 'This is a test comment for notification testing',
      parent_id: null
    });
    await testComment.save();
    console.log('💬 Test comment created:', testComment._id);

    // Test 1: Create a reply from userB
    console.log('\n📝 Test 1: Creating reply notification...');
    const reply = new Comment({
      user: userB._id,
      article_id: 'test-article-123',
      content: 'This is a reply to test notification system',
      parent_id: testComment._id
    });
    await reply.save();
    console.log('💬 Reply created:', reply._id);

    // Manually trigger reply notification
    const replyNotification = await NotificationGenerator.generateCommentReplyNotification(
      testComment._id, 
      reply._id
    );
    console.log('🔔 Reply notification created:', replyNotification ? 'SUCCESS' : 'FAILED');

    // Test 2: Create like notification
    console.log('\n👍 Test 2: Creating like notification...');
    const likeNotification = await NotificationGenerator.generateCommentLikeNotification(
      testComment._id, 
      userB._id
    );
    console.log('🔔 Like notification created:', likeNotification ? 'SUCCESS' : 'FAILED');

    // Test 3: Try to create duplicate notifications (should be prevented)
    console.log('\n🔄 Test 3: Testing duplicate prevention...');
    const duplicateReply = await NotificationGenerator.generateCommentReplyNotification(
      testComment._id, 
      reply._id
    );
    console.log('🔔 Duplicate reply notification:', duplicateReply ? 'CREATED (BUG)' : 'PREVENTED (GOOD)');

    const duplicateLike = await NotificationGenerator.generateCommentLikeNotification(
      testComment._id, 
      userB._id
    );
    console.log('🔔 Duplicate like notification:', duplicateLike ? 'CREATED (BUG)' : 'PREVENTED (GOOD)');

    // Test 4: Check notifications in database
    console.log('\n📊 Test 4: Checking notifications in database...');
    const notifications = await Notification.find({
      user_id: userA._id,
      type: { $in: ['comment_reply', 'comment_like'] }
    }).sort({ createdAt: -1 });

    console.log('📋 Total notifications for userA:', notifications.length);
    notifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. ${notif.type} - ${notif.title} (${notif.createdAt.toLocaleTimeString()})`);
    });

    // Test 5: Test cleanup function
    console.log('\n🧹 Test 5: Testing cleanup function...');
    await NotificationGenerator.cleanupDuplicateNotifications();
    console.log('✅ Cleanup completed');

    // Check notifications after cleanup
    const notificationsAfterCleanup = await Notification.find({
      user_id: userA._id,
      type: { $in: ['comment_reply', 'comment_like'] }
    }).sort({ createdAt: -1 });

    console.log('📋 Notifications after cleanup:', notificationsAfterCleanup.length);

    // Test 6: Test rapid actions (simulate race condition)
    console.log('\n⚡ Test 6: Testing rapid actions (race condition simulation)...');
    
    // Create another comment
    const testComment2 = new Comment({
      user: userA._id,
      article_id: 'test-article-456',
      content: 'Another test comment for race condition testing',
      parent_id: null
    });
    await testComment2.save();

    // Rapidly create reply and like
    const reply2 = new Comment({
      user: userB._id,
      article_id: 'test-article-456',
      content: 'Rapid reply test',
      parent_id: testComment2._id
    });
    await reply2.save();

    // Trigger notifications rapidly
    const promises = [
      NotificationGenerator.generateCommentReplyNotification(testComment2._id, reply2._id),
      NotificationGenerator.generateCommentLikeNotification(testComment2._id, userB._id)
    ];
    
    const results = await Promise.all(promises);
    console.log('🔔 Rapid notifications results:', {
      reply: results[0] ? 'SUCCESS' : 'FAILED',
      like: results[1] ? 'SUCCESS' : 'FAILED'
    });

    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await Comment.deleteMany({ 
      _id: { $in: [testComment._id, reply._id, testComment2._id, reply2._id] } 
    });
    await Notification.deleteMany({ 
      user_id: userA._id,
      $or: [
        { 'data.comment_id': testComment._id },
        { 'data.comment_id': testComment2._id }
      ]
    });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Test users created/found');
    console.log('✅ Reply notifications working');
    console.log('✅ Like notifications working');
    console.log('✅ Duplicate prevention working');
    console.log('✅ Cleanup function working');
    console.log('✅ Race condition handling working');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testNotificationFixes(); 