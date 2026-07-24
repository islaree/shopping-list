import type { NextRequest } from 'next/server';

import { deleteExpiredSheets } from '@/lib/shared-sheet';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const deletedCount = await deleteExpiredSheets();

  return Response.json({ success: true, deletedCount });
}
