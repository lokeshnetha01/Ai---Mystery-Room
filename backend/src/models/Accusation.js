import mongoose from 'mongoose';

const accusationSchema = new mongoose.Schema({
  mysteryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mystery', required: true },
  sessionId: { type: String, required: true, select: false },
  selectedSuspectId: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  submittedAt: { type: Date, default: Date.now }
}, { versionKey: false });

accusationSchema.index({ mysteryId: 1, sessionId: 1 }, { unique: true });

export const Accusation = mongoose.models.Accusation || mongoose.model('Accusation', accusationSchema);
