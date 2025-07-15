# Project Name: Scalable Job Importer with Queue Processing & History Tracking
This system collects job listings from different websites using XML APIs. It uses queues to process the jobs in the background, stores them in MongoDB, and sends real-time updates to the frontend using Socket.IO.

# Purpose & Scope
Automatically get job data from different sources
Avoid duplicate job entries
Handle errors and failures smoothly
Show live updates to users during the import process

`The project includes:`
Getting job data from external APIs
Processing jobs using background workers
Storing jobs in a MongoDB database
Managing queues using Redis
Sending real-time updates to the user interface
A frontend built using Next.js

*End-to-End Project Flow Design*

## 1. Scheduled Job via Cron (Every Hour)
- A `cron job`runs every hour to start the job import process.

## 2. Fetch Job Feeds
- The Importer service sends HTTP GET requests to external job feed URLs (for example, Jobicy).
- The response is in XML format.

## 3. Convert XML to JSON
- The XML feed is converted into JSON format using the `xml2js` library.

## 4. Normalize Job List
- The job list is extracted from `json.rss.channel.item`
- This gives an array of job objects in a consistent format.

## 5. Divide Jobs into Batches
- The job array is split into chunks (for example, `30 jobs per batch`).
- This helps `reduce memory` load and controls job flow.
- Each batch is pushed to a `Redis queue` for processing.

## 6. Push to Redis Queue
- Each job in the batch is added as a task to the Redis queue using `BullMQ`.
- Job data includes jobId, title, company, feedUrl (to track import source), and other relevant fields.

## 7. Worker Processes Jobs (BullMQ Worker) and Concurrency

`What the Worker Does`
- Listens to jobs from the Redis queue.
- For each job:
  - Checks if the job already exists in `MongoDB` using jobId.
  - If it exists, updates the job.
  - If not, inserts a new job.
  - Logs any errors in a failed jobs collection.
- Emits real-time updates to the frontend using Socket.IO.

` Concurrency in the Worker`
- The worker can process multiple jobs at the same time.
- The BullMQ worker is set with `concurrency` (for example, 3), meaning:
  - It can handle 3 jobs in parallel instead of processing one-by-one.
  - This improves speed and efficiency during large imports.

## 8. Frontend (Next.js Admin UI)

`Fetches Import Logs`
- The frontend calls the /api/import-history endpoint to get job import summaries.

`Displays Summary Per Feed`
- For each feed, the frontend shows:
  - Feed name or file
  - Total jobs fetched
  - New jobs added
  - Updated jobs
  - Failed jobs
  - Import date

`Failed Job Details`
- Users can expand a feed log to view failed job details.
- This includes jobId and the reason for failure.

