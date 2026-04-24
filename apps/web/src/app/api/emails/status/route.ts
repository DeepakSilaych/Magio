import { NextResponse } from 'next/server';
import { dbConnector } from '@/lib/db/connector';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const emails = await dbConnector.getEmailStatuses();
    const statuses = emails.map((e) => ({
      subject: e.subject,
      viewCount: e._count.views,
    }));
    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Error fetching email statuses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
