import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { databaseState } from './config/db.js';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { sessionMiddleware } from './middleware/sessionMiddleware.js';
import { databaseRequired } from './middleware/databaseRequired.js';
import { createMystery, getEvidence, getEvidenceItem, getGenerationStatus, getMystery, getSuspects, retryMysteryGeneration, validateCreateMystery } from './controllers/mysteryController.js';
import { createNote, deleteNote, getInvestigationResult, listNotes, submitAccusation, updateNote } from './controllers/investigationController.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '32kb' }));
  app.use('/api', rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false }));
  app.use('/api/v1', sessionMiddleware);

  app.get('/api/v1/health', (_req, res) => {
    res.json({ success: true, message: 'AI Mystery Room API is running', data: { status: 'ok', database: databaseState() } });
  });

  app.post('/api/v1/mysteries', validateCreateMystery, databaseRequired, createMystery);
  app.get('/api/v1/mysteries/:id/status', databaseRequired, getGenerationStatus);
  app.post('/api/v1/mysteries/:id/retry', databaseRequired, retryMysteryGeneration);
  app.get('/api/v1/mysteries/:id/evidence', databaseRequired, getEvidence);
  app.get('/api/v1/mysteries/:id/evidence/:evidenceId', databaseRequired, getEvidenceItem);
  app.get('/api/v1/mysteries/:id/suspects', databaseRequired, getSuspects);
  app.get('/api/v1/mysteries/:id/notes', databaseRequired, listNotes);
  app.post('/api/v1/mysteries/:id/notes', databaseRequired, createNote);
  app.patch('/api/v1/notes/:noteId', databaseRequired, updateNote);
  app.delete('/api/v1/notes/:noteId', databaseRequired, deleteNote);
  app.post('/api/v1/mysteries/:id/accusations', databaseRequired, submitAccusation);
  app.get('/api/v1/mysteries/:id/result', databaseRequired, getInvestigationResult);
  app.get('/api/v1/mysteries/:id', databaseRequired, getMystery);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
