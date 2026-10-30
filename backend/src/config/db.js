import mongoose from 'mongoose';

export async function connectDatabase(uri) {
  if (!uri) return { connected: false, reason: 'MONGODB_URI is not configured' };
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return { connected: true };
}

export function databaseState() {
  return ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'disconnected';
}
