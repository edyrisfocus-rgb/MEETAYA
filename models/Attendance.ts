import mongoose, { Schema, model, models } from 'mongoose';

const AttendanceSchema = new Schema(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
    userId: { type: String, required: true }, // User Email or ID
    userName: { type: String },
    status: { 
      type: String, 
      enum: ['present', 'permission', 'absent', 'late'], 
      default: 'present' 
    },
  },
  { timestamps: true }
);

// Compound index so a user has only one attendance status per meeting
AttendanceSchema.index({ meetingId: 1, userId: 1 }, { unique: true });

const Attendance = models.Attendance || model('Attendance', AttendanceSchema);
export default Attendance;
