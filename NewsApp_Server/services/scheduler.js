const cron = require('node-cron');
const NotificationGenerator = require('./notificationGenerator');
const User = require('../models/User');

class NotificationScheduler {
  constructor() {
    this.jobs = [];
  }

  // Start all scheduled jobs
  start() {
    console.log('Starting notification scheduler...');
    
    // Daily digest at 8 PM
    this.scheduleDailyDigest();
    
    // Reading reminder at 10 AM
    this.scheduleReadingReminder();
    
    // Achievement check every hour
    this.scheduleAchievementCheck();
    
    // Cleanup duplicate notifications every 10 minutes
    this.scheduleCleanupDuplicates();
    
    console.log('Notification scheduler started successfully');
  }

  // Stop all scheduled jobs
  stop() {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('Notification scheduler stopped');
  }

  // Schedule daily digest notification
  scheduleDailyDigest() {
    const job = cron.schedule('0 20 * * *', async () => {
      console.log('Running daily digest notification...');
      try {
        const users = await User.find({ 
          'preferences.notifications.dailyDigest': { $ne: false } 
        });
        
        for (const user of users) {
          await NotificationGenerator.generateDailyDigestNotification(user._id);
        }
        
        console.log(`Daily digest sent to ${users.length} users`);
      } catch (error) {
        console.error('Error sending daily digest:', error);
      }
    }, {
      timezone: 'Asia/Ho_Chi_Minh'
    });
    
    this.jobs.push(job);
  }

  // Schedule reading reminder notification
  scheduleReadingReminder() {
    const job = cron.schedule('0 10 * * *', async () => {
      console.log('Running reading reminder notification...');
      try {
        const users = await User.find({ 
          'preferences.notifications.readingReminder': { $ne: false } 
        });
        
        for (const user of users) {
          await NotificationGenerator.generateReadingReminderNotification(user._id);
        }
        
        console.log(`Reading reminder sent to ${users.length} users`);
      } catch (error) {
        console.error('Error sending reading reminder:', error);
      }
    }, {
      timezone: 'Asia/Ho_Chi_Minh'
    });
    
    this.jobs.push(job);
  }

  // Schedule achievement check
  scheduleAchievementCheck() {
    const job = cron.schedule('0 * * * *', async () => {
      console.log('Running achievement check...');
      try {
        const users = await User.find({ 
          'preferences.notifications.achievements': { $ne: false } 
        });
        
        for (const user of users) {
          await NotificationGenerator.checkAndGenerateAchievements(user._id);
        }
        
        console.log(`Achievement check completed for ${users.length} users`);
      } catch (error) {
        console.error('Error checking achievements:', error);
      }
    }, {
      timezone: 'Asia/Ho_Chi_Minh'
    });
    
    this.jobs.push(job);
  }

  // Schedule cleanup duplicates
  scheduleCleanupDuplicates() {
    const job = cron.schedule('0 */10 * * * *', async () => {
      console.log('Running cleanup duplicates...');
      try {
        await NotificationGenerator.cleanupDuplicateNotifications();
        console.log('Cleanup completed');
      } catch (error) {
        console.error('Error cleaning up duplicates:', error);
      }
    }, {
      timezone: 'Asia/Ho_Chi_Minh'
    });
    
    this.jobs.push(job);
  }

  // Manual trigger for testing
  async triggerDailyDigest() {
    console.log('Manually triggering daily digest...');
    try {
      const users = await User.find({ 
        'preferences.notifications.dailyDigest': { $ne: false } 
      });
      
      for (const user of users) {
        await NotificationGenerator.generateDailyDigestNotification(user._id);
      }
      
      console.log(`Daily digest sent to ${users.length} users`);
      return { success: true, usersCount: users.length };
    } catch (error) {
      console.error('Error sending daily digest:', error);
      return { success: false, error: error.message };
    }
  }

  async triggerReadingReminder() {
    console.log('Manually triggering reading reminder...');
    try {
      const users = await User.find({ 
        'preferences.notifications.readingReminder': { $ne: false } 
      });
      
      for (const user of users) {
        await NotificationGenerator.generateReadingReminderNotification(user._id);
      }
      
      console.log(`Reading reminder sent to ${users.length} users`);
      return { success: true, usersCount: users.length };
    } catch (error) {
      console.error('Error sending reading reminder:', error);
      return { success: false, error: error.message };
    }
  }

  async triggerAchievementCheck() {
    console.log('Manually triggering achievement check...');
    try {
      const users = await User.find({ 
        'preferences.notifications.achievements': { $ne: false } 
      });
      
      for (const user of users) {
        await NotificationGenerator.checkAndGenerateAchievements(user._id);
      }
      
      console.log(`Achievement check completed for ${users.length} users`);
      return { success: true, usersCount: users.length };
    } catch (error) {
      console.error('Error checking achievements:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationScheduler(); 