import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer = null;

const connectDB = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/luxecut_salon';
    
    // Set a connection timeout of 2.5 seconds for local database check
    console.log(`Attempting database connection to: ${connUri}...`);
    
    const options = {
      serverSelectionTimeoutMS: 2500, // Timeout after 2.5s
    };

    const conn = await mongoose.connect(connUri, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`⚠️ Local/Configured MongoDB connection failed: ${error.message}`);
    console.log('🌱 Starting in-memory MongoDB Server fallback (mongodb-memory-server)...');
    
    try {
      mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`✅ In-memory MongoDB Connected successfully: ${inMemoryUri}`);
    } catch (memError) {
      console.error(`❌ Failed to start in-memory MongoDB fallback: ${memError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
export { mongoServer };
