import { NextRequest } from 'next/server';

import { createSharedSheet, getSharedSheetById, type SharedSheetPayload } from '@/lib/shared-sheet';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('id');

  if (!query) {
    return Response.json({ error: 'id is required' }, { status: 400 });
  }

  const data = await getSharedSheetById(query);
  if (!data) {
    return Response.json({ error: 'not found' }, { status: 404 });
  }

  return Response.json({
    id: data.id,
    sheet: data.sheet,
  });
}

export async function POST(req: Request) {
  const { sheet } = (await req.json()) as { sheet: SharedSheetPayload };
  const result = await createSharedSheet(sheet);

  return Response.json(result);
}
