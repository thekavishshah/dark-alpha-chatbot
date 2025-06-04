import { NextRequest, NextResponse } from 'next/server';
import { db, ticket } from '@/lib/db';   // db client + Ticket table
import { eq } from 'drizzle-orm';

import { generateText, type CoreMessage } from 'ai';
import { myProvider } from '@/lib/ai/providers';

/**
 * POST /api/tickets/[id]/ai-draft
 * body: { modelId?: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  /* 0️⃣  parse body */
  const { modelId = 'chat-model' } = await req.json().catch(() => ({}));

  /* 1️⃣  fetch ticket by UUID */
  const row = await db
    .select({
      id: ticket.id,
      title: ticket.title,               // ← column names from schema.ts
      description: ticket.description,   // ← column names from schema.ts
    })
    .from(ticket)
    .where(eq(ticket.id, params.id))     // id is uuid → no Number()
    .limit(1)
    .then((r) => r[0]);

  if (!row) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  /* 2️⃣  build prompt (typed) */
  const messages: CoreMessage[] = [
    {
      role: 'system',
      content:
        'You are a concise, friendly customer-support agent. Reply in Markdown. Never reveal internal data.',
    },
    {
      role: 'user',
      content: `Subject: ${row.title}\n\n${row.description ?? ''}`,
    },
  ];

  /* 3️⃣  generate draft */
  const { text: draft } = await generateText({
    model: myProvider.languageModel(modelId),
    messages,
    maxTokens: 400,
    temperature: 0.7,
  });

  return NextResponse.json({ draft });
}
