import mongoose from 'mongoose';

const importLogSchema = new mongoose.Schema({
  fileName: String,
  importDateTime: Date,
  totalFetched: Number,
  newJobs: Number,
  updatedJobs: Number,
  totalImported: Number,
  failedJobs: [
    {
      jobId: String,
      reason: String
    }
  ]
}, { timestamps: true });

export default mongoose.model('ImportLog', importLogSchema);