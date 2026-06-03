import { NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('id');

  if (!query) {
    return Response.json({ error: 'id is required' }, { status: 400 });
  }

  const result = await sql`
      SELECT id, sheet
      FROM sheets
      WHERE id = ${query}
      LIMIT 1;
    `;
  const data = result[0];
  return Response.json(data);
}

export async function POST(req: Request) {
  const { sheet } = await req.json();
  const id = crypto.randomUUID();
  const sheetJson = JSON.stringify(sheet);

  const result = await sql`
    INSERT INTO sheets (id, sheet)
    VALUES (${id}, ${sheetJson})
    RETURNING *;
  `;

  return Response.json(result[0]);
}
