/* -------------------------------------------------------------------- */
/*  Upload a resource – July 2025                                        */
/*    • optional Gemini summary                                          */
/*    • optional OpenAI embeddings                                       */
/* -------------------------------------------------------------------- */
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath }            from 'next/cache';

/* DB + loaders */
import { db } from '@/lib/db/queries';
import { embeddings as embeddingsTable, resources } from '@/lib/db/schema';
import { PDFLoader }  from '@/lib/pdf-loader';
import { DocxLoader } from '@/lib/docx-loader';
import { ExcelLoader } from '@/lib/excel-loader';

/* Embedding helpers */
import {
  rowsToTextChunks,
  generateChunksFromText,
  generateEmbeddingsFromChunks,
} from '@/lib/ai/embedding';

/* AI */
import { gemini } from '@/lib/ai/providers';
import { generateText, type CoreMessage } from 'ai';

/* -------------------------------------------------------------------- */
const hasGeminiKey  = !!process.env.GEMINI_API_KEY;
const hasOpenaiKey  = !!process.env.OPENAI_API_KEY; // embeddings need this

/* -------------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  try {
    /* ---------- 1. Parse multipart ---------- */
    const fd          = await req.formData();
    const file        = fd.get('file')        as File | null;
    const name        = fd.get('name')        as string | null;
    const description = fd.get('description') as string | null;
    const companyId   = fd.get('companyId')   as string | null;

    if (!file || !name || !description || !companyId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const fileType = file.type;
    const buffer   = await file.arrayBuffer();

    /* ---------- 2. Extract & summarise ---------- */
    let content = '';
    let kind    = '';
    let chunks:  any[] = [];
    let embeddingInput: string[] = [];

    /* ••• PDF ••• */
    if (fileType === 'application/pdf') {
      const raw = await new PDFLoader().loadFromBuffer(buffer);
      const summary = await summariseWithGemini(raw);
      content = composeContent(name, description, raw, summary);
      kind    = 'pdf';
    }

    /* ••• Excel ••• */
    else if (
      fileType === 'application/vnd.ms-excel' ||
      fileType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      const sheets = await new ExcelLoader().loadExcelFromBuffer(buffer);
      chunks = rowsToTextChunks(sheets);
      embeddingInput = chunks.map((c: { text: string }) => c.text);
      content = composeContent(
        name,
        description,
        embeddingInput.slice(0, 5).join('\n'),
        'Spreadsheet summarisation handled via chunking.',
      );
      kind = 'excel';
    }

    /* ••• DOCX ••• */
    else if (
      fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const raw = await new DocxLoader().loadFromBuffer(buffer);
      const summary = await summariseWithGemini(raw);
      content = composeContent(name, description, raw, summary);
      kind    = 'docx';
    }

    /* ••• TXT ••• */
    else if (fileType === 'text/plain') {
      const raw = await file.text();
      const summary = await summariseWithGemini(raw);
      content = composeContent(name, description, raw, summary);
      kind    = 'txt';
    }

    /* ••• Image (placeholder) ••• */
    else if (fileType.startsWith('image/')) {
      content = composeContent(
        name,
        description,
        '[binary image omitted]',
        '⚠️ Vision summarisation not enabled.',
      );
      kind = 'image';
    }

    /* ••• Unsupported ••• */
    else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    /* ---------- 3. Chunks & embeddings ---------- */
    if (!embeddingInput.length) {
      const generated = await generateChunksFromText(content);
      chunks = generated.chunks;
      embeddingInput = chunks.map((c: any) => c.pageContent);
    }

    let embeddings: { embedding: number[]; content: string }[] = [];
    if (hasOpenaiKey) {
      embeddings = await generateEmbeddingsFromChunks(embeddingInput);
    }

    /* ---------- 4. DB ---------- */
    const [resource] = await db
      .insert(resources)
      .values({ content, name, description, companyId, kind: kind as any })
      .returning();

    if (embeddings.length) {
      await db.insert(embeddingsTable).values(
        embeddings.map((e) => ({ resourceId: resource.id, ...e })),
      );
    }

    /* ---------- 5. Done ---------- */
    revalidatePath(`/admin/companies/${companyId}`);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Error processing file:', err);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}

/* -------------------------------------------------------------------- */
/*  helper fns                                                          */
/* -------------------------------------------------------------------- */
function composeContent(
  name: string,
  description: string,
  original: string,
  summary: string,
) {
  return `Name: ${name}
Description: ${description}

Original Content:
${original}

AI Summary:
${summary}`;
}

async function summariseWithGemini(raw: string): Promise<string> {
  if (!hasGeminiKey) {
    return '⚠️ Gemini API key missing – summary not generated.';
  }

  const messages: CoreMessage[] = [
    { role: 'system', content: 'You are a concise, helpful summariser.' },
    { role: 'user',   content: raw.slice(0, 30_000) },
  ];

  try {
    const { text } = await generateText({
      model: gemini(),               // gemini-1.5-pro-latest
      messages,
      maxTokens: 512,
      temperature: 0.25,
    });
    return text.trim();
  } catch (err) {
    console.warn('Gemini summary failed:', err);
    return '⚠️ Summary unavailable (Gemini error).';
  }
}
