import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Minutes from '@/models/Minutes';

// GET minutes for a meeting
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get('meetingId');

    if (!meetingId) {
      return NextResponse.json({ success: false, error: 'Missing meetingId parameter' }, { status: 400 });
    }

    const minutes = await Minutes.findOne({ meetingId });
    return NextResponse.json({ success: true, data: minutes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create/update minutes (Upsert)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { meetingId, summary, decisions, notes } = body;

    if (!meetingId) {
      return NextResponse.json({ success: false, error: 'Missing meetingId' }, { status: 400 });
    }

    // Upsert behavior
    const minutes = await Minutes.findOneAndUpdate(
      { meetingId },
      { summary: summary || '', decisions: decisions || [], notes: notes || [] },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: minutes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
