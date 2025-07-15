import IORedis from 'ioredis';
console.log('Connecting Redis to:', process.env.REDIS_URL);
export const redisConnection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, 
  enableReadyCheck: true,
  reconnectOnError(err) {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

redisConnection.on('connect', () => console.log('Redis connected'));
redisConnection.on('error', (err) => console.error('Redis error:', err));

