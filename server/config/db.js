const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && !uri.includes('<username>')) {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`✅ MongoDB Connected to Atlas/Database: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.warn(`⚠️ Failed to connect to MONGODB_URI (${error.message}). Falling back to in-memory database...`);
    }
  }

  // Fallback to MongoMemoryServer for instant local run & zero-setup demonstration
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create({
      instance: { launchTimeout: 60000 },
    });
    const memUri = mongoServer.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`✅ In-Memory MongoDB Started & Connected for local demonstration at: ${memUri}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
