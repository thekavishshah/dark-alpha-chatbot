/* ------------------------------------------------------------------ */
/*  GET /api/company/[uid]/resources                                  */
/*  Returns: [{ id, name, kind }] – minimal payload for compare page  */
/* ------------------------------------------------------------------ */
import { NextResponse }  from 'next/server';
import { eq }            from 'drizzle-orm';

import { db }                 from '@/lib/db/queries';
import { resources as tbl }   from '@/lib/db/schema';

export async function GET(
  _request: Request,
  { params }: { params: { uid: string } },
) {
  const { uid } = params;                                     // e.g. "be98c4fb-…"

  const rows = await db
    .select({ id: tbl.id, name: tbl.name, kind: tbl.kind })   // lightweight
    .from(tbl)
    .where(eq(tbl.companyId, uid));

  return NextResponse.json(rows);                             // 200 JSON
}
