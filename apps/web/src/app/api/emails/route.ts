import { NextRequest, NextResponse } from 'next/server';
import { dbConnector } from '@/lib/db/connector';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, recipient, sender } = body;

    if (!subject || !recipient || !sender) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const senderIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || null;

    const email = await dbConnector.createEmail({ subject, recipient, sender, senderIp });
    return NextResponse.json(email, { status: 201 });
  } catch (error) {
    console.error('Error creating email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const emails = await dbConnector.getAllEmails();
    return NextResponse.json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
