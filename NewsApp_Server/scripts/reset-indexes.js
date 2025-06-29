const mongoose = require('mongoose');
require('dotenv').config();

async function resetIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp');
    console.log('Connected to MongoDB');

    // Get collections
    const db = mongoose.connection.db;
    
    // Drop indexes for bookmarks collection
    try {
      await db.collection('bookmarks').dropIndexes();
      console.log('Dropped all indexes from bookmarks collection');
    } catch (error) {
      console.log('No indexes to drop from bookmarks collection');
    }

    // Drop indexes for readinghistories collection
    try {
      await db.collection('readinghistories').dropIndexes();
      console.log('Dropped all indexes from readinghistories collection');
    } catch (error) {
      console.log('No indexes to drop from readinghistories collection');
    }

    // Drop indexes for comments collection
    try {
      await db.collection('comments').dropIndexes();
      console.log('Dropped all indexes from comments collection');
    } catch (error) {
      console.log('No indexes to drop from comments collection');
    }

    console.log('Index reset completed successfully');
  } catch (error) {
    console.error('Error resetting indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetIndexes(); 