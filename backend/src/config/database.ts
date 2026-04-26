import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/workflow-pro';

export const connectDB = async (): Promise<void> => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log(`📍 Connection String: ${MONGODB_URI.replace(/mongodb\+srv:\/\/.*@/, 'mongodb+srv://***@')}`);
    
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ MongoDB connected successfully');
    
    // Create indexes after connection
    await createIndexes();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export const createIndexes = async (): Promise<void> => {
  const db = mongoose.connection.db;
  if (!db) {
    console.warn('⚠️  Database not available for indexing');
    return;
  }

  console.log('📊 Creating database indexes...');

  const createIndexSafely = async (collection: any, indexSpec: any, name: string) => {
    try {
      await collection.createIndex(indexSpec);
      console.log(`✅ Index created: ${name}`);
    } catch (error: any) {
      // Ignore if index already exists (IndexKeySpecsConflict error code 86)
      if (error.code === 86) {
        console.log(`ℹ️  Index already exists: ${name}`);
      } else {
        console.warn(`⚠️  Could not create index ${name}:`, error.message);
      }
    }
  };

  // WorkLogs indexes for optimal query performance
  const workLogsCollection = db.collection('worklogs');
  await createIndexSafely(workLogsCollection, { userId: 1, date: -1 }, '{ userId: 1, date: -1 }');
  await createIndexSafely(workLogsCollection, { date: -1 }, '{ date: -1 }');
  await createIndexSafely(workLogsCollection, { date: -1, userId: 1 }, '{ date: -1, userId: 1 }');
  await createIndexSafely(workLogsCollection, { status: 1, date: -1 }, '{ status: 1, date: -1 }');

  // Users indexes
  const usersCollection = db.collection('users');
  await createIndexSafely(usersCollection, { email: 1 }, '{ email: 1 }');

  // ActivityLogs indexes
  const activityLogsCollection = db.collection('activitylogs');
  await createIndexSafely(activityLogsCollection, { userId: 1, timestamp: -1 }, '{ userId: 1, timestamp: -1 }');
  await createIndexSafely(activityLogsCollection, { timestamp: -1 }, '{ timestamp: -1 }');
};

export default mongoose;
