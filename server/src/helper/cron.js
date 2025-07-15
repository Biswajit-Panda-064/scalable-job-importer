import cron from 'node-cron';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { jobQueue } from './queue.js';
import moment from 'moment-timezone';
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 30;
console.log(`Cron job file call at: ${moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss z')}`);
function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export const startFetchJobsCron = () => {
   console.log('Job cron scheduled to run every hour at minute 0 (Asia/Kolkata)');
  cron.schedule('0 * * * *', async () => {
    console.log(`Cron job trigger  at: ${moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss z')}`)
    const feedUrls = [
      'https://jobicy.com/?feed=job_feed',
      'https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time',
      'https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france',
      'https://jobicy.com/?feed=job_feed&job_categories=design-multimedia',
      'https://jobicy.com/?feed=job_feed&job_categories=data-science',
      'https://jobicy.com/?feed=job_feed&job_categories=copywriting',
      'https://jobicy.com/?feed=job_feed&job_categories=business',
      'https://jobicy.com/?feed=job_feed&job_categories=management'
    ];

    for (const url of feedUrls) {
      try {
        const response = await axios.get(url, {
          timeout: 10000,
        });

        const json = await parseStringPromise(response.data, { explicitArray: false });
        let jobs = json?.rss?.channel?.item || [];

        if (!Array.isArray(jobs)) jobs = [jobs];

        const jobList = jobs.map((job) => ({
          jobId: job.id || job.link,
          title: job.title || '',
          link: job.link || '',
          pubDate: job.pubDate ? new Date(job.pubDate) : null,
          company: job['job_listing:company'] || '',
          location: job['job_listing:location'] || '',
          type: job['job_listing:job_type'] || '',
          feedUrl: url
        }));
        // console.log(`Feed: ${url}Total Jobs Fetched: ${jobList.length}`);
        const jobChunks = chunkArray(jobList, BATCH_SIZE);

        for (const chunk of jobChunks) {
          // console.log(` Size: ${chunk.length}`);
          await jobQueue.add('process-job', { jobs: chunk, feedUrl: url });
        }

      } catch (error) {
        console.error(`Error fetching feed ${url}: ${error.message}`);
      }
    }
  }, {
    timezone: 'Asia/Kolkata'
  });
};
