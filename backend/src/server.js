import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { Mystery } from './models/Mystery.js';

function start() {
  console.info('Starting AI Mystery Room API');
  const app = createApp();
  const server = app.listen(env.PORT, () => console.info(`API listening on http://localhost:${env.PORT}`));
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') console.error(`Port ${env.PORT} is already in use. Stop the other API process or set PORT to a free port.`);
    else console.error(`API server could not listen (${error.code || error.name}).`);
    process.exitCode = 1;
  });
  if (!env.MONGODB_URI) {
    console.warn('MONGODB_URI is not configured; database-backed routes will return 503.');
    return;
  }
  void connectDatabase(env.MONGODB_URI)
    .then(async () => {
      await Mystery.updateMany({ 'generationStatus.status': { $in: ['pending', 'processing'] } }, {
        $set: { generationStatus: { status: 'failed', stage: 'failed', errorCode: 'GENERATION_INTERRUPTED', updatedAt: new Date() } }
      });
      console.info('MongoDB connection established');
    })
    .catch((error) => console.warn(`MongoDB is unavailable (${error.name}); database-backed routes will return 503.`));
}

start();
