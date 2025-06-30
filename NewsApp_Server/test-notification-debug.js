const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const Comment = require('./models/Comment');
const User = require('./models/User');
const NotificationGenerator = require('./services/notificationGenerator');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/newsapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testNotifications() {
  try {
    console.log('🔍 Testing notification system...\n');

    // 1. Check if we have users
    const users = await User.find().limit(2);
    console.log(`📊 Found ${users.length} users`);
    
    if (users.length < 2) {
      console.log('❌ Need at least 2 users to test notifications');
      return;
    }

    const user1 = users[0];
    const user2 = users[1];
    console.log(`👤 User 1: ${user1.username} (${user1._id})`);
    console.log(`👤 User 2: ${user2.username} (${user2._id})\n`);

    // 2. Check if we have comments
    const comments = await Comment.find().limit(1);
    console.log(`💬 Found ${comments.length} comments`);
    
    if (comments.length === 0) {
      console.log('❌ No comments found. Creating a test comment...');
      
      // Create a test comment
      const testComment = new Comment({
        user: user1._id,
        article_id: 'test-article-123',
        content: 'This is a test comment for notification testing',
        parent_id: null
      });
      await testComment.save();
      console.log(`✅ Created test comment: ${testComment._id}`);
    }

    const comment = comments[0] || await Comment.findOne();
    console.log(`💬 Using comment: ${comment._id} by user: ${comment.user}\n`);

    // 3. Test notification creation directly
    console.log('🧪 Testing direct notification creation...');
    const testNotification = new Notification({
      user_id: user1._id,
      type: 'comment_like',
      title: 'Test Notification',
      message: 'This is a test notification',
      data: {
        article_id: 'test-article-123',
        comment_id: comment._id,
        user_id: user2._id
      }
    });
    
    await testNotification.save();
    console.log(`✅ Created test notification: ${testNotification._id}\n`);

    // 4. Test notification generator
    console.log('🧪 Testing notification generator...');
    const generatedNotification = await NotificationGenerator.generateCommentLikeNotification(
      comment._id,
      user2._id
    );
    
    if (generatedNotification) {
      console.log(`✅ Generated notification: ${generatedNotification._id}`);
    } else {
      console.log('❌ No notification generated (might be duplicate prevention)');
    }
    console.log('');

    // 5. Check all notifications for user1
    console.log('📋 Checking all notifications for user1...');
    const userNotifications = await Notification.find({ user_id: user1._id }).sort({ createdAt: -1 });
    console.log(`📊 Found ${userNotifications.length} notifications for user1`);
    
    userNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.type} - ${notif.title} (${notif.isRead ? 'Read' : 'Unread'})`);
    });
    console.log('');

    // 6. Check unread count
    console.log('🔢 Checking unread count...');
    const unreadCount = await Notification.countDocuments({ 
      user_id: user1._id, 
      isRead: false,
      isDeleted: false 
    });
    console.log(`📊 Unread count: ${unreadCount}\n`);

    // 7. Test API endpoint simulation
    console.log('🌐 Testing API endpoint simulation...');
    const apiNotifications = await Notification.find({ 
      user_id: user1._id, 
      isDeleted: false 
    })
    .sort({ createdAt: -1 })
    .limit(20);
    
    console.log(`📊 API would return ${apiNotifications.length} notifications`);
    console.log('');

    console.log('✅ Notification system test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Check if notifications appear in your mobile app');
    console.log('2. Verify the API base URL in mobile app');
    console.log('3. Check mobile app logs for any errors');
    console.log('4. Test the like functionality on a comment');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testNotifications(); 