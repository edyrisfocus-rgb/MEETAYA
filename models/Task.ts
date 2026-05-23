import mongoose, { Schema, model, models } from 'mongoose';

const TaskSchema = new Schema(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    pic: { type: String, required: true }, // Person in Charge (email/name)
    deadline: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ['open', 'in_progress', 'waiting', 'done', 'overdue'], 
      default: 'open' 
    },
  },
  { timestamps: true }
);

const Task = models.Task || model('Task', TaskSchema);
export default Task;
