import mongoose from 'mongoose';
import 'dotenv/config';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
};

// Ensures database connection using environment-based URI
export default connectDB;
