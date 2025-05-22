import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema/chats";
import { desc } from "drizzle-orm";          // ← add this

export async function GET(_req: NextRequest) {
  const rows = await db
    .select({ id: chats.id, title: chats.title, created: chats.createdAt })
    .from(chats)
    .orderBy(desc(chats.createdAt));         // ← use desc()

  return Response.json(rows);
}
