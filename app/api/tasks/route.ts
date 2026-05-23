import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';

// GET tasks
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get('meetingId');

    const filter = meetingId ? { meetingId } : {};
    const tasks = await Task.find(filter).sort({ deadline: 1 });
    
    return NextResponse.json({ success: true, data: tasks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create task
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { meetingId, title, description, pic, deadline, status } = body;

    if (!meetingId || !title || !pic || !deadline) {
      return NextResponse.json({ success: false, error: 'Missing required task fields' }, { status: 400 });
    }

    const task = await Task.create({
      meetingId,
      title,
      description: description || '',
      pic,
      deadline: new Date(deadline),
      status: status || 'open',
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
