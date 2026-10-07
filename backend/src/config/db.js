const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('example.mongodb.net')) {
    throw new Error('Set MONGODB_URI to your MongoDB connection string in backend/.env.');
  }

  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
