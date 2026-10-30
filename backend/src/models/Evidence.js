import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  mysteryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mystery', required: true, index: true },
  evidenceId: { type: String, required: true },
  type: { type: String, enum: ['chat', 'image', 'video', 'document', 'witness_statement', 'system_log'], required: true },
  title: { type: String, required: true, maxlength: 250 },
  description: { type: String, required: true, maxlength: 2500 },
  timestamp: { type: Date, required: true },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  mediaPrompt: { type: String, default: null, select: false },
  mediaUrl: { type: String, default: null },
  mediaStorageKey: { type: String, default: null, select: false },
  mediaMimeType: { type: String, default: null },
  mediaSizeBytes: { type: Number, default: null },
  mediaStatus: { type: String, enum: ['not_required', 'pending', 'processing', 'available', 'unavailable'], default: 'not_required' },
  relatedSuspectIds: { type: [String], default: [] },
  reveals: { type: String, required: true, select: false }
}, { timestamps: true, minimize: false, toJSON: { transform: (_doc, ret) => { delete ret.reveals; delete ret.mediaStorageKey; delete ret.mediaPrompt; delete ret.__v; return ret; } } });

evidenceSchema.index({ mysteryId: 1, evidenceId: 1 }, { unique: true });
evidenceSchema.index({ mysteryId: 1, timestamp: 1 });

export const Evidence = mongoose.models.Evidence || mongoose.model('Evidence', evidenceSchema);
