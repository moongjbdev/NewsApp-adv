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

async function debugDuplicateIssue() {
  try {
    console.log('🔍 Debugging duplicate prevention issue...\n');

    // Get test users
    const userA = await User.findOne({ email: 'testuser1@example.com' });
    const userB = await User.findOne({ email: 'testuser2@example.com' });

    // Create test comment and reply
    const testComment = new Comment({
      user: userA._id,
      article_id: 'debug-test-article',
      content: 'Debug test comment',
      parent_id: null
    });
    await testComment.save();

    const testReply = new Comment({
      user: userB._id,
      article_id: 'debug-test-article',
      content: 'Debug test reply',
      parent_id: testComment._id
    });
    await testReply.save();

    console.log('📝 Test data created:');
    console.log('Comment ID:', testComment._id, 'Type:', typeof testComment._id);
    console.log('Reply ID:', testReply._id, 'Type:', typeof testReply._id);
    console.log('User A ID:', userA._id, 'Type:', typeof userA._id);

    // Test 1: Create first notification
    console.log('\n🔔 Step 1: Creating first notification...');
    const notification1 = await NotificationGenerator.generateCommentReplyNotification(
      testComment._id,
      testReply._id
    );
    console.log('First notification created:', notification1 ? 'SUCCESS' : 'FAILED');

    // Debug: Check what's in the database
    console.log('\n📊 Step 2: Checking database after first notification...');
    const notificationsAfterFirst = await Notification.find({
      user_id: userA._id,
      type: 'comment_reply'
    });

    console.log('Notifications in database:', notificationsAfterFirst.length);
    notificationsAfterFirst.forEach((notif, index) => {
      console.log(`  ${index + 1}. ID: ${notif._id}`);
      console.log(`     Comment ID: ${notif.data.comment_id} (Type: ${typeof notif.data.comment_id})`);
      console.log(`     Reply ID: ${notif.data.reply_id} (Type: ${typeof notif.data.reply_id})`);
      console.log(`     User ID: ${notif.data.user_id} (Type: ${typeof notif.data.user_id})`);
      console.log(`     Full data:`, JSON.stringify(notif.data, null, 2));
      console.log(`     Created: ${notif.createdAt.toLocaleTimeString()}`);
    });

    // Test 2: Try to create duplicate
    console.log('\n🔄 Step 3: Trying to create duplicate...');
    
    // Debug: Check what we're looking for
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    console.log('Looking for existing notification with:');
    console.log('  user_id:', userA._id.toString());
    console.log('  type: comment_reply');
    console.log('  data.comment_id:', testComment._id.toString());
    console.log('  data.reply_id:', testReply._id.toString());
    console.log('  createdAt >=:', tenMinutesAgo.toLocaleTimeString());

    // Manual query to see what exists
    const existingManual = await Notification.findOne({
      user_id: userA._id,
      type: 'comment_reply',
      'data.comment_id': testComment._id.toString(),
      'data.reply_id': testReply._id.toString(),
      createdAt: { $gte: tenMinutesAgo }
    });

    console.log('Manual query result:', existingManual ? 'FOUND' : 'NOT FOUND');

    // Try to create duplicate
    const notification2 = await NotificationGenerator.generateCommentReplyNotification(
      testComment._id,
      testReply._id
    );
    console.log('Duplicate notification result:', notification2 ? 'CREATED (BUG)' : 'PREVENTED (GOOD)');

    // Debug: Check database again
    console.log('\n📊 Step 4: Checking database after duplicate attempt...');
    const notificationsAfterDuplicate = await Notification.find({
      user_id: userA._id,
      type: 'comment_reply'
    });

    console.log('Total notifications now:', notificationsAfterDuplicate.length);
    notificationsAfterDuplicate.forEach((notif, index) => {
      console.log(`  ${index + 1}. ID: ${notif._id}`);
      console.log(`     Comment ID: ${notif.data.comment_id} (Type: ${typeof notif.data.comment_id})`);
      console.log(`     Reply ID: ${notif.data.reply_id} (Type: ${typeof notif.data.reply_id})`);
      console.log(`     User ID: ${notif.data.user_id} (Type: ${typeof notif.data.user_id})`);
      console.log(`     Full data:`, JSON.stringify(notif.data, null, 2));
      console.log(`     Created: ${notif.createdAt.toLocaleTimeString()}`);
    });

    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await Comment.deleteMany({ _id: { $in: [testComment._id, testReply._id] } });
    await Notification.deleteMany({ 
      user_id: userA._id,
      type: 'comment_reply'
    });

    console.log('\n✅ Debug completed!');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

debugDuplicateIssue(); 