import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  jobId: { type: String, unique: true, required: true },
  title: String,
  link: String,
  pubDate: Date,
  company: String,
  location: String,
  type: String,
  feedUrl: String
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);
