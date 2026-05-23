import mongoose, { Schema, model, models } from 'mongoose';

const NotificationSchema = new Schema(
  {
    userId: { type: String, required: true }, // User Email or ID
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = models.Notification || model('Notification', NotificationSchema);
export default Notification;
