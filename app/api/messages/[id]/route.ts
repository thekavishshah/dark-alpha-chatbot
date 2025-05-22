// app/api/messages/[id]/route.ts
//
// Returns the FULL timeline (user + assistant) for a chat,
// ordered oldest ➜ newest.
// ----------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { db }                        from "@/lib/db";
import { messagesTbl as msgs }          from "@/lib/db/schema/messages";
import { eq, asc }                   from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) { 
  const { id } = params;                       // chatId in the URL

  const rows = await db
    .select({ role: msgs.role, content: msgs.content })
    .from(msgs)
    .where(eq(msgs.chatId, id))
    .orderBy(asc(msgs.createdAt));             // oldest first

  // returns: [{ role: "user", content: "…" }, { role: "assistant", … }, …]
  return NextResponse.json(rows);
}
