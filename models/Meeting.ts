import mongoose, { Schema, model, models } from 'mongoose';

const MeetingSchema = new Schema(
  {
    title: { type: String, required: true },
    agenda: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    participants: { type: [String], default: [] }, // Emails or Names
    creatorEmail: { type: String }, // For owner management
  },
  { timestamps: true }
);

const Meeting = models.Meeting || model('Meeting', MeetingSchema);
export default Meeting;
