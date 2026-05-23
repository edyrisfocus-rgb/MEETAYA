import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';

// GET attendance list for a meeting
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get('meetingId');

    const filter = meetingId ? { meetingId } : {};
    const attendance = await Attendance.find(filter);
    
    return NextResponse.json({ success: true, data: attendance });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST upsert attendance record
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { meetingId, userId, userName, status } = body;

    if (!meetingId || !userId || !status) {
      return NextResponse.json({ success: false, error: 'Missing meetingId, userId, or status' }, { status: 400 });
    }

    const attendance = await Attendance.findOneAndUpdate(
      { meetingId, userId },
      { userName: userName || '', status },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: attendance });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
