
import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

export const jobQueue = new Queue('jobs', {
  connection: redisConnection,
});
