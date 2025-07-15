# Scalable Job Importer with Queue Processing & History Tracking

This project is a scalable job importer system that fetches XML data from multiple RSS feeds, parses and processes the jobs in batches using a Redis-backed queue, tracks import history, and displays logs with real-time updates via Socket.IO.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, Redis, BullMQ, Socket.IO
- **Frontend:** Next.js, React, Socket.IO Client
- **Others:** node-cron, axios, xml2js

---

## Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or cloud)
- Redis instance (local or cloud)
- npm 

## Setup & Installation

## 1. Clone the repo

git clone https://github.com/Biswajit-Panda-064/scalable-job-importer.git
cd scalable-job-importer

## 2. Backend Setup
cd server
npm install

Create a .env file in the server/ directory:

PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/job_importer
REDIS_URL=redis://default:<password>@your-redis-url:port
BATCH_SIZE=30
MAX_CONCURRENCY=2
CLIENT_BASE_URL=http://localhost:3000

Modify the variables as per your environment.

## 3. Frontend Setup

cd ../client
npm install

Create a .env file in the client/ directory:
NEXT_PUBLIC_BASE_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

## 4.Running the Project

Start Backend Server
From server/ directory: npm run dev

Start Frontend Development Server
From client/ directory:npm run dev
