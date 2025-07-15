import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import Job from '../model/jobModel.js';
import ImportLog from '../model/importLogModel.js';
const concurrency = parseInt(process.env.MAX_CONCURRENCY)|| 2;

export const initJobWorker = (io) => {
  const jobWorker = new Worker('jobs', async (job) => {
    const { jobs, feedUrl } = job.data;
    
    const importStats = {
      fileName: feedUrl,
      importDateTime: new Date(),
      totalFetched: jobs.length,
      newJobs: 0,
      updatedJobs: 0,
      failedJobs: []
    };

    for (const jobData of jobs) {
      try {
        const existing = await Job.findOne({ jobId: jobData.jobId });
        if (existing) {
          await Job.updateOne({ jobId: jobData.jobId }, jobData);
          importStats.updatedJobs++;
        } else {
          await new Job(jobData).save();
          importStats.newJobs++;
        }
      } catch (err) {
        importStats.failedJobs.push({ jobId: jobData.jobId, reason: err.message });
      }
    }

    importStats.totalImported = importStats.newJobs + importStats.updatedJobs;

    io.emit('job-progress', importStats);

    await ImportLog.create(importStats);

  }, {
    connection: redisConnection,
    concurrency: concurrency,
  });

  return jobWorker;
};
