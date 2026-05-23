import mongoose, { Schema, model, models } from 'mongoose';

const MinutesSchema = new Schema(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true, unique: true },
    summary: { type: String, default: '' },
    decisions: { type: [String], default: [] },
    notes: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Minutes = models.Minutes || model('Minutes', MinutesSchema);
export default Minutes;
