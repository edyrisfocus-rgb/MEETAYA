import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import Notification from '@/models/Notification';

export async function GET(req: NextRequest) {
  // In a production environment, you would secure this endpoint 
  // with a secret token (e.g., ?token=YOUR_CRON_SECRET)
  // to ensure only Vercel Cron or your scheduler can trigger it.
  
  try {
    await dbConnect();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Find all open tasks
    const openTasks = await Task.find({ status: { $in: ['open', 'in_progress'] } });
    
    let notificationsCreated = 0;

    for (const task of openTasks) {
      if (!task.deadline) continue;

      const deadlineDate = new Date(task.deadline);
      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let title = '';
      let message = '';

      if (diffDays < 0) {
        // OVERDUE
        title = '🚨 Task Overdue';
        message = `The action item "${task.title}" is overdue! Please update its status immediately.`;
      } else if (diffDays === 0) {
        // DUE TODAY
        title = '⏰ Task Due Today';
        message = `Reminder: The action item "${task.title}" is due today.`;
      } else if (diffDays === 1) {
        // DUE TOMORROW (H-1)
        title = '📅 Task Due Tomorrow (H-1)';
        message = `Reminder: The action item "${task.title}" is due tomorrow.`;
      } else if (diffDays === 3) {
        // DUE IN 3 DAYS (H-3)
        title = '🗓️ Task Due in 3 Days (H-3)';
        message = `Upcoming Deadline: "${task.title}" is due in 3 days.`;
      }

      // If we have a notification condition met, check if we already sent it recently to avoid spam
      if (title && message) {
        // Simple deduplication check: check if a notification with the same title for the same user exists within the last 24 hours
        const recentNotif = await Notification.findOne({
          userId: task.pic,
          title: title,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (!recentNotif) {
          await Notification.create({
            userId: task.pic,
            title,
            message,
          });
          notificationsCreated++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Cron job executed successfully. Created ${notificationsCreated} notifications.` 
    });

  } catch (error: any) {
    console.error('Cron Job Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
