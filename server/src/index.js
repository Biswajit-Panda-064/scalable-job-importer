import dotenv from 'dotenv'
dotenv.config();

import http from 'http';
import express from 'express';
import cors from 'cors';
import { initSocket } from './config/socket.js';
import { connectDB } from './config/db.js';
import logRoutes from './routes/logRoutes.js';

const app = express();
const corsOptions = {
  origin: process.env.CLIENT_BASE_URL || 'http://localhost:3000'
};
app.use(cors(corsOptions));
app.use(express.json());
app.get('/', (req, res) => {
  res.status(200).json({
    statusCode: 200,
    success: true,
    message: `Your API is running successfully`,
  });
});
app.use('/api/import-history', logRoutes);

app.use((req, res) => {
  res.status(404).json({
    statusCode: 400,
    success: false,
    message: `Can't find ${req.originalUrl} on the server!`,
  });
});
const server = http.createServer(app);
const io = initSocket(server);

async function startBackgroundServices(io) {
  if (io && process.env.REDIS_URL) {
    const { initJobWorker } = await import('./helper/worker.js');
    initJobWorker(io);

    const { startFetchJobsCron } = await import('./helper/cron.js');
    startFetchJobsCron();
  } else {
    console.log('io or REDIS_URL not set');
  }
}

async function startServer() {
  try {
    const PORT = process.env.PORT || 5000;
    await connectDB();
    server.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
      startBackgroundServices(io).catch((err) => {
        console.error('Failed to start background services:', err);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
startServer()