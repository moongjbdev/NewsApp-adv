const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/newsapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestNotification() {
  try {
    console.log('🔍 Creating test notification...\n');

    // Get the first user
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`👤 Using user: ${user.username} (${user._id})\n`);

    // Create a test notification
    const testNotification = new Notification({
      user_id: user._id,
      type: 'comment_like',
      title: 'Test Like Notification',
      message: 'Someone liked your comment!',
      data: {
        article_id: 'test-article-123',
        comment_id: 'test-comment-456',
        user_id: user._id
      }
    });
    
    await testNotification.save();
    console.log(`✅ Created test notification:`);
    console.log(`   ID: ${testNotification._id}`);
    console.log(`   Type: ${testNotification.type}`);
    console.log(`   Title: ${testNotification.title}`);
    console.log(`   Message: ${testNotification.message}`);
    console.log(`   Is Read: ${testNotification.isRead}`);
    console.log(`   Created: ${testNotification.createdAt}\n`);

    // Check total notifications for this user
    const totalNotifications = await Notification.countDocuments({ user_id: user._id });
    const unreadNotifications = await Notification.countDocuments({ 
      user_id: user._id, 
      isRead: false,
      isDeleted: false 
    });
    
    console.log(`📊 User has ${totalNotifications} total notifications`);
    console.log(`📊 User has ${unreadNotifications} unread notifications`);

    console.log('\n✅ Test notification created successfully!');
    console.log('📱 Now check your mobile app to see if the notification appears.');

  } catch (error) {
    console.error('❌ Error creating test notification:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the function
createTestNotification(); 