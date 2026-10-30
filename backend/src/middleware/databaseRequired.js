import { databaseState } from '../config/db.js';

export function databaseRequired(_req, res, next) {
  if (databaseState() !== 'connected') {
    return res.status(503).json({ success: false, message: 'Database service is unavailable', error: { code: 'DATABASE_UNAVAILABLE' } });
  }
  next();
}
