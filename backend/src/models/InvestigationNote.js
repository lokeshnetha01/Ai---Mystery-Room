import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  mysteryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mystery', required: true },
  sessionId: { type: String, required: true, select: false },
  content: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 }
}, { timestamps: true, toJSON: { transform: (_doc, ret) => { delete ret.sessionId; delete ret.__v; return ret; } } });

noteSchema.index({ mysteryId: 1, sessionId: 1, createdAt: 1 });

export const InvestigationNote = mongoose.models.InvestigationNote || mongoose.model('InvestigationNote', noteSchema);
