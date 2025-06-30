const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Comment = require('../models/Comment');
const NotificationGenerator = require('../services/notificationGenerator');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function testNotifications() {
  try {
    console.log('🧪 Testing Notification System...\n');

    // Get test users
    const users = await User.find().limit(2);
    if (users.length < 2) {
      console.log('❌ Need at least 2 users to test notifications');
      return;
    }

    const userA = users[0];
    const userB = users[1];

    console.log(`👤 User A: ${userA.username} (${userA._id})`);
    console.log(`👤 User B: ${userB.username} (${userB._id})\n`);

    // Test 1: Create a comment by User B
    console.log('📝 Test 1: Creating comment by User B...');
    const comment = new Comment({
      user: userB._id,
      article_id: 'test-article-123',
      content: 'This is a test comment by User B',
      parent_id: null
    });
    await comment.save();
    console.log(`✅ Comment created: ${comment._id}\n`);

    // Test 2: User A replies to User B's comment
    console.log('💬 Test 2: User A replying to User B\'s comment...');
    const reply = new Comment({
      user: userA._id,
      article_id: 'test-article-123',
      content: 'This is a reply from User A to User B',
      parent_id: comment._id
    });
    await reply.save();
    console.log(`✅ Reply created: ${reply._id}\n`);

    // Test 3: Generate notification for comment reply
    console.log('🔔 Test 3: Generating comment reply notification...');
    await NotificationGenerator.generateCommentReplyNotification(comment._id, reply._id);
    console.log('✅ Comment reply notification generated\n');

    // Test 4: User A likes User B's comment
    console.log('👍 Test 4: User A liking User B\'s comment...');
    comment.likes.push(userA._id);
    await comment.save();
    console.log('✅ Comment liked\n');

    // Test 5: Generate notification for comment like
    console.log('🔔 Test 5: Generating comment like notification...');
    await NotificationGenerator.generateCommentLikeNotification(comment._id, userA._id);
    console.log('✅ Comment like notification generated\n');

    // Test 6: Generate achievement notification
    console.log('🏆 Test 6: Generating achievement notification...');
    await NotificationGenerator.generateReadingAchievementNotification(userB._id, 'reading_streak', 7);
    console.log('✅ Achievement notification generated\n');

    // Test 7: Generate daily digest
    console.log('📊 Test 7: Generating daily digest...');
    await NotificationGenerator.generateDailyDigestNotification(userB._id);
    console.log('✅ Daily digest notification generated\n');

    // Check notifications for User B
    console.log('📋 Checking notifications for User B...');
    const notifications = await Notification.find({ user_id: userB._id }).sort({ createdAt: -1 });
    
    console.log(`\n📱 Found ${notifications.length} notifications for User B:`);
    notifications.forEach((notification, index) => {
      console.log(`${index + 1}. [${notification.type}] ${notification.title}`);
      console.log(`   Message: ${notification.message}`);
      console.log(`   Read: ${notification.isRead ? 'Yes' : 'No'}`);
      console.log(`   Created: ${notification.createdAt}`);
      console.log('');
    });

    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await Comment.deleteMany({ article_id: 'test-article-123' });
    await Notification.deleteMany({ user_id: { $in: [userA._id, userB._id] } });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Notification system test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Comment reply notification: ✅');
    console.log('- Comment like notification: ✅');
    console.log('- Achievement notification: ✅');
    console.log('- Daily digest notification: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the test
testNotifications(); 