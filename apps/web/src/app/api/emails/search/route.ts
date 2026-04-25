import { NextRequest, NextResponse } from 'next/server';
import { dbConnector } from '@/lib/db/connector';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const subject = request.nextUrl.searchParams.get('subject');
    if (!subject) {
      return NextResponse.json({ error: 'Missing subject param' }, { status: 400 });
    }

    const emails = await dbConnector.searchEmails(subject);
    if (emails.length === 0) {
      return NextResponse.json(null);
    }

    const email = emails[0];
    const uniqueIps = new Set(email.views.map((v) => v.ipAddress).filter(Boolean));

    return NextResponse.json({
      id: email.id,
      subject: email.subject,
      sender: email.sender,
      recipient: email.recipient,
      totalViews: email.views.length,
      uniqueIps: uniqueIps.size,
      lastView: email.views[0]?.viewedAt || null,
      views: email.views.map((v) => ({
        viewedAt: v.viewedAt,
        ipAddress: v.ipAddress,
        userAgent: v.userAgent,
        city: v.city,
        region: v.region,
        country: v.country,
        browser: v.browser,
        os: v.os,
        device: v.device,
      })),
    });
  } catch (error) {
    console.error('Error searching emails:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
