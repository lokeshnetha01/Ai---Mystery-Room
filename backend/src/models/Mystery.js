import mongoose from 'mongoose';

const generationSchema = new mongoose.Schema({
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  stage: { type: String, default: 'queued' },
  updatedAt: { type: Date, default: Date.now },
  errorCode: { type: String, select: false }
}, { _id: false });

const mysterySchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  originalScenario: { type: String, required: true, maxlength: 3000 },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  description: { type: String, default: '', maxlength: 2500 },
  location: { type: String, default: '' },
  incidentDate: { type: Date, default: null },
  victim: { type: mongoose.Schema.Types.Mixed, default: null },
  suspects: { type: [mongoose.Schema.Types.Mixed], default: [] },
  timeline: { type: [mongoose.Schema.Types.Mixed], default: [] },
  solution: { type: mongoose.Schema.Types.Mixed, default: null, select: false },
  sessionId: { type: String, required: true, select: false },
  idempotencyKey: { type: String, default: undefined, select: false },
  generationRequest: { type: mongoose.Schema.Types.Mixed, default: null, select: false },
  generationStatus: { type: generationSchema, default: () => ({}) }
}, {
  timestamps: true,
  minimize: false,
  toJSON: { transform: (_doc, ret) => {
    delete ret.solution;
    delete ret.sessionId;
    delete ret.idempotencyKey;
    delete ret.generationRequest;
    if (ret.generationStatus) delete ret.generationStatus.errorCode;
    delete ret.__v;
    return ret;
  } }
});

mysterySchema.index({ sessionId: 1, createdAt: -1 });
mysterySchema.index({ 'generationStatus.status': 1, updatedAt: 1 });
mysterySchema.index({ sessionId: 1, idempotencyKey: 1 }, { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } });

export const Mystery = mongoose.models.Mystery || mongoose.model('Mystery', mysterySchema);
