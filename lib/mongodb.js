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
      bufferCommands: false, // Disable buffering for cleaner error handling
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        return mongoose;
      })
      .catch((error) => {
        throw error;
      });
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
