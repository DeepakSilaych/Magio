import { NextRequest, NextResponse } from 'next/server';
import { dbConnector } from '@/lib/db/connector';
import { getViewDetails } from '@/lib/tracking/view-details';

export const dynamic = 'force-dynamic';

const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

const PIXEL_RESPONSE_HEADERS = {
  'Content-Type': 'image/gif',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = id.replace('.gif', '');

    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const email = await dbConnector.getEmailById(cleanId);

    const isSenderView = email?.senderIp && email.senderIp === ipAddress;
    const isImmediateOpen = email && Date.now() - email.createdAt.getTime() < 5 * 60_000;

    if (email && !isSenderView && !isImmediateOpen) {
      getViewDetails(ipAddress, userAgent)
        .then((details) => dbConnector.logEmailView(cleanId, {
          ipAddress,
          userAgent,
          ...details,
        }))
        .catch((err) => {
          console.error('Failed to log email view:', err);
        });
    }

    return new NextResponse(PIXEL, { headers: PIXEL_RESPONSE_HEADERS });
  } catch (error) {
    console.error('Error in tracking pixel:', error);
    return new NextResponse(PIXEL, { headers: PIXEL_RESPONSE_HEADERS });
  }
}
