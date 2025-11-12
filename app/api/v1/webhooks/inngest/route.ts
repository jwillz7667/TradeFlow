import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const eventId = new URL(req.url).searchParams.get('eventId');
  return NextResponse.json({ eventId, completed: true });
}
