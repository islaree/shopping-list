import { neon } from '@neondatabase/serverless';

import { ShoppingListModel } from '@/types/shopping-list';

const sql = neon(process.env.DATABASE_URL!);

export type SharedSheetPayload = Pick<ShoppingListModel, 'name' | 'items' | 'categories'>;

type SharedSheetRow = {
  id: string;
  sheet: SharedSheetPayload | string;
  created_at: string | null;
  expires_at: string | null;
};

const parseSheet = (sheet: SharedSheetPayload | string): SharedSheetPayload => {
  if (typeof sheet === 'string') {
    return JSON.parse(sheet) as SharedSheetPayload;
  }

  return sheet;
};

export const getSharedSheetById = async (id: string) => {
  const result = (await sql`
    SELECT id, sheet, created_at, expires_at
    FROM sheets
    WHERE id = ${id}
      AND (expires_at IS NULL OR expires_at >= NOW())
    LIMIT 1;
  `) as SharedSheetRow[];

  const row = result[0];
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    sheet: parseSheet(row.sheet),
    created_at: row.created_at,
    expires_at: row.expires_at,
  };
};

export const createSharedSheet = async (sheet: SharedSheetPayload) => {
  const sheetJson = JSON.stringify(sheet);

  const result = (await sql`
    INSERT INTO sheets (id, sheet, created_at, expires_at)
    VALUES (${crypto.randomUUID()}, ${sheetJson}, NOW(), NOW() + INTERVAL '24 hours')
    RETURNING id, sheet, created_at, expires_at;
  `) as SharedSheetRow[];

  const row = result[0];
  if (!row) {
    throw new Error('Failed to create shared sheet');
  }

  return {
    id: row.id,
    sheet: parseSheet(row.sheet),
    created_at: row.created_at,
    expires_at: row.expires_at,
  };
};

export const deleteExpiredSheets = async () => {
  const result = (await sql`
    DELETE FROM sheets
    WHERE expires_at < NOW()
    RETURNING 1 AS count;
  `) as Array<{ count: number }>;

  return result.length;
};
