// data base connection file that connects one single time only
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

// Get MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// chech if the connection exists
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in a runtime env file (e.g. .env)",
  );
}

// global variable to cache the connection because next js hot reloads the server
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

//check if there is connection if not make one
async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000, // Increased to 15s for slow DNS
      socketTimeoutMS: 45000,
    };

    let retries = 3;
    while (retries > 0) {
      try {
        console.log(`Connecting to MongoDB (Attempt ${4 - retries}/3)...`);
        cached.promise = mongoose.connect(MONGODB_URI, opts);
        cached.conn = await cached.promise;
        console.log("Successfully connected to MongoDB.");
        return cached.conn;
      } catch (e) {
        retries--;
        console.error(`Connection attempt failed. Retries left: ${retries}`, e.message);
        if (retries === 0) throw e;
        await new Promise(r => setTimeout(r, 2000)); // wait 2s before retry
      }
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
