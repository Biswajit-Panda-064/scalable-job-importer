import mongoose from 'mongoose';
export const connectDB = async () => {
  try {
    // console.log(process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error(' MongoDB error:', error);
    throw error;
  }
};
