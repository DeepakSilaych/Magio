import { NextRequest, NextResponse } from 'next/server';
import { dbConnector } from '@/lib/db/connector';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const since = new Date(Date.now() - 5 * 60_000);
    const result = await dbConnector.deleteRecentViews(id, since);
    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error('Error deleting latest view:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
