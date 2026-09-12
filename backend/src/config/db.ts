import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Strips credentials from MongoDB URI before logging — avoids leaking passwords in logs
const sanitizeURI = (uri: string): string => {
  return uri.replace(/\/\/(.*):(.*)@/, '//****:****@');
};

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskgimi';
  
  try {
    // Short timeout so we fail fast and fall through to the in-memory fallback
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 });
    console.log(`[Database] Connected successfully to MongoDB at ${sanitizeURI(mongoURI)}`);
  } catch (err: any) {
    const safeErrorMsg = (err.message || '').replace(/\/\/(.*):(.*)@/, '//****:****@');
    console.warn(`[Database] Could not connect to primary MongoDB (${safeErrorMsg}). Launching MongoMemoryServer fallback...`);

    // Spin up an in-memory MongoDB instance as a last resort (useful in CI / offline environments)
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const fallbackURI = mongoServer.getUri();
      await mongoose.connect(fallbackURI);
      console.log(`[Database] Connected to In-Memory MongoDB at ${fallbackURI}`);
    } catch (memoryErr: any) {
      console.error('[Database] MongoMemoryServer fallback failed:', memoryErr);
      process.exit(1);
    }
  }
};
