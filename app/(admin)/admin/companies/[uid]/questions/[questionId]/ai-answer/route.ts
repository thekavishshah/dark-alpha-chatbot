import { NextRequest, NextResponse } from 'next/server';
import { db, companyQuestions } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { myProvider } from '@/lib/ai/providers';
import { generateText, type CoreMessage } from 'ai';

export async function POST(
  req: NextRequest,
  {
    params,
  }: { params: { companyId: string; questionId: string } },
) {
  const { modelId = 'chat-model', instructions = '' } = await req.json();

  /* 1️⃣  fetch question */
  const q = await db
    .select({
      title: companyQuestions.title,
    })
    .from(companyQuestions)
    .where(eq(companyQuestions.id, params.questionId))
    .limit(1)
    .then((r) => r[0]);

  if (!q) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  /* 2️⃣  build prompt */
  const messages: CoreMessage[] = [
    {
      role: 'system',
      content:
        'You are an expert knowledge-base assistant. Reply concisely and helpfully.',
    },
    { role: 'user', content: `Question: ${q.title}` },
  ];

  if (instructions.trim()) {
    messages.push({
      role: 'user',
      content: `Additional instructions: ${instructions}`,
    });
  }

  /* 3️⃣  call LLM */
  const { text: draft } = await generateText({
    model: myProvider.languageModel(modelId),
    messages,
    maxTokens: 300,
  });

  return NextResponse.json({ draft });
}
