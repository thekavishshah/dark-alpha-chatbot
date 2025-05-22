// app/api/chat/route.ts
//
//  ➜ Generic, zero-hard-coding memory
//  • Learns when the assistant’s *previous* message asked about “your X?”
//  • Recalls whenever the user’s *current* message asks a question about “my X …?”
//  • Keeps cross-chat history (latest 20 turns)
//
//  NOTE: requires env var DEFAULT_USER_ID *or* real auth supplying x-user-id.

import { NextRequest, NextResponse } from "next/server";
import { google }                     from "@ai-sdk/google";
import { streamText }                 from "ai";
import { db }                         from "@/lib/db";
import { chats }                      from "@/lib/db/schema/chats";
import { memories }                   from "@/lib/db/schema/memories";
import { messagesTbl }    from "@/lib/db/schema/messages";
import { eq, desc }                   from "drizzle-orm";

const chatModel   = google("gemini-1.5-flash-001");
const MAX_HISTORY = 20;

// ───── helpers ──────────────────────────────────────────────────────────────

async function userIdFrom(req: NextRequest) {
  const hdr = req.headers.get("x-user-id");
  if (hdr) return hdr;

  // (optional) plug in your auth() call here instead
  // const session = await auth();
  // if (session?.user?.id) return session.user.id;

  if (process.env.DEFAULT_USER_ID) return process.env.DEFAULT_USER_ID;
  throw new Error("No user id supplied");
}

/** extract “key” out of a question that contains “my …” (generic) */
function keyFromQuestion(q: string): string | null {
  const m = /\bmy\s+([^?.!]+?)\s*(?:is|are|was|were|do|does|did|should|could|might|may)?\s*[\?!.]/i.exec(
    q.toLowerCase() + (/[?.!]$/.test(q) ? "" : "?"), // force a ? so regex works
  );
  return m ? m[1].trim() : null;
}

/** was last assistant message asking “your X …?” → return X */
function keyFromAssistantAsk(msg: string): string | null {
  const m = /\byour\s+([^?.!]+?)\s*\?\s*$/i.exec(msg.toLowerCase());
  return m ? m[1].trim() : null;
}

/** explicit teaching “my X is Y” → { key, val } */
function parseTeach(utterance: string) {
  const m = /\bmy\s+([^?.!]+?)\s+is\s+([^?.!]+)\s*[?.!]*/i.exec(utterance);
  return m ? { key: m[1].trim(), val: m[2].trim() } : null;
}

// ───── route ───────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const userId = await userIdFrom(req);

  const {
    messages: incoming,
    chatId:   incomingId,
  } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
    chatId?: string;
  };
  const userMsg = incoming.at(-1)!.content.trim();

  // 1️⃣ boot chat row if new
  let chatId = incomingId;
  if (!chatId) {
    chatId =
      (
        await db
          .insert(chats)
          .values({ userId, title: userMsg.slice(0, 40) })
          .returning({ id: chats.id })
      )[0].id;
  }

  // 2️⃣ load stored facts
  const facts = await db
    .select({ k: memories.keyText, v: memories.value })
    .from(memories)
    .where(eq(memories.userId, userId));

  // 3️⃣ last 20 turns across all chats
  const histRows = await db
    .select({ role: messagesTbl.role, content: messagesTbl.content })
    .from(messagesTbl)
    .where(eq(messagesTbl.userId, userId))
    .orderBy(desc(messagesTbl.createdAt))
    .limit(MAX_HISTORY);

  const history = histRows.reverse() as {
    role: "user" | "assistant";
    content: string;
  }[];

  // 4️⃣ generic follow-up teaching (assistant asked “your X?”)
  const lastAssistant = history.filter(m => m.role === "assistant").at(-1);
  const keyAsked      = lastAssistant && keyFromAssistantAsk(lastAssistant.content);
  if (keyAsked && !userMsg.endsWith("?")) {
    // treat whole reply as value
    await db
      .insert(memories)
      .values({ userId, keyText: keyAsked, value: userMsg })
      .onConflictDoUpdate({
        target: [memories.userId, memories.keyText],
        set:    { value: userMsg },
      });

    const reply = `Got it! I’ll remember that your ${keyAsked} is ${userMsg}. 😊`;
    await db.insert(messagesTbl).values([
      { userId, chatId, role: "user",      content: userMsg },
      { userId, chatId, role: "assistant", content: reply   },
    ]);
    return new NextResponse(reply, {
      headers: { "Content-Type": "text/plain", "x-chat-id": chatId },
    });
  }

  // 5️⃣ explicit “my X is Y”
  const taught = parseTeach(userMsg);
  if (taught) {
    await db
      .insert(memories)
      .values({ userId, keyText: taught.key, value: taught.val })
      .onConflictDoUpdate({
        target: [memories.userId, memories.keyText],
        set:    { value: taught.val },
      });

    const reply = `Okay, I’ll remember that your ${taught.key} is ${taught.val}. 😊`;
    await db.insert(messagesTbl).values([
      { userId, chatId, role: "user",      content: userMsg },
      { userId, chatId, role: "assistant", content: reply   },
    ]);
    return new NextResponse(reply, {
      headers: { "Content-Type": "text/plain", "x-chat-id": chatId },
    });
  }

  // 6️⃣ recall from generic “my … ?” question
  const keyAskedByUser = keyFromQuestion(userMsg);
  if (keyAskedByUser) {
    const fact = facts.find(f => f.k === keyAskedByUser);
    if (fact) {
      const answer = `Your ${fact.k} is ${fact.v}! 😊`;
      await db.insert(messagesTbl).values([
        { userId, chatId, role: "user",      content: userMsg },
        { userId, chatId, role: "assistant", content: answer  },
      ]);
      return new NextResponse(answer, {
        headers: { "Content-Type": "text/plain", "x-chat-id": chatId },
      });
    }
  }

  // 7️⃣ normal LLM flow
  const memoryBlock =
    facts.length === 0
      ? "USER FACTS: (none yet)"
      : "USER FACTS:\n" +
        facts.map(f => `• ${f.k}: ${f.v}`).join("\n\n");

  const systemPrompt = `
You are Dark Alpha Capital’s helpful assistant.
${memoryBlock}

When a user asks about “my X…”, check facts first.
If a fact exists, answer from it directly.
Otherwise continue normally.
  `.trim();

  const convo = [...history, ...incoming];

  const llmStream = await streamText({
    model: chatModel,
    messages: [{ role: "system", content: systemPrompt }, ...convo],
  });

  // async log of assistant reply
  llmStream.text.then(reply =>
    db.insert(messagesTbl).values({
      userId,
      chatId,
      role: "assistant",
      content: reply,
    }),
  );

  const res = llmStream.toDataStreamResponse();
  res.headers.set("x-chat-id", chatId);
  return res;
}
