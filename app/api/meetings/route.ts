import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Meeting from '@/models/Meeting';

// GET all meetings
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    // In production, we filter meetings. In dev/testing, we can list all or filter by session.
    const meetings = await Meeting.find({}).sort({ date: -1 });
    return NextResponse.json({ success: true, data: meetings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create a meeting
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    const body = await req.json();
    const { title, agenda, date, location, participants } = body;

    if (!title || !agenda || !date || !location) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const meeting = await Meeting.create({
      title,
      agenda,
      date: new Date(date),
      location,
      participants: participants || [],
      creatorEmail: session?.user?.email || 'dev-admin@meetaya.local',
    });

    return NextResponse.json({ success: true, data: meeting }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
